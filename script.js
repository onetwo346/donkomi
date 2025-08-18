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

        // Add to cart buttons (using event delegation for dynamic content)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.closest('.add-to-cart');
                const productCard = button.closest('.product-card');
                if (productCard) {
                const product = this.getProductFromCard(productCard);
                this.addItem(product);
                }
            }
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

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateCart();
        this.showNotification('Item removed from cart');
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
        // Save to local storage
        const existingOrders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
        existingOrders.unshift(orderData);
        localStorage.setItem('donkomi-orders', JSON.stringify(existingOrders));
        
        console.log('📦 Order saved to local storage:', orderData.orderId);
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

// Initialize cart and load products on page load
document.addEventListener('DOMContentLoaded', function() {
const cart = new Cart();
    window.cart = cart;
    
    // Ensure product database is loaded from localStorage
    if (window.productSync) {
        window.productSync.loadFromStorage();
    }
    
    // Check if user is logged in and update UI
    checkUserLoginStatus();
    
    // Check if admin is visiting the website
    checkAdminVisit();
    
    // Load initial products (featured)
    displayProducts('all');
    
    // Update category stats
    updateCategoryStats();
    
    // Set initial active state for featured button
    const featuredBtn = document.querySelector('.featured-btn');
    if (featuredBtn) {
        featuredBtn.classList.add('active');
    }
    
    // Add event listeners for promotional buttons
    addPromoButtonListeners();
    
    console.log('Page loaded, displaying featured products');
    console.log('🔄 Product sync system active:', !!window.productSync);
});

// Add event listeners for promotional buttons
function addPromoButtonListeners() {
    // Clearance sale button
    const clearanceBtn = document.querySelector('.promo-card.promo-large .btn-primary');
    if (clearanceBtn) {
        clearanceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clearance button clicked via event listener');
            handlePromoClick('clearance');
        });
    }
    
    // New arrivals button
    const newArrivalsBtn = document.querySelector('.promo-card.promo-new .btn-secondary');
    if (newArrivalsBtn) {
        newArrivalsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('New arrivals button clicked via event listener');
            handlePromoClick('new-arrivals');
        });
    }
    
    // Delivery info button
    const deliveryBtn = document.querySelector('.promo-card.promo-delivery .btn-secondary');
    if (deliveryBtn) {
        deliveryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Delivery button clicked via event listener');
            handlePromoClick('delivery');
        });
    }
    
    console.log('Promo button listeners added');
    
    // Test if buttons exist
    console.log('Clearance button found:', !!clearanceBtn);
    console.log('New arrivals button found:', !!newArrivalsBtn);
    console.log('Delivery button found:', !!deliveryBtn);
}

// Mobile menu functionality
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.getElementById('mobileMenuOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
});

document.querySelector('.close-mobile-menu').addEventListener('click', function() {
    document.getElementById('mobileMenuOverlay').classList.remove('open');
    document.body.style.overflow = 'auto';
});

document.getElementById('mobileMenuOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
});

// Category filtering functionality
let currentCategory = 'all';
let allProducts = [];

