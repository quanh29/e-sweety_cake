// Products Data
const products = [
    {
        id: 1,
        name: "Bánh Kem Dâu Tươi",
        description: "Bánh kem với lớp kem tươi mềm mịn và dâu tây tươi ngon",
        price: 250000,
        image: "🍰"
    },
    {
        id: 2,
        name: "Bánh Tiramisu",
        description: "Bánh Tiramisu Italia truyền thống với hương vị cà phê đặc trưng",
        price: 280000,
        image: "🎂"
    },
    {
        id: 3,
        name: "Bánh Sô-cô-la",
        description: "Bánh sô-cô-la đậm đà với lớp ganache mềm mịn",
        price: 220000,
        image: "🍫"
    },
    {
        id: 4,
        name: "Bánh Mousse Chanh",
        description: "Bánh mousse chanh dây chua ngọt thanh mát",
        price: 260000,
        image: "🍋"
    },
    {
        id: 5,
        name: "Bánh Red Velvet",
        description: "Bánh nhung đỏ với lớp kem cheese béo ngậy",
        price: 290000,
        image: "❤️"
    },
    {
        id: 6,
        name: "Bánh Matcha",
        description: "Bánh trà xanh Matcha Nhật Bản thơm ngon",
        price: 270000,
        image: "🍵"
    },
    {
        id: 7,
        name: "Bánh Cupcake",
        description: "Set 6 bánh cupcake với nhiều hương vị khác nhau",
        price: 180000,
        image: "🧁"
    },
    {
        id: 8,
        name: "Bánh Macaron",
        description: "Hộp 12 bánh macaron Pháp cao cấp nhiều màu sắc",
        price: 320000,
        image: "🍪"
    },
    {
        id: 9,
        name: "Bánh Cheesecake",
        description: "Bánh phô mai New York kiểu cổ điển",
        price: 240000,
        image: "🧀"
    }
];

// Voucher Data
const vouchers = [
    {
        code: "BANH10",
        discount: 10, // Percentage
        type: "percentage",
        description: "Giảm 10%",
        minOrder: 0
    },
    {
        code: "BANH20",
        discount: 20, // Percentage
        type: "percentage",
        description: "Giảm 20%",
        minOrder: 500000
    },
    {
        code: "GIAM50K",
        discount: 50000, // Fixed amount
        type: "fixed",
        description: "Giảm 50,000đ",
        minOrder: 200000
    },
    {
        code: "FREESHIP",
        discount: 30000, // Fixed amount
        type: "fixed",
        description: "Miễn phí vận chuyển (30,000đ)",
        minOrder: 0
    },
    {
        code: "VIP30",
        discount: 30, // Percentage
        type: "percentage",
        description: "Giảm 30% cho khách VIP",
        minOrder: 1000000
    }
];

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let appliedVoucher = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartUI();
});

// Display Products
function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Format Price
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification('Đã thêm vào giỏ hàng!');
}

// Toggle Cart
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng trống</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

// Update Quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Đã xóa khỏi giỏ hàng');
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Open Checkout Modal
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!');
        return;
    }

    const checkoutModal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('overlay');
    const orderItems = document.getElementById('orderItems');

    // Reset voucher when opening checkout
    appliedVoucher = null;
    document.getElementById('voucherCode').value = '';
    document.getElementById('voucherMessage').textContent = '';
    document.getElementById('voucherMessage').className = 'voucher-message';
    document.getElementById('voucherApplied').style.display = 'none';

    // Display order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');

    // Update order total
    updateOrderTotal();

    // Show modal
    checkoutModal.classList.add('active');
    overlay.classList.add('active');

    // Close cart sidebar
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('active');
}

// Update Order Total (with voucher calculation)
function updateOrderTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let total = subtotal;

    // Calculate discount if voucher is applied
    if (appliedVoucher) {
        if (appliedVoucher.type === 'percentage') {
            discount = (subtotal * appliedVoucher.discount) / 100;
        } else if (appliedVoucher.type === 'fixed') {
            discount = appliedVoucher.discount;
        }
        total = subtotal - discount;
        if (total < 0) total = 0;
    }

    // Update UI
    document.getElementById('orderSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('orderTotal').textContent = formatPrice(total);

    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (discount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = '-' + formatPrice(discount);
    } else {
        discountRow.style.display = 'none';
    }
}

