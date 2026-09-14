const stateKey="my-grafik-black-edition-v1";
const saved=JSON.parse(localStorage.getItem(stateKey)||"null")||{days:{},rate:14.44,hours:9,payDay:25};
let state=saved, view=new Date(2026,8,1), selectedDate=null;
const months=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const today=new Date();
const fmtKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const ruDate=d=>`${d.getDate()} ${months[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
function persist(){localStorage.setItem(stateKey,JSON.stringify(state))}
function render(){
  document.getElementById("monthTitle").textContent=`${months[view.getMonth()]} ${view.getFullYear()}`;
  document.getElementById("calendarLabel").textContent=`${months[view.getMonth()]} ${view.getFullYear()}`;
  const cal=document.getElementById("calendar"); cal.innerHTML="";
  const first=new Date(view.getFullYear(),view.getMonth(),1), offset=(first.getDay()+6)%7, total=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  for(let i=0;i<offset;i++) cal.appendChild(Object.assign(document.createElement("button"),{className:"empty"}));
  for(let n=1;n<=total;n++){
    const d=new Date(view.getFullYear(),view.getMonth(),n), key=fmtKey(d), b=document.createElement("button");
    const item=state.days[key]; b.textContent=n; b.className=item?.status||"off";
    if(key===fmtKey(today)) b.classList.add("today");
    b.onclick=()=>openDay(d); cal.appendChild(b);
  }
  const works=Object.values(state.days).filter(x=>x.status==="work");
  document.getElementById("workCount").textContent=`${works.length} / 22`;
  document.getElementById("forecast").textContent=`€ ${Math.round(works.length*state.hours*state.rate).toLocaleString("de-DE")}`;
  const pay=new Date(view.getFullYear(),view.getMonth(),state.payDay);
  document.getElementById("payDate").textContent=ruDate(pay);
  const diff=Math.ceil((pay-new Date())/86400000); document.getElementById("daysLeft").textContent=diff>0?`Через ${diff} дн.`:"Сегодня";
  const tk=fmtKey(today), ti=state.days[tk];
  document.getElementById("todayLabel").textContent=ti?.status==="work"?"Работа":ti?.status==="vacation"?"Отпуск":ti?.status==="sick"?"Больничный":"Выходной";
  document.getElementById("todayHours").textContent=ti?.status==="work"?`${ti.hours} ч · € ${Math.round(ti.hours*ti.rate)}`:"Нажмите, чтобы изменить";
}
function openDay(d){
  selectedDate=new Date(d); const key=fmtKey(d), item=state.days[key]||{status:"off",hours:state.hours,rate:state.rate,note:""};
  document.getElementById("sheetDate").textContent=ruDate(d);
  document.getElementById("hoursInput").value=item.hours??state.hours;
  document.getElementById("rateInput").value=item.rate??state.rate;
  document.getElementById("noteInput").value=item.note||"";
  document.querySelectorAll(".status").forEach(x=>x.classList.toggle("selected",x.dataset.status===(item.status||"off")));
  document.getElementById("backdrop").classList.add("open");document.getElementById("daySheet").classList.add("open");
}
function closeSheet(){document.getElementById("backdrop").classList.remove("open");document.getElementById("daySheet").classList.remove("open")}
document.querySelectorAll(".status").forEach(b=>b.onclick=()=>{document.querySelectorAll(".status").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
document.getElementById("saveDay").onclick=()=>{
  const key=fmtKey(selectedDate), status=document.querySelector(".status.selected")?.dataset.status||"off";
  state.days[key]={status,hours:+document.getElementById("hoursInput").value||0,rate:+document.getElementById("rateInput").value||0,note:document.getElementById("noteInput").value};
  state.rate=+document.getElementById("rateInput").value||state.rate; state.hours=+document.getElementById("hoursInput").value||state.hours; persist();closeSheet();render();
};
document.getElementById("closeSheet").onclick=closeSheet;document.getElementById("backdrop").onclick=closeSheet;
document.getElementById("prevMonth").onclick=()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);render()};
document.getElementById("nextMonth").onclick=()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);render()};
document.getElementById("todayOpen").onclick=()=>openDay(today);
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>alert("Раздел «"+t.innerText.trim()+"» подготовлен в прототипе. Следующий этап — полноценные экраны."));
document.getElementById("notifyBtn").onclick=async()=>{
  if(!("Notification" in window)){alert("Браузер не поддерживает уведомления.");return}
  const p=await Notification.requestPermission(); alert(p==="granted"?"Уведомления включены. Для реальных iOS push нужен HTTPS и установленная PWA.":"Разрешение на уведомления не выдано.");
};
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
render();
