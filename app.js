'use strict';

const products = [
  {id:'n1',category:'nails',name:'Cuadrada',price:118,desc:'Bordes rectos y punta plana. Un clásico resistente, limpio y elegante.',img:'cuadrada.webp',badge:'Un clásico'},
  {id:'n2',category:'nails',name:'Almendra',price:122,desc:'Una silueta suave que se afina hacia la punta y estiliza tus dedos.',img:'almendra.webp',badge:'Delicada'},
  {id:'n3',category:'nails',name:'Coffin / Ballerina',price:225,desc:'Larga, con laterales afinados y punta recta. Para un look con actitud.',img:'coffin.webp',badge:'Statement look'},
  {id:'n4',category:'nails',name:'Stiletto',price:228,desc:'Punta afilada y silueta alargada. Atrevida, glamurosa y con personalidad.',img:'stiletto.webp',badge:'Atrévete'},
  {id:'n5',category:'nails',name:'Ovalada',price:120,desc:'Punta suavemente redondeada. Elegante, práctica y fácil de llevar.',img:'ovalada.webp',badge:'Sutil & chic'},
  {id:'n6',category:'nails',name:'Redonda',price:115,desc:'Sigue la forma natural de tu uña. Ideal si prefieres llevarlas cortas.',img:'redonda.webp',badge:'Natural mood'},
  {id:'l1',category:'lashes',name:'Clásicas (1D)',price:135,desc:'Una extensión por pestaña natural. Efecto rímel limpio y discreto.',img:'clasicas.webp',badge:'Natural look'},
  {id:'l2',category:'lashes',name:'Híbridas',price:145,desc:'Clásicas y pequeños abanicos de volumen. El equilibrio entre definición e intensidad.',img:'hibridas.webp',badge:'El equilibrio'},
  {id:'l3',category:'lashes',name:'Volumen ruso',price:155,desc:'Abanicos de 2 a 6 extensiones ultrafinas para una mirada densa y glamurosa.',img:'volumen_ruso.webp',badge:'Extra volumen'},
  {id:'l4',category:'lashes',name:'Mega volumen',price:270,desc:'Fibras muy finas en abanicos grandes. Intensidad y un efecto dramático.',img:'mega_volumen.webp',badge:'Mirada intensa'},
  {id:'l5',category:'lashes',name:'Racimo / Flare',price:125,desc:'Pequeños grupos de 3 a 5 pestañas para autoaplicación temporal.',img:'racimo.webp',badge:'DIY · Temporal'},
  {id:'l6',category:'lashes',name:'Postizas en tira',price:100,desc:'Una sola pieza que cubre el párpado. Un toque especial para tus eventos.',img:'tira.webp',badge:'Para tu evento'}
];
const byId = new Map(products.map(product => [product.id, product]));
const storageKey = 'loki-selection-v2';
const money = value => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const $ = selector => document.querySelector(selector);
let category = 'nails';
let toastTimer;
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    const seen = new Set();
    cart = saved.filter(item => item && byId.has(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20 && !seen.has(item.id) && seen.add(item.id)).map(({id,quantity}) => ({id,quantity}));
  }
} catch { /* The catalogue also works when browser storage is unavailable. */ }

