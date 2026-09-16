const MONTHLY_SALARY=124500;
const KEY_OVERRIDES="workSalaryOverrides";
const KEY_ANCHOR="workSalaryAnchor";
const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const GEN=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const now=new Date();
let currentYear=now.getFullYear(),currentMonth=now.getMonth(),selectedDate=null;
let overrides=JSON.parse(localStorage.getItem(KEY_OVERRIDES)||"{}");
let anchorStatus=localStorage.getItem(KEY_ANCHOR)||"work";

const $=id=>document.getElementById(id);
function key(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}
function firstWeekday(y,m){return (new Date(y,m,1).getDay()+6)%7}
function isToday(y,m,d){return y===now.getFullYear()&&m===now.getMonth()&&d===now.getDate()}

function getBaseStatus(date){
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const target=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const diff=Math.round((target-today)/86400000);
 let p=anchorStatus==="work"?((diff%4)+4)%4:(((diff+2)%4)+4)%4;
 return p<2?"work":"off";
}
function getStatus(y,m,d){
 const k=key(y,m,d);
 return Object.prototype.hasOwnProperty.call(overrides,k)?overrides[k]:getBaseStatus(new Date(y,m,d));
}
function stats(y,m){
 let total=daysInMonth(y,m),work=0;
 for(let d=1;d<=total;d++)if(getStatus(y,m,d)==="work")work++;
 return {total,work,off:total-work,rate:work?MONTHLY_SALARY/work:0};
}
function money(v){return Math.round(v).toLocaleString("ru-RU")}
function plural(n,a,b,c){let x=n%10,y=n%100;return x===1&&y!==11?a:x>=2&&x<=4&&(y<10||y>=20)?b:c}

function animateNumber(el,target){
 const start=performance.now(); el.classList.remove("number-change"); void el.offsetWidth; el.classList.add("number-change");
 function tick(t){let p=Math.min((t-start)/650,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e).toLocaleString("ru-RU");if(p<1)requestAnimationFrame(tick)}
 requestAnimationFrame(tick);
}

function half(y,m,start,end){
 const s=stats(y,m);let n=0;
 for(let d=start;d<=Math.min(end,s.total);d++)if(getStatus(y,m,d)==="work")n++;
 return {days:n,amount:n*s.rate};
}
function renderCalendar(direction="none"){
 $("calendarTitle").textContent=`${MONTHS[currentMonth]} ${currentYear}`;
 const grid=$("calendarGrid");grid.innerHTML="";
 for(let i=0;i<firstWeekday(currentYear,currentMonth);i++){let e=document.createElement("div");e.className="calendar-day empty";grid.appendChild(e)}
 for(let d=1;d<=daysInMonth(currentYear,currentMonth);d++){
  let status=getStatus(currentYear,currentMonth,d),cell=document.createElement("button");
  cell.className=`calendar-day ${status}${isToday(currentYear,currentMonth,d)?" today":""}`;
  cell.innerHTML=`<span class="day-number">${d}</span><span class="day-status"></span>`;
  cell.onclick=()=>{cell.classList.add("selected");openDay(currentYear,currentMonth,d)};
  grid.appendChild(cell);
 }
 if(direction!=="none"){grid.classList.remove("calendar-enter");void grid.offsetWidth;grid.classList.add("calendar-enter")}
 updateStats();
}
function updateStats(){
 const s=stats(currentYear,currentMonth),salary=s.work*s.rate;
 let py=currentYear,pm=currentMonth-1;if(pm<0){pm=11;py--}
 const first=half(currentYear,currentMonth,1,15),second=half(py,pm,16,999);
 animateNumber($("salaryAmount"),salary);
 $("salaryMonth").textContent=MONTHS[currentMonth];
 $("workDaysStat").textContent=s.work;$("offDaysStat").textContent=s.off;
 $("dayRateStat").textContent=`${money(s.rate)} ₽`;
 $("workedCaption").textContent=`${s.work} рабочих дней`;$("plannedCaption").textContent=`из ${s.work}`;
 $("salaryProgress").style.width=`${s.total?s.work/s.total*100:0}%`;
 $("advanceAmount").textContent=`${money(first.amount)} ₽`;$("advanceDays").textContent=`${first.days} ${plural(first.days,"смена","смены","смен")}`;
 $("salaryPaymentAmount").textContent=`${money(second.amount)} ₽`;$("salaryPaymentDays").textContent=`${second.days} ${plural(second.days,"смена","смены","смен")}`;
}
function openDay(y,m,d){
 selectedDate={y,m,d};$("selectedDateTitle").textContent=`${d} ${GEN[m]} ${y}`;
 $("dayModal").classList.add("active");document.body.style.overflow="hidden";
}
function closeModal(el){el.classList.remove("active");document.body.style.overflow="";selectedDate=null}
function setSelected(status){
 if(!selectedDate)return;overrides[key(selectedDate.y,selectedDate.m,selectedDate.d)]=status;
 localStorage.setItem(KEY_OVERRIDES,JSON.stringify(overrides));closeModal($("dayModal"));renderCalendar();
}
$("setWorkButton").onclick=()=>setSelected("work");$("setOffButton").onclick=()=>setSelected("off");
$("previousMonth").onclick=()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--}renderCalendar("previous")};
$("nextMonth").onclick=()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++}renderCalendar("next")};
$("settingsButton").onclick=()=>{$("settingsModal").classList.add("active");updateAnchor();document.body.style.overflow="hidden"};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal($(b.dataset.close)));
document.querySelectorAll(".modal-overlay").forEach(o=>o.onclick=e=>{if(e.target===o)closeModal(o)});
function updateAnchor(){
 $("todayWorkSetting").classList.toggle("active",anchorStatus==="work");
 $("todayOffSetting").classList.toggle("active",anchorStatus==="off");
}
function setAnchor(v){anchorStatus=v;localStorage.setItem(KEY_ANCHOR,v);updateAnchor();renderCalendar()}
$("todayWorkSetting").onclick=()=>setAnchor("work");$("todayOffSetting").onclick=()=>setAnchor("off");
$("resetButton").onclick=()=>{if(confirm("Удалить все ручные изменения графика?")){overrides={};localStorage.setItem(KEY_OVERRIDES,"{}");closeModal($("settingsModal"));renderCalendar()}};

let sx=0,sy=0;
$("calendarGrid").addEventListener("touchstart",e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
$("calendarGrid").addEventListener("touchend",e=>{let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.3)return;if(dx<0)$("nextMonth").click();else $("previousMonth").click()},{passive:true});

if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
updateAnchor();renderCalendar();