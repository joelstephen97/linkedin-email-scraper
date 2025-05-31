chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "NEW_EMAIL") {
    chrome.storage.local.get({ emails: [] }, (data) => {
      const emails = data.emails;      if (!emails.find(e => e.email === request.email)) {
        emails.push({
          email: request.email,
          domain: request.domain,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({ emails });        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "New Email Found",
          message: `Email: ${request.email}\nFrom: ${request.domain}`,
          priority: 2
        });
      }
    });
  }
});
