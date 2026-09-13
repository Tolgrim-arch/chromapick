window.showError = function(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'error';
    
    toast.innerHTML = `
        <div class="error__icon">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z" fill="#393a37"></path></svg>
        </div>
        <div class="error__title">${message}</div>
        <div class="error__close"><svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#393a37"></path></svg></div>
    `;
    
    container.appendChild(toast);
    
    let timeout = setTimeout(() => {
        removeToast(toast);
    }, 4000);
    
    toast.querySelector('.error__close').addEventListener('click', () => {
        clearTimeout(timeout);
        removeToast(toast);
    });
};

function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
}

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
    const MAGNIFIER_ZOOM = 16;
    
    function updateMagnifier(e) {
        if (!currentImage) return;
        const rect = canvas.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const cssX = clientX - rect.left;
        const cssY = clientY - rect.top;

        // Solo mostrar si estamos dentro del canvas
        if (cssX >= 0 && cssX <= rect.width && cssY >= 0 && cssY <= rect.height) {
            magnifier.style.display = 'block';
            magnifier.style.left = `${cssX}px`;
            magnifier.style.top = `${cssY}px`;

            // 1. Calcular el píxel EXACTO (entero) que estamos tocando en la imagen original
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const actualX = Math.floor(cssX * scaleX);
            const actualY = Math.floor(cssY * scaleY);

            // 2. Escalar el tamaño de la imagen original por el multiplicador de zoom
            const zoomedWidth = currentImage.width * MAGNIFIER_ZOOM;
            const zoomedHeight = currentImage.height * MAGNIFIER_ZOOM;
            magnifier.style.backgroundImage = `url('${currentImage.src}')`;
            magnifier.style.backgroundSize = `${zoomedWidth}px ${zoomedHeight}px`;
            
            // 3. Matemáticas de alineación: Centrar ese píxel exacto en el medio geométrico de la lupa
            const centerX = magnifier.offsetWidth / 2;
            const centerY = magnifier.offsetHeight / 2;
            const bgX = centerX - (actualX * MAGNIFIER_ZOOM + MAGNIFIER_ZOOM / 2);
            const bgY = centerY - (actualY * MAGNIFIER_ZOOM + MAGNIFIER_ZOOM / 2);
            
            magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            // 4. Sincronizar la cuadrícula CSS para que abrace los píxeles perfectamente
            magnifier.style.setProperty('--grid-x', `${bgX}px`);
            magnifier.style.setProperty('--grid-y', `${bgY}px`);
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
        const loadPreset = () => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                currentImage = img;
                setupWorkspace();
            };
            img.src = presetImg.src;
        };
        
        presetImg.addEventListener('click', loadPreset);
        
        // Ejecutar directamente
        loadPreset();
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

    window.setExtractorColor = function(r, g, b) {
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hex = rgbToHex(r, g, b);
        colorPreview.style.backgroundColor = rgb;
        hexInput.value = hex;
        rgbInput.value = rgb;
    };

    function updateCurrentColor(r, g, b) {
        window.setExtractorColor(r, g, b);
        
        // Sync to Converter
        if (window.rgbToHsv && window.updateConverterUI) {
            window.currentHsv = window.rgbToHsv(r, g, b);
            window.updateConverterUI();
        }
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
    });

    colorCountInput.addEventListener('change', (e) => {
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

        const algoSelect = document.getElementById('extract-algo');
        const algo = algoSelect ? algoSelect.value : 'normal';

        const sortedByFreq = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return {r, g, b, freq: entry[1]};
            });

        let pool = Array.from(freqMap.entries())
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                const hsv = window.rgbToHsv ? window.rgbToHsv(r, g, b) : {h:0, s:0, v:0};
                return {r, g, b, freq: entry[1], h: hsv.h, s: hsv.s, v: hsv.v};
            });

        if (algo === 'warm') {
            pool = pool.filter(c => c.s > 15 && (c.h <= 60 || c.h >= 300));
        } else if (algo === 'cold') {
            pool = pool.filter(c => c.s > 15 && (c.h >= 90 && c.h <= 270));
        }

        if (algo === 'vibrant') {
            // Saturated colors boosted
            pool.sort((a, b) => {
                const scoreA = (a.s * a.v) * Math.log(a.freq + 1);
                const scoreB = (b.s * b.v) * Math.log(b.freq + 1);
                return scoreB - scoreA;
            });
        } else {
            // Normal fallback is pure frequency
            pool.sort((a, b) => b.freq - a.freq);
        }

        for (const c of pool) {
            if (uniqueColors.length >= count) break;
            
            let isTooSimilar = false;
            let currentMinDist = algo === 'vibrant' ? 60 : MIN_DISTANCE;
            
            for (const u of uniqueColors) {
                const dist = Math.sqrt(
                    Math.pow(c.r - u.r, 2) + 
                    Math.pow(c.g - u.g, 2) + 
                    Math.pow(c.b - u.b, 2)
                );
                if (dist < currentMinDist) {
                    isTooSimilar = true;
                    break;
                }
            }
            if (!isTooSimilar) uniqueColors.push(c);
        }
        
        // If vibrant or filtered requested but we didn't find enough colors, fallback to normal sort to fill
        if (uniqueColors.length < count && algo !== 'normal') {
            const backupPool = Array.from(freqMap.entries())
                .map(entry => {
                    const [r, g, b] = entry[0].split(',').map(Number);
                    return {r, g, b, freq: entry[1]};
                })
                .sort((a, b) => b.freq - a.freq);
                
            for (const c of backupPool) {
                if (uniqueColors.length >= count) break;
                let isTooSimilar = false;
                for (const u of uniqueColors) {
                    const dist = Math.sqrt(Math.pow(c.r - u.r, 2) + Math.pow(c.g - u.g, 2) + Math.pow(c.b - u.b, 2));
                    if (dist < MIN_DISTANCE) { isTooSimilar = true; break; }
                }
                if (!isTooSimilar) uniqueColors.push(c);
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

// --- TAB NAVIGATION ---
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Update active class on tabs
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show correct view
        const targetView = e.target.getAttribute('data-view');
        document.querySelectorAll('.app-view').forEach(view => {
            if (view.id === targetView) {
                view.style.display = 'flex';
                // Trigger resize or UI updates if needed
            } else {
                view.style.display = 'none';
            }
        });
    });
});

