const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-app-info', async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    electronVersion: process.versions.electron
  };
});

ipcMain.handle('test-message', async (event, message) => {
  return { received: true, message, timestamp: Date.now() };
});

ipcMain.handle('get-window-info', async () => {
  if (!mainWindow) {
    return { available: false };
  }
  const bounds = mainWindow.getBounds();
  return {
    available: true,
    title: mainWindow.getTitle(),
    bounds: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    },
    isMinimized: mainWindow.isMinimized(),
    isMaximized: mainWindow.isMaximized(),
    isFullScreen: mainWindow.isFullScreen(),
    isResizable: mainWindow.isResizable(),
    isMovable: mainWindow.isMovable()
  };
});

ipcMain.handle('focus-window', async () => {
  if (mainWindow) {
    mainWindow.focus();
    return { success: true };
  }
  return { success: false, error: 'No window available' };
});

ipcMain.handle('minimize-window', async () => {
  if (mainWindow) {
    mainWindow.minimize();
    return { success: true };
  }
  return { success: false, error: 'No window available' };
});

ipcMain.handle('maximize-window', async () => {
  if (mainWindow) {
    mainWindow.maximize();
    return { success: true };
  }
  return { success: false, error: 'No window available' };
});

ipcMain.handle('restore-window', async () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    return { success: true };
  }
  return { success: false, error: 'No window available' };
});

