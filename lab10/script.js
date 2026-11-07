const phoneCatalog = {
    "title": "Мобільні телефони",
    "products": [
        {
            "id": 1,
            "name": "Apple iPhone 15",
            "category": "Apple",
            "price": 31999,
            "description": "Екран 6,1″, пам’ять 128 ГБ, камера 48 Мп.",
            "image": "images/iphone-15.jpg"
        },
        {
            "id": 2,
            "name": "Samsung Galaxy S24",
            "category": "Samsung",
            "price": 36999,
            "description": "Екран 6,2″, пам’ять 256 ГБ, камера 50 Мп.",
            "image": "images/Samsung-gl-s24.jpg"
        },
        {
            "id": 3,
            "name": "Xiaomi 14",
            "category": "Xiaomi",
            "price": 29999,
            "description": "Екран 6,36″, пам’ять 256 ГБ, камера Leica.",
            "image": "images/Xiaomi-14.jpg"
        },
        {
            "id": 4,
            "name": "Google Pixel 8",
            "category": "Google",
            "price": 24999,
            "description": "Екран 6,2″, пам’ять 128 ГБ, камера 50 Мп.",
            "image": "images/Google-px-8.jpg"
        },
        {
            "id": 5,
            "name": "Nokia G42",
            "category": "Nokia",
            "price": 7999,
            "description": "Екран 6,56″, пам’ять 128 ГБ, акумулятор 5000 мА·год.",
            "image": "images/nokia-G4.png"
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    startShop({
        storageKey: 'lab10.cart',
        loadCatalog: () => phoneCatalog,
        staticCards: true
    });
});

