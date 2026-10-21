/* MSP Mergers — «Where you sit against everyone else», открытый вид (после почты).
   Подключается на review.html ПОСЛЕ app.js:  <script src="compare.js"></script>
   Закрытый вид и форму с почтой по-прежнему рисует app.js. Как только сравнение
   открыто, этот файл перерисовывает #cmpbox: по каждой из шести мер — где вы,
   где медиана, где границы нижней трети и верхней четверти, и итог по строке. */
(function () {
  var css = [
    '.cx{border:1px solid var(--line);border-radius:14px;background:var(--card2);padding:28px 30px 30px;margin-top:34px}',
    '.cx-hd{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px 28px;justify-content:space-between}',
    '.cx-hd h4{font-family:var(--disp);font-weight:800;font-size:24px;letter-spacing:-.03em;color:#fff}',
    '.cx-hd .hint{color:var(--mute);font-size:13px;margin:8px 0 0}',
    '.cx-sum{display:flex;gap:8px;flex-wrap:wrap}',
    '.cx-sum span{border-radius:999px;padding:7px 13px;font-size:12.5px;font-weight:600;border:1px solid var(--line2);color:var(--dim)}',
    '.cx-sum span b{font-family:var(--disp);font-weight:800;font-size:15px;margin-right:6px;color:#fff}',
    '.cx-sum .t{border-color:rgba(43,161,253,.55);background:rgba(43,161,253,.10)} .cx-sum .t b{color:var(--blue)}',
    '.cx-sum .b{border-color:rgba(240,163,46,.55);background:rgba(240,163,46,.10)} .cx-sum .b b{color:var(--amber)}',
    '.cx-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}',
    '.cx-m{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px 16px}',
    '.cx-top{display:flex;align-items:baseline;gap:12px}',
    '.cx-top .nm{color:#fff;font-weight:600;font-size:15px}',
    '.cx-top .dir{color:var(--mute);font-size:11.5px}',
    '.cx-top .vd{margin-left:auto;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;border-radius:999px;padding:4px 10px;white-space:nowrap}',
    '.vd.t{color:var(--blue);background:rgba(43,161,253,.12)} .vd.a{color:#C9D8EA;background:rgba(255,255,255,.07)}',
    '.vd.w{color:#E9C891;background:rgba(240,163,46,.08)} .vd.b{color:var(--amber);background:rgba(240,163,46,.15)}',
    '.cx-nums{display:flex;align-items:baseline;gap:18px;margin:12px 0 14px}',
    '.cx-nums .you{font-family:var(--disp);font-weight:800;font-size:30px;letter-spacing:-.035em;color:#fff;line-height:1}',
    '.cx-nums .you small{font-family:var(--body);font-size:11.5px;font-weight:500;color:var(--mute);letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:5px}',
    '.cx-nums .md{font-family:var(--disp);font-weight:700;font-size:18px;color:var(--dim);line-height:1}',
    '.cx-nums .md small{font-family:var(--body);font-size:11.5px;font-weight:500;color:var(--mute);letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:5px}',
    '.cx-bar{position:relative;height:30px}',
    '.cx-bar .z{position:absolute;top:11px;height:8px}',
    '.cx-bar .z.lo{left:0;background:rgba(240,163,46,.38);border-radius:5px 0 0 5px}',
    '.cx-bar .z.mi{background:rgba(255,255,255,.14)}',
    '.cx-bar .z.hi{right:0;background:rgba(43,161,253,.45);border-radius:0 5px 5px 0}',
    '.cx-bar .md{position:absolute;top:6px;width:2px;height:18px;background:#C9D8EA;transform:translateX(-1px)}',
    '.cx-bar .you{position:absolute;top:6px;width:18px;height:18px;border-radius:50%;background:#fff;border:4px solid var(--blue);transform:translateX(-9px);box-shadow:0 0 0 3px var(--card)}',
    '.cx-ax{display:flex;justify-content:space-between;color:var(--mute);font-size:11px;margin-top:2px}',
    '.cx-st{display:flex;height:30px;border-radius:7px;overflow:hidden;gap:2px}',
    '.cx-st div{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:rgba(255,255,255,.55);background:rgba(255,255,255,.08);min-width:28px}',
    '.cx-st div.me{background:var(--blue);color:#fff}',
    '.cx-st div.me.lo{background:var(--amber);color:#0A1128}',
    '.cx-st-l{display:flex;gap:2px;margin-top:6px}',
    '.cx-st-l span{color:var(--mute);font-size:11px;line-height:1.3;min-width:28px}',
    '.cx-st-l span.me{color:#fff;font-weight:600}',
    '.cx-say{color:var(--dim);font-size:13px;font-style:italic;line-height:1.5;margin:12px 0 0;border-top:1px solid var(--line);padding-top:11px}',
    '.cx-key{display:flex;flex-wrap:wrap;gap:18px;color:var(--mute);font-size:12px;margin-top:18px}',
    '.cx-key i{display:inline-block;vertical-align:-2px;margin-right:7px}',
    '.cx-verdict{font-size:15.5px;line-height:1.6;color:var(--dim);margin:20px 0 0;max-width:820px}',
    '.cx-verdict b{color:#fff}',
    '.cx-ft{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;border-top:1px solid var(--line);margin-top:24px;padding-top:22px}',
    '.cx-ft .ok{display:flex;align-items:center;gap:10px;color:#fff;font-weight:600;font-size:15px;margin:0}',
    '.cx-ft .ok i{width:22px;height:22px;border-radius:50%;background:var(--blue);display:inline-grid;place-items:center;font-style:normal;font-size:13px}',
    '.cx-ft .sp{flex:1}',
    '.cx-ft a.b1{background:var(--blue);color:#fff;font-weight:600;font-size:14.5px;padding:12px 22px;border-radius:999px}',
    '.cx-ft a.b2{border:1px solid var(--line2);color:#fff;font-weight:600;font-size:14.5px;padding:11px 20px;border-radius:999px}',
    '@media(max-width:980px){.cx-grid{grid-template-columns:1fr}.cx{padding:22px 18px}}',
    '@media print{.cx-ft a{display:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ось каждой меры: слева хуже, справа лучше */
  var AXIS = { recurring: [0, 100], margin: [0, 30], concentration: [60, 0] };

  function clamp(v){ return Math.max(1.5, Math.min(98.5, v)); }
  function at(k, v){ var a = AXIS[k]; return clamp((v - a[0]) / (a[1] - a[0]) * 100); }
  function fmt(v, unit){ return (Math.round(v * 10) / 10) + (unit === '%' ? '%' : ''); }

  function verdictNum(r, v){
    var hi = r.higherIsBetter;
    if (hi ? v >= r.top : v <= r.top) return ['t', 'Top quarter'];
    if (hi ? v >= r.mid : v <= r.mid) return ['a', 'Above median'];
    if (hi ? v > r.low : v < r.low)   return ['w', 'Below median'];
    return ['b', 'Bottom third'];
  }

  function rowNum(r, v){
    var vd = verdictNum(r, v);
    var pLo = at(r.k, r.low), pTop = at(r.k, r.top), pMid = at(r.k, r.mid), pYou = at(r.k, v);
    var a = AXIS[r.k];
    return '<div class="cx-m">' +
      '<div class="cx-top"><span class="nm">' + r.name + '</span><span class="dir">' + (r.higherIsBetter ? 'higher is better' : 'lower is better') +
        '</span><span class="vd ' + vd[0] + '">' + vd[1] + '</span></div>' +
      '<div class="cx-nums"><div class="you"><small>You</small>' + fmt(v, r.unit) + '</div>' +
        '<div class="md"><small>Median</small>' + fmt(r.mid, r.unit) + '</div></div>' +
      '<div class="cx-bar" role="img" aria-label="You ' + fmt(v, r.unit) + ', median ' + fmt(r.mid, r.unit) + ', ' + vd[1] + '">' +
        '<span class="z lo" style="width:' + pLo.toFixed(1) + '%"></span>' +
        '<span class="z mi" style="left:' + pLo.toFixed(1) + '%;width:' + (pTop - pLo).toFixed(1) + '%"></span>' +
        '<span class="z hi" style="width:' + (100 - pTop).toFixed(1) + '%"></span>' +
        '<span class="md" style="left:' + pMid.toFixed(1) + '%"></span>' +
        '<span class="you" style="left:' + pYou.toFixed(1) + '%"></span></div>' +
      '<div class="cx-ax"><span>' + fmt(a[0], r.unit) + '</span><span>bottom third &lt; ' + fmt(r.low, r.unit) +
        ' &middot; top quarter ' + (r.higherIsBetter ? '&ge; ' : '&le; ') + fmt(r.top, r.unit) + '</span><span>' + fmt(a[1], r.unit) + '</span></div>' +
      '<p class="cx-say">&ldquo;' + r.say + '&rdquo;</p></div>';
  }

  function rowBucket(r, v){
    var i = (v | 0) + 1, counts = [r.low, r.mid, r.top], tot = r.low + r.mid + r.top;
    var vd = i === 2 ? ['t', 'Top quarter'] : i === 1 ? ['a', 'Middle'] : ['b', 'Bottom third'];
    var seg = counts.map(function (c, j){
      return '<div class="' + (j === i ? 'me' + (j === 0 ? ' lo' : '') : '') + '" style="flex:' + c + '">' + c + '</div>';
    }).join('');
    var lab = r.buckets.map(function (b, j){
      return '<span class="' + (j === i ? 'me' : '') + '" style="flex:' + counts[j] + '">' + b + '</span>';
    }).join('');
    var share = Math.round(counts[i] / tot * 100);
    return '<div class="cx-m">' +
      '<div class="cx-top"><span class="nm">' + r.name + '</span><span class="dir">' + tot + ' owners</span>' +
        '<span class="vd ' + vd[0] + '">' + vd[1] + '</span></div>' +
      '<div class="cx-nums"><div class="you"><small>You</small>' + r.buckets[i] + '</div>' +
        '<div class="md"><small>Same as you</small>' + share + '%</div></div>' +
      '<div class="cx-st" role="img" aria-label="' + r.buckets.map(function(b,j){return b + ' ' + counts[j];}).join(', ') + '. You: ' + r.buckets[i] + '">' + seg + '</div>' +
      '<div class="cx-st-l">' + lab + '</div>' +
      '<p class="cx-say">&ldquo;' + r.say + '&rdquo;</p></div>';
  }

  function mine(){
    var R = window.__review; if (!R) return null;
    var mg = R.revenue ? (R.adjusted_earnings / R.revenue * 100) : 0;
    return { recurring: R.under_contract_pct, margin: +mg.toFixed(1), concentration: R.largest_client_pct,
             sales: R.sells, books: R.books, owner: R.longest_away };
  }

  function build(){
    var B = window.MSPM && MSPM.bench, M = mine(); if (!B || !M) return null;
    var t = 0, b = 0, worst = null, best = null;
    var cards = B.rows.map(function (r){
      var v = M[r.k];
      if (r.buckets){
        var i = (v | 0) + 1; if (i === 2) t++; if (i === 0){ b++; if (!worst) worst = { r: r, txt: r.buckets[i].toLowerCase() }; }
        return rowBucket(r, v);
      }
      var vd = verdictNum(r, v)[0];
      if (vd === 't'){ t++; if (!best) best = r; }
      if (vd === 'b'){ b++; if (!worst) worst = { r: r, txt: fmt(v, r.unit) + ' against a median of ' + fmt(r.mid, r.unit) }; }
      return rowNum(r, v);
    }).join('');
    var verdict = worst
      ? 'The one to work on first: <b>' + worst.r.name.toLowerCase() + '</b> &mdash; ' + worst.txt + '. That line sits in the bottom third this quarter.'
      : 'Nothing of yours sits in the bottom third this quarter. That is rarer than it sounds.';
    return '<div class="cx" id="cmp" data-v2="1">' +
      '<div class="cx-hd"><div><h4>Where you sit against everyone else</h4>' +
        '<p class="hint">' + B.region + ' &middot; ' + B.quarter + ' &middot; ' + MSPM.counts().finished + ' owners have finished the review this quarter</p></div>' +
        '<div class="cx-sum"><span class="t"><b>' + t + '</b>in the top quarter</span><span><b>' + (6 - t - b) + '</b>in the middle</span><span class="b"><b>' + b + '</b>in the bottom third</span></div></div>' +
      '<div class="cx-grid">' + cards + '</div>' +
      '<div class="cx-key"><span><i style="width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #2BA1FD"></i>You</span>' +
        '<span><i style="width:2px;height:14px;background:#C9D8EA"></i>Median of the quarter</span>' +
        '<span><i style="width:22px;height:8px;border-radius:3px;background:rgba(240,163,46,.38)"></i>Bottom third</span>' +
        '<span><i style="width:22px;height:8px;border-radius:3px;background:rgba(43,161,253,.45)"></i>Top quarter</span></div>' +
      '<p class="cx-verdict">' + verdict + '</p>' +
      '<div class="cx-ft"><p class="ok"><i>&#10003;</i>Unlocked &mdash; your copy of the Q4 benchmark is ready.</p><span class="sp"></span>' +
        '<a class="b1" href="report.html">Open the full Q4 report &rarr;</a>' +
        '<a class="b2" href="#" id="cx-print">Print this comparison</a></div>' +
      '</div>';
  }

  var busy = false;
  function apply(){
    var box = document.getElementById('cmpbox');
    if (!box || busy || !window.MSPM || !MSPM.unlocked || !MSPM.unlocked()) return;
    if (box.querySelector('[data-v2]')) return;
    var h = build(); if (!h) return;
    busy = true; box.innerHTML = h; busy = false;
    var p = document.getElementById('cx-print');
    if (p) p.addEventListener('click', function (e){ e.preventDefault(); window.print(); });
  }
  function start(){
    var box = document.getElementById('cmpbox'); if (!box) return;
    new MutationObserver(function (){ if (!busy) apply(); }).observe(box, { childList: true });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
