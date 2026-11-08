const I18N_SETTINGS = {
    catalogUrl: '../products.json',
    localesBase: '../locales/',
    assetBase: '../'
};

const I18N_ENGINE = {
    resources: {},
    language: 'uk',

    async init(resources, language) {
        this.resources = resources;
        this.language = language;
    },

    async changeLanguage(language) {
        this.language = language;
    },

    translate(key, values = {}) {
        const template = this.resources[this.language][key];
        return template.replace(/\{\{(\w+)\}\}/g, (match, name) => String(values[name] ?? match));
    }
};

document.addEventListener('DOMContentLoaded', init);
