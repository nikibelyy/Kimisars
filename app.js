document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    const bottomSheet = document.getElementById('bottomSheet');
    const openAddModal = document.getElementById('openAddModal');
    const closeModal = document.getElementById('closeModal');
    const clientForm = document.getElementById('clientForm');
    const clientList = document.getElementById('clientList');
    
    // Элементы формы
    const modalTitle = document.getElementById('modalTitle');
    const inputId = document.getElementById('clientId');
    const inputName = document.getElementById('clientName');
    const inputCar = document.getElementById('carInfo');
    const inputPhone = document.getElementById('clientPhone');

    let clients = JSON.parse(localStorage.getItem('dtp_clients')) || [];

    // Открытие окна для ДОБАВЛЕНИЯ
    openAddModal.addEventListener('click', () => {
        clientForm.reset();
        inputId.value = '';
        modalTitle.textContent = 'Новое ДТП';
        modalOverlay.classList.add('active');
    });

    // Закрытие окна
    const closeForm = () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => clientForm.reset(), 400); // Очистка после скрытия
    };

    closeModal.addEventListener('click', closeForm);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeForm();
    });

    // Отрисовка списка
    function renderClients() {
        if (clients.length === 0) {
            clientList.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#8A8A8E; font-weight:500;">Список пуст. Добавьте первого клиента.</div>';
            return;
        }

        clientList.innerHTML = '';
        // Сортировка - новые сверху
        const sortedClients = [...clients].sort((a, b) => b.id - a.id);

        sortedClients.forEach((client, index) => {
            const date = new Date(client.id).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute:'2-digit'
            });

            const card = document.createElement('div');
            card.className = 'client-card';
            // Добавляем задержку анимации, чтобы карточки появлялись по очереди
            card.style.animationDelay = `${index * 0.05}s`; 
            card.innerHTML = `
                <h4>${client.name}</h4>
                <p>${client.car}</p>
                <p>${client.phone}</p>
                <div class="date">${date}</div>
                
                <div class="card-actions">
                    <button class="btn-action btn-edit" onclick="editClient(${client.id})">Изменить</button>
                    <button class="btn-action btn-delete" onclick="deleteClient(${client.id})">Удалить</button>
                </div>
            `;
            clientList.appendChild(card);
        });
    }

    // Сохранение (Добавление или Обновление)
    clientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idVal = inputId.value;
        const clientData = {
            name: inputName.value,
            car: inputCar.value,
            phone: inputPhone.value
        };

        if (idVal) {
            // Редактирование существующего
            const index = clients.findIndex(c => c.id == idVal);
            if (index !== -1) {
                clients[index] = { ...clients[index], ...clientData };
            }
        } else {
            // Создание нового
            clientData.id = Date.now();
            clients.push(clientData);
        }

        localStorage.setItem('dtp_clients', JSON.stringify(clients));
        renderClients();
        closeForm();
    });

    // Функция удаления (сделана глобальной для доступа из HTML)
    window.deleteClient = function(id) {
        if(confirm('Точно удалить эту запись?')) {
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem('dtp_clients', JSON.stringify(clients));
            renderClients();
        }
    };

    // Функция редактирования (сделана глобальной)
    window.editClient = function(id) {
        const client = clients.find(c => c.id === id);
        if (client) {
            inputId.value = client.id;
            inputName.value = client.name;
            inputCar.value = client.car;
            inputPhone.value = client.phone;
            
            modalTitle.textContent = 'Редактирование';
            modalOverlay.classList.add('active');
        }
    };

    renderClients();
});