// Comprehensive product database with localStorage sync
let productDatabase = {
    'vitamins': [
        { id: 1, name: "Vitamin C 1000mg Tablets", price: 45.99, originalPrice: 65.99, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop", description: "High-potency Vitamin C for immune support", badge: "Popular" },
        { id: 2, name: "Omega-3 Fish Oil Capsules", price: 89.99, originalPrice: 120.99, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop", description: "Premium fish oil for heart health" },
        { id: 3, name: "Multivitamin for Women", price: 67.50, originalPrice: 85.00, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop", description: "Complete daily nutrition for women" },
        { id: 4, name: "Vitamin D3 5000 IU", price: 32.99, originalPrice: 42.99, image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=300&fit=crop", description: "Bone health and immune support" }
    ],
    'fragrances': [
        { id: 5, name: "Chanel No. 5 Eau de Parfum", price: 299.99, originalPrice: 350.00, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop", description: "Classic French perfume", badge: "Premium" },
        { id: 6, name: "Dior Sauvage Men's Cologne", price: 245.00, originalPrice: 280.00, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=300&fit=crop", description: "Fresh and bold masculine scent" },
        { id: 7, name: "Victoria's Secret Body Mist", price: 45.99, originalPrice: 55.99, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&h=300&fit=crop", description: "Light and refreshing body spray" },
        { id: 8, name: "Tom Ford Black Orchid", price: 189.99, originalPrice: 220.00, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop", description: "Luxurious unisex fragrance" }
    ],
    'face-care': [
        { id: 9, name: "Cetaphil Daily Facial Cleanser", price: 25.99, originalPrice: 32.99, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop", description: "Gentle cleanser for all skin types", badge: "Best Seller" },
        { id: 10, name: "Olay Regenerist Micro-Sculpting Cream", price: 78.99, originalPrice: 95.99, image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop", description: "Anti-aging moisturizer with peptides" },
        { id: 11, name: "The Ordinary Hyaluronic Acid Serum", price: 18.99, originalPrice: 24.99, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop", description: "Intensive hydration serum", badge: "Trending" },
        { id: 12, name: "Neutrogena Retinol Oil", price: 34.99, originalPrice: 44.99, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop", description: "Anti-aging facial oil" }
    ],
    'hair-beauty': [
        { id: 13, name: "L'Oréal Professional Shampoo", price: 35.99, originalPrice: 45.99, image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=300&fit=crop", description: "Professional salon-quality shampoo" },
        { id: 14, name: "Dyson Hair Dryer Supersonic", price: 899.99, originalPrice: 1099.99, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop", description: "Fast drying with intelligent heat control", badge: "Premium" },
        { id: 15, name: "Argan Oil Hair Treatment", price: 24.99, originalPrice: 32.99, image: "https://images.unsplash.com/photo-1559599189-7d5e31afd857?w=300&h=300&fit=crop", description: "Moroccan argan oil for hair repair" },
        { id: 16, name: "Ceramic Hair Straightener", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=300&h=300&fit=crop", description: "Professional ceramic straightening iron" }
    ],
    'body-care': [
        { id: 17, name: "Body Care Gift Set", price: 67.99, originalPrice: 79.99, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop", description: "Complete body care routine" },
        { id: 18, name: "Dove Deep Moisture Body Wash", price: 8.99, originalPrice: 12.99, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop", description: "Nourishing body wash" },
        { id: 19, name: "Bath & Body Works Lotion", price: 16.99, originalPrice: 22.99, image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&h=300&fit=crop", description: "Moisturizing body lotion" },
        { id: 20, name: "Exfoliating Body Scrub", price: 29.99, originalPrice: 39.99, image: "https://images.unsplash.com/photo-1588159343745-445ae0ee6b94?w=300&h=300&fit=crop", description: "Sea salt body scrub" }
    ],
    'sexual-wellness': [
        { id: 21, name: "Wellness Intimacy Kit", price: 54.99, originalPrice: 69.99, image: "https://images.unsplash.com/photo-1609205071652-0dfcc8b85dd8?w=300&h=300&fit=crop", description: "Complete wellness and care kit" },
        { id: 22, name: "Personal Care Products", price: 29.99, originalPrice: 39.99, image: "https://images.unsplash.com/photo-1571019613540-996a0dba5ba6?w=300&h=300&fit=crop", description: "Premium personal care items" }
    ],
    'oral-care': [
        { id: 23, name: "Oral-B Electric Toothbrush", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop", description: "Professional clean with smart timer" },
        { id: 24, name: "Whitening Toothpaste Set", price: 24.99, originalPrice: 32.99, image: "https://images.unsplash.com/photo-1609840114855-9755dfb8d542?w=300&h=300&fit=crop", description: "Professional whitening system" }
    ],
    'makeup': [
        { id: 25, name: "MAC Lipstick Collection", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop", description: "Professional lipstick set", badge: "Trending" },
        { id: 26, name: "Eyeshadow Palette", price: 45.99, originalPrice: 59.99, image: "https://images.unsplash.com/photo-1583241800109-c8e0dea6b465?w=300&h=300&fit=crop", description: "120 color eyeshadow palette" }
    ],
    'tools-accessories': [
        { id: 27, name: "Professional Hair Clipper Set", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop", description: "Complete barbering kit" },
        { id: 28, name: "Manicure Kit Professional", price: 34.99, originalPrice: 44.99, image: "https://images.unsplash.com/photo-1599948128421-4d4e4b1f3987?w=300&h=300&fit=crop", description: "Complete nail care set" }
    ],
    'tv-dvd': [
        { id: 29, name: "Samsung 55\" 4K Smart TV", price: 1299.99, originalPrice: 1599.99, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop", description: "Crystal UHD with Tizen smart platform", badge: "Hot Deal" },
        { id: 30, name: "Sony Blu-ray DVD Player", price: 189.99, originalPrice: 229.99, image: "https://images.unsplash.com/photo-1518855589321-c19800f7d692?w=300&h=300&fit=crop", description: "4K upscaling Blu-ray player" },
        { id: 31, name: "LG OLED 65\" TV", price: 2899.99, originalPrice: 3299.99, image: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=300&h=300&fit=crop", description: "Self-lit pixels for perfect blacks", badge: "Premium" },
        { id: 32, name: "Universal Remote Control", price: 39.99, originalPrice: 49.99, image: "https://images.unsplash.com/photo-1558560557-7dbb98b4b3da?w=300&h=300&fit=crop", description: "Control all your devices" }
    ],
    'audio-music': [
        { id: 33, name: "Bose QuietComfort Headphones", price: 349.99, originalPrice: 399.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", description: "World-class noise cancellation", badge: "Popular" },
        { id: 34, name: "Marshall Stanmore II Speaker", price: 449.99, originalPrice: 499.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop", description: "Iconic rock and roll speaker" },
        { id: 35, name: "Audio-Technica Turntable", price: 299.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", description: "Professional direct-drive turntable" },
        { id: 36, name: "Wireless Earbuds Pro", price: 199.99, originalPrice: 249.99, image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop", description: "Premium wireless earbuds" }
    ],
    'laptops-computers': [
        { id: 37, name: "MacBook Pro 14\" M3", price: 3499.99, originalPrice: 3799.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop", description: "Latest M3 chip with 16GB RAM", badge: "New" },
        { id: 38, name: "Dell XPS 13 Laptop", price: 1899.99, originalPrice: 2199.99, image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&fit=crop", description: "Ultra-thin with InfinityEdge display" },
        { id: 39, name: "Gaming Desktop PC RTX 4080", price: 2799.99, originalPrice: 3199.99, image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=300&fit=crop", description: "High-performance gaming rig", badge: "Gaming" },
        { id: 40, name: "iPad Pro 12.9\"", price: 1299.99, originalPrice: 1499.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop", description: "Professional tablet with M2 chip" }
    ],
    'electronics-accessories': [
        { id: 41, name: "Smartphone Accessories Kit", price: 39.99, originalPrice: 49.99, image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&h=300&fit=crop", description: "Complete phone accessory bundle" },
        { id: 42, name: "Wireless Charger Pad", price: 29.99, originalPrice: 39.99, image: "https://images.unsplash.com/photo-1609691174988-9d7ec8d51d82?w=300&h=300&fit=crop", description: "Fast wireless charging pad" }
    ],
    'computer-accessories': [
        { id: 43, name: "Wireless Gaming Mouse", price: 79.99, originalPrice: 99.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop", description: "High-precision gaming mouse" },
        { id: 44, name: "Mechanical Keyboard RGB", price: 149.99, originalPrice: 179.99, image: "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=300&h=300&fit=crop", description: "Professional gaming keyboard" }
    ],
    'networking': [
        { id: 45, name: "WiFi 6 Router", price: 199.99, originalPrice: 249.99, image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&h=300&fit=crop", description: "High-speed mesh WiFi router" },
        { id: 46, name: "Network Switch 8-Port", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Gigabit Ethernet switch" }
    ],
    'printers-scanners': [
        { id: 47, name: "All-in-One Printer", price: 299.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop", description: "Print, scan, copy with wireless" },
        { id: 48, name: "Document Scanner", price: 199.99, originalPrice: 229.99, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop", description: "High-speed document scanner" }
    ],
    'security-surveillance': [
        { id: 49, name: "Security Camera System", price: 599.99, originalPrice: 699.99, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=300&fit=crop", description: "4K security camera with night vision", badge: "Professional" },
        { id: 50, name: "Smart Doorbell Camera", price: 199.99, originalPrice: 249.99, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop", description: "Video doorbell with motion detection" }
    ],
    'computer-hardware': [
        { id: 51, name: "GPU RTX 4070", price: 899.99, originalPrice: 999.99, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop", description: "High-performance graphics card", badge: "Gaming" },
        { id: 52, name: "SSD 1TB NVMe", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop", description: "Ultra-fast storage drive" }
    ],
    'cars': [
        { id: 53, name: "Toyota Camry 2023", price: 45999.99, originalPrice: 48999.99, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=300&fit=crop", description: "Reliable sedan with hybrid option", badge: "Certified" },
        { id: 54, name: "Honda Accord 2024", price: 42999.99, originalPrice: 45999.99, image: "https://images.unsplash.com/photo-1580274947049-80561d52b088?w=300&h=300&fit=crop", description: "Comfortable midsize sedan" },
        { id: 55, name: "BMW 3 Series 2023", price: 78999.99, originalPrice: 82999.99, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=300&fit=crop", description: "Luxury sports sedan", badge: "Luxury" }
    ],
    'motorcycles': [
        { id: 56, name: "Yamaha YZF-R3 2024", price: 8999.99, originalPrice: 9499.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Sport bike for beginners" },
        { id: 57, name: "Honda PCX 150 Scooter", price: 4299.99, originalPrice: 4699.99, image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&h=300&fit=crop", description: "Fuel-efficient city scooter", badge: "Eco-Friendly" }
    ],
    'vehicle-parts': [
        { id: 58, name: "Car Parts - Brake Pads", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop", description: "Premium brake pads for Toyota" },
        { id: 59, name: "Engine Oil Full Synthetic", price: 45.99, originalPrice: 55.99, image: "https://images.unsplash.com/photo-1471880197051-537cea7a1bb8?w=300&h=300&fit=crop", description: "High-performance motor oil" }
    ],
    'trucks-trailers': [
        { id: 60, name: "Pickup Truck Ford F-150", price: 65999.99, originalPrice: 69999.99, image: "https://images.unsplash.com/photo-1567438999634-8a1cb2d7b149?w=300&h=300&fit=crop", description: "Heavy-duty pickup truck" }
    ],
    'buses': [
        { id: 61, name: "City Bus Mercedes", price: 189999.99, originalPrice: 209999.99, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop", description: "40-passenger city bus" }
    ],
    'construction-machinery': [
        { id: 62, name: "Excavator CAT 320", price: 299999.99, originalPrice: 329999.99, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop", description: "Heavy-duty excavator" }
    ],
    'watercraft': [
        { id: 63, name: "Fishing Boat with Motor", price: 15999.99, originalPrice: 17999.99, image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop", description: "25ft fishing boat with outboard motor" }
    ],
    'food-beverages': [
        { id: 64, name: "Premium Ghanaian Cocoa Powder", price: 24.99, originalPrice: 29.99, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop", description: "100% pure Ghanaian cocoa", badge: "Local" },
        { id: 65, name: "Shea Butter (Raw)", price: 18.99, originalPrice: 22.99, image: "https://images.unsplash.com/photo-1585652757173-57de5e9fab42?w=300&h=300&fit=crop", description: "Unrefined shea butter from Northern Ghana", badge: "Organic" },
        { id: 66, name: "Gari (Cassava Flakes)", price: 12.50, originalPrice: 15.00, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop", description: "Traditional Ghanaian staple food" }
    ],
    'farm-machinery': [
        { id: 67, name: "John Deere Compact Tractor", price: 25999.99, originalPrice: 28999.99, image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=300&h=300&fit=crop", description: "25HP compact utility tractor" },
        { id: 68, name: "Irrigation Sprinkler System", price: 1299.99, originalPrice: 1499.99, image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=300&fit=crop", description: "Automated farm irrigation system" }
    ],
    'feeds-supplements': [
        { id: 69, name: "Corn Seeds (Hybrid)", price: 45.99, originalPrice: 52.99, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop", description: "High-yield corn seeds" },
        { id: 70, name: "Fertilizer Organic", price: 29.99, originalPrice: 35.99, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop", description: "Natural organic fertilizer" }
    ],
    'farm-animals': [
        { id: 71, name: "Dairy Cattle (Holstein)", price: 1899.99, originalPrice: 2199.99, image: "https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=300&h=300&fit=crop", description: "Healthy dairy cow", badge: "Livestock" },
        { id: 72, name: "Chickens (Layer Hens)", price: 25.99, originalPrice: 32.99, image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300&h=300&fit=crop", description: "High-producing layer hens" }
    ],
    'electronics-accessories': [
        { id: 73, name: "USB-C Cable 6ft", price: 19.99, originalPrice: 24.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", description: "Fast charging USB-C cable" },
        { id: 74, name: "Wireless Charging Pad", price: 45.99, originalPrice: 59.99, image: "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300&h=300&fit=crop", description: "Fast wireless charging station", badge: "Popular" },
        { id: 75, name: "Power Bank 20000mAh", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1609592913750-71717ee0ff3b?w=300&h=300&fit=crop", description: "High capacity portable charger" },
        { id: 76, name: "Phone Car Mount", price: 24.99, originalPrice: 34.99, image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&h=300&fit=crop", description: "Adjustable smartphone car holder" }
    ],
    'computer-accessories': [
        { id: 77, name: "Mechanical Gaming Keyboard", price: 159.99, originalPrice: 199.99, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop", description: "RGB backlit mechanical keyboard", badge: "Gaming" },
        { id: 78, name: "Gaming Mouse RGB", price: 79.99, originalPrice: 99.99, image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop", description: "High precision gaming mouse" },
        { id: 79, name: "Monitor Stand Dual", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1616627547584-bf28cfeea7d5?w=300&h=300&fit=crop", description: "Adjustable dual monitor stand" },
        { id: 80, name: "USB Hub 7-Port", price: 34.99, originalPrice: 44.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", description: "High-speed USB 3.0 hub" }
    ],
    'networking': [
        { id: 81, name: "WiFi 6 Router AX6000", price: 299.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1606904825846-647eb6e8f8b4?w=300&h=300&fit=crop", description: "High-speed WiFi 6 router", badge: "New" },
        { id: 82, name: "Mesh WiFi System 3-Pack", price: 449.99, originalPrice: 549.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", description: "Whole home mesh coverage" },
        { id: 83, name: "Ethernet Switch 8-Port", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1516110833967-0b5716ca75d4?w=300&h=300&fit=crop", description: "Gigabit Ethernet switch" },
        { id: 84, name: "WiFi Range Extender", price: 79.99, originalPrice: 99.99, image: "https://images.unsplash.com/photo-1606904825846-647eb6e8f8b4?w=300&h=300&fit=crop", description: "Boost your WiFi signal" }
    ],
    'printers-scanners': [
        { id: 85, name: "Canon PIXMA All-in-One Printer", price: 189.99, originalPrice: 229.99, image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop", description: "Print, scan, copy wireless printer" },
        { id: 86, name: "HP LaserJet Pro Printer", price: 299.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop", description: "Fast laser printer for office", badge: "Professional" },
        { id: 87, name: "Document Scanner Portable", price: 229.99, originalPrice: 279.99, image: "https://images.unsplash.com/photo-1589739900243-c0b20dc6c35f?w=300&h=300&fit=crop", description: "High-speed document scanner" },
        { id: 88, name: "Photo Printer Professional", price: 449.99, originalPrice: 549.99, image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop", description: "High-quality photo printing" }
    ],
    'security-surveillance': [
        { id: 89, name: "Security Camera System 8CH", price: 599.99, originalPrice: 699.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Complete 8-camera security system", badge: "Professional" },
        { id: 90, name: "Wireless Security Camera", price: 149.99, originalPrice: 179.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", description: "WiFi security camera with night vision" },
        { id: 91, name: "Smart Doorbell Camera", price: 199.99, originalPrice: 249.99, image: "https://images.unsplash.com/photo-1586281010595-c1bda2c5cf15?w=300&h=300&fit=crop", description: "Video doorbell with 2-way audio" },
        { id: 92, name: "Motion Sensor Alarm", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Wireless motion detection system" }
    ],
    'computer-hardware': [
        { id: 93, name: "Graphics Card RTX 4070", price: 1299.99, originalPrice: 1499.99, image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop", description: "High-performance graphics card", badge: "Gaming" },
        { id: 94, name: "32GB DDR5 RAM Kit", price: 349.99, originalPrice: 399.99, image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=300&h=300&fit=crop", description: "High-speed memory kit" },
        { id: 95, name: "NVMe SSD 2TB", price: 299.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop", description: "Ultra-fast storage drive" },
        { id: 96, name: "CPU Cooler RGB", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop", description: "Liquid cooling system with RGB" }
    ],
    'vehicle-parts': [
        { id: 97, name: "Car Engine Oil 5W-30", price: 45.99, originalPrice: 55.99, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop", description: "Premium synthetic motor oil" },
        { id: 98, name: "Brake Pad Set", price: 89.99, originalPrice: 109.99, image: "https://images.unsplash.com/photo-1632277646967-9a65e96d7e12?w=300&h=300&fit=crop", description: "High-performance brake pads", badge: "Popular" },
        { id: 99, name: "Car Battery 12V", price: 129.99, originalPrice: 159.99, image: "https://images.unsplash.com/photo-1569687499547-bd2bc23d66bb?w=300&h=300&fit=crop", description: "Long-lasting car battery" },
        { id: 100, name: "LED Headlight Kit", price: 199.99, originalPrice: 249.99, image: "https://images.unsplash.com/photo-1571019613540-996a0dba5ba6?w=300&h=300&fit=crop", description: "Bright LED headlight conversion" }
    ],
    'trucks-trailers': [
        { id: 101, name: "Pickup Truck Ford F-150", price: 45999.99, originalPrice: 49999.99, image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&h=300&fit=crop", description: "Heavy-duty pickup truck" },
        { id: 102, name: "Cargo Trailer 16ft", price: 8999.99, originalPrice: 9999.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Heavy-duty cargo trailer", badge: "Commercial" },
        { id: 103, name: "Semi Truck Volvo", price: 89999.99, originalPrice: 99999.99, image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&h=300&fit=crop", description: "Professional semi truck" },
        { id: 104, name: "Utility Trailer", price: 5999.99, originalPrice: 6999.99, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", description: "Multi-purpose utility trailer" }
    ],
    'buses': [
        { id: 105, name: "School Bus 72 Passenger", price: 75999.99, originalPrice: 85999.99, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop", description: "Safe school transportation" },
        { id: 106, name: "City Transit Bus", price: 149999.99, originalPrice: 169999.99, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop", description: "Public transportation bus", badge: "Commercial" },
        { id: 107, name: "Minibus 15 Seater", price: 35999.99, originalPrice: 39999.99, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop", description: "Passenger transport minibus" },
        { id: 108, name: "Luxury Coach Bus", price: 199999.99, originalPrice: 229999.99, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop", description: "Premium passenger coach" }
    ],
    'construction-machinery': [
        { id: 109, name: "Excavator CAT 320", price: 159999.99, originalPrice: 179999.99, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop", description: "Heavy-duty excavator", badge: "Professional" },
        { id: 110, name: "Bulldozer D6", price: 299999.99, originalPrice: 329999.99, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop", description: "Powerful bulldozer for earthmoving" },
        { id: 111, name: "Concrete Mixer Truck", price: 89999.99, originalPrice: 99999.99, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop", description: "Ready-mix concrete delivery" },
        { id: 112, name: "Crane Mobile 25T", price: 199999.99, originalPrice: 219999.99, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop", description: "Mobile construction crane" }
    ]
};

// Product Database Sync System
class ProductDatabaseSync {
    constructor() {
        this.storageKey = 'donkomi-product-database';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupStorageListener();
    }

    loadFromStorage() {
        const savedDatabase = localStorage.getItem(this.storageKey);
        if (savedDatabase) {
            try {
                const parsedDatabase = JSON.parse(savedDatabase);
                // Merge with existing database to preserve default products
                productDatabase = { ...productDatabase, ...parsedDatabase };
                console.log('📦 Product database loaded from localStorage:', Object.keys(productDatabase).length, 'categories');
            } catch (error) {
                console.error('❌ Error loading product database from localStorage:', error);
            }
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(productDatabase));
            console.log('💾 Product database saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving product database to localStorage:', error);
        }
    }

    addProduct(product) {
        const category = product.category;
        if (!productDatabase[category]) {
            productDatabase[category] = [];
        }
        
        // Generate unique ID if not provided
        if (!product.id) {
            product.id = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        productDatabase[category].push(product);
        this.saveToStorage();
        console.log('✅ Product added:', product.name, 'to category:', category);
        
        // Trigger UI update if on main page
        if (typeof displayProducts === 'function') {
            displayProducts('all');
        }
    }

    updateProduct(productId, updatedProduct) {
        for (const category in productDatabase) {
            const productIndex = productDatabase[category].findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                // Remove from old category if category changed
                if (updatedProduct.category !== category) {
                    productDatabase[category].splice(productIndex, 1);
                    if (!productDatabase[updatedProduct.category]) {
                        productDatabase[updatedProduct.category] = [];
                    }
                    productDatabase[updatedProduct.category].push(updatedProduct);
                } else {
                    productDatabase[category][productIndex] = updatedProduct;
                }
                this.saveToStorage();
                console.log('✅ Product updated:', updatedProduct.name);
                
                // Trigger UI update if on main page
                if (typeof displayProducts === 'function') {
                    displayProducts('all');
                }
                return true;
            }
        }
        return false;
    }

    deleteProduct(productId) {
        for (const category in productDatabase) {
            const productIndex = productDatabase[category].findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                const deletedProduct = productDatabase[category].splice(productIndex, 1)[0];
                this.saveToStorage();
                console.log('✅ Product deleted:', deletedProduct.name);
                
                // Trigger UI update if on main page
                if (typeof displayProducts === 'function') {
                    displayProducts('all');
                }
                return true;
            }
        }
        return false;
    }

    addCategory(category) {
        if (!productDatabase[category.name]) {
            productDatabase[category.name] = [];
            this.saveToStorage();
            console.log('✅ Category added:', category.name);
            
            // Trigger UI update if on main page
            if (typeof updateCategoryStats === 'function') {
                updateCategoryStats();
            }
            return true;
        }
        return false;
    }

    deleteCategory(categoryName) {
        if (productDatabase[categoryName]) {
            delete productDatabase[categoryName];
            this.saveToStorage();
            console.log('✅ Category deleted:', categoryName);
            
            // Trigger UI update if on main page
            if (typeof updateCategoryStats === 'function') {
                updateCategoryStats();
            }
            return true;
        }
        return false;
    }

    getAllProducts() {
        const allProducts = [];
        for (const category in productDatabase) {
            allProducts.push(...productDatabase[category].map(product => ({
                ...product,
                category: category
            })));
        }
        return allProducts;
    }

    getProductsByCategory(category) {
        return productDatabase[category] || [];
    }

    getCategories() {
        return Object.keys(productDatabase);
    }

    setupStorageListener() {
        // Listen for storage changes from admin portal
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                try {
                    const newDatabase = JSON.parse(e.newValue);
                    productDatabase = { ...productDatabase, ...newDatabase };
                    console.log('🔄 Product database updated from storage event');
                    
                    // Trigger UI updates
                    if (typeof displayProducts === 'function') {
                        displayProducts('all');
                    }
                    if (typeof updateCategoryStats === 'function') {
                        updateCategoryStats();
                    }
                } catch (error) {
                    console.error('❌ Error parsing storage update:', error);
                }
            }
        });
    }
}

// Initialize product database sync
const productSync = new ProductDatabaseSync();
window.productSync = productSync; // Make it globally available

// User login status management
function checkUserLoginStatus() {
    const userAuth = localStorage.getItem('userAuth');
    const userBtn = document.querySelector('.user-btn');
    
    if (userAuth && userBtn) {
        try {
            const authData = JSON.parse(userAuth);
            if (authData.isLoggedIn && authData.user) {
                // User is logged in, update the button
                updateUserButton(authData.user);
                
                // Check if user returned from dashboard
                const returnedFromDashboard = sessionStorage.getItem('userReturnedFromDashboard');
                if (returnedFromDashboard) {
                    showWelcomeBackMessage(authData.user);
                    sessionStorage.removeItem('userReturnedFromDashboard');
                }
            }
        } catch (error) {
            console.error('Error parsing user auth data:', error);
        }
    }
}

function updateUserButton(user) {
    const userBtn = document.querySelector('.user-btn');
    if (!userBtn) return;
    
    // Create a dropdown for logged-in user
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu-main';
    userMenu.innerHTML = `
        <button class="user-btn logged-in" title="User Account" aria-label="User account menu">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}" 
                 alt="User" class="user-avatar-small">
            <span class="user-name-small">${user.firstName}</span>
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown-main">
            <div class="user-info">
                <img src="${user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}" 
                     alt="User" class="user-avatar-dropdown">
                <div>
                    <div class="user-name-dropdown">${user.firstName} ${user.lastName}</div>
                    <div class="user-email-dropdown">${user.email}</div>
                </div>
            </div>
            <hr>
            <a href="user.html" class="dropdown-item">
                <i class="fas fa-tachometer-alt"></i>
                Dashboard
            </a>
            <a href="user.html#orders" class="dropdown-item">
                <i class="fas fa-shopping-bag"></i>
                My Orders
            </a>
            <a href="user.html#wishlist" class="dropdown-item">
                <i class="fas fa-heart"></i>
                Wishlist
            </a>
            <a href="user.html#profile" class="dropdown-item">
                <i class="fas fa-user"></i>
                Profile
            </a>
            <hr>
            <a href="#" onclick="logoutUser()" class="dropdown-item logout">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </a>
        </div>
    `;
    
    // Replace the existing user button
    userBtn.parentNode.replaceChild(userMenu, userBtn);
    
    // Add dropdown functionality
    const newUserBtn = userMenu.querySelector('.user-btn');
    const dropdown = userMenu.querySelector('.user-dropdown-main');
    
    newUserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

function showWelcomeBackMessage(user) {
    const notification = document.createElement('div');
    notification.className = 'notification success welcome-back';
    notification.innerHTML = `
        <i class="fas fa-user-check"></i>
        <span>Welcome back, ${user.firstName}! Continue shopping where you left off.</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function logoutUser() {
    localStorage.removeItem('userAuth');
    location.reload(); // Refresh to reset UI
}

function checkAdminVisit() {
    const adminVisiting = sessionStorage.getItem('adminVisitingWebsite');
    
    if (adminVisiting) {
        // Show special admin indicator
        showAdminVisitNotification();
        sessionStorage.removeItem('adminVisitingWebsite');
        
        // Add special admin view indicator to the page
        addAdminViewIndicator();
    }
}

function showAdminVisitNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification info admin-visit';
    notification.innerHTML = `
        <i class="fas fa-user-shield"></i>
        <span>👨‍💼 Admin View: You're viewing the website as an administrator</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function addAdminViewIndicator() {
    // Add a subtle admin indicator to the navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const adminIndicator = document.createElement('div');
        adminIndicator.className = 'admin-view-indicator';
        adminIndicator.innerHTML = `
            <i class="fas fa-user-shield"></i>
            <span>Admin View</span>
        `;
        navbar.appendChild(adminIndicator);
    }
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update products display
    displayProducts(category);
    
    // Show/hide category cards based on selection
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'all') {
            card.style.display = 'block';
        } else if (cardCategory === category || 
            (category === 'health-beauty' && ['vitamins', 'fragrances', 'face-care', 'hair-beauty', 'body-care', 'sexual-wellness', 'oral-care', 'makeup'].includes(cardCategory)) ||
            (category === 'electronics' && ['tv-dvd', 'audio-music', 'laptops-computers', 'electronics-accessories', 'computer-accessories', 'networking', 'printers-scanners', 'security-surveillance', 'computer-hardware'].includes(cardCategory)) ||
            (category === 'vehicles' && ['vehicle-parts', 'cars', 'motorcycles', 'trucks-trailers', 'buses', 'construction-machinery', 'watercraft'].includes(cardCategory)) ||
            (category === 'agriculture' && ['food-beverages', 'farm-machinery', 'feeds-supplements', 'farm-animals'].includes(cardCategory))) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    updateActiveCategory(category);
    
    // Update featured products section title
    const featuredTitle = document.querySelector('.featured-products h2');
    if (featuredTitle) {
        if (category === 'all') {
            featuredTitle.textContent = 'Featured Products';
        } else {
            const categoryName = getCategoryDisplayName(category);
            featuredTitle.textContent = `${categoryName} Products`;
        }
    }
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        'vitamins': 'Vitamins & Supplements',
        'fragrances': 'Fragrances',
        'face-care': 'Face Care',
        'hair-beauty': 'Hair Beauty',
        'body-care': 'Body Care',
        'sexual-wellness': 'Sexual Wellness',
        'oral-care': 'Oral Care',
        'makeup': 'Make-Up',
        'tools-accessories': 'Tools & Accessories',
        'tv-dvd': 'TV & DVD Equipment',
        'audio-music': 'Audio & Music Equipment',
        'laptops-computers': 'Laptops & Computers',
        'electronics-accessories': 'Electronics Accessories',
        'computer-accessories': 'Computer Accessories',
        'networking': 'Networking Products',
        'printers-scanners': 'Printers & Scanners',
        'security-surveillance': 'Security & Surveillance',
        'computer-hardware': 'Computer Hardware',
        'cars': 'Cars',
        'motorcycles': 'Motorcycles & Scooters',
        'vehicle-parts': 'Vehicle Parts & Accessories',
        'trucks-trailers': 'Trucks & Trailers',
        'buses': 'Buses & Microbuses',
        'construction-machinery': 'Construction & Heavy Machinery',
        'watercraft': 'Watercraft & Boats',
        'food-beverages': 'Food & Beverages',
        'farm-machinery': 'Farm Machinery & Equipment',
        'feeds-supplements': 'Feeds, Supplements & Seeds',
        'farm-animals': 'Farm Animals',
        'health-beauty': 'Health & Beauty',
        'electronics': 'Electronics',
        'vehicles': 'Vehicles',
        'agriculture': 'Food & Agriculture'
    };
    return categoryNames[category] || category;
}

function updateActiveCategory(category) {
    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Add click events to category navigation
document.querySelectorAll('.category-btn, .dropdown-content a, .mobile-category-section a, .sidebar-featured-item, .sidebar-category-header, .sidebar-subcategories a, .featured-btn').forEach(element => {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        const category = this.dataset.category || this.getAttribute('data-category');
        if (category) {
            filterByCategory(category);
            
            // Close mobile menu if open
            document.getElementById('mobileMenuOverlay').classList.remove('open');
            document.body.style.overflow = 'auto';
            
            // Update products title
            const productTitle = document.getElementById('products-title');
            if (productTitle) {
                const categoryName = getCategoryDisplayName(category);
                productTitle.textContent = category === 'all' ? 'Featured Products' : `${categoryName} Products`;
            }
            
            // Highlight active sidebar item
            document.querySelectorAll('.sidebar-featured-item, .sidebar-category-header, .sidebar-subcategories a, .featured-btn').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // Scroll to products section if clicked from main navigation
            if (this.classList.contains('category-btn') && !this.closest('.sidebar-categories')) {
                const targetSection = document.querySelector('.main-content') || document.querySelector('.featured-products');
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
    });
});

// Add click events to category cards
document.querySelectorAll('.category-card, .featured-category-card').forEach(card => {
    card.addEventListener('click', function() {
        const category = this.dataset.category;
        if (category) {
            filterByCategory(category);
        }
    });
});

// Enhanced search functionality
document.querySelector('.nav-search input').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    const categories = document.querySelectorAll('.category-card');
    
    if (query.length === 0) {
        filterByCategory(currentCategory);
        return;
    }
    
    // Search products
    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
        const category = product.querySelector('.product-category').textContent.toLowerCase();
        
        if (name.includes(query) || category.includes(query)) {
            product.style.display = 'block';
            product.classList.add('animate-in');
        } else {
            product.style.display = 'none';
        }
    });
    
    // Search categories
    categories.forEach(category => {
        const name = category.querySelector('h3').textContent.toLowerCase();
        const description = category.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(query) || description.includes(query)) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });
});

// Mobile search functionality
document.querySelector('.mobile-search input').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const categoryLinks = document.querySelectorAll('.mobile-category-section a');
    
    categoryLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(query) || query.length === 0) {
            link.style.display = 'block';
        } else {
            link.style.display = 'none';
        }
    });
});

// Show all categories function
function showAllCategories() {
    filterByCategory('all');
    
    // Scroll to categories
    document.querySelector('.categories').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Category dropdown functionality for desktop
document.querySelectorAll('.dropdown').forEach(dropdown => {
    let timeout;
    const button = dropdown.querySelector('.category-btn');
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    const chevron = dropdown.querySelector('.fa-chevron-down');
    
    // Hover functionality for desktop
    dropdown.addEventListener('mouseenter', function() {
        clearTimeout(timeout);
        this.classList.add('active');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    });
    
    dropdown.addEventListener('mouseleave', function() {
        timeout = setTimeout(() => {
            this.classList.remove('active');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }, 300);
    });
    
    // Click functionality for main category buttons
    if (button && button.dataset.category) {
        button.addEventListener('click', function(e) {
            // Don't trigger if clicking on dropdown content
            if (!e.target.closest('.dropdown-content')) {
                e.preventDefault();
                const category = this.dataset.category;
                filterByCategory(category);
                
                // Close mobile menu if open
                document.getElementById('mobileMenuOverlay').classList.remove('open');
                document.body.style.overflow = 'auto';
                
                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Update active navigation button
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('nav-active');
                });
                this.classList.add('nav-active');
                
                // Scroll to products section
                const targetSection = document.querySelector('.main-content') || document.querySelector('.featured-products');
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
    
    // Toggle dropdown on click for mobile
    if (button) {
        button.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown.active').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                        const otherChevron = otherDropdown.querySelector('.fa-chevron-down');
                        if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
                if (chevron) {
                    chevron.style.transform = dropdown.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
            const chevron = dropdown.querySelector('.fa-chevron-down');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        });
    }
});

// Add category statistics update
function updateCategoryStats() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const adsCount = card.querySelector('p').textContent;
        if (adsCount.includes('ads')) {
            const count = parseInt(adsCount.replace(/[^\d]/g, ''));
            if (count > 10000) {
                card.querySelector('p').style.color = '#10b981';
                card.querySelector('p').style.fontWeight = '600';
            } else if (count > 5000) {
                card.querySelector('p').style.color = '#6366f1';
                card.querySelector('p').style.fontWeight = '600';
            }
        }
    });
}

// Initialize category stats
updateCategoryStats();

// Product generation and display functions
function generateProductHTML(product, category) {
    const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    
    return `
        <div class="product-card" data-category="${category}">
            ${badgeHTML}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="quick-view" onclick="showProductDetails(${product.id})">Quick View</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-category">${product.categoryName || category}</p>
                <div class="product-price">
                    <span class="current-price">₵${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">₵${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <button class="add-to-cart" onclick="addProductToCart(${product.id}, '${category}')">Add to Cart</button>
            </div>
        </div>
    `;
}

function loadProductsForCategory(category, limit = 8) {
    const products = productDatabase[category] || [];
    return products.slice(0, limit);
}

function displayProducts(category = 'all', container = '.product-grid') {
    const productContainer = document.querySelector(container);
    if (!productContainer) {
        console.log('Product container not found:', container);
        return;
    }
    
    let productsHTML = '';
    
    if (category === 'all' || category === 'featured') {
        // Show products from all categories (mixed)
        let allProducts = [];
        Object.keys(productDatabase).forEach(cat => {
            const categoryProducts = productDatabase[cat].slice(0, 2); // 2 products per category
            categoryProducts.forEach(product => {
                product.categoryKey = cat;
                allProducts.push(product);
            });
        });
        
        // Shuffle and limit to 12 products for featured section
        allProducts = allProducts.sort(() => Math.random() - 0.5).slice(0, 12);
        
        allProducts.forEach(product => {
            productsHTML += generateProductHTML(product, product.categoryKey);
        });
    } else {
        // Handle grouped categories
        let categoriesToShow = [];
        
        if (category === 'health-beauty') {
            categoriesToShow = ['vitamins', 'fragrances', 'face-care', 'hair-beauty', 'body-care', 'sexual-wellness', 'oral-care', 'makeup'];
        } else if (category === 'electronics') {
            categoriesToShow = ['tv-dvd', 'audio-music', 'laptops-computers', 'electronics-accessories', 'computer-accessories', 'networking', 'printers-scanners', 'security-surveillance', 'computer-hardware'];
        } else if (category === 'vehicles') {
            categoriesToShow = ['vehicle-parts', 'cars', 'motorcycles', 'trucks-trailers', 'buses', 'construction-machinery', 'watercraft'];
        } else if (category === 'agriculture') {
            categoriesToShow = ['food-beverages', 'farm-machinery', 'feeds-supplements', 'farm-animals'];
        } else {
            // Single category
            categoriesToShow = [category];
        }
        
        // Load products from the specified categories
        categoriesToShow.forEach(cat => {
            const products = loadProductsForCategory(cat, 4); // 4 products per subcategory
            products.forEach(product => {
                productsHTML += generateProductHTML(product, cat);
            });
        });
    }
    
    if (productsHTML === '') {
        productsHTML = '<div class="no-products"><p>No products found in this category. Please try another category.</p></div>';
    }
    
    productContainer.innerHTML = productsHTML;
    console.log(`Displayed ${category} category with ${productContainer.children.length} products`);
}

function addProductToCart(productId, category) {
    const product = productDatabase[category]?.find(p => p.id === productId);
    if (product) {
        const cartProduct = {
            id: productId,
            name: product.name,
            category: product.categoryName || category,
            price: product.price,
            image: product.image,
            quantity: 1
        };
        cart.addItem(cartProduct);
    }
}

function showProductDetails(productId) {
    // Find product in database
    let foundProduct = null;
    let foundCategory = null;
    
    Object.keys(productDatabase).forEach(category => {
        const product = productDatabase[category].find(p => p.id === productId);
        if (product) {
            foundProduct = product;
            foundCategory = category;
        }
    });
    
    if (foundProduct) {
        // Create and show product details modal
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-header">
                    <h3>${foundProduct.name}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="product-modal-body">
                    <div class="product-modal-image">
                        <img src="${foundProduct.image}" alt="${foundProduct.name}">
                    </div>
                    <div class="product-modal-details">
                        <p class="product-category">${foundProduct.categoryName || foundCategory}</p>
                        <p class="product-description">${foundProduct.description}</p>
                        <div class="product-price">
                            <span class="current-price">₵${foundProduct.price.toFixed(2)}</span>
                            ${foundProduct.originalPrice ? `<span class="original-price">₵${foundProduct.originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                        ${foundProduct.badge ? `<span class="product-badge">${foundProduct.badge}</span>` : ''}
                        <button class="btn-primary add-to-cart" onclick="addProductToCart(${foundProduct.id}, '${foundCategory}'); this.parentElement.parentElement.parentElement.parentElement.remove();">
                            Add to Cart - ₵${foundProduct.price.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}



// Admin portal function
function openAdminPortal() {
    window.open('admin.html', '_blank');
}

// Handle promotional button clicks
function handlePromoClick(type) {
    console.log('Promo button clicked:', type); // Debug log
    
    // Add visual feedback
    const button = event.target.closest('button');
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    switch(type) {
        case 'clearance':
            console.log('Clearance sale clicked'); // Debug log
            // Filter to show clearance/discounted products
            if (typeof filterByCategory === 'function') {
                filterByCategory('all');
            }
            if (typeof showNotification === 'function') {
                showNotification('Showing clearance items!', 'success');
            }
            
            // Scroll to products section
            const productsSection = document.querySelector('.main-content');
            if (productsSection) {
                productsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            break;
            
        case 'new-arrivals':
            console.log('New arrivals clicked'); // Debug log
            // Show newest products
            if (typeof filterByCategory === 'function') {
                filterByCategory('all');
            }
            if (typeof showNotification === 'function') {
                showNotification('Showing latest arrivals!', 'success');
            }
            
            // Scroll to products section
            const productsSection2 = document.querySelector('.main-content');
            if (productsSection2) {
                productsSection2.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            break;
            
        case 'delivery':
            console.log('Delivery info clicked'); // Debug log
            // Show delivery information modal
            showDeliveryInfo();
            break;
            
        default:
            console.log('Unknown promo type:', type);
    }
}

// Make functions globally accessible
window.handlePromoClick = handlePromoClick;
window.showDeliveryInfo = showDeliveryInfo;

// Show delivery information modal
function showDeliveryInfo() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.delivery-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create delivery info modal
    const modal = document.createElement('div');
    modal.className = 'delivery-modal';
    modal.innerHTML = `
        <div class="delivery-modal-content">
            <div class="delivery-modal-header">
                <h3><i class="fas fa-shipping-fast"></i> Free Delivery Information</h3>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="delivery-modal-body">
                <div class="delivery-info-grid">
                    <div class="delivery-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <h4>Delivery Areas</h4>
                        <p>Free delivery available in Kumasi and surrounding areas</p>
                    </div>
                    <div class="delivery-info-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <h4>Minimum Order</h4>
                        <p>Free delivery on orders over ₵50</p>
                    </div>
                    <div class="delivery-info-item">
                        <i class="fas fa-clock"></i>
                        <h4>Delivery Time</h4>
                        <p>Same day delivery for orders placed before 2 PM</p>
                    </div>
                    <div class="delivery-info-item">
                        <i class="fas fa-truck"></i>
                        <h4>Tracking</h4>
                        <p>Real-time tracking available for all deliveries</p>
                    </div>
                </div>
                <div class="delivery-notice">
                    <p><strong>Note:</strong> Delivery times may vary during peak periods and holidays.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


