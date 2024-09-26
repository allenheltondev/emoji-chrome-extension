chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeExtension);

function initializeExtension() {
  chrome.storage.sync.get(['sessionName', 'isPolling'], function (data) {
    if (data.sessionName) {
      updateTabs(data.sessionName, data.isPolling);
    } else {
      chrome.action.openPopup();
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "togglePolling") {
    const sessionName = message.sessionName;
    const isPolling = message.isPolling;

    chrome.storage.sync.set({ sessionName, isPolling }, function () {
      updateTabs(sessionName, isPolling);
      sendResponse({ success: true });
    });
    return true;
  }
});

function updateTabs(sessionName, isPolling) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: "updatePollingState",
        sessionName: sessionName,
        isPolling: isPolling
      }, function (response) { });
    });
  });
}
