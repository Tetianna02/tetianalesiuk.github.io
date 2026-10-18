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

function render(containerId, nodes) {
    const box = document.getElementById(containerId);
    box.innerHTML = '';
    nodes.forEach(node => box.appendChild(node));
}

function formatMoney(value) {
    return value.toLocaleString('uk-UA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' грн';
}

function onEnter(input, handler) {
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            handler();
        }
    });
}

function initTask1() {
    const products = [
        { name: 'Ноутбук', category: 'Комп\'ютери', price: 24999, inStock: 5 },
        { name: 'Смартфон', category: 'Телефони', price: 18999, inStock: 12 },
        { name: 'Навушники', category: 'Аксесуари', price: 1899, inStock: 0 },
        { name: 'Монітор', category: 'Комп\'ютери', price: 7499, inStock: 3 },
        { name: 'Клавіатура', category: 'Аксесуари', price: 1299, inStock: 0 },
        { name: 'Миша', category: 'Аксесуари', price: 599, inStock: 25 },
        { name: 'Планшет', category: 'Телефони', price: 12999, inStock: 7 },
        { name: 'Вебкамера', category: 'Аксесуари', price: 1150, inStock: 0 }
    ];

    const columns = [
        { title: 'Назва', key: 'name' },
        { title: 'Категорія', key: 'category' },
        { title: 'Ціна, грн', key: 'price' },
        { title: 'На складі', key: 'inStock' }
    ];

    function getAvailableProducts(list) {
        return list.filter(item => item.inStock > 0);
    }

    function findProductByName(name) {
        const found = products.find(
            item => item.name.toLowerCase() === name.trim().toLowerCase()
        );
        return found ? found : 'Товар не знайдено';
    }

    render('task1Source', [createHeading('Усі товари'), createTable(products, columns)]);

    document.getElementById('showAvailableBtn').addEventListener('click', () => {
        const available = getAvailableProducts(products);
        console.log('Товари в наявності:', available);
        render('task1Result', [
            createHeading('Товари в наявності'),
            createTable(available, columns)
        ]);
    });

    const input = document.getElementById('productNameInput');

    function handleFind() {
        const result = findProductByName(input.value);
        console.log('Результат пошуку:', result);

        if (typeof result === 'string') {
            render('task1Result', [createMessage(result)]);
        } else {
            render('task1Result', [
                createHeading('Знайдений товар'),
                createTable([result], columns)
            ]);
        }
    }

    document.getElementById('findProductBtn').addEventListener('click', handleFind);
    onEnter(input, handleFind);
}


function initTask2() {
    const students = [
        { name: 'Андрій Коваленко', age: 19, grade: 11, group: 'КН-21' },
        { name: 'Оксана Мельничук', age: 20, grade: 9, group: 'КН-21' },
        { name: 'Богдан Савчук', age: 19, grade: 7, group: 'КН-22' },
        { name: 'Христина Іванюк', age: 21, grade: 12, group: 'КН-22' },
        { name: 'Роман Гнатюк', age: 20, grade: 5, group: 'ПІ-21' },
        { name: 'Дарина Петрик', age: 19, grade: 10, group: 'ПІ-21' },
        { name: 'Тарас Шульга', age: 22, grade: 6, group: 'КН-21' },
        { name: 'Вікторія Лозинська', age: 20, grade: 8, group: 'КН-22' },
        { name: 'Максим Гринюк', age: 21, grade: 4, group: 'ПІ-21' },
        { name: 'Анастасія Яремчук', age: 19, grade: 12, group: 'ПІ-21' }
    ];

    const columns = [
        { title: 'Ім\'я', key: 'name' },
        { title: 'Вік', key: 'age' },
        { title: 'Оцінка', key: 'grade' },
        { title: 'Група', key: 'group' }
    ];

    function groupBy(list) {
        return list.reduce((groups, student) => {
            if (!groups[student.group]) {
                groups[student.group] = [];
            }
            groups[student.group].push(student);
            return groups;
        }, {});
    }

    function sortStudentsByGrade(list) {
        return [...list].sort((a, b) => b.grade - a.grade);
    }

    render('task2Source', [createHeading('Список студентів'), createTable(students, columns)]);

    document.getElementById('groupBtn').addEventListener('click', () => {
        const groups = groupBy(students);
        console.log('Групування за групами:', groups);

        const nodes = [];
        Object.keys(groups).forEach(groupName => {
            nodes.push(createHeading('Група ' + groupName));
            nodes.push(createTable(groups[groupName], columns));
        });
        render('task2Result', nodes);
    });

    document.getElementById('sortGradeBtn').addEventListener('click', () => {
        const sorted = sortStudentsByGrade(students);
        console.log('Сортування за оцінкою (спадання):', sorted);
        render('task2Result', [
            createHeading('Студенти за оцінкою (від більшої до меншої)'),
            createTable(sorted, columns)
        ]);
    });
}