// Apply Voucher
function applyVoucher() {
    const voucherCode = document.getElementById('voucherCode').value.trim().toUpperCase();
    const voucherMessage = document.getElementById('voucherMessage');
    const voucherApplied = document.getElementById('voucherApplied');
    const appliedVoucherText = document.getElementById('appliedVoucherText');

    if (!voucherCode) {
        voucherMessage.textContent = 'Vui lòng nhập mã voucher';
        voucherMessage.className = 'voucher-message error';
        return;
    }

    // Find voucher
    const voucher = vouchers.find(v => v.code === voucherCode);

    if (!voucher) {
        voucherMessage.textContent = 'Mã voucher không hợp lệ';
        voucherMessage.className = 'voucher-message error';
        return;
    }

    // Check minimum order
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal < voucher.minOrder) {
        voucherMessage.textContent = `Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)} để sử dụng mã này`;
        voucherMessage.className = 'voucher-message error';
        return;
    }

    // Apply voucher
    appliedVoucher = voucher;
    voucherMessage.textContent = '';
    voucherMessage.className = 'voucher-message';
    
    // Show applied voucher
    appliedVoucherText.textContent = `${voucher.code} - ${voucher.description}`;
    voucherApplied.style.display = 'flex';
    
    // Disable input
    document.getElementById('voucherCode').disabled = true;

    // Update total
    updateOrderTotal();

    showNotification('Áp dụng mã giảm giá thành công!');
}

// Remove Voucher
function removeVoucher() {
    appliedVoucher = null;
    document.getElementById('voucherCode').value = '';
    document.getElementById('voucherCode').disabled = false;
    document.getElementById('voucherMessage').textContent = '';
    document.getElementById('voucherMessage').className = 'voucher-message';
    document.getElementById('voucherApplied').style.display = 'none';
    
    updateOrderTotal();
    showNotification('Đã hủy mã giảm giá');
}

// Close Checkout Modal
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('overlay');
    
    checkoutModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Handle Checkout Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        
        if (appliedVoucher) {
            if (appliedVoucher.type === 'percentage') {
                discount = (subtotal * appliedVoucher.discount) / 100;
            } else if (appliedVoucher.type === 'fixed') {
                discount = appliedVoucher.discount;
            }
        }
        
        const total = subtotal - discount;

        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            note: document.getElementById('note').value,
            items: cart,
            subtotal: subtotal,
            discount: discount,
            voucher: appliedVoucher ? {
                code: appliedVoucher.code,
                description: appliedVoucher.description,
                discount: discount
            } : null,
            total: total,
            orderDate: new Date().toLocaleString('vi-VN'),
            paymentMethod: 'COD'
        };

        // Save order to localStorage (in real app, send to server)
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(formData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart and voucher
        cart = [];
        appliedVoucher = null;
        saveCart();
        updateCartUI();

        // Close checkout modal
        closeCheckout();

        // Show success modal
        showSuccessModal();

        // Reset form
        checkoutForm.reset();

        // Log order (for demo purposes)
        console.log('Đơn hàng mới:', formData);
    });
});

// Show Success Modal
function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    const overlay = document.getElementById('overlay');
    
    successModal.classList.add('active');
    overlay.classList.add('active');
}

// Close Success Modal
function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    const overlay = document.getElementById('overlay');
    
    successModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b9d 0%, #c86dd7 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        margin-bottom: 10px;
    `;
    notification.textContent = message;

    // Add animation
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
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
        `;
        document.head.appendChild(style);
    }

    // Find all existing notifications and push them down
    const existingNotifications = document.querySelectorAll('[data-notification]');
    existingNotifications.forEach((notif) => {
        const currentTop = parseInt(notif.style.top) || 100;
        notif.style.top = (currentTop + 70) + 'px'; // Move down by notification height + margin
    });

    // Mark as notification for tracking
    notification.setAttribute('data-notification', 'true');

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close modals when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    
    overlay.addEventListener('click', function() {
        const cartSidebar = document.getElementById('cartSidebar');
        const checkoutModal = document.getElementById('checkoutModal');
        const successModal = document.getElementById('successModal');
        
        cartSidebar.classList.remove('active');
        checkoutModal.classList.remove('active');
        successModal.classList.remove('active');
        overlay.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
