# Configuración de pasarelas reales - Suyu Streetwear

En Apps Script abre **Project Settings > Script properties** y agrega:

## PayPal
- `PAYPAL_CLIENT_ID` = tu Client ID
- `PAYPAL_CLIENT_SECRET` = tu Secret
- `PAYPAL_ENV` = `sandbox` o `live`

## Mercado Pago
- `MP_ACCESS_TOKEN` = tu Access Token
- `MP_PUBLIC_KEY` = tu Public Key, opcional por ahora

## Sitio
- `SITE_URL` = URL pública de GitHub Pages, por ejemplo `https://usuario.github.io/suyu-streetwear`

Después de pegar el nuevo `Code.gs`, vuelve a **Implementar > Administrar implementaciones > Editar > Nueva versión > Implementar**.

Notas:
- Nunca coloques Secret ID ni Access Token en HTML o JavaScript público. Solo van en Script properties.
- El checkout crea primero la orden como `PENDIENTE`, luego crea el pago real y redirige a PayPal o Mercado Pago.
- PayPal se captura desde Apps Script al regresar del pago.
- Mercado Pago se verifica desde la página `gracias.html` usando el `payment_id` que devuelve Mercado Pago.
