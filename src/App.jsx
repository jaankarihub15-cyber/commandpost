import { useState, useEffect, useCallback, useMemo } from "react";

// ── Constants ──
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CATEGORIES = [
  { id: "seo", label: "SEO", color: "#2563eb", icon: "◎" },
  { id: "backlinks", label: "Backlinks", color: "#7c3aed", icon: "⟁" },
  { id: "social", label: "Social Media", color: "#ec4899", icon: "◈" },
  { id: "content", label: "Content", color: "#f59e0b", icon: "▤" },
  { id: "dev", label: "Development", color: "#10b981", icon: "⟐" },
  { id: "design", label: "Design", color: "#06b6d4", icon: "◇" },
  { id: "analytics", label: "Analytics", color: "#8b5cf6", icon: "⊞" },
  { id: "other", label: "Other", color: "#64748b", icon: "●" },
];
const PLATFORMS = ["Instagram", "YouTube", "Twitter/X", "LinkedIn", "Facebook", "Pinterest", "Reddit", "TikTok"];
const PROJECT_COLORS = ["#2563eb","#7c3aed","#059669","#e11d48","#ea580c","#0891b2","#4f46e5","#b91c1c","#15803d","#7e22ce"];
const PROJECT_TYPES = ["website", "app", "saas", "channel", "other"];

// ── Utility ──
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const getWeekDates = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d); mon.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon); dd.setDate(mon.getDate() + i);
    return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`;
  });
};
const getMonthDates = (year, month) => {
  const first = new Date(year, month, 1);
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const days = [];
  for (let i = -startDay; i < 42 - startDay; i++) {
    const d = new Date(year, month, 1 + i);
    days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  return days;
};
const fmtDate = (s) => { const d = new Date(s+"T00:00:00"); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`; };
const isToday = (s) => s === todayStr();
const daysFromNow = (s) => { const diff = Math.ceil((new Date(s+"T00:00:00") - new Date(todayStr()+"T00:00:00")) / 86400000); return diff; };

function useStorage(key, initial) {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(data)); }, [key, data]);
  return [data, setData];
}

