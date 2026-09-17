const RATE = 8300;
const KEY = "shift-salary-pwa-v1";
const state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  start: new Date().toISOString().slice(0,10),
  overrides: {}
};
let view = new Date(); view.setDate(1);

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const fmtMoney = n => `${Math.round(n).toLocaleString("ru-RU")} ₽`;
const fmtDate = d => d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});

function diffDays(a,b){
  const x = new Date(a.getFullYear(),a.getMonth(),a.getDate());
  const y = new Date(b.getFullYear(),b.getMonth(),b.getDate());
  return Math.round((x-y)/86400000);
}
function baseStatus(d){
  const start = parse(state.start);
  const diff = diffDays(d,start);
  if(diff < 0) return "off";
  return (diff % 4 < 2) ? "work" : "off";
}
function status(d){ return state.overrides[keyOf(d)] || baseStatus(d); }

function render(){
  $("monthTitle").textContent = view.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
  const first = new Date(view.getFullYear(),view.getMonth(),1);
  const offset = (first.getDay()+6)%7;
  const days = new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const grid = $("grid"); grid.innerHTML="";
  for(let i=0;i<offset;i++){ const e=document.createElement("div"); e.className="day empty"; grid.appendChild(e); }
  const today = new Date();
  for(let n=1;n<=days;n++){
    const d = new Date(view.getFullYear(),view.getMonth(),n);
    const k=keyOf(d), st=status(d), b=document.createElement("button");
    b.className=`day ${st} ${k===keyOf(today)?"today":""} ${(n===10||n===25)?"pay":""}`;
    b.innerHTML=`<span class="num">${n}</span><i class="dot"></i>`;
    b.onclick=()=>cycle(k);
    grid.appendChild(b);
  }
  updateStats();
  $("startText").textContent = fmtDate(parse(state.start));
}
function cycle(k){
  const d=parse(k), current=status(d);
  const next={work:"off",off:"sick",sick:"work"}[current];
  const base=baseStatus(d);
  if(next===base) delete state.overrides[k]; else state.overrides[k]=next;
  save(); render();
  showToast(next==="work"?"Рабочий день":next==="off"?"Выходной":"Больничный");
}
function monthStats(){
  const y=view.getFullYear(),m=view.getMonth(),days=new Date(y,m+1,0).getDate();
  let work=0, earned=0;
  for(let n=1;n<=days;n++){
    const d=new Date(y,m,n);
    if(status(d)==="work"){work++; earned+=RATE;}
  }
  return {work,earned};
}
function updateStats(){
  const now=new Date(), y=view.getFullYear(),m=view.getMonth();
  let earned=0, completed=0;
  const days=new Date(y,m+1,0).getDate();
  for(let n=1;n<=days;n++){
    const d=new Date(y,m,n);
    if(d<=now && status(d)==="work"){earned+=RATE;completed++;}
  }
  const all=monthStats();
  $("earned").textContent=fmtMoney(earned);
  $("earnedSub").textContent=`${completed} рабочих ${completed===1?"день":"дней"} уже прошло`;
  $("forecast").textContent=fmtMoney(all.earned);
  $("forecastSub").textContent=`${all.work} рабочих дней по текущему графику`;

  let candidates=[10,25].map(day=>new Date(now.getFullYear(),now.getMonth(),day))
    .filter(d=>d>=new Date(now.getFullYear(),now.getMonth(),now.getDate()));
  if(!candidates.length)candidates=[new Date(now.getFullYear(),now.getMonth()+1,10)];
  const next=candidates[0];
  const left=Math.max(0,diffDays(next,now));
  $("payday").textContent=left===0?"Сегодня":`${left} ${plural(left,"день","дня","дней")}`;
  $("paydaySub").textContent=`Следующая выплата: ${next.toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}`;
}
function plural(n,a,b,c){n=Math.abs(n)%100;const n1=n%10;return n>10&&n<20?c:n1>1&&n1<5?b:n1===1?a:c}
function showToast(t){const x=$("toast");x.textContent=t;x.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove("show"),1100)}

$("prev").onclick=()=>{view.setMonth(view.getMonth()-1);render()};
$("next").onclick=()=>{view.setMonth(view.getMonth()+1);render()};
$("todayBtn").onclick=()=>{view=new Date();view.setDate(1);render()};
$("chooseStart").onclick=()=>{const i=$("startDate");i.value=state.start;i.showPicker ? i.showPicker() : i.click()};
$("startDate").onchange=e=>{if(e.target.value){state.start=e.target.value;state.overrides={};save();view=parse(state.start);view.setDate(1);render();showToast("График обновлён")}};

render();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
