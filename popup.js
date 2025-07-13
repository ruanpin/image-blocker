// 簡化的 Popup 腳本 - 只處理開關功能
document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const status = document.getElementById('status');

  // 初始化開關狀態
  initializeToggle();

  // 監聽開關點擊
  toggleSwitch.addEventListener('click', function() {
    toggleImageBlocker();
  });

  // 初始化開關狀態
  async function initializeToggle() {
    try {
      const result = await chrome.storage.sync.get(['imageBlockerEnabled']);
      const isEnabled = result.imageBlockerEnabled !== false; // 默認啟用
      
      updateToggleUI(isEnabled);
      updateStatus(isEnabled);
    } catch (error) {
      console.error('初始化失敗:', error);
      status.textContent = '初始化失敗';
    }
  }

  // 切換圖片阻擋器
  async function toggleImageBlocker() {
    try {
      const result = await chrome.storage.sync.get(['imageBlockerEnabled']);
      const currentState = result.imageBlockerEnabled !== false;
      const newState = !currentState;

      // 保存設置
      await chrome.storage.sync.set({ imageBlockerEnabled: newState });

      // 更新UI
      updateToggleUI(newState);
      updateStatus(newState);

      // 通知當前標籤頁
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

  // 更新開關UI
  function updateToggleUI(isEnabled) {
    if (isEnabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
  }

  // 更新狀態文字
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