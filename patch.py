with open('i18n.js', 'r', encoding='utf-8') as f:
    js = f.read()

if 'window.translations = translations;' not in js:
    js += '\nwindow.translations = translations;\n'

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done")
