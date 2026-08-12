document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    const openAddModal = document.getElementById('openAddModal');
    const closeModal = document.getElementById('closeModal');
    const addClientForm = document.getElementById('addClientForm');
    const clientList = document.getElementById('clientList');

    // Открытие/закрытие Bottom Sheet
    openAddModal.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    // Закрытие по клику вне окна
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    // Загрузка клиентов из LocalStorage (Офлайн база)
    let clients = JSON.parse(localStorage.getItem('dtp_clients')) || [];

    function renderClients() {
        if (clients.length === 0) {
            clientList.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px; color:#8A8A8E;">Нет записей. Добавьте клиента.</div>';
            return;
        }

        clientList.innerHTML = '';
        // Показываем новые записи сверху
        clients.slice().reverse().forEach(client => {
            const date = new Date(client.id).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
            });

            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <h4>${client.name}</h4>
                <p>🚗 ${client.car}</p>
                <p>📞 ${client.phone}</p>
                <p style="font-size: 11px; margin-top: 8px; color: #B0B0B0;">🕒 ${date}</p>
            `;
            clientList.appendChild(card);
        });
    }

    // Сохранение нового клиента
    addClientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newClient = {
            id: Date.now(), // Уникальный ID на основе времени
            name: document.getElementById('clientName').value,
            car: document.getElementById('carInfo').value,
            phone: document.getElementById('clientPhone').value
        };

        clients.push(newClient);
        localStorage.setItem('dtp_clients', JSON.stringify(clients));
        
        renderClients();
        addClientForm.reset();
        modalOverlay.classList.remove('active');
    });

    // Инициализация отрисовки
    renderClients();

    // Регистрация Service Worker для работы без интернета
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker зарегистрирован', reg))
            .catch(err => console.error('Ошибка регистрации SW', err));
    }
});
