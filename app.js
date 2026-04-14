const DAY_START = 8;
const DAY_END = 19;
const PX_H = 40;

const q = new URLSearchParams(location.search);
const roomId = q.get("room");

let idx = Math.max(0, SALKA_DATA.findIndex(r => r.id === roomId));
if (idx < 0) idx = 0;

const el = {
  roomName: document.getElementById("roomName"),
  roomMeta: document.getElementById("roomMeta"),
  statusChip: document.getElementById("statusChip"),
  bookingRange: document.getElementById("bookingRange"),
  ownerName: document.getElementById("ownerName"),
  ownerEmail: document.getElementById("ownerEmail"),
  ownerPhone: document.getElementById("ownerPhone"),
  bookingBlock: document.getElementById("bookingBlock"),
  bookingText: document.getElementById("bookingText"),
  nowLine: document.getElementById("nowLine"),
  timeSlider: document.getElementById("timeSlider"),
  timeValue: document.getElementById("timeValue"),
  hoursCol: document.getElementById("hoursCol"),
  modal: document.getElementById("modal"),
  modalText: document.getElementById("modalText")
};

function y(hour){ return (hour - DAY_START) * PX_H; }
function hh(v){ const h=Math.floor(v), m=v%1? "30":"00"; return `${String(h).padStart(2,"0")}:${m}`; }

function renderHours(){
  el.hoursCol.innerHTML = "";
  for(let h=DAY_START; h<=DAY_END; h++){
    const d=document.createElement("div");
    d.className="hour-label";
    d.style.top=`${y(h)}px`;
    d.textContent=`${String(h).padStart(2,"0")}:00`;
    el.hoursCol.appendChild(d);
  }
}

function room(){ return SALKA_DATA[idx]; }

function getNowHalfHour() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  // Zaokrąglenie do najbliższego 0.5h
  let v = h + (m >= 45 ? 1 : m >= 15 ? 0.5 : 0);

  // Clamp do zakresu slidera
  return Math.max(DAY_START, Math.min(DAY_END, v));
}
function renderRoom(){
  const r = room();
  const b = r.bookings[0];

  el.roomName.textContent = r.roomName;
  el.roomMeta.textContent = r.meta;
  el.ownerName.textContent = r.owner.name;
  el.ownerEmail.textContent = r.owner.email;
  el.ownerEmail.href = `mailto:${r.owner.email}`;
  el.ownerPhone.textContent = r.owner.phone;
  el.ownerPhone.href = `tel:${r.owner.phone}`;
  el.bookingRange.textContent = `${hh(b.start)} - ${hh(b.end)}`;
  el.bookingText.textContent = b.label;

  el.bookingBlock.style.top = `${y(b.start)}px`;
  el.bookingBlock.style.height = `${(b.end - b.start) * PX_H}px`;

  const newUrl = new URL(location.href);
  newUrl.searchParams.set("room", r.id);
  history.replaceState({}, "", newUrl);
}

function updateStatus(){
  const t = parseFloat(el.timeSlider.value);
  const b = room().bookings[0];
  const busy = t >= b.start && t < b.end;

  el.timeValue.textContent = hh(t);
  el.nowLine.style.top = `${y(t)}px`;

  el.statusChip.textContent = busy ? "ZAJĘTA" : "WOLNA";
  el.statusChip.classList.toggle("busy", busy);
  el.statusChip.classList.toggle("free", !busy);
}

function toast(msg){
  el.modalText.textContent = msg;
  el.modal.showModal();
}

document.getElementById("closeModal").addEventListener("click", ()=> el.modal.close());
document.getElementById("calendarBtn").addEventListener("click", ()=> document.getElementById("calendarCard").scrollIntoView({behavior:"smooth"}));
document.getElementById("confirmBtn").addEventListener("click", ()=> toast("Obecność potwierdzona ✅"));
document.getElementById("releaseBtn").addEventListener("click", ()=> toast("Sala zwolniona ✅"));
document.getElementById("prevRoom").addEventListener("click", ()=>{ idx = (idx - 1 + SALKA_DATA.length) % SALKA_DATA.length; renderRoom(); updateStatus(); });
document.getElementById("nextRoom").addEventListener("click", ()=>{ idx = (idx + 1) % SALKA_DATA.length; renderRoom(); updateStatus(); });
el.timeSlider.addEventListener("input", updateStatus);

renderHours();
renderRoom();

const nowVal = getNowHalfHour();
el.timeSlider.value = nowVal;

updateStatus();