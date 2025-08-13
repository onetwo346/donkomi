// Admin Portal JavaScript

// Check if user is already logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn === 'true' && currentPage === 'admin.html') {
        // Redirect to dashboard if already logged in
        window.location.href = 'admin-dashboard.html';
    } else if (isLoggedIn !== 'true' && currentPage === 'admin-dashboard.html') {
        // Redirect to login if not authenticated
        window.location.href = 'admin.html';
    }
}

// Admin Login Functionality
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Simple authentication (in production, this would be server-side)
    if (username === 'admin' && password === 'donkomi2024') {
        // Set authentication status
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        
        if (rememberMe) {
            localStorage.setItem('adminRememberMe', 'true');
        }
        
        // Show success message
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
    }
}

// Logout Functionality
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminRememberMe');
    
    showNotification('Logged out successfully!', 'success');
    
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1000);
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
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
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Tab Management
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to selected menu item
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update header content
    updateHeaderContent(tabName);
    
    // Load tab-specific data
    loadTabData(tabName);
}

// Update Header Content
function updateHeaderContent(tabName) {
    const titleElement = document.getElementById('currentTabTitle');
    const subtitleElement = document.getElementById('currentTabSubtitle');
    
    const tabInfo = {
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Real-time overview of Kumasi operations'
        },
        orders: {
            title: 'Order Management',
            subtitle: 'Manage and track all customer orders'
        },
        products: {
            title: 'Products',
            subtitle: 'Manage product catalog and inventory'
        },
        customers: {
            title: 'Customers',
            subtitle: 'View and manage customer information'
        },
        reports: {
            title: 'Reports & Analytics',
            subtitle: 'Generate insights and business reports'
        },
        settings: {
            title: 'Admin Settings',
            subtitle: 'Configure system settings and preferences'
        }
    };
    
    if (tabInfo[tabName]) {
        titleElement.textContent = tabInfo[tabName].title;
        subtitleElement.textContent = tabInfo[tabName].subtitle;
    }
}

// Load Tab Data
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'products':
            // Load products data when implemented
            break;
        case 'customers':
            // Load customers data when implemented
            break;
        case 'reports':
            // Load reports data when implemented
            break;
        case 'settings':
            // Load settings data when implemented
            break;
    }
}

// Dashboard Data Loading
function loadDashboardData() {
    updateStats();
    loadRecentOrders();
    updateRevenueData();
}

// Update Statistics
function updateStats() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('shippedOrders').textContent = shipped;
    document.getElementById('deliveredOrders').textContent = delivered;
}

// Load Recent Orders
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    const recentOrders = orders.slice(0, 5); // Show last 5 orders
    
    const table = document.getElementById('recentOrdersTable');
    
    if (recentOrders.length === 0) {
        table.innerHTML = '<p style="text-align: center; padding: 2rem; opacity: 0.7;">No orders yet</p>';
        return;
    }
    
    const header = `
        <div class="orders-table-header">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Items</div>
            <div>Total</div>
            <div>Status</div>
        </div>
    `;
    
    const rows = recentOrders.map(order => `
        <div class="order-row">
            <div>${order.orderId}</div>
            <div>
                <strong>${order.customer.name}</strong><br>
                <small>${order.customer.phone}</small>
            </div>
            <div>${order.items.length} items</div>
            <div>₵${order.total.toFixed(2)}</div>
            <div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
        </div>
    `).join('');
    
    table.innerHTML = header + rows;
}

// Update Revenue Data
function updateRevenueData() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    
    document.getElementById('totalRevenue').textContent = `₵${totalRevenue.toFixed(2)}`;
    document.getElementById('avgOrderValue').textContent = `₵${avgOrderValue.toFixed(2)}`;
    document.getElementById('ordersCompleted').textContent = completedOrders;
}

// Orders Data Loading
function loadOrdersData() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    renderOrdersTable(orders);
}

// Render Orders Table
function renderOrdersTable(orders) {
    const table = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        table.innerHTML = '<p style="text-align: center; padding: 2rem; opacity: 0.7;">No orders found</p>';
        return;
    }
    
    const header = `
        <div class="orders-table-header">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Items</div>
            <div>Total</div>
            <div>Status</div>
            <div>Actions</div>
        </div>
    `;
    
    const rows = orders.map(order => `
        <div class="order-row">
            <div>${order.orderId}</div>
            <div>
                <strong>${order.customer.name}</strong><br>
                <small>${order.customer.phone}</small>
            </div>
            <div>${order.items.length} items</div>
            <div>₵${order.total.toFixed(2)}</div>
            <div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div>
                <button class="btn-secondary" onclick="updateOrderStatus('${order.orderId}', 'confirmed')" 
                        ${order.status !== 'pending' ? 'disabled' : ''}>
                    Confirm
                </button>
                <button class="btn-secondary" onclick="updateOrderStatus('${order.orderId}', 'shipped')"
                        ${order.status !== 'confirmed' ? 'disabled' : ''}>
                    Ship
                </button>
                <button class="btn-secondary" onclick="updateOrderStatus('${order.orderId}', 'delivered')"
                        ${order.status !== 'shipped' ? 'disabled' : ''}>
                    Deliver
                </button>
            </div>
        </div>
    `).join('');
    
    table.innerHTML = header + rows;
}

// Update Order Status
function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        
        localStorage.setItem('donkomi-orders', JSON.stringify(orders));
        
        showNotification(`Order ${orderId} status updated to ${newStatus}`, 'success');
        
        // Refresh data
        if (document.getElementById('dashboard-tab').classList.contains('active')) {
            loadDashboardData();
        } else {
            loadOrdersData();
        }
    }
}

