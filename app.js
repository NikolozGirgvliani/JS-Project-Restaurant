// menu

let API_URL = 'https://restaurant.stepprojects.ge/api';

let allProducts = [];
let categories = [];
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let activeCategoryId = null;

async function Menu() {
    await fetchCategories();
    await fetchProducts();
    renderCategories();
    renderProducts();
    renderCart();
}

async function fetchCategories() {
    try {
        let response = await fetch(`${API_URL}/Categories/GetAll`);
        categories = await response.json();
        if (!Array.isArray(categories)) categories = [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        categories = [];
    }
}

async function fetchProducts() {
    try {
        let response = await fetch(`${API_URL}/Products/GetAll`);
        allProducts = await response.json();
        if (!Array.isArray(allProducts)) allProducts = [];
    } catch (error) {
        console.error('Error fetching products:', error);
        allProducts = [];
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function renderCategories() {
    let categoriesDiv = document.getElementById('categories');
    if (!categoriesDiv) return;

    categoriesDiv.innerHTML = '';

    let allBtn = document.createElement('button');
    allBtn.className = 'btn';
    allBtn.style.cursor = 'pointer';
    allBtn.style.marginRight = '5px';
    allBtn.style.border = 'none';
    allBtn.textContent = 'All';
    allBtn.onclick = () => filterCategory(null);
    categoriesDiv.appendChild(allBtn);

    categories.forEach(cat => {
        let btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cursor = 'pointer';
        btn.style.marginRight = '5px';
        btn.style.border = 'none';
        btn.textContent = cat.name;
        btn.onclick = () => filterCategory(cat.id);
        categoriesDiv.appendChild(btn);
    });
}

function filterCategory(categoryId) {
    activeCategoryId = categoryId;
    renderProducts();
}

function renderProducts() {
    let grid = document.querySelector('#products-grid');
    if (!grid) return;

    grid.innerHTML = '';

    let filtered;

    if (activeCategoryId) {
        filtered = allProducts.filter(p => p.categoryId === activeCategoryId);
    } else {
        filtered = allProducts;
    }

    filtered.forEach(product => {
        let card = document.createElement('div');
        card.style.background = 'rgba(0, 0, 0, 0.7)';
        card.style.border = '1px solid #FFD700';
        card.style.borderRadius = '8px';
        card.style.padding = '15px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.textAlign = 'center';

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">
            <h3 style="font-size: 16px; margin: 10px 0; color: #FFF; height: 40px; overflow: hidden;">${product.name}</h3>
            <div style="font-weight: bold; margin-bottom: 10px; color: #FFD700;">${product.price} GEL</div>
            <button onclick="addToCart(${product.id})" class="btn" style="cursor: pointer; padding: 5px 15px; font-size: 14px; border: none; width: 100%;">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    let product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let existingItem = cartItems.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            productId: productId,
            quantity: 1,
            price: product.price,
            product: product
        });
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    saveCart();
    renderCart();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    let item = cartItems.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        renderCart();
    }
}

function renderCart() {
    let cartItemsDiv = document.getElementById('cart-items');
    let cartTotalSpan = document.getElementById('cart-total');
    if (!cartItemsDiv || !cartTotalSpan) return;

    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = '<div style="color: #FFD700; text-align: center; margin-top: 20px;">Cart is empty</div>';
        cartTotalSpan.textContent = '0 GEL';
        return;
    }

    cartItems.forEach(item => {
        if (!item.product) return;
        let itemTotal = item.price * item.quantity;
        total += itemTotal;

        let itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.justifyContent = 'space-between';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.marginBottom = '12px';
        itemDiv.style.paddingBottom = '12px';
        itemDiv.style.borderBottom = '1px solid rgba(255, 215, 0, 0.3)';

        

        itemDiv.innerHTML = `
            <div style="flex: 2; padding-right: 5px;">
                <div style="font-weight: bold; color: #FFF; font-size: 14px;">${item.product.name}</div>
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 5px;">
                    <button onclick="updateQuantity(${item.productId}, ${item.quantity - 1})" class="btn" style="padding: 2px 6px; font-size: 10px; border: none; background: #555;">-</button>
                    <span style="color: #FFD700; font-size: 13px; min-width: 15px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.productId}, ${item.quantity + 1})" class="btn" style="padding: 2px 6px; font-size: 10px; border: none; background: #555;">+</button>
                    <span style="font-size: 11px; color: #aaa; margin-left: 5px;">x ${item.price} GEL</span>
                </div>
            </div>
            <div style="flex: 1; text-align: right; font-weight: bold; color: #FFD700; margin-right: 8px; font-size: 14px;">
                ${itemTotal} GEL
            </div>
            <button onclick="removeFromCart(${item.productId})" class="btn" style="cursor: pointer; padding: 2px 6px; font-size: 12px; background: #D84315; border: none;">X</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });

    cartTotalSpan.textContent = `${total} GEL`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-grid')) {
        Menu();
    }
});


// signup

let SignUpForm = document.querySelector(".sign-up-form");
let LogInForm = document.querySelector(".log-in-form");
let empty = document.querySelector(".empty");

if (SignUpForm) {
    SignUpForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let firstname = document.querySelector("#firstname-input").value;
        let email = document.getElementById("email-input").value;
        let password = document.getElementById("password-input").value;
        let repeatPassword = document.getElementById("repeat-password-input").value;

        if(password !== repeatPassword){
            empty.innerHTML = "Passwords Do Not Match";
            return;
        }

        let person = {
            firstName: firstname,
            lastName: "Step Student",
            age: 18,
            email: email,
            password: password,
            address: "somewhere",
            phone: "+995599123456",
            zipcode: "0178",
            avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Jane",
            gender: "MALE"
        };

        fetch('https://api.everrest.educata.dev/auth/sign_up', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(person)
        })
        .then(function(response) { 
            if(response.ok){
                empty.innerHTML = "Success! You Can Now Log In!";
            } else {
                empty.innerHTML = "Email is already in use or information is incorrect.";
            }
        })
        .catch(function(error) {
            alert('Failed To Reach Server');
        });
    });
}

// login

if (LogInForm) {
    LogInForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let emailInput = document.querySelector("#email-input").value;
        let passwordInput = document.querySelector("#password-input").value;

        let LogInPerson = {
            email: emailInput,
            password: passwordInput
        };

        fetch('https://api.everrest.educata.dev/auth/sign_in', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(LogInPerson)
        })
        .then(function(response) {
            if(response.ok){
                // empty.innerHTML = 'Logged In Successfully';
                window.location.href = 'home.html'

            } else {
                empty.innerHTML = 'Information Is Incorrect';
            }
        })
        .catch(function(error){
            empty.innerHTML = 'Error, Try again';
        });
    });
}

// index js