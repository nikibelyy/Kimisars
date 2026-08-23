// Инициализация базы данных
let clients = JSON.parse(localStorage.getItem('yoo_clients_v2')) || [];
let editingId = null; // Хранит ID клиента, если мы его редактируем

// Сохранение в память
function saveToLocal() {
  localStorage.setItem('yoo_clients_v2', JSON.stringify(clients));
}

// Форматирование чисел (10000 -> 10 000)
function formatMoney(num) {
  return Number(num).toLocaleString('ru-RU');
}

// Получение первой буквы для аватарки
function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

// Главная функция отрисовки интерфейса
function renderClients() {
  const list = document.getElementById('clients-list');
  const revenueEl = document.getElementById('total-revenue');
  
  list.innerHTML = '';
  let total = 0;

  if (clients.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#8B94A3; margin-top: 20px;">Список пуст. Добавьте первого клиента.</p>';
  }

  clients.forEach((client, index) => {
    total += Number(client.price);
    
    const card = document.createElement('div');
    card.className = 'client-item';
    card.style.animationDelay = `${index * 0.05}s`; // Красивое каскадное появление
    
    // Вешаем обработчик клика на всю карточку для редактирования
    card.onclick = () => openSheet(client.id);

    card.innerHTML = `
      <div class="client-avatar">${getInitials(client.name)}</div>
      <div class="client-details">
        <div class="client-name">${client.name}</div>
        <div class="client-service">${client.service || 'Без услуги'}</div>
      </div>
      <div class="client-sum">+${formatMoney(client.price)} ₽</div>
    `;
    
    list.appendChild(card);
  });

  revenueEl.innerText = formatMoney(total);
}

// Открытие шторки (Bottom Sheet)
function openSheet(id = null) {
  editingId = id;
  const sheet = document.getElementById('bottom-sheet');
  const title = document.getElementById('sheet-title');
  const btnDelete = document.getElementById('btn-delete');

  const nameInput = document.getElementById('client-name');
  const serviceInput = document.getElementById('client-service');
  const priceInput = document.getElementById('client-price');

  if (id) {
    // Режим РЕДАКТИРОВАНИЯ
    const client = clients.find(c => c.id === id);
    title.innerText = 'Редактировать';
    nameInput.value = client.name;
    serviceInput.value = client.service;
    priceInput.value = client.price;
    btnDelete.classList.remove('hidden'); // Показываем кнопку удаления
  } else {
    // Режим ДОБАВЛЕНИЯ
    title.innerText = 'Новый клиент';
    nameInput.value = '';
    serviceInput.value = '';
    priceInput.value = '';
    btnDelete.classList.add('hidden'); // Прячем кнопку удаления
  }

  sheet.classList.add('active');
}

// Закрытие шторки
function closeSheet() {
  document.getElementById('bottom-sheet').classList.remove('active');
  editingId = null;
}

// Закрытие по клику на темный фон
function closeSheetOnBg(event) {
  if (event.target === document.getElementById('bottom-sheet')) {
    closeSheet();
  }
}

// Сохранение (Добавление нового ИЛИ обновление старого)
function saveClient() {
  const name = document.getElementById('client-name').value.trim();
  const service = document.getElementById('client-service').value.trim();
  const price = document.getElementById('client-price').value.trim();

  if (!name || !price) {
    alert("Введите имя и сумму!");
    return;
  }

  if (editingId) {
    // Обновляем существующего
    const index = clients.findIndex(c => c.id === editingId);
    if (index !== -1) {
      clients[index] = { id: editingId, name, service, price };
    }
  } else {
    // Создаем нового с уникальным ID (через Date.now())
    clients.unshift({ 
      id: Date.now().toString(), 
      name, 
      service, 
      price 
    });
  }

  saveToLocal();
  renderClients();
  closeSheet();
}

// Удаление клиента
function deleteClient() {
  if (!editingId) return;
  
  // Запрашиваем подтверждение (стандартная практика iOS)
  if(confirm("Удалить эту запись?")) {
    clients = clients.filter(c => c.id !== editingId);
    saveToLocal();
    renderClients();
    closeSheet();
  }
}

// Первичный запуск
renderClients();