// ── Styles ──
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#fafaf9;--surface:#fff;--s2:#f5f5f4;--s3:#e7e5e4;--s4:#d6d3d1;
  --border:#e7e5e4;--border-s:#f0efee;
  --text:#1c1917;--t2:#57534e;--t3:#a8a29e;--t4:#d6d3d1;
  --shadow-s:0 1px 2px rgba(28,25,23,.04);
  --shadow-m:0 4px 16px rgba(28,25,23,.06),0 1px 3px rgba(28,25,23,.04);
  --shadow-l:0 12px 40px rgba(28,25,23,.1),0 2px 8px rgba(28,25,23,.04);
  --r:10px;--rl:14px;
  --font:'DM Sans',-apple-system,sans-serif;
  --fd:'Playfair Display',Georgia,serif;
  --tr:180ms cubic-bezier(.4,0,.2,1);
}
body{font-family:var(--font);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.app{min-height:100vh;display:flex;flex-direction:column}
.topbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.88);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--border-s);padding:0 32px;height:56px;display:flex;align-items:center;gap:16px}
.logo{font-family:var(--fd);font-size:19px;font-weight:600;letter-spacing:-.02em;color:var(--text)}
.logo-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-left:2px;vertical-align:middle}
.topbar-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.main{display:flex;flex:1}
.sidebar{width:260px;border-right:1px solid var(--border-s);padding:20px 14px;background:var(--surface);display:flex;flex-direction:column;gap:20px;overflow-y:auto;max-height:calc(100vh - 56px)}
.content{flex:1;padding:28px 32px;overflow-y:auto;max-height:calc(100vh - 56px)}
.btn{padding:8px 18px;border-radius:8px;border:none;font:500 13px/1 var(--font);cursor:pointer;transition:var(--tr);display:inline-flex;align-items:center;gap:6px}
.btn-p{background:var(--text);color:#fff}.btn-p:hover{opacity:.85}
.btn-g{background:var(--s2);color:var(--t2)}.btn-g:hover{background:var(--s3)}
.btn-d{background:#fef2f2;color:#dc2626}.btn-d:hover{background:#fee2e2}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-icon{width:32px;height:32px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:var(--surface);cursor:pointer;color:var(--t2);transition:var(--tr)}
.btn-icon:hover{background:var(--s2);color:var(--text)}
.s-label{font:600 10px/1 var(--font);text-transform:uppercase;letter-spacing:.1em;color:var(--t3);padding:0 10px;margin-bottom:6px}
.s-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:var(--tr);border:none;background:none;width:100%;text-align:left;font:400 13.5px/1.3 var(--font);color:var(--text)}
.s-item:hover{background:var(--s2)}
.s-item.active{background:var(--s2);font-weight:600}
.s-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.s-type{margin-left:auto;font:400 10px/1 var(--font);text-transform:uppercase;letter-spacing:.06em;color:var(--t3);background:var(--s2);padding:2px 6px;border-radius:4px}
.s-add{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:8px;cursor:pointer;border:1px dashed var(--s3);background:none;width:100%;font:400 13px/1 var(--font);color:var(--t3);transition:var(--tr)}
.s-add:hover{border-color:var(--t3);color:var(--t2);background:var(--s2)}
.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.stat-c{padding:16px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border-s);transition:var(--tr)}
.stat-c:hover{box-shadow:var(--shadow-s);border-color:var(--border)}
.stat-n{font:700 26px/1 var(--font);color:var(--text)}
.stat-l{font:400 11px/1 var(--font);color:var(--t3);margin-top:4px;text-transform:uppercase;letter-spacing:.05em}
.prog-wrap{height:6px;border-radius:3px;background:var(--s2);overflow:hidden;margin-top:8px}
.prog-fill{height:100%;border-radius:3px;transition:width 600ms cubic-bezier(.16,1,.3,1)}
.o-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.o-card{border:1px solid var(--border-s);border-radius:var(--rl);padding:20px;background:var(--surface);cursor:pointer;transition:var(--tr);display:flex;flex-direction:column;gap:12px}
.o-card:hover{box-shadow:var(--shadow-m);border-color:var(--border);transform:translateY(-1px)}
.o-head{display:flex;align-items:center;gap:10px}
.o-dot{width:10px;height:10px;border-radius:50%}
.o-name{font:600 15px/1 var(--font);color:var(--text)}
.o-type{margin-left:auto;font:400 10px/1 var(--font);text-transform:uppercase;letter-spacing:.06em;color:var(--t3);background:var(--s2);padding:3px 7px;border-radius:4px}
.o-stats{display:flex;gap:20px}
.o-sv{font:700 18px/1 var(--font)}
.o-sl{font:400 10px/1 var(--font);color:var(--t3);margin-top:2px}
.o-next{font:400 12px/1.4 var(--font);color:var(--t2)}
.o-next strong{font-weight:500;color:var(--text)}
.pd-header{display:flex;align-items:center;gap:14px;margin-bottom:28px}
.pd-back{display:flex;align-items:center;gap:4px;border:none;background:none;font:500 13px/1 var(--font);color:var(--t3);cursor:pointer;transition:var(--tr)}
.pd-back:hover{color:var(--text)}
.pd-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 12px;border-radius:24px;color:#fff;font:600 15px/1 var(--font)}
.pd-type{font:400 10px/1 var(--font);text-transform:uppercase;letter-spacing:.06em;opacity:.8}
.pd-tabs{display:flex;gap:2px;margin-bottom:24px;border-bottom:1px solid var(--border-s);padding-bottom:0}
.pd-tab{padding:10px 16px;border:none;background:none;font:500 13px/1 var(--font);color:var(--t3);cursor:pointer;transition:var(--tr);border-bottom:2px solid transparent;margin-bottom:-1px}
.pd-tab:hover{color:var(--t2)}
.pd-tab.active{color:var(--text);border-bottom-color:var(--text)}
.panel{background:var(--surface);border:1px solid var(--border-s);border-radius:var(--rl);padding:20px;margin-bottom:16px}
.panel-title{font:600 14px/1 var(--font);color:var(--text);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.panel-title svg{color:var(--t3)}
.activity-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-s)}
.activity-item:last-child{border-bottom:none}
.a-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
.a-text{font:400 13px/1.4 var(--font);color:var(--text)}
.a-meta{font:400 11px/1 var(--font);color:var(--t3);margin-top:3px}
.cat-row{display:flex;align-items:center;gap:10px;padding:8px 0}
.cat-bar-wrap{flex:1;height:8px;border-radius:4px;background:var(--s2);overflow:hidden}
.cat-bar{height:100%;border-radius:4px;transition:width 500ms cubic-bezier(.16,1,.3,1)}
.cat-label{font:400 12px/1 var(--font);color:var(--t2);width:90px;flex-shrink:0}
.cat-count{font:600 12px/1 var(--font);color:var(--text);width:28px;text-align:right}
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.cal-title{font:600 18px/1.2 var(--fd);color:var(--text)}
.cal-sub{font:400 12px/1 var(--font);color:var(--t3);margin-top:3px}
.cal-navs{display:flex;gap:4px}
.week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.w-col{min-height:160px;border-radius:var(--r);padding:10px;background:var(--surface);border:1px solid var(--border-s);transition:var(--tr);display:flex;flex-direction:column}
.w-col:hover{border-color:var(--border);box-shadow:var(--shadow-s)}
.w-col.today{border-color:var(--text);border-width:1.5px}
.w-day{font:500 10px/1 var(--font);text-transform:uppercase;letter-spacing:.06em;color:var(--t3)}
.w-num{font:600 17px/1 var(--font);color:var(--text);margin:3px 0 8px}
.w-col.today .w-num{background:var(--text);color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;margin:2px 0 6px -2px}
.w-tasks{display:flex;flex-direction:column;gap:3px;flex:1}
.w-add{margin-top:auto;padding:4px;border:none;background:none;color:var(--t4);cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:var(--tr);opacity:0}
.w-col:hover .w-add{opacity:1}.w-add:hover{background:var(--s2);color:var(--t2)}
.month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border-s);border-radius:var(--r);overflow:hidden;border:1px solid var(--border-s)}
.m-hdr{padding:8px;text-align:center;font:500 10px/1 var(--font);text-transform:uppercase;letter-spacing:.08em;color:var(--t3);background:var(--surface)}
.m-cell{min-height:90px;padding:5px;background:var(--surface);cursor:pointer;transition:var(--tr);display:flex;flex-direction:column}
.m-cell:hover{background:var(--s2)}
.m-cell.other{opacity:.3}
.m-cell.today .m-num{background:var(--text);color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px}
.m-num{font:500 12px/1 var(--font);color:var(--t2);margin-bottom:3px}
.m-dot{height:16px;border-radius:3px;padding:0 4px;font:400 9px/16px var(--font);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
.tc{display:flex;align-items:center;gap:5px;padding:4px 7px;border-radius:6px;font:400 11.5px/1.3 var(--font);cursor:pointer;transition:var(--tr);animation:tcIn 200ms cubic-bezier(.16,1,.3,1)}
@keyframes tcIn{from{opacity:0;transform:translateY(-3px)}}
.tc:hover{filter:brightness(.97)}
.tc.done{opacity:.45}
.tc.done .tc-txt{text-decoration:line-through}
.tc-chk{width:14px;height:14px;border-radius:4px;border:1.5px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:var(--tr)}
.tc-chk.checked{border-color:transparent}
.tc-txt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.modal-ov{position:fixed;inset:0;background:rgba(28,25,23,.3);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fi .15s ease}
@keyframes fi{from{opacity:0}}
.modal{background:var(--surface);border-radius:var(--rl);box-shadow:var(--shadow-l);width:480px;max-width:92vw;max-height:85vh;overflow-y:auto;animation:su .2s cubic-bezier(.16,1,.3,1)}
@keyframes su{from{transform:translateY(12px);opacity:0}}
.modal-h{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0}
.modal-t{font:600 16px/1 var(--font);color:var(--text)}
.modal-x{width:28px;height:28px;border-radius:6px;border:none;background:var(--s2);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t3);transition:var(--tr)}
.modal-x:hover{background:var(--s3);color:var(--text)}
.modal-b{padding:20px 24px 24px;display:flex;flex-direction:column;gap:14px}
.field{display:flex;flex-direction:column;gap:5px}
.fl{font:500 11px/1 var(--font);text-transform:uppercase;letter-spacing:.06em;color:var(--t3)}
.fi{padding:9px 12px;border-radius:8px;border:1px solid var(--border);font:400 14px/1.4 var(--font);color:var(--text);background:var(--surface);outline:none;transition:var(--tr)}
.fi:focus{border-color:var(--text);box-shadow:0 0 0 3px rgba(28,25,23,.06)}
.fi::placeholder{color:var(--t3)}
textarea.fi{resize:vertical;min-height:56px}
select.fi{appearance:none;cursor:pointer;padding-right:30px;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23a8a29e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
.fr{display:flex;gap:10px}.fr .field{flex:1}
.chip-sel{display:flex;flex-wrap:wrap;gap:5px}
.chip-o{padding:5px 11px;border-radius:18px;border:1px solid var(--border);font:400 12px/1 var(--font);cursor:pointer;transition:var(--tr);color:var(--t2);background:var(--surface)}
.chip-o:hover{border-color:var(--t3)}
.chip-o.sel{background:var(--text);color:#fff;border-color:var(--text)}
.color-sel{display:flex;gap:6px;flex-wrap:wrap}
.color-dot{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:var(--tr);display:flex;align-items:center;justify-content:center}
.color-dot:hover{transform:scale(1.1)}
.color-dot.sel{border-color:var(--text);box-shadow:0 0 0 2px #fff inset}
.btn-row{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}
.src-grid{display:flex;flex-direction:column;gap:5px}
.src-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--s2);font:400 12px/1.3 var(--font);color:var(--t2)}
.src-item a{color:var(--text);text-decoration:none;font-weight:500}.src-item a:hover{text-decoration:underline}
.src-del{margin-left:auto;border:none;background:none;cursor:pointer;color:var(--t3);padding:2px;border-radius:4px}
.src-del:hover{color:#dc2626;background:#fef2f2}
.src-add{display:flex;gap:6px;margin-top:6px}
.src-add input{flex:1}
.up-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-s);cursor:pointer}
.up-item:last-child{border-bottom:none}
.up-cat{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.up-text{font:400 13px/1.3 var(--font);color:var(--text);flex:1}
.up-date{font:400 11px/1 var(--font);color:var(--t3);flex-shrink:0}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:var(--t3)}
.empty-icon{font-size:44px;margin-bottom:16px;opacity:.25}
.empty-txt{font:400 14px/1.5 var(--font);text-align:center;max-width:320px}
@media(max-width:768px){
  .sidebar{display:none}.topbar{padding:0 16px}.content{padding:16px}
  .week-grid{grid-template-columns:1fr}.stats-row{grid-template-columns:repeat(2,1fr)}
  .two-col{grid-template-columns:1fr!important}
}
`;

const I = {
  plus: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  back: <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6V10.5M8.5 6V10.5M3.5 4L4 11.5H10L10.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  link: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5L8.5 5.5M4.5 10L3 11.5C2.2 12.3 2.2 12.3 3 11.5L4.5 10ZM9.5 4L11 2.5C11.8 1.7 11.8 2.2 11 3L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  cal: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 6.5H14M5.5 1.5V4M10.5 1.5V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 13V8M7 13V5M11 13V3M15 13V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  target: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r=".8" fill="currentColor"/></svg>,
  list: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M5 4H14M5 8H14M5 12H14M2 4H2.01M2 8H2.01M2 12H2.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  check: <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ━━━ PASSWORD GATE ━━━
// Default password: commandpost123
// To change: run in browser console: 
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_NEW_PASSWORD')).then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
// Then replace the hash below
const PASS_HASH = "3eb9aaf176748ab01edd3ad9ca95e67899f1ab9a58540c7dc0d73b768f2f2fa7";

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('');
}

function AuthGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cp_auth') === '1');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const hash = await hashPassword(pw);
    if (hash === PASS_HASH) {
      sessionStorage.setItem('cp_auth', '1');
      setAuthed(true);
    } else {
      setError(true);
      setPw('');
    }
    setLoading(false);
  };

  if (authed) return children;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--rl)', boxShadow: 'var(--shadow-l)', padding: 40, width: 380, maxWidth: '90vw', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 600, marginBottom: 6 }}>CommandPost</div>
          <p style={{ font: '400 13px/1.4 var(--font)', color: 'var(--t3)', marginBottom: 28 }}>Enter password to continue</p>
          <div onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="fi"
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(e); }}
              autoFocus
              style={{ textAlign: 'center', fontSize: 15 }}
            />
            {error && <div style={{ font: '400 12px/1 var(--font)', color: '#dc2626' }}>Incorrect password</div>}
            <button className="btn btn-p" onClick={handleLogin} disabled={loading || !pw.trim()} style={{ width: '100%', justifyContent: 'center', padding: 11 }}>
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ━━━ MAIN APP ━━━
function Dashboard() {
  const [projects, setProjects] = useStorage("cp_projects", []);
  const [tasks, setTasks] = useStorage("cp_tasks", []);
  const [sources, setSources] = useStorage("cp_sources", []);
  const [activeProject, setActiveProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [taskModal, setTaskModal] = useState(null);

  const addProject = (p) => { setProjects(prev => [...prev, { ...p, id: uid(), createdAt: new Date().toISOString() }]); setShowNewProject(false); };
  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setSources(prev => prev.filter(s => s.projectId !== id));
    if (activeProject === id) setActiveProject(null);
  };
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const saveTask = (task) => {
    if (task.id) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    else setTasks(prev => [...prev, { ...task, id: uid(), done: false, createdAt: new Date().toISOString() }]);
    setTaskModal(null);
  };
  const addSource = (projectId, url, label) => setSources(prev => [...prev, { id: uid(), projectId, url, label, addedAt: new Date().toISOString() }]);
  const deleteSource = (id) => setSources(prev => prev.filter(s => s.id !== id));
  const activeProj = projects.find(p => p.id === activeProject);

  // ── Backup: Export ──
  const exportBackup = () => {
    const data = { projects, tasks, sources, exportedAt: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = `commandpost-backup-${date}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Backup: Import ──
  const importBackup = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.projects || !data.tasks) { alert('Invalid backup file.'); return; }
          if (!confirm(`This will replace all current data with the backup from ${new Date(data.exportedAt).toLocaleDateString()}.\n\n${data.projects.length} projects, ${data.tasks.length} tasks, ${(data.sources || []).length} sources.\n\nContinue?`)) return;
          setProjects(data.projects);
          setTasks(data.tasks);
          setSources(data.sources || []);
          setActiveProject(null);
          alert('Backup restored successfully!');
        } catch { alert('Could not read backup file. Make sure it\'s a valid CommandPost backup.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="topbar">
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => setActiveProject(null)}>CommandPost<span className="logo-dot" style={{ background: activeProj?.color || "#1c1917" }} /></div>
          {activeProj && <button className="pd-back" onClick={() => setActiveProject(null)}>{I.back} All Projects</button>}
          <div className="topbar-right">
            <button className="btn btn-g btn-sm" onClick={exportBackup} title="Export backup">↓ Backup</button>
            <button className="btn btn-g btn-sm" onClick={importBackup} title="Import backup">↑ Restore</button>
            {!activeProject && <button className="btn btn-p btn-sm" onClick={() => setShowNewProject(true)}>{I.plus} New Project</button>}
          </div>
        </header>
        <div className="main">
          <aside className="sidebar">
            <div>
              <div className="s-label">Projects</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {projects.map(p => (
                  <button key={p.id} className={`s-item ${activeProject === p.id ? "active" : ""}`} onClick={() => setActiveProject(p.id)}>
                    <span className="s-dot" style={{ background: p.color }} />{p.name}<span className="s-type">{p.type}</span>
                  </button>
                ))}
                <button className="s-add" onClick={() => setShowNewProject(true)}>{I.plus} New Project</button>
              </div>
            </div>
            <div>
              <div className="s-label">Global</div>
              <div className="stats-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="stat-c"><div className="stat-n">{tasks.length}</div><div className="stat-l">Total</div></div>
                <div className="stat-c"><div className="stat-n">{tasks.filter(t => t.done).length}</div><div className="stat-l">Done</div></div>
              </div>
            </div>
          </aside>
          <main className="content">
            {!activeProject ? (
              <GlobalOverview projects={projects} tasks={tasks} onSelect={setActiveProject} onNew={() => setShowNewProject(true)} />
            ) : (
              <ProjectDashboard project={activeProj} tasks={tasks.filter(t => t.projectId === activeProject)}
                sources={sources.filter(s => s.projectId === activeProject)}
                onAddTask={(date) => setTaskModal({ mode: "add", date })}
                onEditTask={(task) => setTaskModal({ mode: "edit", task })}
                toggleTask={toggleTask} deleteProject={deleteProject}
                addSource={(u, l) => addSource(activeProject, u, l)} deleteSource={deleteSource} />
            )}
          </main>
        </div>
        {showNewProject && <NewProjectModal onSave={addProject} onClose={() => setShowNewProject(false)} />}
        {taskModal && <TaskModal modal={taskModal} projects={projects} activeProject={activeProject} onSave={saveTask} onDelete={deleteTask} onClose={() => setTaskModal(null)} />}
      </div>
    </>
  );
}

