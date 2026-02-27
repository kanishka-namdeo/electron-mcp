let counter = 0;
let asyncCount = 0;
let clickCount = 0;
let canvasClicks = 0;
let scrollItems = 5;
let droppedItems = 0;
let disabledState = true;
let opacityValue = 0;
let shadowHost = null;
let shadowRoot = null;

document.addEventListener('DOMContentLoaded', () => {
  const elementOutput = document.getElementById('elementOutput');
  const updateElementOutput = (action, details) => {
    const timestamp = new Date().toLocaleTimeString();
    elementOutput.innerHTML = `
      <div class="info-item"><strong>Last Action:</strong> ${action}</div>
      <div class="info-item"><strong>Details:</strong> ${details}</div>
      <div class="info-item"><strong>Time:</strong> ${timestamp}</div>
    `;
  };

  document.getElementById('getInfoBtn').addEventListener('click', async () => {
    try {
      const info = await window.electronAPI.getAppInfo();
      const appInfoDiv = document.getElementById('appInfo');
      appInfoDiv.innerHTML = `
        <div class="info-item"><strong>App Name:</strong> ${info.name}</div>
        <div class="info-item"><strong>Version:</strong> ${info.version}</div>
        <div class="info-item"><strong>Platform:</strong> ${info.platform}</div>
        <div class="info-item"><strong>Electron Version:</strong> ${info.electronVersion}</div>
      `;
    } catch (error) {
      document.getElementById('appInfo').innerHTML = `<div class="info-item"><strong>Error:</strong> ${error.message}</div>`;
    }
  });

  document.getElementById('textInput').addEventListener('input', (e) => {
    updateElementOutput('Text Input', `Value: "${e.target.value}"`);
  });

  document.getElementById('numberInput').addEventListener('input', (e) => {
    updateElementOutput('Number Input', `Value: ${e.target.value}`);
  });

  document.getElementById('textarea').addEventListener('input', (e) => {
    const length = e.target.value.length;
    updateElementOutput('Textarea', `Length: ${length} characters`);
  });

  document.getElementById('selectDropdown').addEventListener('change', (e) => {
    updateElementOutput('Select Dropdown', `Selected: ${e.target.value}`);
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const checked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      updateElementOutput('Checkbox', `Checked: [${checked.join(', ')}]`);
    });
  });

  document.querySelectorAll('input[name="radioGroup"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateElementOutput('Radio', `Selected: ${e.target.value}`);
    });
  });

  const buttons = ['primaryBtn', 'secondaryBtn', 'successBtn', 'warningBtn', 'dangerBtn'];
  buttons.forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', (e) => {
      updateElementOutput('Button Click', `Clicked: ${e.target.textContent}`);
    });
  });

  const counterDisplay = document.getElementById('counter');
  const dynamicText = document.getElementById('dynamicText');

  document.getElementById('incrementBtn').addEventListener('click', () => {
    counter++;
    counterDisplay.textContent = counter;
    dynamicText.textContent = `Counter incremented to ${counter} at ${new Date().toLocaleTimeString()}`;
  });

  document.getElementById('decrementBtn').addEventListener('click', () => {
    counter--;
    counterDisplay.textContent = counter;
    dynamicText.textContent = `Counter decremented to ${counter} at ${new Date().toLocaleTimeString()}`;
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    counter = 0;
    counterDisplay.textContent = counter;
    dynamicText.textContent = `Counter reset to 0 at ${new Date().toLocaleTimeString()}`;
  });

  let hiddenVisible = false;
  document.getElementById('toggleHiddenBtn').addEventListener('click', () => {
    hiddenVisible = !hiddenVisible;
    const hiddenElement = document.getElementById('hiddenElement');
    if (hiddenVisible) {
      hiddenElement.classList.remove('hidden');
      hiddenElement.classList.add('fade-in');
    } else {
      hiddenElement.classList.add('hidden');
      hiddenElement.classList.remove('fade-in');
    }
  });

  document.getElementById('updateViewportBtn').addEventListener('click', () => {
    document.getElementById('viewportWidth').textContent = window.innerWidth;
    document.getElementById('viewportHeight').textContent = window.innerHeight;
  });

  document.getElementById('a11yBtn').addEventListener('click', () => {
    const statusIndicator = document.getElementById('a11yStatus');
    const isNowActive = statusIndicator.classList.contains('inactive');
    statusIndicator.classList.toggle('active');
    statusIndicator.classList.toggle('inactive');
    document.getElementById('a11yOutput').innerHTML = `
      <div class="info-item"><strong>Status:</strong> <span class="status-indicator ${isNowActive ? 'active' : 'inactive'}" id="a11yStatus"></span> ${isNowActive ? 'Active' : 'Inactive'}</div>
      <div class="info-item"><strong>Last Click:</strong> ${new Date().toLocaleTimeString()}</div>
    `;
  });

  document.getElementById('getWindowInfoBtn').addEventListener('click', async () => {
    try {
      const info = await window.electronAPI.getWindowInfo();
      document.getElementById('windowInfo').innerHTML = `
        <div class="info-item"><strong>Available:</strong> ${info.available}</div>
        ${info.available ? `
          <div class="info-item"><strong>Title:</strong> ${info.title}</div>
          <div class="info-item"><strong>Bounds:</strong> x=${info.bounds.x}, y=${info.bounds.y}, width=${info.bounds.width}, height=${info.bounds.height}</div>
          <div class="info-item"><strong>Minimized:</strong> ${info.isMinimized}</div>
          <div class="info-item"><strong>Maximized:</strong> ${info.isMaximized}</div>
          <div class="info-item"><strong>Full Screen:</strong> ${info.isFullScreen}</div>
        ` : ''}
      `;
    } catch (error) {
      document.getElementById('windowInfo').innerHTML = `<div class="info-item"><strong>Error:</strong> ${error.message}</div>`;
    }
  });

  document.getElementById('focusBtn').addEventListener('click', async () => {
    try {
      await window.electronAPI.focusWindow();
    } catch (error) {
      console.error('Focus error:', error);
    }
  });

  document.getElementById('minimizeBtn').addEventListener('click', async () => {
    try {
      await window.electronAPI.minimizeWindow();
    } catch (error) {
      console.error('Minimize error:', error);
    }
  });

  document.getElementById('maximizeBtn').addEventListener('click', async () => {
    try {
      await window.electronAPI.maximizeWindow();
    } catch (error) {
      console.error('Maximize error:', error);
    }
  });

  document.getElementById('restoreBtn').addEventListener('click', async () => {
    try {
      await window.electronAPI.restoreWindow();
    } catch (error) {
      console.error('Restore error:', error);
    }
  });

  document.getElementById('navigateBtn').addEventListener('click', async () => {
    try {
      const url = document.getElementById('urlInput').value;
      await window.electronAPI.navigate(url);
      document.getElementById('pageInfoOutput').innerHTML = `<div class="info-item"><strong>Navigated to:</strong> ${url}</div>`;
    } catch (error) {
      document.getElementById('pageInfoOutput').innerHTML = `<div class="info-item"><strong>Error:</strong> ${error.message}</div>`;
    }
  });

  document.getElementById('getPageInfoBtn').addEventListener('click', async () => {
    try {
      const info = await window.electronAPI.getPageInfo();
      document.getElementById('pageInfoOutput').innerHTML = `
        <div class="info-item"><strong>URL:</strong> ${info.url}</div>
        <div class="info-item"><strong>Title:</strong> ${info.title}</div>
      `;
    } catch (error) {
      document.getElementById('pageInfoOutput').innerHTML = `<div class="info-item"><strong>Error:</strong> ${error.message}</div>`;
    }
  });

  document.getElementById('executeBtn').addEventListener('click', async () => {
    try {
      const script = document.getElementById('scriptInput').value;
      const result = await window.electronAPI.executeScript(script);
      document.getElementById('scriptOutput').innerHTML = `
        <div class="info-item"><strong>Result:</strong> ${JSON.stringify(result, null, 2)}</div>
        <div class="info-item"><strong>Executed at:</strong> ${new Date().toLocaleTimeString()}</div>
      `;
    } catch (error) {
      document.getElementById('scriptOutput').innerHTML = `<div class="info-item"><strong>Error:</strong> ${error.message}</div>`;
    }
  });

  document.getElementById('sendMessageBtn').addEventListener('click', async () => {
    try {
      const input = document.getElementById('messageInput');
      const message = input.value || 'Hello from renderer!';
      const result = await window.electronAPI.testMessage(message);
      const outputDiv = document.getElementById('output');
      outputDiv.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      document.getElementById('output').textContent = `Error: ${error.message}`;
    }
  });

  document.querySelectorAll('.color-box').forEach(box => {
    box.addEventListener('click', (e) => {
      const color = e.target.style.background;
      const title = e.target.title;
      document.getElementById('dynamicText').textContent = `Selected ${title} color (${color})`;
    });
  });

  window.addEventListener('resize', () => {
    document.getElementById('viewportWidth').textContent = window.innerWidth;
    document.getElementById('viewportHeight').textContent = window.innerHeight;
  });

  // Shadow DOM Testing
  document.getElementById('createShadowBtn').addEventListener('click', () => {
    const container = document.getElementById('shadowContainer');
    container.innerHTML = '';
    
    shadowHost = document.createElement('div');
    shadowHost.className = 'shadow-container';
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    shadowRoot.innerHTML = `
      <style>
        button { background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #218838; }
        input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      </style>
      <div>
        <h4>Open Shadow DOM</h4>
        <input type="text" placeholder="Type in shadow DOM..." id="shadowInput">
        <button id="shadowButton">Click Shadow Button</button>
      </div>
    `;
    
    container.appendChild(shadowHost);
    document.getElementById('shadowOutput').innerHTML = `
      <div class="info-item"><strong>Mode:</strong> Open</div>
      <div class="info-item"><strong>Status:</strong> Shadow DOM created</div>
    `;
  });

  document.getElementById('createClosedShadowBtn').addEventListener('click', () => {
    const container = document.getElementById('shadowContainer');
    container.innerHTML = '';
    
    shadowHost = document.createElement('div');
    shadowHost.className = 'shadow-container';
    shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
    
    shadowRoot.innerHTML = `
      <style>
        button { background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #c82333; }
      </style>
      <div>
        <h4>Closed Shadow DOM</h4>
        <p>This shadow DOM is closed - automation tools cannot access it!</p>
        <button id="shadowButton">Closed Shadow Button</button>
      </div>
    `;
    
    container.appendChild(shadowHost);
    document.getElementById('shadowOutput').innerHTML = `
      <div class="info-item"><strong>Mode:</strong> Closed</div>
      <div class="info-item"><strong>Status:</strong> Shadow DOM created (inaccessible to automation)</div>
      <div class="info-item" style="color: #dc3545;">⚠️ Automation tools cannot access closed shadow DOM</div>
    `;
  });

  // Iframe Testing
  document.getElementById('loadIframeBtn').addEventListener('click', () => {
    const iframe = document.getElementById('testIframe');
    const iframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 10px; background: #f0f8ff; }
          button { background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
          input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h3>Iframe Content</h3>
        <input type="text" placeholder="Iframe input..." id="iframeInput">
        <button id="iframeButton">Click Iframe Button</button>
        <p id="iframeOutput">Click the button!</p>
        <script>
          document.getElementById('iframeButton').addEventListener('click', () => {
            document.getElementById('iframeOutput').textContent = 'Button clicked at ' + new Date().toLocaleTimeString();
          });
        <\/script>
      </body>
      </html>
    `;
    iframe.srcdoc = iframeContent;
    document.getElementById('iframeOutput').innerHTML = `<div class="info-item"><strong>Status:</strong> Iframe loaded</div>`;
  });

  // Modal & Dialog Testing
  const modalOverlay = document.getElementById('modalOverlay');
  
  document.getElementById('openModalBtn').addEventListener('click', () => {
    modalOverlay.classList.add('active');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item"><strong>Status:</strong> Modal opened at ${new Date().toLocaleTimeString()}</div>`;
  });
  
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item"><strong>Status:</strong> Modal closed at ${new Date().toLocaleTimeString()}</div>`;
  });
  
  document.getElementById('confirmModalBtn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item success"><strong>Action:</strong> Confirmed at ${new Date().toLocaleTimeString()}</div>`;
  });
  
  document.getElementById('showAlertBtn').addEventListener('click', () => {
    alert('This is a test alert!');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item"><strong>Action:</strong> Alert shown</div>`;
  });
  
  document.getElementById('showConfirmBtn').addEventListener('click', () => {
    const result = confirm('Do you confirm this action?');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item"><strong>Result:</strong> ${result ? 'Confirmed' : 'Cancelled'}</div>`;
  });
  
  document.getElementById('showPromptBtn').addEventListener('click', () => {
    const result = prompt('Enter your name:', 'User');
    document.getElementById('modalOutput').innerHTML = `<div class="info-item"><strong>Input:</strong> ${result || 'Cancelled'}</div>`;
  });

  // Timing & Race Conditions
  document.getElementById('asyncActionBtn').addEventListener('click', () => {
    asyncCount++;
    document.getElementById('asyncCount').textContent = asyncCount;
    document.getElementById('loadingSpinner').classList.remove('hidden');
    
    setTimeout(() => {
      document.getElementById('loadingSpinner').classList.add('hidden');
      dynamicText.textContent = `Async action #${asyncCount} completed at ${new Date().toLocaleTimeString()}`;
    }, 2000);
  });
  
  document.getElementById('rapidClickBtn').addEventListener('click', () => {
    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    dynamicText.textContent = `Rapid click #${clickCount} at ${new Date().toLocaleTimeString()}`;
  });

  // Off-Screen & Overlapping Elements
  document.getElementById('clickOffScreenBtn').addEventListener('click', () => {
    const offScreenBtn = document.getElementById('offScreenElement');
    offScreenBtn.click();
    document.getElementById('offScreenStatus').textContent = 'Clicked programmatically';
    document.getElementById('offScreenOutput').innerHTML += `<div class="info-item">⚠️ Element exists at ${offScreenBtn.getBoundingClientRect().x} (off-screen)</div>`;
  });
  
  document.getElementById('clickOverlapBtn').addEventListener('click', () => {
    const behindBtn = document.getElementById('overlapBehind');
    behindBtn.click();
    document.getElementById('overlapStatus').textContent = 'Clicked programmatically';
    document.getElementById('offScreenOutput').innerHTML += `<div class="info-item">⚠️ Element is behind another (z-index issue)</div>`;
  });

  // Drag and Drop
  const dropZone = document.getElementById('dropZone');
  
  document.getElementById('addDragItemBtn').addEventListener('click', () => {
    const item = document.createElement('div');
    item.textContent = `Item ${droppedItems + 1}`;
    item.style.cssText = 'background: white; padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; cursor: move;';
    item.draggable = true;
    item.id = `dragItem${droppedItems}`;
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.textContent);
    });
    
    document.getElementById('dropZoneItems').appendChild(item);
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const data = e.dataTransfer.getData('text/plain');
    const item = document.createElement('div');
    item.textContent = data;
    item.style.cssText = 'background: #d4edda; padding: 10px; margin: 5px; border: 1px solid #c3e6cb; border-radius: 4px;';
    document.getElementById('dropZoneItems').appendChild(item);
    
    droppedItems++;
    document.getElementById('droppedCount').textContent = droppedItems;
  });

  // Canvas Testing
  const canvas = document.getElementById('interactiveCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    canvasClicks++;
    document.getElementById('canvasClicks').textContent = canvasClicks;
    document.getElementById('lastCanvasPos').textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  });
  
  document.getElementById('clearCanvasBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasClicks = 0;
    document.getElementById('canvasClicks').textContent = 0;
    document.getElementById('lastCanvasPos').textContent = 'None';
  });

  // SVG Testing
  document.getElementById('svgRect1').addEventListener('click', () => {
    document.getElementById('svgSelected').textContent = 'Rectangle (blue)';
  });
  
  document.getElementById('svgCircle1').addEventListener('click', () => {
    document.getElementById('svgSelected').textContent = 'Circle (green)';
  });
  
  document.getElementById('svgPath1').addEventListener('click', () => {
    document.getElementById('svgSelected').textContent = 'Path (red)';
  });
  
  document.getElementById('svgText1').addEventListener('click', () => {
    document.getElementById('svgSelected').textContent = 'Text';
  });

  // Form Validation
  document.getElementById('validateFormBtn').addEventListener('click', () => {
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    let isValid = true;
    
    if (!emailInput.value || !emailInput.value.includes('@')) {
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
    }
    
    if (passwordInput.value.length < 8) {
      passwordError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError.classList.add('hidden');
    }
    
    const formStatus = document.getElementById('formStatus');
    if (isValid) {
      formStatus.textContent = 'Valid';
      formStatus.parentElement.classList.add('success');
      formStatus.parentElement.classList.remove('error');
    } else {
      formStatus.textContent = 'Invalid';
      formStatus.parentElement.classList.add('error');
      formStatus.parentElement.classList.remove('success');
    }
  });
  
  document.getElementById('resetFormBtn').addEventListener('click', () => {
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('emailError').classList.add('hidden');
    document.getElementById('passwordError').classList.add('hidden');
    document.getElementById('formStatus').textContent = 'Not validated';
    document.getElementById('validationOutput').classList.remove('success', 'error');
  });

  // Infinite Scroll / Lazy Loading
  const scrollContainer = document.getElementById('infiniteScrollContainer');
  
  scrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const loadingMore = document.getElementById('loadingMore');
      if (!loadingMore.classList.contains('hidden')) return;
      
      loadingMore.classList.remove('hidden');
      
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          scrollItems++;
          const item = document.createElement('div');
          item.className = 'scroll-item';
          item.textContent = `Item ${scrollItems}`;
          scrollContainer.appendChild(item);
        }
        
        document.getElementById('totalScrollItems').textContent = scrollItems;
        loadingMore.classList.add('hidden');
      }, 1000);
    }
  });

  // Disabled Elements
  document.getElementById('toggleDisabledBtn').addEventListener('click', () => {
    disabledState = !disabledState;
    const disabledBtn = document.getElementById('disabledBtn');
    const disabledInput = document.getElementById('disabledInput');
    
    disabledBtn.disabled = disabledState;
    disabledInput.disabled = disabledState;
    
    document.getElementById('disabledStatus').textContent = disabledState ? 'Disabled' : 'Enabled';
  });

  // Opacity Hidden
  document.getElementById('toggleOpacityBtn').addEventListener('click', () => {
    opacityValue = opacityValue === 0 ? 1 : 0;
    const opacityBtn = document.getElementById('opacityBtn');
    opacityBtn.style.opacity = opacityValue;
    document.getElementById('opacityStatus').textContent = opacityValue;
  });

  // Custom Checkbox
  document.getElementById('customCheckbox').addEventListener('change', (e) => {
    document.getElementById('customCheckboxStatus').textContent = e.target.checked;
  });

  // File Upload
  document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('fileName').textContent = file.name;
      document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(2)} KB`;
    } else {
      document.getElementById('fileName').textContent = 'None';
      document.getElementById('fileSize').textContent = '-';
    }
  });

  // Network Conditions Test
  document.getElementById('simulateOfflineBtn').addEventListener('click', () => {
    window.addEventListener('offline', () => {
      document.getElementById('currentNetworkStatus').textContent = 'Offline';
    });
    console.log('Simulating offline mode');
    addConsoleLog('info', 'Network set to offline');
  });

  document.getElementById('simulateSlowNetworkBtn').addEventListener('click', () => {
    document.getElementById('currentNetworkStatus').textContent = 'Slow 3G';
    addConsoleLog('info', 'Network set to Slow 3G');
  });

  document.getElementById('simulateFastNetworkBtn').addEventListener('click', () => {
    document.getElementById('currentNetworkStatus').textContent = 'Fast 4G';
    addConsoleLog('info', 'Network set to Fast 4G');
  });

  document.getElementById('resetNetworkBtn').addEventListener('click', () => {
    document.getElementById('currentNetworkStatus').textContent = 'Online';
    addConsoleLog('info', 'Network reset to default');
  });

  document.getElementById('testNetworkRequestBtn').addEventListener('click', async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const data = await response.json();
      const duration = Date.now() - startTime;
      document.getElementById('networkRequestResult').textContent = 
        `Success (${duration}ms): ${JSON.stringify(data)}`;
      addConsoleLog('info', `Network request completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      document.getElementById('networkRequestResult').textContent = 
        `Failed (${duration}ms): ${error.message}`;
      addConsoleLog('error', `Network request failed: ${error.message}`);
    }
  });

  // Geolocation Test
  document.getElementById('getCurrentLocationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById('currentLatitude').textContent = position.coords.latitude.toFixed(6);
          document.getElementById('currentLongitude').textContent = position.coords.longitude.toFixed(6);
          document.getElementById('currentAccuracy').textContent = `${position.coords.accuracy.toFixed(0)}m`;
          addConsoleLog('info', `Location: ${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          document.getElementById('currentLatitude').textContent = 'Error';
          document.getElementById('currentLongitude').textContent = 'Error';
          document.getElementById('currentAccuracy').textContent = error.message;
          addConsoleLog('error', `Geolocation error: ${error.message}`);
        }
      );
    } else {
      addConsoleLog('error', 'Geolocation not supported');
    }
  });

  document.getElementById('setTestLocationBtn').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('testLatitude').value);
    const lng = parseFloat(document.getElementById('testLongitude').value);
    const acc = parseFloat(document.getElementById('testAccuracy').value) || 100;
    
    if (!isNaN(lat) && !isNaN(lng)) {
      document.getElementById('currentLatitude').textContent = lat.toFixed(6);
      document.getElementById('currentLongitude').textContent = lng.toFixed(6);
      document.getElementById('currentAccuracy').textContent = `${acc}m`;
      addConsoleLog('info', `Test location set: ${lat}, ${lng}`);
    } else {
      addConsoleLog('error', 'Invalid latitude or longitude');
    }
  });

  document.getElementById('clearTestLocationBtn').addEventListener('click', () => {
    document.getElementById('currentLatitude').textContent = '-';
    document.getElementById('currentLongitude').textContent = '-';
    document.getElementById('currentAccuracy').textContent = '-';
    document.getElementById('testLatitude').value = '';
    document.getElementById('testLongitude').value = '';
    document.getElementById('testAccuracy').value = '';
    addConsoleLog('info', 'Test location cleared');
  });

  // Device Metrics Test
  const devicePresets = {
    desktop: { width: 1920, height: 1080, scale: 1, mobile: false },
    tablet: { width: 768, height: 1024, scale: 2, mobile: false },
    mobile: { width: 375, height: 667, scale: 3, mobile: true }
  };

  document.getElementById('setDesktopBtn').addEventListener('click', () => {
    updateDeviceMetrics(devicePresets.desktop);
  });

  document.getElementById('setTabletBtn').addEventListener('click', () => {
    updateDeviceMetrics(devicePresets.tablet);
  });

  document.getElementById('setMobileBtn').addEventListener('click', () => {
    updateDeviceMetrics(devicePresets.mobile);
  });

  document.getElementById('setCustomDeviceBtn').addEventListener('click', () => {
    document.getElementById('customDeviceInputs').classList.remove('hidden');
  });

  document.getElementById('applyDeviceMetricsBtn').addEventListener('click', () => {
    const custom = {
      width: parseInt(document.getElementById('customWidth').value),
      height: parseInt(document.getElementById('customHeight').value),
      scale: parseFloat(document.getElementById('customScaleFactor').value),
      mobile: document.getElementById('customMobile').checked
    };
    updateDeviceMetrics(custom);
  });

  function updateDeviceMetrics(metrics) {
    document.getElementById('deviceWidth').textContent = metrics.width;
    document.getElementById('deviceHeight').textContent = metrics.height;
    document.getElementById('deviceScaleFactor').textContent = metrics.scale;
    document.getElementById('deviceMobile').textContent = metrics.mobile;
    addConsoleLog('info', `Device metrics: ${metrics.width}x${metrics.height}, scale: ${metrics.scale}, mobile: ${metrics.mobile}`);
  }

  // Console Messages Test
  document.getElementById('logInfoBtn').addEventListener('click', () => {
    console.info('Test info message');
    addConsoleLog('info', 'Test info message');
  });

  document.getElementById('logWarningBtn').addEventListener('click', () => {
    console.warn('Test warning message');
    addConsoleLog('warning', 'Test warning message');
  });

  document.getElementById('logErrorBtn').addEventListener('click', () => {
    console.error('Test error message');
    addConsoleLog('error', 'Test error message');
  });

  document.getElementById('throwErrorBtn').addEventListener('click', () => {
    try {
      throw new Error('Test thrown error');
    } catch (e) {
      console.error(e);
      addConsoleLog('error', `Thrown: ${e.message}`);
    }
  });

  document.getElementById('clearConsoleBtn').addEventListener('click', () => {
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML = '<div class="console-line info">[Info] Console cleared</div>';
  });

  function addConsoleLog(type, message) {
    const consoleOutput = document.getElementById('consoleOutput');
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${type.charAt(0).toUpperCase() + type.slice(1)}] ${message}`;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  // Performance Metrics Test
  document.getElementById('measurePerformanceBtn').addEventListener('click', () => {
    const perfData = performance.timing;
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    
    document.getElementById('performanceLoadTime').textContent = `${loadTime}ms`;
    document.getElementById('performanceDomContentLoaded').textContent = `${domContentLoaded}ms`;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(e => e.name === 'first-paint');
    document.getElementById('performanceFirstPaint').textContent = firstPaint ? `${firstPaint.startTime.toFixed(0)}ms` : 'N/A';
    
    if (performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      document.getElementById('performanceMemory').textContent = `${memoryMB} MB`;
    }
    
    addConsoleLog('info', 'Performance measured');
  });

  document.getElementById('runHeavyTaskBtn').addEventListener('click', () => {
    addConsoleLog('info', 'Running heavy CPU task...');
    const startTime = Date.now();
    
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i);
    }
    
    const duration = Date.now() - startTime;
    addConsoleLog('info', `Heavy task completed in ${duration}ms (result: ${result.toFixed(0)})`);
  });

  document.getElementById('createManyElementsBtn').addEventListener('click', () => {
    addConsoleLog('info', 'Creating 1000 DOM elements...');
    const startTime = Date.now();
    
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);
    
    for (let i = 0; i < 1000; i++) {
      const div = document.createElement('div');
      div.textContent = `Element ${i}`;
      div.style.padding = '5px';
      container.appendChild(div);
    }
    
    const duration = Date.now() - startTime;
    addConsoleLog('info', `Created 1000 elements in ${duration}ms`);
    
    document.body.removeChild(container);
  });

  // Browser Cache Test
  function updateCacheCounts() {
    document.getElementById('localStorageCount').textContent = localStorage.length;
    document.getElementById('sessionStorageCount').textContent = sessionStorage.length;
    document.getElementById('cookiesCount').textContent = document.cookie ? document.cookie.split(';').length : 0;
  }
  
  updateCacheCounts();

  document.getElementById('saveToCacheBtn').addEventListener('click', () => {
    const key = document.getElementById('cacheKey').value;
    const value = document.getElementById('cacheValue').value;
    if (key) {
      localStorage.setItem(key, value);
      updateCacheCounts();
      addConsoleLog('info', `Saved to localStorage: ${key}`);
    }
  });

  document.getElementById('loadFromCacheBtn').addEventListener('click', () => {
    const key = document.getElementById('cacheKey').value;
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        document.getElementById('cacheValue').value = value;
        addConsoleLog('info', `Loaded from localStorage: ${key}`);
      } else {
        addConsoleLog('warning', `Key not found in localStorage: ${key}`);
      }
    }
  });

  document.getElementById('clearLocalStorageBtn').addEventListener('click', () => {
    localStorage.clear();
    updateCacheCounts();
    addConsoleLog('info', 'LocalStorage cleared');
  });

  document.getElementById('saveToSessionBtn').addEventListener('click', () => {
    const key = document.getElementById('sessionKey').value;
    const value = document.getElementById('sessionValue').value;
    if (key) {
      sessionStorage.setItem(key, value);
      updateCacheCounts();
      addConsoleLog('info', `Saved to sessionStorage: ${key}`);
    }
  });

  document.getElementById('loadFromSessionBtn').addEventListener('click', () => {
    const key = document.getElementById('sessionKey').value;
    if (key) {
      const value = sessionStorage.getItem(key);
      if (value) {
        document.getElementById('sessionValue').value = value;
        addConsoleLog('info', `Loaded from sessionStorage: ${key}`);
      } else {
        addConsoleLog('warning', `Key not found in sessionStorage: ${key}`);
      }
    }
  });

  document.getElementById('clearSessionStorageBtn').addEventListener('click', () => {
    sessionStorage.clear();
    updateCacheCounts();
    addConsoleLog('info', 'SessionStorage cleared');
  });

  document.getElementById('setCookieBtn').addEventListener('click', () => {
    const name = document.getElementById('cookieName').value;
    const value = document.getElementById('cookieValue').value;
    if (name && value) {
      document.cookie = `${name}=${value}; path=/`;
      updateCacheCounts();
      addConsoleLog('info', `Cookie set: ${name}`);
    }
  });

  document.getElementById('getCookiesBtn').addEventListener('click', () => {
    const cookies = document.cookie;
    if (cookies) {
      addConsoleLog('info', `Cookies: ${cookies}`);
    } else {
      addConsoleLog('info', 'No cookies found');
    }
  });

  document.getElementById('clearCookiesBtn').addEventListener('click', () => {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    updateCacheCounts();
    addConsoleLog('info', 'All cookies cleared');
  });

  // User Agent Test
  function updateUserAgentInfo() {
    const ua = navigator.userAgent;
    document.getElementById('userAgentDisplay').value = ua;
    
    let browser = 'Unknown';
    let os = 'Unknown';
    let engine = 'Unknown';
    
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    if (ua.includes('WebKit')) engine = 'WebKit';
    else if (ua.includes('Gecko')) engine = 'Gecko';
    else if (ua.includes('Blink')) engine = 'Blink';
    
    document.getElementById('browserName').textContent = browser;
    document.getElementById('osName').textContent = os;
    document.getElementById('engineName').textContent = engine;
  }

  document.getElementById('refreshUserAgentBtn').addEventListener('click', updateUserAgentInfo);

  updateUserAgentInfo();
  addConsoleLog('info', 'App initialized');
});
