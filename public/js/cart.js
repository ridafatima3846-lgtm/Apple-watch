const Cart = {
    getItems() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    },
    saveItems(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateBadge();
    },
    addItem(product, quantity = 1, color = '', size = '') {
        const items = this.getItems();
        const existingIndex = items.findIndex(item =>
            item._id === product._id && item.color === color && item.size === size
        );
        if (existingIndex > -1) {
            items[existingIndex].quantity += quantity;
        } else {
            items.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.images && product.images.length > 0 ? product.images[0] : '',
                quantity,
                color,
                size
            });
        }
        this.saveItems(items);
        this.showNotification(`${product.name} added to cart`);
    },
    removeItem(index) {
        const items = this.getItems();
        items.splice(index, 1);
        this.saveItems(items);
        if (window.location.pathname.includes('cart')) {
            this.renderCart();
        }
    },
    updateQuantity(index, quantity) {
        const items = this.getItems();
        if (quantity < 1) {
            items.splice(index, 1);
        } else {
            items[index].quantity = quantity;
        }
        this.saveItems(items);
        if (window.location.pathname.includes('cart')) {
            this.renderCart();
        }
    },
    getTotal() {
        return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    getCount() {
        return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
    },
    clear() {
        localStorage.removeItem('cart');
        this.updateBadge();
    },
    updateBadge() {
        const badges = document.querySelectorAll('.cart-count');
        const count = this.getCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    },
    showNotification(message) {
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'cart-notification';
        div.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: white; color: var(--black); padding: 16px 28px;
            border-radius: 12px; font-weight: 600; font-size: 14px;
            z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            animation: slideUp 0.3s ease; border: 1px solid #e5e5ea;
        `;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transform = 'translateX(-50%) translateY(20px)';
            div.style.transition = 'all 0.3s';
            setTimeout(() => div.remove(), 300);
        }, 2000);
    },
    renderCart() {
        const container = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        if (!container) return;
        const items = this.getItems();
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px;">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="btn-primary" style="margin-top:20px;text-decoration:none;">Shop Now</a>
                </div>
            `;
            if (totalEl) totalEl.textContent = 'PKR 0';
            return;
        }
        container.innerHTML = items.map((item, index) => `
            <div style="display:flex;align-items:center;gap:20px;padding:20px;margin-bottom:16px;background:white;border-radius:16px;border:1px solid #e5e5ea;">
                <img src="${item.image || imgPath('images/placeholder.svg')}" alt="${item.name}"
                     style="width:80px;height:80px;object-fit:contain;border-radius:12px;background:var(--light-gray);">
                <div style="flex:1;">
                    <h3 style="font-weight:600;margin-bottom:4px;">${item.name}</h3>
                    <p style="color:var(--primary);font-weight:700;">PKR ${item.price.toLocaleString()}</p>
                    ${item.color ? `<p style="font-size:12px;color:var(--gray);">Color: ${item.color}</p>` : ''}
                    ${item.size ? `<p style="font-size:12px;color:var(--gray);">Size: ${item.size}</p>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <button onclick="Cart.updateQuantity(${index}, ${item.quantity - 1})"
                            style="background:var(--light-gray);border:1px solid #e5e5ea;color:var(--black);width:32px;height:32px;border-radius:8px;cursor:pointer;font-weight:700;">−</button>
                    <span style="font-weight:600;min-width:24px;text-align:center;">${item.quantity}</span>
                    <button onclick="Cart.updateQuantity(${index}, ${item.quantity + 1})"
                            style="background:var(--light-gray);border:1px solid #e5e5ea;color:var(--black);width:32px;height:32px;border-radius:8px;cursor:pointer;font-weight:700;">+</button>
                </div>
                <div style="text-align:right;min-width:100px;">
                    <p style="font-weight:700;color:var(--primary);">PKR ${(item.price * item.quantity).toLocaleString()}</p>
                    <button onclick="Cart.removeItem(${index})" style="margin-top:8px;padding:6px 14px;font-size:12px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Remove</button>
                </div>
            </div>
        `).join('');
        const total = this.getTotal();
        if (totalEl) totalEl.textContent = `PKR ${total.toLocaleString()}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
    if (document.getElementById('cart-items')) {
        Cart.renderCart();
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);
