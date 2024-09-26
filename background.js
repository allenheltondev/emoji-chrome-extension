chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeExtension);

function initializeExtension() {
  chrome.storage.sync.get('sessionName', function (data) {
    if (data.sessionName) {
      sendSessionNameToContentScripts(data.sessionName);
    } else {
      chrome.action.openPopup();
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "togglePolling") {
    const sessionName = message.sessionName;
    const isPolling = message.isPolling;

    chrome.storage.sync.set({ sessionName: sessionName, isPolling: isPolling }, function () {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id, {
            action: "updatePollingState",
            sessionName: sessionName,
            isPolling: isPolling
          }, function (response) {
            if (chrome.runtime.lastError) {
              // Swallow errors
            }
          });
        });
      });
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for sendResponse
  }
});

function sendSessionNameToContentScripts(sessionName) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "sessionNameUpdated", sessionName: sessionName }, function (response) {
        if (chrome.runtime.lastError) {
          // Ignore errors from tabs without the content script
        }
      });
    });
  });
}