function initTask3() {
    const employees = [
        { name: 'Олександр Шевченко', position: 'Директор', salary: 65000, years: 12 },
        { name: 'Марія Ткаченко', position: 'Бухгалтер', salary: 28000, years: 7 },
        { name: 'Дмитро Лисенко', position: 'Програміст', salary: 42000, years: 4 },
        { name: 'Наталія Кравець', position: 'Менеджер', salary: 33000, years: 9 },
        { name: 'Сергій Бойко', position: 'Дизайнер', salary: 30000, years: 3 },
        { name: 'Юлія Романенко', position: 'Тестувальник', salary: 27000, years: 2 },
        { name: 'Віктор Мороз', position: 'Адміністратор', salary: 22000, years: 6 }
    ];

    const columns = [
        { title: 'Ім\'я', key: 'name' },
        { title: 'Посада', key: 'position' },
        { title: 'Зарплата, грн', key: 'salary' },
        { title: 'Років на посаді', key: 'years' }
    ];

    function getAverageSalary(list) {
        if (list.length === 0) {
            return 0;
        }
        const total = list.reduce((sum, employee) => sum + employee.salary, 0);
        return total / list.length;
    }

    function findMostExperiencedEmployee(list) {
        return list.reduce((best, employee) => {
            return employee.years > best.years ? employee : best;
        });
    }

    render('task3Source', [createHeading('Працівники'), createTable(employees, columns)]);

    document.getElementById('avgSalaryBtn').addEventListener('click', () => {
        const average = getAverageSalary(employees);
        console.log('Середня зарплата:', average);
        render('task3Result', [createMessage('Середня зарплата: ' + formatMoney(average))]);
    });

    document.getElementById('experiencedBtn').addEventListener('click', () => {
        const employee = findMostExperiencedEmployee(employees);
        console.log('Найдосвідченіший працівник:', employee);
        render('task3Result', [
            createHeading('Працівник з найбільшим досвідом'),
            createTable([employee], columns)
        ]);
    });
}

