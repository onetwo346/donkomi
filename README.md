# 🚀 Donkomi Marketplace - Real-Time Edition

A premium marketplace website for Kumasi, Ghana with **real-time order synchronization** between customers and admin portal.

## ✨ Features

- **Real-time Order Sync**: WebSocket-powered instant order updates
- **Admin Portal**: Separate login page with comprehensive dashboard
- **Shopping Cart**: Full e-commerce functionality with local storage
- **Responsive Design**: Mobile-first, modern UI/UX
- **Localization**: Kumasi, Ghana specific content and currency (₵)
- **Fallback Support**: REST API when WebSocket unavailable

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Application
- **Main Site**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin.html
- **Health Check**: http://localhost:3000/health

## 🔌 Real-Time Architecture

### WebSocket Events
- `new_order`: Customer places new order
- `update_order_status`: Admin updates order status
- `orders_update`: Server broadcasts order changes
- `get_orders`: Admin requests current orders

### Data Flow
1. **Customer places order** → WebSocket → Server → Admin Portal (instant)
2. **Admin updates status** → WebSocket → Server → All connected clients
3. **Fallback**: REST API endpoints for reliability

## 🔐 Admin Access

- **Username**: `admin`
- **Password**: `donkomi2024`

## 📱 How It Works

1. **Customer Experience**:
   - Browse products, add to cart
   - Checkout with Kumasi-specific delivery
   - Order instantly appears in admin portal

2. **Admin Experience**:
   - Real-time order notifications
   - Live status updates
   - Instant dashboard refresh
   - Export orders and generate reports

## 🚀 Development

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🌐 Network Requirements

- **Port**: 3000 (configurable via PORT environment variable)
- **WebSocket**: ws://localhost:3000
- **HTTP**: http://localhost:3000

## 📊 Monitoring

- **Connection Status**: Visual indicators on both main site and admin
- **Health Endpoint**: `/health` for system status
- **Console Logs**: Detailed WebSocket and API activity

## 🔧 Troubleshooting

### WebSocket Connection Issues
1. Check if server is running on port 3000
2. Verify firewall settings
3. Check browser console for errors

### Order Sync Issues
1. Verify WebSocket connection status
2. Check browser console for API errors
3. Verify localStorage permissions

## 📁 File Structure

```
donkomi/
├── server.js          # WebSocket + Express server
├── package.json       # Dependencies
├── index.html         # Main marketplace
├── admin.html         # Admin login
├── admin-dashboard.html # Admin dashboard
├── script.js          # Main site JavaScript
├── admin.js           # Admin portal JavaScript
├── styles.css         # Main site styles
├── admin-styles.css   # Admin portal styles
└── README.md          # This file
```

## 🌟 Real-Time Benefits

- **Instant Order Updates**: No page refresh needed
- **Live Admin Dashboard**: See orders as they happen
- **Real-time Status**: Track order progress instantly
- **Multi-client Sync**: Multiple admin users see same data
- **Offline Fallback**: Local storage + REST API backup

---

**Built with ❤️ for Kumasi, Ghana**
