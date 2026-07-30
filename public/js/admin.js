document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-products')) loadAdminProducts();
    if (document.getElementById('admin-orders')) loadAdminOrders();
    if (document.getElementById('add-product-form')) setupAddProduct();
    if (document.getElementById('edit-product-form')) setupEditProduct();
    if (document.getElementById('dashboard-stats')) loadDashboard();
    if (document.getElementById('admin-reviews')) loadAdminReviews();
});

function loadDashboard() {
    const products = getProducts();
    const orders = getOrders();
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-revenue').textContent = `PKR ${totalRevenue.toLocaleString()}`;
    document.getElementById('pending-orders').textContent = pendingOrders;
}

function loadAdminProducts() {
    const tbody = document.getElementById('admin-products');
    const products = getProducts();
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray);padding:40px;">No products yet</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>
                <img src="${p.images && p.images[0] ? p.images[0] : imgPath('images/placeholder.svg')}"
                     style="width:48px;height:48px;object-fit:contain;border-radius:8px;background:rgba(0,0,0,0.03);">
            </td>
            <td style="font-weight:600;">${p.name}</td>
            <td>PKR ${(p.price || 0).toLocaleString()}</td>
            <td>${p.stock || 0}</td>
            <td>
                <span style="color:${p.stock > 0 ? '#22c55e' : '#ef4444'};font-weight:600;">
                    ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:8px;">
                    <a href="edit-product.html?id=${p._id}"
                       style="padding:6px 14px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.08);
                              border-radius:8px;color:white;text-decoration:none;font-size:12px;">Edit</a>
                    <button onclick="deleteProduct('${p._id}')"
                            style="padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
                                   border-radius:8px;color:#ef4444;cursor:pointer;font-size:12px;">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    API.deleteProduct(id).then(() => loadAdminProducts());
}

function setupAddProduct() {
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        const formData = new FormData(form);
        const colorsStr = formData.get('colors');
        const sizesStr = formData.get('sizes');
        if (colorsStr) {
            const colors = colorsStr.split(',').map(c => {
                const parts = c.trim().split('|');
                return { name: parts[0].trim(), hex: parts[1] ? parts[1].trim() : '#666' };
            });
            formData.set('colors', JSON.stringify(colors));
        } else {
            formData.delete('colors');
        }
        if (sizesStr) {
            formData.set('sizes', JSON.stringify(sizesStr.split(',').map(s => s.trim())));
        } else {
            formData.delete('sizes');
        }
        API.createProduct(formData).then(() => {
            window.location.href = 'products.html';
        }).catch(() => {
            alert('Error creating product');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Product';
        });
    });
}

function setupEditProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('edit-product-form').innerHTML = '<p style="color:var(--gray);">No product selected</p>';
        return;
    }
    const p = getProduct(id);
    if (!p) {
        document.getElementById('edit-product-form').innerHTML = '<p style="color:var(--gray);">Product not found</p>';
        return;
    }
    const form = document.getElementById('edit-product-form');
    form.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:700px;">
            <div style="grid-column:1/-1;">
                <label class="form-label">Product Name</label>
                <input type="text" name="name" value="${p.name}" class="form-input" required>
            </div>
            <div style="grid-column:1/-1;">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-input" rows="4" required>${p.description || ''}</textarea>
            </div>
            <div>
                <label class="form-label">Price (PKR)</label>
                <input type="number" name="price" value="${p.price}" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Stock</label>
                <input type="number" name="stock" value="${p.stock || 0}" class="form-input" required>
            </div>
            <div>
                <label class="form-label">Rating (0-5)</label>
                <input type="number" name="rating" value="${p.rating || 4.5}" step="0.1" min="0" max="5" class="form-input">
            </div>
            <div>
                <label class="form-label">Category</label>
                <input type="text" name="category" value="${p.category || 'Smart Watch'}" class="form-input">
            </div>
            <div>
                <label class="form-label">Badge (e.g. HOT, BEST SELLER)</label>
                <input type="text" name="badge" value="${p.badge || ''}" class="form-input">
            </div>
            <div>
                <label class="form-label">Free Gift Text</label>
                <input type="text" name="freeGift" value="${p.freeGift || ''}" class="form-input">
            </div>
            <div>
                <label class="form-label">Colors (Name|Hex, comma separated)</label>
                <input type="text" name="colors" value="${(p.colors || []).map(c => `${c.name}|${c.hex}`).join(', ')}" class="form-input" placeholder="Midnight|#1a1a2e, Starlight|#f5f0e8">
            </div>
            <div>
                <label class="form-label">Sizes (comma separated)</label>
                <input type="text" name="sizes" value="${(p.sizes || []).join(', ')}" class="form-input" placeholder="41mm, 45mm">
            </div>
            <div style="grid-column:1/-1;">
                <label class="form-label">Current Images</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                    ${(p.images || []).map(img => `
                        <img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;background:var(--light-gray);">
                    `).join('')}
                </div>
                <label class="form-label">Replace Images (optional)</label>
                <input type="file" name="images" accept="image/*" multiple class="form-input" style="padding:12px;">
                <p style="color:var(--gray);font-size:12px;margin-top:4px;">Select new images to replace current ones</p>
            </div>
            <div style="grid-column:1/-1;">
                <label class="form-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" name="featured" value="true" ${p.featured ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary);">
                    Featured Product
                </label>
            </div>
            <div style="grid-column:1/-1;display:flex;gap:12px;margin-top:12px;">
                <button type="submit" class="btn-primary">Update Product</button>
                <a href="products.html" class="btn-outline" style="text-decoration:none;">Cancel</a>
            </div>
        </div>
    `;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        const data = new FormData(form);
        const colorsStr = data.get('colors');
        const sizesStr = data.get('sizes');
        const imagesFile = data.get('images');
        if (imagesFile && imagesFile.size === 0) data.delete('images');
        if (colorsStr) {
            const colors = colorsStr.split(',').map(c => {
                const parts = c.trim().split('|');
                return { name: parts[0].trim(), hex: parts[1] ? parts[1].trim() : '#666' };
            });
            data.set('colors', JSON.stringify(colors));
        } else {
            data.set('colors', '[]');
        }
        if (sizesStr) {
            data.set('sizes', JSON.stringify(sizesStr.split(',').map(s => s.trim())));
        } else {
            data.set('sizes', '[]');
        }
        API.updateProduct(id, data).then(() => {
            window.location.href = 'products.html';
        }).catch(() => {
            alert('Error updating product');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Product';
        });
    });
}

function loadAdminOrders() {
    const tbody = document.getElementById('admin-orders');
    const searchInput = document.getElementById('order-search');
    function renderOrders(query) {
        const orders = query ? getOrders().filter(o => {
            const q = query.toLowerCase();
            return o.orderId.toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.phone || '').includes(q) ||
                (o.city || '').toLowerCase().includes(q);
        }) : getOrders();
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--gray);padding:40px;">No orders found</td></tr>';
            return;
        }
        const paymentOptions = ['Cash on Delivery', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Card Payment', 'Paid'];
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td style="font-weight:700;color:var(--primary);">${o.orderId}</td>
                <td>${o.customerName}<br><span style="font-size:12px;color:var(--gray);">${o.phone}</span></td>
                <td>${o.city}</td>
                <td>
                    ${(o.products || []).map(p => `${p.name} × ${p.quantity}`).join('<br>')}
                </td>
                <td style="font-weight:700;">PKR ${(o.totalAmount || 0).toLocaleString()}</td>
                <td>
                    <select class="admin-select" onchange="updateOrderPayment('${o._id}', this.value)">
                        ${paymentOptions.map(s =>
                            `<option value="${s}" ${o.paymentMethod === s ? 'selected' : ''}>${s}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>
                    <select class="admin-select" onchange="updateOrderStatus('${o._id}', this.value)">
                        ${['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Open to Allow Parcel', 'Delivered', 'Cancelled'].map(s =>
                            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button onclick="showTrackingModal('${o._id}')"
                                style="padding:6px 10px;background:rgba(200,164,92,0.15);border:1px solid rgba(200,164,92,0.3);
                                       border-radius:8px;color:var(--primary);cursor:pointer;font-size:11px;">📍 Track</button>
                        <a href="https://wa.me/${o.phone.replace(/^0/, '92')}?text=${encodeURIComponent('Assalam-o-Alaikum ' + o.customerName + ', your order ' + o.orderId + ' is ' + o.status + '. Total: PKR ' + (o.totalAmount || 0).toLocaleString())}"
                           target="_blank"
                           style="padding:6px 10px;background:rgba(37,211,102,0.15);border:1px solid rgba(37,211,102,0.3);
                                  border-radius:8px;color:#25D366;cursor:pointer;font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">💬 WhatsApp</a>
                        <button onclick="deleteOrder('${o._id}')"
                                style="padding:6px 10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
                                       border-radius:8px;color:#ef4444;cursor:pointer;font-size:11px;">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    if (searchInput) {
        searchInput.addEventListener('input', () => renderOrders(searchInput.value));
    }
    renderOrders('');
}

