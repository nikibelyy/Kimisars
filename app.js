document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    const openAddModal = document.getElementById('openAddModal');
    const closeModal = document.getElementById('closeModal');
    const clientForm = document.getElementById('clientForm');
    const clientList = document.getElementById('clientList');
    
    const clientCountElem = document.getElementById('clientCount');
    const exportBtn = document.getElementById('exportBtn');
    
    const modalTitle = document.getElementById('modalTitle');
    const inputId = document.getElementById('clientId');
    const inputName = document.getElementById('clientName');
    const inputCar = document.getElementById('carInfo');
    const inputPhone = document.getElementById('clientPhone');

    let clients = JSON.parse(localStorage.getItem('dtp_clients')) || [];

    // Открытие окна
    openAddModal.addEventListener('click', () => {
        clientForm.reset();
        inputId.value = '';
        modalTitle.textContent = 'Новое ДТП';
        modalOverlay.classList.add('active');
    });

    const closeForm = () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => clientForm.reset(), 400);
    };

    closeModal.addEventListener('click', closeForm);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeForm();
    });

    function renderClients() {
        // Обновляем счетчик
        clientCountElem.textContent = clients.length;

        if (clients.length === 0) {
            clientList.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#A0A0A5; font-weight:500;">База пуста. Добавьте первого клиента.</div>';
            return;
        }

        clientList.innerHTML = '';
        const sortedClients = [...clients].sort((a, b) => b.id - a.id);

        sortedClients.forEach((client, index) => {
            const date = new Date(client.id).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute:'2-digit'
            });

            const card = document.createElement('div');
            card.className = 'client-card';
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

    clientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idVal = inputId.value;
        const clientData = {
            name: inputName.value,
            car: inputCar.value,
            phone: inputPhone.value
        };

        if (idVal) {
            const index = clients.findIndex(c => c.id == idVal);
            if (index !== -1) clients[index] = { ...clients[index], ...clientData };
        } else {
            clientData.id = Date.now();
            clients.push(clientData);
        }

        localStorage.setItem('dtp_clients', JSON.stringify(clients));
        renderClients();
        closeForm();
    });

    window.deleteClient = function(id) {
        if(confirm('Точно удалить эту запись?')) {
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem('dtp_clients', JSON.stringify(clients));
            renderClients();
        }
    };

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

    // ФУНКЦИЯ ВЫГРУЗКИ В EXCEL (CSV)
    exportBtn.addEventListener('click', () => {
        if (clients.length === 0) {
            alert('База пуста! Нечего выгружать.');
            return;
        }

        // BOM для корректного отображения кириллицы в Excel
        let csvContent = "\uFEFF"; 
        csvContent += "ФИО;Автомобиль и госномер;Телефон;Дата добавления\n"; // Заголовки (разделитель точка с запятой)

        clients.forEach(c => {
            let date = new Date(c.id).toLocaleString('ru-RU');
            // Убираем возможные точки с запятой из текста пользователя, чтобы не сломать таблицу
            let name = c.name.replace(/;/g, ',');
            let car = c.car.replace(/;/g, ',');
            let phone = c.phone.replace(/;/g, ',');
            
            csvContent += `${name};${car};${phone};${date}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const today = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
        a.href = url;
        a.download = `База_ДТП_${today}.csv`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    renderClients();
});
