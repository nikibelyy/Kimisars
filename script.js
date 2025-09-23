function getData() {
  return JSON.parse(localStorage.getItem("zayavki") || "[]");
}

function saveData(data) {
  localStorage.setItem("zayavki", JSON.stringify(data));
}

function createRequest(client, description) {
  let data = getData();
  let id = Date.now();
  data.push({ id, client, description, status: "Ожидание" });
  saveData(data);
  return id;
}

function getRequest(id) {
  let data = getData();
  return data.find(r => r.id == id);
}

function updateStatus(id, status) {
  let data = getData();
  data = data.map(r => r.id == id ? { ...r, status } : r);
  saveData(data);
}
