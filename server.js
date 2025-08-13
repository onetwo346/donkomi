const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('.'));
app.use(express.json());

// Store connected clients
const clients = new Set();
const orders = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    // Send existing orders to new client
    ws.send(JSON.stringify({
        type: 'orders_update',
        orders: orders
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'new_order':
                    // Add new order
                    const order = {
                        ...data.order,
                        id: Date.now().toString(),
                        timestamp: new Date().toISOString()
                    };
                    orders.unshift(order);
                    
                    // Broadcast to all connected clients
                    broadcast({
                        type: 'orders_update',
                        orders: orders
                    });
                    
                    console.log('New order received:', order.orderId);
                    break;
                    
                case 'update_order_status':
                    // Update order status
                    const orderIndex = orders.findIndex(o => o.orderId === data.orderId);
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = data.newStatus;
                        orders[orderIndex].updatedAt = new Date().toISOString();
                        
                        // Broadcast update to all clients
                        broadcast({
                            type: 'orders_update',
                            orders: orders
                        });
                        
                        console.log('Order status updated:', data.orderId, data.newStatus);
                    }
                    break;
                    
                case 'get_orders':
                    // Send current orders to requesting client
                    ws.send(JSON.stringify({
                        type: 'orders_update',
                        orders: orders
                    }));
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// Broadcast message to all connected clients
function broadcast(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// REST API endpoints for fallback
app.post('/api/orders', (req, res) => {
    const order = {
        ...req.body,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    };
    
    orders.unshift(order);
    
    // Broadcast to WebSocket clients
    broadcast({
        type: 'orders_update',
        orders: orders
    });
    
    res.json({ success: true, orderId: order.orderId });
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.put('/api/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        // Broadcast update to WebSocket clients
        broadcast({
            type: 'orders_update',
            orders: orders
        });
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        connectedClients: clients.size,
        totalOrders: orders.length
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Donkomi Server running on port ${PORT}`);
    console.log(`📱 Main site: http://localhost:${PORT}`);
    console.log(`🔐 Admin portal: http://localhost:${PORT}/admin.html`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    wss.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
