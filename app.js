// Простая обёртка над IndexedDB
const DB_NAME = 'crm-db';
const STORE = 'clients';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('carNumber', 'carNumber', { unique: false });
        store.createIndex('carMake', 'carMake', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(client) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(client);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Формулы
function calcSalary(amount, dealType) {
  const sum = Number(amount) || 0;
  if (dealType === 'cession') return +(sum * 0.15).toFixed(2);
  if (dealType === '25') return +(sum * 0.25).toFixed(2);
  return +(sum * 0.30).toFixed(2);
}

function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(Number(n||0));
}

// UI элементы
const form = document.getElementById('clientForm');
const salaryPreview = document.getElementById('salaryPreview');
const amountInput = document.getElementById('amount');
const dealRadios = form.querySelectorAll('input[name="dealType"]');
const list = document.getElementById('clientList');
const emptyState = document.getElementById('emptyState');
const search = document.getElementById('search');

// live‑подсчёт
function updatePreview() {
  const deal = form.dealType.value;
  const amount = amountInput.value;
  const salary = calcSalary(amount, deal);
  salaryPreview.value = formatMoney(salary);
}
amountInput.addEventListener('input', updatePreview);
dealRadios.forEach(r => r.addEventListener('change', updatePreview));
updatePreview();

// сохранение
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const client = {
    name: form.name.value.trim(),
    carNumber: form.carNumber.value.trim().toUpperCase(),
    carMake: form.carMake.value.trim(),
    amount: Number(form.amount.value || 0),
    dealType: form.dealType.value,
    salary: calcSalary(form.amount.value, form.dealType.value),
    createdAt: new Date().toISOString()
  };
  await dbPut(client);
  form.reset();
  updatePreview();
  await renderList();
  // легкая вибрация на iPhone
  if (navigator.vibrate) navigator.vibrate(10);
});

// рендер списка
async function renderList() {
  const q = search.value.trim().toLowerCase();
  let clients = await dbGetAll();
  clients.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (q) {
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.carNumber.toLowerCase().includes(q) ||
      c.carMake.toLowerCase().includes(q)
    );
  }
  list.innerHTML = '';
  if (!clients.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (const c of clients) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    const right = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${c.name} — ${c.carNumber}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const dealLabel = c.dealType === 'cession' ? 'Цессия 15%' : (c.dealType + '%');
    meta.textContent = `${c.carMake} • Сумма: ${formatMoney(c.amount)} • Моя зарплата: ${formatMoney(c.salary)}`;

    left.appendChild(title);
    left.appendChild(meta);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = dealLabel;

    right.appendChild(badge);

    li.appendChild(left);
    li.appendChild(right);

    li.addEventListener('click', () => openEdit(c));
    list.appendChild(li);
  }
}

search.addEventListener('input', renderList);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') renderList();
});
renderList();

// Редактирование
const editDialog = document.getElementById('editDialog');
const editForm = document.getElementById('editForm');
const deleteBtn = document.getElementById('deleteBtn');
const editSalary = document.getElementById('editSalary');

function openEdit(c) {
  editForm.reset();
  document.getElementById('editId').value = c.id;
  document.getElementById('editName').value = c.name;
  document.getElementById('editCarNumber').value = c.carNumber;
  document.getElementById('editCarMake').value = c.carMake;
  document.getElementById('editAmount').value = c.amount;
  const type = c.dealType === 'cession' ? 'editDealCes' : (c.dealType === '25' ? 'editDeal25' : 'editDeal30');
  document.getElementById(type).checked = true;
  editSalary.value = formatMoney(calcSalary(c.amount, c.dealType));
  editDialog.showModal();
}

['editAmount','editDeal30','editDeal25','editDealCes'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const amount = Number(document.getElementById('editAmount').value || 0);
    const dealType = document.getElementById('editDealCes').checked ? 'cession' :
                     document.getElementById('editDeal25').checked ? '25' : '30';
    editSalary.value = formatMoney(calcSalary(amount, dealType));
  });
});

editForm.addEventListener('close', () => {});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('editId').value);
  const updated = {
    id,
    name: document.getElementById('editName').value.trim(),
    carNumber: document.getElementById('editCarNumber').value.trim().toUpperCase(),
    carMake: document.getElementById('editCarMake').value.trim(),
    amount: Number(document.getElementById('editAmount').value || 0),
    dealType: document.getElementById('editDealCes').checked ? 'cession' :
              document.getElementById('editDeal25').checked ? '25' : '30',
  };
  updated.salary = calcSalary(updated.amount, updated.dealType);
  updated.updatedAt = new Date().toISOString();
  await dbPut(updated);
  editDialog.close();
  await renderList();
});

deleteBtn.addEventListener('click', async () => {
  const id = Number(document.getElementById('editId').value);
  if (confirm('Удалить клиента?')) {
    await dbDelete(id);
    editDialog.close();
    await renderList();
  }
});

// PWA install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
installBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return alert('Установка недоступна.');
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// Поддержка iOS: добавить к домашнему экрану вручную (подсказка)
if (!('BeforeInstallPromptEvent' in window)) {
  // На iOS кнопка установки скрыта
}