ipcMain.handle('navigate', async (event, url) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    await mainWindow.loadURL(url);
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-page-info', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const info = await mainWindow.webContents.executeJavaScript(`
      ({
        url: window.location.href,
        title: document.title
      })
    `);
    return { success: true, ...info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-script', async (event, script) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        try {
          return { success: true, result: ${script} };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('take-screenshot', async (event, screenshotPath) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const image = await mainWindow.webContents.capturePage();
    const buffer = image.toPNG();
    
    if (screenshotPath) {
      fs.writeFileSync(screenshotPath, buffer);
    }
    
    return { 
      success: true, 
      path: screenshotPath, 
      size: buffer.length 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-viewport-size', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const size = await mainWindow.webContents.executeJavaScript(`
      ({
        width: window.innerWidth,
        height: window.innerHeight
      })
    `);
    return { success: true, ...size };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-viewport-size', async (event, width, height) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    mainWindow.setSize(width, height);
    return { success: true, width, height };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-accessibility-tree', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const tree = await mainWindow.webContents.executeJavaScript(`
      (() => {
        function buildAccessibilityTree(element) {
          const result = {
            role: element.getAttribute('role') || 
              (element.tagName === 'BUTTON' ? 'button' :
              element.tagName === 'INPUT' ? 'textbox' :
              element.tagName === 'A' ? 'link' :
              element.tagName === 'SELECT' ? 'combobox' : 'generic'),
            name: element.getAttribute('aria-label') || 
              element.getAttribute('alt') || 
              element.textContent?.substring(0, 100) || '',
            children: []
          };
          
          for (let child of element.children) {
            result.children.push(buildAccessibilityTree(child));
          }
          
          return result;
        }
        
        return buildAccessibilityTree(document.body);
      })()
    `);
    return { success: true, accessibilityTree: tree };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('wait-for-selector', async (event, selector, timeout = 10000, state = 'visible') => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeoutMs = ${timeout};
          const desiredState = '${state}';
          
          function checkElement() {
            const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
            
            if (!element) {
              if (Date.now() - startTime > timeoutMs) {
                reject(new Error('Element not found'));
                return;
              }
              setTimeout(checkElement, 100);
              return;
            }
            
            const isVisible = element.offsetParent !== null;
            const isHidden = element.offsetParent === null;
            
            if (desiredState === 'visible' && isVisible) {
              resolve({ success: true, selector: '${selector.replace(/'/g, "\\'")}' });
            } else if (desiredState === 'hidden' && isHidden) {
              resolve({ success: true, selector: '${selector.replace(/'/g, "\\'")}' });
            } else if (desiredState === 'attached') {
              resolve({ success: true, selector: '${selector.replace(/'/g, "\\'")}' });
            } else {
              if (Date.now() - startTime > timeoutMs) {
                reject(new Error('Element state not reached'));
                return;
              }
              setTimeout(checkElement, 100);
            }
          }
          
          checkElement();
        });
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-text', async (event, selector, timeout = 10000) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeoutMs = ${timeout};
          
          function getElement() {
            const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
            
            if (element) {
              resolve({ 
                success: true, 
                selector: '${selector.replace(/'/g, "\\'")}', 
                text: element.textContent?.trim() || '' 
              });
            } else if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Element not found'));
            } else {
              setTimeout(getElement, 100);
            }
          }
          
          getElement();
        });
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fill', async (event, selector, value, timeout = 10000) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeoutMs = ${timeout};
          
          function fillElement() {
            const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
            
            if (element) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
              ).set;
              
              nativeInputValueSetter.call(element, '${value.replace(/'/g, "\\'")}');
              
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              
              resolve({ 
                success: true, 
                selector: '${selector.replace(/'/g, "\\'")}', 
                value: '${value.replace(/'/g, "\\'")}' 
              });
            } else if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Element not found'));
            } else {
              setTimeout(fillElement, 100);
            }
          }
          
          fillElement();
        });
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('click', async (event, selector, timeout = 10000) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeoutMs = ${timeout};
          
          function clickElement() {
            const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
            
            if (element) {
              element.click();
              resolve({ 
                success: true, 
                selector: '${selector.replace(/'/g, "\\'")}' 
              });
            } else if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Element not found'));
            } else {
              setTimeout(clickElement, 100);
            }
          }
          
          clickElement();
        });
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select', async (event, selector, value, timeout = 10000) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const timeoutMs = ${timeout};
          
          function selectElement() {
            const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
            
            if (element && element.tagName === 'SELECT') {
              element.value = '${value.replace(/'/g, "\\'")}';
              element.dispatchEvent(new Event('change', { bubbles: true }));
              resolve({ 
                success: true, 
                selector: '${selector.replace(/'/g, "\\'")}', 
                value: '${value.replace(/'/g, "\\'")}' 
              });
            } else if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Element not found or not a select element'));
            } else {
              setTimeout(selectElement, 100);
            }
          }
          
          selectElement();
        });
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-shadow-dom-info', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const info = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const shadowHost = document.querySelector('.shadow-container');
        if (!shadowHost) {
          return { hasShadow: false };
        }
        const shadowRoot = shadowHost.shadowRoot;
        if (!shadowRoot) {
          return { hasShadow: false };
        }
        const shadowInput = shadowRoot.querySelector('#shadowInput');
        const shadowButton = shadowRoot.querySelector('#shadowButton');
        return {
          hasShadow: true,
          mode: shadowRoot.mode,
          inputExists: !!shadowInput,
          buttonExists: !!shadowButton,
          inputValue: shadowInput ? shadowInput.value : null
        };
      })()
    `);
    return { success: true, ...info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-iframe-content', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const content = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const iframe = document.getElementById('testIframe');
        if (!iframe) {
          return { iframeExists: false };
        }
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const iframeButton = iframeDoc.getElementById('iframeButton');
          const iframeInput = iframeDoc.getElementById('iframeInput');
          return {
            iframeExists: true,
            buttonExists: !!iframeButton,
            inputExists: !!iframeInput,
            inputValue: iframeInput ? iframeInput.value : null,
            buttonText: iframeButton ? iframeButton.textContent : null
          };
        } catch (e) {
          return { iframeExists: true, accessError: e.message };
        }
      })()
    `);
    return { success: true, ...content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-modal-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const alertShown = !!document.querySelector('.alert-display');
        const confirmShown = !!document.querySelector('.confirm-display');
        const promptShown = !!document.querySelector('.prompt-display');
        return {
          alertShown,
          confirmShown,
          promptShown,
          alertText: alertShown ? document.querySelector('.alert-display').textContent : null,
          confirmResult: confirmShown ? document.querySelector('.confirm-display').textContent : null,
          promptValue: promptShown ? document.querySelector('.prompt-display').textContent : null
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-timing-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const delayedElement = document.getElementById('delayedElement');
        const asyncElement = document.getElementById('asyncElement');
        const counterElement = document.getElementById('counterElement');
        return {
          delayedExists: !!delayedElement,
          delayedVisible: delayedElement ? delayedElement.offsetParent !== null : false,
          asyncExists: !!asyncElement,
          asyncVisible: asyncElement ? asyncElement.offsetParent !== null : false,
          counterValue: counterElement ? counterElement.textContent : null
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scroll-into-view', async (event, selector) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
        if (!element) {
          return { success: false, error: 'Element not found' };
        }
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { 
          success: true, 
          selector: '${selector.replace(/'/g, "\\'")}',
          boundingRect: element.getBoundingClientRect()
        };
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-drag-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const dropZone = document.getElementById('dropZone');
        const dragStatus = document.getElementById('dragStatus');
        return {
          dropZoneExists: !!dropZone,
          dragStatusExists: !!dragStatus,
          dropZoneClass: dropZone ? dropZone.className : null,
          dragStatusText: dragStatus ? dragStatus.textContent : null
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-canvas-info', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const info = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const canvas = document.getElementById('testCanvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        return {
          canvasExists: !!canvas,
          width: canvas ? canvas.width : null,
          height: canvas ? canvas.height : null,
          contextExists: !!ctx,
          imageData: canvas ? ctx.getImageData(0, 0, canvas.width, canvas.height).data.slice(0, 10) : null
        };
      })()
    `);
    return { success: true, ...info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-svg-info', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const info = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const svgContainer = document.getElementById('svgContainer');
        const selectedCircle = svgContainer ? svgContainer.querySelector('circle[data-selected="true"]') : null;
        return {
          svgExists: !!svgContainer,
          circlesCount: svgContainer ? svgContainer.querySelectorAll('circle').length : 0,
          selectedCircleId: selectedCircle ? selectedCircle.id : null
        };
      })()
    `);
    return { success: true, ...info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-form-validation', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const validation = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const validationError = document.getElementById('validationError');
        return {
          emailExists: !!emailInput,
          passwordExists: !!passwordInput,
          emailValid: emailInput ? emailInput.checkValidity() : null,
          passwordValid: passwordInput ? passwordInput.checkValidity() : null,
          errorExists: !!validationError,
          errorText: validationError ? validationError.textContent : null
        };
      })()
    `);
    return { success: true, ...validation };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-scroll-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const scrollContainer = document.getElementById('scrollContainer');
        const items = scrollContainer ? scrollContainer.querySelectorAll('.scroll-item') : [];
        return {
          containerExists: !!scrollContainer,
          itemsCount: items.length,
          visibleItems: Array.from(items).filter(item => {
            const rect = item.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          }).length
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-disabled-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const disabledButton = document.getElementById('disabledButton');
        return {
          buttonExists: !!disabledButton,
          isDisabled: disabledButton ? disabledButton.disabled : null,
          buttonText: disabledButton ? disabledButton.textContent : null
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-opacity-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const opacityElement = document.getElementById('opacityElement');
        const style = opacityElement ? window.getComputedStyle(opacityElement) : null;
        return {
          elementExists: !!opacityElement,
          opacity: style ? parseFloat(style.opacity) : null,
          isVisible: opacityElement ? opacityElement.offsetParent !== null : false
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-custom-checkbox-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const customCheckbox = document.getElementById('customCheckbox');
        const checkboxLabel = document.querySelector('.custom-checkbox');
        const isChecked = customCheckbox ? customCheckbox.checked : null;
        const hasCheckedClass = checkboxLabel ? checkboxLabel.classList.contains('checked') : false;
        return {
          checkboxExists: !!customCheckbox,
          isChecked,
          labelHasCheckedClass: hasCheckedClass
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-file-upload-status', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const status = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const fileInput = document.getElementById('fileInput');
        const fileStatus = document.getElementById('fileStatus');
        return {
          fileInputExists: !!fileInput,
          hasFiles: fileInput ? fileInput.files.length > 0 : false,
          fileCount: fileInput ? fileInput.files.length : 0,
          statusText: fileStatus ? fileStatus.textContent : null
        };
      })()
    `);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('evaluate-in-shadow', async (event, selector, script) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const shadowHost = document.querySelector('.shadow-container');
        if (!shadowHost || !shadowHost.shadowRoot) {
          return { success: false, error: 'Shadow root not found' };
        }
        const element = shadowRoot.querySelector('${selector.replace(/'/g, "\\'")}');
        if (!element) {
          return { success: false, error: 'Element not found in shadow DOM' };
        }
        try {
          const result = (${script})(element);
          return { success: true, result };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('evaluate-in-iframe', async (event, selector, script) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const iframe = document.getElementById('testIframe');
        if (!iframe) {
          return { success: false, error: 'Iframe not found' };
        }
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const element = iframeDoc.querySelector('${selector.replace(/'/g, "\\'")}');
          if (!element) {
            return { success: false, error: 'Element not found in iframe' };
          }
          try {
            const result = (${script})(element);
            return { success: true, result };
          } catch (e) {
            return { success: false, error: e.message };
          }
        } catch (e) {
          return { success: false, error: 'Cannot access iframe content: ' + e.message };
        }
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('click-svg-element', async (event, elementId) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const svgContainer = document.getElementById('svgContainer');
        const element = svgContainer ? svgContainer.querySelector('#${elementId}') : null;
        if (!element) {
          return { success: false, error: 'SVG element not found' };
        }
        element.click();
        return { success: true, elementId: '${elementId}' };
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-console-messages', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const messages = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const consoleOutput = document.getElementById('consoleOutput');
        if (!consoleOutput) {
          return [];
        }
        const lines = consoleOutput.querySelectorAll('.console-line');
        return Array.from(lines).map(line => ({
          type: line.classList.contains('info') ? 'info' : 
                line.classList.contains('warning') ? 'warning' : 
                line.classList.contains('error') ? 'error' : 'log',
          message: line.textContent
        }));
      })()
    `);
    return { success: true, messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-performance-metrics', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const metrics = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const perfData = performance.timing || {};
        const loadTime = perfData.loadEventEnd ? perfData.loadEventEnd - perfData.navigationStart : null;
        const domContentLoaded = perfData.domContentLoadedEventEnd ? perfData.domContentLoadedEventEnd - perfData.navigationStart : null;
        
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(e => e.name === 'first-paint');
        const firstContentfulPaint = paintEntries.find(e => e.name === 'first-contentful-paint');
        
        let memoryInfo = {};
        if (performance.memory) {
          memoryInfo = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        
        return {
          loadTime,
          domContentLoaded,
          firstPaint: firstPaint ? firstPaint.startTime : null,
          firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : null,
          memory: memoryInfo
        };
      })()
    `);
    return { success: true, metrics };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-browser-cache', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    await mainWindow.webContents.session.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'serviceworkers', 'cachestorage']
    });
    
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        localStorage.clear();
        sessionStorage.clear();
        
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        });
        
        return { cleared: true };
      })()
    `);
    
    return { success: true, message: 'Browser cache and storage cleared' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-user-agent', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const userAgent = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return navigator.userAgent;
      })()
    `);
    return { success: true, userAgent };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-protocol-info', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const info = await mainWindow.webContents.executeJavaScript(`
      (() => {
        return {
          browser: {
            name: navigator.appName,
            version: navigator.appVersion,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            vendor: navigator.vendor
          },
          screen: {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio
          },
          features: {
            geolocation: 'geolocation' in navigator,
            localstorage: 'localStorage' in window,
            sessionstorage: 'sessionStorage' in window,
            websql: 'openDatabase' in window,
            indexeddb: 'indexedDB' in window,
            websockets: 'WebSocket' in window,
            serviceworker: 'serviceWorker' in navigator
          }
        };
      })()
    `);
    return { success: true, protocolInfo: info };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('emulate-network-conditions', async (event, conditions) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const conditions = ${JSON.stringify(conditions)};
        
        if (conditions.offline) {
          window.addEventListener('offline', () => {
            document.getElementById('currentNetworkStatus').textContent = 'Offline';
          });
          console.log('Network: Offline');
          return { success: true, message: 'Set to offline' };
        }
        
        if (conditions.downloadThroughput !== undefined) {
          console.log('Network: Download throughput:', conditions.downloadThroughput);
          return { success: true, message: 'Network conditions updated' };
        }
        
        if (conditions.uploadThroughput !== undefined) {
          console.log('Network: Upload throughput:', conditions.uploadThroughput);
          return { success: true, message: 'Network conditions updated' };
        }
        
        if (conditions.latency !== undefined) {
          console.log('Network: Latency:', conditions.latency);
          return { success: true, message: 'Network conditions updated' };
        }
        
        return { success: true, message: 'No network conditions specified' };
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('reset-network-conditions', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        document.getElementById('currentNetworkStatus').textContent = 'Online';
        console.log('Network: Reset to default');
        return { success: true, message: 'Network conditions reset' };
      })()
    `);
    return { success: true, message: 'Network conditions reset to default' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-geolocation', async (event, location) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const location = ${JSON.stringify(location)};
        document.getElementById('currentLatitude').textContent = location.latitude.toFixed(6);
        document.getElementById('currentLongitude').textContent = location.longitude.toFixed(6);
        document.getElementById('currentAccuracy').textContent = location.accuracy ? location.accuracy.toFixed(0) + 'm' : 'N/A';
        console.log('Geolocation:', location.latitude, location.longitude);
        return { success: true, message: 'Geolocation set' };
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-geolocation', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        document.getElementById('currentLatitude').textContent = '-';
        document.getElementById('currentLongitude').textContent = '-';
        document.getElementById('currentAccuracy').textContent = '-';
        console.log('Geolocation: Cleared');
        return { success: true, message: 'Geolocation cleared' };
      })()
    `);
    return { success: true, message: 'Geolocation cleared' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-device-metrics', async (event, metrics) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }
  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const metrics = ${JSON.stringify(metrics)};
        document.getElementById('deviceWidth').textContent = metrics.width;
        document.getElementById('deviceHeight').textContent = metrics.height;
        document.getElementById('deviceScaleFactor').textContent = metrics.deviceScaleFactor || 1;
        document.getElementById('deviceMobile').textContent = metrics.mobile || false;
        console.log('Device metrics:', metrics);
        return { success: true, message: 'Device metrics set' };
      })()
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});
