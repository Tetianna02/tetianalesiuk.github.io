function createTable(rows, columns) {
    const table = document.createElement('table');

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.title;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = col.get ? col.get(row) : row[col.key];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

function createMessage(text) {
    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = text;
    return p;
}

function createHeading(text) {
    const h = document.createElement('h3');
    h.textContent = text;
    return h;
}

function createActionList(items, getText, buttonLabel, isDone, onClick) {
    const list = document.createElement('ul');
    items.forEach(item => {
        const li = document.createElement('li');
        li.append(getText(item));

        const button = document.createElement('button');
        button.textContent = buttonLabel;
        button.disabled = isDone(item);
        button.addEventListener('click', () => onClick(item));
        li.append(button);

        list.appendChild(li);
    });
    return list;
}

function render(containerId, nodes) {
    const box = document.getElementById(containerId);
    box.innerHTML = '';
    nodes.forEach(node => box.appendChild(node));
}

function onEnter(input, handler) {
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            handler();
        }
    });
}

function yesNo(value) {
    return value ? 'Так' : 'Ні';
}

function createBook(title, author, year, isRead) {
    return {
        title: title,
        author: author,
        year: year,
        isRead: isRead,
        bookInfo() {
            const text = `Назва: ${this.title}, Автор: ${this.author}, Рік видання: ${this.year}, Прочитана: ${this.isRead ? 'Так' : 'Ні'}`;
            console.log(text);
            return text;
        },
        markAsRead() {
            this.isRead = true;
        }
    };
}

const library = [
    createBook("Harry Potter and the Sorcerer's Stone", 'J.K. Rowling', 1997, true),
    createBook('The Hobbit', 'J.R.R. Tolkien', 1937, false),
    createBook('1984', 'George Orwell', 1949, true)
];

const bookColumns = [
    { title: 'Назва', key: 'title' },
    { title: 'Автор', key: 'author' },
    { title: 'Рік видання', key: 'year' },
    { title: 'Прочитана', get: book => yesNo(book.isRead) }
];

function displayLibrary(containerId = 'task2Result') {
    const lines = [];
    library.forEach(book => {
        lines.push(book.bookInfo());
    });

    const list = document.createElement('ul');
    lines.forEach(line => {
        const li = document.createElement('li');
        li.textContent = line;
        list.appendChild(li);
    });

    render(containerId, [
        createHeading('Бібліотека (книг: ' + library.length + ')'),
        list
    ]);
}

function calculateAverageYear() {
    if (library.length === 0) {
        return 0;
    }
    const total = library.reduce((sum, book) => sum + book.year, 0);
    return total / library.length;
}

function renderExtraList() {
    render('extraSource', [
        createHeading('Книги в бібліотеці'),
        createActionList(
            library,
            book => `${book.title} (${book.author}, ${book.year}). Прочитана: ${yesNo(book.isRead)}`,
            'Позначити прочитаною',
            book => book.isRead,
            book => {
                book.markAsRead();
                console.log('Позначено прочитаною:', book);
                renderExtraList();
            }
        )
    ]);
}

function initTask1() {
    const book = {
        title: "Harry Potter and the Sorcerer's Stone",
        author: 'J.K. Rowling',
        year: 1997,
        isRead: true,
        bookInfo() {
            const text = `Назва: ${this.title}, Автор: ${this.author}, Рік видання: ${this.year}, Прочитана: ${this.isRead ? 'Так' : 'Ні'}`;
            console.log(text);
            return text;
        }
    };

    render('task1Source', [createHeading('Об\'єкт book'), createTable([book], bookColumns)]);

    document.getElementById('bookInfoBtn').addEventListener('click', () => {
        render('task1Result', [createMessage(book.bookInfo())]);
    });

    document.getElementById('toggleReadBtn').addEventListener('click', () => {
        book.isRead = !book.isRead;
        render('task1Source', [createHeading('Об\'єкт book'), createTable([book], bookColumns)]);
        render('task1Result', [createMessage(book.bookInfo())]);
    });
}

