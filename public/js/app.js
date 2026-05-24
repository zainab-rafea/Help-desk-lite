let currentUser = null;
let meta = null;
let handlers = [];
let activeTicketId = null;

const i18n = () => window.HelpDeskI18n;

async function init() {
  try {
    const { user } = await api('/api/auth/me');
    currentUser = user;
    meta = await api('/api/meta');
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = i18n()?.translateRole(user.role) || user.role;

    if (['handler', 'manager'].includes(user.role)) {
      const res = await api('/api/users/handlers');
      handlers = res.handlers;
      document.querySelectorAll('.staff-only').forEach((el) => el.classList.remove('hidden'));
    }
    if (user.role === 'manager') {
      document.querySelectorAll('.manager-only').forEach((el) => el.classList.remove('hidden'));
    }

    setupNav();
    setupClock();
    populateSelects();
    await loadTickets();
  } catch {
    window.location.href = '/login.html';
  }
}

let clockTimer = null;

function setupClock() {
  const el = document.getElementById('header-clock');
  if (!el) return;

  function tick() {
    const now = new Date();
    el.dateTime = now.toISOString();
    el.textContent = formatClock(now);
  }

  tick();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
}

function setupNav() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${panel}`).classList.add('active');
      if (panel === 'dashboard') loadDashboard();
      if (panel === 'tickets') loadTickets();
    });
  });
}

function populateSelects() {
  const cat = document.getElementById('new-category');
  const pri = document.getElementById('new-priority');
  if (!cat || !pri || !meta) return;
  cat.innerHTML = '';
  pri.innerHTML = '';
  meta.categories.forEach((c) => {
    cat.innerHTML += `<option value="${c}">${i18n()?.translateCategory(c) || c}</option>`;
  });
  meta.priorities.forEach((p) => {
    pri.innerHTML += `<option value="${p}">${i18n()?.translatePriority(p) || p}</option>`;
  });
}

async function loadTickets() {
  const filter = document.getElementById('ticket-filter')?.value || '';
  const status = document.getElementById('status-filter')?.value || '';
  const params = new URLSearchParams();
  if (filter) params.set('filter', filter);
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params}` : '';
  const { tickets } = await api(`/api/tickets${qs}`);
  renderTicketTable(tickets);
}

function renderTicketTable(tickets) {
  const tbody = document.getElementById('ticket-tbody');
  const t = i18n()?.t;
  if (!tickets.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t('noTickets')}</td></tr>`;
    return;
  }
  tbody.innerHTML = tickets
    .map(
      (ticket) => `
    <tr data-id="${ticket.id}">
      <td>#${ticket.id}</td>
      <td>${escapeHtml(ticket.title)}</td>
      <td>${escapeHtml(i18n().translateCategory(ticket.category))}</td>
      <td class="priority-${ticket.priority.toLowerCase()}">${escapeHtml(i18n().translatePriority(ticket.priority))}</td>
      <td><span class="${statusClass(ticket.status)}">${escapeHtml(i18n().translateStatus(ticket.status))}</span></td>
      <td>${escapeHtml(ticket.assignee_name || '—')}</td>
      <td>${formatDate(ticket.updated_at)}</td>
    </tr>`
    )
    .join('');

  tbody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', () => openTicket(Number(row.dataset.id)));
  });
}

async function openTicket(id) {
  activeTicketId = id;
  const { ticket, comments } = await api(`/api/tickets/${id}`);
  const tr = i18n();
  const t = tr?.t;

  document.getElementById('modal-title').textContent = `#${ticket.id} — ${ticket.title}`;
  document.getElementById('modal-meta').innerHTML = `
    <div><span>${t('labelStatus')}</span> <span class="${statusClass(ticket.status)}">${escapeHtml(tr.translateStatus(ticket.status))}</span></div>
    <div><span>${t('labelPriority')}</span> ${escapeHtml(tr.translatePriority(ticket.priority))}</div>
    <div><span>${t('labelCategory')}</span> ${escapeHtml(tr.translateCategory(ticket.category))}</div>
    <div><span>${t('labelRequester')}</span> ${escapeHtml(ticket.requester_name)}</div>
    <div><span>${t('labelAssignee')}</span> ${escapeHtml(ticket.assignee_name || t('unassigned'))}</div>
    <div><span>${t('labelUpdated')}</span> ${formatDate(ticket.updated_at)}</div>
  `;
  document.getElementById('modal-description').textContent = ticket.description;

  const isStaff = ['handler', 'manager'].includes(currentUser.role);
  const actions = document.getElementById('modal-actions');
  actions.innerHTML = '';

  if (isStaff) {
    const assignSel = document.createElement('select');
    assignSel.innerHTML = `<option value="">${t('unassigned')}</option>`;
    handlers.forEach((h) => {
      assignSel.innerHTML += `<option value="${h.id}" ${ticket.assignee_id === h.id ? 'selected' : ''}>${escapeHtml(h.name)}</option>`;
    });
    assignSel.addEventListener('change', () =>
      updateTicket(id, { assignee_id: assignSel.value ? Number(assignSel.value) : null })
    );

    const assignLabel = document.createElement('label');
    assignLabel.textContent = t('assignLabel') + ' ';
    assignLabel.appendChild(assignSel);
    actions.appendChild(assignLabel);

    const statusSel = document.createElement('select');
    const allowed = meta.transitions[ticket.status] || [];
    statusSel.innerHTML = allowed
      .map((s) => `<option value="${s}">${escapeHtml(tr.translateStatus(s))}</option>`)
      .join('');
    const statusBtn = document.createElement('button');
    statusBtn.className = 'btn btn-secondary btn-sm';
    statusBtn.textContent = t('updateStatus');
    statusBtn.addEventListener('click', () => updateTicket(id, { status: statusSel.value }));
    actions.appendChild(statusSel);
    actions.appendChild(statusBtn);
  } else if (ticket.status === 'Resolved' && ticket.requester_id === currentUser.id) {
    const reopenBtn = document.createElement('button');
    reopenBtn.className = 'btn btn-secondary btn-sm';
    reopenBtn.textContent = t('reopenTicket');
    reopenBtn.addEventListener('click', () => updateTicket(id, { status: 'In Progress' }));
    actions.appendChild(reopenBtn);
  }

  const commentsEl = document.getElementById('modal-comments');
  commentsEl.innerHTML = comments.length
    ? comments
        .map(
          (c) =>
            `<div class="comment"><div class="author">${escapeHtml(c.author_name)} · ${formatDate(c.created_at)}</div>${escapeHtml(c.body)}</div>`
        )
        .join('')
    : `<p class="empty-state">${t('noComments')}</p>`;

  document.getElementById('ticket-modal').classList.add('open');
}

