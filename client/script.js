let token = null;

// Отправка запросов с авторизацией
async function fetchWithAuth(url, options = {}) {
    if (token) {
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
        throw error; // Перебрасываем ошибку для обработки в вызывающей функции
    }
}

// Переключение между формами авторизации и регистрации
document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});

document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
});

// Форма авторизации
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        document.getElementById('loginError').innerText = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token; // Сохраняем токен
            console.log(`Login successful. Token: ${token}`);
            alert('Logged in successfully!');
            showAuthPanel();
        } else {
            const errorData = await response.json();
            console.error(`Login failed for user: ${username}`, errorData);
            document.getElementById('loginError').innerText = errorData.detail || 'Invalid credentials';
        }
    } catch (error) {
        console.error("An error occurred during login:", error);
        document.getElementById('loginError').innerText = 'An error occurred';
    }
});

// Форма регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
        document.getElementById('registerError').innerText = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            console.log(`Registration successful for user: ${username}`);
            alert('User registered successfully! Please log in.');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        } else {
            document.getElementById('registerError').innerText = 'Failed to register user';
        }
    } catch (error) {
        console.error("An error occurred during registration:", error);
        document.getElementById('registerError').innerText = 'An error occurred';
    }
});

// Показать панель после авторизации
function showAuthPanel() {
    if (!token) {
        alert("Authorization failed. Please log in again.");
        return;
    }

    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('authPanel').classList.remove('hidden');

    // Загружаем данные
    loadCategories();
    loadUsers();
    loadProducts();
    loadOrders();
}

// Создание категории
document.getElementById('createCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;

    try {
        const response = await fetchWithAuth('/categories/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            console.log(`Category "${name}" created successfully`);
            alert('Category created successfully!');
            loadCategories(); // Обновляем категории
        } else {
            const errorData = await response.json();
            document.getElementById('categoryError').innerText = errorData.detail || 'Failed to create category';
        }
    } catch (error) {
        console.error("An error occurred while creating a category:", error);
        document.getElementById('categoryError').innerText = 'An error occurred';
    }
});

// Загрузка категорий
async function loadCategories() {
    try {
        const response = await fetchWithAuth('/categories/');
        if (response.ok) {
            const categories = await response.json();
            if (!Array.isArray(categories)) {
                console.error("Invalid data format for categories:", categories);
                return;
            }

            const select = document.getElementById('productCategory');
            const list = document.getElementById('categoriesList');

            // Обновляем выпадающий список категорий
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                if (category && category.id && category.name) {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.text = category.name;
                    select.add(option);
                }
            });

            // Обновляем список категорий
            list.innerHTML = '';
            categories.forEach(category => {
                if (category && category.id && category.name) {
                    const div = document.createElement('div');
                    div.textContent = `ID: ${category.id}, Name: ${category.name}`;
                    list.appendChild(div);
                }
            });
        } else {
            console.error("Failed to load categories:", response.statusText);
        }
    } catch (error) {
        console.error("An error occurred while loading categories:", error);
    }
}

// Создание товара
document.getElementById('createProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const categoryId = document.getElementById('productCategory').value;

    try {
        const response = await fetchWithAuth('/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, category_id: categoryId }),
        });

        if (response.ok) {
            console.log(`Product "${name}" created successfully`);
            alert('Product created successfully!');
            loadProducts(); // Обновляем товары
        } else {
            const errorData = await response.json();
            document.getElementById('productError').innerText = errorData.detail || 'Failed to create product';
        }
    } catch (error) {
        console.error("An error occurred while creating a product:", error);
        document.getElementById('productError').innerText = 'An error occurred';
    }
});

