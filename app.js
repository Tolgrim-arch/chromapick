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
        const magnifier = document.getElementById('magnifier');
        if (magnifier) magnifier.style.display = 'none';
    });

    // --- Lógica de la Lupa (Magnifier) ---
    const magnifier = document.getElementById('magnifier');
    const MAGNIFIER_ZOOM = 4;
    
    function updateMagnifier(e) {
        if (!currentImage) return;
        const rect = canvas.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Solo mostrar si estamos dentro del canvas
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            magnifier.style.display = 'block';
            magnifier.style.left = `${x}px`;
            magnifier.style.top = `${y}px`;

            // Calcular coordenadas relativas a la imagen nativa
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const imageX = x * scaleX;
            const imageY = y * scaleY;

            // Configurar el fondo de la lupa
            magnifier.style.backgroundImage = `url('${currentImage.src}')`;
            magnifier.style.backgroundSize = `${rect.width * MAGNIFIER_ZOOM}px ${rect.height * MAGNIFIER_ZOOM}px`;
            
            // Posicionar el fondo para que haga zoom sobre el punto exacto
            const bgX = -(x * MAGNIFIER_ZOOM - magnifier.offsetWidth / 2);
            const bgY = -(y * MAGNIFIER_ZOOM - magnifier.offsetHeight / 2);
            magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
        } else {
            magnifier.style.display = 'none';
        }
    }

    // --- Soporte Pegar (Ctrl+V) ---
    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.items) {
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                const item = e.clipboardData.items[i];
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    processFile(file);
                    break;
                }
            }
        }
    });

    // --- Presets ---
    const presetImg = document.getElementById('demo-img-1');
    if (presetImg) {
        presetImg.addEventListener('click', () => {
            fetch(presetImg.src)
                .then(res => res.blob())
                .then(blob => processFile(blob));
        });
    }

    // --- Color Picking & Canvas Events ---

    canvas.addEventListener('mousemove', (e) => {
        updateMagnifier(e);
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
            canvas.title = hex;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        updateMagnifier(e);
    });

    canvas.addEventListener('mouseleave', () => {
        if (magnifier) magnifier.style.display = 'none';
    });

    canvas.addEventListener('touchend', () => {
        if (magnifier) magnifier.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            updateCurrentColor(pixel[0], pixel[1], pixel[2]);
        }
    });

    // Mobile touch support
    canvas.addEventListener('touchstart', (e) => {
        updateMagnifier(e);
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const touch = e.touches[0];

        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            updateCurrentColor(pixel[0], pixel[1], pixel[2]);
        }
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
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = [];
        
        // Aumentamos la resolución de muestreo para garantizar capturar más colores en imágenes simples
        const step = Math.floor((canvas.width * canvas.height) / 25000) * 4 || 4; 
        
        for (let i = 0; i < imageData.length; i += step) {
            const r = imageData[i];
            const g = imageData[i+1];
            const b = imageData[i+2];
            const a = imageData[i+3];
            
            if (a < 128) continue; 
            colors.push({r, g, b});
        }

        // Encontrar colores únicos por distancia
        const uniqueColors = [];
        const count = parseInt(colorCountInput.value, 10) || 12;
        const MIN_DISTANCE = 30; // Distancia mínima para considerar un color "diferente"

        // Contar frecuencias sin agrupar tan agresivamente
        const freqMap = new Map();
        colors.forEach(c => {
            const key = `${c.r},${c.g},${c.b}`;
            freqMap.set(key, (freqMap.get(key) || 0) + 1);
        });

        const sortedByFreq = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return {r, g, b, freq: entry[1]};
            });

        for (const c of sortedByFreq) {
            if (uniqueColors.length >= count) break;
            
            let isTooSimilar = false;
            for (const u of uniqueColors) {
                const dist = Math.sqrt(Math.pow(c.r - u.r, 2) + Math.pow(c.g - u.g, 2) + Math.pow(c.b - u.b, 2));
                if (dist < MIN_DISTANCE) {
                    isTooSimilar = true;
                    break;
                }
            }
            if (!isTooSimilar) {
                uniqueColors.push(c);
            }
        }

        // Si aún nos faltan colores para llegar al count (ej. una imagen con solo 2 colores)
        // rellenamos con los siguientes más frecuentes sin importar la similitud
        // Si la imagen es un logo o pixel-art con colores limitados exactos (ej. 7 colores reales)
        // generamos variaciones sutiles (noise) para rellenar la paleta hasta el count deseado por el slider.
        let noiseOffset = 10;
        while (uniqueColors.length < count) {
            for (let i = 0; i < sortedByFreq.length; i++) {
                if (uniqueColors.length >= count) break;
                const base = sortedByFreq[i];
                // Generar variación sutil
                const newColor = {
                    r: Math.min(255, Math.max(0, base.r + noiseOffset)),
                    g: Math.min(255, Math.max(0, base.g + noiseOffset)),
                    b: Math.min(255, Math.max(0, base.b + noiseOffset))
                };
                uniqueColors.push(newColor);
                noiseOffset = -noiseOffset + (noiseOffset > 0 ? 5 : -5); // variar la dirección y magnitud del ruido
            }
            // Fallback extremo si sortedByFreq está vacío por alguna razón
            if (sortedByFreq.length === 0) break; 
        }

        renderPalette(uniqueColors);
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
                navigator.clipboard.writeText(hex).then(() => {
                    const originalText = span.textContent;
                    span.textContent = '¡Copiado!';
                    setTimeout(() => {
                        span.textContent = originalText;
                    }, 1000);
                }).catch(() => {});
            });
            
            paletteContainer.appendChild(swatch);
        });
    }
});
