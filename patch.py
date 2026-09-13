with open('converter.js', 'r', encoding='utf-8') as f:
    js = f.read()

if 'window.rgbToHsv = rgbToHsv;' not in js:
    js += '\nwindow.rgbToHsv = rgbToHsv;\nwindow.hexToRgb = hexToRgb;\n'

with open('converter.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done")
