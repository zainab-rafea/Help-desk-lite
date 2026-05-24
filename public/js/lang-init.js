(function () {
  var saved = localStorage.getItem('helpdesk-lang');
  var lang = saved === 'ar' || saved === 'en' ? saved : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
})();
