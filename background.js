chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "NEW_EMAILS" && request.emails.length > 0) {
    chrome.storage.local.get({ emails: [] }, (data) => {
      const existingEmails = data.emails;
      const newEmails = request.emails.filter(newEmail => 
        !existingEmails.some(existing => existing.email === newEmail.email)
      );

      if (newEmails.length > 0) {
        // Add all new emails to storage
        const updatedEmails = [...existingEmails, ...newEmails];
        chrome.storage.local.set({ emails: updatedEmails });

        // Create notification with count of new emails
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "New Emails Found",
          message: `Found ${newEmails.length} new email${newEmails.length === 1 ? '' : 's'}!\n${
            newEmails.map(e => e.email).join('\n')
          }`,
          priority: 2
        });
      }
    });
  }
});
