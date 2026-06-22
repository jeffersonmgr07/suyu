(function(){
  const COMPONENTS = [
    { selector: '[data-component="header"]', url: 'components/header.html' },
    { selector: '[data-component="footer"]', url: 'components/footer.html' },
    { selector: '[data-component="bottomnav"]', url: 'components/bottomnav.html' }
  ];

  async function loadComponent(item){
    const mount = document.querySelector(item.selector);
    if(!mount) return;
    const response = await fetch(item.url, { cache: 'no-store' });
    if(!response.ok) throw new Error('No se pudo cargar ' + item.url);
    mount.outerHTML = await response.text();
  }

  window.loadSuyuComponents = async function(){
    await Promise.all(COMPONENTS.map(loadComponent));
  };
})();
