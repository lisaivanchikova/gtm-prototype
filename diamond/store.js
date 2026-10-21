/* MSP Mergers — общее хранилище демо.
   Обзор пишет сюда, кабинет и карточка владельца читают отсюда.
   В продукте это бэкенд; здесь localStorage, чтобы весь путь кликался в браузере
   без сервера. Правило приватности то же, что на странице обзора:
   анонимный прогон хранит штат, диапазон выручки и шесть оценок;
   имя появляется только если владелец запросил отчёт или звонок. */
window.MSPM = (function () {
  var KEY = 'mspm.runs.v1';

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function write(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  function get(id) {
    var a = all(), i;
    for (i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }
  function upsert(run) {
    var a = all(), i, found = -1;
    for (i = 0; i < a.length; i++) if (a[i].id === run.id) found = i;
    if (found >= 0) { a[found] = Object.assign(a[found], run); }
    else { a.push(run); }
    write(a);
    return run.id;
  }
  function patch(id, obj) {
    var r = get(id); if (!r) return null;
    Object.assign(r, obj); upsert(r); return r;
  }
  function clear() { write([]); }

  function money(n) {
    if (!isFinite(n)) return '—';
    if (n >= 1e6) { var m = n / 1e6; return '$' + (m >= 10 ? m.toFixed(1) : m.toFixed(2).replace(/0$/, '')) + 'M'; }
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + Math.round(n);
  }
  function band(r) {
    if (r >= 1e7) return '$10M+';
    if (r >= 5e6) return '$5–10M';
    if (r >= 25e5) return '$2.5–5M';
    if (r >= 1e6) return '$1–2.5M';
    return 'under $1M';
  }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '··';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  }
  function ago(ts) {
    var d = Math.floor((Date.now() - ts) / 60000);
    if (d < 1) return 'just now';
    if (d < 60) return d + ' min ago';
    if (d < 1440) return Math.floor(d / 60) + ' h ago';
    return Math.floor(d / 1440) + ' d ago';
  }
  function when(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  /* почему этого владельца стоит набрать — тот же порядок, что на панели кабинета */
  function reason(r) {
    if (r.asked === 'call') return 'Booked 30 minutes' + (r.slot ? ' for ' + r.slot : '') + '. Weakest: ' + (r.worstName || '—');
    if (r.runs > 1) return 'Run ' + r.runs + '. Score ' + r.firstScore + ' → ' + r.score + ' since the first one';
    if (r.asked === 'report') return 'Asked for the full report · ' + money(r.revenue) + ' revenue, score ' + r.score;
    return money(r.revenue) + ' revenue, score ' + r.score + ' — finished the review anonymously';
  }

  return { all: all, get: get, upsert: upsert, patch: patch, clear: clear,
           money: money, band: band, initials: initials, ago: ago, when: when, reason: reason };
})();

/* ——— посев ———
   Восемь-десять прогонов, которые на демо уже лежат на столе: это те самые строки,
   что были в макете кабинета. Имена владельцев закрыты квадратными скобками, пока
   Нил не даст согласие показывать настоящие. Прогон с обзора добавляется сверху. */
MSPM.seed = function () {
  try { if (localStorage.getItem('mspm.seeded.v1')) return; } catch (e) { return; }
  var D = 86400000, now = Date.now();
  function sc(r, c, m, s, b, o) {
    return [{k:'recurring',name:'Recurring mix',score:r},
            {k:'concentration',name:'Client concentration',score:c},
            {k:'margin',name:'Margin',score:m},
            {k:'sales',name:'Sales independence',score:s},
            {k:'books',name:'Books',score:b},
            {k:'owner',name:'Owner dependence',score:o}];
  }
  var W = {
    owner:{k:'owner',name:'Owner dependence',step:'One step up is worth about ',
      line:'A few days is the longest you have been out. What a buyer acquires has to survive your last day.'},
    sales:{k:'sales',name:'Sales independence',step:'One step up is worth about ',
      line:'New business comes through you. A buyer needs a pipeline that does not leave with the owner.'},
    books:{k:'books',name:'Books',step:'One step up is worth about ',
      line:'Books mostly ready. The tidying will happen under time pressure instead of now.'},
    marg:{k:'margin',name:'Margin',step:'The next margin band is worth about ',
      line:'Adjusted margin is in the bottom band. Neil on his own company: “probably 15% more employees than I needed to have, maybe 20% more.”'},
    conc:{k:'concentration',name:'Client concentration',step:'Getting it one band lower is worth about ',
      line:'One client is 34% of revenue. This is the defect a buyer cannot fix after closing, so it is priced hard.'},
    rec:{k:'recurring',name:'Recurring mix',step:'Ten more points of contracted revenue is worth about ',
      line:'Under half of revenue renews on its own. Project work does not transfer with the business, so it is discounted.'}
  };
  function w(key, cash) { return Object.assign({}, W[key], {cash: cash}); }

  var runs = [
    {id:'s1', ts:now-2*D, seed:true, anon:false, name:'[Owner name]', company:'[Company]',
     city:'Houston, TX', state:'TX', revenue:8000000, employees:46, earnings:1300000,
     lo:4300000, hi:5860000, mult:3.9, score:41, firstScore:41, runs:1,
     recPct:80, concPct:25, margin:16.3, asked:'report', email:'[email]',
     scales:sc(80,62,54,0,50,0), worst:[w('owner',1170000),w('sales',650000),w('books',260000)],
     panel:'$8.0M revenue, score 41 — biggest gap between size and quality this quarter'},

    {id:'s2', ts:now-2*D-3600000, seed:true, anon:true, state:'TX', revenue:3400000,
     score:44, firstScore:44, runs:1, asked:'nothing', scales:sc(60,70,36,50,50,0),
     worst:[w('owner',0),w('sales',0),w('books',0)]},

    {id:'s3', ts:now-3*D, seed:true, anon:false, name:'[Owner name]', company:'[Company]',
     city:'Plano, TX', state:'TX', revenue:6200000, employees:34, earnings:910000,
     lo:3550000, hi:4640000, mult:4.5, score:61, firstScore:61, runs:1,
     recPct:72, concPct:34, margin:14.7, asked:'call', slot:'Thursday, 10:00 CT', email:'[email]',
     scales:sc(72,40,54,50,100,50), worst:[w('conc',683000),w('sales',455000),w('owner',273000)],
     panel:'Booked 30 minutes for Thursday. Weakest: client concentration at 34%'},

    {id:'s4', ts:now-4*D, seed:true, anon:true, state:'OK', revenue:1600000,
     score:33, firstScore:33, runs:1, asked:'nothing', scales:sc(48,68,32,0,0,50), worst:[]},

    {id:'s5', ts:now-5*D, seed:true, anon:true, state:'TX', revenue:7100000,
     score:58, firstScore:58, runs:1, asked:'nothing', scales:sc(75,80,45,50,50,50), worst:[]},

    {id:'s6', ts:now-6*D, seed:true, anon:false, name:'[Owner name]', company:'[Company]',
     city:'San Antonio, TX', state:'TX', revenue:4100000, employees:27, earnings:530000,
     lo:1860000, hi:2500000, mult:4.1, score:48, firstScore:48, runs:1,
     recPct:74, concPct:22, margin:12.9, asked:'report', askedTwice:true, email:'[email]',
     scales:sc(74,76,36,0,50,50), worst:[w('owner',477000),w('sales',265000),w('marg',186000)],
     panel:'Asked for the full report twice in two weeks'},

    {id:'s7', ts:now-7*D, seed:true, anon:true, state:'NM', revenue:3100000,
     score:39, firstScore:39, runs:1, asked:'nothing', scales:sc(60,75,46,50,0,0), worst:[]},

    {id:'s8', ts:now-9*D, seed:true, anon:false, name:'[Owner name]', company:'[Company]',
     city:'Fort Worth, TX', state:'TX', revenue:3200000, employees:21, earnings:410000,
     lo:1480000, hi:1970000, mult:4.2, score:51, firstScore:37, runs:3,
     recPct:48, concPct:16, margin:12.8, asked:'report', email:'[email]',
     scales:sc(48,74,34,0,50,100), worst:[w('sales',205000),w('rec',205000),w('marg',144000)],
     panel:'Third run. Score 37 → 51 since June: owner dependence and books both moved'},

    {id:'s9', ts:now-10*D, seed:true, anon:false, name:'[Owner name]', company:'[Company]',
     city:'Tulsa, OK', state:'OK', revenue:2400000, employees:16, earnings:300000,
     lo:1080000, hi:1440000, mult:4.2, score:68, firstScore:44, runs:2,
     recPct:94, concPct:29, margin:12.5, asked:'report', email:'[email]',
     scales:sc(94,52,64,50,100,50), worst:[w('conc',225000),w('sales',150000),w('marg',105000)],
     panel:'Second run. Score 44 → 68: margin and sales independence both moved'},

    {id:'s10', ts:now-11*D, seed:true, anon:true, state:'TX', revenue:1900000,
     score:46, firstScore:38, runs:2, asked:'nothing', scales:sc(66,70,38,50,50,0), worst:[]}
  ];
  runs.forEach(function (r) { MSPM.upsert(r); });
  try { localStorage.setItem('mspm.seeded.v1', '1'); } catch (e) {}
};

/* агрегаты квартала: посев — это недавний срез когорты, живые прогоны идут сверх неё */
MSPM.base = { opened:371, finished:128, report:58, booked:19, back:23, medianScore:44, talks:4 };
MSPM.live = function () { return MSPM.all().filter(function (r) { return !r.seed; }); };
MSPM.counts = function () {
  var L = MSPM.live(), b = MSPM.base;
  return {
    talks: b.talks,
    opened: b.opened + L.length,
    finished: b.finished + L.length,
    report: b.report + L.filter(function (r) { return r.asked === 'report'; }).length,
    booked: b.booked + L.filter(function (r) { return r.asked === 'call'; }).length,
    back: b.back + L.filter(function (r) { return r.runs > 1; }).length,
    medianScore: b.medianScore
  };
};
