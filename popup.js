document.addEventListener('DOMContentLoaded', () => {
  const emailList = document.getElementById('emailList');
  const container = document.createElement('div');
  container.className = 'container';
  emailList.parentElement.insertBefore(container, emailList);
  container.appendChild(emailList);

  chrome.storage.local.get({ emails: [] }, (data) => {
    // email count
    const emailCount = document.createElement('div');
    emailCount.className = 'email-count';
    emailCount.textContent = `${data.emails.length} email${data.emails.length !== 1 ? 's' : ''} found`;
    container.insertBefore(emailCount, emailList);

    // Add emails to list
    data.emails.forEach(email => {
      const li = document.createElement('li');
      li.textContent = email;
      emailList.appendChild(li);
    });

    // action buttons
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const copyAllButton = document.createElement('button');
    copyAllButton.textContent = 'Copy All Emails';
    copyAllButton.disabled = data.emails.length === 0;
    if(copyAllButton.disabled){
      copyAllButton.title = 'No emails found to copy';
    } else {
      copyAllButton.title = `Copy ${data.emails.length} scraped emails to clipboard`;
    }
    copyAllButton.addEventListener('click', () => {
      const allEmails = data.emails.join('\n');
      navigator.clipboard.writeText(allEmails);
      copyAllButton.textContent = 'Copied!';
      setTimeout(() => {
        copyAllButton.textContent = 'Copy All Emails';
      }, 2000);
    });

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear List';
    clearButton.style.backgroundColor = '#dc3545';
    clearButton.title = 'Warning: This will permanently delete all scraped emails';
    clearButton.disabled = data.emails.length === 0;
    clearButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all scraped emails? This action cannot be undone.')) {
        chrome.storage.local.set({ emails: [] }, () => {
          emailList.innerHTML = '';
          emailCount.textContent = '0 emails found';
          copyAllButton.disabled = true;
          clearButton.disabled = true;
        });
      }
    });

    actions.appendChild(copyAllButton);
    actions.appendChild(clearButton);
    container.appendChild(actions);
  });
});
