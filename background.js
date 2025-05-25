chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "NEW_EMAIL") {
    chrome.storage.local.get({ emails: [] }, (data) => {
      const emails = data.emails;
      if (!emails.includes(request.email)) {
        emails.push(request.email);
        chrome.storage.local.set({ emails });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "New Email Found",
          message: `Email: ${request.email} has been added to your list.`,
          priority: 2
        });
      }
    });
  }
});
