function compareNumbers(num1, num2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!Number.isFinite(num1) || !Number.isFinite(num2)) {
                reject(new Error('Введіть коректні числа.'));
            } else if (num1 > num2) {
                resolve('Перше число більше');
            } else if (num1 < num2) {
                resolve('Друге число більше');
            } else {
                reject(new Error('Числа рівні'));
            }
        }, 1000);
    });
}

function createRandomPromise(delay) {
    return new Promise(resolve => {
        setTimeout(() => resolve(Math.floor(Math.random() * 10) + 1), delay);
    });
}

function setLoading(loading) {
    document.getElementById('loader').style.display = loading ? 'block' : 'none';
    document.getElementById('output').setAttribute('aria-busy', String(loading));
    document.querySelectorAll('button').forEach(button => {
        button.disabled = loading;
    });
}

function runTask(createPromise) {
    const result = document.getElementById('result');
    result.textContent = '';
    result.className = 'result';
    setLoading(true);

    Promise.resolve()
        .then(createPromise)
        .then(message => {
            result.textContent = message;
            result.className = 'result ok';
        })
        .catch(error => {
            result.textContent = error.message;
            result.className = 'result error';
        })
        .finally(() => setLoading(false));
}

function init() {
    document.getElementById('compareForm').addEventListener('submit', event => {
        event.preventDefault();
        if (document.getElementById('sumButton').disabled) {
            return;
        }

        const first = document.getElementById('firstNumber').valueAsNumber;
        const second = document.getElementById('secondNumber').valueAsNumber;
        runTask(() => compareNumbers(first, second));
    });

    document.getElementById('sumButton').addEventListener('click', () => {
        runTask(() => {
            const promises = [1000, 2000, 3000].map(createRandomPromise);
            return Promise.all(promises).then(numbers => {
                const sum = numbers.reduce((total, number) => total + number, 0);
                return `${numbers.join(' + ')} = ${sum}`;
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
