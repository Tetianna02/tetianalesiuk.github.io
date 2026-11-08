const I18N_SETTINGS = {
    catalogUrl: 'products.json',
    localesBase: 'locales/',
    assetBase: ''
};

const I18N_ENGINE = {
    instance: null,

    async init(resources, language) {
        if (!window.i18next) {
            if (location.protocol === 'file:') {
                await loadLibraryScript('vendor/i18next.min.js');
            } else {
                try {
                    await loadLibraryScript('https://unpkg.com/i18next@21.6.16/dist/umd/i18next.min.js');
                } catch {
                    await loadLibraryScript('vendor/i18next.min.js');
                }
            }
        }

        this.instance = window.i18next.createInstance();
        await this.instance.init({
            lng: language,
            fallbackLng: 'uk',
            supportedLngs: ['uk', 'en'],
            resources: {
                uk: { translation: resources.uk },
                en: { translation: resources.en }
            },
            interpolation: { escapeValue: false }
        });
    },

    async changeLanguage(language) {
        await this.instance.changeLanguage(language);
    },

    translate(key, values) {
        return this.instance.t(key, values);
    }
};

function loadLibraryScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        let finished = false;

        function finish(error) {
            if (finished) {
                return;
            }
            finished = true;
            clearTimeout(timeout);
            script.onload = null;
            script.onerror = null;
            if (error) {
                script.remove();
                reject(error);
            } else {
                resolve();
            }
        }

        const timeout = setTimeout(() => finish(new Error('Library timeout')), 5000);
        script.onload = () => finish();
        script.onerror = () => finish(new Error('Library unavailable'));
        document.head.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', init);
