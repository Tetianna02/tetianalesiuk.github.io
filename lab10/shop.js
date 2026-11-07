let catalog = { title: '', products: [] };
let cart = [];
let storageKey = '';
let catalogReady = false;
let currentLanguage = 'uk';
let translationMode = 'native';

let translations = {
    uk: {
        catalog: 'Каталог товарів',
        cart: 'Кошик',
        cartCount: 'Найменувань у кошику: {{count}}',
        add: 'Додати у кошик',
        quantityTitle: 'Вкажіть кількість:',
        quantity: 'Кількість',
        cancel: 'Скасувати',
        added: 'Товар додано',
        goToCart: 'Перейти у кошик',
        continueShopping: 'Повернутись до покупок',
        emptyCart: 'Корзина пуста',
        selected: 'Ви обрали:',
        number: '№',
        product: 'Назва товару',
        unitPrice: 'Ціна за од.',
        subtotal: 'Сума',
        actions: 'Дії',
        remove: 'Видалити',
        total: 'Разом до оплати:',
        pay: 'Оплатити',
        payment: 'Оплата замовлення',
        demoPayment: 'Навчальне замовлення. Реальний платіж не виконується.',
        close: 'Закрити',
        quantityError: 'Введіть цілу кількість від 1 до {{max}}.',
        quantityLimit: 'Максимальна кількість одного товару — 99.',
        storageError: 'Не вдалося зберегти кошик у браузері. Зміни можуть бути втрачені після переходу на іншу сторінку.',
        storageReadError: 'Не вдалося відновити кошик. Додайте товари повторно.',
        loading: 'Завантаження…',
        loadError: 'Не вдалося завантажити каталог. Перевірте з’єднання та повторіть спробу.',
        retry: 'Повторити',
        noProducts: 'У каталозі поки немає товарів.',
        language: 'Мова',
        translation: 'Спосіб перекладу',
        native: 'JavaScript',
        library: 'i18next'
    }
};

function t(key, values = {}) {
    if (translationMode === 'i18next' && window.i18next) {
        return i18next.t(key, values);
    }

    const template = translations[currentLanguage]?.[key] || translations.uk[key] || key;
    return template.replace(/\{\{(\w+)\}\}/g, (match, name) => String(values[name] ?? match));
}

function readText(value) {
    return typeof value === 'string' ? value : value[currentLanguage] || value.uk;
}

function formatPrice(value) {
    return new Intl.NumberFormat(currentLanguage === 'uk' ? 'uk-UA' : 'en-US', {
        style: 'currency',
        currency: 'UAH',
        minimumFractionDigits: 2
    }).format(value);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function showNotice(key) {
    const notice = document.getElementById('notice');
    notice.dataset.message = key;
    notice.textContent = key ? t(key) : '';
    notice.hidden = !key;
}

function readCart() {
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw === null) {
            return [];
        }

        const saved = JSON.parse(raw);
        const ids = new Set();
        if (!Array.isArray(saved) || !saved.every(item => {
            if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 ||
                !catalog.products.some(product => product.id === item.id) || ids.has(item.id)) {
                return false;
            }
            ids.add(item.id);
            return true;
        })) {
            throw new Error('Invalid cart');
        }

        return saved.map(item => ({ id: item.id, quantity: item.quantity }));
    } catch {
        showNotice('storageReadError');
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
        showNotice('');
    } catch {
        showNotice('storageError');
    }
}

function cartTotal() {
    return cart.reduce((sum, item) => {
        const product = catalog.products.find(product => product.id === item.id);
        return sum + Math.round(product.price * 100) * item.quantity;
    }, 0) / 100;
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
    document.getElementById('cartLink').setAttribute('aria-label', t('cartCount', { count: cart.length }));
}

function showDialog(title, nodes) {
    const dialog = document.getElementById('shopDialog');
    const heading = createElement('h2', '', title);
    heading.id = 'dialogTitle';
    dialog.replaceChildren(heading, ...nodes);
    if (!dialog.open) {
        dialog.showModal();
    }
    dialog.querySelector('input, button, a')?.focus();
}

