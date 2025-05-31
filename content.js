// Track found emails to prevent duplicates
const foundEmails = new Set();

// Initialize foundEmails with existing emails from storage
chrome.storage.local.get({ emails: [] }, (data) => {
  data.emails.forEach(item => foundEmails.add(item.email));
});

function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  return text.match(emailRegex) || [];
}

function scrapeEmails() {
  // Get all text content from the page, including hidden elements
  const pageText = document.body.innerText + Array.from(document.getElementsByTagName('*'))
    .map(el => el.getAttribute('href') || '')
    .join(' ');
    
  if (pageText) {
    const emails = extractEmails(pageText);
    const newEmails = emails.filter(email => !foundEmails.has(email));
    
    // Process all new emails in batch
    newEmails.forEach(email => {
      foundEmails.add(email);
      chrome.runtime.sendMessage({ 
        type: "NEW_EMAIL", 
        email,
        domain: window.location.hostname
      });
    });

    // Log found emails for debugging
    if (newEmails.length > 0) {
      console.log(`Found ${newEmails.length} new email(s):`, newEmails);
    }
  }
}

// Initial attempt
setTimeout(scrapeEmails, 1000);

// Keep checking periodically in case the content loads dynamically
const observer = new MutationObserver(() => {
  scrapeEmails();
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Cleanup after 30 seconds to prevent unnecessary observing
setTimeout(() => observer.disconnect(), 30000);
