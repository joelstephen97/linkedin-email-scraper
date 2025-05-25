function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  return text.match(emailRegex) || [];
}

function scrapeEmails() {
  const jobDescription = document.querySelector('.description__text');
  if (jobDescription) {
    const emails = extractEmails(jobDescription.innerText);
    emails.forEach(email => {
      chrome.runtime.sendMessage({ type: "NEW_EMAIL", email });
    });
  }
}

// Wait for the job description to load
window.addEventListener('load', () => {
  setTimeout(scrapeEmails, 3000); // Adjust timeout as needed
});
