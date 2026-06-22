# Instrucciones rápidas

1. Sube esta carpeta completa a tu repositorio de GitHub Pages.
2. Mantén la URL del Apps Script en `assets/js/config.js`.
3. Los productos se cargan desde Google Sheets mediante la acción `products`.
4. Los pedidos se registran con la acción `createOrder`.
5. Los usuarios se registran con la acción `upsertUser`.
6. Los favoritos se sincronizan con la acción `toggleWishlist` cuando el cliente inició sesión.
7. El carrito se guarda con la acción `saveCart`.

## Imágenes

Sube cada imagen en:

`assets/img/productos/`

Usa nombres basados en SKU:

`assets/img/productos/SKU-01.jpg`
`assets/img/productos/SKU-02.jpg`
`assets/img/productos/SKU-03.jpg`

En la columna `imagenes` de la hoja coloca:

`assets/img/productos/SKU-01.jpg|assets/img/productos/SKU-02.jpg|assets/img/productos/SKU-03.jpg`

## Trenzas

En `trenzas_opciones` usa este formato:

`Original gris:#8A8A82|Blanco:#F7F7F2|Negro:#111111`

