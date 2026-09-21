document.addEventListener('DOMContentLoaded', () => {

    const task1Btn = document.getElementById('task1Btn');
    const task1Output = document.getElementById('task1Output');

    function calculate() {
        let result = 10;
        console.log('Result outside if (перед блоком):', result);

        if (true) {
            let result = 25;
            console.log('Result inside if (локальний, блочна область):', result);
        }

        console.log('Result outside if (після блоку, не змінився):', result);

        task1Output.innerHTML = `
            <p>Результат <strong>result</strong> всередині <code>if</code>: <strong>25</strong></p>
            <p>Результат <strong>result</strong> поза блоком <code>if</code>: <strong>10</strong></p>
            <p style="color:#7f8c8d;">Змінна всередині if — окрема, блочна (let), не впливає на зовнішню.</p>
        `;
    }

    task1Btn.addEventListener('click', calculate);


    const task2Btn = document.getElementById('task2Btn');
    const task2Output = document.getElementById('task2Output');

    const secretNumber = 7 % 10;

    task2Btn.addEventListener('click', () => {
        const input = prompt('Введіть число від 0 до 9:');
        if (input === null) {
            return;
        }
        const guess = Number(input);

        if (guess === secretNumber) {
            alert('Correct!');
            task2Output.innerHTML = `<p class="correct">Correct! Ви ввели ${guess}, і це збіглося з secretNumber.</p>`;
        } else {
            alert('Wrong!');
            task2Output.innerHTML = `<p class="wrong">Wrong! Ви ввели ${guess}, secretNumber було іншим.</p>`;
        }
    });

   
    
    const task3Btn = document.getElementById('task3Btn');
    const task3Output = document.getElementById('task3Output');

    task3Btn.addEventListener('click', () => {
        const name = prompt('Введіть ваше ім’я:');
        if (name === null) return;

        const num1 = Number(prompt('Введіть перше число:'));
        const num2 = Number(prompt('Введіть друге число:'));
        const sum = num1 + num2;

        const message = 'Hello, ' + name + '! The sum of ' + num1 + ' and ' + num2 + ' is ' + sum;

        console.log(message);
        task3Output.innerHTML = `<p>${message}</p>`;
    });

});