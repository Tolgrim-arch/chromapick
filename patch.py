import re

with open('favorites.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace getSystemCurrentHex
replacement = '''function getSystemCurrentHex() {
    // Check which view is currently visible
    const activeView = document.querySelector('.app-view[style*=\"display: flex\"]') || document.querySelector('.app-view.active');
    
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
}'''

js = re.sub(r'function getSystemCurrentHex\(\) \{.*?\n\}', replacement, js, flags=re.DOTALL)

# Update heart checkbox listener
checkbox_listener = '''    heartCheckboxes.forEach(cb => {
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
    });'''

js = re.sub(r'    heartCheckboxes\.forEach\(cb => \{.*?\n    \}\);', checkbox_listener, js, flags=re.DOTALL)

# Update [+] button in custom palettes
addBtn_listener = '''        addBtn.addEventListener('click', () => {
            const hex = getSystemCurrentHex();
            if (!hex) {
                alert("Primero debes extraer o seleccionar un color.");
                return;
            }
            if (!pal.colors.includes(hex)) {
                pal.colors.push(hex);
                savePalettes();
            }
        });'''

js = re.sub(r"        addBtn\.addEventListener\('click', \(\) => \{.*?\n        \}\);", addBtn_listener, js, flags=re.DOTALL)

# Update syncHeartState
syncState = '''function syncHeartState() {
    const hex = getSystemCurrentHex();
    if (!hex) {
        document.querySelectorAll('.fav-heart-checkbox').forEach(cb => cb.checked = false);
        return;
    }
    const isFav = isFavorite(hex);
    document.querySelectorAll('.fav-heart-checkbox').forEach(cb => {
        cb.checked = isFav;
    });
}'''

js = re.sub(r'function syncHeartState\(\) \{.*?\n\}', syncState, js, flags=re.DOTALL)

with open('favorites.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done")
