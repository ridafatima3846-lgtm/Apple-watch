const API_BASE = window.location.origin + '/api';

async function apiFetch(url, options = {}) {
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
        const qs = new URLSearchParams(params).toString();
        const data = await apiFetch('/products' + (qs ? '?' + qs : ''));
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
        const res = await fetch(API_BASE + '/products', { method: 'POST', body: formData });
        if (res.ok) return await res.json();
        const products = getProducts();
        const newId = 'prod-' + Date.now();
        const files = formData.getAll('images').filter(f => f.size > 0);
        const images = files.length > 0 ? files.map(f => URL.createObjectURL(f)) : [imgPath('images/placeholder.svg')];
        const product = {
            _id: newId, name: formData.get('name'), description: formData.get('description'),
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
        const res = await fetch(API_BASE + '/products/' + id, { method: 'PUT', body: formData });
        if (res.ok) return await res.json();
        const products = getProducts();
        const index = products.findIndex(p => p._id === id);
        if (index === -1) throw new Error('Not found');
        const existing = products[index];
        const files = formData.getAll('images').filter(f => f.size > 0);
        const images = files.length > 0 ? files.map(f => URL.createObjectURL(f)) : existing.images;
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
        const data = await apiFetch('/products/' + id, { method: 'DELETE' });
        if (data) return data;
        let products = getProducts();
        products = products.filter(p => p._id !== id);
        saveProducts(products);
        return { message: 'Deleted' };
    },
    async createOrder(data) {
        const res = await fetch(API_BASE + '/orders', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
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
        const data = await apiFetch('/orders');
        if (data) return data;
        return getOrders();
    },
    async getOrder(id) {
        const data = await apiFetch('/orders/' + id);
        if (data) return data;
        return getOrders().find(o => o._id === id) || null;
    },
    async updateOrderStatus(id, status) {
        const data = await apiFetch('/orders/' + id + '/status', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
        });
        if (data) return data;
        const orders = getOrders();
        const index = orders.findIndex(o => o._id === id);
        if (index === -1) throw new Error('Not found');
        orders[index].status = status;
        saveOrders(orders);
        return orders[index];
    },
    async updateOrderPayment(id, paymentMethod) {
        const data = await apiFetch('/orders/' + id + '/payment', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethod })
        });
        if (data) return data;
        const orders = getOrders();
        const index = orders.findIndex(o => o._id === id);
        if (index === -1) throw new Error('Not found');
        orders[index].paymentMethod = paymentMethod;
        saveOrders(orders);
        return orders[index];
    },
    async addTrackingUpdate(id, update) {
        const data = await apiFetch('/orders/' + id + '/tracking', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update)
        });
        if (data) return data;
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
        const data = await apiFetch('/orders/' + id, { method: 'DELETE' });
        if (data) return data;
        let orders = getOrders();
        orders = orders.filter(o => o._id !== id);
        saveOrders(orders);
        return { message: 'Deleted' };
    },
    async searchOrders(query) {
        const data = await apiFetch('/orders/search/' + encodeURIComponent(query));
        if (data) return data;
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
        const data = await apiFetch('/track?q=' + encodeURIComponent(query));
        if (data) return data;
        let order = getOrderByOrderId(query);
        if (!order) order = getOrderByPhone(query);
        return order || Promise.reject(new Error('Not found'));
    },
    async getReviews(productId) {
        const qs = productId ? '?productId=' + productId : '';
        const data = await apiFetch('/reviews' + qs);
        if (data) return data;
        return getReviews(productId);
    },
    async addReview(data) {
        const res = await fetch(API_BASE + '/reviews', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
        return addReview(data);
    },
    async deleteReview(id) {
        const data = await apiFetch('/reviews/' + id, { method: 'DELETE' });
        if (data) return data;
        let reviews = getReviews();
        reviews = reviews.filter(r => r._id !== id);
        saveReviews(reviews);
        return { message: 'Deleted' };
    },
    async getChats() {
        const data = await apiFetch('/chats');
        if (data) return data;
        return getChats();
    },
    async createChat(orderId, customerName, customerPhone) {
        const data = await apiFetch('/chats', {
            method: 'POST', body: JSON.stringify({ orderId, customerName, customerPhone })
        });
        if (data) return data;
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
        const data = await apiFetch('/chats/' + chatId + '/messages');
        if (data) return data;
        const chat = getChats().find(c => c._id === chatId);
        return chat ? chat.messages : [];
    },
    async sendMessage(chatId, text, from = 'customer') {
        const data = await apiFetch('/chats/' + chatId + '/messages', {
            method: 'POST', body: JSON.stringify({ from, text })
        });
        if (data) return data;
        return addChatMessage(chatId, from, text);
    },
    async markChatRead(chatId, role = 'admin') {
        await apiFetch('/chats/' + chatId + '/read', {
            method: 'POST', body: JSON.stringify({ role })
        });
        const chats = getChats();
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
            if (!chat.unread) chat.unread = { customer: false, admin: false };
            if (role === 'admin') chat.unread.admin = false;
            else chat.unread.customer = false;
            saveChats(chats);
        }
    }
};
