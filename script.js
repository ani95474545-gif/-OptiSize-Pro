// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const browseButton = document.getElementById('browseButton');
const pasteButton = document.getElementById('pasteButton');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const imageGrid = document.getElementById('imageGrid');
const settingsPanel = document.getElementById('settingsPanel');
const previewSection = document.getElementById('previewSection');
const downloadSection = document.getElementById('downloadSection');
const selectionInfo = document.getElementById('selectionInfo');

// Settings Tab Elements
const tabs = document.querySelectorAll('.tab');
const settingsContents = document.querySelectorAll('.settings-content');

// Form Elements
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const unitSelect = document.getElementById('unitSelect');
const aspectRatio = document.getElementById('aspectRatio');
const resizeMode = document.getElementById('resizeMode');
const presetSelect = document.getElementById('presetSelect');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const algorithmSelect = document.getElementById('algorithmSelect');
const targetSize = document.getElementById('targetSize');
const sizeUnit = document.getElementById('sizeUnit');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('formatSelect');
const transparencyGroup = document.getElementById('transparencyGroup');
const preserveTransparency = document.getElementById('preserveTransparency');
const backgroundColorGroup = document.getElementById('backgroundColorGroup');
const backgroundColor = document.getElementById('backgroundColor');
const backgroundHex = document.getElementById('backgroundHex');
const preserveMetadata = document.getElementById('preserveMetadata');

// Preview Elements
const beforePreview = document.getElementById('beforePreview');
const afterPreview = document.getElementById('afterPreview');
const beforeDimensions = document.getElementById('beforeDimensions');
const beforeSize = document.getElementById('beforeSize');
const afterDimensions = document.getElementById('afterDimensions');
const afterSize = document.getElementById('afterSize');
const comparisonSlider = document.getElementById('comparisonSlider');
const beforeComparison = document.getElementById('beforeComparison');
const afterComparison = document.getElementById('afterComparison');
const sizeReduction = document.getElementById('sizeReduction');
const totalReduction = document.getElementById('totalReduction');

// Action Buttons
const applySettings = document.getElementById('applySettings');
const applyAll = document.getElementById('applyAll');
const resetSettings = document.getElementById('resetSettings');
const downloadAll = document.getElementById('downloadAll');
const downloadSelected = document.getElementById('downloadSelected');

// Transformation Buttons
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const flipHorizontal = document.getElementById('flipHorizontal');
const flipVertical = document.getElementById('flipVertical');

// State Management
let uploadedImages = [];
let selectedImages = [];
let currentSettings = {
    width: null,
    height: null,
    unit: 'px',
    maintainAspectRatio: true,
    resizeMode: 'fit',
    preset: 'custom',
    scale: 100,
    algorithm: 'bicubic',
    targetFileSize: null,
    targetUnit: 'KB',
    quality: 85,
    format: 'jpg',
    preserveTransparency: true,
    backgroundColor: '#ffffff',
    preserveMetadata: false,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCurrentSettings();
    
    // Check if the browser supports the features we need
    if (!checkBrowserSupport()) {
        showBrowserWarning();
    }
});

function initializeEventListeners() {
    // File upload events
    browseButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    pasteButton.addEventListener('click', handlePaste);

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Settings form interactions
    widthInput.addEventListener('input', handleDimensionChange);
    heightInput.addEventListener('input', handleDimensionChange);
    aspectRatio.addEventListener('change', updateAspectRatioLock);
    presetSelect.addEventListener('change', handlePresetChange);
    scaleSlider.addEventListener('input', updateScaleValue);
    qualitySlider.addEventListener('input', updateQualityValue);
    formatSelect.addEventListener('change', updateFormatOptions);
    preserveTransparency.addEventListener('change', updateTransparencyOptions);
    backgroundColor.addEventListener('input', updateBackgroundColor);
    backgroundHex.addEventListener('input', updateBackgroundHex);

    // Action buttons
    applySettings.addEventListener('click', applySettingsToSelected);
    applyAll.addEventListener('click', applySettingsToAll);
    resetSettings.addEventListener('click', resetAllSettings);
    downloadAll.addEventListener('click', downloadAllImages);
    downloadSelected.addEventListener('click', downloadSelectedImages);

    // Transformation buttons
    rotateLeft.addEventListener('click', () => rotateImage(-90));
    rotateRight.addEventListener('click', () => rotateImage(90));
    flipHorizontal.addEventListener('click', () => flipImage('horizontal'));
    flipVertical.addEventListener('click', () => flipImage('vertical'));
}

function checkBrowserSupport() {
    return (
        'FileReader' in window &&
        'Blob' in window &&
        'URL' in window &&
        'createObjectURL' in URL &&
        'revokeObjectURL' in URL
    );
}

function showBrowserWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
        padding: 12px 16px;
        border-radius: 8px;
        margin: 16px 0;
        text-align: center;
    `;
    warning.innerHTML = `
        <strong>Browser Compatibility Notice:</strong> 
        Some features may not work properly in your browser. 
        For the best experience, please use Chrome, Firefox, or Edge.
    `;
    document.querySelector('.upload-section').prepend(warning);
}

// File Handling Functions
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
    fileInput.value = ''; // Reset file input
}

function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    processFiles(files);
}

function handlePaste() {
    if (!navigator.clipboard) {
        alert('Clipboard API not supported in your browser. Please use the file upload option.');
        return;
    }

    navigator.clipboard.read().then(clipboardItems => {
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    clipboardItem.getType(type).then(blob => {
                        const file = new File([blob], 'pasted-image.png', { type: type });
                        processFiles([file]);
                    });
                    return;
                }
            }
        }
        alert('No image found in clipboard. Please copy an image first.');
    }).catch(err => {
        console.error('Failed to read clipboard:', err);
        alert('Unable to access clipboard. Please check browser permissions.');
    });
}

function processFiles(files) {
    if (files.length === 0) return;
    
    // Filter only image files
    const imageFiles = Array.from(files).filter(file => file.type.match('image.*'));
    
    if (imageFiles.length === 0) {
        alert('Please select image files only (JPG, PNG, WEBP, GIF, etc.)');
        return;
    }
    
    // Check if we're exceeding the limit
    if (uploadedImages.length + imageFiles.length > 50) {
        alert('Maximum 50 images allowed per session. Please remove some images or split your upload.');
        return;
    }
    
    // Show progress
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = 'Processing: 0%';
    
    let processed = 0;
    
    imageFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const imageData = {
                    id: generateId(),
                    name: file.name,
                    originalFile: file,
                    originalSrc: e.target.result,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    originalSize: formatFileSize(file.size),
                    originalSizeBytes: file.size,
                    currentSrc: e.target.result,
                    currentWidth: img.width,
                    currentHeight: img.height,
                    currentSize: formatFileSize(file.size),
                    currentSizeBytes: file.size,
                    settings: {...currentSettings},
                    canvas: null,
                    processed: false
                };
                
                uploadedImages.push(imageData);
                processed++;
                
                // Update progress
                const progress = (processed / imageFiles.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Processing: ${Math.round(progress)}%`;
                
                // If all files processed, update UI
                if (processed === imageFiles.length) {
                    setTimeout(() => {
                        progressContainer.classList.add('hidden');
                        updateImageGrid();
                        settingsPanel.classList.remove('hidden');
                        previewSection.classList.remove('hidden');
                        downloadSection.classList.remove('hidden');
                        updateSelectionInfo();
                    }, 500);
                }
            };
            img.onerror = function() {
                processed++;
                alert(`Failed to load image: ${file.name}`);
                
                if (processed === imageFiles.length) {
                    progressContainer.classList.add('hidden');
                }
            };
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            processed++;
            alert(`Failed to read file: ${file.name}`);
            
            if (processed === imageFiles.length) {
                progressContainer.classList.add('hidden');
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// UI Update Functions
function updateImageGrid() {
    imageGrid.innerHTML = '';
    imageGrid.classList.remove('hidden');
    
    if (uploadedImages.length === 0) {
        imageGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <p>No images uploaded yet. Drag and drop images above to get started.</p>
            </div>
        `;
        return;
    }
    
    uploadedImages.forEach(image => {
        const isSelected = selectedImages.includes(image.id);
        
        const imageCard = document.createElement('div');
        imageCard.className = `image-card ${isSelected ? 'selected' : ''}`;
        imageCard.setAttribute('data-id', image.id);
        
        imageCard.innerHTML = `
            <div class="image-preview">
                <img src="${image.currentSrc}" alt="${image.name}" loading="lazy">
            </div>
            <div class="image-info">
                <h3 title="${image.name}">${image.name}</h3>
                <div class="image-details">
                    <span>${image.currentWidth} × ${image.currentHeight}</span>
                    <span>${image.currentSize}</span>
                </div>
                <div class="image-actions">
                    <button class="select-btn ${isSelected ? 'selected' : ''}" data-id="${image.id}">
                        ${isSelected ? '✓ Selected' : 'Select'}
                    </button>
                    <button class="preview-btn" data-id="${image.id}">Preview</button>
                </div>
            </div>
        `;
        
        imageGrid.appendChild(imageCard);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            toggleImageSelection(id);
        });
    });
    
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            showPreview(id);
        });
    });
}

function toggleImageSelection(id) {
    const index = selectedImages.indexOf(id);
    
    if (index === -1) {
        selectedImages.push(id);
    } else {
        selectedImages.splice(index, 1);
    }
    
    updateImageGrid();
    updateSelectionInfo();
}

function updateSelectionInfo() {
    if (selectedImages.length === 0) {
        selectionInfo.textContent = 'No images selected';
        selectionInfo.style.color = '';
    } else {
        selectionInfo.textContent = `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`;
        selectionInfo.style.color = 'var(--primary)';
    }
}

function switchTab(tabId) {
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Update active content
    settingsContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}Tab`) {
            content.classList.add('active');
        }
    });
}

