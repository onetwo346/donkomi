// Cart functionality
class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.updateCartCount();
    }

    bindEvents() {
        // Cart button click
        document.querySelector('.cart-btn').addEventListener('click', () => {
            this.toggleCart();
        });

        // Close cart button
        document.getElementById('closeCart').addEventListener('click', () => {
            this.toggleCart();
        });

        // Cart overlay click
        document.getElementById('cartOverlay').addEventListener('click', () => {
            this.toggleCart();
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const product = this.getProductFromCard(productCard);
                this.addItem(product);
            });
        });

        // Checkout button
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            this.checkout();
        });
    }

    getProductFromCard(card) {
        const name = card.querySelector('h3').textContent;
        const category = card.querySelector('.product-category').textContent;
        const price = parseFloat(card.querySelector('.current-price').textContent.replace('₵', ''));
        const image = card.querySelector('img').src;
        
        return {
            id: Date.now() + Math.random(),
            name,
            category,
            price,
            image,
            quantity: 1
        };
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }

        this.updateCart();
        this.showNotification('Product added to cart!');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateCart();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.updateCart();
        }
    }

    updateCart() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.renderCart();
        this.updateCartCount();
        this.saveToStorage();
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const totalAmount = document.querySelector('.total-amount');

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmount.textContent = '₵0.00';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-category">${item.category}</p>
                    <div class="cart-item-price">₵${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        totalAmount.textContent = `₵${this.total.toFixed(2)}`;
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Show checkout modal
        this.showCheckoutModal();
    }

    showCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-modal-content">
                <div class="checkout-header">
                    <h3>Checkout</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form class="checkout-form">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" placeholder="+233 XX XXX XXXX" required>
                    </div>
                    <div class="form-group">
                        <label for="address">Delivery Address (Kumasi)</label>
                        <textarea id="address" placeholder="Enter your Kumasi address..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="payment">Payment Method</label>
                        <select id="payment" required>
                            <option value="">Select payment method</option>
                            <option value="mobile-money">Mobile Money (MTN, Vodafone, AirtelTigo)</option>
                            <option value="cash">Cash on Delivery</option>
                        </select>
                    </div>
                    <div class="order-summary">
                        <h4>Order Summary</h4>
                        <div class="summary-items">
                            ${this.items.map(item => `
                                <div class="summary-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="summary-total">
                            <strong>Total: ₵${this.total.toFixed(2)}</strong>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">Place Order</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Form submission
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder(modal);
        });
    }

    processOrder(modal) {
        const formData = new FormData(modal.querySelector('form'));
        const orderData = {
            customer: {
                name: formData.get('name') || document.getElementById('name').value,
                phone: formData.get('phone') || document.getElementById('phone').value,
                address: formData.get('address') || document.getElementById('address').value,
                payment: formData.get('payment') || document.getElementById('payment').value
            },
            items: this.items,
            total: this.total,
            orderId: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            status: 'pending',
            location: 'Kumasi, Ghana'
        };

        // Simulate order processing
        this.showNotification('Processing your order...', 'info');
        
        setTimeout(() => {
            this.showNotification('Order placed successfully! Order ID: ' + orderData.orderId, 'success');
            
            // Save order to local storage for admin dashboard
            this.saveOrderToStorage(orderData);
            
            this.items = [];
            this.updateCart();
            this.toggleCart();
            document.body.removeChild(modal);
            
            // Show order confirmation
            this.showOrderConfirmation(orderData);
        }, 2000);
    }

    saveOrderToStorage(orderData) {
        const existingOrders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
        existingOrders.unshift(orderData);
        localStorage.setItem('donkomi-orders', JSON.stringify(existingOrders));
    }

    showOrderConfirmation(orderData) {
        const confirmation = document.createElement('div');
        confirmation.className = 'order-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Order Confirmed!</h3>
                <p>Your order has been placed successfully.</p>
                <div class="order-details">
                    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                    <p><strong>Total:</strong> ₵${orderData.total.toFixed(2)}</p>
                    <p><strong>Payment:</strong> ${orderData.customer.payment}</p>
                    <p><strong>Location:</strong> ${orderData.location}</p>
                </div>
                <p class="delivery-info">You will receive a confirmation SMS shortly. Our Kumasi team will contact you to confirm payment and delivery details.</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Continue Shopping</button>
            </div>
        `;

        document.body.appendChild(confirmation);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    saveToStorage() {
        localStorage.setItem('donkomi-cart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('donkomi-cart');
        if (saved) {
            const data = JSON.parse(saved);
            this.items = data.items || [];
            this.total = data.total || 0;
        }
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add to cart animation
function addToCartAnimation(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Search functionality
document.querySelector('.nav-search input').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
        const category = product.querySelector('.product-category').textContent.toLowerCase();
        
        if (name.includes(query) || category.includes(query)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
});

// Newsletter subscription
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    if (email) {
        // Simulate subscription
        const button = this.querySelector('button');
        const originalText = button.textContent;
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Subscribed!';
            this.querySelector('input[type="email"]').value = '';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        }, 1000);
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.category-card, .product-card, .promo-card').forEach(el => {
    observer.observe(el);
});

// Initialize cart
const cart = new Cart();

// Admin portal function
function openAdminPortal() {
    window.open('admin.html', '_blank');
}

// Add CSS for additional components
const additionalStyles = `
    .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #e2e8f0;
    }

    .cart-item-image img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 10px;
    }

    .cart-item-details h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
    }

    .cart-item-category {
        color: #64748b;
        font-size: 0.9rem;
        margin: 0;
    }

    .cart-item-price {
        font-weight: 600;
        color: #6366f1;
    }

    .cart-item-controls {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .qty-btn {
        background: #f1f5f9;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        font-weight: 600;
        color: #64748b;
    }

    .qty-btn:hover {
        background: #e2e8f0;
    }

    .quantity {
        font-weight: 600;
        min-width: 20px;
        text-align: center;
    }

    .remove-item {
        background: #fee2e2;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        color: #ef4444;
    }

    .remove-item:hover {
        background: #fecaca;
    }

    .empty-cart {
        text-align: center;
        color: #64748b;
        font-style: italic;
        padding: 2rem;
    }

    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1002;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .checkout-modal-content {
        background: white;
        border-radius: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .checkout-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .checkout-header h3 {
        margin: 0;
        color: #1e293b;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #64748b;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
    }

    .checkout-form {
        padding: 1.5rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #1e293b;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #6366f1;
    }

    .order-summary {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
    }

    .order-summary h4 {
        margin: 0 0 1rem 0;
        color: #1e293b;
    }

    .summary-items {
        margin-bottom: 1rem;
    }

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: #64748b;
    }

    .summary-total {
        border-top: 1px solid #e2e8f0;
        padding-top: 1rem;
        text-align: right;
        color: #1e293b;
    }

    .order-confirmation {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1003;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .confirmation-content {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 100%;
    }

    .confirmation-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1rem;
    }

    .confirmation-content h3 {
        color: #1e293b;
        margin-bottom: 1rem;
    }

    .order-details {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        text-align: left;
    }

    .order-details p {
        margin: 0.5rem 0;
        color: #64748b;
    }

    .delivery-info {
        color: #64748b;
        font-size: 0.9rem;
        margin: 1rem 0;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1004;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        border-left: 4px solid #10b981;
    }

    .notification.error {
        border-left: 4px solid #ef4444;
    }

    .notification.info {
        border-left: 4px solid #3b82f6;
    }

    .notification i {
        font-size: 1.2rem;
    }

    .notification.success i {
        color: #10b981;
    }

    .notification.error i {
        color: #ef4444;
    }

    .notification.info i {
        color: #3b82f6;
    }

    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .admin-login-btn {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        font-size: 0.875rem;
    }

    .admin-login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
