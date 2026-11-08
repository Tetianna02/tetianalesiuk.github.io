const MEMORY_OPTIONS = [32, 64, 128, 256, 512, 1024];
let phones = [];
let busy = false;
let loaded = false;

function setMessage(id, text, type = '') {
    const element = document.getElementById(id);
    element.textContent = text;
    element.className = type ? `message ${type}` : 'message';
    element.hidden = text === '';
}

function setBusy(value) {
    busy = value;
    document.getElementById('phoneFields').disabled = value || !loaded;
    document.getElementById('refreshButton').disabled = value;
    document.getElementById('catalogSection').setAttribute('aria-busy', String(value));
    document.querySelectorAll('.row-actions button').forEach(button => button.disabled = value);
}

function formatPrice(value) {
    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH'
    }).format(value);
}

function validatePhones(data) {
    if (!Array.isArray(data) || !data.every(phone =>
        phone && Number.isSafeInteger(phone.id) && phone.id > 0 &&
        typeof phone.model === 'string' && typeof phone.brand === 'string' &&
        MEMORY_OPTIONS.includes(phone.memory_gb) &&
        Number.isFinite(Number(phone.price)) && Number(phone.price) > 0
    )) {
        throw new Error('Некоректні дані каталогу');
    }

    return data.map(phone => ({ ...phone, price: Number(phone.price) }));
}

function updateBrands() {
    const filter = document.getElementById('brandFilter');
    const selected = filter.value;
    const brands = [...new Set(phones.map(phone => phone.brand))].sort((first, second) => first.localeCompare(second, 'uk'));
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'Усі виробники';
    filter.replaceChildren(all);

    const list = document.getElementById('brandsList');
    list.replaceChildren();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        filter.appendChild(option);

        const suggestion = document.createElement('option');
        suggestion.value = brand;
        list.appendChild(suggestion);
    });
    filter.value = brands.includes(selected) ? selected : '';
}

function renderPhones() {
    const query = document.getElementById('searchInput').value.trim().toLocaleLowerCase('uk');
    const brand = document.getElementById('brandFilter').value;
    const sort = document.getElementById('sortSelect').value;
    const visible = phones.filter(phone =>
        (!brand || phone.brand === brand) &&
        (!query || phone.model.toLocaleLowerCase('uk').includes(query) || phone.brand.toLocaleLowerCase('uk').includes(query))
    );

    const comparators = {
        newest: (first, second) => second.id - first.id,
        model: (first, second) => first.model.localeCompare(second.model, 'uk') || first.memory_gb - second.memory_gb,
        priceAsc: (first, second) => first.price - second.price,
        priceDesc: (first, second) => second.price - first.price,
        memory: (first, second) => second.memory_gb - first.memory_gb || first.price - second.price
    };
    visible.sort(comparators[sort] || comparators.newest);

    const rows = visible.map(phone => {
        const row = document.createElement('tr');
        [phone.model, phone.brand, `${phone.memory_gb} ГБ`, formatPrice(phone.price)].forEach((text, index) => {
            const cell = document.createElement('td');
            cell.textContent = text;
            if (index === 3) {
                cell.className = 'price';
            }
            row.appendChild(cell);
        });
        const actions = document.createElement('td');
        const controls = document.createElement('div');
        controls.className = 'row-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Редагувати';
        edit.setAttribute('aria-label', `Редагувати: ${phone.brand} ${phone.model}`);
        edit.disabled = busy;
        edit.addEventListener('click', () => startEditing(phone));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'delete-button';
        remove.textContent = 'Видалити';
        remove.setAttribute('aria-label', `Видалити: ${phone.brand} ${phone.model}`);
        remove.disabled = busy;
        remove.addEventListener('click', () => deletePhone(phone));
        controls.append(edit, remove);
        actions.appendChild(controls);
        row.appendChild(actions);
        return row;
    });

    document.getElementById('phoneList').replaceChildren(...rows);
    document.getElementById('phonesTable').hidden = visible.length === 0;
    document.getElementById('resultCount').textContent = loaded ? `Показано: ${visible.length} із ${phones.length}` : '';

    const empty = document.getElementById('emptyMessage');
    empty.hidden = !loaded || visible.length !== 0;
    empty.textContent = phones.length === 0 ? 'У базі даних ще немає телефонів.' : 'За вашим запитом телефонів не знайдено.';
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
        signal: AbortSignal.timeout(20000)
    });
    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Сервер відхилив запит.');
    }
    return data;
}

function errorMessage(error) {
    return error.name === 'TimeoutError' || error.name === 'TypeError'
        ? 'Не вдалося отримати відповідь. Перевірте запуск сервера та MySQL і повторіть спробу.'
        : error.message;
}

