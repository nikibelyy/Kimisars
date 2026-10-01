const STORAGE_KEY = "work-calendar-shifts-v3";
const DAILY_RATE = 8300;
const CYCLE_ANCHOR = '2026-09-30'; // first working day of the 2/2 cycle
const CYCLE_WORK_DAYS = 2;
const CYCLE_OFF_DAYS = 2;
const CYCLE_LENGTH = CYCLE_WORK_DAYS + CYCLE_OFF_DAYS;

function isoDateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetweenISO(aISO, bISO) {
  const a = new Date(`${aISO}T12:00:00`);
  const b = new Date(`${bISO}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

function isScheduledWorkDay(dateISO) {
  const diff = daysBetweenISO(CYCLE_ANCHOR, dateISO);
  const pos = ((diff % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  return pos < CYCLE_WORK_DAYS;
}

const state = {
  view: new Date(),
  selected: new Date(),
  shifts: loadShifts()
};

const ruMonths = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

const $ = (id) => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dateFromKey = key => new Date(key + "T12:00:00");
const sameDay = (a,b) => keyOf(a) === keyOf(b);

function loadShifts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveShifts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.shifts));
}

function monthTitle(d) {
  return `${ruMonths[d.getMonth()]} ${d.getFullYear()}`;
}

function render() {
  $("monthTitle").textContent = monthTitle(state.view);
  $("monthLabel").textContent = monthTitle(state.view);
  renderCalendar();
  renderSelected();
}

function renderCalendar() {
  const grid = $("calendarGrid");
  grid.innerHTML = "";
  const y = state.view.getFullYear(), m = state.view.getMonth();
  const first = new Date(y,m,1);
  const start = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const prevDays = new Date(y,m,0).getDate();

  for (let i=0; i<42; i++) {
    const offset = i - start + 1;
    let d, muted = false;
    if (offset < 1) { d = new Date(y,m-1,prevDays+offset); muted=true; }
    else if (offset > daysInMonth) { d = new Date(y,m+1,offset-daysInMonth); muted=true; }
    else d = new Date(y,m,offset);

    const el = document.createElement("button");
    el.className = "day" + (muted ? " muted" : "") + (sameDay(d,state.selected) ? " selected" : "") + (sameDay(d,new Date()) ? " today" : "");
    el.innerHTML = `<span class="day-number">${d.getDate()}</span>`;
    const shifts = state.shifts[keyOf(d)] || [];
    if (shifts.length) {
      const dots = document.createElement("div");
      dots.className = "shift-dots";
      shifts.slice(0,3).forEach(() => {
        const dot = document.createElement("i"); dot.className="dot"; dots.appendChild(dot);
      });
      if (shifts.length > 3) {
        const more = document.createElement("span"); more.className="more-dot"; more.textContent="+"; dots.appendChild(more);
      }
      el.appendChild(dots);
    }
    el.addEventListener("click", () => {
      state.selected = d;
      if (d.getMonth() !== state.view.getMonth() || d.getFullYear() !== state.view.getFullYear()) state.view = new Date(d);
      render();
    });
    grid.appendChild(el);
  }
}

function formatMoney(n){return new Intl.NumberFormat("ru-RU").format(n);}
function renderSelected(){const d=state.selected,k=keyOf(d),worked=!!state.shifts[k]?.length;$("selectedDate").textContent=d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});$("dayPay").textContent=worked?`${formatMoney(DAILY_RATE)} ₽`:"0 ₽";$("workToggleTitle").textContent=worked?"Рабочий день добавлен":"Рабочий день";$("workToggleSub").textContent=worked?"8 300 ₽ уже учтены в зарплате":"Нажми, чтобы добавить 8 300 ₽";const list=$("shiftList");list.innerHTML="";if(!worked)list.innerHTML='<div class="empty">Выбери рабочий день — сумма добавится автоматически</div>';else{const item=document.createElement("div");item.className="shift";item.innerHTML=`<div class="shift-time">8 300 ₽<span>за день</span></div><div><div class="shift-name">Рабочая смена</div><div class="shift-note">${d.toLocaleDateString("ru-RU",{weekday:"long"})}</div></div><button class="shift-edit" type="button">×</button>`;item.querySelector(".shift-edit").onclick=()=>toggleWorkDay(d);list.appendChild(item);}renderSalary();}
function renderSalary(){const y=state.view.getFullYear(),m=state.view.getMonth(),prefix=`${y}-${pad(m+1)}-`;let total=0,pay10=0,pay25=0,days=0;for(const [date,shifts] of Object.entries(state.shifts)){if(!date.startsWith(prefix))continue;const amount=shifts.length*DAILY_RATE;total+=amount;days+=shifts.length;const day=Number(date.slice(8,10));if(day<=9)pay10+=amount;else pay25+=amount;}$("monthTotal").textContent=`${formatMoney(total)} ₽`;$("workedDays").textContent=days;$("pay10").textContent=`${formatMoney(pay10)} ₽`;$("pay25").textContent=`${formatMoney(pay25)} ₽`;}
function toggleWorkDay(date){const k=keyOf(date);if(state.shifts[k]?.length)delete state.shifts[k];else state.shifts[k]=[{id:crypto.randomUUID(),date:k,start:"00:00",end:"00:00",name:"Рабочий день",note:"8 300 ₽"}];saveShifts();render();}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function openSheet(shift=null) {
  $("sheet").classList.add("open");
  $("sheetBackdrop").classList.add("open");
  $("sheet").setAttribute("aria-hidden","false");
  $("sheetTitle").textContent = shift ? "Редактировать смену" : "Новая смена";
  $("shiftDate").value = shift?.date || keyOf(state.selected);
  $("startTime").value = shift?.start || "09:00";
  $("endTime").value = shift?.end || "18:00";
  $("shiftName").value = shift?.name || "Работа";
  $("shiftNote").value = shift?.note || "";
  $("editId").value = shift?.id || "";
  $("deleteBtn").style.display = shift ? "block" : "none";
}
function closeSheet() {
  $("sheet").classList.remove("open");
  $("sheetBackdrop").classList.remove("open");
  $("sheet").setAttribute("aria-hidden","true");
}

function changeMonth(delta) {
  state.view.setMonth(state.view.getMonth()+delta);
  const card = document.querySelector(".calendar-card");
  card.classList.remove("month-swipe-left","month-swipe-right");
  void card.offsetWidth;
  card.classList.add(delta > 0 ? "month-swipe-left" : "month-swipe-right");
  render();
}
$("prevMonth").onclick = () => changeMonth(-1);
$("nextMonth").onclick = () => changeMonth(1);
$("todayBtn").onclick = () => { state.view = new Date(); state.selected = new Date(); render(); };
$("closeSheet").onclick = closeSheet;
$("sheetBackdrop").onclick = closeSheet;
$("monthLabel").onclick = () => { state.view = new Date(state.selected); render(); };

$("shiftForm").onsubmit = e => {
  e.preventDefault();
  const date = $("shiftDate").value;
  const id = $("editId").value || crypto.randomUUID();
  const shift = {
    id, date, start:$("startTime").value, end:$("endTime").value,
    name:$("shiftName").value.trim() || "Работа", note:$("shiftNote").value.trim()
  };
  if (!state.shifts[date]) state.shifts[date] = [];
  const existingIndex = state.shifts[date].findIndex(s=>s.id===id);
  if (existingIndex >= 0) state.shifts[date][existingIndex] = shift;
  else state.shifts[date].push(shift);
  saveShifts();
  state.selected = dateFromKey(date);
  state.view = new Date(state.selected);
  closeSheet();
  render();
};

$("deleteBtn").onclick = () => {
  const id = $("editId").value, date = $("shiftDate").value;
  if (!id) return;
  state.shifts[date] = (state.shifts[date] || []).filter(s=>s.id!==id);
  if (!state.shifts[date].length) delete state.shifts[date];
  saveShifts();
  closeSheet();
  render();
};

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));

render();


// Native-feeling horizontal swipe on the calendar.
let touchStartX = 0, touchStartY = 0;
const calendarCard = document.querySelector(".calendar-card");
calendarCard.addEventListener("touchstart", e => {
  const t = e.changedTouches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
}, {passive:true});
calendarCard.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.25) changeMonth(dx < 0 ? 1 : -1);
}, {passive:true});

$("workToggle").onclick=()=>toggleWorkDay(state.selected);
