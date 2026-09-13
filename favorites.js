function showPrompt(message, defaultValue = "") {
    return new Promise((resolve) => {
        const overlay = document.getElementById('custom-prompt-overlay');
        const msgEl = document.getElementById('custom-prompt-message');
        const inputEl = document.getElementById('custom-prompt-input');
        const btnOk = document.getElementById('custom-prompt-ok');
        const btnCancel = document.getElementById('custom-prompt-cancel');
        
        msgEl.textContent = message;
        
        btnCancel.textContent = window.translations?.[document.documentElement.lang]?.cancel || "Cancelar";
        btnOk.textContent = window.translations?.[document.documentElement.lang]?.ok || "Aceptar";
        
        inputEl.value = defaultValue;
        overlay.style.display = 'flex';
        inputEl.focus();
        
        const cleanup = () => {
            overlay.style.display = 'none';
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            inputEl.removeEventListener('keydown', onKey);
        };
        
        const onOk = () => { cleanup(); resolve(inputEl.value); };
        const onCancel = () => { cleanup(); resolve(null); };
        const onKey = (e) => {
            if (e.key === 'Enter') onOk();
            if (e.key === 'Escape') onCancel();
        };
        
        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
        inputEl.addEventListener('keydown', onKey);
    });
}

const STORAGE_KEY = 'chromapick_palettes';
let palettes = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPalettes();
    
    // Setup Heart buttons
    const heartCheckboxes = document.querySelectorAll('.fav-heart-checkbox');
    heartCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const hex = getSystemCurrentHex();
            if (!hex) {
                e.target.checked = false;
                alert("Primero debes extraer o seleccionar un color.");
                return;
            }
            
            if (e.target.checked) {
                addFavoriteToGlobal(hex);
            } else {
                removeFavoriteFromGlobal(hex);
            }
            // Sync the other heart checkboxes
            heartCheckboxes.forEach(otherCb => {
                if (otherCb !== cb) otherCb.checked = e.target.checked;
            });
        });
    });

    // Setup New Palette button
    document.getElementById('btn-new-palette').addEventListener('click', async () => {
        const name = await showPrompt(window.translations?.[document.documentElement.lang]?.name_palette || "Nombre de la paleta:");
        if (name && name.trim()) {
            palettes.push({
                id: 'pal_' + Date.now(),
                name: name.trim(),
                colors: []
            });
            savePalettes();
        }
    });

    // Hook into global app sync to update heart state
    const originalSetExtractorColor = window.setExtractorColor;
    if (originalSetExtractorColor) {
        window.setExtractorColor = function(r, g, b) {
            originalSetExtractorColor(r, g, b);
            syncHeartState();
        };
    }
});

function getSystemCurrentHex() {
    // Check which view is currently visible
    const activeView = document.querySelector('.app-view[style*="display: flex"]') || document.querySelector('.app-view.active');
    
    // If in Extractor, explicitly require the extractor's input to have a value
    if (activeView && activeView.id === 'view-extractor') {
        const hexInput = document.getElementById('hex-value');
        if (hexInput && hexInput.value) return hexInput.value.toUpperCase();
        return null;
    }
    
    // If in Converter, use converter's input
    if (activeView && activeView.id === 'view-converter') {
        const pickerHex = document.getElementById('picker-hex');
        if (pickerHex && pickerHex.value) return pickerHex.value.toUpperCase();
    }
    
    // If in Favorites or anywhere else, prioritize Extractor, then fallback to Converter
    const hexInput = document.getElementById('hex-value');
    if (hexInput && hexInput.value) return hexInput.value.toUpperCase();
    
    const pickerHex = document.getElementById('picker-hex');
    if (pickerHex && pickerHex.value) return pickerHex.value.toUpperCase();
    
    return null;
}

function syncHeartState() {
    const hex = getSystemCurrentHex();
    if (!hex) {
        document.querySelectorAll('.fav-heart-checkbox').forEach(cb => cb.checked = false);
        return;
    }
    const isFav = isFavorite(hex);
    document.querySelectorAll('.fav-heart-checkbox').forEach(cb => {
        cb.checked = isFav;
    });
}

