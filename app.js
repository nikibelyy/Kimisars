let clients = JSON.parse(localStorage.getItem('premium_clients')) || [];
let editingId = null;

// Текущая дата
const dateEl = document.getElementById('current-date');
const options = { month: 'long', day: 'numeric', weekday: 'long' };
dateEl.innerText = new Date().toLocaleDateString('ru-RU', options);

function saveToLocal() {
  localStorage.setItem('premium_clients', JSON.stringify(clients));
}

function formatMoney(num) {
  return Number(num).toLocaleString('ru-RU');
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : 'C';
}

function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';

  if (clients.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#8A8F9E; margin-top: 40px;">У вас пока нет записей.<br>Нажмите + чтобы добавить.</p>';
  }

  clients.forEach((client, index) => {
    const card = document.createElement('div');
    card.className = 'client-item';
    card.style.animationDelay = `${index * 0.08}s`;
    
    card.onclick = () => openSheet(client.id);

    card.innerHTML = `
      <div class="client-avatar">${getInitials(client.name)}</div>
      <div class="client-details">
        <div class="client-name">${client.name}</div>
        <div class="client-service">${client.service || 'Без описания'}</div>
      </div>
      <div class="client-sum">${formatMoney(client.price)} ₽</div>
    `;
    
    list.appendChild(card);
  });
}

function openSheet(id = null) {
  editingId = id;
  const sheet = document.getElementById('bottom-sheet');
  const title = document.getElementById('sheet-title');
  const btnDelete = document.getElementById('btn-delete');

  const nameInput = document.getElementById('client-name');
  const serviceInput = document.getElementById('client-service');
  const priceInput = document.getElementById('client-price');

  if (id) {
    const client = clients.find(c => c.id === id);
    title.innerText = 'Изменить запись';
    nameInput.value = client.name;
    serviceInput.value = client.service;
    priceInput.value = client.price;
    btnDelete.classList.remove('hidden');
  } else {
    title.innerText = 'Новая запись';
    nameInput.value = '';
    serviceInput.value = '';
    priceInput.value = '';
    btnDelete.classList.add('hidden');
  }

  sheet.classList.add('active');
}

function closeSheet() {
  document.getElementById('bottom-sheet').classList.remove('active');
  editingId = null;
}

function closeSheetOnBg(event) {
  if (event.target === document.getElementById('bottom-sheet')) {
    closeSheet();
  }
}

function saveClient() {
  const name = document.getElementById('client-name').value.trim();
  const service = document.getElementById('client-service').value.trim();
  const price = document.getElementById('client-price').value.trim();

  if (!name || !price) {
    alert("Имя и сумма обязательны!");
    return;
  }

  if (editingId) {
    const index = clients.findIndex(c => c.id === editingId);
    if (index !== -1) {
      clients[index] = { id: editingId, name, service, price };
    }
  } else {
    clients.unshift({ id: Date.now().toString(), name, service, price });
  }

  saveToLocal();
  renderClients();
  closeSheet();
}

function deleteClient() {
  if (!editingId) return;
  if(confirm("Точно удалить?")) {
    clients = clients.filter(c => c.id !== editingId);
    saveToLocal();
    renderClients();
    closeSheet();
  }
}

renderClients();