function initTask4() {
    const books = [
        { title: 'Захар Беркут', author: 'Іван Франко', year: 1883, rating: 4.5, isRead: true },
        { title: 'Лісова пісня', author: 'Леся Українка', year: 1911, rating: 5, isRead: true },
        { title: 'Кобзар', author: 'Тарас Шевченко', year: 1840, rating: 4.8, isRead: false },
        { title: 'Тіні забутих предків', author: 'Михайло Коцюбинський', year: 1911, rating: 4.2, isRead: true },
        { title: 'Мойсей', author: 'Іван Франко', year: 1905, rating: 4, isRead: false },
        { title: 'Маруся Чурай', author: 'Ліна Костенко', year: 1979, rating: 4.7, isRead: false },
        { title: 'Intermezzo', author: 'Михайло Коцюбинський', year: 1909, rating: 3.9, isRead: true },
        { title: 'Собор', author: 'Олесь Гончар', year: 1968, rating: 4.1, isRead: false },
        { title: 'Лис Микита', author: 'Іван Франко', year: 1890, rating: 3.8, isRead: true }
    ];

    const columns = [
        { title: 'Назва', key: 'title' },
        { title: 'Автор', key: 'author' },
        { title: 'Рік', key: 'year' },
        { title: 'Рейтинг', key: 'rating' },
        { title: 'Прочитана', get: book => book.isRead ? 'так' : 'ні' }
    ];

    function getUnreadBooks(list) {
        return list.reduce((titles, book) => {
            if (!book.isRead) {
                titles.push(book.title);
            }
            return titles;
        }, []);
    }

    function getBooksByAuthor(list, author) {
        const name = author.trim().toLowerCase();
        return list
            .reduce((result, book) => {
                if (book.author.toLowerCase() === name) {
                    result.push(book);
                }
                return result;
            }, [])
            .sort((a, b) => a.year - b.year);
    }

    function getTopRatedBooks(list) {
        return list
            .reduce((result, book) => {
                if (book.rating > 4) {
                    result.push(book);
                }
                return result;
            }, [])
            .sort((a, b) => b.rating - a.rating);
    }

    render('task4Source', [createHeading('Книги'), createTable(books, columns)]);

    document.getElementById('unreadBtn').addEventListener('click', () => {
        const unread = getUnreadBooks(books);
        console.log('Непрочитані книги:', unread);

        const list = document.createElement('ul');
        unread.forEach(title => {
            const li = document.createElement('li');
            li.textContent = title;
            list.appendChild(li);
        });
        render('task4Result', [createHeading('Непрочитані книги'), list]);
    });

    document.getElementById('topRatedBtn').addEventListener('click', () => {
        const top = getTopRatedBooks(books);
        console.log('Книги з рейтингом вище 4:', top);
        render('task4Result', [
            createHeading('Книги з рейтингом вище 4'),
            createTable(top, columns)
        ]);
    });

    const authorInput = document.getElementById('authorInput');

    function handleAuthor() {
        const result = getBooksByAuthor(books, authorInput.value);
        console.log('Книги автора:', result);

        if (result.length === 0) {
            render('task4Result', [createMessage('Книг цього автора не знайдено')]);
        } else {
            render('task4Result', [
                createHeading('Книги автора (за роком видання)'),
                createTable(result, columns)
            ]);
        }
    }

    document.getElementById('authorBtn').addEventListener('click', handleAuthor);
    onEnter(authorInput, handleAuthor);
}


