const basePollingUrl = "https://momento.helton.farm";
let pollingUrl = basePollingUrl;
const emojiMap = {
  'heart': '❤️',
  '100': '💯',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'fire': '🔥',
  'mindblown': '🤯'
};

let isPolling = false;
let pollingController = null;
let sessionName = '';
let statusDiv = null;

initializeExtension();

function initializeExtension() {
  chrome.storage.sync.get(['sessionName', 'isPolling'], function (data) {
    if (data.sessionName) {
      sessionName = data.sessionName;
      updatePollingUrl();
      isPolling = data.isPolling || false;
      if (isPolling) {
        startLongPolling();
        showStatusDiv();
      }
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updatePollingState") {
    updateSessionName(message.sessionName);
    isPolling = message.isPolling;
    if (isPolling) {
      startLongPolling();
      showStatusDiv();
    } else {
      stopLongPolling();
      hideStatusDiv();
    }
    sendResponse({ success: true });
  }
});

function updateSessionName(newSessionName) {
  sessionName = newSessionName;
  updatePollingUrl();
  startLongPolling();
}

function updatePollingUrl() {
  pollingUrl = `${basePollingUrl}/${encodeURIComponent(sessionName)}`;
}

function startLongPolling() {
  if (sessionName && !pollingController) {
    pollingController = new AbortController();
    longPoll(pollingController.signal);
    showStatusDiv();
  }
}

function stopLongPolling() {
  if (pollingController) {
    pollingController.abort();
    pollingController = null;
  }
  hideStatusDiv();
}

function triggerEmojiAnimation(emojiText) {
  const emoji = document.createElement('div');
  const matchingEmoji = emojiMap[emojiText.toLowerCase().trim()];
  if (!matchingEmoji) return;

  emoji.textContent = matchingEmoji;
  emoji.className = 'animated-emoji';
  emoji.style.left = `${Math.random() * (window.innerWidth - 30)}px`;

  const rotationAmount = Math.floor(Math.random() * 720) - 360;
  emoji.style.setProperty('--rotation', `${rotationAmount}deg`);

  document.body.appendChild(emoji);

  setTimeout(() => {
    emoji.remove();
  }, 3500);
}

async function longPoll(signal) {
  try {
    const timeoutId = setTimeout(() => pollingController.abort(), 300000); // 5-minute timeout
    const response = await fetch(pollingUrl, { signal });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        data.items.forEach(item => {
          if (item.item && item.item.value && item.item.value.text) {
            triggerEmojiAnimation(item.item.value.text);
          }
        });
      }
    } else {
      console.warn('Response not OK:', response.status);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Long polling error:', error);
    }
  } finally {
    if (isPolling && !signal.aborted) {
      setTimeout(() => longPoll(signal), 0);
    }
  }
}

function showStatusDiv() {
  if (statusDiv) {
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `Reactions enabled<br><a href="https://helton.farm/${sessionName}" target="_blank">https://helton.farm/${sessionName}</a>`;
    return;
  }

  statusDiv = document.createElement('div');
  statusDiv.id = 'status';
  statusDiv.className = 'status';
  statusDiv.innerHTML = `Reactions enabled<br><a href="https://helton.farm/${sessionName}" target="_blank" style="color: #4CAF50; text-decoration: none;">https://helton.farm/${sessionName}</a>`;

  statusDiv.addEventListener('click', function () {
    const url = `https://bis.dev/${sessionName}`;
    navigator.clipboard.writeText(url).then(function () {
      alert('URL copied to clipboard!');
    }, function (err) {
      console.error('Could not copy text: ', err);
    });
  });

  document.body.appendChild(statusDiv);
}

function hideStatusDiv() {
  if (statusDiv) {
    statusDiv.style.display = 'none';
  }
}
