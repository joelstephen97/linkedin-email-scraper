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

  let jobDescription = null;
  for (const selector of possibleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      jobDescription = element;
      break;
    }
  }

  if (jobDescription) {
    console.log('Found job description element');
    const emails = extractEmails(jobDescription.innerText);
    if (emails.length > 0) {
      console.log('Found emails:', emails);
      emails.forEach(email => {
        chrome.runtime.sendMessage({ type: "NEW_EMAIL", email });
      });
    } else {
      console.log('No emails found in job description');
    }
  } else {
    console.log('Job description element not found');
  }
}

// Initial attempt
setTimeout(scrapeEmails, 1000);

// Keep checking periodically in case the content loads dynamically
const observer = new MutationObserver((mutations) => {
  scrapeEmails();
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Cleanup after 30 seconds to prevent unnecessary observing
setTimeout(() => observer.disconnect(), 30000);
