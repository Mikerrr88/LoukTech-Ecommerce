// Shopping Cart Management

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    // Load cart from localStorage
    loadCart() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return [];
        
        const cartKey = `cart_${currentUser}`;
        const savedCart = localStorage.getItem(cartKey);
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const cartKey = `cart_${currentUser}`;
        localStorage.setItem(cartKey, JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // Get cart items
    getItems() {
        return this.items;
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get tax (10%)
    getTax() {
        return this.getSubtotal() * 0.1;
    }

    // Get total with tax
    getTotal() {
        return this.getSubtotal() + this.getTax();
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Update cart count badge in navbar
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add to cart function (called from product cards)
function addToCart(productId) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to add items to your cart.');
        window.location.href = 'login.html';
        return;
    }
    
    // Find product in allProducts array
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.addItem(product);
    }
}

// Update cart display on cart page
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;

    const items = cart.getItems();

    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Start shopping to add items to your cart!</p>
                <a href="products.html" class="btn-primary">Browse Products</a>
            </div>
        `;
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }

    // Display cart items
    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateItemQuantity(${item.id}, this.value)"
                       class="quantity-input">
                <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update summary
    if (cartSummary) {
        cartSummary.style.display = 'block';
        const subtotal = cart.getSubtotal();
        const tax = cart.getTax();
        const total = cart.getTotal();

        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn-primary btn-checkout" onclick="checkout()">
                Proceed to Checkout
            </button>
            <button class="btn-secondary" onclick="clearCartConfirm()">
                Clear Cart
            </button>
        `;
    }
}

// Update item quantity
function updateItemQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) return;
    
    cart.updateQuantity(productId, qty);
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(productId) {
    if (confirm('Remove this item from your cart?')) {
        cart.removeItem(productId);
        updateCartDisplay();
    }
}

// Clear cart with confirmation
function clearCartConfirm() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        cart.clearCart();
        updateCartDisplay();
    }
}

// Checkout function
function checkout() {
    const items = cart.getItems();
    if (items.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.getTotal();
    alert(`Thank you for your order!\n\nTotal: $${total.toFixed(2)}\n\nThis is a demo. In a real store, you would be redirected to payment.`);
    
    // Clear cart after checkout
    cart.clearCart();
    updateCartDisplay();
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartItems')) {
        updateCartDisplay();
    }
    
    // Update cart count on all pages
    cart.updateCartCount();
});
