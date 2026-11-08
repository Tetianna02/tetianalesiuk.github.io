const LANGUAGE_KEY = 'lab14.language';
let i18nReady = false;

function readLanguage() {
    try {
        const value = localStorage.getItem(LANGUAGE_KEY);
        return ['uk', 'en'].includes(value) ? value : null;
    } catch {
        return null;
    }
}

function saveLanguage() {
    try {
        localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    } catch {
        showNotice('languageStorageError');
    }
}

async function loadTranslations() {
    const languages = ['uk', 'en'];
    const dictionaries = await Promise.all(languages.map(language => readJson(`${I18N_SETTINGS.localesBase}${language}.json`)));
    const keys = Object.keys(dictionaries[0]);
    if (!keys.length || dictionaries.some(dictionary => !dictionary ||
        Object.keys(dictionary).length !== keys.length ||
        keys.some(key => typeof dictionary[key] !== 'string' || !dictionary[key].trim()))) {
        throw new Error('Invalid translations');
    }

    languages.forEach((language, index) => {
        translations[language] = dictionaries[index];
    });
}

function chooseLanguage() {
    return new Promise(resolve => {
        const dialog = document.getElementById('languageDialog');
        dialog.oncancel = event => event.preventDefault();
        dialog.querySelectorAll('[data-language]').forEach(button => {
            button.onclick = () => {
                dialog.close();
                resolve(button.dataset.language);
            };
        });
        dialog.showModal();
    });
}

async function updateLanguage(language) {
    if (!['uk', 'en'].includes(language)) {
        return;
    }
    const select = document.getElementById('languageSelect');
    select.disabled = true;

    try {
        await I18N_ENGINE.changeLanguage(language);
        currentLanguage = language;
        applyTranslations();
        renderCatalog();
        renderCart();
        if (document.getElementById('shopDialog').open && renderOpenDialog) {
            renderOpenDialog();
        }
        saveLanguage();
    } catch {
        showNotice('languageError');
    } finally {
        select.value = currentLanguage;
        select.disabled = false;
    }
}

async function init() {
    const status = document.getElementById('loadStatus');
    try {
        currentLanguage = readLanguage() || await chooseLanguage();
        document.documentElement.lang = currentLanguage;
        saveLanguage();
        status.textContent = currentLanguage === 'uk' ? 'Завантаження…' : 'Loading…';
        await loadTranslations();
        await I18N_ENGINE.init(translations, currentLanguage);
        i18nReady = true;
        document.getElementById('languageSelect').value = currentLanguage;
        applyTranslations();
        await startShop({
            storageKey: 'lab14.phones.cart',
            loadCatalog: fetchCatalog
        });
        document.getElementById('shop').hidden = false;
        saveLanguage();
        document.getElementById('languageSelect').onchange = event => updateLanguage(event.target.value);
    } catch {
        const message = currentLanguage === 'uk' ? 'Не вдалося завантажити переклади.' : 'Could not load translations.';
        const retry = createElement('button', '', currentLanguage === 'uk' ? 'Повторити' : 'Retry');
        retry.type = 'button';
        retry.onclick = () => {
            retry.disabled = true;
            init();
        };
        status.hidden = false;
        status.replaceChildren(document.createTextNode(`${message} `), retry);
    }
}