function persistCart() {
  try { localStorage.setItem(storageKey,JSON.stringify(cart)); } catch { /* Keep the current selection in memory. */ }
}
const countItems = () => cart.reduce((sum,item) => sum + item.quantity,0);
const cartTotal = () => cart.reduce((sum,item) => sum + byId.get(item.id).price * item.quantity,0);
function notify(message) {
  clearTimeout(toastTimer);
  $('#toastText').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'),2800);
}
function renderProducts() {
  const sort = $('#sortProducts').value;
  const visible = products.filter(product => product.category === category);
  if (sort === 'price-low') visible.sort((a,b) => a.price-b.price);
  if (sort === 'price-high') visible.sort((a,b) => b.price-a.price);
  $('#productsGrid').innerHTML = visible.map(product => {
    const selected = cart.find(item => item.id === product.id);
    return `<article class="product-card"><button class="product-photo" data-detail="${product.id}" aria-label="Ver detalle de ${product.name}"><img src="images/${product.img}" alt="${category === 'nails' ? 'Uñas' : 'Pestañas'}: ${product.name}" loading="lazy" width="600" height="600"><span class="product-badge">${product.badge}</span><span class="photo-zoom" aria-hidden="true">↗</span></button><div class="product-heading"><h3>${product.name}</h3><span class="product-price">${money(product.price)}</span></div><p class="product-description">${product.desc}</p><button class="product-add${selected ? ' added' : ''}" data-add="${product.id}" aria-label="Agregar ${product.name} a mi selección"><span>${selected ? `En tu selección (${selected.quantity}) · Agregar` : 'Agregar a mi selección'}</span>${icon(selected ? 'check' : 'plus')}</button></article>`;
  }).join('');
  $('#categoryDescription').textContent = category === 'nails' ? 'Seis formas de llevar tu personalidad hasta las puntas.' : 'De lo natural a lo intenso. Encuentra tu forma de mirar.';
  $('#productPanel').setAttribute('aria-labelledby',`tab-${category}`);
  $('#resultCount').textContent = `${visible.length} estilos`;
  document.querySelectorAll('[data-category]').forEach(tab => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}
function changeCategory(value,focusTab = false) {
  if (!['nails','lashes'].includes(value)) return;
  category = value;
  renderProducts();
  if (focusTab) $(`#tab-${value}`).focus();
}
function refreshProductButtons() {
  document.querySelectorAll('[data-add]').forEach(button => {
    const selected = cart.find(item => item.id === button.dataset.add);
    if (!button.classList.contains('product-add')) return;
    button.classList.toggle('added',Boolean(selected));
    button.innerHTML = `<span>${selected ? `En tu selección (${selected.quantity}) · Agregar` : 'Agregar a mi selección'}</span>${icon(selected ? 'check' : 'plus')}`;
  });
}
function renderCart() {
  const count = countItems();
  $('#cartCount').textContent = count;
  $('#drawerCount').textContent = `(${count})`;
  $('#openCart').setAttribute('aria-label',`Mi selección, ${count} ${count === 1 ? 'estilo' : 'estilos'}`);
  $('#cartFooter').hidden = cart.length === 0;
  $('#cartTotal').textContent = money(cartTotal());
  if (!cart.length) {
    $('#cartItems').innerHTML = `<div class="empty-cart">${icon('bag')}<h3>Aquí empieza<br>tu próximo look.</h3><p>Agrega tus uñas y pestañas favoritas. Las guardaremos para cuando vuelvas.</p><button class="button button-dark" id="emptyExplore">Explorar estilos ${icon('arrow')}</button></div>`;
  } else {
    $('#cartItems').innerHTML = cart.map(item => {
      const product = byId.get(item.id);
      return `<article class="cart-item"><img src="images/${product.img}" alt="${product.name}" width="76" height="93"><div class="cart-item-info"><div class="cart-item-top"><div><h3>${product.name}</h3><p class="cart-item-category">${product.category === 'nails' ? 'Uñas' : 'Pestañas'} · ${money(product.price)} c/u</p></div><span class="cart-item-price">${money(product.price * item.quantity)}</span></div><div class="cart-item-bottom"><div class="quantity-control"><button data-quantity="${item.id}" data-delta="-1" aria-label="Disminuir cantidad de ${product.name}">${icon('minus')}</button><span aria-label="Cantidad">${item.quantity}</span><button data-quantity="${item.id}" data-delta="1" aria-label="Aumentar cantidad de ${product.name}" ${item.quantity >= 20 ? 'disabled' : ''}>${icon('plus')}</button></div><button class="remove-button" data-remove="${item.id}" aria-label="Quitar ${product.name}">Quitar</button></div></div></article>`;
    }).join('');
  }
  refreshProductButtons();
}
function addToCart(id) {
  const product = byId.get(id);
  if (!product) return;
  const current = cart.find(item => item.id === id);
  if (current?.quantity >= 20) { notify('Puedes agregar hasta 20 de cada estilo.'); return; }
  if (current) current.quantity++;
  else cart.push({id,quantity:1});
  persistCart();
  renderCart();
  notify(`${product.name} se sumó a tu selección`);
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}
function closeDialog(id) { document.getElementById(id).close(); }
function showDetail(id) {
  const product = byId.get(id);
  if (!product) return;
  $('#detailContent').innerHTML = `<div class="detail-inner"><img class="detail-image" src="images/${product.img}" alt="${product.name}, detalle del estilo" width="600" height="700"><div class="detail-copy"><p class="eyebrow">${product.category === 'nails' ? 'LA FORMA DE TU ESTILO' : 'EL PODER DE TU MIRADA'}</p><h2 id="detailTitle">${product.name}</h2><p>${product.desc}</p><p class="detail-price">${money(product.price)} <small>MXN</small></p><button class="button button-dark" data-add="${product.id}" data-from-detail="true">Agregar a mi selección ${icon('plus')}</button></div></div>`;
  openDialog('detailDialog');
}
function showSummary() {
  if (!cart.length) return;
  $('#summaryItems').innerHTML = cart.map(item => `<div class="summary-item"><span>${item.quantity} × ${byId.get(item.id).name}</span><span>${money(byId.get(item.id).price * item.quantity)}</span></div>`).join('');
  $('#summaryTotal').textContent = money(cartTotal());
  closeDialog('cartDialog');
  openDialog('summaryDialog');
}
function downloadSummary() {
  if (!cart.length) return;
  const method = $('input[name="payment"]:checked').value === 'tarjeta' ? 'Tarjeta' : 'Efectivo';
  const now = new Date();
  const date = now.toLocaleString('es-MX',{dateStyle:'long',timeStyle:'short'});
  const lines = [
    'LOKI · SALÓN DE BELLEZA','RESUMEN DE MI SELECCIÓN',date,'',
    ...cart.map(item => `${item.quantity} × ${byId.get(item.id).name} · ${money(byId.get(item.id).price)} c/u = ${money(byId.get(item.id).price * item.quantity)}`),
    '',`TOTAL ESTIMADO: ${money(cartTotal())} MXN`,`Preferencia de pago en el salón: ${method}`,'',
    'PAGO PENDIENTE · CITA POR CONFIRMAR',
    'Este resumen no es un comprobante de pago ni una reserva.',
    'Consulta disponibilidad y confirma tus servicios y forma de pago directamente con Loki.','',
    'Tu belleza, a tu manera.'
  ];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\r\n')],{type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `mi-seleccion-loki-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  // A dialog is in the top layer; display the download notice inside it.
  const button = $('#downloadSummary');
  button.innerHTML = `${icon('check')}Resumen descargado`;
  setTimeout(() => { button.innerHTML = `${icon('download')}Descargar mi selección`; },3000);
}
function closeMenu() {
  $('#mobileNav').hidden = true;
  $('#menuToggle').setAttribute('aria-expanded','false');
  $('#menuToggle').setAttribute('aria-label','Abrir menú');
}
document.addEventListener('click',event => {
  const button = event.target.closest('button');
  if (button?.dataset.add) {
    addToCart(button.dataset.add);
    if (button.dataset.fromDetail) closeDialog('detailDialog');
  }
  if (button?.dataset.detail) showDetail(button.dataset.detail);
  if (button?.dataset.close) closeDialog(button.dataset.close);
  if (button?.dataset.category) changeCategory(button.dataset.category);
  if (button?.dataset.quantity) {
    const item = cart.find(item => item.id === button.dataset.quantity);
    if (!item) return;
    const id = item.id;
    const delta = Number(button.dataset.delta);
    item.quantity = Math.min(20,item.quantity + delta);
    cart = cart.filter(item => item.quantity > 0);
    persistCart();renderCart();
    const nextFocus = document.querySelector(`[data-quantity="${id}"][data-delta="${delta}"]:not(:disabled)`);
    (nextFocus || $('#cartDialog .icon-button')).focus();
  }
  if (button?.dataset.remove) {
    const name = byId.get(button.dataset.remove).name;
    cart = cart.filter(item => item.id !== button.dataset.remove);
    persistCart();renderCart();
    const next = $('#cartItems [data-remove]') || $('#emptyExplore');
    next?.focus();
    $('#cartDialog').setAttribute('aria-label',`${name} eliminado de tu selección`);
  }
  if (button?.id === 'emptyExplore') { closeDialog('cartDialog'); location.hash = 'coleccion'; }
  const categoryLink = event.target.closest('[data-category-link]');
  if (categoryLink) changeCategory(categoryLink.dataset.categoryLink);
  if (event.target.closest('.mobile-nav a')) closeMenu();
});
$('#openCart').addEventListener('click',() => { $('#cartDialog').removeAttribute('aria-label');openDialog('cartDialog'); });
$('#sortProducts').addEventListener('change',renderProducts);
$('#prepareSummary').addEventListener('click',showSummary);
$('#downloadSummary').addEventListener('click',downloadSummary);
$('#backToCart').addEventListener('click',() => { closeDialog('summaryDialog');openDialog('cartDialog'); });
$('#menuToggle').addEventListener('click',() => {
  const opening = $('#mobileNav').hidden;
  $('#mobileNav').hidden = !opening;
  $('#menuToggle').setAttribute('aria-expanded',String(opening));
  $('#menuToggle').setAttribute('aria-label',opening ? 'Cerrar menú' : 'Abrir menú');
});
$('.category-tabs').addEventListener('keydown',event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  changeCategory(event.key === 'Home' ? 'nails' : event.key === 'End' ? 'lashes' : category === 'nails' ? 'lashes' : 'nails',true);
});
document.addEventListener('keydown',event => { if (event.key === 'Escape') closeMenu(); });
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
window.addEventListener('storage',event => {
  if (event.key !== storageKey) return;
  // Reloading an external selection always runs the same bounded validation.
  try {
    const incoming = JSON.parse(event.newValue || '[]');
    if (!Array.isArray(incoming)) return;
    const seen = new Set();
    cart = incoming.filter(item => item && byId.has(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20 && !seen.has(item.id) && seen.add(item.id)).map(({id,quantity}) => ({id,quantity}));
    renderCart();
    if ($('#summaryDialog').open) {
      closeDialog('summaryDialog');openDialog('cartDialog');
    }
  } catch { /* Ignore invalid cross-tab storage. */ }
});
$('#year').textContent = new Date().getFullYear();
renderProducts();
renderCart();
