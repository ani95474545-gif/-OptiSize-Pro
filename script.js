class ImageToPDFConverter {
    constructor() {
        this.images = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const clearBtn = document.getElementById('clearBtn');
        const convertBtn = document.getElementById('convertBtn');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Browse button click
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            this.clearAllImages();
        });

        // Convert button
        convertBtn.addEventListener('click', () => {
            this.convertToPDF();
        });
    }

    handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            this.showError('Please select valid image files (JPEG, PNG, etc.)');
            return;
        }

        imageFiles.forEach(file => {
            this.addImage(file);
        });
    }

    addImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.images.push({
                file: file,
                data: imageData
            });
            this.updatePreview();
            this.updateUI();
        };

        reader.onerror = () => {
            this.showError('Error reading file: ' + file.name);
        };

        reader.readAsDataURL(file);
    }

    removeImage(index) {
        this.images.splice(index, 1);
        this.updatePreview();
        this.updateUI();
    }

    updatePreview() {
        const previewContainer = document.getElementById('previewContainer');
        const imageCount = document.getElementById('imageCount');
        
        imageCount.textContent = this.images.length;

        if (this.images.length === 0) {
            previewContainer.innerHTML = '<p class="no-images">No images selected</p>';
            return;
        }

        previewContainer.innerHTML = this.images.map((image, index) => `
            <div class="preview-item">
                <img src="${image.data}" alt="Preview ${index + 1}">
                <button class="remove-btn" onclick="converter.removeImage(${index})">×</button>
            </div>
        `).join('');
    }

    updateUI() {
        const clearBtn = document.getElementById('clearBtn');
        const convertBtn = document.getElementById('convertBtn');
        const hasImages = this.images.length > 0;

        clearBtn.disabled = !hasImages;
        convertBtn.disabled = !hasImages;
    }

    clearAllImages() {
        this.images = [];
        this.updatePreview();
        this.updateUI();
        this.hideResult();
        this.hideError();
    }

    async convertToPDF() {
        if (this.images.length === 0) {
            this.showError('Please add at least one image');
            return;
        }

        this.showProgress();
        this.hideResult();
        this.hideError();

        try {
            const pageSize = document.getElementById('pageSize').value;
            const orientation = document.getElementById('orientation').value;

            const requestData = {
                images: this.images.map(img => img.data),
                options: {
                    pageSize: pageSize,
                    orientation: orientation
                }
            };

            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Conversion failed');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        } finally {
            this.hideProgress();
        }
    }

    showProgress() {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        
        progressContainer.style.display = 'block';
        
        // Animate progress bar
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            } else {
                width += 5;
                progressFill.style.width = width + '%';
            }
        }, 100);
    }

    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        
        progressFill.style.width = '100%';
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
        }, 500);
    }

    showResult(result) {
        const resultDiv = document.getElementById('result');
        const downloadLink = document.getElementById('downloadLink');
        
        downloadLink.href = result.pdf_url;
        downloadLink.textContent = `Download ${result.filename}`;
        resultDiv.style.display = 'block';
        
        // Auto download
        setTimeout(() => {
            window.location.href = result.pdf_url;
        }, 1000);
    }

    hideResult() {
        document.getElementById('result').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Initialize the converter when the page loads
let converter;
document.addEventListener('DOMContentLoaded', () => {
    converter = new ImageToPDFConverter();
});