// Загрузка товаров
async function loadProducts() {
    try {
        const response = await fetchWithAuth('/products/');
        if (response.ok) {
            const products = await response.json();
            if (!Array.isArray(products)) {
                console.error("Invalid data format for products:", products);
                return;
            }

            const select = document.getElementById('itemProduct');
            const list = document.getElementById('productsList');

            // Обновляем выпадающий список товаров
            select.innerHTML = '<option value="">Select Product</option>';
            products.forEach(product => {
                if (product && product.id && product.name && product.price && product.category && product.category.name) {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.text = `${product.name} (${product.price} $)`;
                    select.add(option);
                }
            });

            // Обновляем список товаров
            list.innerHTML = '';
            products.forEach(product => {
                if (product && product.id && product.name && product.price && product.category && product.category.name) {
                    const div = document.createElement('div');
                    div.textContent = `ID: ${product.id}, Name: ${product.name}, Price: ${product.price} $, Category: ${product.category.name}`;
                    list.appendChild(div);
                }
            });
        } else {
            console.error("Failed to load products:", response.statusText);
        }
    } catch (error) {
        console.error("An error occurred while loading products:", error);
    }
}

// Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetchWithAuth('/users/');
        if (response.ok) {
            const users = await response.json();
            if (!Array.isArray(users)) {
                console.error("Invalid data format for users:", users);
                return;
            }

            const select = document.getElementById('orderUser');
            const list = document.getElementById('usersList');

            // Обновляем выпадающий список пользователей
            select.innerHTML = '<option value="">Select User</option>';
            users.forEach(user => {
                if (user && user.id && user.username) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.text = user.username;
                    select.add(option);
                }
            });

            // Обновляем список пользователей
            list.innerHTML = '';
            users.forEach(user => {
                if (user && user.id && user.username) {
                    const div = document.createElement('div');
                    div.textContent = `ID: ${user.id}, Username: ${user.username}`;
                    list.appendChild(div);
                }
            });
        } else {
            console.error("Failed to load users:", response.statusText);
        }
    } catch (error) {
        console.error("An error occurred while loading users:", error);
    }
}

// Создание заказа
document.getElementById('createOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('orderUser').value;

    try {
        const response = await fetchWithAuth('/orders/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
            console.log(`Order for user ID=${userId} created successfully`);
            alert('Order created successfully!');
            loadOrders(); // Обновляем заказы
        } else {
            const errorData = await response.json();
            document.getElementById('orderError').innerText = errorData.detail || 'Failed to create order';
        }
    } catch (error) {
        console.error("An error occurred while creating an order:", error);
        document.getElementById('orderError').innerText = 'An error occurred';
    }
});

// Загрузка заказов
async function loadOrders() {
    try {
        const response = await fetchWithAuth('/orders/');
        if (response.ok) {
            const orders = await response.json();
            if (!Array.isArray(orders)) {
                console.error("Invalid data format for orders:", orders);
                return;
            }

            const select = document.getElementById('itemOrder');
            const list = document.getElementById('ordersList');

            // Обновляем выпадающий список заказов
            select.innerHTML = '<option value="">Select Order</option>';
            orders.forEach(order => {
                if (order && order.id && order.user && order.user.username && order.status) {
                    const option = document.createElement('option');
                    option.value = order.id;
                    option.text = `Order #${order.id} by ${order.user.username}`;
                    select.add(option);
                }
            });

            // Обновляем список заказов
            list.innerHTML = '';
            orders.forEach(order => {
                if (order && order.id && order.user && order.user.username && order.status) {
                    const div = document.createElement('div');
                    div.textContent = `ID: ${order.id}, User: ${order.user.username}, Status: ${order.status}`;
                    list.appendChild(div);
                }
            });
        } else {
            console.error("Failed to load orders:", response.statusText);
        }
    } catch (error) {
        console.error("An error occurred while loading orders:", error);
    }
}

// Добавление товара в заказ
document.getElementById('addItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('itemOrder').value;
    const productId = document.getElementById('itemProduct').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);

    if (!orderId || !productId || isNaN(quantity) || quantity <= 0) {
        document.getElementById('itemError').innerText = 'Please fill in all fields and provide a valid quantity';
        return;
    }

    try {
        const response = await fetchWithAuth('/order-items/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, product_id: productId, quantity }),
        });

        if (response.ok) {
            console.log(`Item added to order ID=${orderId} successfully`);
            alert('Item added to order successfully!');
            loadOrders(); // Обновляем заказы
        } else {
            const errorData = await response.json();
            document.getElementById('itemError').innerText = errorData.detail || 'Failed to add item to order';
        }
    } catch (error) {
        console.error("An error occurred while adding an item to the order:", error);
        document.getElementById('itemError').innerText = 'An error occurred';
    }
});