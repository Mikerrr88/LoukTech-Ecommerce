// Product Search and Filtering Logic

let allProducts = [];
let currentCategory = 'all';
let currentSort = 'default';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const sortSelect = document.getElementById('sortSelect');

    // Fetch products from JSON
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            displayProducts(allProducts);
        })
        .catch(error => {
            console.error('Error loading products:', error);
            if (productsGrid) {
                productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
            }
        });

    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            filterProducts(searchInput.value);
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterProducts(searchInput.value);
            }
            // Real-time filtering
            filterProducts(searchInput.value);
        });
    }

    // Category filtering
    if (categoryButtons) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Get category and filter
                currentCategory = btn.dataset.category;
                updateCategoryTitle(currentCategory);
                applyFiltersAndSort();
            });
        });
    }

    // Sorting
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }
});

function applyFiltersAndSort() {
    let filtered = allProducts;

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(product => product.category === currentCategory);
    }

    // Apply search filter if search input has value
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply sorting
    filtered = sortProducts(filtered, currentSort);

    displayProducts(filtered);
}

function sortProducts(products, sortType) {
    const sorted = [...products];

    switch(sortType) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

function updateCategoryTitle(category) {
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
        categoryTitle.textContent = category === 'all' ? 'All Products' : category;
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-results">No products found matching your search.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <span class="category">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="description">${product.description}</p>
                <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function filterProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    let filtered = allProducts;

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(product => product.category === currentCategory);
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply sorting
    filtered = sortProducts(filtered, currentSort);

    displayProducts(filtered);
}

function addToCart(productId) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to add items to your cart.');
        window.location.href = 'login.html';
        return;
    }
    
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.addItem(product);
    }
}
