const C = window.SUYU_CONFIG;
const LS = {
  products:'suyu_products_cache_v2', cart:'suyu_cart_v2', wish:'suyu_wishlist_v2', user:'suyu_user_v2', currency:'suyu_currency_v2', session:'suyu_session_v2'
};
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const params = new URLSearchParams(location.search);
let PRODUCTS = [];

function sid(){let v=localStorage.getItem(LS.session); if(!v){v='SES-'+Date.now()+'-'+Math.random().toString(16).slice(2); localStorage.setItem(LS.session,v)} return v}
function user(){try{return JSON.parse(localStorage.getItem(LS.user)||'null')}catch{return null}}
function setUser(u){localStorage.setItem(LS.user, JSON.stringify(u)); updateCounts()}
function cart(){try{return JSON.parse(localStorage.getItem(LS.cart)||'[]')}catch{return[]}}
function setCart(items){localStorage.setItem(LS.cart, JSON.stringify(items)); updateCounts(); syncCart()}
function wishes(){try{return JSON.parse(localStorage.getItem(LS.wish)||'[]')}catch{return[]}}
function setWishes(items){localStorage.setItem(LS.wish, JSON.stringify(items)); updateCounts()}
function currency(){return localStorage.getItem(LS.currency)||C.DEFAULT_CURRENCY}
function setCurrency(v){localStorage.setItem(LS.currency,v); location.reload()}
function isYes(v){return String(v||'').toUpperCase()==='SI'||String(v||'').toLowerCase()==='true'||v===true}

