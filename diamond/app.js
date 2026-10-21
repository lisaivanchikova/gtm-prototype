/* MSP Mergers — The Review.
   Движок общий с другим партнёрским фронтом: приведённая прибыль, базовый множитель
   по размеру, шесть поправок, коридор ±0,6 оборота. Замещающая зарплата $105,770 —
   медиана BLS OEWS May 2025, SOC 11-1021; это поле, а не константа.
   Шесть граней алмаза — факторы, которые Нил называет публично. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('val-calc')) return;

  var rev=$('v-rev'), sde=$('v-sde'), rep=$('v-rep'), emp=$('v-emp'),
      rec=$('v-rec'), conc=$('v-conc'), out=$('out');
  var pick = { sales:-1, books:0, owner:-1 };

  function money(n){
    if(n>=1e6){var m=n/1e6;return '$'+(m>=10?m.toFixed(1):m.toFixed(2).replace(/0$/,''))+'M';}
    if(n>=1000) return '$'+Math.round(n/1000)+'K';
    return '$'+Math.round(n);
  }
  function readn(el){var n=parseFloat(String(el.value).replace(/[^0-9.]/g,''));return isFinite(n)&&n>0?n:0;}
  function fmt(el){var n=readn(el); el.value = n ? n.toLocaleString('en-US',{maximumFractionDigits:0}) : '';}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function baseMult(e){ if(e<150000)return 3.0; if(e<300000)return 3.75; if(e<600000)return 4.5;
    if(e<1000000)return 5.25; if(e<2000000)return 6.0; return 6.75; }
  function band(e){ if(e<150000)return'under $150K'; if(e<300000)return'$150–300K';
    if(e<600000)return'$300–600K'; if(e<1000000)return'$600K–1M'; if(e<2000000)return'$1–2M'; return'$2M+'; }
  function concTurn(c){ return c<=10?0.4 : c<=20?0.2 : c<=30?0 : c<=40?-0.75 : -1.5; }
  function marginTurn(g){ return g<0.10?-0.5 : g<0.15?-0.15 : g<0.20?0.25 : 0.6; }

  /* шестигранник: грань = фактор, длина луча = его оценка 0–100 */
  function radar(A){
    var W=470,H=300,cx=235,cy=146,R=96;
    var ang=function(i){ return (-90 + i*60) * Math.PI/180; };
    var pt=function(i,r){ return [cx+Math.cos(ang(i))*r, cy+Math.sin(ang(i))*r]; };
    var ring=function(r,extra){
      var d=''; for(var i=0;i<6;i++){ var p=pt(i,r); d+=(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1); }
      return '<path d="'+d+'Z" fill="none" stroke="rgba(255,255,255,.14)" '+(extra||'')+'/>';
    };
    var s='<svg class="radar" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Diamond Score by factor">';
    s+=ring(R)+ring(R*0.55,'stroke-dasharray="3 4"');
    for(var i=0;i<6;i++){ var p=pt(i,R); s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+
      p[1].toFixed(1)+'" stroke="rgba(255,255,255,.09)"/>'; }
    var d='';
    A.forEach(function(x,i){ var p=pt(i, R*Math.max(0.04,x.score/100)); d+=(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1); });
    s+='<path d="'+d+'Z" fill="rgba(43,161,253,.26)" stroke="#2BA1FD" stroke-width="2" stroke-linejoin="round"/>';
    A.forEach(function(x,i){ var p=pt(i, R*Math.max(0.04,x.score/100));
      s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.5" fill="'+(x.score<40?'#F0A32E':'#2BA1FD')+'"/>'; });
    var anchor=['middle','start','start','middle','end','end'];
    var dy=[-16,-4,16,26,16,-4];
    A.forEach(function(x,i){ var p=pt(i,R+12);
      s+='<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+dy[i]).toFixed(1)+'" text-anchor="'+anchor[i]+
         '" font-family="Inter,sans-serif" font-size="11" fill="#9FB4CE">'+x.name+'</text>';
      s+='<text x="'+p[0].toFixed(1)+'" y="'+(p[1]+dy[i]+14).toFixed(1)+'" text-anchor="'+anchor[i]+
         '" font-family="Outfit,sans-serif" font-weight="700" font-size="13.5" fill="#E9EFF8">'+x.score+'</text>'; });
    return s+'</svg>';
  }

  function calc(){
    var r=readn(rev), p=readn(sde), s=readn(rep), n=readn(emp);
    var recPct=+rec.value, concPct=+conc.value;
    $('v-rec-out').textContent=recPct+'%';
    $('v-conc-out').textContent=concPct+'%';

    var cbox=$('cmpbox');
    if(!r || !p){ out.innerHTML='<p class="empty">Put in a revenue figure and what the business '+
      'produced for you, and the range appears here as you type.</p>';
      if(cbox) cbox.innerHTML=''; return; }

    var e = p - s;
    if(e<=0){
      out.innerHTML='<p class="range">No multiple yet.</p><p class="cap">'+money(p)+
        ' produced, less '+money(s)+' to replace you, leaves nothing to capitalise. That is the '+
        'finding, and a buyer runs exactly this line on day one.</p><p class="fine">Fixing this is '+
        'worth doing whether or not you ever sell: the business is not yet paying for the person '+
        'who runs it.</p>'; return;
    }

    var mg = e/r, rph = n ? r/n : 0, A = [];
    A.push({ k:'recurring', name:'Recurring mix',
      v: clamp(((recPct-60)/10)*0.5,-1.5,1.5),
      next: clamp(((Math.min(100,recPct+10)-60)/10)*0.5,-1.5,1.5),
      step:'Ten more points of contracted revenue is worth about ',
      score: Math.round(clamp(recPct,0,100)),
      line: recPct>=60 ? recPct+'% of revenue renews on its own. Contracted revenue is the one thing every buyer pays up for.'
        : 'Only '+recPct+'% of revenue renews on its own. Project work does not transfer with the business, so it is discounted.' });
    A.push({ k:'concentration', name:'Client concentration',
      v: concTurn(concPct),
      next: concTurn(concPct>40?40:concPct>30?30:concPct>20?20:concPct>10?10:concPct),
      step:'Getting it one band lower is worth about ',
      score: Math.round(clamp(100-Math.max(0,concPct-10)*2.5,0,100)),
      line: concTurn(concPct)>=0 ? 'No client is above '+concPct+'% of revenue. Nothing here can walk out and take the year with it.'
        : 'One client is '+concPct+'% of revenue. This is the defect a buyer cannot fix after closing, so it is priced hard.' });
    A.push({ k:'margin', name:'Margin',
      v: marginTurn(mg), next: marginTurn(mg<0.10?0.10:mg<0.15?0.15:mg<0.20?0.20:mg),
      step:'The next margin band is worth about ',
      score: Math.round(clamp(mg*500,0,100)),
      line:'Adjusted margin '+(mg*100).toFixed(1)+'%'+(rph?', on '+money(rph)+' of revenue per head':'')+
        '. Neil on his own company: &ldquo;probably 15% more employees than I needed to have, maybe 20% more.&rdquo;' });
    var sl=pick.sales;
    A.push({ k:'sales', name:'Sales independence',
      v:[-0.5,0,0.4][sl+1], next:[-0.5,0,0.4][Math.min(1,sl+1)+1], step:'One step up is worth about ',
      score:(sl+1)*50,
      line: sl<0 ? 'New business comes through you. A buyer needs a pipeline that does not leave with the owner.'
        : sl>0 ? 'Someone other than you brings in new business. That is what makes the growth line believable.'
        : 'You sell with help. Not a penalty, but nothing is paying a premium for it either.' });
    var bk=pick.books;
    A.push({ k:'books', name:'Books',
      v:[-0.4,0,0.2][bk+1], next:[-0.4,0,0.2][Math.min(1,bk+1)+1], step:'One step up is worth about ',
      score:(bk+1)*50,
      line: bk<0 ? 'The books are not ready for review. Every week of tidying during diligence is a week the buyer uses to renegotiate.'
        : bk>0 ? 'Books ready for review today. Diligence gets shorter and quieter, and short quiet diligence holds the price.'
        : 'Books mostly ready. The tidying will happen under time pressure instead of now.' });
    var ow=pick.owner;
    A.push({ k:'owner', name:'Owner dependence',
      v:[-0.9,0,0.3][ow+1], next:[-0.9,0,0.3][Math.min(1,ow+1)+1], step:'One step up is worth about ',
      score:(ow+1)*50,
      line: ow<0 ? 'A few days is the longest you have been out. What a buyer acquires has to survive your last day.'
        : ow>0 ? 'Two weeks or more away and it kept running. That is the cleanest signal there is.'
        : 'About a week away. It holds, but not long enough to prove it holds without you.' });

    var b=baseMult(e), tot=A.reduce(function(a,x){return a+x.v;},0);
    var m=clamp(b+tot,2.5,8), lo=e*(m-0.6), hi=e*(m+0.6);
    A.forEach(function(x){ x.gain=Math.max(0,x.next-x.v); x.cash=e*x.gain; });
    var worst=A.slice().sort(function(a,c){return c.cash-a.cash;}).filter(function(x){return x.cash>0;}).slice(0,3);
    var m2=clamp(m+worst.reduce(function(a,x){return a+x.gain;},0),2.5,8);
    var score=Math.round(A.reduce(function(a,x){return a+x.score;},0)/A.length);

    var h='<p class="range">'+money(lo)+'&ndash;'+money(hi)+'</p>'+
      '<p class="cap">'+money(e)+' of adjusted earnings &middot; '+band(e)+' band &middot; '+
      (m-0.6).toFixed(1)+'&ndash;'+(m+0.6).toFixed(1)+'&times;</p>'+
      '<div class="scorerow"><b>'+score+'</b><div>Diamond Score &middot; out of 100'+
      '<span>The shape is your business. The empty facets are the rough.</span></div></div>'+
      radar(A);

    if(worst.length){
      h+='<div class="worst"><h4>The three costing you the most</h4>';
      worst.forEach(function(x){ h+='<p class="w"><b>'+x.name+'.</b> '+x.line+
        '<em>'+x.step+money(x.cash)+'.</em></p>'; });
      h+='</div>';
      if(m2>m) h+='<div class="sumbox">Move each of those a single step and the same earnings land at '+
        '<b>'+money(e*(m2-0.6))+'&ndash;'+money(e*(m2+0.6))+'</b>. Nothing about the business changes '+
        'hands to get there.</div>';
    } else {
      h+='<div class="sumbox">Nothing on the list is working against you. That is rare. Run it again '+
        'next year &mdash; what slips first is usually concentration and your own role in it.</div>';
    }
    h+='<p class="fine">Not an offer. Not an appraisal. Arithmetic on figures you typed, with the '+
      'working shown below.</p><p class="anon">This run is anonymous. Nobody knows it was you.</p>';
    out.innerHTML=h;
    var cb=$('cmpbox');
    if(cb) cb.innerHTML = compare({ recurring:recPct, margin:+(mg*100).toFixed(1),
                                    concentration:concPct, sales:sl, books:bk, owner:ow });
    wireGate();

    window.__review={revenue:r,under_contract_pct:recPct,profit_before_owner_pay:p,
      replacement_salary:s,employees:n,revenue_per_head:Math.round(rph),largest_client_pct:concPct,
      sells:sl,books:bk,longest_away:ow,adjusted_earnings:Math.round(e),base_multiple:b,
      adjusted_multiple:+m.toFixed(2),range:money(lo)+'–'+money(hi),diamond_score:score,
      scales:A.map(function(x){return {k:x.k,score:x.score};}),
      worst:worst.map(function(x){return x.k;})};

    /* прогон уходит на стол Нила в тот момент, когда диапазон посчитан.
       Пока анонимно: штат, диапазон выручки, шесть оценок. */
    store({
      revenue:r, employees:n, earnings:Math.round(e),
      lo:Math.round(lo), hi:Math.round(hi), mult:+m.toFixed(2), score:score,
      recPct:recPct, concPct:concPct, margin:+(mg*100).toFixed(1),
      scales:A.map(function(x){return {k:x.k,name:x.name,score:x.score,line:x.line};}),
      worst:worst.map(function(x){return {k:x.k,name:x.name,line:x.line,cash:Math.round(x.cash),step:x.step};}),
      worstName:worst.length?worst[0].name:'—',
      upside:(m2>m)?(money(e*(m2-0.6))+'–'+money(e*(m2+0.6))):null
    });
  }


  /* ——— сравнение с другими владельцами ———
     Свои числа выше открыты всегда. Здесь начинаются чужие, и это стоит адреса. */
  function pct(v,dom){ return Math.max(2,Math.min(98, v/dom*100)); }
  function verdict(r,v){
    if(r.higherIsBetter) return v>=r.top?'top quarter':v>=r.mid?'above the median':v>=r.low?'below the median':'bottom third';
    return v<=r.top?'top quarter':v<=r.mid?'better than the median':v<=r.low?'worse than the median':'bottom third';
  }
  function compare(mine){
    if(!window.MSPM||!MSPM.bench) return '';
    var B=MSPM.bench, open=MSPM.unlocked();
    var h='<div class="cmp'+(open?'':' locked')+'" id="cmp">'+
      '<h4>Where you sit against everyone else</h4>'+
      '<p class="hint">'+B.region+' &middot; '+B.quarter+' &middot; '+MSPM.counts().finished+
      ' owners have finished the review this quarter</p><div class="rows">';
    B.rows.forEach(function(r){
      var v=mine[r.k], dom, pos, mid, label;
      if(r.buckets){
        var i=(v|0)+1, cnt=[r.low,r.mid,r.top][i];
        dom=r.low+r.mid+r.top; pos=pct(cnt,dom); mid=pct(Math.max(r.low,r.mid,r.top),dom);
        label=open? cnt+' of '+dom : '&mdash;';
        h+='<div class="row"><span class="nm">'+r.name+'</span>'+
           '<span class="track"><i class="mid" style="left:'+mid.toFixed(1)+'%"></i>'+
           '<i class="you" style="left:'+pos.toFixed(1)+'%"></i></span><s>'+label+'</s></div>';
      } else {
        dom=(r.higherIsBetter? r.top : r.low)*1.3;
        pos=pct(v,dom); mid=pct(r.mid,dom);
        label=open? r.mid+r.unit : '&mdash;';
        h+='<div class="row"><span class="nm">'+r.name+'</span>'+
           '<span class="track"><i class="mid" style="left:'+mid.toFixed(1)+'%"></i>'+
           '<i class="you" style="left:'+pos.toFixed(1)+'%"></i></span><s>'+label+'</s></div>';
      }
    });
    h+='</div>';
    h+='<div class="key"><span><i style="background:#2BA1FD"></i>You</span>'+
       '<span><i style="background:#7D93AF"></i>'+(open?'Median of the quarter':'Median &mdash; locked')+'</span></div>';
    if(open){
      var worstRow=null, worstV=null;
      B.rows.forEach(function(r){
        if(r.buckets) return;
        var v=mine[r.k], d=verdict(r,v);
        if(d==='bottom third' && !worstRow){ worstRow=r; worstV=v; }
      });
      h+='<p class="verdict">'+(worstRow
          ? 'Your <b>'+worstRow.name.toLowerCase()+'</b> is in the <b>bottom third</b> at '+worstV+worstRow.unit+
            ', against a median of '+worstRow.mid+worstRow.unit+'. &ldquo;'+worstRow.say+'&rdquo;'
          : 'Nothing of yours sits in the bottom third this quarter. That is rarer than it sounds.')+'</p>'+
        '<div class="lockbox done"><b>Opened.</b><p>The full Q4 benchmark, all six measures with '+
        'Neil&rsquo;s commentary, is in <a href="report.html">the report</a>. '+
        '<a href="#" id="printcmp">Print your copy</a>.</p></div>';
    } else {
      h+='<div class="lockbox"><div><b>Open the comparison</b>'+
        '<p>Your six numbers against the medians of every owner who has finished this quarter, '+
        'plus the full Q4 benchmark with Neil&rsquo;s commentary. Everything above stays as it is '+
        '&mdash; this adds everybody else.</p>'+
        '<p class="fine">Your own figures never leave this page. The name and address reach Neil, '+
        'and nothing else does unless you book a call.</p></div>'+
        '<div><div class="idrow">'+
        '<input type="text" id="g-name" placeholder="Your name" autocomplete="name">'+
        '<input type="text" id="g-co" placeholder="Company" autocomplete="organization">'+
        '<input type="text" id="g-city" placeholder="City, ST" autocomplete="address-level2"></div>'+
        '<div class="mailrow"><input type="email" id="g-mail" placeholder="you@yourmsp.com">'+
        '<button id="g-go">Open it</button></div></div></div>';
    }
    return h+'</div>';
  }
  function wireGate(){
    var go=$('g-go');
    if(go) go.addEventListener('click',function(){
      var m=$('g-mail'), v=(m.value||'').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){ m.focus(); m.style.borderColor='#F0A32E'; return; }
      MSPM.unlock(v);
      identify('g-name','g-co','g-city','g-mail','report');
      calc();
    });
    var pr=$('printcmp');
    if(pr) pr.addEventListener('click',function(e){ e.preventDefault(); window.print(); });
  }

  /* ——— запись прогона ——— */
  var RID = null;
  try { RID = sessionStorage.getItem('mspm.rid'); } catch(err){}
  function rid(){
    if(!RID){ RID='r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      try{ sessionStorage.setItem('mspm.rid',RID); }catch(err){} }
    return RID;
  }
  function store(data){
    if(!window.MSPM) return;
    var prev = window.MSPM.get(rid()) || {};
    data.id = rid();
    data.ts = prev.ts || Date.now();
    data.runs = prev.runs || 1;
    data.firstScore = (prev.firstScore === undefined) ? data.score : prev.firstScore;
    data.asked = prev.asked || 'nothing';
    data.name = prev.name || ''; data.company = prev.company || '';
    data.city = prev.city || ''; data.email = prev.email || '';
    data.slot = prev.slot || ''; data.note = prev.note || '';
    window.MSPM.upsert(data);
  }
  function identify(nameId,coId,cityId,mailId,asked,slot){
    if(!window.MSPM) return;
    var g=function(id){var el=$(id);return el?(el.value||'').trim():'';};
    window.MSPM.patch(rid(),{
      name:g(nameId)||'Name withheld', company:g(coId)||'Company withheld',
      city:g(cityId)||'', email:g(mailId), asked:asked, slot:slot||'', askedAt:Date.now()
    });
    var box=$('out'); if(!box) return;
    var old=box.querySelector('.landed'); if(old) old.remove();
    var d=document.createElement('div'); d.className='landed';
    d.innerHTML = asked==='call'
      ? 'Your six numbers are with <b>Neil</b>. He opens them before the call &mdash; you will not be starting at the beginning.'
      : 'Your six numbers are with <b>Neil</b>. The written report follows within the hour.';
    box.appendChild(d);
  }

  [rev,sde,rep,emp,rec,conc].forEach(function(el){ el.addEventListener('input',calc); });
  [rev,sde,rep,emp].forEach(function(el){
    el.addEventListener('blur',function(){fmt(el);calc();});
    el.addEventListener('focus',function(){var v=readn(el);el.value=v?String(v):'';});
  });
  document.querySelectorAll('.chips').forEach(function(g){
    g.addEventListener('click',function(ev){
      var b=ev.target.closest('.chip'); if(!b) return;
      g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on'); pick[g.getAttribute('data-k')]=+b.getAttribute('data-v'); calc();
    });
  });

  var send=$('send');
  if(send) send.addEventListener('click',function(){
    var m=$('mail'), v=(m.value||'').trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){ m.focus(); m.style.borderColor='#F0A32E'; return; }
    m.style.borderColor=''; $('ok').style.display='block';
    m.disabled=true; send.disabled=true; send.textContent='Sent';
    window.__reportRequest={email:v,review:window.__review||null,at:new Date().toISOString()};
    identify('r-name','r-co','r-city','mail','report');
    if(window.MSPM){ MSPM.unlock(v); calc(); }
  });

  var slot='';
  var slots=$('slots');
  if(slots) slots.addEventListener('click',function(ev){
    var b=ev.target.closest('.chip'); if(!b) return;
    slots.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');});
    b.classList.add('on'); slot=b.getAttribute('data-slot');
  });
  var book=$('book');
  if(book) book.addEventListener('click',function(){
    var m=$('b-mail'), v=(m.value||'').trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){ m.focus(); m.style.borderColor='#F0A32E'; return; }
    if(!slot){ var f=slots.querySelector('.chip'); f.classList.add('on'); slot=f.getAttribute('data-slot'); }
    m.style.borderColor=''; $('bok').style.display='block';
    m.disabled=true; book.disabled=true; book.textContent='Booked';
    identify('b-name','b-co','b-city','b-mail','call',slot);
  });

  calc();
})();
