let currentUser = null;
let isAdmin = false;
let authBusy = false;
let authChecking = true;
let authVersion = 0;
let authTimer = null;

function resetPhoneForm() {
    document.getElementById('phoneForm').reset();
    document.getElementById('phoneId').value = '';
    document.getElementById('formHeading').textContent = 'Додати телефон';
    document.getElementById('addButton').textContent = 'Додати телефон';
    document.getElementById('cancelEditButton').hidden = true;
    document.querySelectorAll('#phoneForm input').forEach(input => input.setCustomValidity(''));
}

function updateControls() {
    document.querySelectorAll('#authForms input, #authForms button').forEach(element => {
        element.disabled = !db || busy || authBusy || authChecking;
    });
    document.getElementById('logoutButton').disabled = !db || authBusy || authChecking || busy;
    document.getElementById('refreshButton').disabled = !db || busy || authBusy || authChecking;
    document.getElementById('phoneFields').disabled = !db || !isAdmin || busy || authBusy || authChecking;
    document.querySelectorAll('.row-actions button').forEach(button => {
        button.disabled = !isAdmin || busy || authBusy || authChecking;
    });
}

function setAdminState(value) {
    isAdmin = value === true;
    document.getElementById('adminPanel').hidden = !isAdmin;
    document.getElementById('actionsHeading').hidden = !isAdmin;
    if (!isAdmin) {
        resetPhoneForm();
        setMessage('formStatus', '');
    }
    renderPhones();
    updateControls();
}

function authErrorMessage(error) {
    const code = error?.code;
    if (code === 'invalid_credentials') {
        return 'Неправильна електронна адреса або пароль.';
    }
    if (code === 'email_not_confirmed') {
        return 'Підтвердьте електронну адресу за посиланням у листі.';
    }
    if (code === 'user_already_exists') {
        return 'Обліковий запис із такою адресою вже існує. Виконайте вхід.';
    }
    if (code === 'weak_password') {
        return 'Пароль не відповідає вимогам проєкту. Використайте довший і складніший пароль.';
    }
    if (code === 'signup_disabled') {
        return 'Реєстрацію вимкнено в налаштуваннях Supabase Authentication.';
    }
    if (error?.status === 429 || String(code).includes('rate_limit')) {
        return 'Забагато спроб. Зачекайте й повторіть дію.';
    }
    return 'Не вдалося виконати дію. Перевірте введені дані, з’єднання та налаштування Authentication.';
}

async function refreshAuth() {
    const version = ++authVersion;
    authChecking = true;
    currentUser = null;
    setAdminState(false);
    document.getElementById('authForms').hidden = true;
    document.getElementById('userPanel').hidden = true;
    setMessage('authStatus', 'Перевірка поточного користувача…');

    try {
        const { data, error } = await db.auth.getUser();
        if (version !== authVersion) {
            return;
        }
        if (error && error.name !== 'AuthSessionMissingError' && error.code !== 'session_not_found') {
            throw error;
        }
        currentUser = data?.user || null;
        if (!currentUser) {
            document.getElementById('authForms').hidden = false;
            setMessage('authStatus', 'Ви переглядаєте каталог як гість.');
            return;
        }

        document.getElementById('userInfo').textContent = `Користувач: ${currentUser.email}`;
        document.getElementById('userPanel').hidden = false;
        const { data: role, error: roleError } = await db.rpc('check_admin');
        if (version !== authVersion) {
            return;
        }
        if (roleError || typeof role !== 'boolean') {
            setMessage('authStatus', 'Вхід виконано, але права адміністратора не підтверджено. Перевірте виконання schema_lr15.sql.', 'error');
            return;
        }
        setAdminState(role);
        setMessage('authStatus', role ? 'Виконано вхід адміністратора.' : 'Виконано вхід користувача. Доступний перегляд каталогу.', 'ok');
    } catch (error) {
        if (version === authVersion) {
            currentUser = null;
            document.getElementById('authForms').hidden = false;
            document.getElementById('userPanel').hidden = true;
            setMessage('authStatus', authErrorMessage(error), 'error');
        }
    } finally {
        if (version === authVersion) {
            authChecking = false;
            updateControls();
        }
    }
}

async function ensureAdmin() {
    const { data, error } = await db.auth.getUser();
    const version = authVersion;
    if (error || !data?.user || data.user.id !== currentUser?.id) {
        setAdminState(false);
        throw new Error('ADMIN_REQUIRED');
    }
    const result = await db.rpc('check_admin');
    if (result.error || result.data !== true || version !== authVersion) {
        setAdminState(false);
        throw new Error('ADMIN_REQUIRED');
    }
}

async function submitAuth(event, register) {
    event.preventDefault();
    if (!db || authBusy || authChecking || busy) {
        return;
    }
    const form = event.currentTarget;
    if (!form.reportValidity()) {
        return;
    }
    const prefix = register ? 'register' : 'login';
    const email = document.getElementById(`${prefix}Email`).value.trim();
    const password = document.getElementById(`${prefix}Password`).value;
    authBusy = true;
    updateControls();
    setMessage('authStatus', register ? 'Реєстрація…' : 'Виконується вхід…');

    try {
        const result = register
            ? await db.auth.signUp({ email, password })
            : await db.auth.signInWithPassword({ email, password });
        if (result.error) {
            throw result.error;
        }
        form.reset();
        if (register && !result.data.session) {
            setMessage('authStatus', 'Перевірте пошту для підтвердження реєстрації, а потім увійдіть. Якщо адреса вже зареєстрована, скористайтеся формою входу.', 'ok');
        } else {
            await refreshAuth();
            await loadPhones();
        }
    } catch (error) {
        setMessage('authStatus', authErrorMessage(error), 'error');
    } finally {
        authBusy = false;
        updateControls();
    }
}

async function logout() {
    if (!db || authBusy || busy) {
        return;
    }
    authBusy = true;
    authVersion++;
    setAdminState(false);
    setMessage('authStatus', 'Завершення сеансу…');
    try {
        const { error } = await db.auth.signOut();
        if (error) {
            throw error;
        }
        await refreshAuth();
        await loadPhones();
    } catch (error) {
        setMessage('authStatus', authErrorMessage(error), 'error');
    } finally {
        authBusy = false;
        updateControls();
    }
}

function initAuth() {
    document.getElementById('registerForm').addEventListener('submit', event => submitAuth(event, true));
    document.getElementById('loginForm').addEventListener('submit', event => submitAuth(event, false));
    document.getElementById('logoutButton').addEventListener('click', logout);
    db.auth.onAuthStateChange(() => {
        authVersion++;
        authChecking = true;
        setAdminState(false);
        clearTimeout(authTimer);
        authTimer = setTimeout(() => refreshAuth(), 0);
    });
    refreshAuth();
}
