// =====================
// STORAGE UTILITIES
// =====================
function getCart() {
    const cartData = localStorage.getItem('spinley_cart');
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cart) {
    localStorage.setItem('spinley_cart', JSON.stringify(cart));
}

function getFavorites() {
    const favoritesData = localStorage.getItem('spinley_favorites');
    return favoritesData ? JSON.parse(favoritesData) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('spinley_favorites', JSON.stringify(favorites));
}

// =====================
// CART MANAGEMENT
// =====================
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

function addToCart(id, name, price, quantity = 1, image = null) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ 
            id, 
            name, 
            price, 
            quantity, 
            color: 'Negro', 
            size: 'M',
            image: image || getProductImage(id)
        });
    }
    
    saveCart(cart);
    updateCartCount();
}

function getProductImage(id) {
    const images = {
        1: 'images/FOTO MAILLOT ROJO .png',
        2: 'images/FOTO MODELO MAILLOT VERDE .png',
        3: 'images/FOTO MODELO MAILLOT AZUL.png',
        4: 'images/CASCO 1.png',
        5: 'images/CASCO.png',
        6: 'images/CASCO 3.png',
        7: 'images/RELOJ SPINLEY.png',
        8: 'images/CALCETINES 1.png',
        9: 'images/ZAPATILLAS SPINLE.png',
        10: 'images/BOTELLIN SPINLEY (1).png',
        11: 'images/MAILLOT PRO MUJER .jpg',
        12: 'images/CALCETINES 2.png'
    };
    return images[id] || 'images/CASCO.png';
}

