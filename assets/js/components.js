(function () {
  const ICONS = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h15l-1.5 9h-12z"/><path d="M6 8 5 4H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V21h14V10.5"/></svg>'
  };

  const headerLogo = 'assets/img/logo-suyu.png';
  const footerLogo = 'assets/img/logo-suyu-white.png';

  const navLinks = `
    <div class="navitem"><a href="catalogo.html?cat=Mujer">MUJER</a><div class="mega"><a href="catalogo.html?cat=Mujer">Todo mujer</a><a href="catalogo.html?cat=Mujer&sub=Zapatillas">Zapatillas</a><a href="catalogo.html?cat=Mujer&sub=Camisas">Camisas</a><a href="catalogo.html?cat=Mujer&sub=Accesorios">Accesorios</a><a href="catalogo.html?cat=Mujer&sub=Carteras">Carteras</a></div></div>
    <div class="navitem"><a href="catalogo.html?cat=Hombre">HOMBRE</a><div class="mega"><a href="catalogo.html?cat=Hombre">Todo hombre</a><a href="catalogo.html?cat=Hombre&sub=Zapatillas">Zapatillas</a><a href="catalogo.html?cat=Hombre&sub=Camisas">Camisas</a><a href="catalogo.html?cat=Hombre&sub=Gorras">Gorras</a><a href="catalogo.html?cat=Hombre&sub=Accesorios">Accesorios</a></div></div>
    <div class="navitem"><a href="catalogo.html?cat=Unisex">UNISEX</a><div class="mega"><a href="catalogo.html?cat=Unisex">Todo unisex</a><a href="catalogo.html?cat=Unisex&sub=Zapatillas">Zapatillas</a><a href="catalogo.html?cat=Unisex&sub=Polos">Polos</a><a href="catalogo.html?cat=Unisex&sub=Hoodies">Hoodies</a><a href="catalogo.html?cat=Unisex&sub=Accesorios">Accesorios</a></div></div>
    <div class="navitem"><a href="catalogo.html?cat=Zapatillas">ZAPATILLAS</a><div class="mega"><a href="catalogo.html?cat=Zapatillas">Todas las zapatillas</a><a href="catalogo.html?cat=Urban">Urban</a><a href="catalogo.html?cat=Lite">Lite</a><a href="catalogo.html?cat=Trek">Trek</a><a href="catalogo.html?cat=Techno">Techno</a></div></div>
    <div class="navitem"><a href="catalogo.html?cat=Colecciones">COLECCIONES</a><div class="mega mega-right"><a href="catalogo.html?cat=Qosqo%20Street">Qosqo Street</a><a href="catalogo.html?cat=Studio%20Streetwear">Studio Streetwear</a><a href="catalogo.html?cat=The%20Hunter%20Studio">The Hunter Studio</a><a href="catalogo.html?cat=Inti%20Raymi%2027">Inti Raymi 27</a></div></div>
  `;

  function renderHeader() {
    const target = document.getElementById('site-header');
    if (!target) return;

    target.innerHTML = `
      <div class="topbar">NUEVAS COLECCIONES · ENVÍOS INTERNACIONALES A TODOS LOS PAÍSES DEL MUNDO</div>
      <header class="header">
        <nav class="nav">
          <a class="brand brand-logo image-only" href="index.html" aria-label="Suyu Streetwear - Inicio">
            <img src="${headerLogo}" alt="Suyu Streetwear" loading="eager">
          </a>
          <div class="navlinks">${navLinks}</div>
          <div class="spacer"></div>
          <select id="currency" class="field currency-select" aria-label="Seleccionar moneda">
            <option>USD</option><option>PEN</option><option>CLP</option><option>ARS</option><option>COP</option><option>MXN</option><option>BRL</option><option>UYU</option><option>EUR</option>
          </select>
          <input class="search desktop" placeholder="Buscar" onkeydown="if(event.key==='Enter') location.href='catalogo.html?q='+encodeURIComponent(this.value)">
          <a class="iconbtn" href="buscar.html" aria-label="Buscar">${ICONS.search}</a>
          <a class="iconbtn" href="cuenta.html" aria-label="Cuenta">${ICONS.user}</a>
          <a class="iconbtn" href="favoritos.html" aria-label="Favoritos">${ICONS.heart}<span class="badge wish-count">0</span></a>
          <a class="iconbtn" href="carrito.html" aria-label="Carrito">${ICONS.cart}<span class="badge cart-count">0</span></a>
        </nav>
      </header>`;
  }

  function renderFooter() {
    const target = document.getElementById('site-footer');
    if (!target) return;

    target.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="${footerLogo}" alt="Suyu Streetwear" class="footer-logo" loading="lazy">
            <p>Streetwear con identidad propia. Diseños urbanos, detalles premium y envíos internacionales.</p>
            <div class="footer-contact">
              <a href="mailto:contacto@suyustreetwear.com">contacto@suyustreetwear.com</a>
              <a href="https://wa.me/51900000000" target="_blank" rel="noopener">WhatsApp: +51 900 000 000</a>
            </div>
          </div>
          <div class="footer-col">
            <h3>Comprar</h3>
            <a href="catalogo.html?cat=Hombre">Hombre</a>
            <a href="catalogo.html?cat=Mujer">Mujer</a>
            <a href="catalogo.html?cat=Unisex">Unisex</a>
            <a href="catalogo.html?cat=Zapatillas">Zapatillas</a>
            <a href="catalogo.html?cat=Colecciones">Colecciones</a>
          </div>
          <div class="footer-col">
            <h3>Ayuda</h3>
            <a href="cuenta.html">Mi cuenta</a>
            <a href="cuenta.html">Mis pedidos</a>
            <a href="checkout.html">Métodos de pago</a>
            <a href="#">Cambios y devoluciones</a>
            <a href="#">Libro de reclamaciones</a>
          </div>
          <div class="footer-col">
            <h3>Legal</h3>
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Política de cookies</a>
            <a href="#">Política de compras</a>
            <a href="#">Uso de la web</a>
          </div>
          <div class="footer-col">
            <h3>Empresa</h3>
            <a href="#">Sobre Suyu</a>
            <a href="#">Proveedores</a>
            <a href="#">Plan de sostenibilidad</a>
            <a href="#">Trabaja con nosotros</a>
            <a href="#">Prensa</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Suyu Streetwear. Todos los derechos reservados.</span>
          <span>PayPal · Mercado Pago · Envíos internacionales</span>
        </div>
      </footer>`;
  }

  function renderBottomNav() {
    const target = document.getElementById('site-bottomnav');
    if (!target) return;

    target.innerHTML = `<nav class="bottomnav"><a href="index.html" aria-label="Inicio">${ICONS.home}</a><a href="buscar.html" aria-label="Buscar">${ICONS.search}</a><a href="favoritos.html" aria-label="Favoritos">${ICONS.heart}<span class="badge wish-count">0</span></a><a href="carrito.html" aria-label="Carrito">${ICONS.cart}<span class="badge cart-count">0</span></a><a href="cuenta.html" aria-label="Cuenta">${ICONS.user}</a></nav>`;
  }

  renderHeader();
  renderFooter();
  renderBottomNav();
})();
