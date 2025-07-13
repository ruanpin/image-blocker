// // Image Blocker Pro - 智能圖片阻擋器
// class ImageBlocker {
//   constructor() {
//     this.isEnabled = true;
//     this.observer = null;
//     this.processedElements = new WeakSet();
//     this.init();
//   }

//   async init() {
//     // 從storage讀取設置
//     const result = await chrome.storage.sync.get(['imageBlockerEnabled']);
//     this.isEnabled = result.imageBlockerEnabled !== false; // 默認啟用
    
//     if (this.isEnabled) {
//       this.startBlocking();
//     }
    
//     // 監聽設置變化
//     chrome.storage.onChanged.addListener((changes) => {
//       if (changes.imageBlockerEnabled) {
//         this.isEnabled = changes.imageBlockerEnabled.newValue;
//         if (this.isEnabled) {
//           this.startBlocking();
//         } else {
//           this.stopBlocking();
//         }
//       }
//     });
//   }

//   startBlocking() {
//     // 立即處理現有元素
//     this.blockImages();
    
//     // 設置觀察器監聽動態變化
//     this.setupObserver();
//   }

//   stopBlocking() {
//     if (this.observer) {
//       this.observer.disconnect();
//       this.observer = null;
//     }
    
//     // 恢復顯示的圖片
//     this.restoreImages();
//   }

//   blockImages() {
//     // 處理圖片元素
//     const imageSelectors = 'img, picture, video, iframe, svg, canvas';
//     const elements = document.querySelectorAll(imageSelectors);
    
//     elements.forEach(element => {
//       if (!this.processedElements.has(element)) {
//         this.hideElement(element);
//         this.processedElements.add(element);
//       }
//     });

//     // 處理背景圖片
//     this.blockBackgroundImages();
//   }

//   hideElement(element) {
//     // 保存原始樣式以便恢復
//     if (!element.dataset.originalDisplay) {
//       element.dataset.originalDisplay = element.style.display;
//     }
    
//     element.style.setProperty('display', 'none', 'important');
//     element.classList.add('image-blocker-hidden');
//   }

//   restoreImages() {
//     const hiddenElements = document.querySelectorAll('.image-blocker-hidden');
//     hiddenElements.forEach(element => {
//       element.style.display = element.dataset.originalDisplay || '';
//       element.classList.remove('image-blocker-hidden');
//     });
//   }

//   blockBackgroundImages() {
//     // 使用更高效的方式檢測背景圖片
//     const styleSheets = Array.from(document.styleSheets);
//     styleSheets.forEach(sheet => {
//       try {
//         const rules = Array.from(sheet.cssRules || sheet.rules);
//         rules.forEach(rule => {
//           if (rule.style && rule.style.backgroundImage && rule.style.backgroundImage !== 'none') {
//             rule.style.setProperty('background-image', 'none', 'important');
//           }
//         });
//       } catch (e) {
//         // 跨域樣式表無法訪問
//       }
//     });
//   }

//   setupObserver() {
//     if (this.observer) {
//       this.observer.disconnect();
//     }

//     this.observer = new MutationObserver((mutations) => {
//       let shouldProcess = false;
      
//       // 檢查是否有新的圖片元素
//       mutations.forEach(mutation => {
//         mutation.addedNodes.forEach(node => {
//           if (node.nodeType === Node.ELEMENT_NODE) {
//             if (node.matches && node.matches('img, picture, video, iframe, svg, canvas')) {
//               shouldProcess = true;
//             }
//             if (node.querySelectorAll) {
//               const images = node.querySelectorAll('img, picture, video, iframe, svg, canvas');
//               if (images.length > 0) {
//               shouldProcess = true;
//               }
//             }
//           }
//         });
//       });

//       if (shouldProcess) {
//         // 使用防抖來避免過於頻繁的處理
//         clearTimeout(this.debounceTimer);
//         this.debounceTimer = setTimeout(() => {
//           this.blockImages();
//         }, 100);
//       }
//     });

//     this.observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//       attributes: true,
//       attributeFilter: ['style', 'class']
//     });
//   }
// }

// // 當DOM加載完成後初始化
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => {
//     new ImageBlocker();
//   });
// } else {
//   new ImageBlocker();
// }

// 動態CSS注入功能
let styleElement = null;

function injectCSS() {
  console.log('Image Blocker: 注入CSS');
  if (styleElement) {
    styleElement.remove();
  }
  
  styleElement = document.createElement('style');
  styleElement.id = 'image-blocker-styles';
  styleElement.textContent = `
    img, picture, video, iframe {
      display: none !important;
    }
    *[style*="background"], *[style*="background-image"] {
      background: none !important;
    }
  `;
  document.head.appendChild(styleElement);
  console.log('Image Blocker: CSS已注入');
}

function removeCSS() {
  console.log('Image Blocker: 移除CSS');
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

// 確保動態新增的圖片也會被移除
const observer = new MutationObserver(() => {
  if (!isEnabled) return; // 如果已禁用，不執行阻擋邏輯
  
  document.querySelectorAll('img, picture, video, iframe').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });

  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage !== 'none') {
      el.style.setProperty('background-image', 'none', 'important');
    }
  });
});

// 添加消息監聽器來支持開關功能
let isEnabled = true; // 默認啟用

// 監聽來自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Image Blocker: 收到消息', request.action);
  
  if (request.action === 'enable') {
    console.log('Image Blocker: 啟用功能');
    isEnabled = true;
    // 注入CSS
    injectCSS();
    // 重新啟用觀察器
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    // 立即隱藏所有圖片
    document.querySelectorAll('img, picture, video, iframe').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundImage !== 'none') {
        el.style.setProperty('background-image', 'none', 'important');
      }
    });
  } else if (request.action === 'disable') {
    console.log('Image Blocker: 禁用功能');
    isEnabled = false;
    // 移除CSS
    removeCSS();
    // 停止觀察器
    observer.disconnect();
    // 恢復顯示所有圖片 - 使用更強的方式
    document.querySelectorAll('img, picture, video, iframe').forEach(el => {
      el.style.removeProperty('display');
      // 如果元素原本有display樣式，恢復它
      if (el.dataset.originalDisplay) {
        el.style.display = el.dataset.originalDisplay;
      }
    });
    // 恢復背景圖片
    document.querySelectorAll('*').forEach(el => {
      el.style.removeProperty('background-image');
    });
  }
});

// 初始化函數
function initializeImageBlocker() {
  console.log('Image Blocker: 開始初始化');
  chrome.storage.sync.get(['imageBlockerEnabled'], (result) => {
    console.log('Image Blocker: 讀取設置', result);
    if (result.imageBlockerEnabled === false) {
      console.log('Image Blocker: 設置為禁用');
      isEnabled = false;
      // 不啟動觀察器，不注入CSS
    } else {
      console.log('Image Blocker: 設置為啟用');
      // 默認啟用時注入CSS並啟動觀察器
      isEnabled = true;
      injectCSS();
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

// 確保在DOM準備好時才初始化
if (document.readyState === 'loading') {
  console.log('Image Blocker: DOM正在加載，等待DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initializeImageBlocker);
} else {
  console.log('Image Blocker: DOM已準備好，立即初始化');
  initializeImageBlocker();
}

