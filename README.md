# Suyu Streetwear

Proyecto web conectado a Google Sheets mediante Apps Script.

## Backend activo

La URL configurada está en `assets/js/config.js`:

`https://script.google.com/macros/s/AKfycbxL1p4ZrQvOyHITHysayjkidYPh1UzLBcxa5Qv6-Hw_wdJhP9ylHq-NPm3cahgpZZ6k/exec`

## Productos

Los productos se leen desde la hoja `Productos` del Google Sheet conectado al Apps Script. Las columnas importantes son:

- `id`
- `sku`
- `slug`
- `nombre`
- `categoria`
- `subcategoria`
- `coleccion`
- `genero`
- `descripcion_corta`
- `descripcion_larga`
- `precio_base_usd`
- `precio_base_pen`
- `precio_oferta_usd`
- `precio_oferta_pen`
- `tallas_disponibles`
- `trenzas_opciones`
- `imagenes`
- `imagen_principal`
- `personalizable`
- `estado`
- `destacado`
- `nuevo`
- `top_ventas`

## Imágenes

Sube las imágenes a:

`assets/img/productos/`

Ejemplo:

`assets/img/productos/SUYU-QOSQO-URBAN-GR-001-01.jpg`

En la hoja, en `imagenes`, coloca varias rutas separadas por `|`.

## Publicación

Sube todos los archivos de esta carpeta a GitHub Pages.