function initTask2() {
    document.getElementById('displayLibraryBtn').addEventListener('click', () => {
        displayLibrary('task2Result');
    });

    document.getElementById('pushBookBtn').addEventListener('click', () => {
        const exists = library.some(book => book.title === 'The Great Gatsby');
        if (exists) {
            render('task2Result', [createMessage('Книга «The Great Gatsby» вже є в бібліотеці')]);
            return;
        }
        library.push(createBook('The Great Gatsby', 'F. Scott Fitzgerald', 1925, false));
        displayLibrary('task2Result');
        renderExtraList();
    });
}

function initTask3() {
    document.getElementById('sortYearBtn').addEventListener('click', () => {
        library.sort((a, b) => a.year - b.year);
        console.log('Відсортовані книги за роком видання:', library);
        render('task3Result', [
            createHeading('Книги за роком видання (за зростанням)'),
            createTable(library, bookColumns)
        ]);
        renderExtraList();
    });

    document.getElementById('unreadBooksBtn').addEventListener('click', () => {
        const unreadBooks = library.filter(book => !book.isRead);
        console.log('Непрочитані книги:', unreadBooks);

        if (unreadBooks.length === 0) {
            render('task3Result', [createMessage('Непрочитаних книг немає')]);
        } else {
            render('task3Result', [
                createHeading('Непрочитані книги'),
                createTable(unreadBooks, bookColumns)
            ]);
        }
    });

    document.getElementById('tolkienBtn').addEventListener('click', () => {
        const tolkienBook = library.find(book => book.author === 'J.R.R. Tolkien');
        console.log('Книга Толкіна:', tolkienBook);

        if (!tolkienBook) {
            render('task3Result', [createMessage('Книгу Толкіна не знайдено')]);
        } else {
            render('task3Result', [
                createHeading('Книга Толкіна'),
                createTable([tolkienBook], bookColumns)
            ]);
        }
    });
}

function addBookToLibrary() {
    const title = prompt('Введіть назву книги:');
    if (title === null || title.trim() === '') {
        render('task4Result', [createMessage('Додавання скасовано: назву не введено')]);
        return;
    }

    const author = prompt('Введіть автора книги:');
    if (author === null || author.trim() === '') {
        render('task4Result', [createMessage('Додавання скасовано: автора не введено')]);
        return;
    }

    const year = Number(prompt('Введіть рік видання книги:'));
    if (!Number.isInteger(year) || year <= 0) {
        render('task4Result', [createMessage('Додавання скасовано: некоректний рік видання')]);
        return;
    }

    const isRead = confirm('Чи прочитана книга?');

    library.push(createBook(title.trim(), author.trim(), year, isRead));
    displayLibrary('task4Result');
    renderExtraList();
}

function initTask4() {
    document.getElementById('addBookBtn').addEventListener('click', addBookToLibrary);
}

function initExtra() {
    renderExtraList();

    document.getElementById('averageYearBtn').addEventListener('click', () => {
        const average = calculateAverageYear();
        console.log('Середній рік видання:', average);
        render('extraResult', [
            createMessage('Середній рік видання книг: ' + average.toFixed(1))
        ]);
    });
}

