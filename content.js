function hideAllImagesImmediately() {
  document.querySelectorAll('img, picture, video, iframe').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });

  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage !== 'none') {
      el.style.setProperty('background-image', 'none', 'important');
    }
  });
}

hideAllImagesImmediately();

let styleElement = null;

function injectCSS() {
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
}

function removeCSS() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

function hideImagesImmediately() {
  if (!isEnabled) return;
  
  document.querySelectorAll('img, picture, video, iframe').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });

  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage !== 'none') {
      el.style.setProperty('background-image', 'none', 'important');
    }
  });
}

const observer = new MutationObserver(() => {
  if (!isEnabled) return;
  
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

let isEnabled = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === 'enable') {
    isEnabled = true;
    injectCSS();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    hideImagesImmediately();
  } else if (request.action === 'disable') {
    isEnabled = false;
    removeCSS();
    observer.disconnect();
    document.querySelectorAll('img, picture, video, iframe').forEach(el => {
      el.style.removeProperty('display');
      if (el.dataset.originalDisplay) {
        el.style.display = el.dataset.originalDisplay;
      }
    });
    document.querySelectorAll('*').forEach(el => {
      el.style.removeProperty('background-image');
    });
  }
});

function initializeImageBlocker() {
  chrome.storage.sync.get(['imageBlockerEnabled'], (result) => {
    if (result.imageBlockerEnabled === false) {
      isEnabled = false;
    } else {
      isEnabled = true;
      injectCSS();
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      hideImagesImmediately();
    }
  });
}

initializeImageBlocker();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isEnabled) {
      hideImagesImmediately();
    }
  });
} else {
  if (isEnabled) {
    hideImagesImmediately();
  }
}

requestAnimationFrame(() => {
  if (isEnabled) {
    hideImagesImmediately();
  }
});

