const SHEETS = ['Users','Profiles','Carts','Wishlists','Orders','Payments','Events'];
function doGet(){ return json({ok:true,app:'Suyu Streetwear API'}); }
function doPost(e){
  const body = JSON.parse(e.postData.contents || '{}');
  const action = body.action;
  const payload = body.payload || {};
  setupSheets();
  if(action === 'user_upsert') return json(upsertUser(payload));
  if(action === 'profile_update') return json(appendRow('Profiles', payload));
  if(action === 'cart_add') return json(appendRow('Carts', payload));
  if(action === 'wishlist_add') return json(appendRow('Wishlists', payload));
  if(action === 'order_create') return json(createOrder(payload));
  if(action === 'payment_update') return json(appendRow('Payments', payload));
  return json(appendRow('Events', {action, payload}));
}
function json(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
function setupSheets(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const headers = {
    Users:['createdAt','email','name','provider','country','currency','lastLogin'],
    Profiles:['createdAt','email','name','phone','document','country','city','address'],
    Carts:['createdAt','user','productId','size','custom','price'],
    Wishlists:['createdAt','user','productId'],
    Orders:['createdAt','orderId','email','name','items','total','currency','status','paymentProvider','paymentId'],
    Payments:['createdAt','orderId','provider','status','amount','currency','raw'],
    Events:['createdAt','action','payload']
  };
  SHEETS.forEach(name=>{let sh=ss.getSheetByName(name)||ss.insertSheet(name); if(sh.getLastRow()===0) sh.appendRow(headers[name]);});
}
function appendRow(sheetName, obj){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const heads=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row=heads.map(h=> h==='createdAt' ? new Date() : (typeof obj[h]==='object' ? JSON.stringify(obj[h]) : (obj[h] ?? '')));
  sh.appendRow(row); return {ok:true, sheet:sheetName};
}
function upsertUser(u){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const values=sh.getDataRange().getValues();
  const email=(u.email||'').toLowerCase();
  for(let i=1;i<values.length;i++){
    if(String(values[i][1]).toLowerCase()===email){ sh.getRange(i+1,7).setValue(new Date()); return {ok:true, updated:true}; }
  }
  sh.appendRow([new Date(), email, u.name||'', u.provider||'email', u.country||'', u.currency||'', new Date()]);
  return {ok:true, created:true};
}
function createOrder(o){
  appendRow('Orders', {orderId:o.id, email:o.user&&o.user.email, name:o.user&&o.user.name, items:o.items, total:o.total, currency:o.currency, status:o.status||'pendiente', paymentProvider:o.paymentProvider||'', paymentId:o.paymentId||''});
  return {ok:true, orderId:o.id};
}
