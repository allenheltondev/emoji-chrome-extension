document.addEventListener('DOMContentLoaded', function () {
  const sessionForm = document.getElementById('sessionForm');
  const sessionNameInput = document.getElementById('sessionName');
  const toggleButton = document.getElementById('toggleButton');
  const errorMessage = document.getElementById('error');

  let isPolling = false;

  chrome.storage.sync.get(['sessionName', 'isPolling'], function (data) {
    if (data.sessionName) {
      sessionNameInput.value = data.sessionName;
    }
    if (data.isPolling) {
      isPolling = data.isPolling;
      updateControls();
    }
  });

  function updateControls() {
    toggleButton.textContent = isPolling ? 'Stop' : 'Start';
    sessionNameInput.disabled = isPolling;
  }

  sessionForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const sessionName = sessionNameInput.value.trim();
    if (sessionName && /^[a-zA-Z0-9]{1,15}$/.test(sessionName)) {

      chrome.storage.sync.set({ sessionName: sessionName }, function () {
        isPolling = !isPolling;
        chrome.storage.sync.set({ isPolling: isPolling }, function () {
          updateControls();

          chrome.runtime.sendMessage({ action: "togglePolling", sessionName: sessionName, isPolling: isPolling }, function (response) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else if (response && response.success) {
              console.log('Session polling state updated successfully');
            } else {
              console.error('Failed to update session polling state.');
            }
          });
        });
      });
    } else {
      errorMessage.style.display = 'block';
    }
  });
});
