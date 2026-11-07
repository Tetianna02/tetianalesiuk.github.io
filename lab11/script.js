const REQUEST_URL = 'https://semegenkep.github.io/json/example.json';

let header;
let section;
let status;

function populateHeader(superHeroes) {
    const heading = document.createElement('h1');
    heading.textContent = superHeroes.squadName;

    const description = document.createElement('p');
    description.textContent = `Hometown: ${superHeroes.homeTown} // Formed: ${superHeroes.formed}`;
    header.replaceChildren(heading, description);
}

function showHeroes(superHeroes) {
    const cards = superHeroes.members.map(hero => {
        const article = document.createElement('article');
        const heading = document.createElement('h2');
        heading.textContent = hero.name;

        const identity = document.createElement('p');
        identity.textContent = `Secret identity: ${hero.secretIdentity}`;

        const age = document.createElement('p');
        age.textContent = `Age: ${hero.age}`;

        const label = document.createElement('p');
        label.textContent = 'Superpowers:';

        const powers = document.createElement('ul');
        hero.powers.forEach(power => {
            const item = document.createElement('li');
            item.textContent = power;
            powers.appendChild(item);
        });

        article.append(heading, identity, age, label, powers);
        return article;
    });

    section.replaceChildren(...cards);
}

function isValidSquad(data) {
    return data && typeof data.squadName === 'string' &&
        typeof data.homeTown === 'string' && Number.isInteger(data.formed) &&
        Array.isArray(data.members) && data.members.every(hero =>
            hero && typeof hero.name === 'string' &&
            typeof hero.secretIdentity === 'string' &&
            Number.isFinite(hero.age) && Array.isArray(hero.powers) &&
            hero.powers.every(power => typeof power === 'string')
        );
}

function showError(message) {
    const text = document.createElement('p');
    text.textContent = message;

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Повторити запит';
    retry.addEventListener('click', () => loadHeroes(REQUEST_URL));

    const local = document.createElement('button');
    local.type = 'button';
    local.textContent = 'Завантажити локальну копію';
    local.addEventListener('click', () => loadHeroes('example.json'));

    status.replaceChildren(text, retry, local);
    status.hidden = false;
}

function loadHeroes(url) {
    status.hidden = false;
    status.textContent = 'Завантаження…';
    section.setAttribute('aria-busy', 'true');

    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.timeout = 15000;

    request.onload = () => {
        if (request.status < 200 || request.status >= 300 || !isValidSquad(request.response)) {
            showError('Не вдалося отримати коректні дані супергероїв.');
            return;
        }

        populateHeader(request.response);
        showHeroes(request.response);
        status.textContent = url === REQUEST_URL ? '' : 'Завантажено локальну копію даних.';
        status.hidden = url === REQUEST_URL;
    };
    request.onerror = () => showError('Помилка мережі. Перевірте з’єднання та повторіть запит.');
    request.ontimeout = () => showError('Час очікування відповіді вичерпано.');
    request.onloadend = () => section.setAttribute('aria-busy', 'false');
    request.send();
}

function init() {
    header = document.querySelector('header');
    section = document.querySelector('section');
    status = document.createElement('div');
    status.className = 'status';
    status.setAttribute('role', 'status');
    header.after(status);
    loadHeroes(REQUEST_URL);
}

document.addEventListener('DOMContentLoaded', init);
