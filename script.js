// Состояние приложения
let user = null;
let balance = 1000; // Стартовый демо-баланс
let players = [];
let currentRotation = 0;

const colors = ['#8b3dff', '#00d369', '#ff9900', '#ff4b4b', '#00bfff', '#e040fb'];

// Инициализация Canvas
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

function updateBalanceUI() {
  document.getElementById('balanceValue').innerText = `${balance.toLocaleString()} ₽`;
}

// Отрисовка колеса с пропорциональными секторам ставок
function drawWheel() {
  const totalBet = players.reduce((sum, p) => sum + p.bet, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (players.length === 0 || totalBet === 0) {
    ctx.beginPath();
    ctx.arc(170, 170, 160, 0, 2 * Math.PI);
    ctx.fillStyle = '#e6e6ed';
    ctx.fill();
    ctx.fillStyle = '#8c8c9a';
    ctx.font = '16px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('Сделайте ставку', 170, 175);
    return;
  }

  let startAngle = 0;
  players.forEach((player, index) => {
    const sliceAngle = (player.bet / totalBet) * (2 * Math.PI);

    ctx.beginPath();
    ctx.moveTo(170, 170);
    ctx.arc(170, 170, 160, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    // Подписи на секторах
    ctx.save();
    ctx.translate(170, 170);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Roboto';
    const percent = ((player.bet / totalBet) * 100).toFixed(1);
    if (sliceAngle > 0.2) {
      ctx.fillText(`${percent}%`, 100, 5);
    }
    ctx.restore();

    startAngle += sliceAngle;
  });
}

// Добавление ставки
document.getElementById('spinBtn').addEventListener('click', () => {
  const betInput = document.getElementById('betAmount');
  const amount = parseFloat(betInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert('Введите корректную сумму');
    return;
  }
  if (amount > balance) {
    alert('Недостаточно средств');
    return;
  }

  balance -= amount;
  updateBalanceUI();

  const name = user ? user.first_name : 'Вы (Гость)';
  players.push({ name, bet: amount });
  
  updatePlayersList();
  drawWheel();

  // Имитация запуска колеса, если в игре больше 1 игрока или по кнопке
  if (players.length >= 2) {
    spinWheel();
  }
});

function updatePlayersList() {
  const container = document.getElementById('playersContainer');
  const totalBet = players.reduce((sum, p) => sum + p.bet, 0);
  
  container.innerHTML = players.map(p => {
    const chance = ((p.bet / totalBet) * 100).toFixed(1);
    return `<li><span>${p.name}</span> <span>${p.bet} ₽ (Шанс: ${chance}%)</span></li>`;
  }).join('');
}

// Анимация вращения wheel
function spinWheel() {
  const totalBet = players.reduce((sum, p) => sum + p.bet, 0);
  const random = Math.random() * totalBet;
  let accumulated = 0;
  let winnerIndex = 0;

  for (let i = 0; i < players.length; i++) {
    accumulated += players[i].bet;
    if (random <= accumulated) {
      winnerIndex = i;
      break;
    }
  }

  // Расчет угла для победного сектора
  const extraDegrees = Math.floor(3600 + Math.random() * 360);
  currentRotation += extraDegrees;
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const winner = players[winnerIndex];
    alert(`Победил ${winner.name}! Выигрыш: ${totalBet} ₽`);
    
    if (winner.name.includes('Вы')) {
      balance += totalBet;
      updateBalanceUI();
    }
    
    // Сброс раунда
    players = [];
    updatePlayersList();
    drawWheel();
  }, 4000);
}

// Модальные окна
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function handleDeposit() {
  const val = parseFloat(document.getElementById('depositAmount').value);
  if (val && val >= 50) {
    balance += val;
    updateBalanceUI();
    closeModal('depositModal');
    alert('Баланс успешно пополнен!');
  }
}

function handleWithdraw() {
  const val = parseFloat(document.getElementById('withdrawAmount').value);
  if (val && val <= balance) {
    balance -= val;
    updateBalanceUI();
    closeModal('withdrawModal');
    alert('Заявка на вывод создана!');
  } else {
    alert('Неверная сумма!');
  }
}

// Интеграция VK ID (VK OAuth 2.1)
if (window.VKIDSDK) {
  const VKID = window.VKIDSDK;
  VKID.Config.init({
    app: 1234567, // Замените на ваш APP_ID из VK Developers
    redirectUrl: window.location.href,
    state: 'vk_auth',
  });

  const oneTap = new VKID.OneTap();
  const container = document.getElementById('userBlock');

  // Попытка отрисовки VK OneTap
  oneTap.render({
    container: container,
    scheme: VKID.Scheme.LIGHT,
    skin: VKID.Skin.PRIMARY,
  }).on(VKID.WidgetEvents.ERROR, () => {
    // Резервная кнопка, если SDK не сработал
  });
}

// Первоначальный рендер
updateBalanceUI();
drawWheel();