// Settings Management Functions
function handleDimensionChange() {
    if (aspectRatio.checked && currentSettings.maintainAspectRatio) {
        // Maintain aspect ratio
        if (this === widthInput && widthInput.value) {
            const ratio = getSelectedImageAspectRatio();
            if (ratio) {
                heightInput.value = Math.round(widthInput.value / ratio);
            }
        } else if (this === heightInput && heightInput.value) {
            const ratio = getSelectedImageAspectRatio();
            if (ratio) {
                widthInput.value = Math.round(heightInput.value * ratio);
            }
        }
    }
    
    updateCurrentSettings();
}

function getSelectedImageAspectRatio() {
    if (selectedImages.length === 0) return null;
    
    const image = uploadedImages.find(img => img.id === selectedImages[0]);
    if (!image) return null;
    
    return image.originalWidth / image.originalHeight;
}

function updateAspectRatioLock() {
    currentSettings.maintainAspectRatio = aspectRatio.checked;
    updateCurrentSettings();
}

function handlePresetChange() {
    const preset = presetSelect.value;
    
    switch(preset) {
        case 'web':
            widthInput.value = 1920;
            heightInput.value = 1080;
            break;
        case 'social':
            widthInput.value = 1080;
            heightInput.value = 1080;
            break;
        case 'thumbnail':
            widthInput.value = 300;
            heightInput.value = 300;
            break;
        case 'print':
            widthInput.value = 2480; // A4 at 300 DPI
            heightInput.value = 3508;
            break;
    }
    
    if (preset !== 'custom') {
        unitSelect.value = 'px';
        aspectRatio.checked = false;
        currentSettings.maintainAspectRatio = false;
    }
    
    updateCurrentSettings();
}

function updateScaleValue() {
    scaleValue.textContent = `${scaleSlider.value}%`;
    updateCurrentSettings();
}

function updateQualityValue() {
    qualityValue.textContent = `${qualitySlider.value}%`;
    updateCurrentSettings();
}

function updateFormatOptions() {
    const format = formatSelect.value;
    
    // Show/hide transparency options for formats that support it
    if (format === 'png' || format === 'gif') {
        transparencyGroup.classList.remove('hidden');
    } else {
        transparencyGroup.classList.add('hidden');
    }
    
    updateCurrentSettings();
}

function updateTransparencyOptions() {
    if (preserveTransparency.checked || formatSelect.value !== 'png') {
        backgroundColorGroup.classList.add('hidden');
    } else {
        backgroundColorGroup.classList.remove('hidden');
    }
    
    updateCurrentSettings();
}

function updateBackgroundColor() {
    backgroundHex.value = backgroundColor.value;
    updateCurrentSettings();
}

function updateBackgroundHex() {
    // Validate hex color
    const hex = backgroundHex.value;
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
        backgroundColor.value = hex;
        updateCurrentSettings();
    }
}

function updateCurrentSettings() {
    currentSettings = {
        width: widthInput.value ? parseInt(widthInput.value) : null,
        height: heightInput.value ? parseInt(heightInput.value) : null,
        unit: unitSelect.value,
        maintainAspectRatio: aspectRatio.checked,
        resizeMode: resizeMode.value,
        preset: presetSelect.value,
        scale: parseInt(scaleSlider.value),
        algorithm: algorithmSelect.value,
        targetFileSize: targetSize.value ? parseInt(targetSize.value) : null,
        targetUnit: sizeUnit.value,
        quality: parseInt(qualitySlider.value),
        format: formatSelect.value,
        preserveTransparency: preserveTransparency.checked,
        backgroundColor: backgroundColor.value,
        preserveMetadata: preserveMetadata.checked,
        rotation: currentSettings.rotation,
        flipHorizontal: currentSettings.flipHorizontal,
        flipVertical: currentSettings.flipVertical
    };
}

// Image Processing Functions
function applySettingsToSelected() {
    if (selectedImages.length === 0) {
        alert('Please select at least one image to apply settings.');
        return;
    }
    
    // Show processing indicator
    applySettings.disabled = true;
    applySettings.innerHTML = '<span class="btn-icon">⏳</span> Processing...';
    
    // Process each selected image
    let processed = 0;
    
    selectedImages.forEach(id => {
        const image = uploadedImages.find(img => img.id === id);
        if (!image) {
            processed++;
            return;
        }
        
        processImage(image).then(processedImage => {
            // Update the image data
            Object.assign(image, processedImage);
            processed++;
         
