import re

translations = {
    'zh': {'global_palette': '一般收藏'},
    'ja': {'global_palette': '一般のお気に入り'},
    'ko': {'global_palette': '일반 즐겨찾기'},
    'de': {'global_palette': 'Allgemeine Favoriten'},
    'pt': {'global_palette': 'Favoritos Gerais'},
    'fr': {'global_palette': 'Favoris Généraux'},
    'it': {'global_palette': 'Preferiti Generali'},
    'ru': {'global_palette': 'Общие избранные'},
    'vi': {'global_palette': 'Yêu thích chung'},
    'ca': {'global_palette': 'Favorits Generals'},
    'nl': {'global_palette': 'Algemene favorieten'},
    'pl': {'global_palette': 'Ulubione Ogólne'},
    'en': {'global_palette': 'General Favorites'},
    'es': {'global_palette': 'Favoritos Generales'}
}

with open('i18n.js', 'r', encoding='utf-8') as f:
    text = f.read()

for lang, additions in translations.items():
    pattern = rf'({lang}:\s*{{)(.*?)(\n\s*}},|\n\s*}})'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        inner = match.group(2)
        added = ",\n        " + ",\n        ".join([f'{k}: "{v}"' for k, v in additions.items()])
        new_block = match.group(1) + inner + added + match.group(3)
        text = text[:match.start()] + new_block + text[match.end():]

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
