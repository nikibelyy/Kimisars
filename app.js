const RATE=8300, PLAN=124500, OV="liquidOverrides", AN="liquidAnchor";
const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const GEN=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const now=new Date();let cy=now.getFullYear(),cm=now.getMonth(),selected=null;
let overrides=JSON.parse(localStorage.getItem(OV)||"{}"),anchor=localStorage.getItem(AN)||"work";
const $=id=>document.getElementById(id);
const dim=(y,m)=>new Date(y,m+1,0).getDate(), off=(y,m)=>(new Date(y,m,1).getDay()+6)%7;
const key=(y,m,d)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
function base(date){const t=new Date(now.getFullYear(),now.getMonth(),now.getDate()),x=new Date(date.getFullYear(),date.getMonth(),date.getDate()),d=Math.round((x-t)/86400000),p=anchor==="work"?((d%4)+4)%4:(((d+2)%4)+4)%4;return p<2?"work":"off"}
function status(y,m,d){const k=key(y,m,d);return Object.hasOwn(overrides,k)?overrides[k]:base(new Date(y,m,d))}
function stats(y,m){let n=dim(y,m),w=0;for(let d=1;d<=n;d++)if(status(y,m,d)==="work")w++;return{n,w,off:n-w}}
function money(v){return Math.round(v).toLocaleString("ru-RU")}
function plural(n){let a=n%10,b=n%100;return a===1&&b!==11?"смена":a>=2&&a<=4&&(b<10||b>=20)?"смены":"смен"}
function animate(el,target){const start=performance.now(),from=Number((el.textContent||"0").replace(/\D/g,""))||0;function f(t){let p=Math.min((t-start)/600,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(target-from)*e).toLocaleString("ru-RU");if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function half(y,m,a,b){let s=stats(y,m),n=0;for(let d=a;d<=Math.min(b,s.n);d++)if(status(y,m,d)==="work")n++;return{n,amount:n*RATE}}
function monthSalary(y,m){return stats(y,m).w*RATE}
function renderCalendar(){
 $("monthTitle").textContent=`${MONTHS[cm]} ${cy}`;let g=$("calendarGrid");g.innerHTML="";
 for(let i=0;i<off(cy,cm);i++)g.insertAdjacentHTML("beforeend",'<div class="day empty"></div>');
 for(let d=1;d<=dim(cy,cm);d++){let b=document.createElement("button"),work=status(cy,cm,d)==="work",today=cy===now.getFullYear()&&cm===now.getMonth()&&d===now.getDate();b.className=`day ${work?"work":"off"}${today?" today":""}`;b.innerHTML=`<span class="num">${d}</span><i class="status-dot"></i>`;b.onclick=()=>openSheet(cy,cm,d);g.appendChild(b)}
 updateAll()
}
function updateAll(){
 let s=stats(cy,cm),salary=s.w*RATE,percent=Math.min(salary/PLAN*100,100);
 animate($("calendarSalary"),salary);animate($("salaryBig"),salary);$("salaryShiftCount").textContent=`${s.w} ${plural(s.w)}`;$("salaryRate").textContent=`${money(RATE)} ₽ / смена`;$("salaryPlan").textContent=`План ${money(PLAN)} ₽`;$("salaryPercent").textContent=`${Math.round(salary/PLAN*100)}%`;$("salaryBar").style.width=`${percent}%`;
 $("todayWorked").textContent=s.w;$("todayEarned").textContent=`${money(salary)} ₽`;
 updatePayments();updateToday();updateAnchor()
}
function updatePayments(){
 let f=half(cy,cm,1,15),py=cy,pm=cm-1;if(pm<0){pm=11;py--}let q=half(py,pm,16,999);
 $("advanceAmount").textContent=`${money(f.amount)} ₽`;$("advanceDays").textContent=`${f.n} ${plural(f.n)}`;$("restAmount").textContent=`${money(q.amount)} ₽`;$("restDays").textContent=`${q.n} ${plural(q.n)}`;
 let d=now.getDate(),month=now.getMonth(),year=now.getFullYear(),label,amount,dateObj;
 if(d<10){let yy=year,mm=month-1;if(mm<0){mm=11;yy--}let x=half(yy,mm,16,999);label="Зарплата";amount=x.amount;dateObj=new Date(year,month,10)}
 else if(d<25){let x=half(year,month,1,15);label="Аванс";amount=x.amount;dateObj=new Date(year,month,25)}
 else {let x=half(year,month,1,15);label="Аванс";amount=x.amount;dateObj=new Date(year,month+1,25)}
 $("nextPaymentLabel").textContent=label;$("nextPaymentAmount").textContent=`${money(amount)} ₽`;$("nextPaymentDays").textContent="расчёт по фактическим сменам";$("payOrb").textContent=dateObj.getDate();let days=Math.ceil((new Date(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate())-new Date(year,month,d))/86400000);$("countdown").textContent=days<=0?"сегодня":`через ${days} ${days===1?"день":days<5?"дня":"дней"}`}
function updateToday(){
 const todayWork=status(now.getFullYear(),now.getMonth(),now.getDate())==="work";$("todayDate").textContent=`${now.getDate()} ${GEN[now.getMonth()]}`;$("todayStatus").textContent=todayWork?"Рабочий день":"Выходной";$("todayStatus").style.color=todayWork?"#69e887":"rgba(255,255,255,.58)";$("todayStatus").style.background=todayWork?"rgba(52,199,89,.15)":"rgba(255,255,255,.10)";$("todayMoney").textContent=todayWork?money(RATE):"0";let n=1,next=null;while(n<10){let d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+n);if(status(d.getFullYear(),d.getMonth(),d.getDate())==="work"){next=d;break}n++}$("nextWork").textContent=todayWork&&n===1?"сегодня":next?`${next.getDate()} ${GEN[next.getMonth()]}`:"—";let dd=now.getDate(),payout=dd<10?10:dd<25?25:25;$("nextPay").textContent=`${payout} числа`}
function updateAnchor(){$("setWork").classList.toggle("active",anchor==="work");$("setOff").classList.toggle("active",anchor==="off")}
function openSheet(y,m,d){selected={y,m,d};$("sheetDate").textContent=`${d} ${GEN[m]} ${y}`;$("daySheetBackdrop").classList.add("active");document.body.style.overflow="hidden"}
function closeSheet(){$("daySheetBackdrop").classList.remove("active");document.body.style.overflow="";selected=null}
function setStatus(v){if(!selected)return;overrides[key(selected.y,selected.m,selected.d)]=v;localStorage.setItem(OV,JSON.stringify(overrides));closeSheet();renderCalendar()}
$("sheetWork").onclick=()=>setStatus("work");$("sheetOff").onclick=()=>setStatus("off");$("closeSheet").onclick=closeSheet;$("daySheetBackdrop").onclick=e=>{if(e.target===$("daySheetBackdrop"))closeSheet()};
$("prevMonth").onclick=()=>{cm--;if(cm<0){cm=11;cy--}renderCalendar()};$("nextMonth").onclick=()=>{cm++;if(cm>11){cm=0;cy++}renderCalendar()};
$("setWork").onclick=()=>{anchor="work";localStorage.setItem(AN,anchor);renderCalendar()};$("setOff").onclick=()=>{anchor="off";localStorage.setItem(AN,anchor);renderCalendar()};
$("resetOverrides").onclick=()=>{if(confirm("Сбросить все ручные изменения календаря?")){overrides={};localStorage.setItem(OV,"{}");renderCalendar()}};
function show(id,title){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.screen===id));$("screenTitle").textContent=title}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>show(t.dataset.screen,t.dataset.title));$("openSettings").onclick=()=>show("settingsScreen","Настройки");$("todayCalendarButton").onclick=()=>show("calendarScreen","Календарь");
let sx=0;document.addEventListener("touchstart",e=>{sx=e.changedTouches[0].clientX},{passive:true});document.addEventListener("touchend",e=>{let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)<90)return;let active=document.querySelector(".screen.active");if(active.id==="calendarScreen"){if(dx<0)$("nextMonth").click();else $("prevMonth").click()}},{passive:true});
renderCalendar();setInterval(updatePayments,60000);
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));