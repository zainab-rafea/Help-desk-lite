(function () {
  const STORAGE_KEY = 'helpdesk-theme';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      const label = btn.querySelector('.theme-toggle-label');
      if (label) {
        const t = window.HelpDeskI18n?.t;
        label.textContent = theme === 'dark'
          ? (t ? t('themeDark') : 'Dark')
          : (t ? t('themeLight') : 'Light');
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  window.HelpDeskTheme = { applyTheme, toggleTheme, getPreferred };

  applyTheme(getPreferred());

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  document.addEventListener('helpdesk:langchange', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') || getPreferred());
  });
})();
