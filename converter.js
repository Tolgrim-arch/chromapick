// --- COLOR MATH & CONVERSIONS ---
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max == min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h, s, v) {
    let r, g, b;
    h /= 360; s /= 100; v /= 100;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    
    if (k == 1) return { c: 0, m: 0, y: 0, k: 100 };
    
    c = Math.round((c - k) / (1 - k) * 100);
    m = Math.round((m - k) / (1 - k) * 100);
    y = Math.round((y - k) / (1 - k) * 100);
    k = Math.round(k * 100);
    return { c, m, y, k };
}

function rgbToXyz(r, g, b) {
    r = r / 255; g = g / 255; b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100; g *= 100; b *= 100;

    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return { x: Math.round(x), y: Math.round(y), z: Math.round(z) };
}

function xyzToLab(x, y, z) {
    let ref_X = 95.047; let ref_Y = 100.000; let ref_Z = 108.883;
    x /= ref_X; y /= ref_Y; z /= ref_Z;

    x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + (16 / 116);

    let l = (116 * y) - 16;
    let a = 500 * (x - y);
    let b_val = 200 * (y - z);

    return { l: Math.round(l), a: Math.round(a), b: Math.round(b_val) };
}

function xyzToLuv(x, y, z) {
    let ref_X = 95.047; let ref_Y = 100.000; let ref_Z = 108.883;
    let ref_U = (4 * ref_X) / (ref_X + (15 * ref_Y) + (3 * ref_Z));
    let ref_V = (9 * ref_Y) / (ref_X + (15 * ref_Y) + (3 * ref_Z));

    let u_prime = (4 * x) / (x + (15 * y) + (3 * z)) || 0;
    let v_prime = (9 * y) / (x + (15 * y) + (3 * z)) || 0;

    let y_ratio = y / ref_Y;
    let l = y_ratio > 0.008856 ? (116 * Math.cbrt(y_ratio)) - 16 : 903.3 * y_ratio;
    
    let u = 13 * l * (u_prime - ref_U);
    let v = 13 * l * (v_prime - ref_V);

    return { l: Math.round(l), u: Math.round(u), v: Math.round(v) };
}

function rgbToHwb(r, g, b) {
    let hsv = rgbToHsv(r, g, b);
    let w = (1 - (hsv.s/100)) * (hsv.v/100) * 100;
    let bl = (1 - (hsv.v/100)) * 100;
    return { h: Math.round(hsv.h), w: Math.round(w), b: Math.round(bl) };
}

// --- CONVERTER LOGIC ---
const svSquare = document.getElementById('sv-square');
const svKnob = document.getElementById('sv-knob');
const hueSlider = document.getElementById('hue-slider');
const pickerPreview = document.getElementById('picker-preview');
const pickerHexInput = document.getElementById('picker-hex');

// Format inputs
const outHex = document.getElementById('conv-hex');
const outHsl = document.getElementById('conv-hsl');
const outRgb = document.getElementById('conv-rgb');
const outCmyk = document.getElementById('conv-cmyk');
const outLab = document.getElementById('conv-lab');
const outXyz = document.getElementById('conv-xyz');
const outLuv = document.getElementById('conv-luv');
const outHwb = document.getElementById('conv-hwb');

const mainColorDisplay = document.getElementById('main-color-display');
const mainColorHex = document.getElementById('main-color-hex');

let currentHsv = { h: 0, s: 100, v: 100 };

function updateConverterUI() {
    let rgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    // Update SV square background
    let pureHueRgb = hsvToRgb(currentHsv.h, 100, 100);
    svSquare.style.backgroundColor = `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`;
    
    // Update Knob position
    svKnob.style.left = currentHsv.s + "%";
    svKnob.style.top = (100 - currentHsv.v) + "%";
    
    // Update Hue slider (if changed programmatically)
    hueSlider.value = currentHsv.h;
    
    // Update Inputs
    pickerHexInput.value = hex;
    pickerPreview.style.backgroundColor = hex;
    mainColorDisplay.style.backgroundColor = hex;
    mainColorHex.textContent = hex;
    
    // Formulas
    outHex.value = hex;
    outRgb.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    outHsl.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    let cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    outCmyk.value = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;
    let xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
    outXyz.value = `${xyz.x}, ${xyz.y}, ${xyz.z}`;
    let lab = xyzToLab(xyz.x, xyz.y, xyz.z);
    outLab.value = `${lab.l}, ${lab.a}, ${lab.b}`;
    let luv = xyzToLuv(xyz.x, xyz.y, xyz.z);
    outLuv.value = `${luv.l}, ${luv.u}, ${luv.v}`;
    let hwb = rgbToHwb(rgb.r, rgb.g, rgb.b);
    outHwb.value = `${hwb.h}, ${hwb.w}%, ${hwb.b}%`;
}

function handleSvDrag(e) {
    let rect = svSquare.getBoundingClientRect();
    let x = e.clientX || (e.touches && e.touches[0].clientX);
    let y = e.clientY || (e.touches && e.touches[0].clientY);
    
    x = Math.max(0, Math.min(x - rect.left, rect.width));
    y = Math.max(0, Math.min(y - rect.top, rect.height));
    
    currentHsv.s = (x / rect.width) * 100;
    currentHsv.v = 100 - ((y / rect.height) * 100);
    
    updateConverterUI();
}

// Update the sync backward function (Converter -> Extractor)
const originalUpdateConverterUI = updateConverterUI;
updateConverterUI = function() {
    originalUpdateConverterUI();
    let rgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
    if (window.setExtractorColor) {
        window.setExtractorColor(rgb.r, rgb.g, rgb.b);
    }
};

let isDraggingSv = false;
svSquare.addEventListener('mousedown', (e) => { isDraggingSv = true; handleSvDrag(e); });
document.addEventListener('mousemove', (e) => { if (isDraggingSv) handleSvDrag(e); });
document.addEventListener('mouseup', () => { isDraggingSv = false; });
svSquare.addEventListener('touchstart', (e) => { isDraggingSv = true; handleSvDrag(e); }, {passive: true});
document.addEventListener('touchmove', (e) => { if (isDraggingSv) handleSvDrag(e); }, {passive: true});
document.addEventListener('touchend', () => { isDraggingSv = false; });

hueSlider.addEventListener('input', (e) => {
    currentHsv.h = parseFloat(e.target.value);
    updateConverterUI();
});

pickerHexInput.addEventListener('change', (e) => {
    let rgb = hexToRgb(e.target.value);
    if (rgb) {
        currentHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        updateConverterUI();
    }
});

// Initialize
updateConverterUI();

// --- NATIVE EYEDROPPER ---
const btnPickScreen = document.getElementById('btn-pick-screen');
const btnPickIcon = document.getElementById('btn-eyedropper-icon');

function triggerEyeDropper() {
    if (!window.EyeDropper) {
        alert("Tu navegador no soporta la API nativa de EyeDropper. Prueba con Chrome o Edge.");
        return;
    }
    const eyeDropper = new EyeDropper();
    eyeDropper.open().then(result => {
        let rgb = hexToRgb(result.sRGBHex);
        if (rgb) {
            currentHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            updateConverterUI();
        }
    }).catch(e => {
        console.log("EyeDropper cancelado o error:", e);
    });
}
if(btnPickScreen) btnPickScreen.addEventListener('click', triggerEyeDropper);
if(btnPickIcon) btnPickIcon.addEventListener('click', triggerEyeDropper);
