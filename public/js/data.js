const OWNER_NUMBER = '923001234567';

function imgPath(path) {
    const depth = window.location.pathname.split('/').filter(s => s).length;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
    return prefix + path;
}

function localImg(name) {
    return imgPath('images/' + name);
}

const DEFAULT_PRODUCTS = [
    {
        _id: 'watch-luxury-1',
        name: 'Royal Smart Watch Pro',
        description: 'Premium smart watch with Bluetooth calling, heart rate monitor, IP67 waterproof. Comes with FREE Silver Chain worth Rs. 1,500!',
        price: 5500,
        images: [localImg('watch-1.jpg')],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Silver', hex: '#c0c0c0' }, { name: 'Gold', hex: '#d4af37' }],
        sizes: ['Free Size'],
        stock: 25,
        rating: 4.8,
        category: 'Smart Watch',
        featured: true,
        badge: 'BEST SELLER',
        freeGift: 'Silver Chain Included'
    },
    {
        _id: 'watch-luxury-2',
        name: 'Elite Smart Watch X1',
        description: 'Ultra-slim smartwatch with 1.8" HD display, fitness tracker, sleep monitor. FREE Silver Chain included with every purchase!',
        price: 5500,
        images: [localImg('watch-2.jpg')],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Blue', hex: '#1e3a5f' }],
        sizes: ['Free Size'],
        stock: 30,
        rating: 4.7,
        category: 'Smart Watch',
        featured: true,
        badge: 'HOT',
        freeGift: 'Silver Chain Included'
    },
    {
        _id: 'watch-luxury-3',
        name: 'Luxury Gold Smart Watch',
        description: 'Elegant gold-tone smartwatch with premium leather strap, AMOLED display. Get a FREE Silver Chain with this amazing deal!',
        price: 5500,
        images: [localImg('watch-3.jpg')],
        colors: [{ name: 'Gold', hex: '#d4af37' }, { name: 'Rose Gold', hex: '#b76e79' }],
        sizes: ['Free Size'],
        stock: 18,
        rating: 4.9,
        category: 'Smart Watch',
        featured: true,
        badge: 'PREMIUM',
        freeGift: 'Silver Chain Included'
    },
    {
        _id: 'watch-luxury-4',
        name: 'Sport Smart Watch S2',
        description: 'Rugged sport smartwatch with GPS, heart rate, blood pressure monitor. Includes FREE Silver Chain - limited time offer!',
        price: 5500,
        images: [localImg('watch-4.jpg')],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Green', hex: '#2d5016' }, { name: 'Orange', hex: '#ff6b35' }],
        sizes: ['Free Size'],
        stock: 22,
        rating: 4.6,
        category: 'Smart Watch',
        featured: false,
        freeGift: 'Silver Chain Included'
    },
    {
        _id: 'watch-luxury-5',
        name: 'Classic Leather Smart Watch',
        description: 'Premium faux leather strap smartwatch with wireless charging, 7-day battery life. Free Silver Chain worth Rs. 1,500!',
        price: 5500,
        images: [localImg('watch-5.jpg')],
        colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#000000' }],
        sizes: ['Free Size'],
        stock: 15,
        rating: 4.5,
        category: 'Smart Watch',
        featured: false,
        freeGift: 'Silver Chain Included'
    },
    {
        _id: 'watch-luxury-6',
        name: 'Ultra Slim Smart Watch Z1',
        description: 'Sleek and lightweight smartwatch with always-on display, SpO2 tracking, 100+ watch faces. FREE Silver Chain included!',
        price: 5500,
        images: [localImg('watch-6.jpg')],
        colors: [{ name: 'Silver', hex: '#c0c0c0' }, { name: 'Pink', hex: '#ffb6c1' }, { name: 'Black', hex: '#000000' }],
        sizes: ['Free Size'],
        stock: 20,
        rating: 4.7,
        category: 'Smart Watch',
        featured: false,
        freeGift: 'Silver Chain Included'
    }
];

function getBanner() {
    return JSON.parse(localStorage.getItem('watchlux_banner') || '{}');
}

function saveBanner(banner) {
    localStorage.setItem('watchlux_banner', JSON.stringify(banner));
}

function getProducts() {
    const stored = localStorage.getItem('watchlux_products');
    if (stored) {
        try {
            const custom = JSON.parse(stored);
            return custom;
        } catch (e) {
            return DEFAULT_PRODUCTS;
        }
    }
    return DEFAULT_PRODUCTS;
}

function saveProducts(products) {
    localStorage.setItem('watchlux_products', JSON.stringify(products));
}

function getProduct(id) {
    return getProducts().find(p => p._id === id) || null;
}

function getOrders() {
    return JSON.parse(localStorage.getItem('watchlux_orders') || '[]');
}

function saveOrders(orders) {
    localStorage.setItem('watchlux_orders', JSON.stringify(orders));
}

function getOrderByPhone(phone) {
    return getOrders().find(o => o.phone === phone || o.whatsapp === phone) || null;
}

function getOrderByOrderId(orderId) {
    return getOrders().find(o => o.orderId === orderId) || null;
}

function getReviews(productId) {
    const all = JSON.parse(localStorage.getItem('watchlux_reviews') || '[]');
    return productId ? all.filter(r => r.productId === productId) : all;
}

function saveReviews(reviews) {
    localStorage.setItem('watchlux_reviews', JSON.stringify(reviews));
}

function getChats() {
    return JSON.parse(localStorage.getItem('watchlux_chats') || '[]');
}

function saveChats(chats) {
    localStorage.setItem('watchlux_chats', JSON.stringify(chats));
}

function addChatMessage(orderId, from, text, customerName, customerPhone) {
    const chats = getChats();
    let chat = chats.find(c => c.orderId === orderId);
    if (!chat) {
        chat = {
            _id: 'chat-' + Date.now(),
            orderId,
            customerName: customerName || 'Guest',
            customerPhone: customerPhone || '',
            messages: [],
            unread: { customer: false, admin: false },
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString()
        };
        chats.push(chat);
    }
    const msg = { from, text, timestamp: new Date().toISOString() };
    chat.messages.push(msg);
    chat.lastMessageAt = msg.timestamp;
    if (from === 'customer') chat.unread.admin = true;
    else chat.unread.customer = true;
    saveChats(chats);
    return msg;
}

function addReview(review) {
    const all = getReviews();
    const newReview = {
        _id: 'rev-' + Date.now(),
        productId: review.productId,
        customerName: review.customerName,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString(),
        status: 'Approved'
    };
    all.push(newReview);
    saveReviews(all);
    return newReview;
}
