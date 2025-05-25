document.addEventListener('DOMContentLoaded', () => {
  const emailList = document.getElementById('emailList');

  chrome.storage.local.get({ emails: [] }, (data) => {
    data.emails.forEach(email => {
      const li = document.createElement('li');
      li.textContent = email;

      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(email);
      });

      li.appendChild(copyButton);
      emailList.appendChild(li);
    });
  });
});
