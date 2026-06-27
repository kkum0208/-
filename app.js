/* ==========================================================================
   QR Studio Pro (QR 藝境) - Main Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global State ---
  const state = {
    activeTab: 'qr-designer',
    activeDataType: 'url',
    qrCodeInstance: null,
    customLogoDataUrl: null, // Uploaded logo file
    cardBgDataUrl: null,      // Uploaded card background file
    history: [],
    presets: []
  };

  // --- SVG Logo Data URLs (Embedded presets to avoid CORS errors) ---
  const LOGO_SVG_PRESETS = {
    link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    wifi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20" stroke-width="3"></line></svg>`
  };

  // Convert SVG string to data URI for use in qr-code-styling
  function getSvgDataUrl(svgString) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }

  // --- Poetry Card Samples ---
  const POETRY_SAMPLES = {
    jingyesi: {
      title: '靜夜思',
      author: '李白',
      content: '床前明月光，\n疑是地上霜。\n舉頭望明月，\n低頭思故鄉。'
    },
    shuidiaogetou: {
      title: '水調歌頭',
      author: '蘇軾',
      content: '明月幾時有？把酒問青天。\n不知天上宮闕，今夕是何年。\n我欲乘風歸去，又恐瓊樓玉宇，高處不勝寒。\n起舞弄清影, 何似在人間。'
    },
    frost: {
      title: 'Stopping by Woods',
      author: 'Robert Frost',
      content: 'The woods are lovely, dark and deep,\nBut I have promises to keep,\nAnd miles to go before I sleep,\nAnd miles to go before I sleep.'
    }
  };

  // --- Initial Built-in Presets ---
  const DEFAULT_PRESETS = [
    {
      id: 'preset-classic-dark',
      name: '曜石靛藍',
      settings: {
        dotType: 'rounded',
        dotColorType: 'gradient',
        dotGradStart: '#6366f1',
        dotGradEnd: '#a855f7',
        dotGradType: 'linear',
        dotGradAngle: 45,
        cornerType: 'extra-rounded',
        cornerColor: '#4f46e5',
        cornerDotType: 'dot',
        cornerDotColor: '#6366f1',
        bgColor: '#08090f',
        bgOpacity: 100,
        logoPreset: 'none',
        logoSize: 20,
        logoMargin: 6,
        logoClearBg: true,
        ecc: 'H',
        margin: 15
      }
    },
    {
      id: 'preset-cyber-neon',
      name: '賽博極光',
      settings: {
        dotType: 'classy',
        dotColorType: 'gradient',
        dotGradStart: '#00ffcc',
        dotGradEnd: '#d946ef',
        dotGradType: 'linear',
        dotGradAngle: 135,
        cornerType: 'square',
        cornerColor: '#00ffcc',
        cornerDotType: 'square',
        cornerDotColor: '#d946ef',
        bgColor: '#000000',
        bgOpacity: 100,
        logoPreset: 'none',
        logoSize: 22,
        logoMargin: 4,
        logoClearBg: true,
        ecc: 'H',
        margin: 10
      }
    },
    {
      id: 'preset-ink-traditional',
      name: '水墨禪風',
      settings: {
        dotType: 'extra-rounded',
        dotColorType: 'single',
        dotColor: '#262626',
        cornerType: 'extra-rounded',
        cornerColor: '#171717',
        cornerDotType: 'dot',
        cornerDotColor: '#262626',
        bgColor: '#f7f5f0',
        bgOpacity: 100,
        logoPreset: 'none',
        logoSize: 18,
        logoMargin: 8,
        logoClearBg: true,
        ecc: 'Q',
        margin: 15
      }
    },
    {
      id: 'preset-luxury-gold',
      name: '沙金尊爵',
      settings: {
        dotType: 'classy-rounded',
        dotColorType: 'gradient',
        dotGradStart: '#dfba6b',
        dotGradEnd: '#b8860b',
        dotGradType: 'radial',
        cornerType: 'extra-rounded',
        cornerColor: '#dfba6b',
        cornerDotType: 'dot',
        cornerDotColor: '#dfba6b',
        bgColor: '#171717',
        bgOpacity: 100,
        logoPreset: 'none',
        logoSize: 20,
        logoMargin: 6,
        logoClearBg: true,
        ecc: 'H',
        margin: 20
      }
    }
  ];

  // --- Element Selectors ---
  const el = {
    // Nav & Theme
    navItems: document.querySelectorAll('.nav-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    themeToggle: document.getElementById('theme-toggle'),
    
    // QR Designer Inputs
    typeTabs: document.querySelectorAll('.type-tab'),
    inputForms: document.querySelectorAll('.input-form'),
    inputUrl: document.getElementById('input-url'),
    inputText: document.getElementById('input-text'),
    textCharCount: document.getElementById('text-char-count'),
    wifiSsid: document.getElementById('wifi-ssid'),
    wifiPassword: document.getElementById('wifi-password'),
    wifiTogglePass: document.getElementById('wifi-toggle-pass'),
    wifiEncryption: document.getElementById('wifi-encryption'),
    vcardFn: document.getElementById('vcard-fn'),
    vcardOrg: document.getElementById('vcard-org'),
    vcardTitle: document.getElementById('vcard-title'),
    vcardTel: document.getElementById('vcard-tel'),
    vcardEmail: document.getElementById('vcard-email'),
    vcardUrl: document.getElementById('vcard-url'),
    vcardAdr: document.getElementById('vcard-adr'),
    emailTo: document.getElementById('email-to'),
    emailSubject: document.getElementById('email-subject'),
    emailBody: document.getElementById('email-body'),
    smsPhone: document.getElementById('sms-phone'),
    smsMessage: document.getElementById('sms-message'),
    
    // QR Styling inputs
    qrDotType: document.getElementById('qr-dot-type'),
    dotColorType: document.getElementsByName('dot-color-type'),
    qrDotColor: document.getElementById('qr-dot-color'),
    qrDotColorText: document.getElementById('qr-dot-color-text'),
    dotColorSingleWrap: document.getElementById('dot-color-single-wrap'),
    dotGradientWrap: document.getElementById('dot-gradient-wrap'),
    qrDotGradStart: document.getElementById('qr-dot-grad-start'),
    qrDotGradStartText: document.getElementById('qr-dot-grad-start-text'),
    qrDotGradEnd: document.getElementById('qr-dot-grad-end'),
    qrDotGradEndText: document.getElementById('qr-dot-grad-end-text'),
    qrDotGradType: document.getElementById('qr-dot-grad-type'),
    qrDotGradAngle: document.getElementById('qr-dot-grad-angle'),
    qrDotGradAngleVal: document.getElementById('qr-dot-grad-angle-val'),
    dotGradAngleWrap: document.getElementById('dot-grad-angle-wrap'),
    
    // Corners Square & Dot
    qrCornerType: document.getElementById('qr-corner-type'),
    qrCornerColor: document.getElementById('qr-corner-color'),
    qrCornerColorText: document.getElementById('qr-corner-color-text'),
    qrCornerDotType: document.getElementById('qr-corner-dot-type'),
    qrCornerDotColor: document.getElementById('qr-corner-dot-color'),
    qrCornerDotColorText: document.getElementById('qr-corner-dot-color-text'),
    
    // Background options
    qrBgColor: document.getElementById('qr-bg-color'),
    qrBgColorText: document.getElementById('qr-bg-color-text'),
    qrBgOpacity: document.getElementById('qr-bg-opacity'),
    qrBgOpacityVal: document.getElementById('qr-bg-opacity-val'),
    
    // Logo Overlay
    presetLogoBtns: document.querySelectorAll('.preset-logo-btn'),
    logoDropZone: document.getElementById('logo-drop-zone'),
    logoFileInput: document.getElementById('logo-file-input'),
    logoPreviewFilename: document.getElementById('logo-preview-filename'),
    logoRemoveBtn: document.getElementById('logo-remove-btn'),
    qrLogoSize: document.getElementById('qr-logo-size'),
    qrLogoSizeVal: document.getElementById('qr-logo-size-val'),
    qrLogoMargin: document.getElementById('qr-logo-margin'),
    qrLogoMarginVal: document.getElementById('qr-logo-margin-val'),
    qrLogoClearBg: document.getElementById('qr-logo-clear-bg'),
    
    // Advanced settings
    qrEcc: document.getElementById('qr-ecc'),
    qrMargin: document.getElementById('qr-margin'),
    
    // Preview & Export
    qrRenderTarget: document.getElementById('qr-render-target'),
    exportSize: document.getElementById('export-size'),
    exportSizeVal: document.getElementById('export-size-val'),
    exportSizeVal2: document.getElementById('export-size-val2'),
    btnDownloadPng: document.getElementById('btn-download-png'),
    btnDownloadSvg: document.getElementById('btn-download-svg'),
    btnSavePreset: document.getElementById('btn-save-preset'),
    btnSaveHistory: document.getElementById('btn-save-history'),
    
    // Poetry Card Inputs
    btnSamplePoems: document.querySelectorAll('.btn-sample-poem'),
    poemTitle: document.getElementById('poem-title'),
    poemAuthor: document.getElementById('poem-author'),
    poemContent: document.getElementById('poem-content'),
    cardRatioButtons: document.querySelectorAll('.ratio-btn'),
    cardLayoutStyle: document.getElementById('card-layout-style'),
    cardWritingMode: document.getElementById('card-writing-mode'),
    cardQrSize: document.getElementById('card-qr-size'),
    cardQrSizeVal: document.getElementById('card-qr-size-val'),
    cardBgPresets: document.querySelectorAll('.bg-preset-btn'),
    cardBgDropZone: document.getElementById('card-bg-drop-zone'),
    cardBgFileInput: document.getElementById('card-bg-file-input'),
    cardBgPreviewFilename: document.getElementById('card-bg-preview-filename'),
    cardBgRemoveBtn: document.getElementById('card-bg-remove-btn'),
    cardFontFamily: document.getElementById('card-font-family'),
    cardFontSize: document.getElementById('card-font-size'),
    cardFontSizeVal: document.getElementById('card-font-size-val'),
    cardLetterSpacing: document.getElementById('card-letter-spacing'),
    cardLetterSpacingVal: document.getElementById('card-letter-spacing-val'),
    cardLineHeight: document.getElementById('card-line-height'),
    cardLineHeightVal: document.getElementById('card-line-height-val'),
    cardTextColor: document.getElementById('card-text-color'),
    cardTextColorText: document.getElementById('card-text-color-text'),
    
    // Card live preview elements
    cardRenderWrapper: document.getElementById('poetry-card-render-wrapper'),
    cardTextSection: document.querySelector('.poetry-card-text-section'),
    cardQrSection: document.querySelector('.poetry-card-qr-section'),
    cardTitleText: document.querySelector('.poetry-card-title'),
    cardAuthorText: document.querySelector('.poetry-card-author'),
    cardBodyContent: document.querySelector('.poetry-card-body'),
    cardQrPlaceholder: document.getElementById('poetry-card-qr-placeholder'),
    btnDownloadCard: document.getElementById('btn-download-card'),
    
    // Scanner
    btnScannerCam: document.getElementById('btn-scanner-cam'),
    btnScannerFile: document.getElementById('btn-scanner-file'),
    scannerCameraView: document.getElementById('scanner-camera-view'),
    scannerFileView: document.getElementById('scanner-file-view'),
    btnScannerToggle: document.getElementById('btn-scanner-toggle'),
    scanFileInput: document.getElementById('scan-file-input'),
    scanFileSelectedName: document.getElementById('scan-file-selected-name'),
    scannerNoResult: document.getElementById('scanner-no-result'),
    scannerResultContent: document.getElementById('scanner-result-content'),
    scannedTypeBadge: document.getElementById('scanned-type-badge'),
    scannedTime: document.getElementById('scanned-time'),
    scannedTextValue: document.getElementById('scanned-text-value'),
    scanActionUrl: document.getElementById('scan-action-url'),
    scanActionWifi: document.getElementById('scan-action-wifi'),
    scanActionVcard: document.getElementById('scan-action-vcard'),
    scanActionCopy: document.getElementById('scan-action-copy'),
    scanStructuredDetails: document.getElementById('scan-structured-details'),
    
    // Bulk
    bulkSourceRadio: document.getElementsByName('bulk-source'),
    bulkTextareaWrap: document.getElementById('bulk-textarea-wrap'),
    bulkCsvWrap: document.getElementById('bulk-csv-wrap'),
    bulkLinesInput: document.getElementById('bulk-lines-input'),
    bulkDropZone: document.getElementById('bulk-drop-zone'),
    bulkFileInput: document.getElementById('bulk-file-input'),
    bulkFileNameInfo: document.getElementById('bulk-file-name-info'),
    bulkFileRemoveBtn: document.getElementById('bulk-file-remove-btn'),
    bulkNamePrefix: document.getElementById('bulk-name-prefix'),
    bulkImgFormat: document.getElementById('bulk-img-format'),
    btnBulkGenerate: document.getElementById('btn-bulk-generate'),
    bulkIdlePrompt: document.getElementById('bulk-idle-prompt'),
    bulkProgressActive: document.getElementById('bulk-progress-active'),
    bulkProgressText: document.getElementById('bulk-progress-text'),
    bulkProgressPercentage: document.getElementById('bulk-progress-percentage'),
    bulkProgressBar: document.getElementById('bulk-progress-bar'),
    bulkPreviewListWrap: document.getElementById('bulk-preview-list-wrap'),
    bulkPreviewThumbs: document.getElementById('bulk-preview-thumbs'),
    
    // History & Presets lists
    presetsEmpty: document.getElementById('presets-empty'),
    presetsGrid: document.getElementById('presets-grid'),
    historyEmpty: document.getElementById('history-empty'),
    historyList: document.getElementById('history-list'),
    btnClearHistory: document.getElementById('btn-clear-history')
  };

  // Active logo selection state: 'none', 'link', 'github', 'mail', 'phone', 'wifi', or 'custom'
  let selectedLogoPreset = 'none';
  let activeCardRatio = 'square';
  let activeCardBgPreset = 'ink-wash';
  let cameraScannerInstance = null;

  // --- Initializing Libraries & Services ---
  
  // Create default QR Code Instance
  function initQRCode() {
    state.qrCodeInstance = new QRCodeStyling({
      width: 500,
      height: 500,
      type: "canvas",
      data: "https://example.com",
      dotsOptions: {
        color: "#6366f1",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#ffffff"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 6,
        imageSize: 0.2,
        hideBackgroundDots: true
      }
    });
    
    // Clear and render to preview area
    el.qrRenderTarget.innerHTML = '';
    state.qrCodeInstance.append(el.qrRenderTarget);
  }

  // Toast Notification service
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'warning') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span class="toast-msg">${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Trigger animation in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // --- Accordion Logic ---
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const wasExpanded = item.classList.contains('expanded');
      
      // Close other accordions in the same panel
      const parentPanel = item.closest('.config-panel') || item.closest('.tab-panel');
      parentPanel.querySelectorAll('.accordion-item').forEach(sibling => {
        sibling.classList.remove('expanded');
      });
      
      if (!wasExpanded) {
        item.classList.add('expanded');
      }
    });
  });

  // Open first accordion item by default in each panel
  document.querySelectorAll('.config-panel').forEach(panel => {
    const firstItem = panel.querySelector('.accordion-item');
    if (firstItem) firstItem.classList.add('expanded');
  });

  // --- Theme Toggle logic ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    localStorage.setItem('theme', savedTheme);
  }
  
  el.themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`主題已切換為：${newTheme === 'dark' ? '深色模式' : '淺色模式'}`, 'info');
  });

  // --- Tab Switcher Logic (Sidebar) ---
  el.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      
      // Update UI active state
      el.navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      el.tabPanels.forEach(p => p.classList.remove('active'));
      
      // Stop scanner if leaving the scanner tab
      if (state.activeTab === 'qr-scanner' && target !== 'qr-scanner') {
        stopCameraScanner();
      }

      state.activeTab = target;
      
      // Display the current active panel
      if (target === 'qr-designer') {
        document.getElementById('panel-qr-designer').classList.add('active');
        updateQR();
      } else if (target === 'poetry-card') {
        document.getElementById('panel-poetry-card').classList.add('active');
        updatePoetryCard();
      } else if (target === 'qr-scanner') {
        document.getElementById('panel-qr-scanner').classList.add('active');
      } else if (target === 'bulk-generator') {
        document.getElementById('panel-bulk-generator').classList.add('active');
      } else if (target === 'history-presets') {
        document.getElementById('panel-history-presets').classList.add('active');
        renderHistoryList();
        renderPresetsGrid();
      }
    });
  });

  // --- QR Content Data Sub-Tabs Switcher ---
  el.typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      el.typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const type = tab.getAttribute('data-type');
      state.activeDataType = type;
      
      el.inputForms.forEach(f => f.classList.remove('active'));
      document.getElementById(`form-${type}`).classList.add('active');
      
      updateQR();
    });
  });

  // Character counter for textarea text mode
  el.inputText.addEventListener('input', (e) => {
    el.textCharCount.textContent = e.target.value.length;
  });

  // Wi-Fi Password Toggle
  el.wifiTogglePass.addEventListener('click', () => {
    const type = el.wifiPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    el.wifiPassword.setAttribute('type', type);
    const icon = el.wifiTogglePass.querySelector('i');
    if (type === 'text') {
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  });

  // Bind color input and hex box sync
  function syncColorInputs(pickerEl, textEl) {
    pickerEl.addEventListener('input', (e) => {
      textEl.value = e.target.value;
      updateQR();
    });
    textEl.addEventListener('change', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        pickerEl.value = val;
        updateQR();
      } else {
        textEl.value = pickerEl.value;
      }
    });
  }
  syncColorInputs(el.qrDotColor, el.qrDotColorText);
  syncColorInputs(el.qrDotGradStart, el.qrDotGradStartText);
  syncColorInputs(el.qrDotGradEnd, el.qrDotGradEndText);
  syncColorInputs(el.qrCornerColor, el.qrCornerColorText);
  syncColorInputs(el.qrCornerDotColor, el.qrCornerDotColorText);
  syncColorInputs(el.qrBgColor, el.qrBgColorText);
  syncColorInputs(el.cardTextColor, el.cardTextColorText);

  // Range Slider Value Label Sync
  function syncSliderVal(sliderEl, labelEl, postfix = '', isFloat = false) {
    sliderEl.addEventListener('input', (e) => {
      const val = isFloat ? parseFloat(e.target.value).toFixed(1) : e.target.value;
      labelEl.textContent = val;
      
      // Triggers live update based on active panels
      if (state.activeTab === 'poetry-card') {
        updatePoetryCard();
      } else {
        updateQR();
      }
    });
  }
  syncSliderVal(el.qrDotGradAngle, el.qrDotGradAngleVal);
  syncSliderVal(el.qrBgOpacity, el.qrBgOpacityVal);
  syncSliderVal(el.qrLogoSize, el.qrLogoSizeVal);
  syncSliderVal(el.qrLogoMargin, el.qrLogoMarginVal);
  syncSliderVal(el.exportSize, el.exportSizeVal);
  
  // Custom double value sync for resolution
  el.exportSize.addEventListener('input', (e) => {
    el.exportSizeVal2.textContent = e.target.value;
  });

  syncSliderVal(el.cardQrSize, el.cardQrSizeVal);
  syncSliderVal(el.cardFontSize, el.cardFontSizeVal, '', true);
  syncSliderVal(el.cardLetterSpacing, el.cardLetterSpacingVal, '', true);
  syncSliderVal(el.cardLineHeight, el.cardLineHeightVal, '', true);

  // --- Real-time Generation Options and Rendering ---

  // Build the encoded content data string for QR codes based on inputs
  function getQRData() {
    switch (state.activeDataType) {
      case 'url':
        return el.inputUrl.value.trim() || 'https://example.com';
      case 'text':
        return el.inputText.value || 'QR Studio Pro';
      case 'wifi':
        const ssid = el.wifiSsid.value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
        const pass = el.wifiPassword.value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
        const enc = el.wifiEncryption.value;
        if (enc === 'nopass') {
          return `WIFI:S:${ssid};T:nopass;;`;
        }
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      case 'vcard':
        const fn = el.vcardFn.value.trim() || 'John Doe';
        const org = el.vcardOrg.value.trim();
        const title = el.vcardTitle.value.trim();
        const tel = el.vcardTel.value.trim();
        const email = el.vcardEmail.value.trim();
        const url = el.vcardUrl.value.trim();
        const adr = el.vcardAdr.value.trim();
        
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${fn}`;
        if (org) vcard += `\nORG:${org}`;
        if (title) vcard += `\nTITLE:${title}`;
        if (tel) vcard += `\nTEL:${tel}`;
        if (email) vcard += `\nEMAIL:${email}`;
        if (url) vcard += `\nURL:${url}`;
        if (adr) vcard += `\nADR:;;${adr}`;
        vcard += `\nEND:VCARD`;
        return vcard;
      case 'email':
        const to = el.emailTo.value.trim();
        const subject = encodeURIComponent(el.emailSubject.value.trim());
        const body = encodeURIComponent(el.emailBody.value.trim());
        return `mailto:${to}?subject=${subject}&body=${body}`;
      case 'sms':
        const phone = el.smsPhone.value.trim();
        const msg = el.smsMessage.value.trim();
        return `SMSTO:${phone}:${msg}`;
      default:
        return 'https://example.com';
    }
  }

  // Compile options based on Form and Accordion controls
  function getQRStylingOptions(widthVal = 500, heightVal = 500) {
    const isGradient = document.querySelector('input[name="dot-color-type"]:checked').value === 'gradient';
    const dotColor = el.qrDotColor.value;
    
    // Background setup
    const bgOpacity = parseInt(el.qrBgOpacity.value) / 100;
    const rawBgColor = el.qrBgColor.value;
    
    // Convert hex bg to rgba for transparency support
    let bgColor = rawBgColor;
    if (bgOpacity < 1.0) {
      const r = parseInt(rawBgColor.slice(1, 3), 16);
      const g = parseInt(rawBgColor.slice(3, 5), 16);
      const b = parseInt(rawBgColor.slice(5, 7), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
    }

    const options = {
      width: widthVal,
      height: heightVal,
      type: "canvas",
      data: getQRData(),
      margin: parseInt(el.qrMargin.value) || 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: el.qrEcc.value
      },
      backgroundOptions: {
        color: bgColor
      },
      dotsOptions: {
        type: el.qrDotType.value
      },
      cornersSquareOptions: {
        type: el.qrCornerType.value,
        color: el.qrCornerColor.value
      },
      cornersDotOptions: {
        type: el.qrCornerDotType.value,
        color: el.qrCornerDotColor.value
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: parseInt(el.qrLogoMargin.value),
        imageSize: parseFloat(el.qrLogoSize.value) / 100,
        hideBackgroundDots: el.qrLogoClearBg.checked
      }
    };

    // Color or Gradient for Dots
    if (isGradient) {
      options.dotsOptions.gradient = {
        type: el.qrDotGradType.value,
        rotation: (parseInt(el.qrDotGradAngle.value) * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: el.qrDotGradStart.value },
          { offset: 1, color: el.qrDotGradEnd.value }
        ]
      };
    } else {
      options.dotsOptions.color = dotColor;
    }

    // Logo configuration
    if (selectedLogoPreset === 'custom' && state.customLogoDataUrl) {
      options.image = state.customLogoDataUrl;
    } else if (selectedLogoPreset !== 'none' && LOGO_SVG_PRESETS[selectedLogoPreset]) {
      options.image = getSvgDataUrl(LOGO_SVG_PRESETS[selectedLogoPreset]);
    } else {
      options.image = "";
    }

    return options;
  }

  // Re-generate and draw QR code on the preview area
  function updateQR() {
    if (!state.qrCodeInstance) return;
    const opts = getQRStylingOptions(500, 500);
    state.qrCodeInstance.update(opts);
  }

  // --- Attach QR Option change triggers ---
  const qrEventTriggers = [
    el.inputUrl, el.inputText, el.wifiSsid, el.wifiPassword, el.wifiEncryption,
    el.vcardFn, el.vcardOrg, el.vcardTitle, el.vcardTel, el.vcardEmail, el.vcardUrl, el.vcardAdr,
    el.emailTo, el.emailSubject, el.emailBody, el.smsPhone, el.smsMessage,
    el.qrDotType, el.qrCornerType, el.qrCornerDotType, el.qrEcc, el.qrMargin,
    el.qrLogoClearBg
  ];

  qrEventTriggers.forEach(element => {
    element.addEventListener('input', updateQR);
    element.addEventListener('change', updateQR);
  });

  // Listen to single/gradient radio toggle
  document.querySelectorAll('input[name="dot-color-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'gradient') {
        el.dotColorSingleWrap.classList.add('hidden');
        el.dotGradientWrap.classList.remove('hidden');
      } else {
        el.dotColorSingleWrap.classList.remove('hidden');
        el.dotGradientWrap.classList.add('hidden');
      }
      updateQR();
    });
  });

  // Gradient Type Selector (Linear Angle toggle)
  el.qrDotGradType.addEventListener('change', (e) => {
    if (e.target.value === 'radial') {
      el.dotGradAngleWrap.classList.add('hidden');
    } else {
      el.dotGradAngleWrap.classList.remove('hidden');
    }
    updateQR();
  });

  // --- Logo Overlay Custom Upload & Preset Toggles ---
  el.presetLogoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.presetLogoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const logo = btn.getAttribute('data-logo');
      selectedLogoPreset = logo;
      
      // If choosing pre-built preset, hide custom name tag
      if (logo !== 'custom') {
        el.logoPreviewFilename.classList.add('hidden');
      }
      
      updateQR();
    });
  });

  // Logo file drop uploader
  el.logoDropZone.addEventListener('click', () => el.logoFileInput.click());
  el.logoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadCustomLogo(file);
    }
  });

  // Drag and Drop Logo events
  el.logoDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.logoDropZone.style.borderColor = 'var(--accent-primary)';
  });
  el.logoDropZone.addEventListener('dragleave', () => {
    el.logoDropZone.style.borderColor = 'var(--border-color)';
  });
  el.logoDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    el.logoDropZone.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadCustomLogo(file);
    } else {
      showToast('只能上傳圖片檔案！', 'error');
    }
  });

  function loadCustomLogo(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      state.customLogoDataUrl = event.target.result;
      selectedLogoPreset = 'custom';
      
      // Reset preset active states
      el.presetLogoBtns.forEach(b => b.classList.remove('active'));
      
      // Display file tag
      el.logoPreviewFilename.querySelector('.name').textContent = file.name;
      el.logoPreviewFilename.classList.remove('hidden');
      
      updateQR();
      showToast('標誌圖標上傳成功！');
    };
    reader.readAsDataURL(file);
  }

  el.logoRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.customLogoDataUrl = null;
    selectedLogoPreset = 'none';
    el.logoPreviewFilename.classList.add('hidden');
    el.logoFileInput.value = '';
    
    // Set 'none' button active
    el.presetLogoBtns.forEach(b => {
      if (b.getAttribute('data-logo') === 'none') b.classList.add('active');
      else b.classList.remove('active');
    });
    
    updateQR();
    showToast('標誌圖標已清除');
  });

  // --- Exporting Single QR Code (PNG & SVG) ---
  el.btnDownloadPng.addEventListener('click', () => {
    const size = parseInt(el.exportSize.value);
    const downloadInstance = new QRCodeStyling(getQRStylingOptions(size, size));
    downloadInstance.download({
      name: `qr_studio_${Date.now()}`,
      extension: 'png'
    });
    showToast('二維碼 PNG 下載中...');
    saveToHistoryLog();
  });

  el.btnDownloadSvg.addEventListener('click', () => {
    const size = parseInt(el.exportSize.value);
    const downloadInstance = new QRCodeStyling(getQRStylingOptions(size, size));
    downloadInstance.download({
      name: `qr_studio_${Date.now()}`,
      extension: 'svg'
    });
    showToast('二維碼 SVG 下載中...');
    saveToHistoryLog();
  });

  // --- Poetry Card Designer Logic ---

  // Sample selector autofills
  el.btnSamplePoems.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.getAttribute('data-poem');
      const data = POETRY_SAMPLES[sampleKey];
      if (data) {
        el.poemTitle.value = data.title;
        el.poemAuthor.value = data.author;
        el.poemContent.value = data.content;
        updatePoetryCard();
        showToast(`已載入示範：《${data.title}》`);
      }
    });
  });

  // Layout parameters for Poetry Card
  el.cardRatioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      el.cardRatioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardRatio = btn.getAttribute('data-ratio');
      updatePoetryCard();
    });
  });

  el.cardBgPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      el.cardBgPresets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCardBgPreset = btn.getAttribute('data-bg');
      
      // Clear custom background file tag if choosing preset
      if (activeCardBgPreset !== 'custom') {
        el.cardBgPreviewFilename.classList.add('hidden');
      }
      
      updatePoetryCard();
    });
  });

  // Card background file uploader
  el.cardBgDropZone.addEventListener('click', () => el.cardBgFileInput.click());
  el.cardBgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadCardCustomBg(file);
    }
  });

  el.cardBgDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.cardBgDropZone.style.borderColor = 'var(--accent-primary)';
  });
  el.cardBgDropZone.addEventListener('dragleave', () => {
    el.cardBgDropZone.style.borderColor = 'var(--border-color)';
  });
  el.cardBgDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    el.cardBgDropZone.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadCardCustomBg(file);
    } else {
      showToast('只能上傳圖片檔案！', 'error');
    }
  });

  function loadCardCustomBg(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      state.cardBgDataUrl = event.target.result;
      activeCardBgPreset = 'custom';
      
      // Clear active presets
      el.cardBgPresets.forEach(b => b.classList.remove('active'));
      
      // Display file tag
      el.cardBgPreviewFilename.querySelector('.name').textContent = file.name;
      el.cardBgPreviewFilename.classList.remove('hidden');
      
      updatePoetryCard();
      showToast('背景圖片上傳成功！');
    };
    reader.readAsDataURL(file);
  }

  el.cardBgRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.cardBgDataUrl = null;
    activeCardBgPreset = 'ink-wash';
    el.cardBgPreviewFilename.classList.add('hidden');
    el.cardBgFileInput.value = '';
    
    // Set default preset active
    el.cardBgPresets.forEach(b => {
      if (b.getAttribute('data-bg') === 'ink-wash') b.classList.add('active');
      else b.classList.remove('active');
    });
    
    updatePoetryCard();
    showToast('背景已重置為水墨意境');
  });

  // Re-compose Poetry Card DOM elements
  function updatePoetryCard() {
    const card = el.cardRenderWrapper;
    
    // 1. Text contents
    const titleVal = el.poemTitle.value.trim() || '無題';
    const authorVal = el.poemAuthor.value.trim() || '佚名';
    const contentLines = el.poemContent.value.split('\n').filter(line => line.trim() !== '');
    
    el.cardTitleText.textContent = titleVal;
    el.cardAuthorText.textContent = authorVal ? `[${authorVal}]` : '';
    
    // Clear and rebuild body
    el.cardBodyContent.innerHTML = '';
    contentLines.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      el.cardBodyContent.appendChild(p);
    });

    // 2. Aspect Ratio & Dimension
    card.className = ''; // Reset classes
    if (activeCardRatio === 'square') {
      card.style.aspectRatio = '1/1';
      card.style.width = '380px';
    } else if (activeCardRatio === 'portrait') {
      card.style.aspectRatio = '9/16';
      card.style.width = '300px';
    } else if (activeCardRatio === 'landscape') {
      card.style.aspectRatio = '16/9';
      card.style.width = '420px';
    }

    // 3. Layout Style
    const layout = el.cardLayoutStyle.value;
    card.classList.add(`layout-${layout}`);

    // 4. Writing Mode
    const isVertical = el.cardWritingMode.checked;
    if (isVertical) {
      card.classList.add('writing-vertical');
    } else {
      card.classList.remove('writing-vertical');
    }

    // 5. Typography Customization
    card.style.fontFamily = el.cardFontFamily.value;
    card.style.color = el.cardTextColor.value;
    
    const fSize = el.cardFontSize.value;
    el.cardBodyContent.style.fontSize = `${fSize}rem`;
    el.cardTitleText.style.fontSize = `${parseFloat(fSize) * 1.2}rem`;
    
    el.cardBodyContent.style.letterSpacing = `${el.cardLetterSpacing.value}em`;
    el.cardBodyContent.style.lineHeight = el.cardLineHeight.value;

    // 6. Background Preset Style
    card.style.backgroundImage = 'none'; // reset custom
    if (activeCardBgPreset === 'custom' && state.cardBgDataUrl) {
      card.style.backgroundImage = `url(${state.cardBgDataUrl})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    } else {
      card.classList.add(`bg-${activeCardBgPreset}`);
    }

    // 7. QR Size & Style Injection in Card
    const cardQrSizePercent = parseInt(el.cardQrSize.value);
    
    // Apply styling to QR block
    if (layout === 'watermark') {
      el.cardQrSection.style.width = '100%';
      el.cardQrSection.style.height = '100%';
    } else {
      if (activeCardRatio === 'portrait') {
        el.cardQrSection.style.width = `${cardQrSizePercent * 1.5}%`;
      } else {
        el.cardQrSection.style.width = `${cardQrSizePercent}%`;
      }
      el.cardQrSection.style.height = 'auto';
    }

    // Generate styled QR Code for Card
    // (A separate smaller QR matching current styling parameters but fitted for card embed)
    // We override background options for card layout integration
    const baseQrOpts = getQRStylingOptions(300, 300);
    
    // In polaroid or light templates, QR needs to have transparent background to blend in nicely.
    // We force transparent QR background for card embed to prevent big white squares on styled canvas.
    baseQrOpts.backgroundOptions = { color: 'rgba(0,0,0,0)' };
    
    // If the card background is dark (曜石暗黑, 金石古風, 賽博脈絡), adjust QR dots color to be bright
    if (['minimal-dark', 'golden-calligraphy', 'cyber-grid'].includes(activeCardBgPreset)) {
      if (document.querySelector('input[name="dot-color-type"]:checked').value === 'single') {
        // If color was black/dark, override to card text color
        if (el.qrDotColor.value === '#000000' || el.qrDotColor.value === '#262626') {
          baseQrOpts.dotsOptions.color = '#ffffff';
        }
      }
    }

    const cardQrCode = new QRCodeStyling(baseQrOpts);
    el.cardQrPlaceholder.innerHTML = '';
    cardQrCode.append(el.cardQrPlaceholder);
  }

  // Forms triggers for card panel
  const cardEventTriggers = [
    el.poemTitle, el.poemAuthor, el.poemContent, el.cardLayoutStyle,
    el.cardWritingMode, el.cardFontFamily, el.cardFontSize, el.cardLetterSpacing,
    el.cardLineHeight, el.cardTextColor, el.cardQrSize
  ];
  cardEventTriggers.forEach(elem => {
    elem.addEventListener('input', updatePoetryCard);
    elem.addEventListener('change', updatePoetryCard);
  });

  // --- Export/Download Poetry Card as Image (html2canvas) ---
  el.btnDownloadCard.addEventListener('click', () => {
    showToast('正在轉譯高畫質卡片，請稍候...', 'info');
    
    const wrapper = el.cardRenderWrapper;
    
    // Temporarily upscale wrapper size for high resolution export
    const originalStyle = wrapper.getAttribute('style');
    const originalWidth = wrapper.offsetWidth;
    const originalHeight = wrapper.offsetHeight;
    
    // Scale up for high density output (2x scale)
    const exportScale = 2.5; 
    wrapper.style.transform = `scale(${exportScale})`;
    wrapper.style.transformOrigin = 'top left';
    
    const spacer = document.createElement('div');
    spacer.style.width = `${originalWidth * exportScale}px`;
    spacer.style.height = `${originalHeight * exportScale}px`;
    wrapper.parentElement.appendChild(spacer);
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    
    document.body.appendChild(wrapper);

    // Call html2canvas on upscaled DOM
    html2canvas(wrapper, {
      scale: 1, // Already upscaled inside DOM
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    }).then(canvas => {
      // Restore DOM state
      wrapper.removeAttribute('style');
      wrapper.setAttribute('style', originalStyle || '');
      const container = document.querySelector('.card-export-wrapper-container');
      container.innerHTML = '';
      container.appendChild(wrapper);
      spacer.remove();
      
      // Trigger download
      const link = document.createElement('a');
      link.download = `poetry_card_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showToast('藝術卡片導出成功！');
      saveToHistoryLog('Poetry Card', canvas.toDataURL('image/png'));
    }).catch(err => {
      console.error(err);
      showToast('卡片導出失敗，請重試。', 'error');
    });
  });

  // --- QR Code Scanner / Decoder ---
  let html5QrcodeScanner = null;

  // Tabs within scanning panel
  el.btnScannerCam.addEventListener('click', () => {
    el.btnScannerCam.classList.add('active');
    el.btnScannerFile.classList.remove('active');
    el.scannerCameraView.classList.add('active');
    el.scannerFileView.classList.remove('active');
    
    // Clear state
    resetScannerResults();
  });

  el.btnScannerFile.addEventListener('click', () => {
    el.btnScannerCam.classList.remove('active');
    el.btnScannerFile.classList.add('active');
    el.scannerCameraView.classList.remove('active');
    el.scannerFileView.classList.add('active');
    
    stopCameraScanner();
    resetScannerResults();
  });

  // Camera scanner control
  el.btnScannerToggle.addEventListener('click', () => {
    if (cameraScannerInstance) {
      stopCameraScanner();
    } else {
      startCameraScanner();
    }
  });

  function startCameraScanner() {
    el.scannerCameraView.classList.add('scanning');
    el.btnScannerToggle.innerHTML = '<i data-lucide="square"></i> 停止相機';
    lucide.createIcons();
    resetScannerResults();

    cameraScannerInstance = new Html5Qrcode("reader-camera-engine");
    cameraScannerInstance.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        }
      },
      (decodedText, decodedResult) => {
        // Success callback
        processScanResult(decodedText);
        stopCameraScanner();
        showToast('掃描解碼成功！');
      },
      (errorMessage) => {
        // Silent error logs (searching)
      }
    ).catch(err => {
      console.error(err);
      showToast('無法存取相機，請檢查瀏覽器權限。', 'error');
      stopCameraScanner();
    });
  }

  function stopCameraScanner() {
    el.scannerCameraView.classList.remove('scanning');
    el.btnScannerToggle.innerHTML = '<i data-lucide="play"></i> 啟動相機';
    lucide.createIcons();

    if (cameraScannerInstance) {
      cameraScannerInstance.stop().then(() => {
        cameraScannerInstance = null;
      }).catch(err => {
        console.error(err);
        cameraScannerInstance = null;
      });
    }
  }

  // File Uploader decoder
  el.scannerFileView.addEventListener('click', () => el.scanFileInput.click());
  el.scanFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      decodeFile(file);
    }
  });

  el.scannerFileView.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.scannerFileView.classList.add('dragover');
  });
  el.scannerFileView.addEventListener('dragleave', () => {
    el.scannerFileView.classList.remove('dragover');
  });
  el.scannerFileView.addEventListener('drop', (e) => {
    e.preventDefault();
    el.scannerFileView.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      decodeFile(file);
    }
  });

  function decodeFile(file) {
    el.scanFileSelectedName.textContent = `已選擇：${file.name}`;
    resetScannerResults();

    const fileScanner = new Html5Qrcode("reader-camera-engine");
    fileScanner.scanFile(file, true)
      .then(decodedText => {
        processScanResult(decodedText);
        showToast('檔案解碼成功！');
      })
      .catch(err => {
        console.error(err);
        showToast('無法在圖片中找到二維碼！', 'error');
      });
  }

  function resetScannerResults() {
    el.scannerNoResult.classList.remove('hidden');
    el.scannerResultContent.classList.add('hidden');
    
    // Hide actions
    el.scanActionUrl.classList.add('hidden');
    el.scanActionWifi.classList.add('hidden');
    el.scanActionVcard.classList.add('hidden');
    el.scanStructuredDetails.classList.add('hidden');
  }

  // Analyze decoded results and display them nicely
  function processScanResult(text) {
    el.scannerNoResult.classList.add('hidden');
    el.scannerResultContent.classList.remove('hidden');
    
    // Set timestamp
    const now = new Date();
    el.scannedTime.textContent = now.toLocaleTimeString();
    el.scannedTextValue.textContent = text;

    // Detect type
    let type = 'TEXT';
    
    // Reset actions
    el.scanActionUrl.classList.add('hidden');
    el.scanActionWifi.classList.add('hidden');
    el.scanActionVcard.classList.add('hidden');
    el.scanStructuredDetails.classList.add('hidden');

    if (/^https?:\/\//i.test(text)) {
      type = 'URL';
      el.scanActionUrl.href = text;
      el.scanActionUrl.classList.remove('hidden');
    } 
    else if (/^wifi:/i.test(text)) {
      type = 'Wi-Fi';
      el.scanActionWifi.classList.remove('hidden');
      
      // Parse SSID & Password
      const ssidMatch = text.match(/S:([^;]+)/);
      const passMatch = text.match(/P:([^;]+)/);
      const encMatch = text.match(/T:([^;]+)/);
      
      const ssid = ssidMatch ? ssidMatch[1] : 'Unknown';
      const pass = passMatch ? passMatch[1] : 'No Password';
      const enc = encMatch ? encMatch[1] : 'Open';
      
      el.scanStructuredDetails.innerHTML = `
        <div class="detail-row"><span class="lbl">網路名稱 (SSID)</span><span class="val">${ssid}</span></div>
        <div class="detail-row"><span class="lbl">安全性</span><span class="val">${enc}</span></div>
        <div class="detail-row"><span class="lbl">密碼</span><span class="val">${pass}</span></div>
      `;
      el.scanStructuredDetails.classList.remove('hidden');

      // Bind show pass prompt action
      el.scanActionWifi.onclick = () => {
        navigator.clipboard.writeText(pass);
        showToast(`Wi-Fi 密碼已複製：${pass}`);
      };
    } 
    else if (/^begin:vcard/i.test(text)) {
      type = 'vCard 名片';
      el.scanActionVcard.classList.remove('hidden');
      
      // Parse simple fields
      const fnMatch = text.match(/FN:([^\n]+)/);
      const orgMatch = text.match(/ORG:([^\n]+)/);
      const telMatch = text.match(/TEL:([^\n]+)/);
      const emailMatch = text.match(/EMAIL:([^\n]+)/);
      
      const fn = fnMatch ? fnMatch[1].trim() : 'Unknown';
      const org = orgMatch ? orgMatch[1].trim() : '';
      const tel = telMatch ? telMatch[1].trim() : '';
      const email = emailMatch ? emailMatch[1].trim() : '';

      let detailsHtml = `<div class="detail-row"><span class="lbl">聯絡人姓名</span><span class="val">${fn}</span></div>`;
      if (org) detailsHtml += `<div class="detail-row"><span class="lbl">公司名稱</span><span class="val">${org}</span></div>`;
      if (tel) detailsHtml += `<div class="detail-row"><span class="lbl">電話號碼</span><span class="val">${tel}</span></div>`;
      if (email) detailsHtml += `<div class="detail-row"><span class="lbl">電子郵件</span><span class="val">${email}</span></div>`;
      
      el.scanStructuredDetails.innerHTML = detailsHtml;
      el.scanStructuredDetails.classList.remove('hidden');

      // Bind download vCard action
      el.scanActionVcard.onclick = () => {
        const blob = new Blob([text], { type: 'text/vcard;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fn.replace(/\s+/g, '_')}_contact.vcf`;
        link.click();
        showToast('名片檔 .vcf 已下載！');
      };
    }
    else if (/^mailto:/i.test(text)) {
      type = 'Email';
    }
    else if (/^smsto:/i.test(text)) {
      type = 'SMS 簡訊';
    }

    el.scannedTypeBadge.textContent = type;
  }

  // Copy scan results
  el.scanActionCopy.addEventListener('click', () => {
    const text = el.scannedTextValue.textContent;
    navigator.clipboard.writeText(text);
    showToast('已複製解碼內容至剪貼簿！');
  });

  // --- Bulk QR Generator Engine ---

  // Source selector change
  document.querySelectorAll('input[name="bulk-source"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'csv') {
        el.bulkTextareaWrap.classList.add('hidden');
        el.bulkCsvWrap.classList.remove('hidden');
      } else {
        el.bulkTextareaWrap.classList.remove('hidden');
        el.bulkCsvWrap.classList.add('hidden');
      }
    });
  });

  // CSV Drag/Drop events
  el.bulkDropZone.addEventListener('click', () => el.bulkFileInput.click());
  el.bulkFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadBulkFile(file);
    }
  });

  el.bulkDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.bulkDropZone.style.borderColor = 'var(--accent-primary)';
  });
  el.bulkDropZone.addEventListener('dragleave', () => {
    el.bulkDropZone.style.borderColor = 'var(--border-color)';
  });
  el.bulkDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    el.bulkDropZone.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      loadBulkFile(file);
    } else {
      showToast('只能上傳 CSV 或 TXT 文字檔！', 'error');
    }
  });

  let loadedBulkLines = [];
  
  function loadBulkFile(file) {
    el.bulkFileNameInfo.querySelector('.name').textContent = file.name;
    el.bulkFileNameInfo.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Split lines and clean empty rows
      loadedBulkLines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      showToast(`成功讀入檔案，共 ${loadedBulkLines.length} 筆資料。`);
    };
    reader.readAsText(file);
  }

  el.bulkFileRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    loadedBulkLines = [];
    el.bulkFileNameInfo.classList.add('hidden');
    el.bulkFileInput.value = '';
    showToast('批次上傳檔案已清除');
  });

  // Execute batch generation
  el.btnBulkGenerate.addEventListener('click', async () => {
    const isTextarea = document.querySelector('input[name="bulk-source"]:checked').value === 'textarea';
    let records = [];

    if (isTextarea) {
      records = el.bulkLinesInput.value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } else {
      records = loadedBulkLines;
    }

    if (records.length === 0) {
      showToast('沒有任何資料需要生成！', 'warning');
      return;
    }

    // Initialize progress indicators
    el.bulkIdlePrompt.classList.add('hidden');
    el.bulkProgressActive.classList.remove('hidden');
    el.bulkPreviewListWrap.classList.add('hidden');
    el.bulkPreviewThumbs.innerHTML = '';

    const prefix = el.bulkNamePrefix.value.trim() || 'qrcode_';
    const ext = el.bulkImgFormat.value; // 'png' or 'svg'

    const zip = new JSZip();
    
    // We duplicate current styling params for rendering bulk canvas
    const baseOpts = getQRStylingOptions(600, 600);
    
    showToast(`批次生成開始：共 ${records.length} 筆...`, 'info');

    // Loop through rows
    for (let i = 0; i < records.length; i++) {
      const data = records[i];
      
      // Update progress bar
      const progressPercent = Math.round(((i + 1) / records.length) * 100);
      el.bulkProgressText.textContent = `正在生成第 ${i + 1} / ${records.length} 筆`;
      el.bulkProgressPercentage.textContent = `${progressPercent}%`;
      el.bulkProgressBar.style.width = `${progressPercent}%`;

      // Render QR code styling options
      const itemOpts = { ...baseOpts, data: data };
      const itemQR = new QRCodeStyling(itemOpts);

      // We append QR to a temporary container to extract raw canvas / SVG data
      const tempDiv = document.createElement('div');
      itemQR.append(tempDiv);

      // Wait a tiny frame for library rendering
      await new Promise(resolve => setTimeout(resolve, 80));

      const renderedCanvas = tempDiv.querySelector('canvas');
      const renderedSvg = tempDiv.querySelector('svg');

      if (ext === 'png' && renderedCanvas) {
        // Grab blob from canvas
        const blob = await new Promise(resolve => renderedCanvas.toBlob(resolve, 'image/png'));
        zip.file(`${prefix}${i + 1}.png`, blob);
      } 
      else if (ext === 'svg' && renderedSvg) {
        // Extract raw XML SVG source
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(renderedSvg);
        zip.file(`${prefix}${i + 1}.svg`, svgString);
      }

      // Add thumbnail previews for first 5 items
      if (i < 5) {
        el.bulkPreviewListWrap.classList.remove('hidden');
        const thumbCard = document.createElement('div');
        thumbCard.className = 'bulk-thumb-card';
        
        // Clone the canvas/svg for preview
        if (renderedCanvas) {
          const cloneCanvas = document.createElement('canvas');
          cloneCanvas.width = 100;
          cloneCanvas.height = 100;
          const ctx = cloneCanvas.getContext('2d');
          ctx.drawImage(renderedCanvas, 0, 0, 100, 100);
          thumbCard.appendChild(cloneCanvas);
        } else if (renderedSvg) {
          const tempWrap = document.createElement('div');
          tempWrap.innerHTML = renderedSvg.outerHTML;
          thumbCard.appendChild(tempWrap.firstElementChild);
        }

        const span = document.createElement('span');
        span.textContent = `${prefix}${i + 1}.${ext}`;
        thumbCard.appendChild(span);
        el.bulkPreviewThumbs.appendChild(thumbCard);
      }

      // Cleanup
      tempDiv.remove();
    }

    // Save and compile ZIP file
    showToast('正在壓缩與封裝壓縮檔...', 'info');
    const zipBlob = await zip.generateAsync({ type: "blob" });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = `${prefix}bulk_${Date.now()}.zip`;
    downloadLink.click();
    
    showToast('批量打包下載已啟動！', 'success');

    // Reset progress view back to complete state
    setTimeout(() => {
      el.bulkProgressActive.classList.add('hidden');
      el.bulkIdlePrompt.classList.remove('hidden');
    }, 5000);
  });

  // --- History & Custom Presets Manager ---

  // Load lists from Local Storage
  function loadLocalStorage() {
    try {
      const storedHistory = localStorage.getItem('qr_studio_history');
      state.history = storedHistory ? JSON.parse(storedHistory) : [];

      const storedPresets = localStorage.getItem('qr_studio_presets');
      state.presets = storedPresets ? JSON.parse(storedPresets) : [...DEFAULT_PRESETS];
    } catch (e) {
      console.error(e);
      state.history = [];
      state.presets = [...DEFAULT_PRESETS];
    }
  }

  // Save history log
  function saveToHistoryLog(typeOverride = null, imageThumbnail = null) {
    let type = typeOverride;
    if (!type) {
      type = state.activeDataType.toUpperCase();
    }

    let rawVal = getQRData();
    if (typeOverride === 'Poetry Card') {
      rawVal = el.poemTitle.value.trim() || '無題詩歌卡片';
    }

    // Get mini preview thumbnail (render standard sized QR image if canvas)
    let thumb = imageThumbnail;
    if (!thumb) {
      const canvas = el.qrRenderTarget.querySelector('canvas');
      if (canvas) {
        thumb = canvas.toDataURL('image/png');
      }
    }

    const historyItem = {
      id: `history-${Date.now()}`,
      type: type,
      timestamp: new Date().toLocaleString(),
      value: rawVal,
      thumb: thumb,
      // Save current parameters for future reload
      settings: getQRStylingOptions()
    };

    state.history.unshift(historyItem);
    // Limit history log to 50 items
    if (state.history.length > 50) state.history.pop();
    
    localStorage.setItem('qr_studio_history', JSON.stringify(state.history));
  }

  // Draw History elements in panel
  function renderHistoryList() {
    if (state.history.length === 0) {
      el.historyEmpty.classList.remove('hidden');
      el.historyList.classList.add('hidden');
      el.btnClearHistory.style.display = 'none';
      return;
    }

    el.historyEmpty.classList.add('hidden');
    el.historyList.classList.remove('hidden');
    el.btnClearHistory.style.display = 'flex';
    
    el.historyList.innerHTML = '';
    
    state.history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      
      const badgeClass = item.type.toLowerCase().split(' ')[0];
      
      div.innerHTML = `
        <div class="history-item-preview-box">
          <img src="${item.thumb || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ccc%22 stroke-width=%222%22><rect width=%2218%22 height=%2218%22 x=%223%22 y=%223%22 rx=%222%22></rect></svg>'}" alt="QR">
        </div>
        <div class="history-item-details">
          <div class="history-item-meta">
            <span class="history-item-badge ${badgeClass}">${item.type}</span>
            <span class="history-item-date">${item.timestamp}</span>
          </div>
          <div class="history-item-content" title="${item.value}">${item.value}</div>
        </div>
        <div class="history-item-actions">
          <button class="btn-icon btn-load-history" data-id="${item.id}" title="載入此設計與內容"><i data-lucide="refresh-cw"></i></button>
          <button class="btn-icon btn-delete-history" data-id="${item.id}" title="刪除此記錄"><i data-lucide="trash"></i></button>
        </div>
      `;

      // Bind Load History click
      div.querySelector('.btn-load-history').addEventListener('click', (e) => {
        e.stopPropagation();
        loadHistoryItem(item);
      });

      // Bind Delete History click
      div.querySelector('.btn-delete-history').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
      });

      el.historyList.appendChild(div);
    });

    lucide.createIcons();
  }

  function loadHistoryItem(item) {
    // If it's a poetry card history item, switch to card tab
    if (item.type === 'Poetry Card') {
      showToast('此記錄為詩歌卡片，請於詩歌卡片設計分頁檢視！', 'warning');
      return;
    }

    // Set input tab active
    const lowerType = item.type.toLowerCase();
    const matchTab = Array.from(el.typeTabs).find(t => t.getAttribute('data-type') === lowerType);
    if (matchTab) {
      matchTab.click();
    }

    // Load value back into specific inputs
    if (lowerType === 'url') el.inputUrl.value = item.value;
    else if (lowerType === 'text') el.inputText.value = item.value;
    // (Other structures are kept inside raw settings if applicable)
    
    // Apply styling settings
    if (item.settings) {
      applyStylingState(item.settings);
    }
    
    showToast('已載入該歷史記錄之內容與樣式樣板！');
    
    // Switch tab to Designer
    document.querySelector('[data-target="qr-designer"]').click();
  }

  function deleteHistoryItem(id) {
    state.history = state.history.filter(i => i.id !== id);
    localStorage.setItem('qr_studio_history', JSON.stringify(state.history));
    renderHistoryList();
    showToast('已刪除該筆歷史記錄');
  }

  el.btnClearHistory.addEventListener('click', () => {
    if (confirm('確定要清空所有的歷史生成記錄嗎？這項動作無法還原。')) {
      state.history = [];
      localStorage.setItem('qr_studio_history', JSON.stringify(state.history));
      renderHistoryList();
      showToast('歷史記錄已全數清空！');
    }
  });

  // Save current options state as custom styling preset
  el.btnSavePreset.addEventListener('click', () => {
    const presetName = prompt('請輸入此風格預設樣板的名稱：', `自訂風格_${Date.now().toString().slice(-6)}`);
    if (!presetName) return;

    // Grab current variables
    const currentSettings = {
      dotType: el.qrDotType.value,
      dotColorType: document.querySelector('input[name="dot-color-type"]:checked').value,
      dotColor: el.qrDotColor.value,
      dotGradStart: el.qrDotGradStart.value,
      dotGradEnd: el.qrDotGradEnd.value,
      dotGradType: el.qrDotGradType.value,
      dotGradAngle: parseInt(el.qrDotGradAngle.value),
      cornerType: el.qrCornerType.value,
      cornerColor: el.qrCornerColor.value,
      cornerDotType: el.qrCornerDotType.value,
      cornerDotColor: el.qrCornerDotColor.value,
      bgColor: el.qrBgColor.value,
      bgOpacity: parseInt(el.qrBgOpacity.value),
      logoPreset: selectedLogoPreset,
      logoSize: parseInt(el.qrLogoSize.value),
      logoMargin: parseInt(el.qrLogoMargin.value),
      logoClearBg: el.qrLogoClearBg.checked,
      ecc: el.qrEcc.value,
      margin: parseInt(el.qrMargin.value)
    };

    const newPreset = {
      id: `preset-custom-${Date.now()}`,
      name: presetName,
      settings: currentSettings
    };

    state.presets.push(newPreset);
    localStorage.setItem('qr_studio_presets', JSON.stringify(state.presets));
    showToast(`風格樣板「${presetName}」儲存成功！`);
  });

  // Save manually to history
  el.btnSaveHistory.addEventListener('click', () => {
    saveToHistoryLog();
    showToast('當前設計已手動儲存至歷史記錄！');
  });

  // Render presets
  function renderPresetsGrid() {
    el.presetsGrid.innerHTML = '';
    
    // Filter out built-in presets + custom saved presets
    if (state.presets.length === 0) {
      el.presetsEmpty.classList.remove('hidden');
      return;
    }
    
    el.presetsEmpty.classList.add('hidden');

    state.presets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      
      const s = p.settings;
      const isCustom = p.id.startsWith('preset-custom');
      
      // Collect styling color preview dots
      const c1 = s.dotColorType === 'gradient' ? s.dotGradStart : s.dotColor;
      const c2 = s.dotColorType === 'gradient' ? s.dotGradEnd : s.dotColor;
      const bg = s.bgColor;
      
      card.innerHTML = `
        <div class="preset-card-header">
          <span class="preset-card-title">${p.name}</span>
          ${isCustom ? `<button class="btn-text-danger btn-delete-preset" data-id="${p.id}" title="刪除預設"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>` : `<span class="badge-system" style="font-size:0.6rem;opacity:0.6;">系統</span>`}
        </div>
        <div class="preset-card-preview">
          <div class="preset-colors-row">
            <div class="preset-color-dot" style="background-color: ${c1};" title="主色"></div>
            <div class="preset-color-dot" style="background-color: ${c2};" title="漸層/副色"></div>
            <div class="preset-color-dot" style="background-color: ${bg};" title="背景色"></div>
          </div>
        </div>
      `;

      // Apply preset settings click handler
      card.addEventListener('click', () => {
        applyStylingState(s);
        showToast(`風格樣板「${p.name}」已套用！`);
        // Switch back to designer tab
        document.querySelector('[data-target="qr-designer"]').click();
      });

      // Bind delete custom preset click
      if (isCustom) {
        card.querySelector('.btn-delete-preset').addEventListener('click', (e) => {
          e.stopPropagation();
          deletePreset(p.id);
        });
      }

      el.presetsGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  function deletePreset(id) {
    state.presets = state.presets.filter(p => p.id !== id);
    localStorage.setItem('qr_studio_presets', JSON.stringify(state.presets));
    renderPresetsGrid();
    showToast('風格樣板已刪除');
  }

  // Load styling options object properties back to the inputs state
  function applyStylingState(s) {
    if (!s) return;
    
    // Dot Type
    if (s.dotType) el.qrDotType.value = s.dotType;
    
    // Colors
    if (s.dotColorType) {
      document.querySelector(`input[name="dot-color-type"][value="${s.dotColorType}"]`).checked = true;
      if (s.dotColorType === 'gradient') {
        el.dotColorSingleWrap.classList.add('hidden');
        el.dotGradientWrap.classList.remove('hidden');
      } else {
        el.dotColorSingleWrap.classList.remove('hidden');
        el.dotGradientWrap.classList.add('hidden');
      }
    }
    
    if (s.dotColor) {
      el.qrDotColor.value = s.dotColor;
      el.qrDotColorText.value = s.dotColor;
    }
    if (s.dotGradStart) {
      el.qrDotGradStart.value = s.dotGradStart;
      el.qrDotGradStartText.value = s.dotGradStart;
    }
    if (s.dotGradEnd) {
      el.qrDotGradEnd.value = s.dotGradEnd;
      el.qrDotGradEndText.value = s.dotGradEnd;
    }
    if (s.dotGradType) el.qrDotGradType.value = s.dotGradType;
    if (s.dotGradAngle !== undefined) {
      el.qrDotGradAngle.value = s.dotGradAngle;
      el.qrDotGradAngleVal.textContent = s.dotGradAngle;
      if (s.dotGradType === 'radial') el.dotGradAngleWrap.classList.add('hidden');
      else el.dotGradAngleWrap.classList.remove('hidden');
    }

    // Corner Square (Outer Eye Frame)
    if (s.cornerType) el.qrCornerType.value = s.cornerType;
    if (s.cornerColor) {
      el.qrCornerColor.value = s.cornerColor;
      el.qrCornerColorText.value = s.cornerColor;
    }

    // Corner Dot (Inner Eye Ball)
    if (s.cornerDotType) el.qrCornerDotType.value = s.cornerDotType;
    if (s.cornerDotColor) {
      el.qrCornerDotColor.value = s.cornerDotColor;
      el.qrCornerDotColorText.value = s.cornerDotColor;
    }

    // Background
    if (s.bgColor) {
      el.qrBgColor.value = s.bgColor;
      el.qrBgColorText.value = s.bgColor;
    }
    if (s.bgOpacity !== undefined) {
      el.qrBgOpacity.value = s.bgOpacity;
      el.qrBgOpacityVal.textContent = s.bgOpacity;
    }

    // Logo Overlay settings
    if (s.logoPreset) {
      selectedLogoPreset = s.logoPreset;
      el.presetLogoBtns.forEach(btn => {
        if (btn.getAttribute('data-logo') === s.logoPreset) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      el.logoPreviewFilename.classList.add('hidden');
    }
    if (s.logoSize) {
      el.qrLogoSize.value = s.logoSize;
      el.qrLogoSizeVal.textContent = s.logoSize;
    }
    if (s.logoMargin) {
      el.qrLogoMargin.value = s.logoMargin;
      el.qrLogoMarginVal.textContent = s.logoMargin;
    }
    if (s.logoClearBg !== undefined) {
      el.qrLogoClearBg.checked = s.logoClearBg;
    }

    // Advanced settings
    if (s.ecc) el.qrEcc.value = s.ecc;
    if (s.margin !== undefined) el.qrMargin.value = s.margin;

    // Refresh canvas rendering
    updateQR();
  }

  // --- Bootloader / Initialization sequence ---
  initTheme();
  initQRCode();
  loadLocalStorage();
  
  // Set initial poem fields and card previews
  el.poemTitle.value = POETRY_SAMPLES.jingyesi.title;
  el.poemAuthor.value = POETRY_SAMPLES.jingyesi.author;
  el.poemContent.value = POETRY_SAMPLES.jingyesi.content;
  updatePoetryCard();
  
  // Create icons
  lucide.createIcons();
});
