function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('alert');
  const form = e.target;
  try {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    });
    window.location.href = '/';
  } catch (err) {
    showAlert(alertEl, err.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('alert');
  const form = e.target;
  try {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role: form.role.value,
      }),
    });
    window.location.href = '/';
  } catch (err) {
    showAlert(alertEl, err.message);
  }
}

document.getElementById('login-form')?.addEventListener('submit', handleLogin);
document.getElementById('register-form')?.addEventListener('submit', handleRegister);
