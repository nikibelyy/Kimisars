// Автоматический перевод букв серии в верхний регистр
document.getElementById('serial').addEventListener('input', function(e) {
  this.value = this.value.toUpperCase();
});

let currentGeneratedUrl = '';

function handleSubmit(event) {
  event.preventDefault();
  
  const serial = document.getElementById('serial').value.trim();
  const number = document.getElementById('number').value.trim();
  const submitBtn = document.getElementById('submitBtn');
  const spinner = document.getElementById('spinner');

  if (!serial || !number) return;

  // Эффект загрузки в кнопке
  submitBtn.querySelector('span').textContent = 'Формирование...';
  spinner.classList.remove('hidden');

  // Формируем URL с правильным кодированием Кириллицы (encodeURIComponent)
  const encodedSerial = encodeURIComponent(serial);
  const encodedNumber = encodeURIComponent(number);
  currentGeneratedUrl = `https://www.nsis.ru/qr/check-policy/?serial=${encodedSerial}&number=${encodedNumber}`;

  setTimeout(() => {
    // Сброс состояния кнопки
    submitBtn.querySelector('span').textContent = 'Проверить полис';
    spinner.classList.add('hidden');

    // Отображаем модальный экран результатов
    document.getElementById('generatedUrl').textContent = currentGeneratedUrl;
    document.getElementById('redirectBtn').href = currentGeneratedUrl;
    
    openModal();
  }, 400);
}

function openModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function copyLink() {
  if (!currentGeneratedUrl) return;
  navigator.clipboard.writeText(currentGeneratedUrl).then(() => {
    alert('Ссылка успешно скопирована в буфер обмена!');
  });
}

// Регистрация Service Worker для поддержки PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg error:', err));
  });
}