async function updateTicket(id, body) {
  try {
    await api(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    await openTicket(id);
    await loadTickets();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('new-ticket-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  try {
    await api('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        priority: form.priority.value,
      }),
    });
    form.reset();
    populateSelects();
    document.querySelector('[data-panel="tickets"]').click();
    await loadTickets();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = e.target.body.value;
  try {
    await api(`/api/tickets/${activeTicketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    e.target.reset();
    await openTicket(activeTicketId);
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('modal-close')?.addEventListener('click', () => {
  document.getElementById('ticket-modal').classList.remove('open');
});

document.getElementById('ticket-filter')?.addEventListener('change', loadTickets);
document.getElementById('status-filter')?.addEventListener('change', loadTickets);

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

async function loadDashboard() {
  const data = await api('/api/dashboard');
  const tr = i18n();
  const t = tr?.t;

  document.getElementById('stat-open').textContent = data.openCount;

  document.getElementById('list-by-status').innerHTML =
    data.byStatus
      .map(
        (r) =>
          `<li><span>${escapeHtml(tr.translateStatus(r.status))}</span><strong>${r.count}</strong></li>`
      )
      .join('') || `<li>${t('noData')}</li>`;

  document.getElementById('list-by-assignee').innerHTML =
    data.byAssignee
      .map((r) => {
        const name =
          r.assignee === 'Unassigned' ? t('unassigned') : escapeHtml(r.assignee);
        return `<li><span>${name}</span><strong>${r.count}</strong></li>`;
      })
      .join('') || `<li>${t('noData')}</li>`;

  document.getElementById('list-by-category').innerHTML =
    data.byCategory
      .map(
        (r) =>
          `<li><span>${escapeHtml(tr.translateCategory(r.category))}</span><strong>${r.count}</strong></li>`
      )
      .join('') || `<li>${t('noData')}</li>`;

  const overdueEl = document.getElementById('overdue-list');
  if (!data.overdue.length) {
    overdueEl.innerHTML = `<p class="empty-state">${t('noOverdue')}</p>`;
  } else {
    overdueEl.innerHTML = `<table class="ticket-table"><thead><tr>
      <th>${t('colId')}</th><th>${t('colTitle')}</th><th>${t('colStatus')}</th><th>${t('colAssignee')}</th><th>${t('colCreated')}</th>
    </tr></thead><tbody>
      ${data.overdue
        .map(
          (ticket) =>
            `<tr data-id="${ticket.id}"><td>#${ticket.id}</td><td>${escapeHtml(ticket.title)}</td><td>${escapeHtml(tr.translateStatus(ticket.status))}</td><td>${escapeHtml(ticket.assignee_name || '—')}</td><td>${formatDate(ticket.created_at)}</td></tr>`
        )
        .join('')}
    </tbody></table>`;
    overdueEl.querySelectorAll('tr[data-id]').forEach((row) => {
      row.addEventListener('click', () => openTicket(Number(row.dataset.id)));
    });
  }
}

function onLangChange() {
  setupClock();
  if (currentUser) {
    document.getElementById('user-role').textContent =
      i18n()?.translateRole(currentUser.role) || currentUser.role;
    populateSelects();
    loadTickets();
    const dashboardPanel = document.getElementById('panel-dashboard');
    if (dashboardPanel?.classList.contains('active')) loadDashboard();
    if (activeTicketId && document.getElementById('ticket-modal')?.classList.contains('open')) {
      openTicket(activeTicketId);
    }
  }
}

document.addEventListener('helpdesk:langchange', onLangChange);

async function bootstrap() {
  if (window.HelpDeskI18n && !window.HelpDeskI18n._ready) {
    await new Promise((resolve) => {
      document.addEventListener('helpdesk:langchange', resolve, { once: true });
    });
  }
  await init();
}

bootstrap();
