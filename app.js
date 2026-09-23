const KEY="workshift_v1";
const rate = Number(localStorage.getItem("privateDailyRate") || atob("ODMwMA=="));
localStorage.setItem("privateDailyRate", String(rate));

const state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  start: new Date().toISOString().slice(0,10),
  type: "work",
  manual: {},
  pay1: 15,
  pay2: 30
};
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
let view = new Date();

const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(n)+" ₽";
const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
const startDate=()=>new Date(state.start+"T00:00:00");

function isWork(d){
  const k=iso(d);
  if(state.manual[k]) return state.manual[k]==="work";
  const diff=Math.floor((new Date(k+"T00:00:00")-startDate())/86400000);
  const idx=((diff%4)+4)%4;
  return state.type==="work" ? idx<2 : idx>=2;
}
function isPay(d){const n=d.getDate(), last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return n===Number(state.pay1)||n===Number(state.pay2)||n===last}
function monthStats(y,m){let days=new Date(y,m+1,0).getDate(), w=0,p=0;for(let n=1;n<=days;n++){let d=new Date(y,m,n);if(isWork(d))w++;if(isPay(d))p++}return {w,p,income:w*rate}}
function render(){
  const y=view.getFullYear(),m=view.getMonth();
  $("#monthTitle").textContent=new Intl.DateTimeFormat("ru-RU",{month:"long",year:"numeric"}).format(view).replace(/^./,x=>x.toUpperCase());
  const s=monthStats(y,m);
  $("#monthIncome").textContent=money(s.income);$("#monthWorkdays").textContent=`${s.w} ${s.w===1?"рабочий день":"рабочих дней"}`;
  $("#statMonth").textContent=money(s.income);$("#statDays").textContent=s.w;$("#statPays").textContent=s.p;
  const yearTotal=[...Array(12)].reduce((a,_,i)=>a+monthStats(y,i).income,0);$("#statYear").textContent=money(yearTotal);$("#yearLabel").textContent=y;
  const ring=Math.min(100,Math.round(s.w/15*100));$("#monthRing").style.setProperty("--p",ring+"%");$("#ringValue").textContent=ring+"%";
  const cal=$("#calendar");cal.innerHTML="";
  const weekdays=["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"], w=document.createElement("div");w.className="week";
  weekdays.forEach(x=>{let e=document.createElement("span");e.textContent=x;w.append(e)});cal.append(w);
  const grid=document.createElement("div");grid.className="days";
  const first=new Date(y,m,1), offset=(first.getDay()+6)%7, total=new Date(y,m+1,0).getDate();
  for(let i=0;i<offset;i++){let e=document.createElement("div");e.className="day empty";grid.append(e)}
  for(let n=1;n<=total;n++){let d=new Date(y,m,n),e=document.createElement("button");e.className="day "+(isWork(d)?"work":"rest")+(iso(d)===iso(new Date())?" today":"")+(isPay(d)?" pay":"");e.innerHTML=`<span class="num">${n}</span><span class="state">${isWork(d)?"работа":"выходной"}</span>`;e.onclick=()=>toggleDay(d);grid.append(e)}
  cal.append(grid);
  renderBars(y);
}
function toggleDay(d){const k=iso(d);state.manual[k]=isWork(d)?"rest":"work";save();render();toast("День изменён")}
function renderBars(y){const el=$("#bars");el.innerHTML="";const vals=[...Array(12)].map((_,i)=>monthStats(y,i).income), max=Math.max(...vals,1);vals.forEach((v,i)=>{let w=document.createElement("div");w.className="bar-wrap";w.innerHTML=`<div class="bar" style="height:${Math.max(3,v/max*100)}%"></div><div class="bar-label">${new Intl.DateTimeFormat("ru-RU",{month:"short"}).format(new Date(y,i,1)).replace(".","")}</div>`;el.append(w)})}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1300)}
$("#todayBtn").onclick=()=>{view=new Date();render()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.screen).classList.add("active")});
document.querySelector("#calendar").addEventListener("touchstart",()=>{}, {passive:true});
let sx=0;$("#calendar").addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});$("#calendar").addEventListener("touchend",e=>{let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60){view.setMonth(view.getMonth()+(dx<0?1:-1));render()}},{passive:true});
$("#cycleStart").value=state.start;$("#cycleType").value=state.type;$("#pay1").value=state.pay1;$("#pay2").value=state.pay2;
$("#cycleStart").onchange=e=>{state.start=e.target.value;state.manual={};save();render();toast("Цикл обновлён")};
$("#cycleType").onchange=e=>{state.type=e.target.value;state.manual={};save();render()};
$("#pay1").onchange=e=>{state.pay1=e.target.value;save();render()};$("#pay2").onchange=e=>{state.pay2=e.target.value;save();render()};
$("#resetBtn").onclick=()=>{state.manual={};save();render();toast("Отметки сброшены")};
render();

if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(()=>{});}