// Filter Orders
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('dateRangeFilter').value;
    
    let orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    
    // Filter by status
    if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
        const now = new Date();
        let filterDate;
        
        switch(dateFilter) {
            case 'today':
                filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        
        if (filterDate) {
            orders = orders.filter(o => new Date(o.date) >= filterDate);
        }
    }
    
    renderOrdersTable(orders);
}

// Refresh Orders
function refreshOrders() {
    showNotification('Orders refreshed successfully!', 'success');
    loadOrdersData();
}

// Export Orders
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    
    if (orders.length === 0) {
        showNotification('No orders to export', 'info');
        return;
    }
    
    const csvContent = generateCSV(orders);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donkomi-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Orders exported successfully!', 'success');
}

// Generate CSV
function generateCSV(orders) {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Items', 'Total', 'Status', 'Date', 'Location'];
    const rows = orders.map(order => [
        order.orderId,
        order.customer.name,
        order.customer.phone,
        order.customer.address,
        order.items.map(item => `${item.name} x${item.quantity}`).join('; '),
        `₵${order.total.toFixed(2)}`,
        order.status,
        new Date(order.date).toLocaleDateString(),
        order.location
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Generate Report
function generateReport() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    
    if (orders.length === 0) {
        showNotification('No orders to generate report for', 'info');
        return;
    }
    
    const report = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        statusBreakdown: {
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        },
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
    };
    
    showReportModal(report);
}

// Show Report Modal
function showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Sales Report</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="report-item">
                    <h4>Total Orders: ${report.totalOrders}</h4>
                </div>
                <div class="report-item">
                    <h4>Total Revenue: ₵${report.totalRevenue.toFixed(2)}</h4>
                </div>
                <div class="report-item">
                    <h4>Average Order Value: ₵${report.averageOrderValue.toFixed(2)}</h4>
                </div>
                <div class="report-item">
                    <h4>Status Breakdown:</h4>
                    <ul>
                        <li>Pending: ${report.statusBreakdown.pending}</li>
                        <li>Confirmed: ${report.statusBreakdown.confirmed}</li>
                        <li>Shipped: ${report.statusBreakdown.shipped}</li>
                        <li>Delivered: ${report.statusBreakdown.delivered}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles if not already present
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
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

            .modal-content {
                background: white;
                border-radius: 20px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e2e8f0;
            }

            .modal-header h3 {
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

            .modal-body {
                padding: 1.5rem;
            }

            .report-item {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 10px;
            }

            .report-item h4 {
                margin: 0 0 0.5rem 0;
                color: #6366f1;
            }

            .report-item ul {
                margin: 0.5rem 0 0 0;
                padding-left: 1.5rem;
            }

            .report-item li {
                margin-bottom: 0.25rem;
                color: #64748b;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}

// Show Add Tracking Modal
function showAddTrackingModal() {
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    const confirmedOrders = orders.filter(o => o.status === 'confirmed');
    
    if (confirmedOrders.length === 0) {
        showNotification('No confirmed orders to add tracking for', 'info');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Tracking Number</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="trackingForm">
                    <div class="form-group">
                        <label for="trackingOrderId">Order ID</label>
                        <select id="trackingOrderId" required>
                            <option value="">Select Order</option>
                            ${confirmedOrders.map(o => 
                                `<option value="${o.orderId}">${o.orderId} - ${o.customer.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trackingNumber">Tracking Number</label>
                        <input type="text" id="trackingNumber" placeholder="Enter tracking number" required>
                    </div>
                    <div class="form-group">
                        <label for="courier">Courier Service</label>
                        <select id="courier" required>
                            <option value="">Select courier</option>
                            <option value="ghana-post">Ghana Post</option>
                            <option value="dhl">DHL</option>
                            <option value="fedex">FedEx</option>
                            <option value="local-delivery">Local Delivery (Kumasi)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">Add Tracking</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('trackingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTrackingToOrder();
    });
}

// Add Tracking to Order
function addTrackingToOrder() {
    const orderId = document.getElementById('trackingOrderId').value;
    const trackingNumber = document.getElementById('trackingNumber').value;
    const courier = document.getElementById('courier').value;
    
    if (!orderId || !trackingNumber || !courier) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('donkomi-orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        order.tracking = {
            number: trackingNumber,
            courier: courier,
            addedAt: new Date().toISOString()
        };
        order.status = 'shipped';
        
        localStorage.setItem('donkomi-orders', JSON.stringify(orders));
        
        showNotification('Tracking number added successfully!', 'success');
        
        // Close modal
        document.querySelector('.modal-overlay').remove();
        
        // Refresh data
        if (document.getElementById('dashboard-tab').classList.contains('active')) {
            loadDashboardData();
        } else {
            loadOrdersData();
        }
    }
}

// Refresh Data
function refreshData() {
    showNotification('Data refreshed successfully!', 'success');
    loadDashboardData();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Set up event listeners based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin.html') {
        // Login page
        document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    } else if (currentPage === 'admin-dashboard.html') {
        // Dashboard page
        setupDashboardEventListeners();
        loadDashboardData();
    }
});

// Setup Dashboard Event Listeners
function setupDashboardEventListeners() {
    // Menu item clicks
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Filter changes
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);
    document.getElementById('dateRangeFilter').addEventListener('change', filterOrders);
    
    // Revenue period change
    document.getElementById('revenuePeriod').addEventListener('change', updateRevenueData);
}

// Open Admin Portal from main page
function openAdminPortal() {
    window.open('admin.html', '_blank');
}
