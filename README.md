# Chromapick 🎨

> A blazingly fast, offline-first, client-side web application for extracting color palettes and targeted pixels from images with surgical precision.

[**Live Demo (GitHub Pages)**](https://Tolgrim-arch.github.io/chromapick/)

## ⚡ Features

- **Euclidean Color Extraction Algorithm**: Dynamically computes up to 12 dominant colors from any image using spatial color distance mathematics.
- **Surgical Precision Eyedropper**: Features a raw pixelated 8x zoom magnifier with a pixel-perfect crosshair grid for extreme targeting accuracy.
- **Offline First**: Runs entirely in the browser using the HTML5 Canvas API. No server-side processing, no external API calls, zero privacy risks.
- **Frictionless Workflows**: Supports Drag & Drop, Click-to-upload, direct `Ctrl+V` clipboard pasting, and instant presets.
- **Responsive Architecture**: Carefully optimized for both desktop monitors and mobile touchscreens.
- **Failsafe Padding Algorithm**: Automatically generates mathematically-related colors if an image (like flat vectors) lacks the requested color variance.

## 🛠️ Tech Stack

- **Vanilla JavaScript** (Zero dependencies, pure performance)
- **HTML5 Canvas API** (Raw pixel manipulation)
- **Modern CSS3** (Flexbox, custom properties, responsive media queries)
- **PWA Architecture** (Manifest and caching capabilities)

## 🚀 Usage

1. Paste (`Ctrl+V`), drag & drop, or select an image.
2. Slide the range input to extract between 3 and 12 dominant colors.
3. Hover/Touch the canvas to pick an exact pixel with the precision magnifying glass.
4. Click any extracted color or the main targeted color to copy its HEX or RGB value to your clipboard instantly.

---

### About (Repository Description)
*If you need to paste this into the GitHub Repository "About" section settings:*
> **"An offline-first, client-side web application for extracting color palettes and targeted pixels from images with surgical precision using Vanilla JS."**
