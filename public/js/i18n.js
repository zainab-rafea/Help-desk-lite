(function () {
  const STORAGE_KEY = 'helpdesk-lang';
  let strings = {};
  let currentLang = 'en';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  }

  async function loadLocale(lang) {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error('Failed to load locale');
    strings = await res.json();
    currentLang = lang;
  }

  function t(key, fallback) {
    if (strings[key] !== undefined) return strings[key];
    return fallback !== undefined ? fallback : key;
  }

  function statusKey(status) {
    return 'status_' + String(status).replace(/\s+/g, '_');
  }

  function translateStatus(status) {
    return t(statusKey(status), status);
  }

  function translatePriority(priority) {
    return t('priority_' + priority, priority);
  }

  function translateCategory(category) {
    return t('category_' + category, category);
  }

  function translateRole(role) {
    return t('role_' + role, role);
  }

  function applyPage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('data-i18n-placeholder')) {
          el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        }
      } else if (el.tagName === 'OPTION' && el.hasAttribute('data-i18n')) {
        el.textContent = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      document.title = t(el.getAttribute('data-i18n-title'));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.setAttribute('aria-pressed', currentLang === 'ar');
      const en = btn.querySelector('.lang-en');
      const ar = btn.querySelector('.lang-ar');
      if (en) en.classList.toggle('active', currentLang === 'en');
      if (ar) ar.classList.toggle('active', currentLang === 'ar');
    });

    if (window.HelpDeskTheme) {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      document.querySelectorAll('.theme-toggle-label').forEach((label) => {
        label.textContent = theme === 'dark' ? t('themeDark') : t('themeLight');
      });
    }

    document.dispatchEvent(new CustomEvent('helpdesk:langchange', { detail: { lang: currentLang } }));
    window.HelpDeskI18n._ready = true;
  }

  async function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'ar') return;
    localStorage.setItem(STORAGE_KEY, lang);
    await loadLocale(lang);
    applyPage();
  }

  async function toggleLanguage() {
    await setLanguage(currentLang === 'en' ? 'ar' : 'en');
  }

  async function init() {
    const lang = getPreferred();
    await loadLocale(lang);
    applyPage();
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.addEventListener('click', () => toggleLanguage());
    });
  }

  window.HelpDeskI18n = {
    t,
    init,
    setLanguage,
    toggleLanguage,
    getLang: () => currentLang,
    translateStatus,
    translatePriority,
    translateCategory,
    translateRole,
    applyPage,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