function toast(msg){const t=$('.toast'); if(!t) return; t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2600)}
function imgFallback(img){img.onerror=null; img.src='assets/img/productos/placeholder.svg'}
function normalizeProduct(p){
  const x={...p};
  const split=(v,sep='|')=>Array.isArray(v)?v:(v?String(v).split(sep).map(s=>s.trim()).filter(Boolean):[]);
  x.imagenes=split(x.imagenes); x.tallas_disponibles=split(x.tallas_disponibles); x.colores_producto=split(x.colores_producto);
  x.trenzas_opciones=Array.isArray(x.trenzas_opciones)?x.trenzas_opciones:split(x.trenzas_opciones).map(v=>{const [nombre,hex]=String(v).split(':');return{nombre:nombre||'',hex:hex||''}});
  x.tags=split(x.tags, ',');
  x.precio_base_usd=Number(x.precio_base_usd||x.precio_usd||0); x.precio_base_pen=Number(x.precio_base_pen||x.precio_pen||0);
  x.precio_oferta_usd=x.precio_oferta_usd===''?0:Number(x.precio_oferta_usd||0); x.precio_oferta_pen=x.precio_oferta_pen===''?0:Number(x.precio_oferta_pen||0);
  x.personalizacion_precio_usd=Number(x.personalizacion_precio_usd||0); x.personalizacion_precio_pen=Number(x.personalizacion_precio_pen||0);
  if(!x.imagen_principal) x.imagen_principal=x.imagenes[0]||'assets/img/productos/placeholder.svg';
  return x;
}
async function apiGet(action, data={}){
  const url=new URL(C.API_URL); url.searchParams.set('action', action); Object.entries(data).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='') url.searchParams.set(k,v)});
  const r=await fetch(url.toString(), {method:'GET'}); if(!r.ok) throw new Error('No se pudo conectar con Suyu'); return await r.json();
}
async function apiPost(action, payload={}){
  try{
    const r=await fetch(C.API_URL, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action,...payload})});
    if(!r.ok) throw new Error('Error de conexión');
    return await r.json();
  }catch(e){
    console.warn('POST fallback local:', e.message);
    return {ok:false, offline:true, error:e.message};
  }
}
async function loadProducts(force=false){
  const cached=localStorage.getItem(LS.products);
  if(cached&&!force){try{const c=JSON.parse(cached); if(Date.now()-c.time<C.CACHE_MINUTES*60000){PRODUCTS=c.items.map(normalizeProduct); return PRODUCTS}}catch{}}
  try{
    const data=await apiGet('products',{}); PRODUCTS=(data.products||[]).map(normalizeProduct);
    localStorage.setItem(LS.products, JSON.stringify({time:Date.now(),items:PRODUCTS}));
  }catch(e){PRODUCTS=(window.SUYU_FALLBACK_PRODUCTS||[]).map(normalizeProduct);}
  return PRODUCTS;
}
function baseUsd(p){if(p.precio_oferta_usd) return p.precio_oferta_usd; if(p.precio_base_usd) return p.precio_base_usd; return Number(p.precio_base_pen||0)/C.CURRENCIES.PEN.rate}
function oldUsd(p){if(p.precio_oferta_usd&&p.precio_base_usd) return p.precio_base_usd; return 0}
function money(usd){const cur=currency(), m=C.CURRENCIES[cur]||C.CURRENCIES.USD; return `${m.symbol} ${Number(usd*m.rate).toLocaleString('es-PE',{minimumFractionDigits:m.decimals,maximumFractionDigits:m.decimals})}`}
function productPriceHtml(p){const b=baseUsd(p), old=oldUsd(p); return `<span class="price ${old?'sale':''}">${money(b)}</span>${old?`<span class="old">${money(old)}</span>`:''}`}
function productCard(p){
  const w=wishes().includes(p.id); return `<article class="card"><a href="producto.html?slug=${encodeURIComponent(p.slug||p.id)}"><div class="card-img"><img src="${p.imagen_principal}" onerror="imgFallback(this)" alt="${p.nombre}"></div></a><button class="wish" onclick="toggleWish('${p.id}','${p.sku||''}')">${w?'♥':'♡'}</button><div class="card-body"><div>${productPriceHtml(p)}</div><a href="producto.html?slug=${encodeURIComponent(p.slug||p.id)}"><h3>${p.nombre}</h3></a><div class="muted">${p.genero||''} ${p.subcategoria||''}</div>${isYes(p.nuevo)?'<div>Nuevo · Envío disponible</div>':''}</div></article>`;
}
function filterProducts(){let arr=[...PRODUCTS]; const cat=params.get('cat'), q=params.get('q'); if(cat) arr=arr.filter(p=>[p.categoria,p.subcategoria,p.coleccion,p.genero].some(v=>String(v||'').toLowerCase()===cat.toLowerCase())); if(q){const s=q.toLowerCase(); arr=arr.filter(p=>[p.nombre,p.sku,p.modelo,p.version,p.coleccion,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(s))} return arr}
function updateCounts(){const c=cart().reduce((a,i)=>a+Number(i.cantidad||1),0), w=wishes().length; $$('.cart-count').forEach(e=>e.textContent=c); $$('.wish-count').forEach(e=>e.textContent=w); const u=user(); $$('.user-name').forEach(e=>e.textContent=u?u.nombres||u.email:'Cuenta')}
function initCurrency(){const s=$('#currency'); if(!s) return; s.value=currency(); s.onchange=()=>setCurrency(s.value)}
function toggleWish(id, sku=''){let w=wishes(); const u=user(); if(w.includes(id)){w=w.filter(x=>x!==id); toast('Producto eliminado de favoritos')}else{w.push(id); toast('Producto agregado a favoritos')} setWishes(w); if(u) apiPost('toggleWishlist',{user_id:u.user_id,product_id:id,sku}); setTimeout(()=>{if(location.pathname.includes('favoritos')) renderWishlist(); else renderAny()},100)}
function addToCart(item){const items=cart(); const key=[item.product_id,item.talla,item.trenza,item.personalizacion_izquierda||'',item.personalizacion_derecha||''].join('|'); const found=items.find(i=>i.key===key); if(found) found.cantidad+=item.cantidad||1; else items.push({...item,key,cantidad:item.cantidad||1}); setCart(items); toast('Agregado al carrito')}
function removeCart(key){setCart(cart().filter(i=>i.key!==key)); renderCart()}
function syncCart(){const u=user(); apiPost('saveCart',{user_id:u?.user_id||'',session_id:sid(),items:cart()})}
function renderAny(){if($('#homeTop')) renderHome(); if($('#productGrid')) renderCatalog(); if($('#productPage')) renderProduct(); if($('#cartItems')) renderCart(); if($('#wishlistGrid')) renderWishlist(); if($('#ordersList')) renderAccount(); if($('#checkoutForm')) renderCheckout();}
async function renderHome(){await loadProducts(); const top=PRODUCTS.filter(p=>isYes(p.top_ventas)||isYes(p.destacado)).slice(0,8); const nw=PRODUCTS.filter(p=>isYes(p.nuevo)).slice(0,8); const topEl=$('#homeTop'), newEl=$('#homeNew'); if(topEl) topEl.innerHTML=(top.length?top:PRODUCTS.slice(0,4)).map(productCard).join(''); if(newEl) newEl.innerHTML=(nw.length?nw:PRODUCTS.slice(0,4)).map(productCard).join('')}
async function renderCatalog(){await loadProducts(); const arr=filterProducts(); $('#productGrid').innerHTML=arr.length?arr.map(productCard).join(''):'<div class="empty">No encontramos productos con esos filtros.</div>'; const title=$('.page-title'); if(title){title.textContent=params.get('q')?`Resultados para ${params.get('q')}`:(params.get('cat')||'Catálogo')} const count=$('#resultCount'); if(count) count.textContent=`${arr.length} productos`}
async function renderProduct(){await loadProducts(); const key=params.get('slug')||params.get('id'); const p=PRODUCTS.find(x=>String(x.slug)===String(key)||String(x.id)===String(key)||String(x.sku)===String(key))||PRODUCTS[0]; if(!p){$('#productPage').innerHTML='<div class="empty">Producto no disponible.</div>'; return}
  const lace=(p.trenzas_opciones||[])[0]?.nombre||p.trenza_default||'Original';
  $('#productPage').innerHTML=`<section class="product-layout"><div><div class="gallery-main"><img id="mainImg" src="${p.imagen_principal}" onerror="imgFallback(this)" alt="${p.nombre}"></div><div class="thumbs">${(p.imagenes||[p.imagen_principal]).map(img=>`<button onclick="$('#mainImg').src='${img}'"><img src="${img}" onerror="imgFallback(this)" alt="${p.nombre}"></button>`).join('')}</div></div><div><div class="muted">${p.coleccion||''}</div><h1 class="product-title">${p.nombre}</h1><div>${productPriceHtml(p)}</div><p>${p.descripcion_corta||''}</p><h3>Talla</h3><div class="size-row" id="sizes">${(p.tallas_disponibles||[]).map((s,i)=>`<button class="size-btn ${i===0?'active':''}" data-size="${s}">${s}</button>`).join('')}</div>${isYes(p.personalizable)?`<h3>Color de trenzas</h3><div class="chips" id="laces">${(p.trenzas_opciones||[]).map((l,i)=>`<button class="lace-btn ${i===0?'active':''}" data-lace="${l.nombre}"><span class="lace-swatch" style="background:${l.hex||'#eee'}"></span>${l.nombre}</button>`).join('')}</div><button class="btn full" style="margin-top:14px" onclick="openPersonalize('${p.id}')">Añadir nombre →</button>`:''}<button class="btn black full" style="margin-top:14px" onclick="addProductToCart('${p.id}')">Agregar al carrito <span>▣</span></button><div class="notice">Compra segura. La disponibilidad se confirma al finalizar el pedido.</div><div class="accordion"><div class="acc-item"><div class="acc-title">Descripción <span>⌄</span></div><p>${p.descripcion_larga||p.descripcion_corta||''}</p></div><div class="acc-item"><div class="acc-title">Detalles <span>⌄</span></div><ul><li>SKU: ${p.sku||p.id}</li><li>Colección: ${p.coleccion||''}</li><li>Modelo: ${p.modelo||''} ${p.version||''}</li></ul></div><div class="acc-item"><div class="acc-title">Talla y ajuste <span>⌄</span></div><p>Te recomendamos elegir tu talla habitual. Si estás entre dos tallas, revisa la disponibilidad antes de pagar.</p></div></div></div></section>`;
  $$('#sizes .size-btn').forEach(b=>b.onclick=()=>{$$('#sizes .size-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  $$('#laces .lace-btn').forEach(b=>b.onclick=()=>{$$('#laces .lace-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  const rec=$('#homeTop'); if(rec) rec.innerHTML=PRODUCTS.filter(x=>x.id!==p.id).slice(0,4).map(productCard).join('');
}
function selectedProductOptions(){return {talla:$('#sizes .active')?.dataset.size||'', trenza:$('#laces .active')?.dataset.lace||''}}
function addProductToCart(id, custom={}){const p=PRODUCTS.find(x=>x.id===id); if(!p) return; const opt=selectedProductOptions(); if(!opt.talla){toast('Selecciona una talla');return} const personalization=(custom.left||custom.right)?(p.personalizacion_precio_usd||0):0; addToCart({product_id:p.id,sku:p.sku,nombre:p.nombre,talla:opt.talla,trenza:opt.trenza||p.trenza_default||'',personalizacion_izquierda:custom.left||'',personalizacion_derecha:custom.right||'',precio_unitario:baseUsd(p)+personalization,subtotal:baseUsd(p)+personalization,imagen:p.imagen_principal,cantidad:1})}
function openPersonalize(id){const p=PRODUCTS.find(x=>x.id===id); const modal=$('#modal'); modal.innerHTML=`<div class="sheet"><button class="iconbtn" style="float:right" onclick="closeModal()">×</button><h1 class="page-title" style="font-size:34px">Personalización</h1><p>${p.nombre}</p><input id="leftText" class="field" maxlength="10" placeholder="Pie izquierdo (A-Z, 0-9)"><input id="rightText" class="field" maxlength="10" placeholder="Pie derecho (A-Z, 0-9)"><button class="btn black full" onclick="addProductToCart('${id}',{left:$('#leftText').value,right:$('#rightText').value});closeModal()">Agregar al carrito ${money(p.personalizacion_precio_usd||0)} →</button><p class="muted">Los productos personalizados no se pueden devolver salvo defecto de fabricación.</p></div>`; modal.classList.add('open')}
function closeModal(){const m=$('#modal'); if(m){m.classList.remove('open'); m.innerHTML=''}}
function totals(){const sub=cart().reduce((a,i)=>a+Number(i.precio_unitario||0)*Number(i.cantidad||1),0); const ship=sub>=C.SHIPPING_FREE_FROM_USD||sub===0?0:C.SHIPPING_USD; return {sub,ship,total:sub+ship}}
function renderCart(){const el=$('#cartItems'); if(!el) return; const items=cart(); if(!items.length){el.innerHTML='<div class="empty">Tu carrito está vacío.</div>'; $('.summary .btn')?.setAttribute('disabled','disabled')} else el.innerHTML=items.map(i=>`<div class="cart-item"><img src="${i.imagen}" onerror="imgFallback(this)" alt="${i.nombre}"><div><h3>${i.nombre}</h3><p class="muted">Talla: ${i.talla} · Trenzas: ${i.trenza}</p>${i.personalizacion_izquierda||i.personalizacion_derecha?`<p>Personalización: Izquierda ${i.personalizacion_izquierda||'-'} · Derecha ${i.personalizacion_derecha||'-'}</p>`:''}<div>${money(i.precio_unitario)} × ${i.cantidad}</div><button class="btn" onclick="removeCart('${i.key}')">Eliminar</button></div></div>`).join(''); const t=totals(); $$('.subTotal').forEach(e=>e.textContent=money(t.sub)); $$('.shipTotal').forEach(e=>e.textContent=t.ship?money(t.ship):'Gratis'); $$('.grandTotal').forEach(e=>e.textContent=money(t.total))}
async function renderWishlist(){await loadProducts(); const arr=PRODUCTS.filter(p=>wishes().includes(p.id)); $('#wishlistGrid').innerHTML=arr.length?`<div class="grid">${arr.map(productCard).join('')}</div>`:'<div class="empty">Tu lista de deseos está vacía.</div>'}
async function login(){const email=$('#loginEmail')?.value.trim(), name=$('#loginName')?.value.trim(); if(!email){toast('Ingresa tu correo');return} const names=name.split(' '); const local={user_id:'USR-'+btoa(email).replace(/=/g,'').slice(0,14),email,nombres:names[0]||'',apellidos:names.slice(1).join(' '),provider:'email',moneda_preferida:currency()}; const res=await apiPost('upsertUser',{user:local}); if(res.ok&&res.user_id)local.user_id=res.user_id; setUser(local); toast('Sesión iniciada'); setTimeout(()=>location.href='cuenta.html',600)}
async function renderAccount(){const u=user(); if(!u){$('#ordersList').innerHTML='<div class="empty">Inicia sesión para ver tus pedidos.</div>'; return} $('.account-email')&&( $('.account-email').textContent=u.email ); let html='<div class="loading">Cargando pedidos...</div>'; $('#ordersList').innerHTML=html; try{const r=await apiGet('userOrders',{user_id:u.user_id,email:u.email}); const orders=r.orders||[]; $('#ordersList').innerHTML=orders.length?orders.reverse().map(o=>`<div class="order-card"><div class="summary-row"><strong>Pedido ${o.order_id}</strong><strong>${money(Number(o.total||0)/(C.CURRENCIES[o.moneda||currency()]?.rate||1))}</strong></div><p>Estado: ${o.estado_pago} · ${o.estado_orden}</p><p class="muted">${o.fecha?new Date(o.fecha).toLocaleDateString('es-PE'):''}</p>${(o.items||[]).map(i=>`<p>${i.cantidad} × ${i.nombre} · ${i.talla}</p>`).join('')}</div>`).join(''):'<div class="empty">Aún no tienes pedidos registrados.</div>'}catch(e){$('#ordersList').innerHTML='<div class="empty">No se pudieron cargar tus pedidos en este momento.</div>'}}
function renderCheckout(){renderCart(); const u=user(); if(u){$('#email').value=u.email||''; $('#name').value=[u.nombres,u.apellidos].filter(Boolean).join(' ')} const country=$('#country'); if(country){country.onchange=renderPaymentOptions; renderPaymentOptions()}}
function renderPaymentOptions(){const cc=$('#country')?.value||'PE'; const mp=C.MERCADOPAGO_COUNTRIES.includes(cc); const box=$('#paymentOptions'); if(!box) return; box.innerHTML=`<button class="btn black full" onclick="placeOrder('PayPal')">Pagar con PayPal →</button>${mp?`<button class="btn full" onclick="placeOrder('Mercado Pago')">Pagar con Mercado Pago →</button>`:''}<p class="muted">${mp?'Puedes elegir PayPal o Mercado Pago según tu preferencia.':'Para este país el pago disponible es PayPal.'}</p>`}
async function placeOrder(gateway){const items=cart(); if(!items.length){toast('Tu carrito está vacío'); return} const email=$('#email').value.trim(), name=$('#name').value.trim(), country=$('#country').value; if(!email||!name){toast('Completa tus datos de contacto'); return} const u=user(); const t=totals(); const address=[$('#address').value,$('#city').value,$('#state').value,$('#zip').value].filter(Boolean).join(', '); const payload={user_id:u?.user_id||'',email_cliente:email,pasarela:gateway,moneda:currency(),subtotal:t.sub,descuento:0,envio:t.ship,total:t.total,pais_envio:country,direccion_envio:address,telefono:$('#phone').value,notas_cliente:'',items:items.map(i=>({...i,subtotal:Number(i.precio_unitario)*Number(i.cantidad||1)}))}; const r=await apiPost('createOrder',payload); if(r.ok){localStorage.setItem('suyu_last_order', JSON.stringify({order_id:r.order_id,gateway,total:t.total,moneda:currency()})); setCart([]); location.href=`gracias.html?order_id=${encodeURIComponent(r.order_id)}&gateway=${encodeURIComponent(gateway)}`} else {toast('No se pudo registrar el pedido. Intenta nuevamente.')}}
async function markPaidFromUrl(){const id=params.get('order_id'), status=params.get('status'), payment=params.get('payment_id'); if(id&&status&&status.toLowerCase().includes('paid')) await apiPost('markOrderPaid',{order_id:id,estado:'PAGADO',payment_id:payment||'',pasarela:params.get('gateway')||''})}
function searchInit(){const input=$('#searchInput'); if(!input) return; input.oninput=()=>{const q=input.value.trim(); const list=$('#suggestions'); if(q.length<2){list.innerHTML='<a href="catalogo.html?cat=Zapatillas">Zapatillas</a><a href="catalogo.html?cat=Qosqo Street">Qosqo Street</a><a href="catalogo.html?q=sneakers">Sneakers</a>';return} const matches=PRODUCTS.filter(p=>p.nombre.toLowerCase().includes(q.toLowerCase())).slice(0,6); list.innerHTML=matches.map(p=>`<a href="producto.html?slug=${p.slug}">${p.nombre}</a>`).join('')+`<a href="catalogo.html?q=${encodeURIComponent(q)}">Ver resultados para “${q}”</a>`}; input.onkeydown=e=>{if(e.key==='Enter'&&input.value.trim()) location.href='catalogo.html?q='+encodeURIComponent(input.value.trim())}}
async function boot(){initCurrency(); updateCounts(); await loadProducts(); renderAny(); searchInit(); markPaidFromUrl()}
document.addEventListener('DOMContentLoaded', boot);
