// Track found emails to prevent duplicates
const foundEmails = new Set();

// Initialize foundEmails with existing emails from storage
chrome.storage.local.get({ emails: [] }, (data) => {
  data.emails.forEach(email => foundEmails.add(email));
});

function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  return text.match(emailRegex) || [];
}

function scrapeEmails() {
  // Try multiple possible selectors for job descriptions
  const possibleSelectors = [
    '.description__text',
    '.job-details',
    '.jobs-description',
    '.jobs-description-content',
    '[data-job-description]'
  ];

  // Find the first matching job description element
  const jobDescription = possibleSelectors
    .map(selector => document.querySelector(selector))
    .find(element => element !== null);

  if (jobDescription) {
    const emails = extractEmails(jobDescription.innerText);
    const newEmails = emails.filter(email => !foundEmails.has(email));
    
    newEmails.forEach(email => {
      foundEmails.add(email);
      chrome.runtime.sendMessage({ type: "NEW_EMAIL", email });
    });
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