// ━━━ GLOBAL OVERVIEW ━━━
function GlobalOverview({ projects, tasks, onSelect, onNew }) {
  const td = todayStr();
  const pStats = (pid) => { const pt = tasks.filter(t => t.projectId === pid); const done = pt.filter(t => t.done).length; return { total: pt.length, done, pending: pt.length - done, pct: pt.length ? Math.round(done / pt.length * 100) : 0 }; };
  if (projects.length === 0) return (
    <div className="empty">
      <div className="empty-icon">◈</div>
      <div className="empty-txt">No projects yet. Create your first project to start organizing your work across SEO, backlinks, social media, and more.</div>
      <button className="btn btn-p" style={{ marginTop: 20 }} onClick={onNew}>{I.plus} Create First Project</button>
    </div>
  );
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 600 }}>All Projects</h1>
        <p style={{ font: "400 13px/1 var(--font)", color: "var(--t3)", marginTop: 6 }}>Select a project to open its dashboard</p>
      </div>
      <div className="o-grid">
        {projects.map(p => {
          const s = pStats(p.id);
          const next = tasks.filter(t => t.projectId === p.id && !t.done && t.date >= td).sort((a, b) => a.date.localeCompare(b.date))[0];
          return (
            <div key={p.id} className="o-card" onClick={() => onSelect(p.id)}>
              <div className="o-head"><span className="o-dot" style={{ background: p.color }} /><span className="o-name">{p.name}</span><span className="o-type">{p.type}</span></div>
              {p.description && <div style={{ font: "400 12px/1.4 var(--font)", color: "var(--t2)" }}>{p.description}</div>}
              <div className="o-stats">
                <div><div className="o-sv" style={{ color: p.color }}>{s.done}</div><div className="o-sl">Done</div></div>
                <div><div className="o-sv">{s.pending}</div><div className="o-sl">Pending</div></div>
                <div><div className="o-sv">{s.pct}%</div><div className="o-sl">Progress</div></div>
              </div>
              <div className="prog-wrap"><div className="prog-fill" style={{ width: `${s.pct}%`, background: p.color }} /></div>
              {next ? <div className="o-next">Next: <strong>{next.title}</strong> · {fmtDate(next.date)}</div> : s.total === 0 ? <div className="o-next" style={{ opacity: .4 }}>No tasks yet — click to start</div> : <div className="o-next" style={{ opacity: .4 }}>All caught up!</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ PROJECT DASHBOARD ━━━
function ProjectDashboard({ project, tasks, sources, onAddTask, onEditTask, toggleTask, deleteProject, addSource, deleteSource }) {
  const [tab, setTab] = useState("overview");
  const [calView, setCalView] = useState("week");
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [filterCat, setFilterCat] = useState(null);
  const [srcUrl, setSrcUrl] = useState("");
  const [srcLabel, setSrcLabel] = useState("");

  const td = todayStr();
  const done = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const overdue = tasks.filter(t => !t.done && t.date < td).length;
  const thisWeekDates = getWeekDates(td);
  const thisWeekTasks = tasks.filter(t => thisWeekDates.includes(t.date));
  const thisWeekDone = thisWeekTasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const upcoming = tasks.filter(t => !t.done && t.date >= td).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const recentDone = tasks.filter(t => t.done && t.doneAt).sort((a, b) => b.doneAt.localeCompare(a.doneAt)).slice(0, 5);

  const catBreakdown = useMemo(() => {
    const map = {}; tasks.forEach(t => { map[t.category] = (map[t.category] || 0) + 1; });
    return CATEGORIES.map(c => ({ ...c, count: map[c.id] || 0 })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  }, [tasks]);
  const maxCat = Math.max(...catBreakdown.map(c => c.count), 1);

  const currentMonth = new Date(currentDate + "T00:00:00").getMonth();
  const currentYear = new Date(currentDate + "T00:00:00").getFullYear();
  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentYear, currentMonth);
  const filteredTasks = filterCat ? tasks.filter(t => t.category === filterCat) : tasks;
  const getTasksForDate = useCallback((date) => filteredTasks.filter(t => t.date === date), [filteredTasks]);

  const navWeek = (dir) => { const d = new Date(currentDate + "T00:00:00"); d.setDate(d.getDate() + dir * 7); setCurrentDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); };
  const navMonth = (dir) => { const d = new Date(currentYear, currentMonth + dir, 1); setCurrentDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); };

  const TABS = [
    { id: "overview", label: "Overview", icon: I.chart },
    { id: "calendar", label: "Calendar", icon: I.cal },
    { id: "tasks", label: "All Tasks", icon: I.list },
    { id: "sources", label: "Sources", icon: I.link },
  ];

  return (
    <div>
      <div className="pd-header">
        <div className="pd-pill" style={{ background: project.color }}><span>{project.name}</span><span className="pd-type">{project.type}</span></div>
        {project.description && <span style={{ font: "400 13px/1.3 var(--font)", color: "var(--t2)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.description}</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn btn-p btn-sm" onClick={() => { setTab("calendar"); setTimeout(() => onAddTask(td), 50); }}>{I.plus} Add Task</button>
          <button className="btn btn-d btn-sm" onClick={() => { if (confirm(`Delete "${project.name}" and all its tasks?`)) deleteProject(project.id); }}>{I.trash}</button>
        </div>
      </div>

      <div className="pd-tabs">
        {TABS.map(t => <button key={t.id} className={`pd-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>)}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div>
          <div className="stats-row" style={{ marginBottom: 16 }}>
            <div className="stat-c"><div className="stat-n" style={{ color: project.color }}>{done}</div><div className="stat-l">Completed</div></div>
            <div className="stat-c"><div className="stat-n">{pending}</div><div className="stat-l">Pending</div></div>
            <div className="stat-c"><div className="stat-n" style={{ color: overdue > 0 ? "#dc2626" : "var(--text)" }}>{overdue}</div><div className="stat-l">Overdue</div></div>
            <div className="stat-c"><div className="stat-n">{pct}%</div><div className="stat-l">Progress</div><div className="prog-wrap"><div className="prog-fill" style={{ width: `${pct}%`, background: project.color }} /></div></div>
            <div className="stat-c"><div className="stat-n">{thisWeekDone}/{thisWeekTasks.length}</div><div className="stat-l">This Week</div></div>
          </div>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="panel">
              <div className="panel-title">{I.target} Upcoming Tasks</div>
              {upcoming.length === 0 && <div style={{ font: "400 13px/1.5 var(--font)", color: "var(--t3)" }}>No upcoming tasks. Add some from the Calendar tab.</div>}
              {upcoming.map(t => { const cat = CATEGORIES.find(c => c.id === t.category); const df = daysFromNow(t.date); return (
                <div key={t.id} className="up-item" onClick={() => onEditTask(t)}>
                  <span className="up-cat" style={{ background: cat?.color }} />
                  <span className="up-text">{t.title}</span>
                  <span className="up-date">{df === 0 ? "Today" : df === 1 ? "Tomorrow" : fmtDate(t.date)}</span>
                </div>
              ); })}
            </div>
            <div className="panel">
              <div className="panel-title">{I.chart} Category Breakdown</div>
              {catBreakdown.length === 0 && <div style={{ font: "400 13px/1.5 var(--font)", color: "var(--t3)" }}>No tasks yet.</div>}
              {catBreakdown.map(c => (
                <div key={c.id} className="cat-row">
                  <span className="cat-label">{c.icon} {c.label}</span>
                  <div className="cat-bar-wrap"><div className="cat-bar" style={{ width: `${(c.count / maxCat) * 100}%`, background: c.color }} /></div>
                  <span className="cat-count">{c.count}</span>
                </div>
              ))}
            </div>
            <div className="panel">
              <div className="panel-title">{I.check} Recently Completed</div>
              {recentDone.length === 0 && <div style={{ font: "400 13px/1.5 var(--font)", color: "var(--t3)" }}>Complete tasks to see them here.</div>}
              {recentDone.map(t => { const cat = CATEGORIES.find(c => c.id === t.category); return (
                <div key={t.id} className="activity-item">
                  <span className="a-dot" style={{ background: cat?.color, opacity: .5 }} />
                  <div><div className="a-text" style={{ textDecoration: "line-through", opacity: .6 }}>{t.title}</div><div className="a-meta">{cat?.label} · Done {new Date(t.doneAt).toLocaleDateString()}</div></div>
                </div>
              ); })}
            </div>
            <div className="panel">
              <div className="panel-title">{I.link} Sources & Links ({sources.length})</div>
              {sources.length === 0 && <div style={{ font: "400 13px/1.5 var(--font)", color: "var(--t3)" }}>Add links from the Sources tab.</div>}
              {sources.slice(0, 5).map(s => <div key={s.id} className="src-item" style={{ marginBottom: 4 }}>{I.link}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label || s.url}</a></div>)}
              {sources.length > 5 && <button className="btn btn-g btn-sm" style={{ marginTop: 8 }} onClick={() => setTab("sources")}>View all {sources.length}</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 2 }}>
              <button className={`btn btn-sm ${calView === "week" ? "btn-p" : "btn-g"}`} onClick={() => setCalView("week")}>Week</button>
              <button className={`btn btn-sm ${calView === "month" ? "btn-p" : "btn-g"}`} onClick={() => setCalView("month")}>Month</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button className={`chip-o ${!filterCat ? "sel" : ""}`} onClick={() => setFilterCat(null)} style={{ fontSize: 11, padding: "4px 10px" }}>All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} className={`chip-o ${filterCat === c.id ? "sel" : ""}`}
                  style={filterCat === c.id ? { background: c.color, borderColor: c.color, fontSize: 11, padding: "4px 10px" } : { fontSize: 11, padding: "4px 10px" }}
                  onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}>{c.icon}</button>
              ))}
            </div>
          </div>
          {calView === "week" ? (
            <WeekCal weekDates={weekDates} getTasksForDate={getTasksForDate} navigate={navWeek} onAdd={onAddTask} onEdit={onEditTask} toggleTask={toggleTask} setCurrentDate={setCurrentDate} />
          ) : (
            <MonthCal monthDates={monthDates} currentMonth={currentMonth} currentYear={currentYear} getTasksForDate={getTasksForDate} navigate={navMonth} onDayClick={(d) => { setCurrentDate(d); setCalView("week"); }} />
          )}
        </div>
      )}

      {/* ── ALL TASKS ── */}
      {tab === "tasks" && <AllTasksView tasks={tasks} onEdit={onEditTask} toggleTask={toggleTask} />}

      {/* ── SOURCES ── */}
      {tab === "sources" && (
        <div className="panel">
          <div className="panel-title">{I.link} Sources & Links</div>
          {sources.length > 0 && <div className="src-grid">{sources.map(s => (
            <div key={s.id} className="src-item">{I.link}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label || s.url}</a>
              <span style={{ font: "400 10px/1 var(--font)", color: "var(--t3)", marginLeft: 8 }}>{new Date(s.addedAt).toLocaleDateString()}</span>
              <button className="src-del" onClick={() => deleteSource(s.id)}>{I.trash}</button>
            </div>
          ))}</div>}
          <div className="src-add" style={{ marginTop: sources.length ? 12 : 0 }}>
            <input className="fi" placeholder="URL" value={srcUrl} onChange={e => setSrcUrl(e.target.value)} style={{ fontSize: 12 }} />
            <input className="fi" placeholder="Label (optional)" value={srcLabel} onChange={e => setSrcLabel(e.target.value)} style={{ fontSize: 12, maxWidth: 160 }} />
            <button className="btn btn-p btn-sm" onClick={() => { if (srcUrl.trim()) { addSource(srcUrl.trim(), srcLabel.trim()); setSrcUrl(""); setSrcLabel(""); } }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━ ALL TASKS ━━━
function AllTasksView({ tasks, onEdit, toggleTask }) {
  const [filter, setFilter] = useState("all");
  const td = todayStr();
  let filtered = tasks;
  if (filter === "pending") filtered = tasks.filter(t => !t.done);
  else if (filter === "done") filtered = tasks.filter(t => t.done);
  else if (filter === "overdue") filtered = tasks.filter(t => !t.done && t.date < td);
  filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[["all", tasks.length], ["pending", tasks.filter(t => !t.done).length], ["done", tasks.filter(t => t.done).length], ["overdue", tasks.filter(t => !t.done && t.date < td).length]].map(([f, c]) => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-p" : "btn-g"}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f} ({c})</button>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty"><div className="empty-icon">▤</div><div className="empty-txt">No tasks in this filter.</div></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map(t => {
          const cat = CATEGORIES.find(c => c.id === t.category);
          const df = daysFromNow(t.date);
          const isOD = !t.done && t.date < td;
          return (
            <div key={t.id} className={`tc ${t.done ? "done" : ""}`}
              style={{ background: cat ? cat.color + "10" : "var(--s2)", padding: "10px 12px", borderRadius: 10, border: isOD ? "1px solid #fca5a5" : "1px solid transparent" }}
              onClick={() => onEdit(t)}>
              <span className={`tc-chk ${t.done ? "checked" : ""}`}
                style={{ borderColor: cat?.color, background: t.done ? cat?.color : "transparent", width: 18, height: 18, borderRadius: 5 }}
                onClick={e => { e.stopPropagation(); toggleTask(t.id); }}>{t.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}</span>
              <span className="tc-txt" style={{ fontSize: 13 }}>{t.title}</span>
              {t.platform && <span style={{ font: "400 10px/1 var(--font)", color: cat?.color, background: cat?.color + "18", padding: "2px 7px", borderRadius: 10 }}>{t.platform}</span>}
              <span style={{ font: "400 10px/1 var(--font)", color: cat?.color, background: cat?.color + "18", padding: "2px 7px", borderRadius: 10 }}>{cat?.label}</span>
              <span style={{ font: "400 11px/1 var(--font)", color: isOD ? "#dc2626" : "var(--t3)", marginLeft: 4 }}>{isOD ? `${Math.abs(df)}d overdue` : df === 0 ? "Today" : df === 1 ? "Tomorrow" : fmtDate(t.date)}</span>
              <span style={{ font: "500 10px/1 var(--font)", color: t.priority === "high" ? "#dc2626" : t.priority === "medium" ? "#f59e0b" : "var(--t3)", textTransform: "uppercase" }}>{t.priority}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ WEEK CALENDAR ━━━
function WeekCal({ weekDates, getTasksForDate, navigate, onAdd, onEdit, toggleTask, setCurrentDate }) {
  const d = new Date(weekDates[0] + "T00:00:00");
  return (
    <div>
      <div className="cal-head">
        <div><div className="cal-title">{MONTHS[d.getMonth()]} {d.getFullYear()}</div><div className="cal-sub">{fmtDate(weekDates[0])} — {fmtDate(weekDates[6])}</div></div>
        <div className="cal-navs">
          <button className="btn-icon" onClick={() => setCurrentDate(todayStr())} style={{ fontSize: 11, fontWeight: 600, width: "auto", padding: "0 10px" }}>Today</button>
          <button className="btn-icon" onClick={() => navigate(-1)}>‹</button>
          <button className="btn-icon" onClick={() => navigate(1)}>›</button>
        </div>
      </div>
      <div className="week-grid">
        {weekDates.map((date, i) => {
          const dayTasks = getTasksForDate(date);
          const dd = new Date(date + "T00:00:00");
          return (
            <div key={date} className={`w-col ${isToday(date) ? "today" : ""}`}>
              <div className="w-day">{DAYS[i]}</div>
              <div className="w-num">{dd.getDate()}</div>
              <div className="w-tasks">
                {dayTasks.map(t => { const cat = CATEGORIES.find(c => c.id === t.category); return (
                  <div key={t.id} className={`tc ${t.done ? "done" : ""}`} style={{ background: cat ? cat.color + "12" : "var(--s2)" }} onClick={() => onEdit(t)}>
                    <span className={`tc-chk ${t.done ? "checked" : ""}`}
                      style={{ borderColor: cat?.color, background: t.done ? cat?.color : "transparent" }}
                      onClick={e => { e.stopPropagation(); toggleTask(t.id); }}>{t.done && <span style={{ color: "#fff", fontSize: 8 }}>✓</span>}</span>
                    <span className="tc-txt">{t.title}</span>
                  </div>
                ); })}
              </div>
              <button className="w-add" onClick={() => onAdd(date)}>{I.plus}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ MONTH CALENDAR ━━━
function MonthCal({ monthDates, currentMonth, currentYear, getTasksForDate, navigate, onDayClick }) {
  return (
    <div>
      <div className="cal-head">
        <div><div className="cal-title">{MONTHS[currentMonth]} {currentYear}</div><div className="cal-sub">Click any day to switch to week view</div></div>
        <div className="cal-navs"><button className="btn-icon" onClick={() => navigate(-1)}>‹</button><button className="btn-icon" onClick={() => navigate(1)}>›</button></div>
      </div>
      <div className="month-grid">
        {DAYS.map(d => <div key={d} className="m-hdr">{d}</div>)}
        {monthDates.map((date, i) => {
          const dd = new Date(date + "T00:00:00"); const isOther = dd.getMonth() !== currentMonth; const dayTasks = getTasksForDate(date);
          return (
            <div key={i} className={`m-cell ${isOther ? "other" : ""} ${isToday(date) ? "today" : ""}`} onClick={() => onDayClick(date)}>
              <div className="m-num">{dd.getDate()}</div>
              {dayTasks.slice(0, 3).map(t => { const cat = CATEGORIES.find(c => c.id === t.category); return <div key={t.id} className="m-dot" style={{ background: cat?.color || "#78716c", opacity: t.done ? .4 : 1 }}>{t.title}</div>; })}
              {dayTasks.length > 3 && <div style={{ font: "400 9px/1 var(--font)", color: "var(--t3)", padding: "0 4px" }}>+{dayTasks.length - 3}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━ NEW PROJECT MODAL ━━━
function NewProjectModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("website");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [desc, setDesc] = useState("");
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><span className="modal-t">New Project</span><button className="modal-x" onClick={onClose}>{I.close}</button></div>
        <div className="modal-b">
          <div className="field"><label className="fl">Project Name</label><input className="fi" placeholder="e.g. DailyDrip, SiftAI..." value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
          <div className="field"><label className="fl">Description (optional)</label><textarea className="fi" placeholder="What's this project about?" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div className="field"><label className="fl">Type</label>
            <div className="chip-sel">{PROJECT_TYPES.map(t => <button key={t} className={`chip-o ${type === t ? "sel" : ""}`} onClick={() => setType(t)} style={{ textTransform: "capitalize" }}>{t}</button>)}</div>
          </div>
          <div className="field"><label className="fl">Color</label>
            <div className="color-sel">{PROJECT_COLORS.map(c => <div key={c} className={`color-dot ${color === c ? "sel" : ""}`} style={{ background: c }} onClick={() => setColor(c)}>{color === c && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}</div>)}</div>
          </div>
          <div className="btn-row">
            <button className="btn btn-g" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), type, color, description: desc.trim() })}>Create Project</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━ TASK MODAL ━━━
function TaskModal({ modal, projects, activeProject, onSave, onDelete, onClose }) {
  const isEdit = modal.mode === "edit";
  const [form, setForm] = useState(isEdit ? {
    title: modal.task.title, description: modal.task.description || "", date: modal.task.date,
    category: modal.task.category, projectId: modal.task.projectId,
    priority: modal.task.priority || "medium", platform: modal.task.platform || "",
  } : {
    title: "", description: "", date: modal.date || todayStr(), category: "seo",
    projectId: activeProject || projects[0]?.id, priority: "medium", platform: "",
  });
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><span className="modal-t">{isEdit ? "Edit Task" : "New Task"}</span><button className="modal-x" onClick={onClose}>{I.close}</button></div>
        <div className="modal-b">
          <div className="field"><label className="fl">Title</label><input className="fi" placeholder="e.g. Write meta descriptions for landing pages" value={form.title} onChange={e => u("title", e.target.value)} autoFocus /></div>
          <div className="field"><label className="fl">Description</label><textarea className="fi" placeholder="Details, notes, links..." value={form.description} onChange={e => u("description", e.target.value)} /></div>
          <div className="fr">
            <div className="field"><label className="fl">Date</label><input className="fi" type="date" value={form.date} onChange={e => u("date", e.target.value)} /></div>
            <div className="field"><label className="fl">Priority</label>
              <select className="fi" value={form.priority} onChange={e => u("priority", e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          {!activeProject && <div className="field"><label className="fl">Project</label>
            <select className="fi" value={form.projectId} onChange={e => u("projectId", e.target.value)}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </div>}
          <div className="field"><label className="fl">Category</label>
            <div className="chip-sel">{CATEGORIES.map(c => (
              <button key={c.id} className={`chip-o ${form.category === c.id ? "sel" : ""}`}
                style={form.category === c.id ? { background: c.color, borderColor: c.color } : {}}
                onClick={() => u("category", c.id)}>{c.icon} {c.label}</button>
            ))}</div>
          </div>
          {form.category === "social" && <div className="field"><label className="fl">Platform</label>
            <div className="chip-sel">{PLATFORMS.map(p => <button key={p} className={`chip-o ${form.platform === p ? "sel" : ""}`} onClick={() => u("platform", form.platform === p ? "" : p)}>{p}</button>)}</div>
          </div>}
          <div className="btn-row">
            {isEdit && <button className="btn btn-d" onClick={() => { onDelete(modal.task.id); onClose(); }} style={{ marginRight: "auto" }}>{I.trash} Delete</button>}
            <button className="btn btn-g" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" disabled={!form.title.trim() || !form.date || !form.projectId}
              onClick={() => onSave({ ...(isEdit ? modal.task : {}), ...form })}>{isEdit ? "Update" : "Create Task"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━ EXPORT WITH AUTH ━━━
export default function App() {
  return <AuthGate><Dashboard /></AuthGate>;
}
