document.addEventListener('DOMContentLoaded', () => {
  const emailList = document.getElementById('emailList');
  const container = document.createElement('div');
  container.className = 'container';
  emailList.parentElement.insertBefore(container, emailList);

  // Add sort controls
  const sortControls = document.createElement('div');
  sortControls.className = 'sort-controls';
  
  const sortSelect = document.createElement('select');
  sortSelect.innerHTML = `
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="domain">Sort by Domain</option>
  `;
  
  sortControls.appendChild(sortSelect);
  
  // Create email count element
  const emailCount = document.createElement('div');
  emailCount.className = 'email-count';
  
  // Create action buttons
  const actions = document.createElement('div');
  actions.className = 'actions';
  
  const copyAllButton = document.createElement('button');
  copyAllButton.textContent = 'Copy All Emails';
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear List';
  clearButton.style.backgroundColor = '#dc3545';
  
  // Setup button event listeners
  copyAllButton.addEventListener('click', () => {
    chrome.storage.local.get({ emails: [] }, (data) => {
      const allEmails = data.emails.map(item => item.email).join('\n');
      navigator.clipboard.writeText(allEmails);
      copyAllButton.textContent = 'Copied!';
      setTimeout(() => {
        copyAllButton.textContent = 'Copy All Emails';
      }, 2000);
    });
  });

  clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all emails? This action cannot be undone.')) {
      chrome.storage.local.set({ emails: [] }, () => {
        renderEmailList([], sortSelect.value);
      });
    }
  });
  
  actions.appendChild(copyAllButton);
  actions.appendChild(clearButton);
  
  // Append all static elements to container in correct order
  container.appendChild(sortControls);
  container.appendChild(emailCount);
  container.appendChild(emailList);
  container.appendChild(actions);

  function renderEmailList(emails, sortType) {
    emailList.innerHTML = '';
    let sortedEmails = [...emails];
    
    switch(sortType) {
      case 'newest':
        sortedEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'oldest':
        sortedEmails.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'domain':
        sortedEmails.sort((a, b) => a.domain.localeCompare(b.domain));
        break;
    }

    // Update email count
    emailCount.textContent = `${sortedEmails.length} email${sortedEmails.length !== 1 ? 's' : ''} found`;

    // Add emails to list
    sortedEmails.forEach((item, index) => {
      const li = document.createElement('li');
      
      const emailSpan = document.createElement('span');
      emailSpan.textContent = item.email;
      li.appendChild(emailSpan);
      
      const domainSpan = document.createElement('span');
      domainSpan.className = 'domain';
      domainSpan.textContent = item.domain;
      li.appendChild(domainSpan);
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-btn';
      deleteButton.innerHTML = '&times;';
      deleteButton.title = 'Remove this email';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        const updatedEmails = [...emails]; // Use original emails array
        updatedEmails.splice(index, 1);
        chrome.storage.local.set({ emails: updatedEmails }, () => {
          renderEmailList(updatedEmails, sortSelect.value);
        });
      };
      li.appendChild(deleteButton);
      
      emailList.appendChild(li);
    });

    // Update button states
    copyAllButton.disabled = sortedEmails.length === 0;
    if(copyAllButton.disabled) {
      copyAllButton.title = 'No emails found to copy';
    } else {
      copyAllButton.title = `Copy ${sortedEmails.length} found emails to clipboard`;
    }
    
    clearButton.disabled = sortedEmails.length === 0;
    clearButton.title = 'Warning: This will permanently delete all found emails';
  }

  // Load initial data
  chrome.storage.local.get({ emails: [] }, (data) => {
    renderEmailList(data.emails, 'newest');
  });

  // Handle sort changes
  sortSelect.addEventListener('change', () => {
    chrome.storage.local.get({ emails: [] }, (data) => {
      renderEmailList(data.emails, sortSelect.value);
    });
  });
});
