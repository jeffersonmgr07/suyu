/**
 * SUYU STREETWEAR - BACKEND GOOGLE SHEETS
 * Public API for products, users, carts, wishlists and orders.
 * Deploy as Web App: Execute as Me / Anyone.
 */

const SHEETS = {
  PRODUCTS: 'Productos',
  USERS: 'Usuarios',
  ORDERS: 'Ordenes',
  ITEMS: 'OrderItems',
  WISHLISTS: 'Wishlists',
  CARTS: 'Carritos',
  EVENTS: 'Eventos',
  PAYMENTS: 'Pagos',
  CONFIG: 'Configuracion'
};

function doGet(e) {
  try {
    const action = String((e.parameter.action || 'products')).trim();
    if (action === 'products') return jsonResponse(getProducts_(e.parameter));
    if (action === 'product') return jsonResponse(getProduct_(e.parameter.slug || e.parameter.id));
    if (action === 'userOrders') return jsonResponse(getUserOrders_(e.parameter.user_id || e.parameter.email));
    if (action === 'wishlist') return jsonResponse(getWishlist_(e.parameter.user_id));
    if (action === 'config') return jsonResponse(getConfig_());
    return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
    const action = String(body.action || '').trim();
    if (action === 'upsertUser') return jsonResponse(upsertUser_(body.user || {}));
    if (action === 'saveCart') return jsonResponse(saveCart_(body));
    if (action === 'toggleWishlist') return jsonResponse(toggleWishlist_(body));
    if (action === 'createOrder') return jsonResponse(createOrder_(body));
    if (action === 'markOrderPaid') return jsonResponse(markOrderPaid_(body));
    if (action === 'logEvent') return jsonResponse(logEvent_(body));
    return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

function jsonResponse(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('No existe la hoja: ' + name);
  return sh;
}

function headers_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}

function rowsAsObjects_(sh) {
  const h = headers_(sh);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, h.length).getValues().map((row, i) => {
    const obj = { _row: i + 2 };
    h.forEach((key, idx) => obj[key] = row[idx]);
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  const sh = sheet_(sheetName);
  const h = headers_(sh);
  const row = h.map(k => obj[k] !== undefined ? obj[k] : '');
  sh.appendRow(row);
  return obj;
}

function updateObjectRow_(sh, rowNumber, obj) {
  const h = headers_(sh);
  const current = sh.getRange(rowNumber, 1, 1, h.length).getValues()[0];
  const next = h.map((k, i) => obj[k] !== undefined ? obj[k] : current[i]);
  sh.getRange(rowNumber, 1, 1, h.length).setValues([next]);
}

function makeId_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function getConfig_() {
  const list = rowsAsObjects_(sheet_(SHEETS.CONFIG));
  const obj = {};
  list.forEach(r => obj[r.clave] = r.valor);
  return { ok: true, config: obj };
}

function getProducts_(params) {
  const rows = rowsAsObjects_(sheet_(SHEETS.PRODUCTS));
  let products = rows.filter(p => String(p.estado).toUpperCase() === 'ACTIVO');
  if (params.categoria) products = products.filter(p => String(p.categoria).toLowerCase() === String(params.categoria).toLowerCase());
  if (params.coleccion) products = products.filter(p => String(p.coleccion).toLowerCase() === String(params.coleccion).toLowerCase());
  if (params.q) {
    const q = String(params.q).toLowerCase();
    products = products.filter(p => [p.nombre, p.sku, p.coleccion, p.tags].join(' ').toLowerCase().includes(q));
  }
  return { ok: true, products: products.map(normalizeProduct_) };
}

function getProduct_(key) {
  const rows = rowsAsObjects_(sheet_(SHEETS.PRODUCTS));
  const product = rows.find(p => String(p.slug) === String(key) || String(p.id) === String(key) || String(p.sku) === String(key));
  if (!product) return { ok: false, error: 'Producto no encontrado' };
  return { ok: true, product: normalizeProduct_(product) };
}

function normalizeProduct_(p) {
  const obj = Object.assign({}, p);
  delete obj._row;
  obj.imagenes = split_(p.imagenes);
  obj.tallas_disponibles = split_(p.tallas_disponibles);
  obj.colores_producto = split_(p.colores_producto);
  obj.trenzas_opciones = split_(p.trenzas_opciones).map(v => {
    const parts = String(v).split(':');
    return { nombre: parts[0] || '', hex: parts[1] || '' };
  });
  obj.tags = split_(p.tags, ',');
  return obj;
}

function split_(value, sep) {
  if (!value) return [];
  return String(value).split(sep || '|').map(s => s.trim()).filter(Boolean);
}

function upsertUser_(user) {
  if (!user.email && !user.user_id) throw new Error('Falta email o user_id');
  const sh = sheet_(SHEETS.USERS);
  const rows = rowsAsObjects_(sh);
  const found = rows.find(u => String(u.user_id) === String(user.user_id) || String(u.email).toLowerCase() === String(user.email).toLowerCase());
  const now = new Date();
  const base = {
    user_id: user.user_id || makeId_('USR'),
    fecha_registro: now,
    provider: user.provider || 'email',
    email: user.email || '',
    nombres: user.nombres || '',
    apellidos: user.apellidos || '',
    telefono: user.telefono || '',
    pais: user.pais || '',
    moneda_preferida: user.moneda_preferida || 'USD',
    paypal_email: user.paypal_email || '',
    estado: 'ACTIVO',
    ultimo_login: now,
    acepta_marketing: user.acepta_marketing || 'NO'
  };
  if (found) {
    base.user_id = found.user_id;
    updateObjectRow_(sh, found._row, base);
    return { ok: true, user_id: found.user_id, status: 'updated' };
  }
  appendObject_(SHEETS.USERS, base);
  return { ok: true, user_id: base.user_id, status: 'created' };
}

function saveCart_(body) {
  const items = body.items || [];
  const userId = body.user_id || '';
  const sessionId = body.session_id || '';
  if (!userId && !sessionId) throw new Error('Falta user_id o session_id');
  const sh = sheet_(SHEETS.CARTS);
  const rows = rowsAsObjects_(sh);
  rows.filter(r => String(r.user_id) === String(userId) || String(r.session_id) === String(sessionId))
    .reverse().forEach(r => sh.deleteRow(r._row));
  items.forEach(item => appendObject_(SHEETS.CARTS, {
    cart_id: makeId_('CART'), user_id: userId, session_id: sessionId,
    product_id: item.product_id, sku: item.sku, talla: item.talla, trenza: item.trenza,
    personalizacion_izquierda: item.personalizacion_izquierda || '',
    personalizacion_derecha: item.personalizacion_derecha || '',
    cantidad: item.cantidad || 1, precio_unitario: item.precio_unitario || 0,
    fecha_actualizacion: new Date()
  }));
  return { ok: true, saved: items.length };
}

function toggleWishlist_(body) {
  if (!body.user_id || !body.product_id) throw new Error('Falta user_id o product_id');
  const sh = sheet_(SHEETS.WISHLISTS);
  const rows = rowsAsObjects_(sh);
  const found = rows.find(w => String(w.user_id) === String(body.user_id) && String(w.product_id) === String(body.product_id) && String(w.estado) === 'ACTIVO');
  if (found) {
    updateObjectRow_(sh, found._row, { estado: 'ELIMINADO' });
    return { ok: true, active: false };
  }
  appendObject_(SHEETS.WISHLISTS, {
    wishlist_id: makeId_('WISH'), user_id: body.user_id, product_id: body.product_id,
    sku: body.sku || '', fecha: new Date(), estado: 'ACTIVO'
  });
  return { ok: true, active: true };
}

function getWishlist_(userId) {
  const rows = rowsAsObjects_(sheet_(SHEETS.WISHLISTS));
  return { ok: true, items: rows.filter(w => String(w.user_id) === String(userId) && String(w.estado) === 'ACTIVO') };
}

function createOrder_(body) {
  const orderId = makeId_('ORD');
  const items = body.items || [];
  const order = {
    order_id: orderId, fecha: new Date(), user_id: body.user_id || '', email_cliente: body.email_cliente || '',
    estado_pago: 'PENDIENTE', estado_orden: 'NUEVA', pasarela: body.pasarela || '', payment_id: '',
    moneda: body.moneda || 'USD', subtotal: body.subtotal || 0, descuento: body.descuento || 0,
    envio: body.envio || 0, total: body.total || 0, pais_envio: body.pais_envio || '',
    direccion_envio: body.direccion_envio || '', telefono: body.telefono || '', tracking: '',
    notas_cliente: body.notas_cliente || '', fecha_actualizacion: new Date()
  };
  appendObject_(SHEETS.ORDERS, order);
  items.forEach((item, idx) => appendObject_(SHEETS.ITEMS, {
    item_id: makeId_('ITM') + '-' + idx, order_id: orderId, product_id: item.product_id,
    sku: item.sku, nombre: item.nombre, talla: item.talla, trenza: item.trenza,
    personalizacion_izquierda: item.personalizacion_izquierda || '',
    personalizacion_derecha: item.personalizacion_derecha || '',
    cantidad: item.cantidad || 1, precio_unitario: item.precio_unitario || 0,
    subtotal: item.subtotal || 0, imagen: item.imagen || ''
  }));
  return { ok: true, order_id: orderId };
}

function markOrderPaid_(body) {
  if (!body.order_id) throw new Error('Falta order_id');
  const sh = sheet_(SHEETS.ORDERS);
  const rows = rowsAsObjects_(sh);
  const found = rows.find(o => String(o.order_id) === String(body.order_id));
  if (!found) throw new Error('Orden no encontrada');
  updateObjectRow_(sh, found._row, {
    estado_pago: body.estado || 'PAGADO', estado_orden: 'EN_PREPARACION',
    pasarela: body.pasarela || found.pasarela, payment_id: body.payment_id || '', fecha_actualizacion: new Date()
  });
  appendObject_(SHEETS.PAYMENTS, {
    payment_id: body.payment_id || makeId_('PAY'), fecha: new Date(), order_id: body.order_id,
    pasarela: body.pasarela || found.pasarela, estado: body.estado || 'PAGADO', moneda: body.moneda || found.moneda,
    monto: body.monto || found.total, payer_email: body.payer_email || '', raw_response: JSON.stringify(body.raw_response || {})
  });
  return { ok: true };
}

function getUserOrders_(userKey) {
  const orders = rowsAsObjects_(sheet_(SHEETS.ORDERS)).filter(o => String(o.user_id) === String(userKey) || String(o.email_cliente).toLowerCase() === String(userKey).toLowerCase());
  const items = rowsAsObjects_(sheet_(SHEETS.ITEMS));
  return { ok: true, orders: orders.map(o => {
    const copy = Object.assign({}, o);
    delete copy._row;
    copy.items = items.filter(i => String(i.order_id) === String(o.order_id)).map(i => { delete i._row; return i; });
    return copy;
  }) };
}

function logEvent_(body) {
  appendObject_(SHEETS.EVENTS, {
    event_id: makeId_('EVT'), fecha: new Date(), tipo: body.tipo || '', user_id: body.user_id || '',
    session_id: body.session_id || '', product_id: body.product_id || '', order_id: body.order_id || '',
    detalle: body.detalle || '', ip_pais: body.ip_pais || ''
  });
  return { ok: true };
}
