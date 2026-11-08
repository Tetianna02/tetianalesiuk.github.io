document.addEventListener('DOMContentLoaded', () => {
    startShop({
        storageKey: 'lab13.phones.cart',
        loadCatalog: fetchCatalog
    });
});