async function loadPhones() {
    if (busy) {
        return;
    }
    setBusy(true);
    setMessage('status', 'Завантаження телефонів…');
    try {
        phones = validatePhones(await requestJson('/phones'));
        loaded = true;
        updateBrands();
        renderPhones();
        setMessage('status', `Дані завантажено. Телефонів у каталозі: ${phones.length}.`, 'ok');
    } catch (error) {
        setMessage('status', errorMessage(error), 'error');
    } finally {
        setBusy(false);
    }
}

function readPhone() {
    const model = document.getElementById('modelInput');
    const brand = document.getElementById('brandInput');
    model.setCustomValidity(model.value.trim() ? '' : 'Введіть назву моделі.');
    brand.setCustomValidity(brand.value.trim() ? '' : 'Введіть виробника.');
    if (!document.getElementById('phoneForm').reportValidity()) {
        return null;
    }

    const memory = Number(document.getElementById('memoryInput').value);
    const price = document.getElementById('priceInput').valueAsNumber;
    if (!MEMORY_OPTIONS.includes(memory) || !Number.isFinite(price) || price <= 0 || price > 9999999.99) {
        return null;
    }
    return { model: model.value.trim(), brand: brand.value.trim(), memory_gb: memory, price };
}

function startEditing(phone) {
    if (busy) {
        return;
    }
    document.getElementById('phoneId').value = phone.id;
    document.getElementById('modelInput').value = phone.model;
    document.getElementById('brandInput').value = phone.brand;
    document.getElementById('memoryInput').value = phone.memory_gb;
    document.getElementById('priceInput').value = phone.price;
    document.getElementById('formHeading').textContent = 'Редагувати телефон';
    document.getElementById('addButton').textContent = 'Зберегти зміни';
    document.getElementById('cancelEditButton').hidden = false;
    document.querySelectorAll('#phoneForm input').forEach(input => input.setCustomValidity(''));
    setMessage('formStatus', `Редагування: ${phone.brand} ${phone.model}.`);
    document.getElementById('modelInput').focus();
}

function resetPhoneForm() {
    document.getElementById('phoneForm').reset();
    document.getElementById('phoneId').value = '';
    document.getElementById('formHeading').textContent = 'Додати телефон';
    document.getElementById('addButton').textContent = 'Додати телефон';
    document.getElementById('cancelEditButton').hidden = true;
    document.querySelectorAll('#phoneForm input').forEach(input => input.setCustomValidity(''));
}

async function savePhone(event) {
    event.preventDefault();
    if (busy || !loaded) {
        return;
    }
    const phone = readPhone();
    if (!phone) {
        return;
    }
    const id = Number(document.getElementById('phoneId').value) || null;
    setBusy(true);
    setMessage('formStatus', 'Збереження телефону…');
    try {
        const data = await requestJson(id ? `/phones/${id}` : '/phones', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(phone)
        });
        const saved = validatePhones([data])[0];
        phones = [...phones.filter(current => current.id !== saved.id), saved];
        resetPhoneForm();
        document.getElementById('searchInput').value = '';
        document.getElementById('brandFilter').value = '';
        updateBrands();
        renderPhones();
        setMessage('formStatus', id ? 'Зміни збережено у MySQL.' : 'Телефон додано до MySQL.', 'ok');
        setMessage('status', `Телефонів у каталозі: ${phones.length}.`, 'ok');
    } catch (error) {
        setMessage('formStatus', errorMessage(error), 'error');
    } finally {
        setBusy(false);
    }
}

async function deletePhone(phone) {
    if (busy || !confirm(`Видалити ${phone.brand} ${phone.model}, ${phone.memory_gb} ГБ?`)) {
        return;
    }
    setBusy(true);
    setMessage('status', 'Видалення телефону…');
    try {
        await requestJson(`/phones/${phone.id}`, { method: 'DELETE' });
        phones = phones.filter(current => current.id !== phone.id);
        if (Number(document.getElementById('phoneId').value) === phone.id) {
            resetPhoneForm();
            setMessage('formStatus', '');
        }
        updateBrands();
        renderPhones();
        setMessage('status', 'Телефон видалено з MySQL.', 'ok');
    } catch (error) {
        setMessage('status', errorMessage(error), 'error');
    } finally {
        setBusy(false);
    }
}

function init() {
    if (location.protocol === 'file:') {
        setMessage('status', 'Запустіть npm start у папці lab17 та відкрийте http://127.0.0.1:3003/.', 'error');
        return;
    }
    document.getElementById('phoneForm').addEventListener('submit', savePhone);
    document.getElementById('refreshButton').addEventListener('click', loadPhones);
    document.getElementById('searchInput').addEventListener('input', renderPhones);
    document.getElementById('brandFilter').addEventListener('change', renderPhones);
    document.getElementById('sortSelect').addEventListener('change', renderPhones);
    document.getElementById('cancelEditButton').addEventListener('click', () => {
        resetPhoneForm();
        setMessage('formStatus', '');
    });
    document.querySelectorAll('#phoneForm input').forEach(input => {
        input.addEventListener('input', () => input.setCustomValidity(''));
    });
    loadPhones();
}

document.addEventListener('DOMContentLoaded', init);