function initComics() {
    function createComic(title, author, publisher, year, inCollection) {
        return {
            title: title,
            author: author,
            publisher: publisher,
            year: year,
            inCollection: inCollection,
            comicInfo() {
                const text = `Назва: ${this.title}, Автор: ${this.author}, Видавництво: ${this.publisher}, Рік випуску: ${this.year}, В колекції: ${this.inCollection ? 'Так' : 'Ні'}`;
                console.log(text);
                return text;
            },
            markAsInCollection() {
                this.inCollection = true;
            }
        };
    }

    const comics = [
        createComic('Watchmen', 'Alan Moore', 'DC Comics', 1986, true),
        createComic('Maus', 'Art Spiegelman', 'Pantheon Books', 1991, true),
        createComic('The Sandman', 'Neil Gaiman', 'Vertigo', 1989, false),
        createComic('Batman: Year One', 'Frank Miller', 'DC Comics', 1987, true),
        createComic('Persepolis', 'Marjane Satrapi', 'L\'Association', 2000, false),
        createComic('Saga', 'Brian K. Vaughan', 'Image Comics', 2012, false)
    ];

    const columns = [
        { title: 'Назва', key: 'title' },
        { title: 'Автор', key: 'author' },
        { title: 'Видавництво', key: 'publisher' },
        { title: 'Рік випуску', key: 'year' },
        { title: 'В колекції', get: comic => yesNo(comic.inCollection) }
    ];

    function displayComics() {
        const lines = comics.map(comic => comic.comicInfo());
        console.log('Колекція коміксів:', lines);

        render('comicsSource', [
            createHeading('Комікси (всього: ' + comics.length + ')'),
            createActionList(
                comics,
                comic => `${comic.title} (${comic.author}, ${comic.publisher}, ${comic.year}). В колекції: ${yesNo(comic.inCollection)}`,
                'Додати до колекції',
                comic => comic.inCollection,
                comic => {
                    comic.markAsInCollection();
                    displayComics();
                    render('comicsResult', [
                        createMessage('Комікс «' + comic.title + '» додано до колекції')
                    ]);
                }
            )
        ]);
    }

    function addComic() {
        const title = prompt('Введіть назву коміксу:');
        if (title === null || title.trim() === '') {
            render('comicsResult', [createMessage('Додавання скасовано: назву не введено')]);
            return;
        }

        const author = prompt('Введіть автора коміксу:');
        if (author === null || author.trim() === '') {
            render('comicsResult', [createMessage('Додавання скасовано: автора не введено')]);
            return;
        }

        const publisher = prompt('Введіть видавництво:');
        if (publisher === null || publisher.trim() === '') {
            render('comicsResult', [createMessage('Додавання скасовано: видавництво не введено')]);
            return;
        }

        const year = Number(prompt('Введіть рік випуску:'));
        if (!Number.isInteger(year) || year <= 0) {
            render('comicsResult', [createMessage('Додавання скасовано: некоректний рік випуску')]);
            return;
        }

        const inCollection = confirm('Чи є комікс в колекції?');

        comics.push(createComic(title.trim(), author.trim(), publisher.trim(), year, inCollection));
        displayComics();
        render('comicsResult', [createMessage('Комікс «' + title.trim() + '» додано')]);
    }

    function sortComicsByYear() {
        comics.sort((a, b) => a.year - b.year);
        console.log('Комікси за роком випуску:', comics);
        displayComics();
        render('comicsResult', [
            createHeading('Комікси за роком випуску (за зростанням)'),
            createTable(comics, columns)
        ]);
    }

    function getMissingComics() {
        return comics.filter(comic => !comic.inCollection);
    }

    function findComicByAuthor(name) {
        const query = name.trim().toLowerCase();
        return comics.find(comic => comic.author.toLowerCase().includes(query));
    }

    function calculateAverageComicsYear() {
        if (comics.length === 0) {
            return 0;
        }
        const total = comics.reduce((sum, comic) => sum + comic.year, 0);
        return total / comics.length;
    }

    displayComics();

    document.getElementById('addComicBtn').addEventListener('click', addComic);
    document.getElementById('sortComicsBtn').addEventListener('click', sortComicsByYear);

    document.getElementById('missingComicsBtn').addEventListener('click', () => {
        const missing = getMissingComics();
        console.log('Комікси, яких немає в колекції:', missing);

        if (missing.length === 0) {
            render('comicsResult', [createMessage('Усі комікси вже є в колекції')]);
        } else {
            render('comicsResult', [
                createHeading('Комікси, яких немає в колекції'),
                createTable(missing, columns)
            ]);
        }
    });

    document.getElementById('comicsAverageBtn').addEventListener('click', () => {
        const average = calculateAverageComicsYear();
        console.log('Середній рік випуску:', average);
        render('comicsResult', [
            createMessage('Середній рік випуску коміксів: ' + average.toFixed(1))
        ]);
    });

    const authorInput = document.getElementById('comicAuthorInput');

    function handleFindComic() {
        if (authorInput.value.trim() === '') {
            render('comicsResult', [createMessage('Введіть ім\'я автора')]);
            return;
        }

        const comic = findComicByAuthor(authorInput.value);
        console.log('Результат пошуку:', comic);

        if (!comic) {
            render('comicsResult', [createMessage('Комікс цього автора не знайдено')]);
        } else {
            render('comicsResult', [
                createHeading('Знайдений комікс'),
                createTable([comic], columns)
            ]);
        }
    }

    document.getElementById('findComicBtn').addEventListener('click', handleFindComic);
    onEnter(authorInput, handleFindComic);
}

initTask1();
initTask2();
initTask3();
initTask4();
initExtra();
initComics();