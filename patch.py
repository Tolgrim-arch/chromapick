import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Nav Tab
html = html.replace('<button class="nav-tab" data-view="view-converter" data-i18n="tab_converter">Converter</button>',
                   '<button class="nav-tab" data-view="view-converter" data-i18n="tab_converter">Converter</button>\n            <button class="nav-tab" data-view="view-favorites" data-i18n="tab_favorites">Favoritos</button>')

# 2. Add Heart to Extractor
heart_html = '''<div class="heart-container" title="Save to Favorites">
            <input type="checkbox" class="checkbox fav-heart-checkbox">
            <div class="svg-container">
                <svg viewBox="0 0 24 24" class="svg-outline" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                </svg>
                <svg viewBox="0 0 24 24" class="svg-filled" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                </svg>
                <svg class="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="10,10 20,20"></polygon><polygon points="10,50 20,50"></polygon><polygon points="20,80 30,70"></polygon><polygon points="90,10 80,20"></polygon><polygon points="90,50 80,50"></polygon><polygon points="80,80 70,70"></polygon>
                </svg>
            </div>
        </div>'''

extractor_replacement = f'''<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <h3 data-i18n="selected_color" style="margin-bottom: 0;">Selected Color</h3>
                            {heart_html}
                        </div>'''

html = html.replace('<h3 data-i18n="selected_color">Selected Color</h3>', extractor_replacement)

# 3. Add Heart to Converter
# We can inject it into .picker-actions next to the copy button.
html = html.replace('<button class="icon-btn copy-btn" data-target="picker-hex"', f'{heart_html}\n                              <button class="icon-btn copy-btn" data-target="picker-hex"')

# 4. Add Favorites View
favorites_view_html = '''
    <div id="view-favorites" class="app-view">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 data-i18n="saved_palettes">Paletas Guardadas</h2>
            <button id="btn-new-palette" class="add-palette-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span data-i18n="new_palette">Nueva Paleta</span>
            </button>
        </div>
        <div id="palettes-container" class="palettes-grid">
            <!-- Rendered by JS -->
        </div>
    </div>
</main>'''

html = html.replace('</main>', favorites_view_html)

# 5. Link favorites.js
html = html.replace('</body>', '    <script src="favorites.js?v=1"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Done")
