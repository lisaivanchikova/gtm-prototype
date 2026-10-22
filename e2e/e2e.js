/* ChannelE2E × Intwin demo — engine, one shared run, deal data.
   Everything the owner typed lives in one record so no page asks twice. */
window.E2E = (function () {
  var K = 'e2e.run.v1', U = 'e2e.unlocked', S = 'e2e.stats';

  function get() { try { return JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) { return {}; } }
  function set(o) { var r = get(); for (var k in o) r[k] = o[k]; r.ts = Date.now();
    try { localStorage.setItem(K, JSON.stringify(r)); } catch (e) {} return r; }
  function clear() { try { localStorage.removeItem(K); localStorage.removeItem(U); localStorage.removeItem(S); } catch (e) {} }
  function unlocked() { try { return !!localStorage.getItem(U); } catch (e) { return false; } }
  function unlock(mail) { try { localStorage.setItem(U, mail || '1'); } catch (e) {} }

  /* counters we show Kelly — the value we pay her with */
  function bump(ev) { var s = stats(); s[ev] = (s[ev] || 0) + 1;
    try { localStorage.setItem(S, JSON.stringify(s)); } catch (e) {} }
  function stats() { try { return JSON.parse(localStorage.getItem(S) || '{}'); } catch (e) { return {}; } }

  /* ---------- the five widget questions ---------- */
  var BANDS = [
    { k: 'a', t: 'Under $1M', mid: 700000 },
    { k: 'b', t: '$1M – $3M', mid: 2000000 },
    { k: 'c', t: '$3M – $10M', mid: 6000000 },
    { k: 'd', t: '$10M – $25M', mid: 16000000 },
    { k: 'e', t: 'Over $25M', mid: 35000000 }
  ];
  var SELLS = ['I do, personally', 'Me and someone else', 'A salesperson or a team'];
  var AWAY  = ['A few days', 'About a week', 'Two weeks or more'];
  var BOOKS = ['A month of work', 'Some tidying', 'Ready today'];

  function band(k) { for (var i = 0; i < BANDS.length; i++) if (BANDS[i].k === k) return BANDS[i]; return BANDS[1]; }

  /* ---------- score: arithmetic on the owner's own answers, nothing imported ---------- */
  function facets(r) {
    var f = [];
    f.push({ n: 'Revenue under contract', v: clampPct(r.rec), s: Math.round(clampPct(r.rec)) });
    f.push({ n: 'Sales independence', v: null, s: [0, 50, 100][r.sells || 0] });
    f.push({ n: 'Owner dependence', v: null, s: [0, 50, 100][r.away || 0] });
    if (r.conc != null) f.push({ n: 'Largest client share', v: r.conc, s: Math.max(0, Math.round(100 - r.conc * 2.2)) });
    if (r.books != null) f.push({ n: 'Books ready', v: null, s: [0, 55, 100][r.books] });
    if (r.margin != null) f.push({ n: 'Adjusted margin', v: r.margin, s: Math.max(0, Math.min(100, Math.round(r.margin * 4.6))) });
    return f;
  }
  function clampPct(v) { v = +v; if (!isFinite(v)) return 0; return Math.max(0, Math.min(100, v)); }
  function score(r) {
    var f = facets(r), t = 0;
    for (var i = 0; i < f.length; i++) t += f[i].s;
    return f.length ? Math.round(t / f.length) : 0;
  }
  function weakest(r, n) {
    return facets(r).slice().sort(function (a, b) { return a.s - b.s; }).slice(0, n || 3);
  }

  /* ---------- the range: only once the owner has given earnings ----------
     E = profit before owner pay − replacement salary.
     Replacement salary default $105,770 — BLS OEWS May 2025, SOC 11-1021
     (General and Operations Managers), the one sourced figure in the engine.  */
  var REPL = 105770;
  function earnings(r) {
    if (r.profit == null) return null;
    return Math.max(0, (+r.profit || 0) - (r.ownerPay != null ? Math.min(+r.ownerPay, REPL) : REPL));
  }
  function ladder(E) {
    if (E < 250000) return 3.0; if (E < 500000) return 3.75; if (E < 1000000) return 4.5;
    if (E < 2000000) return 5.25; if (E < 4000000) return 6.0; return 6.75;
  }
  function multiple(r) {
    var E = earnings(r); if (E == null) return null;
    var base = ladder(E), adj = 0, f = facets(r);
    for (var i = 0; i < f.length; i++) adj += (f[i].s - 50) / 100 * 0.25;
    return Math.max(2.5, Math.min(8, base + adj));
  }
  function range(r) {
    var E = earnings(r), m = multiple(r); if (E == null) return null;
    return { low: E * Math.max(2.0, m - 0.6), high: E * (m + 0.6), E: E, m: m };
  }

  /* ---------- offer structure: what the owner would actually touch ----------
     Illustrative split. Its point is the mechanic: every failed diligence
     check is what a buyer uses to move money out of closing. */
  function structure(r) {
    var g = range(r); if (!g) return null;
    var fails = checks(r).filter(function (c) { return !c.pass; }).length;
    var hold = Math.min(0.55, 0.15 + fails * 0.08);
    var mid = (g.low + g.high) / 2;
    return { total: mid, cash: mid * (1 - hold), held: mid * hold, pct: Math.round(hold * 100), fails: fails };
  }

  /* ---------- what a buyer's diligence actually asks ---------- */
  function checks(r) {
    var c = [];
    c.push({ t: 'Recurring revenue under signed contract',
      pass: clampPct(r.rec) >= 60,
      sub: clampPct(r.rec) >= 60 ? 'At ' + Math.round(clampPct(r.rec)) + '%, a buyer underwrites this revenue.'
         : 'At ' + Math.round(clampPct(r.rec)) + '%, a buyer treats the rest as at-risk and moves it into an earnout.' });
    c.push({ t: 'Someone other than the owner sells',
      pass: (r.sells || 0) > 0,
      sub: (r.sells || 0) > 0 ? 'Growth survives the owner leaving.'
         : 'Growth that stops the day you stop is growth nobody pays for.' });
    c.push({ t: 'The business runs without the owner present',
      pass: (r.away || 0) > 0,
      sub: (r.away || 0) > 0 ? 'You have been away long enough to prove it.'
         : 'Never away longer than a few days reads as one point of failure.' });
    if (r.conc != null) c.push({ t: 'No client worth more than a fifth of revenue',
      pass: r.conc < 20,
      sub: r.conc < 20 ? 'Largest client at ' + r.conc + '% — inside what buyers accept.'
         : 'Largest client at ' + r.conc + '%. This is the defect a buyer cannot fix after closing.' });
    if (r.books != null) c.push({ t: 'Books could open to a buyer this month',
      pass: r.books > 0,
      sub: r.books > 0 ? 'Diligence starts without a delay.'
         : 'Every week of tidying under time pressure is a week the other side uses to renegotiate.' });
    c.push({ t: 'Processes documented well enough to hand over',
      pass: false,
      sub: 'Not asked in this version — and it is the item most often missing. Ask us.' });
    return c;
  }

  /* ---------- deals: only rows we verified. The live index imports their archive. ---------- */
  var DEALS = [
    { y: 2026, m: 'Oct', buyer: 'TD SYNNEX', target: 'BlueStar', focus: 'Specialty distribution', pe: '', px: '', src: 'ChannelE2E, 8 Oct 2026' },
    { y: 2026, m: 'Oct', buyer: 'Accenture', target: 'Plan: $5B of acquisitions over the next year', focus: 'IT services', pe: '', px: '$5B announced', src: 'ChannelE2E, 9 Oct 2026' },
    { y: 2026, m: 'Oct', buyer: 'Employee ownership (ESOP)', target: 'WEBIT Services', focus: 'MSP succession', pe: '', px: '', src: 'ChannelE2E, 1 Oct 2026' },
    { y: 2025, m: '—', buyer: 'Evergreen Services Group', target: 'Most MSP deals by count in 2025', focus: 'MSP platform', pe: 'Alpine Investors', px: '', src: 'Omdia OM142467, 27 Mar 2026' },
    { y: 2024, m: '—', buyer: 'Ntiva', target: 'The Purple Guys', focus: 'MSP', pe: 'PE-backed', px: '', src: "ChannelE2E 2024 list (direction corrected — their row had it reversed)" },
    { y: 2024, m: '—', buyer: 'Dataprise', target: 'Hooks Systems', focus: 'MSP', pe: 'PE-backed', px: '', src: 'ChannelE2E 2024 list (listed twice under two spellings)' },
    { y: 2024, m: '—', buyer: 'Akamai', target: 'Noname Security', focus: 'API security', pe: '', px: '$450M', src: 'ChannelE2E 2024 list — one of only two disclosed prices in a 70-row sample' }
  ];
  /* Archive facts, measured by us against their live pages */
  var ARCHIVE = {
    rows: 2890, from: 2019, to: 2024,
    byYear: [[2019, 64], [2020, 516], [2021, 778], [2022, 958], [2023, 339], [2024, 233], [2025, 0]],
    fill: { target: 100, buyer: 99, focus: 90, country: 81, state: 74, pe: 10, price: 3, valuation: 1, employees: 0 },
    omdia2025: { deals: 169, pePct: 69 }
  };

  function money(n) {
    if (n == null) return '—';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 2) + 'M';
    if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
    return '$' + Math.round(n);
  }
  return { get: get, set: set, clear: clear, unlocked: unlocked, unlock: unlock, bump: bump, stats: stats,
    BANDS: BANDS, SELLS: SELLS, AWAY: AWAY, BOOKS: BOOKS, band: band,
    facets: facets, score: score, weakest: weakest, earnings: earnings, multiple: multiple,
    range: range, structure: structure, checks: checks, DEALS: DEALS, ARCHIVE: ARCHIVE,
    money: money, REPL: REPL };
})();
