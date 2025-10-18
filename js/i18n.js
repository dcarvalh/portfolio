const SUPPORTED_LANGUAGES = ['en', 'fr', 'pt'];
const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'portfolio.language';

class I18nController {
    constructor() {
        this.cache = new Map();
        this.currentLanguage = null;
        this.languageSwitcher = null;
        document.addEventListener('DOMContentLoaded', () => {
            this.languageSwitcher = document.querySelector('[data-i18n-switcher]');
            if (this.languageSwitcher) {
                this.languageSwitcher.addEventListener('change', (event) => {
                    const selected = event.target.value;
                    this.setLanguage(selected).catch((error) => {
                        console.error('Unable to switch language:', error);
                    });
                });
            }

            const initialLanguage = this.getInitialLanguage();
            this.setLanguage(initialLanguage).catch((error) => {
                console.error('Unable to initialize language:', error);
            });
        });
    }

    getInitialLanguage() {
        let stored = null;
        try {
            stored = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Unable to access localStorage for language preference.', error);
        }
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
            return stored;
        }
        const documentLang = document.documentElement.lang;
        if (SUPPORTED_LANGUAGES.includes(documentLang)) {
            return documentLang;
        }
        return DEFAULT_LANGUAGE;
    }

    async setLanguage(language, options = {}) {
        const targetLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
        if (this.currentLanguage === targetLanguage && !options.force) {
            if (this.languageSwitcher) {
                this.languageSwitcher.value = targetLanguage;
            }
            return;
        }

        const dictionary = await this.loadDictionary(targetLanguage);
        this.applyTranslations(dictionary);

        document.documentElement.setAttribute('lang', targetLanguage);
        if (this.languageSwitcher) {
            this.languageSwitcher.value = targetLanguage;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, targetLanguage);
        } catch (error) {
            console.warn('Unable to persist language preference.', error);
        }

        this.currentLanguage = targetLanguage;

        if (!options.silent) {
            window.dispatchEvent(
                new CustomEvent('languageChanged', {
                    detail: { language: targetLanguage },
                })
            );
        }
    }

    async loadDictionary(language) {
        if (this.cache.has(language)) {
            return this.cache.get(language);
        }
        const response = await fetch(`assets/i18n/${language}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${language}`);
        }
        const dictionary = await response.json();
        this.cache.set(language, dictionary);
        return dictionary;
    }

    applyTranslations(dictionary) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((element) => {
            const key = element.dataset.i18n;
            if (!key) {
                return;
            }
            const translation = this.resolve(dictionary, key);
            if (translation === undefined) {
                console.warn(`Missing translation for key: ${key}`);
                return;
            }

            const attrList = element.dataset.i18nAttr ? element.dataset.i18nAttr.split(',') : [];
            if (attrList.length > 0) {
                attrList.forEach((attr) => {
                    const trimmed = attr.trim();
                    if (trimmed) {
                        element.setAttribute(trimmed, translation);
                    }
                });
            }

            if (element.dataset.i18nAttrOnly === 'true') {
                return;
            }

            element.innerHTML = translation;
        });
    }

    resolve(dictionary, keyPath) {
        return keyPath.split('.').reduce((accumulator, part) => {
            if (accumulator && Object.prototype.hasOwnProperty.call(accumulator, part)) {
                return accumulator[part];
            }
            return undefined;
        }, dictionary);
    }
}

const i18nController = new I18nController();
window.i18n = i18nController;
