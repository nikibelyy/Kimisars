const KEY="salary-pwa-v1";
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{rate:8300,days:{}};
let view=new Date(); view.setDate(1);

const $=s=>document.querySelector(s);
const fmt=n=>new Intl.NumberFormat("ru-RU").format(n)+" ₽";
const monthKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const dayKey=d=>`${monthKey(d)}-${String(d.getDate()).padStart(2,"0")}`;
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove("show"),1800)}
function render(){
 const key=monthKey(view), first=new Date(view), start=(first.getDay()+6)%7, total=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
 $("#monthTitle").textContent=first.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
 $("#periodLabel").textContent=first.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
 $("#rateView").textContent=fmt(state.rate);
 const cal=$("#calendar");cal.innerHTML="";
 for(let i=0;i<start;i++){const e=document.createElement("div");e.className="day muted";cal.appendChild(e)}
 let count=0;
 for(let n=1;n<=total;n++){
   const d=new Date(view.getFullYear(),view.getMonth(),n), k=dayKey(d), e=document.createElement("button");
   e.className="day"+(state.days[k]?" work":"");
   const now=new Date(); if(k===dayKey(now))e.classList.add("today");
   e.textContent=n;e.onclick=()=>{state.days[k]=!state.days[k];if(!state.days[k])delete state.days[k];save();render()};
   if(state.days[k])count++;cal.appendChild(e);
 }
 $("#daysView").textContent=count;$("#salaryView").textContent=fmt(count*state.rate);
 $("#avgView").textContent=fmt(Math.round((count*state.rate)/total));
 $("#summaryDays").textContent=count;$("#summarySalary").textContent=fmt(count*state.rate);
 $("#selectedHint").textContent=count?`${count} смен · ${fmt(count*state.rate)}`:"Выбирай рабочие дни";
}
$("#prevMonth").onclick=()=>{view.setMonth(view.getMonth()-1);render()}
$("#nextMonth").onclick=()=>{view.setMonth(view.getMonth()+1);render()}
$("#editRate").onclick=()=>{const v=prompt("Ставка за рабочий день:",state.rate);if(v!==null){const n=Number(String(v).replace(/\s/g,"").replace(",","."));if(n>0){state.rate=Math.round(n);save();render();toast("Ставка обновлена")}}}
$("#selectAll").onclick=()=>{const total=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();for(let n=1;n<=total;n++){const d=new Date(view.getFullYear(),view.getMonth(),n);if(![0,6].includes(d.getDay()))state.days[dayKey(d)]=true}save();render();toast("Будни отмечены")}
$("#clearMonth").onclick=()=>{if(!confirm("Очистить все смены за этот месяц?"))return;const key=monthKey(view);Object.keys(state.days).filter(k=>k.startsWith(key+"-")).forEach(k=>delete state.days[k]);save();render();toast("Месяц очищен")}
$("#todayBtn").onclick=()=>{view=new Date();view.setDate(1);render()}
$("#resetBtn").onclick=()=>{if(confirm("Сбросить весь табель и вернуть ставку 8300 ₽?")){state={rate:8300,days:{}};save();render();toast("Готово")}}
$("#shareBtn").onclick=async()=>{const text=`Мой табель: ${$("#summaryDays").textContent} смен · ${$("#summarySalary").textContent} · ставка ${fmt(state.rate)}/день`;try{if(navigator.share)await navigator.share({title:"Мой табель",text});else await navigator.clipboard.writeText(text);toast(navigator.share?"":"Итог скопирован")}catch{}};
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").classList.add("hidden")};
render();