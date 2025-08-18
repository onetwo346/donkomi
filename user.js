// User Portal JavaScript
class UserPortal {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.isSignUpMode = false;
        this.chatInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.loadUserData();
    }

    bindEvents() {
        // Auth form submissions
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn();
            });
        }

        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp();
            });
        }

        // Switch between sign in and sign up
        const switchLink = document.getElementById('switchLink');
        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthMode();
            });
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // User menu dropdown
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Change avatar functionality
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const avatarFileInput = document.getElementById('avatarFileInput');
        
        if (changeAvatarBtn && avatarFileInput) {
            changeAvatarBtn.addEventListener('click', () => {
                avatarFileInput.click();
            });

            avatarFileInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // Add address form
        const addAddressForm = document.getElementById('addAddressForm');
        if (addAddressForm) {
            addAddressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAddress();
            });
        }

        // Add payment form
        const addPaymentForm = document.getElementById('addPaymentForm');
        if (addPaymentForm) {
            addPaymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPaymentMethod();
            });
        }

        // Chat functionality
        const chatMessageInput = document.getElementById('chatMessageInput');
        if (chatMessageInput) {
            chatMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Notification system
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const markAllRead = document.getElementById('markAllRead');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('show');
                this.loadNotifications();
            });

            document.addEventListener('click', () => {
                notificationDropdown.classList.remove('show');
            });
        }

        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsRead();
            });
        }

        // Dashboard search
        const dashboardSearch = document.getElementById('dashboardSearch');
        if (dashboardSearch) {
            dashboardSearch.addEventListener('input', (e) => {
                // Implement search functionality
                console.log('Searching for:', e.target.value);
            });
        }

        // Order filter
        const orderFilter = document.getElementById('orderFilter');
        if (orderFilter) {
            orderFilter.addEventListener('change', (e) => {
                this.filterOrders(e.target.value);
            });
        }
    }

    checkAuth() {
        const savedAuth = localStorage.getItem('userAuth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (authData.isLoggedIn && authData.user) {
                    this.currentUser = authData.user;
                    this.login();
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
                localStorage.removeItem('userAuth');
            }
        }
    }

    toggleAuthMode() {
        this.isSignUpMode = !this.isSignUpMode;
        
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const switchText = document.getElementById('switchText');
        const switchLink = document.getElementById('switchLink');

        if (this.isSignUpMode) {
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join Kumasi\'s trusted marketplace';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Sign in here';
        } else {
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to your Kumasi marketplace account';
            switchText.textContent = 'Don\'t have an account?';
            switchLink.textContent = 'Sign up here';
        }
    }

    handleSignIn() {
        const formData = new FormData(document.getElementById('signInForm'));
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            this.login();
            
            // Save auth state
            const authData = {
                isLoggedIn: true,
                user: user,
                rememberMe: !!rememberMe
            };
            localStorage.setItem('userAuth', JSON.stringify(authData));
            
            this.showNotification('Welcome back!', 'success');
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignUp() {
        const formData = new FormData(document.getElementById('signUpForm'));
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
        const email = formData.get('email');
        
        if (users.find(u => u.email === email)) {
            this.showNotification('User with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: email,
            phone: formData.get('phone'),
            password: password,
            location: formData.get('location'),
            dateJoined: new Date().toISOString(),
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
            orders: [],
            wishlist: [],
            addresses: [],
            paymentMethods: [],
            reviews: []
        };

        users.push(newUser);
        localStorage.setItem('donkomi-users', JSON.stringify(users));

        this.currentUser = newUser;
        this.login();

        // Save auth state
        const authData = {
            isLoggedIn: true,
            user: newUser
        };
        localStorage.setItem('userAuth', JSON.stringify(authData));

        this.showNotification('Account created successfully!', 'success');
    }

    login() {
        this.isLoggedIn = true;
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'block';
        this.loadDashboard();
        this.updateUserInfo();
        this.initChat();
        this.initializeNotifications();
    }

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('userAuth');
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('userDashboard').style.display = 'none';
        this.clearChatInterval();
        this.showNotification('Logged out successfully', 'success');
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const headerUserName = document.getElementById('headerUserName');
        const userAvatar = document.getElementById('userAvatar');
        const profileAvatar = document.getElementById('profileAvatar');

        if (headerUserName) {
            headerUserName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }

        const avatarUrl = this.currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

        if (userAvatar) {
            userAvatar.src = avatarUrl;
        }

        if (profileAvatar) {
            profileAvatar.src = avatarUrl;
        }

        // Update profile form
        this.populateProfileForm();
    }

    populateProfileForm() {
        if (!this.currentUser) return;

        const form = document.getElementById('profileForm');
        if (!form) return;

        form.querySelector('#profileFirstName').value = this.currentUser.firstName || '';
        form.querySelector('#profileLastName').value = this.currentUser.lastName || '';
        form.querySelector('#profileEmail').value = this.currentUser.email || '';
        form.querySelector('#profilePhone').value = this.currentUser.phone || '';
        form.querySelector('#profileLocation').value = this.currentUser.location || '';
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.user-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to nav item
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific content
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'wishlist':
                this.loadWishlist();
                break;
            case 'addresses':
                this.loadAddresses();
                break;
            case 'payments':
                this.loadPaymentMethods();
                break;
            case 'reviews':
                this.loadReviews();
                break;
        }
    }

    loadDashboard() {
        if (!this.currentUser) return;

        // Update stats
        const totalOrders = this.currentUser.orders?.length || 0;
        const wishlistCount = this.currentUser.wishlist?.length || 0;
        const totalSpent = this.currentUser.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const reviewsCount = this.currentUser.reviews?.length || 0;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('wishlistCount').textContent = wishlistCount;
        document.getElementById('totalSpent').textContent = `₵${totalSpent.toFixed(2)}`;
        document.getElementById('reviewsCount').textContent = reviewsCount;

        // Load recent orders
        this.loadRecentOrders();
    }

    loadRecentOrders() {
        const container = document.getElementById('recentOrdersList');
        if (!container || !this.currentUser) return;

        const recentOrders = this.currentUser.orders?.slice(0, 3) || [];

        if (recentOrders.length === 0) {
            container.innerHTML = '<p>No orders yet. <a href="#" onclick="goToShopping()">Start shopping!</a></p>';
            return;
        }

        const ordersHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div class="order-info">
                    <strong>${order.orderId}</strong>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <span>₵${order.total.toFixed(2)}</span>
                    <span>${new Date(order.date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = ordersHTML;
    }

    loadOrders() {
        const container = document.getElementById('ordersList');
        if (!container || !this.currentUser) return;

        const orders = this.currentUser.orders || [];

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet.</p>
                    <button class="btn-primary" onclick="goToShopping()">Start Shopping</button>
                </div>
            `;
            return;
        }

        const ordersHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <h4>Order #${order.orderId}</h4>
                    <p>${order.items?.length || 0} items • ₵${order.total.toFixed(2)}</p>
                    <p>${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-actions">
                    <span class="order-status ${order.status}">${order.status}</span>
                    <button class="btn-secondary" onclick="userPortal.viewOrderDetails('${order.orderId}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = ordersHTML;
    }

    filterOrders(status) {
        // Implementation for filtering orders by status
        console.log('Filtering orders by status:', status);
        this.loadOrders(); // Reload with filter
    }

    loadWishlist() {
        const container = document.getElementById('wishlistGrid');
        if (!container || !this.currentUser) return;

        const wishlist = this.currentUser.wishlist || [];

        if (wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Your Wishlist is Empty</h3>
                    <p>Save products you love for later.</p>
                    <button class="btn-primary" onclick="goToShopping()">Browse Products</button>
                </div>
            `;
            return;
        }

        const wishlistHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="wishlist-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">₵${item.price.toFixed(2)}</div>
                    <div class="wishlist-actions">
                        <button class="btn-primary" onclick="userPortal.addToCart('${item.id}')">
                            Add to Cart
                        </button>
                        <button class="btn-secondary" onclick="userPortal.removeFromWishlist('${item.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = wishlistHTML;
    }

    loadAddresses() {
        const container = document.getElementById('addressesGrid');
        if (!container || !this.currentUser) return;

        const addresses = this.currentUser.addresses || [];

        if (addresses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>No Addresses Added</h3>
                    <p>Add delivery addresses for faster checkout.</p>
                    <button class="btn-primary" onclick="showAddAddressModal()">
                        Add Address
                    </button>
                </div>
            `;
            return;
        }

        const addressesHTML = addresses.map(address => `
            <div class="address-card ${address.isDefault ? 'default' : ''}">
                <h4>${address.title}</h4>
                <p>${address.address}</p>
                <p>${address.city}, ${address.postalCode || ''}</p>
                <div class="address-actions">
                    <button class="btn-secondary" onclick="userPortal.editAddress('${address.id}')">
                        Edit
                    </button>
                    <button class="btn-danger" onclick="userPortal.deleteAddress('${address.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = addressesHTML;
    }

    loadPaymentMethods() {
        const container = document.getElementById('paymentMethods');
        if (!container || !this.currentUser) return;

        const paymentMethods = this.currentUser.paymentMethods || [];

        if (paymentMethods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No Payment Methods</h3>
                    <p>Add payment methods for faster checkout.</p>
                    <button class="btn-primary" onclick="showAddPaymentModal()">
                        Add Payment Method
                    </button>
                </div>
            `;
            return;
        }

        const paymentHTML = paymentMethods.map(payment => `
            <div class="payment-card ${payment.isDefault ? 'default' : ''}">
                <div class="payment-type">
                    <i class="fas fa-${payment.type === 'mobile-money' ? 'mobile-alt' : payment.type === 'card' ? 'credit-card' : 'university'}"></i>
                    <div class="payment-details">
                        <h4>${payment.accountName}</h4>
                        <p>${payment.type === 'card' ? '**** **** **** ' + payment.accountNumber.slice(-4) : payment.accountNumber}</p>
                    </div>
                </div>
                <div class="payment-actions">
                    <button class="btn-secondary" onclick="userPortal.editPayment('${payment.id}')">
                        Edit
                    </button>
                    <button class="btn-danger" onclick="userPortal.deletePayment('${payment.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = paymentHTML;
    }

    loadReviews() {
        const container = document.getElementById('reviewsList');
        if (!container || !this.currentUser) return;

        const reviews = this.currentUser.reviews || [];

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Write reviews for products you've purchased.</p>
                </div>
            `;
            return;
        }

        const reviewsHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-product">${review.productName}</div>
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <div class="review-text">${review.text}</div>
                <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
        `).join('');

        container.innerHTML = reviewsHTML;
    }

    updateProfile() {
        const formData = new FormData(document.getElementById('profileForm'));
        
        if (!this.currentUser) return;

        // Update user data
        this.currentUser.firstName = formData.get('firstName');
        this.currentUser.lastName = formData.get('lastName');
        this.currentUser.email = formData.get('email');
        this.currentUser.phone = formData.get('phone');
        this.currentUser.location = formData.get('location');

        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('donkomi-users', JSON.stringify(users));
        }

        // Update auth data
        const authData = JSON.parse(localStorage.getItem('userAuth') || '{}');
        authData.user = this.currentUser;
        localStorage.setItem('userAuth', JSON.stringify(authData));

        this.updateUserInfo();
        this.addPersistentNotification('Your profile information has been updated successfully.', 'profile', 'Profile Updated');
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file.', 'error');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            this.showNotification('Image file size should be less than 5MB.', 'error');
            return;
        }

        // Show loading state
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const originalHTML = changeAvatarBtn.innerHTML;
        changeAvatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        changeAvatarBtn.disabled = true;

        // Read the file and convert to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            this.updateProfilePhoto(imageDataUrl);
            
            // Restore button state
            changeAvatarBtn.innerHTML = originalHTML;
            changeAvatarBtn.disabled = false;
        };
        reader.onerror = () => {
            this.showNotification('Error reading the image file.', 'error');
            
            // Restore button state
            changeAvatarBtn.innerHTML = originalHTML;
            changeAvatarBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    updateProfilePhoto(imageDataUrl) {
        if (!this.currentUser) return;

        // Update current user's avatar
        this.currentUser.avatar = imageDataUrl;

        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('donkomi-users', JSON.stringify(users));
        }

        // Update auth data
        const authData = JSON.parse(localStorage.getItem('userAuth') || '{}');
        authData.user = this.currentUser;
        localStorage.setItem('userAuth', JSON.stringify(authData));

        // Update all profile images in the UI
        this.updateProfileImages(imageDataUrl);
        
        this.addPersistentNotification('Your profile photo has been updated successfully.', 'profile', 'Photo Updated');
    }

    updateProfileImages(imageUrl) {
        // Update main profile avatar
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.src = imageUrl;
        }

        // Update header user avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = imageUrl;
        }

        // Update any other profile images in the UI
        const allAvatars = document.querySelectorAll('.user-avatar, .profile-avatar img');
        allAvatars.forEach(avatar => {
            if (avatar.tagName === 'IMG') {
                avatar.src = imageUrl;
            }
        });
    }

    addAddress() {
        const formData = new FormData(document.getElementById('addAddressForm'));
        
        if (!this.currentUser) return;

        const newAddress = {
            id: Date.now().toString(),
            title: formData.get('title'),
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postalCode'),
            isDefault: formData.get('isDefault') === 'on'
        };

        if (!this.currentUser.addresses) {
            this.currentUser.addresses = [];
        }

        // If this is set as default, remove default from others
        if (newAddress.isDefault) {
            this.currentUser.addresses.forEach(addr => addr.isDefault = false);
        }

        this.currentUser.addresses.push(newAddress);
        this.saveUserData();
        this.loadAddresses();
        this.closeModal('addAddressModal');
        this.addPersistentNotification(`New address "${newAddress.title}" has been added to your account.`, 'address', 'Address Added');
    }

    addPaymentMethod() {
        const formData = new FormData(document.getElementById('addPaymentForm'));
        
        if (!this.currentUser) return;

        const newPayment = {
            id: Date.now().toString(),
            type: formData.get('type'),
            accountName: formData.get('accountName'),
            accountNumber: formData.get('accountNumber'),
            isDefault: formData.get('isDefault') === 'on'
        };

        if (!this.currentUser.paymentMethods) {
            this.currentUser.paymentMethods = [];
        }

        // If this is set as default, remove default from others
        if (newPayment.isDefault) {
            this.currentUser.paymentMethods.forEach(payment => payment.isDefault = false);
        }

        this.currentUser.paymentMethods.push(newPayment);
        this.saveUserData();
        this.loadPaymentMethods();
        this.closeModal('addPaymentModal');
        this.addPersistentNotification(`New ${newPayment.type.replace('-', ' ')} payment method has been added to your account.`, 'payment', 'Payment Method Added');
    }

    saveUserData() {
        if (!this.currentUser) return;

        // Update users array
        const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('donkomi-users', JSON.stringify(users));
        }

        // Update auth data
        const authData = JSON.parse(localStorage.getItem('userAuth') || '{}');
        authData.user = this.currentUser;
        localStorage.setItem('userAuth', JSON.stringify(authData));
    }

    loadUserData() {
        // Load user data from localStorage if needed
        if (this.currentUser) {
            const users = JSON.parse(localStorage.getItem('donkomi-users') || '[]');
            const updatedUser = users.find(u => u.id === this.currentUser.id);
            if (updatedUser) {
                this.currentUser = updatedUser;
            }
        }
    }

    // Chat functionality
    initChat() {
        this.loadChatHistory();
        this.startChatPolling();
    }

    openChat() {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.style.display = 'block';
            this.loadChatHistory();
            this.markMessagesAsRead();
        }
    }

    closeChat() {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.style.display = 'none';
        }
    }

    loadChatHistory() {
        if (!this.currentUser) return;

        const chatHistory = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const userChatId = `user_${this.currentUser.id}`;
        const userChat = chatHistory[userChatId];

        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        if (!userChat || !userChat.messages || userChat.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="message admin">
                        <div class="message-content">
                            <p>Hello ${this.currentUser.firstName}! 👋 Welcome to Donkomi support. How can I help you today?</p>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            `;
            return;
        }

        const messagesHTML = userChat.messages.map(msg => `
            <div class="message ${msg.from}">
                <div class="message-content">
                    <p>${this.escapeHtml(msg.text)}</p>
                </div>
                <div class="message-time">${this.formatTime(msg.time)}</div>
            </div>
        `).join('');

        messagesContainer.innerHTML = messagesHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('chatMessageInput');
        if (!input || !this.currentUser) return;

        const messageText = input.value.trim();
        if (!messageText) return;

        const userChatId = `user_${this.currentUser.id}`;
        const chatHistory = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');

        if (!chatHistory[userChatId]) {
            chatHistory[userChatId] = {
                userId: this.currentUser.id,
                userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                userEmail: this.currentUser.email,
                messages: []
            };
        }

        const newMessage = {
            id: Date.now().toString(),
            from: 'user',
            text: messageText,
            time: Date.now(),
            read: false
        };

        chatHistory[userChatId].messages.push(newMessage);
        localStorage.setItem('donkomi-chat', JSON.stringify(chatHistory));

        input.value = '';
        this.loadChatHistory();
        this.updateChatBadge();

        // Trigger storage event for admin
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'donkomi-chat',
            newValue: JSON.stringify(chatHistory)
        }));
    }

    startChatPolling() {
        this.clearChatInterval();
        this.chatInterval = setInterval(() => {
            this.checkForNewMessages();
        }, 3000); // Check every 3 seconds
    }

    clearChatInterval() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
        }
    }

    checkForNewMessages() {
        if (!this.currentUser) return;

        const chatHistory = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const userChatId = `user_${this.currentUser.id}`;
        const userChat = chatHistory[userChatId];

        if (!userChat || !userChat.messages) return;

        const unreadMessages = userChat.messages.filter(msg => 
            msg.from === 'admin' && !msg.read
        );

        if (unreadMessages.length > 0) {
            this.updateChatBadge(true);
            
            // If chat is open, mark messages as read and reload
            const chatModal = document.getElementById('chatModal');
            if (chatModal && chatModal.style.display === 'block') {
                this.loadChatHistory();
                this.markMessagesAsRead();
            }
        }
    }

    markMessagesAsRead() {
        if (!this.currentUser) return;

        const chatHistory = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const userChatId = `user_${this.currentUser.id}`;
        const userChat = chatHistory[userChatId];

        if (!userChat || !userChat.messages) return;

        let hasUnread = false;
        userChat.messages.forEach(msg => {
            if (msg.from === 'admin' && !msg.read) {
                msg.read = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            localStorage.setItem('donkomi-chat', JSON.stringify(chatHistory));
            this.updateChatBadge(false);
        }
    }

    updateChatBadge(show = null) {
        const chatBadge = document.getElementById('chatBadge');
        if (!chatBadge) return;

        if (show === null) {
            // Check for unread messages
            if (!this.currentUser) return;

            const chatHistory = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
            const userChatId = `user_${this.currentUser.id}`;
            const userChat = chatHistory[userChatId];

            if (!userChat || !userChat.messages) return;

            const hasUnread = userChat.messages.some(msg => 
                msg.from === 'admin' && !msg.read
            );

            chatBadge.style.display = hasUnread ? 'flex' : 'none';
        } else {
            chatBadge.style.display = show ? 'flex' : 'none';
        }
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Reset form if it exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
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
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Also add to persistent notifications
        this.addPersistentNotification(message, type);
    }

    addPersistentNotification(message, type = 'info', title = null) {
        if (!this.currentUser) return;

        const notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: title || this.getNotificationTitle(type),
            message: message,
            type: type,
            timestamp: Date.now(),
            read: false,
            userId: this.currentUser.id
        };

        // Get existing notifications
        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        
        // Add new notification to the beginning
        notifications.unshift(notification);
        
        // Keep only last 50 notifications per user
        const userNotifications = notifications.filter(n => n.userId === this.currentUser.id);
        const otherNotifications = notifications.filter(n => n.userId !== this.currentUser.id);
        const limitedUserNotifications = userNotifications.slice(0, 50);
        
        // Save back to storage
        const finalNotifications = [...limitedUserNotifications, ...otherNotifications];
        localStorage.setItem('donkomi-notifications', JSON.stringify(finalNotifications));
        
        // Update badge count
        this.updateNotificationBadge();
    }

    getNotificationTitle(type) {
        switch(type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'info': return 'Information';
            case 'welcome': return 'Welcome';
            case 'profile': return 'Profile Updated';
            case 'order': return 'Order Update';
            case 'payment': return 'Payment';
            case 'address': return 'Address';
            default: return 'Notification';
        }
    }

    loadNotifications() {
        if (!this.currentUser) return;

        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        const userNotifications = notifications
            .filter(n => n.userId === this.currentUser.id)
            .sort((a, b) => b.timestamp - a.timestamp);

        this.renderNotifications(userNotifications);
    }

    renderNotifications(notifications) {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell"></i>
                    <p>No notifications yet</p>
                    <span>We'll notify you when something happens</span>
                </div>
            `;
            return;
        }

        const notificationsHTML = notifications.map(notification => `
            <div class="notification-item ${!notification.read ? 'unread' : ''}" 
                 data-notification-id="${notification.id}"
                 onclick="userPortal.markNotificationAsRead('${notification.id}')">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-text">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${this.formatTimeAgo(notification.timestamp)}</div>
                    </div>
                </div>
            </div>
        `).join('');

        notificationList.innerHTML = notificationsHTML;
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            case 'welcome': return 'hand-wave';
            case 'profile': return 'user';
            case 'order': return 'shopping-bag';
            case 'payment': return 'credit-card';
            case 'address': return 'map-marker-alt';
            default: return 'bell';
        }
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    }

    markNotificationAsRead(notificationId) {
        if (!this.currentUser) return;

        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        const notification = notifications.find(n => n.id === notificationId && n.userId === this.currentUser.id);
        
        if (notification && !notification.read) {
            notification.read = true;
            localStorage.setItem('donkomi-notifications', JSON.stringify(notifications));
            this.updateNotificationBadge();
            this.loadNotifications();
        }
    }

    markAllNotificationsRead() {
        if (!this.currentUser) return;

        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        let hasChanges = false;

        notifications.forEach(notification => {
            if (notification.userId === this.currentUser.id && !notification.read) {
                notification.read = true;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            localStorage.setItem('donkomi-notifications', JSON.stringify(notifications));
            this.updateNotificationBadge();
            this.loadNotifications();
        }
    }

    updateNotificationBadge() {
        if (!this.currentUser) return;

        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        const unreadCount = notifications.filter(n => 
            n.userId === this.currentUser.id && !n.read
        ).length;

        const badge = document.getElementById('notificationCount');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    initializeNotifications() {
        // Update badge on load
        this.updateNotificationBadge();
        
        // Add welcome notification for new users
        if (this.currentUser && !this.hasWelcomeNotification()) {
            this.addPersistentNotification(
                `Welcome to Donkomi, ${this.currentUser.firstName}! Start exploring our marketplace.`,
                'welcome',
                'Welcome to Donkomi'
            );
        }
    }

    hasWelcomeNotification() {
        const notifications = JSON.parse(localStorage.getItem('donkomi-notifications') || '[]');
        return notifications.some(n => 
            n.userId === this.currentUser.id && 
            n.type === 'welcome'
        );
    }

    // Methods called from HTML
    viewOrderDetails(orderId) {
        console.log('Viewing order details for:', orderId);
        // Implement order details modal
    }

    addToCart(productId) {
        // Add product to main site cart
        console.log('Adding to cart:', productId);
        this.showNotification('Product added to cart!', 'success');
    }

    removeFromWishlist(productId) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        this.currentUser.wishlist = this.currentUser.wishlist.filter(item => item.id !== productId);
        this.saveUserData();
        this.loadWishlist();
        this.showNotification('Removed from wishlist', 'success');
    }

    editAddress(addressId) {
        console.log('Editing address:', addressId);
        // Implement edit address functionality
    }

    deleteAddress(addressId) {
        if (!this.currentUser || !this.currentUser.addresses) return;

        if (confirm('Are you sure you want to delete this address?')) {
            this.currentUser.addresses = this.currentUser.addresses.filter(addr => addr.id !== addressId);
            this.saveUserData();
            this.loadAddresses();
            this.showNotification('Address deleted', 'success');
        }
    }

    editPayment(paymentId) {
        console.log('Editing payment method:', paymentId);
        // Implement edit payment functionality
    }

    deletePayment(paymentId) {
        if (!this.currentUser || !this.currentUser.paymentMethods) return;

        if (confirm('Are you sure you want to delete this payment method?')) {
            this.currentUser.paymentMethods = this.currentUser.paymentMethods.filter(payment => payment.id !== paymentId);
            this.saveUserData();
            this.loadPaymentMethods();
            this.showNotification('Payment method deleted', 'success');
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    userPortal.showSection(sectionName);
}

function logout() {
    userPortal.logout();
}

function openChat() {
    userPortal.openChat();
}

function closeChat() {
    userPortal.closeChat();
}

function sendMessage() {
    userPortal.sendMessage();
}

function showAddAddressModal() {
    userPortal.showModal('addAddressModal');
}

function showAddPaymentModal() {
    userPortal.showModal('addPaymentModal');
}

function closeModal(modalId) {
    userPortal.closeModal(modalId);
}

function goToShopping() {
    // Store a flag to indicate user came from dashboard
    sessionStorage.setItem('userReturnedFromDashboard', 'true');
    
    // Navigate to main shopping site
    window.location.href = 'index.html';
}

// Initialize user portal
let userPortal;
document.addEventListener('DOMContentLoaded', function() {
    userPortal = new UserPortal();
});

// Add notification styles
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transform: translateX(400px);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background: linear-gradient(135deg, #10b981, #059669);
}

.notification.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.notification.info {
    background: linear-gradient(135deg, #6366f1, #5855eb);
}

.notification i {
    font-size: 1.2rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
