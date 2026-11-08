const PHONE_FIELDS = 'id, model, brand, memory_gb, price, created_at';
const MEMORY_OPTIONS = [32, 64, 128, 256, 512, 1024];

let db = null;
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
    document.getElementById('refreshButton').disabled = value || !db;
    document.getElementById('catalogSection').setAttribute('aria-busy', String(value));
    updateControls();
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
        if (isAdmin) {
            const actions = document.createElement('td');
            const controls = document.createElement('div');
            controls.className = 'row-actions';
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.textContent = 'Редагувати';
            edit.setAttribute('aria-label', `Редагувати: ${phone.brand} ${phone.model}`);
            edit.disabled = busy || authBusy || authChecking;
            edit.addEventListener('click', () => startEditing(phone));
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'delete-button';
            remove.textContent = 'Видалити';
            remove.setAttribute('aria-label', `Видалити: ${phone.brand} ${phone.model}`);
            remove.disabled = busy || authBusy || authChecking;
            remove.addEventListener('click', () => deletePhone(phone));
            controls.append(edit, remove);
            actions.appendChild(controls);
            row.appendChild(actions);
        }
        return row;
    });

    document.getElementById('phoneList').replaceChildren(...rows);
    document.getElementById('phonesTable').hidden = visible.length === 0;
    document.getElementById('resultCount').textContent = loaded ? `Показано: ${visible.length} із ${phones.length}` : '';

    const empty = document.getElementById('emptyMessage');
    empty.hidden = !loaded || visible.length !== 0;
    empty.textContent = phones.length === 0 ? 'У базі даних ще немає телефонів.' : 'За вашим запитом телефонів не знайдено.';
}

function errorMessage(error, action) {
    if (error?.message === 'ADMIN_REQUIRED') {
        return 'Права адміністратора не підтверджено. Увійдіть повторно або перевірте призначену роль.';
    }
    const code = String(error?.code || '');
    if (code === 'PGRST116') {
        return 'Запис уже змінено або видалено, чи доступ до операції відкликано. Оновіть каталог.';
    }
    if (code === '23505') {
        return 'Телефон із такою моделлю, виробником і пам’яттю вже є в каталозі.';
    }
    if (code === '42501') {
        return 'Операцію заборонено. Перевірте права доступу та політики RLS для таблиці phones.';
    }
    if (code === '42P01' || code === 'PGRST205') {
        return 'Таблицю phones не знайдено. Спочатку виконайте schema.sql із ЛР12, потім schema_lr15.sql.';
    }
    if (code === '23514' || code === '23502' || code === '22003') {
        return 'Перевірте дані: модель, виробник, обсяг пам’яті та додатна ціна мають бути коректними.';
    }
    if (String(error?.message || '').toLowerCase().includes('api key')) {
        return 'Публічний ключ Supabase не прийнято. Перевірте налаштування підключення.';
    }
    return `Не вдалося ${action}. Перевірте інтернет-з’єднання та доступність проєкту Supabase.`;
}

async function loadPhones() {
    if (!db || busy) {
        return;
    }
    setBusy(true);
    setMessage('status', 'Завантаження телефонів…');

    try {
        const { data, error } = await db.from('phones').select(PHONE_FIELDS).order('id', { ascending: false });
        if (error) {
            throw error;
        }
        phones = validatePhones(data);
        loaded = true;
        updateBrands();
        renderPhones();
        setMessage('status', `Дані завантажено. Телефонів у каталозі: ${phones.length}.`, 'ok');
    } catch (error) {
        setMessage('status', errorMessage(error, 'завантажити телефони'), 'error');
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
    if (!isAdmin || busy || authBusy || authChecking) {
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

async function savePhone(event) {
    event.preventDefault();
    if (!db || !isAdmin || busy || authBusy || authChecking) {
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
        await ensureAdmin();
        const query = id ? db.from('phones').update(phone).eq('id', id) : db.from('phones').insert(phone);
        const { data, error } = await query.select(PHONE_FIELDS).single();
        if (error) {
            throw error;
        }
        const saved = validatePhones([data])[0];
        phones = [...phones.filter(current => current.id !== saved.id), saved];
        loaded = true;
        resetPhoneForm();
        document.getElementById('searchInput').value = '';
        document.getElementById('brandFilter').value = '';
        updateBrands();
        renderPhones();
        setMessage('formStatus', id ? 'Зміни збережено у базі даних.' : 'Телефон додано до бази даних.', 'ok');
        setMessage('status', `Телефонів у каталозі: ${phones.length}.`, 'ok');
    } catch (error) {
        setMessage(isAdmin ? 'formStatus' : 'authStatus', errorMessage(error, 'зберегти телефон'), 'error');
    } finally {
        setBusy(false);
    }
}

async function deletePhone(phone) {
    if (!db || !isAdmin || busy || authBusy || authChecking || !confirm(`Видалити ${phone.brand} ${phone.model}, ${phone.memory_gb} ГБ?`)) {
        return;
    }
    setBusy(true);
    setMessage('status', 'Видалення телефону…');
    try {
        await ensureAdmin();
        const { data, error } = await db.from('phones').delete().eq('id', phone.id).select('id').single();
        if (error || !data) {
            throw error || new Error('ADMIN_REQUIRED');
        }
        phones = phones.filter(current => current.id !== phone.id);
        if (Number(document.getElementById('phoneId').value) === phone.id) {
            resetPhoneForm();
            setMessage('formStatus', '');
        }
        updateBrands();
        renderPhones();
        setMessage('status', 'Телефон видалено з бази даних.', 'ok');
    } catch (error) {
        setMessage('status', errorMessage(error, 'видалити телефон'), 'error');
    } finally {
        setBusy(false);
    }
}

function init() {
    document.getElementById('phoneForm').addEventListener('submit', savePhone);
    document.getElementById('refreshButton').addEventListener('click', async () => {
        await refreshAuth();
        await loadPhones();
    });
    document.getElementById('cancelEditButton').addEventListener('click', () => {
        resetPhoneForm();
        setMessage('formStatus', '');
    });
    document.getElementById('searchInput').addEventListener('input', renderPhones);
    document.getElementById('brandFilter').addEventListener('change', renderPhones);
    document.getElementById('sortSelect').addEventListener('change', renderPhones);
    document.querySelectorAll('#phoneForm input').forEach(input => {
        input.addEventListener('input', () => input.setCustomValidity(''));
    });

    if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.publishableKey) {
        setMessage('status', 'Підключення до бази даних ще не налаштовано.', 'error');
        return;
    }

    if (!SUPABASE_CONFIG.publishableKey.startsWith('sb_publishable_')) {
        setMessage('status', 'Для браузера потрібен публічний Publishable key Supabase.', 'error');
        return;
    }

    if (!window.supabase?.createClient) {
        setMessage('status', 'Не вдалося завантажити бібліотеку Supabase.', 'error');
        return;
    }

    try {
        const url = new URL(SUPABASE_CONFIG.url);
        if (url.protocol !== 'https:') {
            throw new Error('Некоректна адреса проєкту');
        }
        db = supabase.createClient(url.href, SUPABASE_CONFIG.publishableKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'lab15.auth' },
            global: {
                fetch: (input, options = {}) => fetch(input, {
                    ...options,
                    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)
                })
            }
        });
        initAuth();
        loadPhones();
    } catch {
        db = null;
        setMessage('status', 'Не вдалося підключитися. Перевірте Project URL та публічний ключ Supabase.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', init);