function closeButton(label = 'close') {
    const button = createElement('button', 'secondary', t(label));
    button.type = 'button';
    button.addEventListener('click', () => document.getElementById('shopDialog').close());
    return button;
}

function showMessage(title, text) {
    const message = createElement('p', '', text);
    const actions = createElement('div', 'controls');
    actions.appendChild(closeButton());
    showDialog(title, [message, actions]);
}

function showAdded(product, quantity) {
    const message = createElement('p', '', `${readText(product.name)} × ${quantity}`);
    const actions = createElement('div', 'controls');
    const link = createElement('a', 'button-link', t('goToCart'));
    link.href = 'cart.html';
    actions.append(link, closeButton('continueShopping'));
    showDialog(t('added'), [message, actions]);
}

function showQuantity(product) {
    const existing = cart.find(item => item.id === product.id);
    const max = 99 - (existing?.quantity || 0);
    if (max === 0) {
        showMessage(t('cart'), t('quantityLimit'));
        return;
    }

    const name = createElement('p', '', readText(product.name));
    const form = document.createElement('form');
    const label = createElement('label', '', t('quantity'));
    label.htmlFor = 'quantityInput';
    const input = document.createElement('input');
    input.id = 'quantityInput';
    input.type = 'number';
    input.min = '1';
    input.max = String(max);
    input.step = '1';
    input.value = '1';
    input.required = true;

    const actions = createElement('div', 'controls');
    const add = createElement('button', '', t('add'));
    add.type = 'submit';
    actions.append(add, closeButton('cancel'));
    form.append(label, input, actions);

    input.addEventListener('input', () => input.setCustomValidity(''));
    form.addEventListener('submit', event => {
        event.preventDefault();
        const quantity = input.valueAsNumber;
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) {
            input.setCustomValidity(t('quantityError', { max }));
            input.reportValidity();
            return;
        }

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id: product.id, quantity });
        }
        saveCart();
        updateCartCount();
        showAdded(product, quantity);
    });

    showDialog(t('quantityTitle'), [name, form]);
    input.select();
}

function renderCatalog() {
    const container = document.getElementById('products');
    if (!container) {
        return;
    }

    const cards = catalog.products.map(product => {
        const article = createElement('article', 'product-card');
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = readText(product.name);
        image.width = 240;
        image.height = 200;
        image.loading = 'lazy';

        const category = createElement('p', 'category', readText(product.category));
        const name = createElement('h2', '', readText(product.name));
        const description = createElement('p', 'description', readText(product.description));
        const price = createElement('p', 'price', formatPrice(product.price));
        const button = createElement('button', 'add-button', t('add'));
        button.type = 'button';
        button.addEventListener('click', () => showQuantity(product));
        article.append(image, category, name, description, price, button);
        return article;
    });

    container.replaceChildren(...cards);
}

