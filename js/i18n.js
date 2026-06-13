// js/i18n.js — Localization framework for Darius Star
// GRO-942: Multi-language subtitle & UI text support
//
// Load order: after ui.js (SCREENS, menuOptions, etc.), before game_loop.js
//
// Usage:
//   t('START_GAME')           → translated string
//   tFormat('SCORE: {0}', 500) → formatted translated string
//   setLanguage('ja')         → switch language (persists to localStorage)

const I18N_CONFIG = {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ja', 'es', 'de'],
    languageNames: {
        en: 'English',
        ja: '日本語',
        es: 'Español',
        de: 'Deutsch',
    },
    storageKey: 'ds_language',
    dictionaries: {},
};

// ─── Dictionary Loading ──────────────────────────────────────────────────

export function loadDictionary(lang) {
    if (I18N_CONFIG.dictionaries[lang]) {
        return I18N_CONFIG.dictionaries[lang];
    }

    // Inline dictionaries for bootstrapping (loaded via script tags)
    if (typeof I18N_DICTS !== 'undefined' && I18N_DICTS[lang]) {
        I18N_CONFIG.dictionaries[lang] = I18N_DICTS[lang];
        return I18N_DICTS[lang];
    }

    console.warn(`[i18n] Dictionary not loaded for "${lang}" — falling back to English`);
    return I18N_CONFIG.dictionaries['en'] || {};
}

export function getCurrentLanguage() {
    try {
        const stored = localStorage.getItem(I18N_CONFIG.storageKey);
        if (stored && I18N_CONFIG.supportedLanguages.includes(stored)) {
            return stored;
        }
    } catch (e) {
        // localStorage unavailable (private browsing, etc.)
    }
    return I18N_CONFIG.defaultLanguage;
}

// ─── Public API ──────────────────────────────────────────────────────────

let currentLanguage = getCurrentLanguage();

/**
 * Translate a key. Falls back to the key itself if no translation exists.
 */
export function t(key) {
    const dict = loadDictionary(currentLanguage);
    return dict[key] || (currentLanguage !== 'en' ? (loadDictionary('en')[key] || key) : key);
}

/**
 * Translate with positional argument substitution.
 * Example: tFormat('SCORE: {0}', 500) → 'SCORE: 500'
 */
export function tFormat(key, ...args) {
    let template = t(key);
    for (let i = 0; i < args.length; i++) {
        template = template.replace(`{${i}}`, args[i]);
    }
    return template;
}

/**
 * Switch display language.
 * Re-renders HUD, menus, and active subtitles if possible.
 */
export function setLanguage(lang) {
    if (!I18N_CONFIG.supportedLanguages.includes(lang)) {
        console.warn(`[i18n] Unsupported language: "${lang}"`);
        return false;
    }
    currentLanguage = lang;
    try {
        localStorage.setItem(I18N_CONFIG.storageKey, lang);
    } catch (e) {}
    console.log(`[i18n] Language switched to: ${lang}`);
    return true;
}

export function getAvailableLanguages() {
    return I18N_CONFIG.supportedLanguages.map(code => ({
        code,
        name: I18N_CONFIG.languageNames[code] || code,
    }));
}

console.log(`[i18n] Initialized — language: ${currentLanguage}`);

// ES Module bridge — publish exports to global scope for cross-module access
window.loadDictionary = loadDictionary;
window.getCurrentLanguage = getCurrentLanguage;
window.t = t;
window.tFormat = tFormat;
window.setLanguage = setLanguage;
window.getAvailableLanguages = getAvailableLanguages;
