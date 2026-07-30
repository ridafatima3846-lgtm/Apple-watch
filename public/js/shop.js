document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('shop-products')) {
        loadShopProducts();
    }
    if (document.getElementById('product-detail')) {
        loadProductDetail();
        loadProductReviews();
    }
    if (document.getElementById('checkout-form')) {
        setupCheckout();
    }
});

function loadShopProducts() {
    const container = document.getElementById('shop-products');
    const products = getProducts();
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No products available yet</p></div>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card" onclick="window.location='product.html?id=${p._id}'">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            ${p.freeGift ? `<span class="product-free-gift"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> ${p.freeGift}</span>` : ''}
            <img src="${p.images && p.images[0] ? p.images[0] : imgPath('images/placeholder.svg')}"
                 alt="${p.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(p.rating || 4))}${'☆'.repeat(5 - Math.floor(p.rating || 4))}
                    <span style="color:var(--gray);font-size:12px;margin-left:4px;">(${p.rating || 4})</span>
                </div>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-price-row">
                    <span class="product-price">PKR ${(p.price || 0).toLocaleString()}</span>
                    <span class="product-original-price">PKR 8,999</span>
                </div>
                ${p.freeGift ? `<p class="product-free-text"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> ${p.freeGift}</p>` : ''}
                <p style="color:var(--gray);font-size:13px;margin:8px 0;">
                    ${p.stock > 0 ? '<span style="color:#22c55e;">In Stock</span>' : '<span style="color:#ef4444;">Out of Stock</span>'}
                </p>
                <div style="display:flex;gap:8px;">
                    <button onclick="event.stopPropagation();Cart.addItem(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                            class="btn-primary" style="flex:1;justify-content:center;padding:12px;font-size:12px;">Add to Cart</button>
                    <button onclick="event.stopPropagation();buyNow(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                            class="btn-outline" style="flex:1;justify-content:center;padding:12px;font-size:12px;">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function buyNow(product) {
    Cart.addItem(product, 1);
    window.location.href = 'checkout.html';
}

