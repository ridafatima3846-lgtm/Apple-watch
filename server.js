const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = process.env.PERSISTENT_DIR || __dirname;
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

const DATA_FILE = path.join(dataDir, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return { products: [], orders: [], reviews: [] };
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch { return { products: [], orders: [], reviews: [] }; }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function genId(prefix) {
    return prefix + '-' + Date.now() + Math.random().toString(36).slice(2, 6);
}

app.get('/api/config', (req, res) => {
    res.json({ ownerNumber: process.env.OWNER_NUMBER || '923001234567' });
});

app.get('/api/products', (req, res) => {
    let products = readData().products;
    if (req.query.featured === 'true') products = products.filter(p => p.featured);
    if (req.query.category) products = products.filter(p => p.category === req.query.category);
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = readData().products.find(p => p._id === req.params.id);
    product ? res.json(product) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/products', upload.array('images', 10), (req, res) => {
    const data = readData();
    const images = req.files && req.files.length > 0
        ? req.files.map(f => '/uploads/' + f.filename)
        : ['/images/placeholder.svg'];
    const product = {
        _id: genId('prod'),
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        images,
        colors: JSON.parse(req.body.colors || '[]'),
        sizes: JSON.parse(req.body.sizes || '[]'),
        stock: parseInt(req.body.stock || '10'),
        rating: parseFloat(req.body.rating || '4.5'),
        category: req.body.category || 'Smart Watch',
        featured: req.body.featured === 'true',
        badge: req.body.badge || '',
        freeGift: req.body.freeGift || ''
    };
    data.products.push(product);
    writeData(data);
    res.json(product);
});

app.put('/api/products/:id', upload.array('images', 10), (req, res) => {
    const data = readData();
    const index = data.products.findIndex(p => p._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const existing = data.products[index];
    const images = req.files && req.files.length > 0
        ? req.files.map(f => '/uploads/' + f.filename)
        : existing.images;
    data.products[index] = {
        ...existing,
        name: req.body.name || existing.name,
        description: req.body.description || existing.description,
        price: parseFloat(req.body.price || existing.price),
        images,
        colors: req.body.colors ? JSON.parse(req.body.colors) : existing.colors,
        sizes: req.body.sizes ? JSON.parse(req.body.sizes) : existing.sizes,
        stock: parseInt(req.body.stock || existing.stock),
        rating: parseFloat(req.body.rating || existing.rating),
        category: req.body.category || existing.category,
        featured: req.body.featured !== undefined ? req.body.featured === 'true' : existing.featured,
        badge: req.body.badge !== undefined ? req.body.badge : existing.badge,
        freeGift: req.body.freeGift !== undefined ? req.body.freeGift : existing.freeGift
    };
    writeData(data);
    res.json(data.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    data.products = data.products.filter(p => p._id !== req.params.id);
    writeData(data);
    res.json({ message: 'Deleted' });
});

app.get('/api/orders', (req, res) => {
    res.json(readData().orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = readData().orders.find(o => o._id === req.params.id);
    order ? res.json(order) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/orders', (req, res) => {
    const data = readData();
    let orderId;
    do {
        const num = Math.floor(1000 + Math.random() * 9000);
        orderId = '#' + num;
    } while (data.orders.find(o => o.orderId === orderId));
    const order = {
        _id: genId('ord'),
        orderId,
        ...req.body,
        status: 'Pending',
        paymentMethod: req.body.paymentMethod || 'Cash on Delivery',
        trackingUpdates: [{ status: 'Pending', note: 'Order placed successfully', date: new Date().toISOString() }],
        createdAt: new Date().toISOString()
    };
    data.orders.unshift(order);
    writeData(data);
    res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
    const data = readData();
    const index = data.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    data.orders[index].status = req.body.status;
    writeData(data);
    res.json(data.orders[index]);
});

app.put('/api/orders/:id/payment', (req, res) => {
    const data = readData();
    const index = data.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    data.orders[index].paymentMethod = req.body.paymentMethod;
    writeData(data);
    res.json(data.orders[index]);
});

app.post('/api/orders/:id/tracking', (req, res) => {
    const data = readData();
    const index = data.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    if (!data.orders[index].trackingUpdates) data.orders[index].trackingUpdates = [];
    data.orders[index].trackingUpdates.push({
        status: req.body.status,
        note: req.body.note || '',
        date: new Date().toISOString()
    });
    if (req.body.status) data.orders[index].status = req.body.status;
    writeData(data);
    res.json(data.orders[index]);
});

app.delete('/api/orders/:id', (req, res) => {
    const data = readData();
    data.orders = data.orders.filter(o => o._id !== req.params.id);
    writeData(data);
    res.json({ message: 'Deleted' });
});

app.get('/api/orders/search/:query', (req, res) => {
    const q = req.params.query.toLowerCase();
    const orders = readData().orders.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.city || '').toLowerCase().includes(q)
    );
    res.json(orders);
});

app.get('/api/track', (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const orders = readData().orders;
    let order = orders.find(o => o.orderId === q);
    if (!order) order = orders.find(o => o.phone === q || o.whatsapp === q);
    order ? res.json(order) : res.status(404).json({ error: 'Not found' });
});

app.get('/api/reviews', (req, res) => {
    const reviews = readData().reviews;
    if (req.query.productId) {
        res.json(reviews.filter(r => r.productId === req.query.productId));
    } else {
        res.json(reviews);
    }
});

app.post('/api/reviews', (req, res) => {
    const data = readData();
    const review = {
        _id: genId('rev'),
        productId: req.body.productId,
        customerName: req.body.customerName,
        rating: req.body.rating,
        comment: req.body.comment,
        createdAt: new Date().toISOString(),
        status: 'Approved'
    };
    data.reviews.push(review);
    writeData(data);
    res.json(review);
});

app.delete('/api/reviews/:id', (req, res) => {
    const data = readData();
    data.reviews = data.reviews.filter(r => r._id !== req.params.id);
    writeData(data);
    res.json({ message: 'Deleted' });
});

app.get('/api/chats', (req, res) => {
    const data = readData();
    const chats = (data.chats || []).sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
    res.json(chats);
});

app.get('/api/chats/unread', (req, res) => {
    const chats = readData().chats || [];
    const count = chats.filter(c => c.unread && c.unread.admin).length;
    res.json({ count });
});

app.post('/api/chats', (req, res) => {
    const data = readData();
    let chat = (data.chats || []).find(c => c.orderId === req.body.orderId);
    if (!chat) {
        chat = {
            _id: genId('chat'),
            orderId: req.body.orderId,
            customerName: req.body.customerName || 'Guest',
            customerPhone: req.body.customerPhone || '',
            messages: [],
            unread: { customer: false, admin: false },
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString()
        };
        if (!data.chats) data.chats = [];
        data.chats.push(chat);
        writeData(data);
    }
    res.json(chat);
});

app.get('/api/chats/:id/messages', (req, res) => {
    const chat = (readData().chats || []).find(c => c._id === req.params.id);
    chat ? res.json(chat.messages || []) : res.status(404).json({ error: 'Chat not found' });
});

app.post('/api/chats/:id/messages', (req, res) => {
    const data = readData();
    const chat = (data.chats || []).find(c => c._id === req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    const msg = {
        from: req.body.from || 'customer',
        text: req.body.text,
        timestamp: new Date().toISOString()
    };
    if (!chat.messages) chat.messages = [];
    chat.messages.push(msg);
    chat.lastMessageAt = msg.timestamp;
    if (msg.from === 'customer') chat.unread = { customer: false, admin: true };
    else chat.unread = { customer: true, admin: false };
    writeData(data);
    res.json(msg);
});

app.post('/api/chats/:id/read', (req, res) => {
    const data = readData();
    const chat = (data.chats || []).find(c => c._id === req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    const role = req.body.role || 'admin';
    if (!chat.unread) chat.unread = { customer: false, admin: false };
    if (role === 'admin') chat.unread.admin = false;
    else chat.unread.customer = false;
    writeData(data);
    res.json({ success: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`WatchLux server running on http://localhost:${PORT}`);
});
