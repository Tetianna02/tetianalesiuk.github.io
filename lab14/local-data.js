const LOCAL_JSON = {
    "products.json": {
        "title": {
            "uk": "Мобільні телефони",
            "en": "Mobile phones"
        },
        "products": [
            {
                "id": 1,
                "name": "Apple iPhone 15",
                "category": "Apple",
                "price": 31999,
                "description": {
                    "uk": "Екран 6,1″, пам’ять 128 ГБ, камера 48 Мп.",
                    "en": "6.1″ display, 128 GB storage, 48 MP camera."
                },
                "image": "images/iphone-15.jpg"
            },
            {
                "id": 2,
                "name": "Samsung Galaxy S24",
                "category": "Samsung",
                "price": 36999,
                "description": {
                    "uk": "Екран 6,2″, пам’ять 256 ГБ, камера 50 Мп.",
                    "en": "6.2″ display, 256 GB storage, 50 MP camera."
                },
                "image": "images/Samsung-gl-s24.jpg"
            },
            {
                "id": 3,
                "name": "Xiaomi 14",
                "category": "Xiaomi",
                "price": 29999,
                "description": {
                    "uk": "Екран 6,36″, пам’ять 256 ГБ, камера Leica.",
                    "en": "6.36″ display, 256 GB storage, Leica camera."
                },
                "image": "images/Xiaomi-14.jpg"
            },
            {
                "id": 4,
                "name": "Google Pixel 8",
                "category": "Google",
                "price": 24999,
                "description": {
                    "uk": "Екран 6,2″, пам’ять 128 ГБ, камера 50 Мп.",
                    "en": "6.2″ display, 128 GB storage, 50 MP camera."
                },
                "image": "images/Google-px-8.jpg"
            },
            {
                "id": 5,
                "name": "Nokia G42",
                "category": "Nokia",
                "price": 7999,
                "description": {
                    "uk": "Екран 6,56″, пам’ять 128 ГБ, акумулятор 5000 мА·год.",
                    "en": "6.56″ display, 128 GB storage, 5000 mAh battery."
                },
                "image": "images/nokia-G4.png"
            },
            {
                "id": 6,
                "name": {
                    "uk": "Apple iPhone 15 256 ГБ",
                    "en": "Apple iPhone 15 256 GB"
                },
                "category": "Apple",
                "price": 35999,
                "description": {
                    "uk": "Екран 6,1″, пам’ять 256 ГБ, камера 48 Мп.",
                    "en": "6.1″ display, 256 GB storage, 48 MP camera."
                },
                "image": "images/iphone-15.jpg"
            }
        ]
    },
    "locales/uk.json": {
        "catalog": "Мобільні телефони",
        "cart": "Кошик",
        "cartCount": "Найменувань у кошику: {{count}}",
        "add": "Додати у кошик",
        "quantityTitle": "Вкажіть кількість:",
        "quantity": "Кількість",
        "cancel": "Скасувати",
        "added": "Товар додано",
        "goToCart": "Перейти у кошик",
        "continueShopping": "Повернутись до покупок",
        "emptyCart": "Кошик порожній",
        "selected": "Ви обрали:",
        "number": "№",
        "product": "Назва товару",
        "unitPrice": "Ціна за од.",
        "subtotal": "Сума",
        "actions": "Дії",
        "remove": "Видалити",
        "total": "Разом до оплати:",
        "pay": "Оплатити",
        "payment": "Оплата замовлення",
        "demoPayment": "Навчальне замовлення. Реальний платіж не виконується.",
        "close": "Закрити",
        "quantityError": "Введіть цілу кількість від 1 до {{max}}.",
        "quantityLimit": "Максимальна кількість одного товару — 99.",
        "storageError": "Не вдалося зберегти кошик у браузері. Зміни можуть бути втрачені після переходу на іншу сторінку.",
        "storageReadError": "Не вдалося відновити кошик. Додайте товари повторно.",
        "loading": "Завантаження…",
        "loadError": "Не вдалося завантажити каталог. Перевірте з’єднання та повторіть спробу.",
        "retry": "Повторити",
        "noProducts": "У каталозі поки немає товарів.",
        "language": "Мова",
        "languageStorageError": "Не вдалося запам’ятати вибір мови у браузері.",
        "languageError": "Не вдалося змінити мову.",
        "ukLanguage": "Українська",
        "enLanguage": "Англійська",
        "languageTitle": "Оберіть мову",
        "nativeVersion": "Версія на чистому JavaScript",
        "i18nextVersion": "Версія з i18next",
        "quantityPlaceholder": "Введіть кількість",
        "quantityHint": "Ціле число від 1 до {{max}}.",
        "addProduct": "Додати у кошик: {{name}}"
    },
    "locales/en.json": {
        "catalog": "Mobile phones",
        "cart": "Cart",
        "cartCount": "Product types in cart: {{count}}",
        "add": "Add to cart",
        "quantityTitle": "Choose quantity:",
        "quantity": "Quantity",
        "cancel": "Cancel",
        "added": "Product added",
        "goToCart": "Go to cart",
        "continueShopping": "Continue shopping",
        "emptyCart": "Your cart is empty",
        "selected": "You selected:",
        "number": "No.",
        "product": "Product name",
        "unitPrice": "Unit price",
        "subtotal": "Subtotal",
        "actions": "Actions",
        "remove": "Remove",
        "total": "Total:",
        "pay": "Pay",
        "payment": "Order payment",
        "demoPayment": "Practice order. No real payment will be processed.",
        "close": "Close",
        "quantityError": "Enter a whole quantity from 1 to {{max}}.",
        "quantityLimit": "The maximum quantity of one product is 99.",
        "storageError": "Could not save the cart in your browser. Changes may be lost when you open another page.",
        "storageReadError": "Could not restore the cart. Please add the products again.",
        "loading": "Loading…",
        "loadError": "Could not load the catalog. Check your connection and try again.",
        "retry": "Retry",
        "noProducts": "There are no products in the catalog yet.",
        "language": "Language",
        "languageStorageError": "Could not remember your language choice in this browser.",
        "languageError": "Could not change the language.",
        "ukLanguage": "Ukrainian",
        "enLanguage": "English",
        "languageTitle": "Choose a language",
        "nativeVersion": "Plain JavaScript version",
        "i18nextVersion": "i18next version",
        "quantityPlaceholder": "Enter quantity",
        "quantityHint": "A whole number from 1 to {{max}}.",
        "addProduct": "Add to cart: {{name}}"
    }
};