function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('product-detail').innerHTML = '<div class="empty-state"><p>No product selected</p></div>';
        return;
    }
    const p = getProduct(id);
    if (!p) {
        document.getElementById('product-detail').innerHTML = '<div class="empty-state"><p>Product not found</p></div>';
        return;
    }
    const container = document.getElementById('product-detail');
    let selectedColor = p.colors && p.colors.length > 0 ? p.colors[0].name : '';
    let selectedSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : '';
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;max-width:1200px;margin:0 auto;padding:0 20px;">
            <div>
                ${p.badge ? `<span class="product-badge" style="position:static;display:inline-block;margin-bottom:12px;">${p.badge}</span>` : ''}
                <img src="${p.images && p.images[0] ? p.images[0] : imgPath('images/placeholder.svg')}"
                     alt="${p.name}" style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:24px;
                     background:var(--light-gray);">
                ${p.images && p.images.length > 1 ? `
                <div style="display:flex;gap:12px;margin-top:16px;">
                    ${p.images.map(img => `
                        <img src="${img}" style="width:80px;height:80px;object-fit:contain;border-radius:12px;
                             border:1px solid #e5e5ea;cursor:pointer;
                             background:var(--light-gray);" onclick="this.parentElement.parentElement.previousElementSibling.src=this.src">
                    `).join('')}
                </div>` : ''}
            </div>
            <div>
                <h1 style="font-size:2rem;font-weight:800;letter-spacing:-1px;margin-bottom:12px;">${p.name}</h1>
                <div class="product-rating" style="margin-bottom:16px;">
                    ${'★'.repeat(Math.floor(p.rating || 4))}${'☆'.repeat(5 - Math.floor(p.rating || 4))}
                    <span style="color:var(--gray);margin-left:8px;">${p.rating || 4} / 5</span>
                </div>
                <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px;">
                    <span class="price-tag">PKR ${(p.price || 0).toLocaleString()}</span>
                    <small style="color:var(--gray);font-size:1.2rem;text-decoration:line-through;">PKR 8,999</small>
                    <span style="background:var(--primary);color:white;padding:2px 10px;border-radius:50px;font-size:12px;font-weight:800;">39% OFF</span>
                </div>
                ${p.freeGift ? `<div class="gift-badge-big" style="margin-bottom:16px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> ${p.freeGift}</div>` : ''}
                <p style="color:var(--gray);line-height:1.7;margin-bottom:24px;">${p.description || ''}</p>
                <p style="margin-bottom:16px;display:flex;align-items:center;gap:8px;">
                    ${p.stock > 0
                        ? '<span style="color:#22c55e;font-weight:600;display:flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> In Stock</span>'
                        : '<span style="color:#ef4444;font-weight:600;display:flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Out of Stock</span>'}
                    <span style="color:var(--gray);margin-left:4px;">${p.stock || 0} units available</span>
                </p>
                ${p.colors && p.colors.length > 0 ? `
                <div style="margin-bottom:20px;">
                    <label class="form-label">Color</label>
                    <div style="display:flex;gap:12px;" id="color-options">
                        ${p.colors.map((c, i) => `
                            <button onclick="window.selectColor('${c.name}', this)"
                                    style="width:36px;height:36px;border-radius:50%;border:2px solid ${i === 0 ? 'var(--primary)' : '#e5e5ea'};
                                           background:${c.hex || '#666'};cursor:pointer;
                                           ${i === 0 ? 'box-shadow:0 0 0 3px rgba(255,59,48,0.3);' : ''}"
                                    title="${c.name}"></button>
                        `).join('')}
                    </div>
                </div>` : ''}
                ${p.sizes && p.sizes.length > 0 ? `
                <div style="margin-bottom:24px;">
                    <label class="form-label">Size</label>
                    <div style="display:flex;gap:8px;" id="size-options">
                        ${p.sizes.map((s, i) => `
                            <button onclick="window.selectSize('${s}', this)"
                                    style="padding:8px 16px;border-radius:10px;border:1px solid ${i === 0 ? 'var(--primary)' : '#e5e5ea'};
                                           background:${i === 0 ? 'rgba(255,59,48,0.05)' : 'transparent'};
                                           cursor:pointer;font-size:13px;color:var(--black);">${s}</button>
                        `).join('')}
                    </div>
                </div>` : ''}
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button onclick="Cart.addItem(${JSON.stringify(p).replace(/"/g, '&quot;')}, 1, '${selectedColor}', '${selectedSize}')"
                            class="btn-primary" style="flex:1;justify-content:center;min-width:180px;">Add to Cart</button>
                    <button onclick="buyNowDetail()"
                            class="btn-outline" style="flex:1;justify-content:center;min-width:160px;">Buy Now</button>
                    <a href="https://wa.me/923001234567" target="_blank" class="btn-whatsapp" style="flex:1;justify-content:center;text-decoration:none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                        </svg>
                        WhatsApp Order</a>
                </div>
            </div>
        </div>
    `;
    window.selectColor = (name, btn) => {
        selectedColor = name;
        document.querySelectorAll('#color-options button').forEach(b => {
            b.style.borderColor = '#e5e5ea';
            b.style.boxShadow = 'none';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 0 0 3px rgba(255,59,48,0.3)';
    };
    window.selectSize = (size, btn) => {
        selectedSize = size;
        document.querySelectorAll('#size-options button').forEach(b => {
            b.style.borderColor = '#e5e5ea';
            b.style.background = 'transparent';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'rgba(255,59,48,0.05)';
    };
    window.buyNowDetail = () => {
        Cart.addItem(p, 1, selectedColor, selectedSize);
        window.location.href = 'checkout.html';
    };
}

function loadProductReviews() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;
    API.getReviews(productId).then(reviews => {
        const container = document.getElementById('reviews-container');
        const section = document.getElementById('reviews-section');
        if (!container) return;
        const approved = reviews.filter(r => r.status === 'Approved');
        if (approved.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 24px;color:var(--gray);">
                    <p style="margin-bottom:8px;">No reviews yet</p>
                    <p style="font-size:14px;">Be the first to review this product!</p>
                </div>
            `;
        } else {
            container.innerHTML = approved.map(r => `
                <div style="background:white;border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${r.customerName.charAt(0).toUpperCase()}</div>
                            <div>
                                <p style="font-weight:600;font-size:14px;">${r.customerName}</p>
                                <p style="font-size:11px;color:var(--gray);">${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div style="color:var(--primary);font-size:14px;letter-spacing:2px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <p style="color:#555;line-height:1.7;font-size:14px;">${r.comment}</p>
                </div>
            `).join('');
        }
        container.innerHTML += `
            <div style="margin-top:40px;padding:32px;background:white;border:1px solid var(--border);border-radius:var(--radius-xl);">
                <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:20px;text-align:center;">Write a Review</h3>
                <form id="review-form" style="max-width:500px;margin:0 auto;">
                    <div style="margin-bottom:16px;">
                        <label class="form-label">Your Name</label>
                        <input type="text" id="review-name" class="form-input" required placeholder="Enter your name">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label class="form-label">Rating</label>
                        <div id="star-rating" style="display:flex;gap:4px;font-size:28px;cursor:pointer;">
                            ${[1,2,3,4,5].map(i => `<span data-star="${i}" style="color:#ddd;transition:color 0.2s;">★</span>`).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label class="form-label">Your Review</label>
                        <textarea id="review-comment" class="form-input" rows="3" required placeholder="Share your experience..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">Submit Review</button>
                </form>
            </div>
        `;
        let selectedRating = 0;
        const stars = container.querySelectorAll('#star-rating span');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.star);
                stars.forEach((s, i) => { s.style.color = i < val ? 'var(--primary)' : '#ddd'; });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => { s.style.color = i < selectedRating ? 'var(--primary)' : '#ddd'; });
            });
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.star);
                stars.forEach((s, i) => { s.style.color = i < selectedRating ? 'var(--primary)' : '#ddd'; });
            });
        });
        document.getElementById('review-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (selectedRating === 0) { alert('Please select a rating'); return; }
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Submitting...';
            API.addReview({
                productId: productId,
                customerName: document.getElementById('review-name').value,
                rating: selectedRating,
                comment: document.getElementById('review-comment').value
            }).then(() => {
                alert('Thank you for your review!');
                this.reset();
                selectedRating = 0;
                stars.forEach(s => { s.style.color = '#ddd'; });
                loadProductReviews();
            }).catch(() => {
                alert('Error submitting review');
                btn.disabled = false;
                btn.textContent = 'Submit Review';
            });
        });
        section.style.display = 'block';
    });
}

