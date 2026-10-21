/* Кабинет Нила. Всё на странице собрано из хранилища: прогон, сделанный на обзоре,
   появляется здесь сверху через F5 — это то, что показывают на звонке. */
(function () {
  if (!window.MSPM || !document.getElementById('tbody')) return;
  /* desk.html?reset — сброс перед повторным прогоном на звонке.
     Без кнопки на странице: это нужно показывающему, а не Нилу. */
  if (/[?&]reset\b/.test(location.search)) {
    MSPM.clear();
    try { localStorage.removeItem('mspm.seeded.v1'); sessionStorage.removeItem('mspm.rid'); } catch (e) {}
    location.replace('desk.html');
    return;
  }
  MSPM.seed();

  var $ = function (id) { return document.getElementById(id); };
  var M = MSPM.money;

  function byNewest(a, b) { return b.ts - a.ts; }
  /* порядок панели: записался на звонок → вернулся и вырос → запросил отчёт → крупный и слабый */
  function rank(r) {
    if (r.asked === 'call') return 0;
    if (r.runs > 1 && r.score > r.firstScore) return 1;
    if (r.asked === 'report') return 2;
    return 3;
  }
  function panelReason(r) {
    if (r.panel) return r.panel;
    return MSPM.reason(r);
  }
  function weakNames(r) {
    if (r.worst && r.worst.length) {
      return r.worst.map(function (w) { return w.name.split(' ')[0]; }).join(' · ');
    }
    return r.scales.slice().sort(function (a, b) { return a.score - b.score; })
            .slice(0, 3).map(function (s) { return s.name.split(' ')[0]; }).join(' · ');
  }
  function askedLabel(r) {
    if (r.asked === 'call') return '30 min';
    if (r.asked === 'report') return r.askedTwice ? 'Report ×2' : 'Report';
    return '—';
  }

  var all = MSPM.all().sort(byNewest);
  var live = MSPM.live();
  var named = all.filter(function (r) { return !r.anon; });

  /* ——— счётчики ——— */
  var c = MSPM.counts();
  $('k-talks').textContent = c.talks;
  $('k-opened').textContent = c.opened;
  $('k-finished').innerHTML = c.finished + ' <i>' + Math.round(c.finished / c.opened * 100) + '%</i>';
  $('k-score').textContent = c.medianScore;
  $('k-report').textContent = c.report;
  $('k-booked').textContent = c.booked;
  $('k-back').textContent = c.back;
  $('k-head').textContent = 'What ' + c.finished + ' owners told the review.';
  $('k-n').textContent = 'The MSP Owner Benchmark · Q4 2026 · n = ' + c.finished;

  /* ——— «стоит набрать на этой неделе» ——— */
  var panel = named.slice().sort(function (a, b) {
    var d = rank(a) - rank(b); return d || (b.ts - a.ts);
  }).slice(0, 4);
  $('panel').innerHTML = panel.map(function (r) {
    return '<div class="call"><span class="av">' + MSPM.initials(r.name === '[Owner name]' ? r.city : r.name) + '</span>' +
      '<span class="who"><b>' + r.name + '</b><span>' + r.company + ' · ' + r.city + '</span></span>' +
      '<span class="why">' + panelReason(r) + '</span>' +
      '<span class="sc">' + r.score + '</span>' +
      '<a href="owner.html?id=' + r.id + '">Open card &rarr;</a></div>';
  }).join('');

  /* ——— «все, кто дошёл до конца» ——— */
  $('tbody').innerHTML = all.slice(0, 12).map(function (r) {
    if (r.anon) {
      return '<tr class="anon"><td>' + MSPM.when(r.ts).split(',')[0] + '</td>' +
        '<td><span class="anontag">&#128274; Anonymous</span></td>' +
        '<td>' + r.state + '</td><td>' + MSPM.band(r.revenue) + ' band</td><td>&mdash;</td>' +
        '<td>' + r.score + '</td><td class="weak">' + weakNames(r) + '</td><td>&mdash;</td></tr>';
    }
    return '<tr class="named' + (r.seed ? '' : ' fresh') + '"><td>' + MSPM.when(r.ts).split(',')[0] +
      (r.seed ? '' : '<small>' + MSPM.ago(r.ts) + '</small>') + '</td>' +
      '<td><b>' + r.name + '</b><small>' + r.company + '</small></td>' +
      '<td>' + (r.city || r.state) + '</td><td>' + M(r.revenue) + '</td>' +
      '<td>' + M(r.earnings) + '</td><td>' + r.score + '</td>' +
      '<td class="weak">' + weakNames(r) + '</td>' +
      '<td><a href="owner.html?id=' + r.id + '">' + askedLabel(r) + ' &rarr;</a></td></tr>';
  }).join('');

  /* ——— «вернулись» ——— */
  var back = all.filter(function (r) { return r.runs > 1; });
  $('back').innerHTML = back.length ? back.map(function (r) {
    return '<div class="b"><div><b>' + (r.anon ? r.state + ' · anonymous' : r.city + ' · named') + '</b>' +
      '<span>' + weakNames(r) + '</span></div><s>' + r.firstScore + ' &rarr; ' + r.score + '</s></div>';
  }).join('') : '<p style="color:var(--mute);font-size:13px;margin:0">Nobody has re-run it yet this quarter.</p>';

  /* ——— новый прогон: заметная строка сверху ——— */
  if (live.length) {
    var n = live.sort(byNewest)[0];
    $('fresh').style.display = 'block';
    $('fresh').innerHTML = '<b>' + (n.anon ? 'An anonymous owner' : n.name) + '</b> finished the review ' +
      MSPM.ago(n.ts) + ' — ' + M(n.revenue) + ' revenue, score ' + n.score +
      (n.asked === 'call' ? ', booked ' + n.slot : n.asked === 'report' ? ', asked for the report' : ', asked for nothing') +
      '. <a href="owner.html?id=' + n.id + '">Open the card &rarr;</a>';
  }
})();
