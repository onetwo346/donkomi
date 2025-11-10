// Admin Portal JavaScript
class AdminPortal {
    constructor() {
        this.isLoggedIn = false;
        this.products = [];
        this.categories = [];
        this.orders = [];
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
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

        // Product form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Category form
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCategory();
            });
        }

        // Edit product form
        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct();
            });
        }

        // Search and filters
        this.bindSearchFilters();
        
        // Image upload previews
        this.bindImageUploads();
        
        // Chat functionality
        this.initAdminChat();
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (isLoggedIn) {
            this.login();
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple authentication (in real app, this would be server-side)
        if (username === 'admin' && password === 'donkomi2024') {
            localStorage.setItem('adminLoggedIn', 'true');
            this.login();
        } else {
            this.showNotification('Invalid credentials', 'error');
        }
    }

    login() {
        this.isLoggedIn = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadDashboard();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLoginForm').reset();
    }

    loadData() {
        // Load products from sync system or localStorage
        if (window.productSync) {
            this.products = window.productSync.getAllProducts();
        } else {
            const savedProducts = localStorage.getItem('donkomi-products');
            this.products = savedProducts ? JSON.parse(savedProducts) : [];
        }

        // Load categories from localStorage
        const savedCategories = localStorage.getItem('donkomi-categories');
        this.categories = savedCategories ? JSON.parse(savedCategories) : [];

        // Load orders from localStorage
        const savedOrders = localStorage.getItem('donkomi-orders');
        this.orders = savedOrders ? JSON.parse(savedOrders) : [];
    }

    saveData() {
        localStorage.setItem('donkomi-products', JSON.stringify(this.products));
        localStorage.setItem('donkomi-categories', JSON.stringify(this.categories));
        localStorage.setItem('donkomi-orders', JSON.stringify(this.orders));
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
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
        case 'products':
                this.loadProducts();
            break;
            case 'categories':
                this.loadCategories();
            break;
            case 'orders':
                this.loadOrders();
            break;
            case 'messages':
                this.loadMessages();
            break;
    }
}

    loadDashboard() {
        // Update stats
        let totalProducts = 0;
        let totalCategories = 0;
        
        if (window.productSync) {
            totalProducts = window.productSync.getAllProducts().length;
            totalCategories = window.productSync.getCategories().length;
        } else {
            totalProducts = this.products.length;
            totalCategories = this.categories.length;
        }
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('totalCategories').textContent = totalCategories;
        
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalRevenue').textContent = `₵${totalRevenue.toFixed(2)}`;

        // Load recent orders
        this.loadRecentOrders();
        
        // Initialize category selects
        this.updateCategorySelects();
        this.updateCategoryFilter();
    }

    loadRecentOrders() {
        const recentOrdersContainer = document.getElementById('recentOrders');
        const recentOrders = this.orders.slice(0, 5);
    
    if (recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = '<p>No recent orders</p>';
        return;
    }
    
        const ordersHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div class="order-info">
                    <strong>${order.orderId}</strong>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
                <div class="order-details">
                    <span>${order.customer.name}</span>
                    <span>₵${order.total.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
        recentOrdersContainer.innerHTML = ordersHTML;
    }

    loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        
        // Get products from sync system
        let products = [];
        if (window.productSync) {
            products = window.productSync.getAllProducts();
        } else {
            products = this.products;
        }
        
        // Update category filter dropdown
        this.updateCategoryFilter();
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box"></i>
                    <h3>No Products Yet</h3>
                    <p>Start by adding your first product</p>
                    <button class="btn-primary" onclick="showAddProductModal()">
                        <i class="fas fa-plus"></i>
                        Add Product
                    </button>
        </div>
    `;
            return;
        }

        const productsHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <div class="product-price">
                        <span class="current-price">₵${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">₵${product.originalPrice}</span>` : ''}
                    </div>
            </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="adminPortal.editProduct('${product.id}')" title="Edit product">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn-danger" onclick="adminPortal.deleteProduct('${product.id}')" title="Delete product">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
            </div>
        </div>
    `).join('');
    
        productsGrid.innerHTML = productsHTML;
    }

        loadCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        
        // Get categories from sync system
        let categories = [];
        if (window.productSync) {
            const categoryNames = window.productSync.getCategories();
            categories = categoryNames.map(name => ({
                id: name,
                name: name,
                description: `Products in ${name} category`,
                color: 'health',
                icon: 'fas fa-tag'
            }));
        } else {
            categories = this.categories;
        }
        
        if (categories.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>No Categories Yet</h3>
                    <p>Start by adding your first category</p>
                    <button class="btn-primary" onclick="showAddCategoryModal()">
                        <i class="fas fa-plus"></i>
                        Add Category
                    </button>
        </div>
    `;
        return;
    }
    
        const categoriesHTML = categories.map(category => `
            <div class="category-card" data-id="${category.id}">
                <div class="category-icon ${category.color}">
                    <i class="${category.icon}"></i>
            </div>
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <p>${category.description || 'No description'}</p>
                    <span class="product-count">${this.getProductCountByCategory(category.name)} products</span>
            </div>
                <div class="category-actions">
                    <button class="btn-secondary" onclick="adminPortal.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                </button>
                    <button class="btn-danger" onclick="adminPortal.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                </button>
            </div>
        </div>
    `).join('');
    
        categoriesGrid.innerHTML = categoriesHTML;
    }

    loadOrders() {
        const ordersTable = document.getElementById('ordersTable');
        
        if (this.orders.length === 0) {
            ordersTable.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No Orders Yet</h3>
                    <p>Orders will appear here when customers place them</p>
                </div>
            `;
            return;
        }

        const ordersHTML = `
            <table class="orders-table-content">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr>
                            <td>${order.orderId}</td>
                            <td>
                                <div class="customer-info">
                                    <strong>${order.customer.name}</strong>
                                    <span>${order.customer.phone}</span>
                                </div>
                            </td>
                            <td>${order.items.length} items</td>
                            <td>₵${order.total.toFixed(2)}</td>
                            <td>
                                <span class="status-badge ${order.status}">${order.status}</span>
                            </td>
                            <td>${new Date(order.date).toLocaleDateString()}</td>
                            <td>
                                <button class="btn-secondary" onclick="adminPortal.viewOrder('${order.orderId}')">
                                    <i class="fas fa-eye"></i>
                                    View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        ordersTable.innerHTML = ordersHTML;
    }

    addProduct() {
        const form = document.getElementById('addProductForm');
        const formData = new FormData(form);
        const imageFile = formData.get('image');
        
        // Handle image upload
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.createAndSaveProduct(formData, e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // No image uploaded, use placeholder
            this.createAndSaveProduct(formData, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop');
        }
    }

    createAndSaveProduct(formData, imageDataUrl) {
        const product = {
            id: Date.now().toString(),
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice')) : null,
            description: formData.get('description'),
            image: imageDataUrl,
            badge: formData.get('badge') || null,
            dateAdded: new Date().toISOString()
        };

        // Use the sync system to add product
        if (window.productSync) {
            window.productSync.addProduct(product);
        } else {
            // Fallback to local storage
            this.products.push(product);
            this.saveData();
        }
        
        this.showNotification('Product added successfully!', 'success');
        this.closeModal('addProductModal');
        document.getElementById('addProductForm').reset();
        
        // Clear the image preview
        const preview = document.querySelector('#addProductModal .upload-preview');
        if (preview) {
            preview.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload image</p>
            `;
        }
        
        this.loadProducts();
    }

    addCategory() {
        const form = document.getElementById('addCategoryForm');
        const formData = new FormData(form);
        
        const category = {
            id: Date.now().toString(),
            name: formData.get('name'),
            parentCategory: formData.get('parentCategory') || null,
            icon: formData.get('icon'),
            color: formData.get('color'),
            description: formData.get('description'),
            dateAdded: new Date().toISOString()
        };

        // Use the sync system to add category
        if (window.productSync) {
            const success = window.productSync.addCategory(category);
            if (success) {
                this.showNotification('Category added successfully!', 'success');
            } else {
                this.showNotification('Category already exists!', 'error');
            }
        } else {
            // Fallback to local storage
            this.categories.push(category);
            this.saveData();
            this.showNotification('Category added successfully!', 'success');
        }
        
        this.closeModal('addCategoryModal');
        form.reset();
        this.loadCategories();
        this.updateCategorySelects();
    }

    editProduct(productId) {
        // Find product from the sync system
        let product = null;
        if (window.productSync) {
            const allProducts = window.productSync.getAllProducts();
            product = allProducts.find(p => p.id == productId);
        } else {
            product = this.products.find(p => p.id === productId);
        }
        
        if (!product) {
            this.showNotification('Product not found!', 'error');
            return;
        }

        const form = document.getElementById('editProductForm');
        form.querySelector('[name="productId"]').value = product.id;
        form.querySelector('[name="name"]').value = product.name;
        form.querySelector('[name="category"]').value = product.category;
        form.querySelector('[name="price"]').value = product.price;
        form.querySelector('[name="originalPrice"]').value = product.originalPrice || '';
        form.querySelector('[name="description"]').value = product.description || '';
        form.querySelector('[name="badge"]').value = product.badge || '';

        const imagePreview = document.getElementById('currentProductImage');
        if (imagePreview) {
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
        }

        this.showModal('editProductModal');
    }

    updateProduct() {
        const form = document.getElementById('editProductForm');
        const formData = new FormData(form);
        const productId = formData.get('productId');
        const imageFile = formData.get('image');

        // Handle image update
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.saveUpdatedProduct(formData, productId, e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // No new image uploaded, keep existing image
            this.saveUpdatedProduct(formData, productId, null);
        }
    }

    saveUpdatedProduct(formData, productId, newImageDataUrl) {
        const updatedProduct = {
            id: productId,
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice')) : null,
            description: formData.get('description'),
            badge: formData.get('badge') || null
        };

        // Set image - either new upload or keep existing
        if (newImageDataUrl) {
            updatedProduct.image = newImageDataUrl;
        } else {
            // Keep existing image from sync system
            let existingProduct = null;
            if (window.productSync) {
                const allProducts = window.productSync.getAllProducts();
                existingProduct = allProducts.find(p => p.id == productId);
            } else {
                existingProduct = this.products.find(p => p.id === productId);
            }
            
            if (existingProduct) {
                updatedProduct.image = existingProduct.image;
            }
        }

        // Use the sync system to update product
        if (window.productSync) {
            const success = window.productSync.updateProduct(productId, updatedProduct);
            if (success) {
                this.showNotification('Product updated successfully!', 'success');
            } else {
                this.showNotification('Product not found!', 'error');
            }
        } else {
            // Fallback to local storage
            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                this.products[productIndex] = updatedProduct;
                this.saveData();
                this.showNotification('Product updated successfully!', 'success');
            } else {
                this.showNotification('Product not found!', 'error');
            }
        }

        this.closeModal('editProductModal');
        this.loadProducts();
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            // Use the sync system to delete product
            if (window.productSync) {
                const success = window.productSync.deleteProduct(productId);
                if (success) {
                    this.showNotification('Product deleted successfully!', 'success');
                } else {
                    this.showNotification('Product not found!', 'error');
                }
            } else {
                // Fallback to local storage
                this.products = this.products.filter(p => p.id !== productId);
                this.saveData();
                this.showNotification('Product deleted successfully!', 'success');
            }
            this.loadProducts();
        }
    }

    deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category? Products in this category will be affected.')) {
            // Use the sync system to delete category
            if (window.productSync) {
                const success = window.productSync.deleteCategory(categoryId);
                if (success) {
                    this.showNotification('Category deleted successfully!', 'success');
                } else {
                    this.showNotification('Category not found!', 'error');
                }
            } else {
                // Fallback to local storage
                this.categories = this.categories.filter(c => c.id !== categoryId);
                this.saveData();
                this.showNotification('Category deleted successfully!', 'success');
            }
            this.loadCategories();
            this.updateCategorySelects();
        }
    }

    getProductCountByCategory(categoryName) {
        if (window.productSync) {
            return window.productSync.getProductsByCategory(categoryName).length;
        } else {
            return this.products.filter(p => p.category === categoryName).length;
        }
    }

    getImagePreview(file) {
        // Get the actual uploaded image data URL from the preview
        if (!file) return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop';
        
        // Check if there's a preview image already created
        const preview = document.querySelector('#addProductModal .upload-preview img') || 
                       document.querySelector('#editProductModal .upload-preview img');
        
        if (preview && preview.src && preview.src.startsWith('data:')) {
            return preview.src;
        }
        
        // Fallback to placeholder if no preview available
        return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop';
    }

    bindSearchFilters() {
        // Product search
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterProductsByCategory(e.target.value);
            });
        }

        // Order search
        const orderSearch = document.getElementById('orderSearch');
        if (orderSearch) {
            orderSearch.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }
    }

    bindImageUploads() {
        // Add product image upload
        const addProductImage = document.querySelector('#addProductModal input[type="file"]');
        if (addProductImage) {
            addProductImage.addEventListener('change', (e) => {
                this.handleImagePreview(e.target, '#addProductModal .upload-preview');
            });
        }

        // Edit product image upload
        const editProductImage = document.querySelector('#editProductModal input[type="file"]');
        if (editProductImage) {
            editProductImage.addEventListener('change', (e) => {
                this.handleImagePreview(e.target, '#editProductModal .upload-preview');
            });
        }
    }

    handleImagePreview(input, previewSelector) {
        const preview = document.querySelector(previewSelector);
        const file = input.files[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showNotification('Please select a valid image file.', 'error');
                input.value = ''; // Clear the input
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                this.showNotification('Image file size should be less than 5MB.', 'error');
                input.value = ''; // Clear the input
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">Image selected successfully</p>
                `;
            };
            reader.onerror = () => {
                this.showNotification('Error reading the image file.', 'error');
                input.value = ''; // Clear the input
            };
            reader.readAsDataURL(file);
        }
    }

    filterProducts(searchTerm) {
        let products = [];
        if (window.productSync) {
            products = window.productSync.getAllProducts();
        } else {
            products = this.products;
        }
        
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredProducts(filteredProducts);
    }

    filterProductsByCategory(category) {
        if (!category) {
            this.loadProducts();
            return;
        }
        
        let products = [];
        if (window.productSync) {
            products = window.productSync.getAllProducts();
        } else {
            products = this.products;
        }
        
        const filteredProducts = products.filter(product => product.category === category);
        this.renderFilteredProducts(filteredProducts);
    }

    renderFilteredProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<div class="empty-state"><p>No products found</p></div>';
        return;
    }
    
        const productsHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <div class="product-price">
                        <span class="current-price">₵${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">₵${product.originalPrice}</span>` : ''}
                </div>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="adminPortal.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn-danger" onclick="adminPortal.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
                </div>
        `).join('');

        productsGrid.innerHTML = productsHTML;
    }

    getAllCategories() {
        // Define all available categories from the product database
        const predefinedCategories = [
            'vitamins',
            'fragrances', 
            'face-care',
            'hair-beauty',
            'body-care',
            'sexual-wellness',
            'oral-care',
            'makeup',
            'tools-accessories',
            'tv-dvd',
            'audio-music',
            'laptops-computers',
            'electronics-accessories',
            'computer-accessories',
            'networking',
            'printers-scanners',
            'security-surveillance',
            'computer-hardware',
            'vehicle-parts',
            'cars',
            'motorcycles',
            'trucks-trailers',
            'buses',
            'construction-machinery',
            'watercraft',
            'food-beverages',
            'farm-machinery',
            'feeds-supplements',
            'farm-animals'
        ];
        
        let categories = [];
        if (window.productSync) {
            // Get existing categories from the sync system
            const existingCategories = window.productSync.getCategories();
            // Combine with predefined categories and remove duplicates
            categories = [...new Set([...predefinedCategories, ...existingCategories])];
        } else {
            // Use predefined categories plus any custom ones
            const customCategories = this.categories.map(c => c.name);
            categories = [...new Set([...predefinedCategories, ...customCategories])];
        }
        
        // Sort categories alphabetically for better UX
        categories.sort();
        
        return categories;
    }

    updateCategorySelects() {
        const categorySelects = document.querySelectorAll('select[name="category"]');
        categorySelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Category</option>';
            
            const categories = this.getAllCategories();
            
            categories.forEach(categoryName => {
                const option = document.createElement('option');
                option.value = categoryName;
                // Format category name for display (replace hyphens with spaces and capitalize)
                const displayName = categoryName.replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                option.textContent = displayName;
                select.appendChild(option);
            });
            select.value = currentValue;
        });
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;
        
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        const categories = this.getAllCategories();
        
        categories.forEach(categoryName => {
            const option = document.createElement('option');
            option.value = categoryName;
            // Format category name for display (replace hyphens with spaces and capitalize)
            const displayName = categoryName.replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            option.textContent = displayName;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = currentValue;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.updateCategorySelects();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
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
    }

    // Chat functionality
    initAdminChat() {
        this.activeConversation = null;
        this.chatInterval = null;
        this.bindChatEvents();
        this.startChatPolling();
    }

    bindChatEvents() {
        // Send message on button click
        const sendBtn = document.getElementById('adminSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendAdminMessage();
            });
        }

        // Send message on Enter key
        const chatInput = document.getElementById('adminChatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAdminMessage();
                }
            });
        }

        // Listen for storage events (new messages from users)
        window.addEventListener('storage', (e) => {
            if (e.key === 'donkomi-chat') {
                this.loadConversations();
                if (this.activeConversation) {
                    this.loadChatMessages(this.activeConversation);
                }
                this.updateMessageBadge();
            }
        });
    }

    loadMessages() {
        this.loadConversations();
        this.updateMessageBadge();
    }

    loadConversations() {
        const container = document.getElementById('conversationsList');
        const activeIndicator = document.getElementById('activeConversations');
        
        if (!container) return;

        const chats = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const conversationIds = Object.keys(chats);

        if (conversationIds.length === 0) {
            container.innerHTML = `
                <div class="empty-conversations">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                    <span>Customer messages will appear here</span>
                </div>
            `;
            activeIndicator.textContent = '0 active';
        return;
    }
    
        // Sort by most recent message
        const sortedConversations = conversationIds
            .map(id => ({ id, ...chats[id] }))
            .sort((a, b) => {
                const aTime = a.messages?.length ? a.messages[a.messages.length - 1].time : 0;
                const bTime = b.messages?.length ? b.messages[b.messages.length - 1].time : 0;
                return bTime - aTime;
            });

        const conversationsHTML = sortedConversations.map(conversation => {
            const lastMessage = conversation.messages?.length ? 
                conversation.messages[conversation.messages.length - 1] : null;
            const hasUnread = conversation.messages?.some(msg => 
                msg.from === 'user' && !msg.read
            );

            return `
                <div class="conversation-item ${this.activeConversation === conversation.id ? 'active' : ''} ${hasUnread ? 'unread' : ''}" 
                     data-conversation-id="${conversation.id}">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                         alt="User" class="conversation-avatar">
                    <div class="conversation-info">
                        <div class="conversation-name">${conversation.userName || 'User'}</div>
                        <div class="conversation-preview">
                            ${lastMessage ? this.escapeHtml(lastMessage.text) : 'No messages'}
            </div>
                    </div>
                    <div class="conversation-time">
                        ${lastMessage ? this.formatTime(lastMessage.time) : ''}
            </div>
        </div>
    `;
        }).join('');

        container.innerHTML = conversationsHTML;

        // Add click events to conversation items
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.conversationId;
                this.selectConversation(conversationId);
            });
        });

        activeIndicator.textContent = `${conversationIds.length} active`;

        // Auto-select first conversation if none selected
        if (!this.activeConversation && sortedConversations.length > 0) {
            this.selectConversation(sortedConversations[0].id);
        }
    }

    selectConversation(conversationId) {
        this.activeConversation = conversationId;
        
        // Update conversation list
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
            selectedItem.classList.remove('unread');
        }

        this.loadChatMessages(conversationId);
        this.markMessagesAsRead(conversationId);
        this.showChatInput();
        this.updateMessageBadge();
    }

    loadChatMessages(conversationId) {
        const messagesContainer = document.getElementById('adminChatMessages');
        const chatUserName = document.getElementById('chatUserName');
        const chatUserStatus = document.getElementById('chatUserStatus');
        const chatUserAvatar = document.getElementById('chatUserAvatar');

        if (!messagesContainer) return;

        const chats = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const conversation = chats[conversationId];

        if (!conversation) return;

        // Update header
        if (chatUserName) {
            chatUserName.textContent = conversation.userName || 'User';
        }
        if (chatUserStatus) {
            chatUserStatus.textContent = conversation.userEmail || 'Customer';
        }
        if (chatUserAvatar) {
            chatUserAvatar.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
        }

        // Load messages
        if (!conversation.messages || conversation.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="chat-welcome">
                    <i class="fas fa-comments"></i>
                    <h3>Start Conversation</h3>
                    <p>Send a message to ${conversation.userName || 'this customer'} to start the conversation.</p>
                </div>
            `;
        return;
    }
    
        const messagesHTML = conversation.messages.map(message => `
            <div class="chat-message ${message.from}">
                <div class="message-bubble">
                    ${this.escapeHtml(message.text)}
                </div>
                <div class="message-time">
                    ${this.formatTime(message.time)}
                </div>
            </div>
        `).join('');

        messagesContainer.innerHTML = messagesHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendAdminMessage() {
        const input = document.getElementById('adminChatInput');
        if (!input || !this.activeConversation) return;

        const messageText = input.value.trim();
        if (!messageText) return;

        const chats = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const conversation = chats[this.activeConversation];

        if (!conversation) return;

        const newMessage = {
            id: Date.now().toString(),
            from: 'admin',
            text: messageText,
            time: Date.now(),
            read: false
        };

        conversation.messages.push(newMessage);
        localStorage.setItem('donkomi-chat', JSON.stringify(chats));

        input.value = '';
        this.loadChatMessages(this.activeConversation);
        this.loadConversations(); // Update conversation list

        // Trigger storage event for user
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'donkomi-chat',
            newValue: JSON.stringify(chats)
        }));
    }

    markMessagesAsRead(conversationId) {
        const chats = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        const conversation = chats[conversationId];

        if (!conversation || !conversation.messages) return;

        let hasUnread = false;
        conversation.messages.forEach(message => {
            if (message.from === 'user' && !message.read) {
                message.read = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            localStorage.setItem('donkomi-chat', JSON.stringify(chats));
        }
    }

    showChatInput() {
        const chatInputArea = document.getElementById('chatInputArea');
        if (chatInputArea) {
            chatInputArea.style.display = 'block';
        }
    }

    startChatPolling() {
        this.clearChatInterval();
        this.chatInterval = setInterval(() => {
            this.updateMessageBadge();
            if (this.currentSection === 'messages') {
                this.loadConversations();
            }
        }, 5000); // Check every 5 seconds
    }

    clearChatInterval() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
        }
    }

    updateMessageBadge() {
        const messageBadge = document.getElementById('messageBadge');
        if (!messageBadge) return;

        const chats = JSON.parse(localStorage.getItem('donkomi-chat') || '{}');
        let hasUnread = false;

        Object.values(chats).forEach(conversation => {
            if (conversation.messages?.some(msg => msg.from === 'user' && !msg.read)) {
                hasUnread = true;
            }
        });

        messageBadge.style.display = hasUnread ? 'flex' : 'none';
    }

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
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    adminPortal.showSection(sectionName);
}

function showAddProductModal() {
    adminPortal.showModal('addProductModal');
}

function showAddCategoryModal() {
    adminPortal.showModal('addCategoryModal');
}

function closeModal(modalId) {
    adminPortal.closeModal(modalId);
}

function logout() {
    adminPortal.logout();
}

function sendAdminMessage() {
    adminPortal.sendAdminMessage();
}

function goToWebsite() {
    // Store a flag to indicate admin is visiting the website
    sessionStorage.setItem('adminVisitingWebsite', 'true');
    
    // Open main website in a new tab to preserve admin session
    window.open('index.html', '_blank');
}

// Initialize admin portal
let adminPortal;
document.addEventListener('DOMContentLoaded', function() {
    adminPortal = new AdminPortal();
});