function initTask5() {
    const orders = [
        {
            orderId: 1001,
            customer: { name: 'Олена Коваль', email: 'olena.koval@example.com' },
            items: [
                { name: 'Ноутбук', price: 24999 },
                { name: 'Миша', price: 599 }
            ],
            total: 25598
        },
        {
            orderId: 1002,
            customer: { name: 'Андрій Мельник', email: 'andrii.melnyk@example.com' },
            items: [
                { name: 'Навушники', price: 1899 },
                { name: 'Клавіатура', price: 1299 }
            ],
            total: 3198
        },
        {
            orderId: 1003,
            customer: { name: 'Олена Коваль', email: 'olena.koval@example.com' },
            items: [
                { name: 'Монітор', price: 7499 }
            ],
            total: 7499
        },
        {
            orderId: 1004,
            customer: { name: 'Ірина Бондар', email: 'iryna.bondar@example.com' },
            items: [
                { name: 'Планшет', price: 12999 },
                { name: 'Чохол', price: 450 }
            ],
            total: 13449
        },
        {
            orderId: 1005,
            customer: { name: 'Андрій Мельник', email: 'andrii.melnyk@example.com' },
            items: [
                { name: 'Смартфон', price: 18999 }
            ],
            total: 18999
        },
        {
            orderId: 1006,
            customer: { name: 'Олена Коваль', email: 'olena.koval@example.com' },
            items: [
                { name: 'Вебкамера', price: 1150 },
                { name: 'Навушники', price: 1899 }
            ],
            total: 3049
        }
    ];

    const columns = [
        { title: 'Замовлення', key: 'orderId' },
        { title: 'Клієнт', get: order => order.customer.name },
        { title: 'Email', get: order => order.customer.email },
        { title: 'Товари', get: order => order.items.map(item => item.name).join(', ') },
        { title: 'Сума, грн', key: 'total' }
    ];

    function getTotalSpentByCustomer(list, customerName) {
        const name = customerName.trim().toLowerCase();
        return list
            .filter(order => order.customer.name.toLowerCase() === name)
            .reduce((sum, order) => sum + order.total, 0);
    }

    render('task5Source', [createHeading('Замовлення'), createTable(orders, columns)]);

    const input = document.getElementById('customerInput');

    function handleSpent() {
        const name = input.value.trim();
        if (name === '') {
            render('task5Result', [createMessage('Введіть ім\'я клієнта')]);
            return;
        }

        const total = getTotalSpentByCustomer(orders, name);
        console.log('Витрати клієнта ' + name + ':', total);

        if (total === 0) {
            render('task5Result', [createMessage('Замовлень цього клієнта не знайдено')]);
        } else {
            render('task5Result', [
                createMessage('Клієнт ' + name + ' витратив: ' + formatMoney(total))
            ]);
        }
    }

    document.getElementById('spentBtn').addEventListener('click', handleSpent);
    onEnter(input, handleSpent);
}


function initTask6() {
    const products = [
        { productId: 1, name: 'Ноутбук', price: 24999 },
        { productId: 2, name: 'Смартфон', price: 18999 },
        { productId: 3, name: 'Навушники', price: 1899 },
        { productId: 4, name: 'Миша', price: 599 }
    ];

    const purchases = [
        { purchaseId: 1, productId: 1, quantity: 2 },
        { purchaseId: 2, productId: 3, quantity: 5 },
        { purchaseId: 3, productId: 2, quantity: 1 },
        { purchaseId: 4, productId: 3, quantity: 3 },
        { purchaseId: 5, productId: 1, quantity: 1 },
        { purchaseId: 6, productId: 4, quantity: 10 },
        { purchaseId: 7, productId: 2, quantity: 2 }
    ];

    function getTotalSales(productList, purchaseList) {
        return purchaseList.reduce((sales, purchase) => {
            const product = productList.find(item => item.productId === purchase.productId);
            if (product) {
                const income = product.price * purchase.quantity;
                sales[product.name] = (sales[product.name] || 0) + income;
            }
            return sales;
        }, {});
    }

    render('task6SourceProducts', [
        createHeading('Товари'),
        createTable(products, [
            { title: 'productId', key: 'productId' },
            { title: 'Назва', key: 'name' },
            { title: 'Ціна, грн', key: 'price' }
        ])
    ]);

    render('task6SourcePurchases', [
        createHeading('Покупки'),
        createTable(purchases, [
            { title: 'purchaseId', key: 'purchaseId' },
            { title: 'productId', key: 'productId' },
            { title: 'Кількість', key: 'quantity' }
        ])
    ]);

    document.getElementById('salesBtn').addEventListener('click', () => {
        const sales = getTotalSales(products, purchases);
        console.log('Дохід від продажу:', sales);

        const rows = Object.keys(sales).map(name => ({ name: name, income: sales[name] }));
        render('task6Result', [
            createHeading('Загальний дохід за товарами'),
            createTable(rows, [
                { title: 'Товар', key: 'name' },
                { title: 'Дохід, грн', key: 'income' }
            ])
        ]);
    });
}


initTask1();
initTask2();
initTask3();
initTask4();
initTask5();
initTask6();