function loadPalettes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try { palettes = JSON.parse(saved); } catch (e) { palettes = []; }
    }
    if (!palettes.find(p => p.id === 'global')) {
        palettes.unshift({ id: 'global', name: 'Favoritos Generales', colors: [] });
        savePalettes();
    } else {
        renderPalettes();
    }
}

function savePalettes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    renderPalettes();
}

function addFavoriteToGlobal(hex) {
    const p = palettes.find(p => p.id === 'global');
    if (!p.colors.includes(hex)) p.colors.push(hex);
    savePalettes();
}

function removeFavoriteFromGlobal(hex) {
    const p = palettes.find(p => p.id === 'global');
    p.colors = p.colors.filter(c => c !== hex);
    savePalettes();
}

function isFavorite(hex) {
    const p = palettes.find(p => p.id === 'global');
    return p.colors.includes(hex);
}

function renderPalettes() {
    const container = document.getElementById('palettes-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    palettes.forEach(pal => {
        const card = document.createElement('div');
        card.className = 'palette-card';
        
        const header = document.createElement('div');
        header.className = 'palette-header';
        
        const title = document.createElement('div');
        title.className = 'palette-title';
        title.textContent = pal.name;
        // Allow renaming
        title.style.cursor = 'pointer';
        title.title = "Renombrar";
        title.addEventListener('click', async () => {
            const newName = await showPrompt("Nuevo nombre:", pal.name);
            if (newName && newName.trim()) {
                pal.name = newName.trim();
                savePalettes();
            }
        });
        
        const actions = document.createElement('div');
        actions.className = 'palette-actions';
        
        // Add color button
        const addBtn = document.createElement('button');
        addBtn.className = 'icon-btn';
        addBtn.title = "Añadir color seleccionado";
        addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        addBtn.addEventListener('click', () => {
            const hex = getSystemCurrentHex();
            if (!hex) {
                alert("Primero debes extraer o seleccionar un color.");
                return;
            }
            if (!pal.colors.includes(hex)) {
                pal.colors.push(hex);
                savePalettes();
            }
        });
        actions.appendChild(addBtn);
        
        // Delete palette button (except global)
        if (pal.id !== 'global') {
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.style.color = '#ef4444';
            delBtn.title = "Borrar paleta";
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            delBtn.addEventListener('click', () => {
                if(confirm("¿Eliminar paleta?")) {
                    palettes = palettes.filter(p => p.id !== pal.id);
                    savePalettes();
                }
            });
            actions.appendChild(delBtn);
        }
        
        header.appendChild(title);
        header.appendChild(actions);
        card.appendChild(header);
        
        const colorsGrid = document.createElement('div');
        colorsGrid.className = 'fav-colors-grid';
        
        pal.colors.forEach(hex => {
            const block = document.createElement('div');
            block.className = 'fav-color-block';
            block.style.backgroundColor = hex;
            block.title = hex;
            
            // Load color to app on click
            block.addEventListener('click', () => {
                if (window.hexToRgb && window.rgbToHsv && window.updateConverterUI) {
                    const rgb = window.hexToRgb(hex);
                    if(rgb) {
                        window.currentHsv = window.rgbToHsv(rgb.r, rgb.g, rgb.b);
                        window.updateConverterUI();
                    }
                }
            });
            
            // Delete X
            const delX = document.createElement('div');
            delX.className = 'fav-color-delete';
            delX.textContent = 'X';
            delX.addEventListener('click', (e) => {
                e.stopPropagation(); // don't trigger block click
                pal.colors = pal.colors.filter(c => c !== hex);
                savePalettes();
            });
            
            block.appendChild(delX);
            colorsGrid.appendChild(block);
        });
        
        card.appendChild(colorsGrid);
        container.appendChild(card);
    });
}
