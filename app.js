const KEY="smena-v1";
const now=new Date();
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{
  rate:8300, advance:null, worked:{}
};
let viewDate=new Date(now.getFullYear(),now.getMonth(),1);

const $=s=>document.querySelector(s);
const fmt=n=>new Intl.NumberFormat("ru-RU").format(Math.round(n))+" ₽";
const pad=n=>String(n).padStart(2,"0");
const key=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const monthName=d=>new Intl.DateTimeFormat("ru-RU",{month:"long",year:"numeric"}).format(d);
const monthKey=()=>`${viewDate.getFullYear()}-${pad(viewDate.getMonth()+1)}`;
function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}
function firstMonday(y,m){let x=new Date(y,m,1).getDay();return (x+6)%7}

function render(){
  renderCalendar(); renderStats(); renderPayments(); updateHero();
}
function renderCalendar(){
  $("#monthTitle").textContent=monthName(viewDate).replace(" г.","");
  const cal=$("#calendar"); cal.innerHTML="";
  const y=viewDate.getFullYear(),m=viewDate.getMonth(), total=daysInMonth(y,m);
  for(let i=0;i<firstMonday(y,m);i++){const e=document.createElement("div");e.className="day empty";cal.append(e)}
  for(let d=1;d<=total;d++){
    const el=document.createElement("button"); el.className="day";
    const k=key(y,m,d); const date=new Date(y,m,d);
    if(state.worked[k]) el.classList.add("work");
    if(date.toDateString()===now.toDateString()) el.classList.add("today");
    el.textContent=d;
    el.onclick=()=>{state.worked[k]=!state.worked[k];save();render();toast(state.worked[k]?"Смена добавлена":"Смена снята")};
    cal.append(el);
  }
}
function monthWorked(){
  const y=viewDate.getFullYear(),m=viewDate.getMonth();
  return Array.from({length:daysInMonth(y,m)},(_,i)=>state.worked[key(y,m,i+1)]?i+1:null).filter(Boolean);
}
function renderStats(){
  const shifts=monthWorked().length, earned=shifts*state.rate;
  $("#statShifts").textContent=shifts;
  $("#statEarned").textContent=fmt(earned);
  $("#statAvg").textContent=fmt(daysInMonth(viewDate.getFullYear(),viewDate.getMonth())?earned/daysInMonth(viewDate.getFullYear(),viewDate.getMonth()):0);
  $("#statPercent").textContent=Math.round(shifts/daysInMonth(viewDate.getFullYear(),viewDate.getMonth())*100)+"%";
  $("#chartMonth").textContent=monthName(viewDate);
  const bars=$("#bars"); bars.innerHTML="";
  let max=Math.max(1,earned), run=0;
  monthWorked().forEach((d,i)=>{run+=state.rate; const b=document.createElement("div");b.className="bar";b.style.height=(run/max*100)+"%";b.title=`${d} число · ${fmt(run)}`;b.style.animationDelay=(i*18)+"ms";bars.append(b)});
}
function updateHero(){
  const y=now.getFullYear(),m=now.getMonth(), total=daysInMonth(y,m);
  const shifts=Array.from({length:total},(_,i)=>state.worked[key(y,m,i+1)]).filter(Boolean).length;
  const income=shifts*state.rate;
  $("#monthIncome").textContent=fmt(income);
  $("#workedDays").textContent=shifts+" "+(shifts===1?"смена":shifts>=2&&shifts<=4?"смены":"смен");
  $("#dailyRateLabel").textContent=fmt(state.rate)+" / смена";
  const passed=Math.min(now.getDate(),total);
  const progress=Math.min(100,shifts/Math.max(1,Math.ceil(passed/2))*100);
  $("#incomeProgress").style.width=Math.min(100,progress)+"%";
  const forecast=Math.round(total/2)*state.rate;
  $("#forecast").textContent=fmt(forecast);
}
function renderPayments(){
  const y=viewDate.getFullYear(),m=viewDate.getMonth();
  const shifts=monthWorked().length;
  const before10=Array.from({length:Math.min(10,daysInMonth(y,m))},(_,i)=>state.worked[key(y,m,i+1)]).filter(Boolean).length;
  const before25=Array.from({length:Math.min(25,daysInMonth(y,m))},(_,i)=>state.worked[key(y,m,i+1)]).filter(Boolean).length;
  const p10=Math.min(shifts,before10)*state.rate;
  const p25=Math.max(0,Math.min(shifts,before25)*state.rate-p10-(state.advance||0));
  $("#pay10").textContent=fmt(p10);
  $("#pay25").textContent=fmt(p25);
  $("#pay15").textContent=state.advance?fmt(state.advance):"—";
}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove("show"),1700)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.tab+"View").classList.add("active");
});
$("#prevMonth").onclick=()=>{viewDate.setMonth(viewDate.getMonth()-1);render()};
$("#nextMonth").onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);render()};
$("#autoScheduleBtn").onclick=()=>{
  const y=viewDate.getFullYear(),m=viewDate.getMonth(),total=daysInMonth(y,m);
  // Starts with the current month on a clean 2/2 cycle anchored to today's parity.
  // Users can still change any day manually.
  const anchor=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  for(let d=1;d<=total;d++){
    const delta=Math.round((new Date(y,m,d)-anchor)/86400000);
    state.worked[key(y,m,d)]=Math.abs(delta)%4<2;
  }
  save();render();toast("График 2/2 заполнен");
};
$("#settingsBtn").onclick=()=>{$("#rateInput").value=state.rate;$("#advanceInput").value=state.advance??"";$("#sheetBackdrop").classList.add("open")};
$("#closeSettings").onclick=()=>$("#sheetBackdrop").classList.remove("open");
$("#saveSettings").onclick=()=>{
  state.rate=Math.max(0,Number($("#rateInput").value)||8300);
  const a=$("#advanceInput").value.trim(); state.advance=a?Math.max(0,Number(a)):null;
  save();render();$("#sheetBackdrop").classList.remove("open");toast("Настройки сохранены");
};
$("#advanceBtn").onclick=()=>{$("#settingsBtn").click();setTimeout(()=>$("#advanceInput").focus(),250)};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();
