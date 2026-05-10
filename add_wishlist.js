const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'beautyProducts.ejs');
let c = fs.readFileSync(file, 'utf8');

// 1. Add CSS
if (!c.includes('.wishlist-btn')) {
    c = c.replace(
        /.product-card\s*\{\s*background-color:\s*white;[^}]+}/,
        `$&
        position: relative;`
    );
    
    // Using a reliable anchor like .product-card:hover
    c = c.replace(
        /.product-card:hover\s*\{[^}]+\}/,
        `$&

        .wishlist-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: 0.3s;
            z-index: 5;
        }
        .wishlist-btn i { color: #ccc; transition: 0.3s; }
        .wishlist-btn.active i { color: #dc3545; }`
    );
}

// 2. Add navbar icon
if (!c.includes('/wishlist')) {
    c = c.replace(
        /<div class="nav-icons">\s*<% if \(locals\.user\) \{ %>/,
        `$&
                <div class="nav-icon-wrapper" onclick="location.href='/wishlist'">
                    <i class="fas fa-heart" style="color:#d63384; font-size:1.2em;"></i>
                    <div class="tooltip">My Wishlist</div>
                </div>`
    );
}

// 3. Add button to product card
if (!c.includes('wishlist-btn" type="button"')) {
    c = c.replace(
        /<div class="product-card">/g,
        `<div class="product-card">
                <button class="wishlist-btn" type="button" onclick="addToWishlist('<%= product.product_name.replace(/'/g, "\\\\'") %>', '<%= product.price %>', '<%= product.image_url %>', this)">
                    <i class="fas fa-heart"></i>
                </button>`
    );
}

// 4. Add JS function
if (!c.includes('function addToWishlist')) {
    c = c.replace(
        /function addToCart\(name, price, image\) \{[\s\S]*?\}\s*document\.addEventListener\("DOMContentLoaded"/,
        `function addToCart(name, price, image) {
        fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, price, image })
        })
        .then(res => res.json())
        .then(() => showToast(\`"\${name}" added to cart 💖\`));
    }

    function addToWishlist(name, price, image, btn) {
        const numericPrice = price.replace(/[^0-9.]/g, "");
        fetch("/wishlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, price: numericPrice, image })
        })
        .then(res => {
            if (res.ok) {
                btn.classList.add("active");
                showToast(\`"\${name}" added to wishlist 💖\`);
            }
        });
    }

    document.addEventListener("DOMContentLoaded"`
    );
}

fs.writeFileSync(file, c);
console.log("Updated beautyProducts.ejs successfully.");
