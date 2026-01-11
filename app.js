// ========================================
// Telegram Web App Integration
// ========================================
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// ========================================
// Products Data
// ========================================
const products = [
    { id: 1, brand: 'Elf Bar', name: 'BC5000', flavor: 'Клубника Банан', price: 1200, puffs: 5000, category: 'elfbar', emoji: '🍓', badge: 'Хит' },
    { id: 2, brand: 'Elf Bar', name: 'BC3000', flavor: 'Манго Персик', price: 900, puffs: 3000, category: 'elfbar', emoji: '🥭' },
    { id: 3, brand: 'Elf Bar', name: 'TE5000', flavor: 'Виноград', price: 1100, puffs: 5000, category: 'elfbar', emoji: '🍇' },
    { id: 4, brand: 'Elf Bar', name: 'BC5000', flavor: 'Арбуз Лёд', price: 1200, puffs: 5000, category: 'elfbar', emoji: '🍉' },
    { id: 5, brand: 'HQD', name: 'Cuvie Plus', flavor: 'Черника Малина', price: 800, puffs: 1200, category: 'hqd', emoji: '🫐', badge: 'Новинка' },
    { id: 6, brand: 'HQD', name: 'Surv+', flavor: 'Киви Клубника', price: 1000, puffs: 4500, category: 'hqd', emoji: '🥝' },
    { id: 7, brand: 'HQD', name: 'Cuvie Air', flavor: 'Персик Лимонад', price: 750, puffs: 1000, category: 'hqd', emoji: '🍑' },
    { id: 8, brand: 'HQD', name: 'Titan', flavor: 'Мята Холодок', price: 1300, puffs: 7000, category: 'hqd', emoji: '🌿' },
    { id: 9, brand: 'Waka', name: 'SoPro PA10000', flavor: 'Ежевика', price: 1500, puffs: 10000, category: 'waka', emoji: '🫐', badge: 'Топ' },
    { id: 10, brand: 'Waka', name: 'SoMatch MB6000', flavor: 'Апельсин Лёд', price: 1100, puffs: 6000, category: 'waka', emoji: '🍊' },
    { id: 11, brand: 'Waka', name: 'SoPro PA10000', flavor: 'Тропический Микс', price: 1500, puffs: 10000, category: 'waka', emoji: '🏝️' },
    { id: 12, brand: 'Lost Mary', name: 'BM5000', flavor: 'Яблоко Груша', price: 950, puffs: 5000, category: 'lost-mary', emoji: '🍏' },
    { id: 13, brand: 'Lost Mary', name: 'OS5000', flavor: 'Вишня Кола', price: 1000, puffs: 5000, category: 'lost-mary', emoji: '🍒', badge: 'Популярное' },
    { id: 14, brand: 'Lost Mary', name: 'MO5000', flavor: 'Сахарная Вата', price: 1050, puffs: 5000, category: 'lost-mary', emoji: '🍬' }
];

// ========================================
// Cart State
// ========================================
let cart = [];

// ========================================
// DOM Elements
// ========================================
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const successModal = document.getElementById('successModal');
const successBtn = document.getElementById('successBtn');
const searchInput = document.getElementById('searchInput');
const categoriesContainer = document.getElementById('categories');
const summaryProducts = document.getElementById('summaryProducts');
const summaryDelivery = document.getElementById('summaryDelivery');
const summaryTotal = document.getElementById('summaryTotal');

// ========================================
// Render Products
// ========================================
function renderProducts(productsToRender) {
    productsGrid.innerHTML = productsToRender.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.05}s">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <span style="font-size: 4rem;">${product.emoji}</span>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-flavor">${product.flavor} • ${product.puffs} затяжек</div>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" id="addBtn-${product.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// Cart Functions
// ========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    const btn = document.getElementById(`addBtn-${productId}`);
    if (btn) {
        btn.classList.add('added');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
        }, 1000);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    renderCartItems();
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.add('pulse');
    setTimeout(() => cartCount.classList.remove('pulse'), 300);
    const isEmpty = cart.length === 0;
    cartEmpty.classList.toggle('show', isEmpty);
    cartFooter.classList.toggle('show', !isEmpty);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `${totalPrice.toLocaleString()} ₽`;
    if (tg) {
        if (cart.length > 0) {
            tg.MainButton.setText(`Оформить заказ • ${totalPrice.toLocaleString()} ₽`);
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    }
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        return;
    }
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.emoji}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.brand} ${item.name}</div>
                <div class="cart-item-flavor">${item.flavor}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ========================================
// Modal Functions
// ========================================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// Checkout Functions
// ========================================
function updateCheckoutSummary() {
    const productTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    const deliveryCost = deliveryType === 'courier' ? 300 : 0;
    summaryProducts.textContent = `${productTotal.toLocaleString()} ₽`;
    summaryDelivery.textContent = deliveryCost > 0 ? `${deliveryCost} ₽` : 'Бесплатно';
    summaryTotal.textContent = `${(productTotal + deliveryCost).toLocaleString()} ₽`;
}

function submitOrder(e) {
    e.preventDefault();
    const formData = new FormData(checkoutForm);
    const orderData = {
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('deliveryAddress').value
        },
        delivery: formData.get('delivery'),
        items: cart.map(item => ({
            id: item.id,
            name: `${item.brand} ${item.name} - ${item.flavor}`,
            price: item.price,
            quantity: item.quantity
        })),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + (formData.get('delivery') === 'courier' ? 300 : 0)
    };
    if (tg) {
        tg.sendData(JSON.stringify(orderData));
    } else {
        console.log('Order data:', orderData);
    }
    closeModal(checkoutModal);
    openModal(successModal);
    cart = [];
    updateCartUI();
    renderCartItems();
    checkoutForm.reset();
}

// ========================================
// Search & Filter Functions
// ========================================
function filterProducts(category) {
    const searchTerm = searchInput.value.toLowerCase();
    let filtered = products;
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.flavor.toLowerCase().includes(searchTerm)
        );
    }
    renderProducts(filtered);
}

// ========================================
// Event Listeners
// ========================================
cartBtn.addEventListener('click', () => {
    renderCartItems();
    openModal(cartModal);
});
closeCart.addEventListener('click', () => closeModal(cartModal));
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeModal(cartModal);
});
checkoutBtn.addEventListener('click', () => {
    closeModal(cartModal);
    updateCheckoutSummary();
    openModal(checkoutModal);
});
closeCheckout.addEventListener('click', () => closeModal(checkoutModal));
checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeModal(checkoutModal);
});
checkoutForm.addEventListener('submit', submitOrder);
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', updateCheckoutSummary);
});
successBtn.addEventListener('click', () => closeModal(successModal));
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) closeModal(successModal);
});
searchInput.addEventListener('input', () => {
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    filterProducts(activeCategory);
});
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filterProducts(e.target.dataset.category);
    }
});
if (tg) {
    tg.MainButton.onClick(() => {
        updateCheckoutSummary();
        openModal(checkoutModal);
    });
}

// ========================================
// Initialize
// ========================================
renderProducts(products);
updateCartUI();
