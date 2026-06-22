# Suyu Streetwear

Web app responsive para ecommerce de Suyu Streetwear.

## Publicación en GitHub Pages
1. Sube todos los archivos a un repositorio.
2. En GitHub: Settings > Pages > Deploy from branch > main / root.
3. Abre la URL pública generada por GitHub Pages.

## Base de datos Google Sheets + Apps Script
1. Crea una Google Sheet llamada `Suyu Streetwear DB`.
2. Abre Extensiones > Apps Script.
3. Copia el contenido de `backend/Code.gs`.
4. Ejecuta `setupSheets()` una vez y autoriza permisos.
5. Implementar > Nueva implementación > Aplicación web.
6. Acceso: `Cualquier persona`.
7. Copia la URL del Web App y pégala en `assets/js/config.js` en `apiUrl`.

## Pasarelas de pago
- PayPal: pega tu Client ID en `paypalClientId`.
- Mercado Pago: pega tu Public Key o URL de Checkout Pro en `mercadoPagoPublicKey` / `mercadoPagoCheckoutUrl`.

Mercado Pago opera oficialmente en Argentina, Brasil, Chile, Colombia, México, Perú y Uruguay. PayPal indica disponibilidad en más de 200 países/regiones y soporte de 25 monedas. Verificar siempre las condiciones de tu cuenta antes de activar cobros.

## Archivos principales
- `index.html`: Home final orientada a conversión.
- `catalogo.html`: catálogo con filtros visuales.
- `producto.html`: ficha de producto con tallas y personalización.
- `carrito.html`: carrito.
- `checkout.html`: checkout.
- `favoritos.html`: lista de deseos.
- `buscar.html`: búsqueda.
- `login.html`: acceso.
- `cuenta.html`: cuenta del cliente.
