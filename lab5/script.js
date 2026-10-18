let imagesArray = [
    {
        path: 'images/iphone-15.jpg',
        title: 'iPhone 15',
        description: 'Смартфон Apple з екраном 6,1 дюйма'
    },
    {
        path: 'images/Samsung-gl-s24.jpg',
        title: 'Samsung Galaxy S24',
        description: 'Флагманський смартфон Samsung'
    },
    {
        path: 'images/Xiaomi-14.jpg',
        title: 'Xiaomi 14',
        description: 'Компактний смартфон з камерою Leica'
    },
    {
        path: 'images/Google-px-8.jpg',
        title: 'Google Pixel 8',
        description: 'Смартфон Google з чистим Android'
    },
    {
        path: 'images/nokia-G4.png',
        title: 'Nokia G42',
        description: 'Бюджетний смартфон з міцним корпусом'
    }
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}

function formatScore(correct, total) {
    const percent = total === 0 ? 0 : Math.round(correct / total * 100);
    return 'Загальний рахунок ' + percent + '% (' + correct + ' правильних відповідей з ' + total + ')';
}

function setMessage(element, text, type) {
    element.textContent = text;
    element.className = type ? 'message ' + type : 'message';
}

function clearMessage(element) {
    element.textContent = '';
    element.className = 'message';
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

function fahrenheitToCelsius(fahrenheit) {
    return 5 / 9 * (fahrenheit - 32);
}

function celsiusToFahrenheit(celsius) {
    return celsius * 9 / 5 + 32;
}

function formatTemperature(value) {
    return String(Math.round(value * 100) / 100);
}

function readNumber(text) {
    const clean = text.trim().replace(',', '.');
    if (clean === '') {
        return null;
    }
    const value = Number(clean);
    return isNaN(value) ? null : value;
}

function initTemperature() {
    const fahrenheitInput = document.getElementById('fahrenheitInput');
    const celsiusInput = document.getElementById('celsiusInput');

    function handleFahrenheitChange() {
        const fahrenheit = readNumber(fahrenheitInput.value);
        if (fahrenheit === null) {
            celsiusInput.value = '';
            return;
        }
        celsiusInput.value = formatTemperature(fahrenheitToCelsius(fahrenheit));
    }

    function handleCelsiusChange() {
        const celsius = readNumber(celsiusInput.value);
        if (celsius === null) {
            fahrenheitInput.value = '';
            return;
        }
        fahrenheitInput.value = formatTemperature(celsiusToFahrenheit(celsius));
    }

    fahrenheitInput.addEventListener('input', handleFahrenheitChange);
    celsiusInput.addEventListener('input', handleCelsiusChange);
}

function initMultiplication() {
    const scoreBox = document.getElementById('score2');
    const nextBtn = document.getElementById('next2');
    const taskBox = document.getElementById('task2');
    const answerInput = document.getElementById('answer2');
    const checkBtn = document.getElementById('check2');
    const resultBox = document.getElementById('result2');

    let correctCount = 0;
    let totalCount = 0;
    let first = 0;
    let second = 0;
    let answered = false;

    function showScore() {
        scoreBox.textContent = formatScore(correctCount, totalCount);
    }

    function nextTask() {
        first = randomInt(2, 9);
        second = randomInt(2, 9);
        answered = false;
        taskBox.textContent = first + ' × ' + second + ' =';
        answerInput.value = '';
        answerInput.disabled = false;
        checkBtn.disabled = false;
        clearMessage(resultBox);
        answerInput.focus();
    }

    function checkAnswer() {
        if (answered) {
            return;
        }

        const answer = readNumber(answerInput.value);
        if (answer === null) {
            setMessage(resultBox, 'Введіть число', 'error');
            return;
        }

        const right = first * second;
        totalCount++;
        if (answer === right) {
            correctCount++;
            setMessage(resultBox, 'Правильно', 'ok');
        } else {
            setMessage(resultBox, 'Помилка, правильна відповідь «' + right + '»', 'error');
        }

        answered = true;
        answerInput.disabled = true;
        checkBtn.disabled = true;
        showScore();
    }

    nextBtn.addEventListener('click', nextTask);
    checkBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    showScore();
    nextTask();
}

function initMultiplicationRadio() {
    const scoreBox = document.getElementById('score3');
    const nextBtn = document.getElementById('next3');
    const taskBox = document.getElementById('task3');
    const optionsBox = document.getElementById('options3');
    const resultBox = document.getElementById('result3');

    let correctCount = 0;
    let totalCount = 0;
    let right = 0;

    function showScore() {
        scoreBox.textContent = formatScore(correctCount, totalCount);
    }

    function createOptions(correct) {
        const values = [correct];
        while (values.length < 4) {
            const candidate = Math.random() < 0.5
                ? correct + randomInt(-10, 10)
                : randomInt(2, 9) * randomInt(2, 9);
            if (candidate > 0 && !values.includes(candidate)) {
                values.push(candidate);
            }
        }
        return shuffle(values);
    }

    function checkAnswer(value) {
        totalCount++;
        if (value === right) {
            correctCount++;
            setMessage(resultBox, 'Правильно', 'ok');
        } else {
            setMessage(resultBox, 'Помилка, правильна відповідь «' + right + '»', 'error');
        }

        optionsBox.querySelectorAll('input').forEach(radio => {
            radio.disabled = true;
        });
        showScore();
    }

    function nextTask() {
        const first = randomInt(2, 9);
        const second = randomInt(2, 9);
        right = first * second;
        taskBox.textContent = first + ' × ' + second + ' =';
        clearMessage(resultBox);
        optionsBox.innerHTML = '';

        createOptions(right).forEach(value => {
            const label = createElement('label', 'option');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'answer3';
            radio.value = value;
            radio.addEventListener('change', () => checkAnswer(value));
            label.append(radio, ' ' + value);
            optionsBox.appendChild(label);
        });
    }

    nextBtn.addEventListener('click', nextTask);

    showScore();
    nextTask();
}

function initPhotoRotator(containerId, images) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const rotator = createElement('div', 'rotator');
    const counter = createElement('div', 'rotator-counter');
    const prevLink = createElement('a', 'rotator-link rotator-prev', 'Назад');
    const frame = createElement('div', 'rotator-frame');
    const image = document.createElement('img');
    const nextLink = createElement('a', 'rotator-link rotator-next', 'Вперед');
    const caption = createElement('div', 'rotator-caption');
    const title = createElement('div', 'rotator-title');
    const description = createElement('div', 'rotator-description');

    prevLink.href = '#';
    nextLink.href = '#';

    frame.appendChild(image);
    caption.append(title, description);
    rotator.append(counter, prevLink, frame, nextLink, caption);
    container.appendChild(rotator);

    let index = 0;

    function showImage() {
        const current = images[index];
        image.src = current.path;
        image.alt = current.title;
        counter.textContent = 'Фотографія ' + (index + 1) + ' з ' + images.length;
        title.textContent = current.title;
        description.textContent = current.description;
        prevLink.style.visibility = index === 0 ? 'hidden' : 'visible';
        nextLink.style.visibility = index === images.length - 1 ? 'hidden' : 'visible';
    }

    prevLink.addEventListener('click', event => {
        event.preventDefault();
        if (index > 0) {
            index--;
            showImage();
        }
    });

    nextLink.addEventListener('click', event => {
        event.preventDefault();
        if (index < images.length - 1) {
            index++;
            showImage();
        }
    });

    showImage();
}

