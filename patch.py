with open('i18n.js', 'r', encoding='utf-8') as f:
    js = f.read()

replacement = '''function changeLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('chromapick_lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    if (window.renderPalettes) window.renderPalettes();
}'''

import re
js = re.sub(r'function changeLanguage\(lang\) \{\s*if \(\!translations\[lang\]\) return;\s*currentLang = lang;\s*localStorage\.setItem\(\'chromapick_lang\', lang\);\s*applyTranslations\(\);\s*\}', replacement, js)

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done")