function addToCartQuick(id, name, price) {
    addToCart(id, name, price, 1);
    showNotification(`${name} añadido al carrito`);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateCartItem(id, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    
    updateCartCount();
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const cartLayout = document.querySelector('.cart-layout');
    const emptyCart = document.getElementById('cart-empty');
    const cart = getCart();

    if (!container) return;

    if (cart.length === 0) {
        container.style.display = 'none';
        if (cartLayout) cartLayout.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (cartLayout) cartLayout.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image || getProductImage(item.id)}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">Color: ${item.color} | Talla: ${item.size}</div>
                <div class="cart-item-qty">
                    <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 80 ? 0 : 5;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const amountForFreeEl = document.getElementById('amount-for-free');
    const freeShippingNotice = document.getElementById('free-shipping-notice');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + '€';
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : shipping.toFixed(2) + '€';
    if (totalEl) totalEl.textContent = total.toFixed(2) + '€';

    if (amountForFreeEl) {
        const amountForFree = Math.max(0, 80 - subtotal);
        amountForFreeEl.textContent = amountForFree.toFixed(2) + '€';
    }

    if (freeShippingNotice) {
        freeShippingNotice.style.display = subtotal >= 80 ? 'none' : 'block';
    }
}

// =====================
// FAVORITES MANAGEMENT
// =====================
function updateFavoritesCount() {
    const favorites = getFavorites();
    const favCount = favorites.length;
    
    // Update favorites icon if exists
    const favBtns = document.querySelectorAll('.icon-btn');
    favBtns.forEach(btn => {
        const svg = btn.querySelector('svg path[d*="M20.84"]');
        if (svg) {
            let countBadge = btn.querySelector('.fav-count');
            if (favCount > 0) {
                if (!countBadge) {
                    countBadge = document.createElement('span');
                    countBadge.className = 'fav-count';
                    countBadge.style.cssText = `
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background: #9eef6b;
                        color: #050505;
                        font-size: 10px;
                        font-weight: 700;
                        min-width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    btn.style.position = 'relative';
                    btn.appendChild(countBadge);
                }
                countBadge.textContent = favCount;
            } else if (countBadge) {
                countBadge.remove();
            }
        }
    });
}

function toggleFavorite(id, name, price, image) {
    let favorites = getFavorites();
    const existingIndex = favorites.findIndex(item => item.id === id);
    
    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        showNotification(`${name} eliminado de favoritos`);
    } else {
        favorites.push({ id, name, price, image: image || getProductImage(id) });
        showNotification(`${name} añadido a favoritos`);
    }
    
    saveFavorites(favorites);
    updateFavoritesCount();
    updateFavoriteButtons();
}

function isFavorite(id) {
    const favorites = getFavorites();
    return favorites.some(item => item.id === id);
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId);
        if (isFavorite(productId)) {
            btn.classList.add('active');
            btn.querySelector('svg').style.fill = '#9eef6b';
        } else {
            btn.classList.remove('active');
            btn.querySelector('svg').style.fill = 'none';
        }
    });
}

function initFavoriteButtons() {
    // Add favorite buttons to product cards
    document.querySelectorAll('.product-card-catalog').forEach(card => {
        const productId = parseInt(card.querySelector('.quick-add')?.getAttribute('onclick')?.match(/\d+/)?.[0] || 0);
        const productName = card.querySelector('.product-name-catalog')?.textContent || '';
        const productPrice = parseFloat(card.dataset.price) || 0;
        const productImage = card.querySelector('img')?.src || '';
        
        const imageContainer = card.querySelector('.product-image-catalog');
        if (imageContainer && !imageContainer.querySelector('.favorite-btn')) {
            const favBtn = document.createElement('button');
            favBtn.className = 'favorite-btn';
            favBtn.dataset.productId = productId;
            favBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            `;
            favBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(5, 5, 5, 0.8);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
                color: #9eef6b;
            `;
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(productId, productName, productPrice, productImage);
            });
            imageContainer.appendChild(favBtn);
        }
    });
    
    updateFavoriteButtons();
}

// Show favorites modal when clicking favorites icon
function initFavoritesModal() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        const svg = btn.querySelector('svg path[d*="M20.84"]');
        if (svg) {
            btn.addEventListener('click', () => {
                showFavoritesModal();
            });
        }
    });
}

function showFavoritesModal() {
    const favorites = getFavorites();
    
    // Remove existing modal
    const existingModal = document.getElementById('favorites-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'favorites-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a0a;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        padding: 30px;
        border: 1px solid #1a1a1a;
    `;
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #fff; margin: 0;">Tus Favoritos</h2>
                <button id="close-favorites" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 24px;">&times;</button>
            </div>
            <div style="text-align: center; padding: 40px 0;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9eef6b" stroke-width="1">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <p style="color: #888; margin-top: 20px;">No tienes productos en favoritos</p>
                <a href="productos.html" style="color: #9eef6b; text-decoration: none; font-weight: 600;">Explorar productos</a>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #fff; margin: 0;">Tus Favoritos (${favorites.length})</h2>
                <button id="close-favorites" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 24px;">&times;</button>
            </div>
            <div class="favorites-list">
                ${favorites.map(item => `
                    <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #1a1a1a; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div style="flex: 1;">
                            <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 14px;">${item.name}</h4>
                            <p style="color: #9eef6b; font-weight: 600; margin: 0;">${item.price.toFixed(2)}€</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="addToCartFromFavorites(${item.id}, '${item.name}', ${item.price})" style="background: #9eef6b; color: #050505; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;">Añadir</button>
                            <button onclick="removeFavorite(${item.id})" style="background: none; border: 1px solid #333; color: #fff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal events
    document.getElementById('close-favorites').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function addToCartFromFavorites(id, name, price) {
    addToCart(id, name, price, 1);
    showNotification(`${name} añadido al carrito`);
}

function removeFavorite(id) {
    let favorites = getFavorites();
    const item = favorites.find(f => f.id === id);
    favorites = favorites.filter(f => f.id !== id);
    saveFavorites(favorites);
    updateFavoritesCount();
    updateFavoriteButtons();
    showFavoritesModal(); // Refresh modal
    if (item) {
        showNotification(`${item.name} eliminado de favoritos`);
    }
}

// =====================
// HEADER & NAVIGATION
// =====================
function initHeader() {
    const hamburger = document.getElementById('hamburger');
    const navMobile = document.getElementById('nav-mobile');
    const header = document.getElementById('header');

    if (hamburger && navMobile) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMobile.classList.toggle('active');
        });
    }

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link-mobile').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMobile) navMobile.classList.remove('active');
        });
    });
}

// =====================
// SEARCH FUNCTIONALITY
// =====================
function initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchIcons = document.querySelectorAll('.search-icon');
    const searchBtnMobile = document.querySelector('.search-btn-mobile');
    
    // Product data for search
    const allProducts = [
        { id: 1, name: 'MAILLOT BLEND 1.0', category: 'maillots', price: 79.99, url: 'producto.html?id=1' },
        { id: 2, name: 'MAILLOT AERO PRO', category: 'maillots', price: 89.99, url: 'producto.html?id=2' },
        { id: 3, name: 'MAILLOT TRAIL MOUNTAIN', category: 'maillots', price: 74.99, url: 'producto.html?id=3' },
        { id: 4, name: 'CASCO AERO ROAD', category: 'cascos', price: 149.99, url: 'producto.html?id=4' },
        { id: 5, name: 'CASCO PERFORMANCE', category: 'cascos', price: 129.99, url: 'producto.html?id=5' },
        { id: 6, name: 'CASCO MTB PRO', category: 'cascos', price: 139.99, url: 'producto.html?id=6' },
        { id: 7, name: 'RELOJ SPINLEY', category: 'accesorios', price: 294.99, url: 'producto.html?id=7' },
        { id: 8, name: 'CALCETINES PERFORMANCE', category: 'calcetines', price: 19.99, url: 'producto.html?id=8' },
        { id: 9, name: 'ZAPATILLAS CARBON ROAD', category: 'zapatillas', price: 199.99, url: 'producto.html?id=9' },
        { id: 10, name: 'BIDÓN ECO 750ML', category: 'accesorios', price: 14.99, url: 'producto.html?id=10' },
        { id: 11, name: 'MAILLOT MUJER PRO', category: 'maillots', price: 84.99, url: 'producto.html?id=11' },
        { id: 12, name: 'CALCETINES ECO', category: 'calcetines', price: 24.99, url: 'producto.html?id=12' }
    ];
    
    searchInputs.forEach(input => {
        // Create dropdown for suggestions
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(dropdown);
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            
            const results = allProducts.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            );
            
            if (results.length > 0) {
                dropdown.innerHTML = results.map(p => `
                    <a href="${p.url}" style="display: flex; justify-content: space-between; padding: 12px 15px; color: #fff; text-decoration: none; border-bottom: 1px solid #1a1a1a; transition: background 0.2s;">
                        <span style="font-size: 14px;">${p.name}</span>
                        <span style="color: #9eef6b; font-weight: 600;">${p.price.toFixed(2)}€</span>
                    </a>
                `).join('');
                dropdown.style.display = 'block';
                
                // Add hover effects
                dropdown.querySelectorAll('a').forEach(a => {
                    a.addEventListener('mouseenter', () => a.style.background = '#1a1a1a');
                    a.addEventListener('mouseleave', () => a.style.background = 'transparent');
                });
            } else {
                dropdown.innerHTML = `
                    <div style="padding: 15px; color: #888; text-align: center;">
                        No se encontraron productos
                    </div>
                `;
                dropdown.style.display = 'block';
            }
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    // Redirect to products page with search query
                    window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });
    
    // Handle search icon clicks
    searchIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling || icon.parentElement.querySelector('.search-input');
            if (input && input.value.trim()) {
                window.location.href = `productos.html?search=${encodeURIComponent(input.value.trim())}`;
            }
        });
    });
    
    // Mobile search button
    if (searchBtnMobile) {
        searchBtnMobile.addEventListener('click', () => {
            const headerSearch = document.querySelector('.header-search');
            if (headerSearch) {
                headerSearch.classList.toggle('mobile-active');
                if (headerSearch.classList.contains('mobile-active')) {
                    headerSearch.querySelector('.search-input')?.focus();
                }
            }
        });
    }
    
    // Filter products on productos.html based on URL params
    if (window.location.pathname.includes('productos')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        if (searchQuery) {
            filterProductsBySearch(searchQuery);
            // Update search input with query
            searchInputs.forEach(input => {
                input.value = searchQuery;
            });
        }
    }
}

function filterProductsBySearch(query) {
    const catalogGrid = document.getElementById('catalog-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!catalogGrid) return;
    
    const products = Array.from(document.querySelectorAll('.product-card-catalog'));
    let visibleCount = 0;
    
    products.forEach(product => {
        const name = product.querySelector('.product-name-catalog')?.textContent.toLowerCase() || '';
        const category = product.querySelector('.product-category-small')?.textContent.toLowerCase() || '';
        const dataCategory = product.dataset.category?.toLowerCase() || '';
        
        const matches = name.includes(query.toLowerCase()) || 
                       category.includes(query.toLowerCase()) ||
                       dataCategory.includes(query.toLowerCase());
        
        if (matches) {
            product.style.display = '';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    if (resultsCount) {
        resultsCount.textContent = `Mostrando ${visibleCount} productos para "${query}"`;
    }
}

// =====================
// CAROUSEL - FIXED
// =====================
function initCarousel() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!carousel || !prevBtn || !nextBtn) return;

    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    let currentIndex = 0;
    const totalItems = items.length;
    const visibleItems = getVisibleItems();
    
    function getVisibleItems() {
        const containerWidth = carousel.parentElement.offsetWidth - 100; // Account for buttons
        const itemWidth = window.innerWidth <= 768 ? 170 : 220; // item + gap
        return Math.floor(containerWidth / itemWidth);
    }

    function updateCarousel() {
        // Update active states
        items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentIndex) {
                item.classList.add('active');
            }
        });

        // Calculate scroll position
        const itemWidth = items[0].offsetWidth;
        const gap = 20;
        const scrollPosition = currentIndex * (itemWidth + gap);
        
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    });

    // Auto-play carousel
    let autoPlayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }, 4000);
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carousel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }, 4000);
    });
    
    // Handle window resize
    window.addEventListener('resize', updateCarousel);
    
    // Initialize
    updateCarousel();
}

// =====================
// PRODUCT FILTERS
// =====================
function initFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const genderFilter = document.getElementById('gender-filter');
    const sortFilter = document.getElementById('sort-filter');
    const catalogGrid = document.getElementById('catalog-grid');
    const resultsCount = document.getElementById('results-count');

    if (!catalogGrid) return;
    
    // Store original products
    const originalProducts = Array.from(document.querySelectorAll('.product-card-catalog'));

    function applyFilters() {
        const category = categoryFilter?.value || '';
        const gender = genderFilter?.value || '';
        const sort = sortFilter?.value || 'featured';
        
        let products = [...originalProducts];

        // Filter by category
        if (category) {
            products = products.filter(product => product.dataset.category === category);
        }
        
        // Filter by gender
        if (gender) {
            products = products.filter(product => product.dataset.gender === gender);
        }

        // Sort products
        if (sort === 'price-asc') {
            products.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        } else if (sort === 'price-desc') {
            products.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        } else if (sort === 'newest') {
            products.sort((a, b) => (b.dataset.new === 'true' ? 1 : 0) - (a.dataset.new === 'true' ? 1 : 0));
        }

        // Clear and re-add products
        catalogGrid.innerHTML = '';
        products.forEach(product => {
            const clone = product.cloneNode(true);
            catalogGrid.appendChild(clone);
        });
        
        // Re-initialize favorite buttons after DOM update
        initFavoriteButtons();

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${products.length} productos`;
        }
    }

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (genderFilter) genderFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

// =====================
// PRODUCT DATABASE
// =====================
const productsDatabase = {
    1: {
        id: 1,
        name: 'MAILLOT SPINLEY BLEND 1.0',
        category: 'LONG SLEEVE JERSEY',
        price: 79.99,
        stock: true,
        rating: 4.1,
        reviews: 45,
        description: 'Maillot de manga larga diseñado para ciclistas exigentes que buscan rendimiento y sostenibilidad. Fabricado con tejidos técnicos reciclados de alta calidad.',
        images: [
            'images/FOTO MAILLOT ROJO .png',
            'images/LATERLA MAILLOT ROJO.png',
            'images/TRASERA MAILLOT ROJO.png',
            'images/DETALLE MAILLOT ROJO.png'
        ],
        colors: ['#c4382e', '#9eef6b', '#2e5c8e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    2: {
        id: 2,
        name: 'MAILLOT AERO PRO',
        category: 'PERFORMANCE JERSEY',
        price: 89.99,
        stock: true,
        rating: 4.5,
        reviews: 67,
        description: 'Maillot aerodinámico de alto rendimiento para ciclistas competitivos. Diseño ajustado que reduce la resistencia al viento.',
        images: [
            'images/FOTO MODELO MAILLOT VERDE .png',
            'images/FOTO MODELO MAILLOT VERDE .png',
            'images/FOTO MODELO MAILLOT VERDE .png',
            'images/FOTO MODELO MAILLOT VERDE .png'
        ],
        colors: ['#9eef6b', '#c4382e', '#2e5c8e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    3: {
        id: 3,
        name: 'MAILLOT TRAIL MOUNTAIN',
        category: 'MTB JERSEY',
        price: 74.99,
        stock: true,
        rating: 4.3,
        reviews: 38,
        description: 'Maillot diseñado especialmente para mountain bike. Tejido resistente y transpirable ideal para rutas de montaña.',
        images: [
            'images/FOTO MODELO MAILLOT AZUL.png',
            'images/FOTO MODELO MAILLOT AZUL.png',
            'images/FOTO MODELO MAILLOT AZUL.png',
            'images/FOTO MODELO MAILLOT AZUL.png'
        ],
        colors: ['#2e5c8e', '#9eef6b', '#c4382e', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    4: {
        id: 4,
        name: 'CASCO AERO ROAD',
        category: 'CASCOS',
        price: 149.99,
        stock: true,
        rating: 4.7,
        reviews: 52,
        description: 'Casco aerodinámico para ciclismo de carretera. Diseño ventilado con máxima protección y comodidad.',
        images: [
            'images/CASCO 1.png',
            'images/CASCO 1.png',
            'images/CASCO 1.png',
            'images/CASCO 1.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#c4382e'],
        sizes: ['S', 'M', 'L']
    },
    5: {
        id: 5,
        name: 'CASCO PERFORMANCE',
        category: 'CASCOS',
        price: 129.99,
        stock: true,
        rating: 4.4,
        reviews: 41,
        description: 'Casco versátil con excelente ventilación y ajuste personalizable. Perfecto para entrenamientos y competiciones.',
        images: [
            'images/CASCO.png',
            'images/CASCO.png',
            'images/CASCO.png',
            'images/CASCO.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#9eef6b'],
        sizes: ['S', 'M', 'L']
    },
    6: {
        id: 6,
        name: 'CASCO MTB PRO',
        category: 'CASCOS',
        price: 139.99,
        stock: true,
        rating: 4.6,
        reviews: 29,
        description: 'Casco específico para mountain bike con protección extendida. Visera ajustable y sistema de ventilación optimizado.',
        images: [
            'images/CASCO 3.png',
            'images/CASCO 3.png',
            'images/CASCO 3.png',
            'images/CASCO 3.png'
        ],
        colors: ['#1a1a1a', '#c4382e', '#2e5c8e'],
        sizes: ['S', 'M', 'L']
    },
    7: {
        id: 7,
        name: 'RELOJ SPINLEY',
        category: 'ACCESORIOS',
        price: 294.99,
        stock: true,
        rating: 4.5,
        reviews: 32,
        description: 'Reloj deportivo inteligente diseñado para ciclistas. Monitoriza tu rendimiento, GPS integrado y resistente al agua.',
        images: [
            'images/RELOJ SPINLEY.png',
            'images/RELOJ SPINLEY.png',
            'images/RELOJ SPINLEY.png',
            'images/RELOJ SPINLEY.png'
        ],
        colors: ['#1a1a1a', '#9eef6b'],
        sizes: ['Único']
    },
    8: {
        id: 8,
        name: 'CALCETINES PERFORMANCE',
        category: 'CALCETINES',
        price: 19.99,
        stock: true,
        rating: 4.0,
        reviews: 33,
        description: 'Calcetines técnicos con compresión graduada. Tejido antibacteriano y costuras planas para evitar rozaduras.',
        images: [
            'images/CALCETINES 1.png',
            'images/CALCETINES 1.png',
            'images/CALCETINES 1.png',
            'images/CALCETINES 1.png'
        ],
        colors: ['#1a1a1a', '#ffffff', '#9eef6b'],
        sizes: ['S', 'M', 'L']
    },
    9: {
        id: 9,
        name: 'ZAPATILLAS CARBON ROAD',
        category: 'ZAPATILLAS',
        price: 199.99,
        stock: true,
        rating: 4.8,
        reviews: 74,
        description: 'Zapatillas de carretera con suela de carbono. Máxima transferencia de potencia y cierre BOA de precisión.',
        images: [
            'images/ZAPATILLAS SPINLE.png',
            'images/ZAPATILLAS SPINLE.png',
            'images/ZAPATILLAS SPINLE.png',
            'images/ZAPATILLAS SPINLE.png'
        ],
        colors: ['#1a1a1a', '#ffffff'],
        sizes: ['38', '39', '40', '41', '42', '43', '44', '45']
    },
    10: {
        id: 10,
        name: 'BIDON ECO 750ML',
        category: 'ACCESORIOS',
        price: 14.99,
        stock: true,
        rating: 4.1,
        reviews: 28,
        description: 'Bidón ecológico fabricado con materiales reciclados. Sin BPA, fácil de limpiar y compatible con todos los portabidones.',
        images: [
            'images/BOTELLIN SPINLEY (1).png',
            'images/BOTELLIN SPINLEY (1).png',
            'images/BOTELLIN SPINLEY (1).png',
            'images/BOTELLIN SPINLEY (1).png'
        ],
        colors: ['#9eef6b', '#2e5c8e', '#1a1a1a'],
        sizes: ['750ml']
    },
    11: {
        id: 11,
        name: 'MAILLOT MUJER PRO',
        category: 'WOMEN\'S JERSEY',
        price: 84.99,
        stock: true,
        rating: 4.6,
        reviews: 42,
        description: 'Maillot diseñado específicamente para el cuerpo femenino. Corte anatómico con tejido técnico de alta calidad.',
        images: [
            'images/MAILLOT PRO MUJER .jpg',
            'images/MAILLOT PRO MUJER .jpg',
            'images/MAILLOT PRO MUJER .jpg',
            'images/MAILLOT PRO MUJER .jpg'
        ],
        colors: ['#c4382e', '#9eef6b', '#2e5c8e'],
        sizes: ['XS', 'S', 'M', 'L']
    },
    12: {
        id: 12,
        name: 'CALCETINES ECO',
        category: 'CALCETINES',
        price: 24.99,
        stock: true,
        rating: 4.3,
        reviews: 25,
        description: 'Calcetines ecológicos fabricados con materiales reciclados. Transpirables y cómodos para largas rutas.',
        images: [
            'images/CALCETINES 2.png',
            'images/CALCETINES 2.png',
            'images/CALCETINES 2.png',
            'images/CALCETINES 2.png'
        ],
        colors: ['#1a1a1a', '#9eef6b', '#c4382e'],
        sizes: ['S', 'M', 'L']
    }
};

// =====================
// PRODUCT DETAIL
// =====================
function changeImage(thumbnail) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');

    if (mainImage) {
        mainImage.src = thumbnail.src.replace('w=200', 'w=800');
    }
    
    thumbnails.forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function loadProductFromURL() {
    // Only run on product detail page
    if (!window.location.pathname.includes('producto.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;
    const product = productsDatabase[productId];
    
    if (!product) {
        // Redirect to products page if product not found
        window.location.href = 'productos.html';
        return;
    }
    
    // Update page title
    document.title = `${product.name} - SPINLEY`;
    
    // Update breadcrumb
    const breadcrumbSpan = document.querySelector('.breadcrumb span:last-child');
    if (breadcrumbSpan) breadcrumbSpan.textContent = product.name;
    
    // Update main image
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    if (thumbnailsContainer && product.images.length > 0) {
        thumbnailsContainer.innerHTML = product.images.map((img, index) => `
            <img class="thumbnail ${index === 0 ? 'active' : ''}" src="${img}" alt="Vista ${index + 1}" onclick="changeImage(this)">
        `).join('');
    }
    
    // Update product category
    const categoryTag = document.querySelector('.product-category-tag');
    if (categoryTag) categoryTag.textContent = product.category;
    
    // Update product name
    const productTitle = document.querySelector('.product-title');
    if (productTitle) productTitle.textContent = product.name;
    
    // Update rating
    const starsContainer = document.querySelector('.product-rating .stars');
    if (starsContainer) {
        const fullStars = Math.floor(product.rating);
        const emptyStars = 5 - fullStars;
        starsContainer.innerHTML = `<span>${'★'.repeat(fullStars)}</span><span class="empty">${'★'.repeat(emptyStars)}</span>`;
    }
    
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) ratingText.textContent = `${product.rating} / 5 (${product.reviews} valoraciones)`;
    
    // Update price
    const priceElement = document.querySelector('.product-price-large');
    if (priceElement) priceElement.textContent = product.price.toFixed(2).replace('.', ',') + '€';
    
    // Update stock
    const stockElement = document.querySelector('.product-stock');
    if (stockElement) {
        stockElement.textContent = product.stock ? 'En stock' : 'Agotado';
        stockElement.style.color = product.stock ? '#9eef6b' : '#ff4444';
    }
    
    // Update description
    const descriptionElement = document.querySelector('.product-description p');
    if (descriptionElement) descriptionElement.textContent = product.description;
    
    // Update colors
    const colorSelector = document.querySelector('.color-selector');
    if (colorSelector && product.colors) {
        colorSelector.innerHTML = product.colors.map((color, index) => `
            <button class="color-btn ${index === 0 ? 'active' : ''}" data-color="${color}" style="background: ${color}"></button>
        `).join('');
        
        // Re-attach click events
        colorSelector.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                colorSelector.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Update sizes
    const sizeSelector = document.querySelector('.size-selector');
    if (sizeSelector && product.sizes) {
        sizeSelector.innerHTML = product.sizes.map((size, index) => `
            <button class="size-btn ${index === Math.floor(product.sizes.length / 2) ? 'active' : ''}">${size}</button>
        `).join('');
        
        // Re-attach click events
        sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Update reviews section
    const reviewsRatingNumber = document.querySelector('.rating-number');
    if (reviewsRatingNumber) reviewsRatingNumber.textContent = product.rating;
    
    const reviewsStars = document.querySelector('.stars-large');
    if (reviewsStars) {
        const fullStars = Math.floor(product.rating);
        const emptyStars = 5 - fullStars;
        reviewsStars.innerHTML = '★'.repeat(fullStars) + `<span class="empty">${'★'.repeat(emptyStars)}</span>`;
    }
    
    const reviewsCount = document.querySelector('.reviews-summary p');
    if (reviewsCount) reviewsCount.textContent = `${product.reviews} valoraciones`;
}

function initProductDetail() {
    // Load product data from URL
    loadProductFromURL();
    
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const quantity = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (qtyMinus && quantity) {
        qtyMinus.addEventListener('click', () => {
            quantity.value = Math.max(1, parseInt(quantity.value) - 1);
        });
    }

    if (qtyPlus && quantity) {
        qtyPlus.addEventListener('click', () => {
            quantity.value = parseInt(quantity.value) + 1;
        });
    }

    if (addToCartBtn && quantity) {
        addToCartBtn.addEventListener('click', () => {
            const qty = parseInt(quantity.value);
            // Get product info from URL or page
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id')) || 1;
            const product = productsDatabase[productId];
            
            if (product) {
                addToCart(productId, product.name, product.price, qty);
                showNotification(`Añadido al carrito (${qty} unidad${qty > 1 ? 'es' : ''})`);
                quantity.value = 1;
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            const targetTab = document.getElementById(tabName);
            if (targetTab) targetTab.classList.add('active');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// =====================
// EVENTS SECTION
// =====================
function initEvents() {
    const eventsSection = document.querySelector('.events');
    const eventsBtn = eventsSection?.querySelector('.btn');
    
    if (eventsBtn) {
        eventsBtn.href = '#';
        eventsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showEventsModal();
        });
    }
}

function showEventsModal() {
    // Remove existing modal
    const existingModal = document.getElementById('events-modal');
    if (existingModal) existingModal.remove();
    
    const events = [
        {
            date: '15 Mayo 2026',
            title: 'Ruta Costera Barcelona',
            description: 'Recorrido de 80km por la costa catalana con paradas en puntos panorámicos.',
            location: 'Barcelona',
            participants: 45
        },
        {
            date: '22 Mayo 2026',
            title: 'Mountain Challenge',
            description: 'Ascenso a los puertos de montaña más emblemáticos del Pirineo.',
            location: 'Pirineos',
            participants: 30
        },
        {
            date: '5 Junio 2026',
            title: 'Night Ride Madrid',
            description: 'Rodada nocturna por el centro de Madrid con luces LED.',
            location: 'Madrid',
            participants: 60
        },
        {
            date: '19 Junio 2026',
            title: 'Gravel Experience',
            description: 'Aventura por caminos de tierra y senderos forestales.',
            location: 'Navarra',
            participants: 35
        }
    ];
    
    const modal = document.createElement('div');
    modal.id = 'events-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a0a;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        padding: 30px;
        border: 1px solid #1a1a1a;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h2 style="color: #fff; margin: 0; font-size: 28px;">Próximos Eventos</h2>
            <button id="close-events" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 28px; line-height: 1;">&times;</button>
        </div>
        <p style="color: #888; margin-bottom: 30px;">Únete a nuestra comunidad ciclista en estas experiencias únicas</p>
        <div class="events-list">
            ${events.map(event => `
                <div style="background: #111; border-radius: 12px; padding: 25px; margin-bottom: 20px; border: 1px solid #1a1a1a; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 250px;">
                            <span style="color: #9eef6b; font-size: 12px; font-weight: 600; text-transform: uppercase;">${event.date}</span>
                            <h3 style="color: #fff; margin: 10px 0; font-size: 20px;">${event.title}</h3>
                            <p style="color: #888; font-size: 14px; line-height: 1.6;">${event.description}</p>
                            <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
                                <span style="color: #666; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    ${event.location}
                                </span>
                                <span style="color: #666; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    ${event.participants} inscritos
                                </span>
                            </div>
                        </div>
                        <button style="background: #9eef6b; color: #050505; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; transition: all 0.3s ease;" 
                            onmouseover="this.style.background='#8ae05c'" 
                            onmouseout="this.style.background='#9eef6b'"
                            onclick="registerForEvent('${event.title}')">
                            Inscribirse
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal events
    document.getElementById('close-events').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function registerForEvent(eventName) {
    showNotification(`Te has inscrito en "${eventName}". Recibirás más información por email.`);
}

// =====================
// CONTACT FORM
// =====================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const subject = document.getElementById('subject')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const privacy = document.getElementById('privacy')?.checked;

        if (!name || !email || !subject || !message || !privacy) {
            showNotification('Por favor, completa todos los campos requeridos');
            return;
        }

        if (!email.includes('@')) {
            showNotification('Por favor, introduce un email válido');
            return;
        }

        showNotification('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
        form.reset();
    });
}

// =====================
// CHECKOUT
// =====================
function initCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                showNotification('Tu carrito está vacío');
                return;
            }
            showNotification('Redirigiendo al proceso de pago...');
            // Here you would redirect to checkout page
            setTimeout(() => {
                showNotification('Funcionalidad de pago en desarrollo');
            }, 1500);
        });
    }
    
    // Discount code
    const discountBtn = document.querySelector('.discount-code .btn-secondary');
    const discountInput = document.querySelector('.discount-input');
    
    if (discountBtn && discountInput) {
        discountBtn.addEventListener('click', () => {
            const code = discountInput.value.trim().toUpperCase();
            if (!code) {
                showNotification('Introduce un código de descuento');
                return;
            }
            
            const validCodes = {
                'SPINLEY10': 10,
                'CICLISMO20': 20,
                'BIENVENIDO': 15
            };
            
            if (validCodes[code]) {
                showNotification(`Código aplicado: ${validCodes[code]}% de descuento`);
                // Apply discount to total
                applyDiscount(validCodes[code]);
            } else {
                showNotification('Código de descuento no válido');
            }
        });
    }
}

function applyDiscount(percent) {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * (percent / 100);
    const shipping = (subtotal - discount) >= 80 ? 0 : 5;
    const total = subtotal - discount + shipping;
    
    const totalEl = document.getElementById('total');
    if (totalEl) {
        totalEl.innerHTML = `<span style="text-decoration: line-through; color: #666; margin-right: 10px;">${subtotal.toFixed(2)}€</span>${total.toFixed(2)}€`;
    }
}

// =====================
// NOTIFICATIONS
// =====================
function showNotification(message) {
    // Remove existing notifications
    document.querySelectorAll('.spinley-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'spinley-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #9eef6b;
        color: #050505;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(158, 239, 107, 0.4);
        max-width: 350px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initSearch();
    initCarousel();
    initFilters();
    initProductDetail();
    initContactForm();
    initEvents();
    initCheckout();
    initFavoriteButtons();
    initFavoritesModal();

    // Load cart page if on cart page
    if (window.location.pathname.includes('carrito')) {
        renderCart();
    }

    updateCartCount();
    updateFavoritesCount();

    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// =====================
// CSS ANIMATIONS
// =====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .header-search.mobile-active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #050505;
        padding: 15px;
        border-bottom: 1px solid #1a1a1a;
    }
    
    .search-dropdown a:hover {
        background: #1a1a1a !important;
    }
    
    .favorite-btn:hover {
        transform: scale(1.1);
    }
    
    .favorite-btn.active svg {
        fill: #9eef6b !important;
    }
`;
document.head.appendChild(style);
