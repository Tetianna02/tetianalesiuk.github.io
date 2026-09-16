const MY_NAME = "Тетяна";
const MY_SURNAME = "Лесюк";

document.addEventListener('DOMContentLoaded', () => {

    let userName = prompt('Введіть своє ім’я:', MY_NAME);
    if (!userName || userName.trim() === '') {
        userName = MY_NAME;
    }
    userName = userName.trim();

    let userSurname = prompt('Введіть своє прізвище:', MY_SURNAME);
    if (!userSurname || userSurname.trim() === '') {
        userSurname = MY_SURNAME;
    }
    userSurname = userSurname.trim();

    document.getElementById('nameDisplay').textContent = userName;
    document.getElementById('surnameDisplay').textContent = userSurname;

    const nameLetters = userName.split('');
    const ul = document.getElementById('nameList');
    
    nameLetters.forEach(letter => {
        const li = document.createElement('li');
        li.textContent = letter;
        li.addEventListener('mouseenter', () => {
            alert(`Це літера «${letter}»`);
        });
        ul.appendChild(li);
    });

    const startBtn = document.getElementById('startPromptBtn');
    const namesContainer = document.getElementById('namesContainer');

    startBtn.addEventListener('click', () => {
        namesContainer.innerHTML = '';
        let count = 0;

        while (true) {
            const input = prompt('Введіть прізвище та ім’я (або натисніть «Відміна» для завершення):');
            if (input === null) {
                break;
            }
            const trimmed = input.trim();
            if (trimmed !== '') {
                count++;
                const p = document.createElement('p');
                p.textContent = `${count}. ${trimmed}`;
                namesContainer.appendChild(p);
            }
        }

        if (count === 0) {
            namesContainer.innerHTML = '<p style="color:#7f8c8d;">Список порожній...</p>';
        }
    });

    const toggleBtn = document.getElementById('toggleBlocksBtn');
    const lettersContainer = document.getElementById('letters');

    function createLetterBlocks() {
        lettersContainer.innerHTML = '';
        const surnameLetters = userSurname.split('');
        surnameLetters.forEach(letter => {
            const div = document.createElement('div');
            div.className = 'letter-block';
            div.textContent = letter;
            div.addEventListener('mouseenter', () => {
                alert(`Це літера «${letter}»`);
            });
            lettersContainer.appendChild(div);
        });
    }

    toggleBtn.addEventListener('click', () => {
        if (lettersContainer.children.length === 0) {
            createLetterBlocks();
            toggleBtn.textContent = 'Очистити блоки';
            toggleBtn.classList.add('clear-btn');
        } else {
            lettersContainer.innerHTML = '';
            toggleBtn.textContent = 'Показати блоки';
            toggleBtn.classList.remove('clear-btn');
        }
    });
});
