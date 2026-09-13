with open('i18n.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('name_palette: "Palette name:"', 'name_palette: "Palette name:",\n        cancel: "Cancel",\n        ok: "OK"')
js = js.replace('name_palette: "Nombre de la paleta:"', 'name_palette: "Nombre de la paleta:",\n        cancel: "Cancelar",\n        ok: "Aceptar"')

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done")
