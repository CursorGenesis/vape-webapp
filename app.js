// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    console.log('Telegram WebApp инициализирован:', tg);
    console.log('initData:', tg.initData);
    console.log('initDataUnsafe:', tg.initDataUnsafe);
}

// ========== DATA (Цены в СОМ) ==========
const products = [
    {
        id: 1, brand: 'Elf Bar', name: 'BC5000', puffs: 5000, category: 'elfbar', badge: 'Хит',
        variants: [
            { id: 'v1', name: 'Клубника Банан', emoji: '🍓', price: 850 },
            { id: 'v2', name: 'Манго Персик', emoji: '🥭', price: 850 },
            { id: 'v3', name: 'Арбуз Лёд', emoji: '🍉', price: 850 },
            { id: 'v4', name: 'Виноград', emoji: '🍇', price: 850 }
        ]
    },
    {
        id: 2, brand: 'Elf Bar', name: 'TE5000', puffs: 5000, category: 'elfbar',
        variants: [
            { id: 'v1', name: 'Черника', emoji: '🫐', price: 800 },
            { id: 'v2', name: 'Персик Лёд', emoji: '🍑', price: 800 },
            { id: 'v3', name: 'Кола', emoji: '🥤', price: 800 }
        ]
    },
    {
        id: 3, brand: 'HQD', name: 'Cuvie Plus', puffs: 1200, category: 'hqd', badge: 'Новинка',
        variants: [
            { id: 'v1', name: 'Черника Малина', emoji: '🫐', price: 550 },
            { id: 'v2', name: 'Киви Клубника', emoji: '🥝', price: 550 },
            { id: 'v3', name: 'Мята', emoji: '🌿', price: 550 }
        ]
    },
    {
        id: 4, brand: 'HQD', name: 'Surv+', puffs: 4500, category: 'hqd',
        variants: [
            { id: 'v1', name: 'Персик Лимонад', emoji: '🍑', price: 700 },
            { id: 'v2', name: 'Энергетик', emoji: '⚡', price: 700 },
            { id: 'v3', name: 'Апельсин', emoji: '🍊', price: 700 }
        ]
    },
    {
        id: 5, brand: 'HQD', name: 'Titan', puffs: 7000, category: 'hqd',
        variants: [
            { id: 'v1', name: 'Мята Холодок', emoji: '🌿', price: 900 },
            { id: 'v2', name: 'Ягодный Микс', emoji: '🍇', price: 900 }
        ]
    },
    {
        id: 6, brand: 'Waka', name: 'SoPro PA10000', puffs: 10000, category: 'waka', badge: 'Топ',
        variants: [
            { id: 'v1', name: 'Ежевика', emoji: '🫐', price: 1100 },
            { id: 'v2', name: 'Тропический Микс', emoji: '🏝️', price: 1100 },
            { id: 'v3', name: 'Вишня', emoji: '🍒', price: 1100 }
        ]
    },
    {
        id: 7, brand: 'Waka', name: 'SoMatch MB6000', puffs: 6000, category: 'waka',
        variants: [
            { id: 'v1', name: 'Апельсин Лёд', emoji: '🍊', price: 800 },
            { id: 'v2', name: 'Лимон Лайм', emoji: '🍋', price: 800 }
        ]
    },
    {
        id: 8, brand: 'Lost Mary', name: 'BM5000', puffs: 5000, category: 'lost-mary',
        variants: [
            { id: 'v1', name: 'Яблоко Груша', emoji: '🍏', price: 700 },
            { id: 'v2', name: 'Клубника Киви', emoji: '🍓', price: 700 }
        ]
    },
    {
        id: 9, brand: 'Lost Mary', name: 'OS5000', puffs: 5000, category: 'lost-mary', badge: 'Популярное',
        variants: [
            { id: 'v1', name: 'Вишня Кола', emoji: '🍒', price: 750 },
            { id: 'v2', name: 'Сахарная Вата', emoji: '🍬', price: 750 },
            { id: 'v3', name: 'Арбуз', emoji: '🍉', price: 750 }
        ]
    }
];

const CURRENCY = ' сом';
const DELIVERY_COST = 100; // сом

// ========== STATE ==========
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let currentPromo = null;
let selectedProduct = null;
let selectedVariant = null;

// ========== DOM ELEMENTS ==========
const pages = { catalog: document.getElementById('catalogPage'), favorites: document.getElementById('favoritesPage'), profile: document.getElementById('profilePage'), cart: document.getElementById('cartPage') };
const navItems = document.querySelectorAll('.nav-item');