function setupCheckout() {
    const form = document.getElementById('checkout-form');
    const summaryContainer = document.getElementById('order-summary');
    const items = Cart.getItems();
    if (items.length === 0) {
        summaryContainer.innerHTML = '<div class="empty-state"><p>Your cart is empty. <a href="shop.html" style="color:var(--primary);">Shop now</a></p></div>';
        return;
    }
    summaryContainer.innerHTML = items.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #e5e5ea;">
            <div style="display:flex;align-items:center;gap:12px;">
                <img src="${item.image || imgPath('images/placeholder.svg')}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;background:var(--light-gray);">
                <div>
                    <p style="font-weight:600;font-size:14px;">${item.name}</p>
                    <p style="color:var(--gray);font-size:12px;">Qty: ${item.quantity} ${item.color ? '| ' + item.color : ''} ${item.size ? '| ' + item.size : ''}</p>
                </div>
            </div>
            <p style="font-weight:700;color:var(--primary);">PKR ${(item.price * item.quantity).toLocaleString()}</p>
        </div>
    `).join('');
    const total = Cart.getTotal();
    summaryContainer.innerHTML += `
        <div style="display:flex;justify-content:space-between;padding:16px 0;margin-top:8px;">
            <p style="font-weight:700;font-size:1.1rem;">Total</p>
            <p style="font-weight:900;font-size:1.3rem;color:var(--primary);">PKR ${total.toLocaleString()}</p>
        </div>
    `;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        const fd = new FormData(form);
        const orderData = {
            customerName: fd.get('name'),
            phone: fd.get('phone'),
            whatsapp: fd.get('whatsapp'),
            address: fd.get('address'),
            city: fd.get('city'),
            postalCode: fd.get('postalCode'),
            notes: fd.get('notes') || '',
            products: items.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                color: item.color || '',
                size: item.size || ''
            })),
                    totalAmount: total,
            paymentMethod: 'Cash on Delivery'
        };
        API.createOrder(orderData).then(order => {
            API.addTrackingUpdate(order._id, { status: 'Pending', note: 'Order placed successfully' });
            Cart.clear();
            const config = API.getConfig();
            const message = formatWhatsAppMessage(order, items, total);
            const encoded = encodeURIComponent(message);
            const waUrl = `https://wa.me/${config.ownerNumber}?text=${encoded}`;
            document.getElementById('checkout-success').style.display = 'block';
            form.style.display = 'none';
            document.getElementById('order-id-display').textContent = order.orderId;
            document.getElementById('whatsapp-link').href = waUrl;
        }).catch(() => {
            alert('Error placing order. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        });
    });
}

function formatWhatsAppMessage(order, items, total) {
    const productsText = items.map(item =>
        `- ${item.name} × ${item.quantity} = PKR ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    return `
*New Watch Order*

*Order ID:* ${order.orderId}
*Customer:* ${order.customerName}
*Phone:* ${order.phone}
*WhatsApp:* ${order.whatsapp}
*Address:* ${order.address}
*City:* ${order.city}

*Products:*
${productsText}

*Total:* PKR ${total.toLocaleString()}
*Payment:* Cash on Delivery

*Free Gift:* Silver Chain Included

Please confirm my order.
    `.trim();
}
