const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLoader();
    initNavbar();
    initFaq();
    initFeaturedProducts();
    initRevealAnimations();
    initCounters();
    if (!isMobile) {
        initCursorGlow();
        initHeroParticles();
        init3DTilt();
        initMagneticButtons();
    }
    loadHomeReviews();
});

function initLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 600);
    });
    setTimeout(() => {
        if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
        }
    }, 3000);
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    if (navbar) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

function initFeaturedProducts() {
    if (document.getElementById('featured-products')) {
        loadFeaturedProducts();
    }
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .product-card, .feature-card');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.product-card, .feature-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.08) + 's';
        observer.observe(card);
    });

    revealElements.forEach(el => {
        if (!el.classList.contains('product-card') && !el.classList.contains('feature-card')) {
            observer.observe(el);
        }
    });
}

function initCounters() {
    const counters = document.querySelectorAll('.stats-counter');
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
    let current = 0;
    const duration = 1500;
    const start = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(eased * target);
        el.textContent = target > 100 ? current.toLocaleString() : current;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target > 100 ? target.toLocaleString() : target;
        }
    };
    requestAnimationFrame(step);
}

function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let timeout;
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '1';
        clearTimeout(timeout);
        timeout = setTimeout(() => { glow.style.opacity = '0'; }, 2000);
    });

    function animateGlow() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

function initHeroParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (8 + Math.random() * 12) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = (0.2 + Math.random() * 0.4);
        container.appendChild(particle);
    }
}

function init3DTilt() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    });
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline, .btn-whatsapp');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });
}

function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    const products = getProducts();
    const featured = products.filter(p => p.featured).slice(0, 4);
    renderProducts(container, featured.length > 0 ? featured : products.slice(0, 4));
}

function renderProducts(container, products) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No products available</p></div>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card" onclick="window.location='product.html?id=${p._id}'">
            <div class="product-card-image-wrap">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                ${p.freeGift ? `<span class="product-free-gift"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> ${p.freeGift}</span>` : ''}
                <img src="${p.images && p.images[0] ? p.images[0] : imgPath('images/placeholder.svg')}"
                     alt="${p.name}" class="product-image" loading="lazy">
                <div class="product-card-actions">
                    <button onclick="event.stopPropagation();Cart.addItem(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                            class="btn-primary">Add to Cart</button>
                    <button onclick="event.stopPropagation();buyNowProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                            class="btn-outline">Buy Now</button>
                </div>
            </div>
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
            </div>
        </div>
    `).join('');
}

function buyNowProduct(product) {
    Cart.addItem(product, 1);
    window.location.href = 'checkout.html';
}

function loadHomeReviews() {
    const container = document.getElementById('home-reviews');
    if (!container) return;
    const reviews = getReviews().filter(r => r.status === 'Approved').reverse().slice(0, 6);
    if (reviews.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--gray);grid-column:1/-1;">
                <p>No reviews yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    const products = getProducts();
    container.innerHTML = reviews.map(r => {
        const product = products.find(p => p._id === r.productId);
        return `
            <div class="review-card reveal-scale">
                <div class="review-card-header">
                    <div class="review-card-author">
                        <div class="review-card-avatar">${r.customerName.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="review-card-name">${r.customerName}</div>
                            <div class="review-card-product">${product ? product.name : ''}</div>
                        </div>
                    </div>
                    <div class="review-card-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                </div>
                <div class="review-card-comment">${r.comment}</div>
            </div>
        `;
    }).join('');
}