// ========== NAVIGATION ==========
function switchPage(pageName) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    pages[pageName]?.classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
    if (pageName === 'favorites') renderFavorites();
    if (pageName === 'cart') renderCart();
}
navItems.forEach(item => item.addEventListener('click', () => switchPage(item.dataset.page)));

// ========== PRODUCTS ==========
function renderProducts(filter = 'all', search = '') {
    const grid = document.getElementById('productsGrid');
    let filtered = products;
    if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-image-wrap" onclick="openProduct(${p.id})">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                <button class="product-favorite ${favorites.includes(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${p.id})">❤️</button>
                <span>${p.variants[0].emoji}</span>
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-puffs-info">${p.puffs} затяжек</div>
                <div class="product-footer">
                    <span class="product-price">от ${Math.min(...p.variants.map(v => v.price))}${CURRENCY}</span>
                    <button class="quick-add-btn" onclick="event.stopPropagation(); openProduct(${p.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== FAVORITES ==========
function toggleFavorite(productId) {
    const idx = favorites.indexOf(productId);
    if (idx === -1) favorites.push(productId);
    else favorites.splice(idx, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderProducts(document.querySelector('.category-btn.active')?.dataset.category || 'all');
    if (pages.favorites.classList.contains('active')) renderFavorites();
}

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('favoritesEmpty');
    const favProducts = products.filter(p => favorites.includes(p.id));
    if (favProducts.length === 0) { grid.innerHTML = ''; empty.classList.add('show'); return; }
    empty.classList.remove('show');
    grid.innerHTML = favProducts.map(p => `
        <div class="product-card">
            <div class="product-image-wrap" onclick="openProduct(${p.id})">
                <button class="product-favorite active" onclick="event.stopPropagation(); toggleFavorite(${p.id})">❤️</button>
                <span>${p.variants[0].emoji}</span>
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-footer">
                    <span class="product-price">от ${Math.min(...p.variants.map(v => v.price))}${CURRENCY}</span>
                    <button class="quick-add-btn" onclick="event.stopPropagation(); openProduct(${p.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== PRODUCT MODAL ==========
function openProduct(productId) {
    selectedProduct = products.find(p => p.id === productId);
    selectedVariant = null;
    if (!selectedProduct) return;
    document.getElementById('modalProductImage').innerHTML = `<span>${selectedProduct.variants[0].emoji}</span>`;
    document.getElementById('modalProductName').textContent = `${selectedProduct.brand} ${selectedProduct.name}`;
    document.getElementById('modalProductPuffs').textContent = `${selectedProduct.puffs} затяжек`;
    const favBtn = document.getElementById('modalFavoriteBtn');
    favBtn.className = `favorite-btn ${favorites.includes(productId) ? 'active' : ''}`;
    favBtn.onclick = () => { toggleFavorite(productId); favBtn.classList.toggle('active'); };
    renderVariants();
    updateAddToCartBtn();
    openModal('productModal');
}

function renderVariants() {
    const grid = document.getElementById('variantsGrid');
    grid.innerHTML = selectedProduct.variants.map(v => `
        <div class="variant-item ${selectedVariant?.id === v.id ? 'selected' : ''}" onclick="selectVariant('${v.id}')">
            <span class="variant-emoji">${v.emoji}</span>
            <span class="variant-name">${v.name}</span>
        </div>
    `).join('');
}

function selectVariant(variantId) {
    selectedVariant = selectedProduct.variants.find(v => v.id === variantId);
    renderVariants();
    updateAddToCartBtn();
    document.getElementById('modalProductImage').innerHTML = `<span>${selectedVariant.emoji}</span>`;
}

function updateAddToCartBtn() {
    const btn = document.getElementById('addToCartModalBtn');
    const text = document.querySelector('.modal-action-text');
    if (selectedVariant) {
        btn.classList.add('enabled');
        btn.textContent = `В корзину • ${selectedVariant.price}${CURRENCY}`;
        text.textContent = selectedVariant.name;
        btn.onclick = () => addToCart();
    } else {
        btn.classList.remove('enabled');
        btn.textContent = 'В корзину';
        text.textContent = 'Сделайте свой выбор';
        btn.onclick = null;
    }
}

// ========== CART ==========
function addToCart() {
    if (!selectedProduct || !selectedVariant) return;
    const cartKey = `${selectedProduct.id}-${selectedVariant.id}`;
    const existing = cart.find(item => item.key === cartKey);
    if (existing) existing.qty++;
    else cart.push({ key: cartKey, productId: selectedProduct.id, variantId: selectedVariant.id, qty: 1 });
    saveCart();
    closeModal('productModal');
}

function updateCartItem(key, delta) {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('navCartBadge').textContent = count;
    document.getElementById('navCartBadge').dataset.count = count;
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const empty = document.getElementById('cartEmpty');
    const summary = document.getElementById('cartSummary');
    const totals = document.querySelector('.cart-totals');
    const promo = document.querySelector('.promo-section');
    const checkoutBtn = document.getElementById('checkoutMainBtn');
    if (cart.length === 0) {
        list.innerHTML = ''; empty.classList.add('show');
        summary.style.display = 'none'; totals.style.display = 'none'; promo.style.display = 'none'; checkoutBtn.style.display = 'none';
        return;
    }
    empty.classList.remove('show');
    summary.style.display = 'block'; totals.style.display = 'block'; promo.style.display = 'flex'; checkoutBtn.style.display = 'block';
    let subtotal = 0;
    list.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        if (!product || !variant) return '';
        const itemTotal = variant.price * item.qty;
        subtotal += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-img">${variant.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${product.brand} ${product.name}</div>
                    <div class="cart-item-variant">${variant.name}</div>
                    <div class="cart-item-bottom">
                        <span class="cart-item-price">${itemTotal}${CURRENCY}</span>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateCartItem('${item.key}', -1)">−</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" onclick="updateCartItem('${item.key}', 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    const discount = currentPromo ? Math.floor(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    document.getElementById('cartItemsCount').textContent = `${cart.reduce((s, i) => s + i.qty, 0)} товаров`;
    document.getElementById('cartTotalTop').textContent = `${total}${CURRENCY}`;
    document.getElementById('subtotal').textContent = `${subtotal}${CURRENCY}`;
    document.getElementById('discount').textContent = discount > 0 ? `-${discount}${CURRENCY}` : `0${CURRENCY}`;
    document.getElementById('finalTotal').textContent = `${total}${CURRENCY}`;
}

function applyPromo() {
    const input = document.getElementById('promoInput');
    const code = input.value.trim().toUpperCase();
    if (code === 'СКИДКА10' || code === 'SALE10' || code === 'BISHKEK') {
        currentPromo = code;
        input.style.borderColor = '#10b981';
        renderCart();
    } else {
        input.style.borderColor = '#ef4444';
        setTimeout(() => input.style.borderColor = '', 2000);
    }
}

// ========== CHECKOUT ==========
function openCheckout() {
    if (cart.length === 0) return;
    updateSavedAddresses();
    updateCheckoutTotal();
    openModal('checkoutModal');
}

function updateSavedAddresses() {
    const select = document.getElementById('savedAddress');
    select.innerHTML = '<option value="">Выберите сохранённый адрес</option>' +
        addresses.map((a, i) => `<option value="${i}">${a.name}: ${a.value.substring(0, 30)}...</option>`).join('');
}

function handleAddressChange() {
    const select = document.getElementById('savedAddress');
    const textarea = document.getElementById('deliveryAddress');
    if (select.value !== '') textarea.value = addresses[parseInt(select.value)].value;
}

function updateCheckoutTotal() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        return sum + (variant?.price || 0) * item.qty;
    }, 0);
    const discount = currentPromo ? Math.floor(subtotal * 0.1) : 0;
    const deliveryType = document.querySelector('input[name="delivery"]:checked')?.value;
    const deliveryCost = deliveryType === 'courier' ? DELIVERY_COST : 0;
    const total = subtotal - discount + deliveryCost;
    document.getElementById('checkoutProducts').textContent = `${subtotal}${CURRENCY}`;
    document.getElementById('checkoutDiscount').textContent = discount > 0 ? `-${discount}${CURRENCY}` : `0${CURRENCY}`;
    document.getElementById('checkoutDelivery').textContent = deliveryCost > 0 ? `${deliveryCost}${CURRENCY}` : 'Бесплатно';
    document.getElementById('checkoutTotal').textContent = `${total}${CURRENCY}`;
}

document.querySelectorAll('input[name="delivery"]').forEach(r => r.addEventListener('change', updateCheckoutTotal));

document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        return sum + (variant?.price || 0) * item.qty;
    }, 0);
    const discount = currentPromo ? Math.floor(subtotal * 0.1) : 0;
    const deliveryType = document.querySelector('input[name="delivery"]:checked')?.value;
    const deliveryCost = deliveryType === 'courier' ? DELIVERY_COST : 0;
    const order = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ru-RU'),
        items: cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.id === item.variantId);
            return { name: `${product?.brand} ${product?.name} - ${variant?.name}`, qty: item.qty, price: variant?.price };
        }),
        total: subtotal - discount + deliveryCost,
        status: 'pending',
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('deliveryAddress').value
        },
        delivery: deliveryType,
        discount: discount
    };
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    saveCart();
    currentPromo = null;

    // Отправляем данные в Telegram бота и закрываем Web App
    console.log('=== Отправка заказа ===');
    console.log('tg объект:', tg);
    console.log('tg.sendData функция:', typeof tg?.sendData);
    console.log('Заказ:', order);

    if (tg && typeof tg.sendData === 'function') {
        try {
            alert('Отправляю данные в бота...');
            tg.sendData(JSON.stringify(order));
            alert('sendData вызван, закрываю Web App...');
            tg.close();
        } catch (err) {
            alert('Ошибка: ' + err.message);
            console.error('Ошибка sendData:', err);
            closeModal('checkoutModal');
            openModal('successModal');
        }
    } else {
        alert('tg.sendData недоступен. tg=' + (tg ? 'есть' : 'нет'));
        // Если не в Telegram - показываем модалку
        closeModal('checkoutModal');
        openModal('successModal');
    }
});

// ========== ADDRESSES ==========
function openAddresses() { renderAddresses(); openModal('addressesModal'); }
function closeAddresses() { closeModal('addressesModal'); }

function renderAddresses() {
    const list = document.getElementById('addressesList');
    if (addresses.length === 0) { list.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:20px;">Нет сохранённых адресов</p>'; return; }
    list.innerHTML = addresses.map((a, i) => `
        <div class="address-item">
            <div class="address-item-header">
                <span class="address-name">${a.name}</span>
                <button class="delete-btn" onclick="deleteAddress(${i})">🗑️</button>
            </div>
            <div class="address-value">${a.value}</div>
        </div>
    `).join('');
}

function addNewAddress() { closeAddresses(); openModal('addAddressModal'); }
function closeAddAddress() { closeModal('addAddressModal'); }

function saveAddress(e) {
    e.preventDefault();
    addresses.push({ name: document.getElementById('addressName').value, value: document.getElementById('addressValue').value });
    localStorage.setItem('addresses', JSON.stringify(addresses));
    document.getElementById('addressName').value = '';
    document.getElementById('addressValue').value = '';
    closeAddAddress();
    openAddresses();
}

function deleteAddress(index) {
    addresses.splice(index, 1);
    localStorage.setItem('addresses', JSON.stringify(addresses));
    renderAddresses();
}

// ========== ORDERS ==========
function openOrders() { renderOrders(); openModal('ordersModal'); }
function closeOrders() { closeModal('ordersModal'); }

function renderOrders() {
    const list = document.getElementById('ordersList');
    const empty = document.getElementById('ordersEmpty');
    if (orders.length === 0) { list.innerHTML = ''; empty.classList.add('show'); return; }
    empty.classList.remove('show');
    list.innerHTML = orders.map(o => `
        <div class="order-item">
            <div class="order-item-header">
                <span class="order-date">${o.date}</span>
                <span class="order-status ${o.status}">${o.status === 'pending' ? 'В обработке' : 'Доставлен'}</span>
            </div>
            <div class="order-items">${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
            <div class="order-total">${o.total}${CURRENCY}</div>
        </div>
    `).join('');
}

// ========== ABOUT ==========
function openAbout() { openModal('aboutModal'); }
function closeAbout() { closeModal('aboutModal'); }

// ========== MODALS ==========
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}
function closeSuccess() { closeModal('successModal'); switchPage('catalog'); }

document.getElementById('closeProduct').onclick = () => closeModal('productModal');
document.getElementById('closeCheckout').onclick = () => closeModal('checkoutModal');
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal.id); });
});

// ========== SEARCH & FILTER ==========
document.getElementById('searchInput').addEventListener('input', e => {
    const category = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    renderProducts(category, e.target.value);
});
document.getElementById('categories').addEventListener('click', e => {
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts(e.target.dataset.category, document.getElementById('searchInput').value);
    }
});

// ========== INIT ==========
renderProducts();
updateCartBadge();