function renderCart() {
    const table = document.getElementById('cartTable');
    if (!table) {
        return;
    }

    const body = document.getElementById('cartBody');
    const rows = cart.map((item, index) => {
        const product = catalog.products.find(product => product.id === item.id);
        const row = document.createElement('tr');
        const number = createElement('td', '', index + 1);
        const name = createElement('td', '', readText(product.name));
        const price = createElement('td', 'money', formatPrice(product.price));
        const quantityCell = document.createElement('td');
        const quantity = document.createElement('input');
        quantity.type = 'number';
        quantity.min = '1';
        quantity.max = '99';
        quantity.step = '1';
        quantity.value = item.quantity;
        quantity.className = 'cart-quantity';
        quantity.setAttribute('aria-label', `${t('quantity')}: ${readText(product.name)}`);
        quantity.addEventListener('change', () => {
            const value = quantity.valueAsNumber;
            if (!Number.isInteger(value) || value < 1 || value > 99) {
                quantity.value = item.quantity;
                showMessage(t('quantity'), t('quantityError', { max: 99 }));
                return;
            }
            item.quantity = value;
            saveCart();
            renderCart();
        });
        quantityCell.appendChild(quantity);

        const subtotal = createElement('td', 'money', formatPrice(Math.round(product.price * 100) * item.quantity / 100));
        const actions = document.createElement('td');
        const remove = createElement('button', 'delete-button', t('remove'));
        remove.type = 'button';
        remove.setAttribute('aria-label', `${t('remove')}: ${readText(product.name)}`);
        remove.addEventListener('click', () => {
            cart = cart.filter(current => current.id !== item.id);
            saveCart();
            updateCartCount();
            renderCart();
        });
        actions.appendChild(remove);
        row.append(number, name, price, quantityCell, subtotal, actions);
        return row;
    });

    body.replaceChildren(...rows);
    table.hidden = cart.length === 0;
    document.getElementById('emptyCart').hidden = cart.length !== 0;
    document.getElementById('cartSummary').hidden = cart.length === 0;
    document.getElementById('payLink').hidden = cart.length === 0;
    document.getElementById('cartTotal').textContent = formatPrice(cartTotal());
}

function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });

    const title = document.getElementById('catalogTitle');
    const catalogName = readText(catalog.title);
    title.textContent = catalogName;
    document.title = document.getElementById('cartTable') ? `${t('cart')} — ${catalogName}` : catalogName;

    const notice = document.getElementById('notice');
    if (notice.dataset.message) {
        notice.textContent = t(notice.dataset.message);
    }
    updateCartCount();
}

function validateCatalog(data) {
    function validText(value) {
        return typeof value === 'string' ||
            value && typeof value.uk === 'string' && typeof value.en === 'string';
    }

    const ids = new Set();
    if (!data || !validText(data.title) || !Array.isArray(data.products) ||
        !data.products.every(product => {
            if (!product || !Number.isInteger(product.id) || ids.has(product.id) ||
                !validText(product.name) || !validText(product.description) || !validText(product.category) ||
                !Number.isFinite(product.price) || product.price <= 0 ||
                typeof product.image !== 'string') {
                return false;
            }
            ids.add(product.id);
            return true;
        })) {
        throw new Error('Invalid catalog');
    }

    return data;
}

async function fetchCatalog() {
    const response = await fetch('products.json');
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function startShop(options) {
    storageKey = options.storageKey;
    const status = document.getElementById('loadStatus');
    status.hidden = false;
    status.textContent = t('loading');
    document.getElementById('cartLink').setAttribute('aria-disabled', 'true');

    document.getElementById('cartLink').onclick = event => {
        if (!catalogReady || cart.length === 0) {
            event.preventDefault();
            if (catalogReady) {
                showMessage(t('emptyCart'), t('continueShopping'));
            }
        }
    };
    const payLink = document.getElementById('payLink');
    if (payLink) {
        payLink.onclick = event => {
            event.preventDefault();
            if (cart.length) {
                showMessage(t('payment'), `${t('total')} ${formatPrice(cartTotal())}. ${t('demoPayment')}`);
            }
        };
    }

    try {
        catalog = validateCatalog(await options.loadCatalog());
        cart = readCart();
        applyTranslations();

        if (options.staticCards) {
            document.querySelectorAll('[data-product-id]').forEach(button => {
                const product = catalog.products.find(product => product.id === Number(button.dataset.productId));
                button.onclick = () => showQuantity(product);
            });
        } else {
            renderCatalog();
        }
        renderCart();
        catalogReady = true;
        document.getElementById('cartLink').removeAttribute('aria-disabled');
        document.querySelectorAll('.add-button').forEach(button => button.disabled = false);
        status.textContent = catalog.products.length ? '' : t('noProducts');
        status.hidden = catalog.products.length !== 0;
    } catch {
        status.replaceChildren(createElement('span', '', t('loadError')));
        const retry = createElement('button', '', t('retry'));
        retry.type = 'button';
        retry.addEventListener('click', () => startShop(options));
        status.append(' ', retry);
    }
}
