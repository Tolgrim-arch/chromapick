document.addEventListener('DOMContentLoaded', () => {
    const uploadSection = document.getElementById('upload-section');
    const workspace = document.getElementById('workspace');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const canvas = document.getElementById('image-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const resetBtn = document.getElementById('reset-btn');
    
    const colorPreview = document.getElementById('current-color-preview');
    const hexInput = document.getElementById('hex-value');
    const rgbInput = document.getElementById('rgb-value');
    const copyBtns = document.querySelectorAll('.copy-btn');
    const paletteContainer = document.getElementById('palette-container');
    
    const colorCountInput = document.getElementById('color-count');
    const colorCountDisplay = document.getElementById('color-count-display');

    let currentImage = null;

    // --- File Handling ---

    dropZone.addEventListener('click', () => fileInput.click());

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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona una imagen válida.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                setupWorkspace();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function setupWorkspace() {
        uploadSection.style.display = 'none';
        workspace.style.display = 'flex';
        
        // Setup canvas size based on image and container, but keeping original resolution for accurate picking
        // For visual, we use CSS object-fit or we can size the canvas appropriately.
        // Let's set canvas internal resolution to the image's original resolution
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.drawImage(currentImage, 0, 0);

        extractPalette();
    }

    resetBtn.addEventListener('click', () => {
        workspace.style.display = 'none';
        uploadSection.style.display = 'flex';
        fileInput.value = '';
        currentImage = null;
        colorPreview.style.backgroundColor = 'transparent';
        hexInput.value = '';
        rgbInput.value = '';
        paletteContainer.innerHTML = '';
    });

    // --- Color Picking ---

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Calculate the actual scale because canvas might be scaled down via CSS max-width/max-height
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        updateCurrentColor(pixel[0], pixel[1], pixel[2]);
    });

    // Mobile touch support
    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const touch = e.touches[0];

        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        updateCurrentColor(pixel[0], pixel[1], pixel[2]);
    });

    function updateCurrentColor(r, g, b) {
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hex = rgbToHex(r, g, b);
        
        colorPreview.style.backgroundColor = rgb;
        hexInput.value = hex;
        rgbInput.value = rgb;
    }

    function rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
    }

    // --- Copy to Clipboard ---

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input.value) return;

            navigator.clipboard.writeText(input.value).then(() => {
                const originalText = btn.textContent;
                btn.textContent = '¡Copiado!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 1500);
            });
        });
    });

    // --- Color Count Control ---
    
    colorCountInput.addEventListener('input', (e) => {
        colorCountDisplay.textContent = e.target.value;
        if (currentImage) {
            extractPalette();
        }
    });

    // --- Simple Palette Extraction ---

    function extractPalette() {
        // Simple extraction: sample pixels at regular intervals
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = new Map();
        
        // Step size based on image size to avoid freezing on large images
        const step = Math.floor((canvas.width * canvas.height) / 10000) * 4 || 4; 
        
        for (let i = 0; i < imageData.length; i += step) {
            const r = imageData[i];
            const g = imageData[i+1];
            const b = imageData[i+2];
            const a = imageData[i+3];
            
            if (a < 128) continue; // Skip transparent pixels
            
            // Round colors to group similar ones
            const rr = Math.round(r / 20) * 20;
            const gg = Math.round(g / 20) * 20;
            const bb = Math.round(b / 20) * 20;
            
            const key = `${rr},${gg},${bb}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Sort by frequency
        const sortedColors = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
        
        const count = parseInt(colorCountInput.value, 10) || 12;

        // Take top colors
        const topColors = sortedColors.slice(0, count).map(entry => {
            const [r, g, b] = entry[0].split(',').map(Number);
            return { r, g, b };
        });

        renderPalette(topColors);
    }

    function renderPalette(colors) {
        paletteContainer.innerHTML = '';
        colors.forEach(c => {
            const hex = rgbToHex(c.r, c.g, c.b);
            const swatch = document.createElement('div');
            swatch.className = 'color';
            swatch.style.backgroundColor = hex;
            
            const span = document.createElement('span');
            span.textContent = hex;
            swatch.appendChild(span);
            
            swatch.addEventListener('click', () => {
                updateCurrentColor(c.r, c.g, c.b);
                navigator.clipboard.writeText(hex).catch(() => {});
            });
            
            paletteContainer.appendChild(swatch);
        });
    }
});