function updateOrderPayment(id, method) {
    API.updateOrderPayment(id, method).then(() => {});
}

let currentTrackingOrderId = null;

function showTrackingModal(orderId) {
    currentTrackingOrderId = orderId;
    const order = getOrders().find(o => o._id === orderId);
    if (!order) return;
    const updates = order.trackingUpdates || [];
        const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Open to Allow Parcel', 'Delivered'];
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:var(--radius-xl);padding:32px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-size:1.2rem;font-weight:700;">📍 Tracking - ${order.orderId}</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--gray);">&times;</button>
            </div>
            <div style="margin-bottom:24px;">
                <h4 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--gray);margin-bottom:12px;">Add Tracking Update</h4>
                <select id="track-status" class="admin-select" style="width:100%;margin-bottom:8px;">
                    ${statusOptions.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                <input type="text" id="track-note" class="form-input" placeholder="e.g. Parcel arrived at Karachi hub" style="margin-bottom:8px;">
                <button onclick="addTrackingUpdate()" class="btn-primary" style="width:100%;justify-content:center;padding:12px;">Add Update</button>
            </div>
            <div>
                <h4 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--gray);margin-bottom:12px;">Tracking History</h4>
                ${updates.length === 0 ? '<p style="color:var(--gray);text-align:center;padding:20px;">No tracking updates yet</p>' : ''}
                <div style="position:relative;">
                    ${updates.map((u, i) => `
                        <div style="display:flex;gap:16px;padding-left:24px;position:relative;padding-bottom:${i < updates.length - 1 ? '24px' : '0'};">
                            <div style="position:absolute;left:0;top:4px;width:12px;height:12px;border-radius:50%;background:var(--primary);border:3px solid var(--cream);z-index:1;"></div>
                            ${i < updates.length - 1 ? '<div style="position:absolute;left:5px;top:16px;width:2px;bottom:0;background:var(--border);"></div>' : ''}
                            <div style="flex:1;">
                                <p style="font-weight:600;font-size:14px;">${u.status}</p>
                                ${u.note ? `<p style="color:#555;font-size:13px;margin:2px 0;">${u.note}</p>` : ''}
                                <p style="font-size:11px;color:var(--gray);">${new Date(u.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function addTrackingUpdate() {
    const statusEl = document.getElementById('track-status');
    const noteEl = document.getElementById('track-note');
    if (!statusEl || !currentTrackingOrderId) return;
    const status = statusEl.value;
    const note = noteEl.value;
    API.addTrackingUpdate(currentTrackingOrderId, { status, note }).then(() => {
        document.body.removeChild(document.querySelector('div[style*="position:fixed"][style*="z-index:99999"]'));
        loadAdminOrders();
        showTrackingModal(currentTrackingOrderId);
    });
}

function updateOrderStatus(id, status) {
    API.updateOrderStatus(id, status).then(() => {
        API.addTrackingUpdate(id, { status, note: 'Status updated by admin' });
        loadAdminOrders();
    });
}

function deleteOrder(id) {
    if (!confirm('Delete this order?')) return;
    API.deleteOrder(id).then(() => loadAdminOrders());
}

function loadAdminReviews() {
    const tbody = document.getElementById('admin-reviews');
    const reviews = getReviews();
    const products = getProducts();
    if (reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray);padding:40px;">No reviews yet</td></tr>';
        return;
    }
    tbody.innerHTML = reviews.slice().reverse().map(r => {
        const product = products.find(p => p._id === r.productId);
        return `
            <tr>
                <td style="font-weight:600;">${product ? product.name : 'Unknown Product'}</td>
                <td>${r.customerName}</td>
                <td style="color:var(--primary);letter-spacing:2px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
                <td style="max-width:300px;">${r.comment}</td>
                <td style="font-size:12px;color:var(--gray);">${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>
                    <button onclick="adminDeleteReview('${r._id}')"
                            style="padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
                                   border-radius:8px;color:#ef4444;cursor:pointer;font-size:12px;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function adminDeleteReview(id) {
    if (!confirm('Delete this review?')) return;
    API.deleteReview(id).then(() => loadAdminReviews());
}
