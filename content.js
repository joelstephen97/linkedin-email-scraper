// Track found emails to prevent duplicates
const foundEmails = new Set();

// Initialize foundEmails with existing emails from storage
chrome.storage.local.get({ emails: [] }, (data) => {
  data.emails.forEach(item => foundEmails.add(item.email));
});

function extractEmails(text) {
  // First, normalize spaces and line breaks
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  // More comprehensive email regex that handles multiple emails
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w{2,}/g;
  
  // Use matchAll to get all matches and convert to array
  const matches = Array.from(normalizedText.matchAll(emailRegex), m => m[0]);
  return matches;
}

function scrapeEmails() {
  // Get all text nodes in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const allEmails = new Set();
  
  // Process text nodes
  let node;
  while (node = walker.nextNode()) {
    const emails = extractEmails(node.nodeValue);
    emails.forEach(email => allEmails.add(email));
  }

  // Process mailto links separately
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const email = href.replace('mailto:', '').split('?')[0];
      if (email) allEmails.add(email);
    }
  });

  // Process all visible elements that might contain emails
  ['p', 'div', 'span', 'td', 'li', 'pre', 'code'].forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      const emails = extractEmails(el.textContent);
      emails.forEach(email => allEmails.add(email));
    });
  });
  
  // Filter out already found emails
  const newEmails = Array.from(allEmails).filter(email => {
    // Additional validation
    const isValid = email.includes('@') && email.includes('.');
    const isNew = !foundEmails.has(email);
    return isValid && isNew;
  });
    // Process all new emails in batch
  if (newEmails.length > 0) {
    
    // Add all emails to foundEmails set
    newEmails.forEach(email => foundEmails.add(email));
    
    // Send all emails in one message
    chrome.runtime.sendMessage({ 
      type: "NEW_EMAILS", 
      emails: newEmails.map(email => ({
        email,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
      }))
    });
  }
}

// Run initial scan
scrapeEmails();

// Set up periodic scanning with debounce
let debounceTimer;
const debouncedScrape = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scrapeEmails, 3000);
};

// Observe DOM changes
const observer = new MutationObserver(debouncedScrape);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: false
});

// Clean up after 3 seconds
setTimeout(() => observer.disconnect(), 3000);
