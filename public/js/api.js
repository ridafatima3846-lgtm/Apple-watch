const API_BASE = window.location.origin + '/api';

const STATIC_MODE = true;

async function apiFetch(url, options = {}) {
    if (STATIC_MODE) return null;
    try {
        const res = await fetch(API_BASE + url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        if (!res.ok) throw new Error('API error');
        return await res.json();
    } catch {
        return null;
    }
}

const API = {
    getConfig() {
        return { ownerNumber: OWNER_NUMBER };
    },
    async getProducts(params = {}) {
        const data = await apiFetch('/products' + (params ? '?' + new URLSearchParams(params) : ''));
        if (data) return data;
        let products = getProducts();
        if (params.featured === 'true') products = products.filter(p => p.featured);
        if (params.category) products = products.filter(p => p.category === params.category);
        return products;
    },
    async getProduct(id) {
        const data = await apiFetch('/products/' + id);
        if (data) return data;
        return getProduct(id);
    },
    async createProduct(formData) {
        const products = getProducts();
        const images = [];
        const file = formData.get('images');
        if (file && file.size > 0) {
            images.push(URL.createObjectURL(file));
        }
        const urlInput = formData.get('imageUrl');
        if (urlInput) images.push(urlInput);
        if (images.length === 0) images.push(imgPath('images/placeholder.svg'));
        const product = {
            _id: 'prod-' + Date.now(), name: formData.get('name'), description: formData.get('description'),
            price: parseFloat(formData.get('price')), images,
            colors: JSON.parse(formData.get('colors') || '[]'), sizes: JSON.parse(formData.get('sizes') || '[]'),
            stock: parseInt(formData.get('stock') || '10'), rating: parseFloat(formData.get('rating') || '4.5'),
            category: formData.get('category') || 'Smart Watch', featured: formData.get('featured') === 'true',
            badge: formData.get('badge') || '', freeGift: formData.get('freeGift') || ''
        };
        products.push(product);
        saveProducts(products);
        return product;
    },
    async updateProduct(id, formData) {
        const products = getProducts();
        const index = products.findIndex(p => p._id === id);
        if (index === -1) throw new Error('Not found');
        const existing = products[index];
        const images = [...(existing.images || [])];
        const file = formData.get('images');
        if (file && file.size > 0) {
            images.push(URL.createObjectURL(file));
        }
        const urlInput = formData.get('imageUrl');
        if (urlInput) images.push(urlInput);
        const updated = {
            ...existing, name: formData.get('name') || existing.name,
            description: formData.get('description') || existing.description,
            price: parseFloat(formData.get('price') || existing.price), images,
            colors: formData.get('colors') ? JSON.parse(formData.get('colors')) : existing.colors,
            sizes: formData.get('sizes') ? JSON.parse(formData.get('sizes')) : existing.sizes,
            stock: parseInt(formData.get('stock') || existing.stock),
            rating: parseFloat(formData.get('rating') || existing.rating),
            category: formData.get('category') || existing.category,
            featured: formData.get('featured') !== null ? formData.get('featured') === 'true' : existing.featured,
            badge: formData.get('badge') || existing.badge || '', freeGift: formData.get('freeGift') || existing.freeGift || ''
        };
        products[index] = updated;
        saveProducts(products);
        return updated;
    },
    async deleteProduct(id) {
        let products = getProducts();
        products = products.filter(p => p._id !== id);
        saveProducts(products);
        return { message: 'Deleted' };
    },
    async createOrder(data) {
        const orders = getOrders();
        let orderId;
        do { const num = Math.floor(1000 + Math.random() * 9000); orderId = '#' + num; }
        while (orders.find(o => o.orderId === orderId));
        const order = { _id: 'ord-' + Date.now(), orderId, ...data, status: 'Pending', paymentMethod: 'Cash on Delivery', createdAt: new Date().toISOString() };
        orders.unshift(order);
        saveOrders(orders);
        return order;
    },
    async getOrders() {
        return getOrders();
    },
    async getOrder(id) {
        return getOrders().find(o => o._id === id) || null;
    },
    async updateOrderStatus(id, status) {
        const orders = getOrders();
        const index = orders.findIndex(o => o._id === id);
        if (index === -1) throw new Error('Not found');
        orders[index].status = status;
        saveOrders(orders);
        return orders[index];
    },
    async updateOrderPayment(id, paymentMethod) {
        const orders = getOrders();
        const index = orders.findIndex(o => o._id === id);
        if (index === -1) throw new Error('Not found');
        orders[index].paymentMethod = paymentMethod;
        saveOrders(orders);
        return orders[index];
    },
    async addTrackingUpdate(id, update) {
        const orders = getOrders();
        const index = orders.findIndex(o => o._id === id);
        if (index === -1) throw new Error('Not found');
        if (!orders[index].trackingUpdates) orders[index].trackingUpdates = [];
        orders[index].trackingUpdates.push({ ...update, date: new Date().toISOString() });
        if (update.status) orders[index].status = update.status;
        saveOrders(orders);
        return orders[index];
    },
    async deleteOrder(id) {
        let orders = getOrders();
        orders = orders.filter(o => o._id !== id);
        saveOrders(orders);
        return { message: 'Deleted' };
    },
    async searchOrders(query) {
        const orders = getOrders();
        const q = query.toLowerCase();
        return orders.filter(o =>
            o.orderId.toLowerCase().includes(q) ||
            (o.customerName || '').toLowerCase().includes(q) ||
            (o.phone || '').includes(q) ||
            (o.city || '').toLowerCase().includes(q)
        );
    },
    async trackOrder(query) {
        let order = getOrderByOrderId(query);
        if (!order) order = getOrderByPhone(query);
        return order || Promise.reject(new Error('Not found'));
    },
    async getReviews(productId) {
        return getReviews(productId);
    },
    async addReview(data) {
        return addReview(data);
    },
    async deleteReview(id) {
        let reviews = getReviews();
        reviews = reviews.filter(r => r._id !== id);
        saveReviews(reviews);
        return { message: 'Deleted' };
    },
    async getChats() {
        return getChats();
    },
    async createChat(orderId, customerName, customerPhone) {
        const chats = getChats();
        let chat = chats.find(c => c.orderId === orderId);
        if (!chat) {
            chat = { _id: 'chat-' + Date.now(), orderId, customerName: customerName || 'Guest', customerPhone: customerPhone || '', messages: [], unread: { customer: false, admin: false }, createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString() };
            chats.push(chat);
            saveChats(chats);
        }
        return chat;
    },
    async getChatMessages(chatId) {
        const chat = getChats().find(c => c._id === chatId);
        return chat ? chat.messages : [];
    },
    async sendMessage(chatId, text, from = 'customer') {
        return addChatMessage(chatId, from, text);
    },
    async markChatRead(chatId, role = 'admin') {
        const chats = getChats();
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
            if (!chat.unread) chat.unread = { customer: false, admin: false };
            if (role === 'admin') chat.unread.admin = false;
            else chat.unread.customer = false;
            saveChats(chats);
        }
    },
    async getBanner() {
        return getBanner();
    },
    async updateBanner(banner) {
        saveBanner(banner);
        return banner;
    }
};