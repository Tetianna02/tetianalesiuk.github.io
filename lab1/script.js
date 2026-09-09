
const MY_NAME = "Тетяна";        
const MY_SURNAME = "Лесюк";      

//  1

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('nameDisplay').textContent = MY_NAME;
    document.getElementById('surnameDisplay').textContent = MY_SURNAME;

    const nameLetters = MY_NAME.split(''); 
    const ul = document.getElementById('nameList');
    
    nameLetters.forEach(letter => {
        const li = document.createElement('li');
        li.textContent = letter;
        li.addEventListener('mouseenter', () => {
            alert(`Це літера «${letter}»`);
        });
        ul.appendChild(li);
    });

    //  2

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

    //  3

    const toggleBtn = document.getElementById('toggleBlocksBtn');
    const lettersContainer = document.getElementById('letters');

    function createLetterBlocks() {
        lettersContainer.innerHTML = '';
        const surnameLetters = MY_SURNAME.split(''); 
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
            toggleBtn.textContent = '🗑 Очистити блоки';
            toggleBtn.classList.add('clear-btn');
        } else {
            lettersContainer.innerHTML = '';
            toggleBtn.textContent = '▶ Показати блоки';
            toggleBtn.classList.remove('clear-btn');
        }
    });
});