const digitPatterns = {
    0: ['111', '101', '101', '101', '111'],
    1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'],
    5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'],
    7: ['111', '001', '001', '001', '001'],
    8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111']
};

function initCaptcha(containerId, length) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const label = createElement('div', 'task-text', 'Введіть число');
    const display = createElement('div', 'captcha-display');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'captcha-input';
    input.maxLength = length;

    const controls = createElement('div', 'controls');
    const checkBtn = createElement('button', '', 'Перевірити');
    const refreshBtn = createElement('button', '', 'Нова капча');
    controls.append(checkBtn, refreshBtn);

    const resultBox = createElement('div', 'message');

    container.append(label, display, input, controls, resultBox);

    let code = '';

    function createDigit(digit) {
        const box = createElement('div', 'captcha-digit');
        digitPatterns[digit].forEach(row => {
            row.split('').forEach(cell => {
                const pixel = createElement('span', cell === '1' ? 'pixel pixel-on' : 'pixel');
                box.appendChild(pixel);
            });
        });
        return box;
    }

    function generateCode() {
        code = '';
        for (let i = 0; i < length; i++) {
            code += randomInt(i === 0 ? 1 : 0, 9);
        }

        display.innerHTML = '';
        code.split('').forEach(digit => {
            display.appendChild(createDigit(digit));
        });

        input.value = '';
        clearMessage(resultBox);
    }

    function checkCode() {
        const value = input.value.trim();
        if (value === '') {
            setMessage(resultBox, 'Введіть число', 'error');
            return;
        }

        if (value === code) {
            setMessage(resultBox, 'Число введено правильно', 'ok');
        } else {
            setMessage(resultBox, 'Помилка', 'error');
        }
    }

    checkBtn.addEventListener('click', checkCode);
    refreshBtn.addEventListener('click', generateCode);
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            checkCode();
        }
    });

    generateCode();
}

initTemperature();
initMultiplication();
initMultiplicationRadio();
initPhotoRotator('rotator', imagesArray);
initCaptcha('captcha', 5);