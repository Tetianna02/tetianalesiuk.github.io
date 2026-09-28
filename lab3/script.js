document.addEventListener('DOMContentLoaded', () => {

    function* randomGenerator(min, max) {
        while (true) {
            yield Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    let min = Number(prompt('Введіть мінімальну межу для випадкового числа:', '1'));
    let max = Number(prompt('Введіть максимальну межу для випадкового числа:', '100'));

    if (isNaN(min) || isNaN(max)) {
        min = 1;
        max = 100;
    }

    const numberGen = randomGenerator(min, max);
    const nextBtn = document.getElementById('next');
    const out = document.getElementById('out');

    nextBtn.addEventListener('click', () => {
        const value = numberGen.next().value;
        out.textContent = `Випадкове число (${min}–${max}): ${value}`;
    });

    
    function* passwordGenerator() {
        let password = '';
        while (true) {
            const char = yield;
            if (char === 'done') {
                return password;
            }
            password += char;
        }
    }

    const passwordBtn = document.getElementById('passwordBtn');
    const passwordOutput = document.getElementById('passwordOutput');

    passwordBtn.addEventListener('click', () => {
        const gen = passwordGenerator();
        gen.next(); 

        let input = prompt('Введіть символ пароля (або напишіть "done", щоб завершити):');

        while (input !== null && input !== 'done') {
            gen.next(input);
            input = prompt('Введіть наступний символ (або "done"):');
        }

        const result = gen.next('done');
        passwordOutput.textContent = `Ваш пароль: ${result.value}`;
    });


    function* chatBot() {
        const name = yield 'Hi! What is your name?';
        const mood = yield `Nice to meet you, ${name}! How are you?`;
        yield 'Goodbye!';
    }

    const chatBtn = document.getElementById('chatBtn');
    const chatOutput = document.getElementById('chatOutput');

    chatBtn.addEventListener('click', () => {
        const bot = chatBot();
        let log = '';

        let step = bot.next();
        let answer = prompt(step.value);
        log += `Bot: ${step.value}\nYou: ${answer}\n`;

        step = bot.next(answer);
        answer = prompt(step.value);
        log += `Bot: ${step.value}\nYou: ${answer}\n`;

        step = bot.next(answer);
        log += `Bot: ${step.value}`;

        chatOutput.textContent = log;
    });

    
    const helloBtn = document.getElementById('hello');
    const helloOutput = document.getElementById('helloOutput');

    const userName = prompt('Введіть ваше ім’я:', 'Тетяна');

    const user = {
        name: userName || 'Гість',
        say() {
            helloOutput.textContent = `Hello, ${this.name}`;
        }
    };

    helloBtn.addEventListener('click', user.say.bind(user));

});