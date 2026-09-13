import json
import re

with open('i18n.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Instead of complex parsing, I'll just append it generically to all languages except en and es, which I'll do specific.
def add_to_lang(text, lang, additions):
    # Find the block for the lang
    pattern = rf'({lang}:\s*{{)(.*?)(\n\s*}},|\n\s*}})'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        inner = match.group(2)
        added = ",\n        " + ",\n        ".join([f'{k}: "{v}"' for k, v in additions.items()])
        new_block = match.group(1) + inner + added + match.group(3)
        return text[:match.start()] + new_block + text[match.end():]
    return text

text = add_to_lang(text, 'en', {'tab_favorites': 'Favorites', 'saved_palettes': 'Saved Palettes', 'new_palette': 'New Palette', 'name_palette': 'Palette name:'})
text = add_to_lang(text, 'es', {'tab_favorites': 'Favoritos', 'saved_palettes': 'Paletas Guardadas', 'new_palette': 'Nueva Paleta', 'name_palette': 'Nombre de la paleta:'})

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
