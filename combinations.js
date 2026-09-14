function renderCombinations() {
    const container = document.getElementById('combinations-grid');
    const headerCircle = document.getElementById('combo-header-circle');
    if (!container || !headerCircle) return;

    let hex = getSystemCurrentHex();
    if (!hex) hex = '#ef4444';
    
    headerCircle.style.backgroundColor = hex;
    
    const rgb = window.hexToRgb ? window.hexToRgb(hex) : {r:239, g:68, b:68};
    const hsv = window.rgbToHsv ? window.rgbToHsv(rgb.r, rgb.g, rgb.b) : {h:0, s:0, v:0};
    
    const shiftHue = (baseHsv, degrees) => {
        let newH = (baseHsv.h + degrees) % 360;
        if (newH < 0) newH += 360;
        if (window.hsvToRgb && window.rgbToHex) {
            const newRgb = window.hsvToRgb(newH, baseHsv.s, baseHsv.v);
            return window.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        }
        return hex;
    };
    
    const shiftMonochromatic = (baseHsv, sShift, vShift) => {
        let newS = Math.max(0, Math.min(100, baseHsv.s + sShift));
        let newV = Math.max(0, Math.min(100, baseHsv.v + vShift));
        if (window.hsvToRgb && window.rgbToHex) {
            const newRgb = window.hsvToRgb(baseHsv.h, newS, newV);
            return window.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        }
        return hex;
    };
    
    const harmonies = {
        complement: [hex, shiftHue(hsv, 180)],
        split: [hex, shiftHue(hsv, 150), shiftHue(hsv, 210)],
        triadic: [hex, shiftHue(hsv, 120), shiftHue(hsv, 240)],
        analogous: [hex, shiftHue(hsv, 30), shiftHue(hsv, 330)],
        monochromatic: [shiftMonochromatic(hsv, 0, 20), hex, shiftMonochromatic(hsv, 10, -30)],
        tetradic: [hex, shiftHue(hsv, 60), shiftHue(hsv, 180), shiftHue(hsv, 240)]
    };
    
    const harmonyData = [
        { id: 'complement' }, { id: 'split' }, { id: 'triadic' },
        { id: 'analogous' }, { id: 'monochromatic' }, { id: 'tetradic' }
    ];
    
    const langDict = window.translations?.[document.documentElement.lang] || window.translations?.['en'] || {};
    const copiedText = langDict['copied'] || 'Copied!';
    
    // Performance optimization: Build DOM only once
    if (container.children.length === 0 || container.dataset.lang !== document.documentElement.lang) {
        container.innerHTML = '';
        container.dataset.lang = document.documentElement.lang;
        
        harmonyData.forEach(data => {
            const card = document.createElement('div');
            card.className = 'harmony-card';
            card.id = 'harmony-card-' + data.id;
            
            const title = document.createElement('h4');
            title.textContent = langDict['harmony_name_' + data.id] || data.id;
            
            const desc = document.createElement('p');
            desc.className = 'harmony-desc';
            desc.textContent = langDict['harmony_desc_' + data.id] || '';
            
            const barContainer = document.createElement('div');
            barContainer.className = 'harmony-bar';
            barContainer.id = 'harmony-bar-' + data.id;
            
            // create segments
            harmonies[data.id].forEach((c, idx) => {
                const segment = document.createElement('div');
                segment.className = 'harmony-segment';
                segment.id = `harmony-seg-${data.id}-${idx}`;
                segment.style.backgroundColor = c;
                segment.title = c.toUpperCase();
                
                segment.addEventListener('click', async () => {
                    try {
                        const curColor = segment.dataset.hex || c;
                        await navigator.clipboard.writeText(curColor.toUpperCase());
                        if (window.showToast) window.showToast(`${copiedText} ${curColor.toUpperCase()}`, 'success');
                        else if (window.showError) window.showError(`${copiedText} ${curColor.toUpperCase()}`);
                    } catch (err) {}
                });
                
                barContainer.appendChild(segment);
            });
            
            const bestFor = document.createElement('div');
            bestFor.className = 'harmony-best-for';
            const bestTextLabel = langDict['best_for'] || 'Best for:';
            const bestTextVal = langDict['harmony_best_' + data.id] || '';
            bestFor.innerHTML = '<strong>' + bestTextLabel + '</strong> ' + bestTextVal;
            
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(barContainer);
            card.appendChild(bestFor);
            container.appendChild(card);
        });
    } else {
        // Fast update: just update colors
        harmonyData.forEach(data => {
            const colors = harmonies[data.id];
            colors.forEach((c, idx) => {
                const seg = document.getElementById(`harmony-seg-${data.id}-${idx}`);
                if (seg) {
                    seg.style.backgroundColor = c;
                    seg.title = c.toUpperCase();
                    seg.dataset.hex = c; // Save dynamic hex for the click listener
                }
            });
        });
    }
}

function getSystemCurrentHex() {
    if (window.currentHsv && window.hsvToRgb && window.rgbToHex) {
        const rgb = window.hsvToRgb(window.currentHsv.h, window.currentHsv.s, window.currentHsv.v);
        return window.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    return null;
}

window.renderCombinations = renderCombinations;

document.addEventListener('DOMContentLoaded', () => {
    if (window.renderCombinations) window.renderCombinations();

    const originalUpdate = window.updateConverterUI;
    window.updateConverterUI = function() {
        if (originalUpdate) originalUpdate();
        if (window.renderCombinations) {
            window.renderCombinations();
        }
    };
});
