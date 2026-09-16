const SALARY=124500, O="premiumOverrides", A="premiumAnchor";
const M=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const G=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const now=new Date();let y=now.getFullYear(),m=now.getMonth(),selected=null;
let overrides=JSON.parse(localStorage.getItem(O)||"{}"),anchor=localStorage.getItem(A)||"work";
const $=x=>document.getElementById(x), days=(y,m)=>new Date(y,m+1,0).getDate(), offset=(y,m)=>(new Date(y,m,1).getDay()+6)%7;
const key=(y,m,d)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
function base(date){let t=new Date(now.getFullYear(),now.getMonth(),now.getDate()),d=Math.round((new Date(date.getFullYear(),date.getMonth(),date.getDate())-t)/86400000),p=anchor==="work"?((d%4)+4)%4:(((d+2)%4)+4)%4;return p<2?"work":"off"}
function status(y,m,d){let k=key(y,m,d);return Object.hasOwn(overrides,k)?overrides[k]:base(new Date(y,m,d))}
function stat(y,m){let n=days(y,m),w=0;for(let d=1;d<=n;d++)if(status(y,m,d)==="work")w++;return{n,w,off:n-w,rate:w?SALARY/w:0}}
function money(v){return Math.round(v).toLocaleString("ru-RU")}
function plural(n){let a=n%10,b=n%100;return a===1&&b!==11?"смена":a>=2&&a<=4&&(b<10||b>=20)?"смены":"смен"}
function animate(el,target){let t=performance.now();function f(now){let p=Math.min((now-t)/650,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e).toLocaleString("ru-RU");if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function half(y,m,start,end){let s=stat(y,m),n=0;for(let d=start;d<=Math.min(end,s.n);d++)if(status(y,m,d)==="work")n++;return{n,amount:n*s.rate}}
function render(){
 $("monthTitle").textContent=`${M[m]} ${y}`;$("salaryMonth").textContent=`${M[m]} ${y}`;
 let g=$("grid");g.innerHTML="";for(let i=0;i<offset(y,m);i++)g.insertAdjacentHTML("beforeend",'<div class="day empty"></div>');
 for(let d=1;d<=days(y,m);d++){let work=status(y,m,d)==="work",today=y===now.getFullYear()&&m===now.getMonth()&&d===now.getDate(),b=document.createElement("button");b.className=`day ${work?"work":"off"}${today?" today":""}`;b.innerHTML=`<span class="num">${d}</span><i class="status-dot"></i>`;b.onclick=()=>openSheet(y,m,d);g.appendChild(b)}
 update()
}
function update(){
 let s=stat(y,m),salary=s.w*s.rate;animate($("heroSalary"),salary);animate($("salaryBig"),salary);
 $("heroDays").textContent=`${s.w} ${plural(s.w)}`;$("heroRate").textContent=`${money(s.rate)} ₽ / смена`;$("heroRate").title="Стоимость одной рабочей смены";
 $("heroProgress").style.width=`${s.n?s.w/s.n*100:0}%`;$("salaryProgress").style.width=`${s.n?s.w/s.n*100:0}%`;$("salaryWork").textContent=`${s.w} ${plural(s.w)}`;$("rateText").textContent=`${money(s.rate)} ₽`;
 let f=half(y,m,1,15),py=y,pm=m-1;if(pm<0){pm=11;py--}let q=half(py,pm,16,999);
 $("pay25").textContent=`${money(f.amount)} ₽`;$("days25").textContent=`${f.n} ${plural(f.n)}`;$("pay10").textContent=`${money(q.amount)} ₽`;$("days10").textContent=`${q.n} ${plural(q.n)}`;
 updateAnchor()
}
function openSheet(yy,mm,dd){selected={y:yy,m:mm,d:dd};$("sheetDate").textContent=`${dd} ${G[mm]} ${yy}`;$("sheetOverlay").classList.add("active");document.body.style.overflow="hidden"}
function closeSheet(){$("sheetOverlay").classList.remove("active");document.body.style.overflow="";selected=null}
function setStatus(v){if(!selected)return;overrides[key(selected.y,selected.m,selected.d)]=v;localStorage.setItem(O,JSON.stringify(overrides));closeSheet();render()}
$("makeWork").onclick=()=>setStatus("work");$("makeOff").onclick=()=>setStatus("off");$("closeSheet").onclick=closeSheet;
$("sheetOverlay").onclick=e=>{if(e.target===$("sheetOverlay"))closeSheet()};
$("prev").onclick=()=>{m--;if(m<0){m=11;y--}render()};$("next").onclick=()=>{m++;if(m>11){m=0;y++}render()};
function updateAnchor(){$("anchorWork").classList.toggle("active",anchor==="work");$("anchorOff").classList.toggle("active",anchor==="off")}
$("anchorWork").onclick=()=>{anchor="work";localStorage.setItem(A,anchor);render()};$("anchorOff").onclick=()=>{anchor="off";localStorage.setItem(A,anchor);render()};
$("reset").onclick=()=>{if(confirm("Сбросить все ручные изменения графика?")){overrides={};localStorage.setItem(O,"{}");render()}};
function showPage(id,title){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.page===id));$("pageTitle").textContent=title}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>showPage(t.dataset.page,t.dataset.title));$("quickSettings").onclick=()=>showPage("settingsPage","Настройки");
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
render();