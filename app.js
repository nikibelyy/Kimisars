// Регистрируем Service Worker для PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

let clients = JSON.parse(localStorage.getItem('yoo_clients')) || [];

function saveClients() {
  localStorage.setItem('yoo_clients', JSON.stringify(clients));
}

function renderClients() {
  const list = document.getElementById('clients-list');
  const revenueEl = document.getElementById('total-revenue');
  list.innerHTML = '';
  
  let total = 0;

  clients.forEach((client, index) => {
    total += Number(client.price);
    
    const card = document.createElement('div');
    card.className = 'client-card';
    card.style.animationDelay = `${index * 0.1}s`; // Каскадная анимация
    
    card.innerHTML = `
      <div class="client-info">
        <h3>${client.name}</h3>
        <p>${client.service}</p>
      </div>
      <div class="client-price">+${client.price} ₽</div>
    `;
    list.appendChild(card);
  });

  revenueEl.innerText = total.toLocaleString('ru-RU');
}

function toggleModal() {
  const modal = document.getElementById('add-modal');
  modal.classList.toggle('active');
}

function addClient() {
  const name = document.getElementById('client-name').value;
  const service = document.getElementById('client-service').value;
  const price = document.getElementById('client-price').value;

  if(!name || !price) {
    alert("Пожалуйста, введите имя и сумму");
    return;
  }

  clients.unshift({ name, service, price });
  saveClients();
  renderClients();
  
  // Очистка
  document.getElementById('client-name').value = '';
  document.getElementById('client-service').value = '';
  document.getElementById('client-price').value = '';
  
  toggleModal();
}

// Первичный рендер
renderClients();
