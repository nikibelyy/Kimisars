// Читаем все заявки из localStorage
function getData() {
  return JSON.parse(localStorage.getItem("zayavki") || "[]");
}

// Сохраняем заявки
function saveData(data) {
  localStorage.setItem("zayavki", JSON.stringify(data));
}

// Создать заявку
function createRequest(client, description, price) {
  let data = getData();
  let id = Date.now();
  data.push({ id, client, description, price, status: "Ожидание" });
  saveData(data);
  return id;
}

// Получить заявку по ID
function getRequest(id) {
  let data = getData();
  return data.find(r => r.id == id);
}

// Обновить статус заявки
function updateStatus(id, status) {
  let data = getData();
  data = data.map(r => r.id == id ? { ...r, status } : r);
  saveData(data);
}
