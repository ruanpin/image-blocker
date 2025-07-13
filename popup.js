document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const status = document.getElementById('status');

  initializeToggle();

  toggleSwitch.addEventListener('click', function() {
    toggleImageBlocker();
  });

  async function initializeToggle() {
    try {
      const result = await chrome.storage.sync.get(['imageBlockerEnabled']);
      const isEnabled = result.imageBlockerEnabled !== false;
      
      updateToggleUI(isEnabled);
      updateStatus(isEnabled);
    } catch (error) {
      console.error('初始化失敗:', error);
      status.textContent = '初始化失敗';
    }
  }

  async function toggleImageBlocker() {
    try {
      const result = await chrome.storage.sync.get(['imageBlockerEnabled']);
      const currentState = result.imageBlockerEnabled !== false;
      const newState = !currentState;

      await chrome.storage.sync.set({ imageBlockerEnabled: newState });

      updateToggleUI(newState);
      updateStatus(newState);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: newState ? 'enable' : 'disable'
        });
      }
    } catch (error) {
      console.error('切換失敗:', error);
      status.textContent = '切換失敗';
    }
  }

  function updateToggleUI(isEnabled) {
    if (isEnabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
  }

  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = '✅ 圖片阻擋已啟用';
      status.style.color = '#4CAF50';
    } else {
      status.textContent = '❌ 圖片阻擋已停用';
      status.style.color = '#f44336';
    }
  }
}); 