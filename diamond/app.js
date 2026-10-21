/* MSP Mergers — pre-exit review.
   Same engine as the other partner front: adjusted earnings, a base multiple by size band,
   six adjustments, a range of plus/minus 0.6 turns. What changes here is the skin and the
   six factors, which are the ones Neil names publicly: recurring mix, margin (built from
   revenue per head and tool load), client concentration, sales independence, books, and
   owner dependence.
   Replacement salary default $105,770 — US median for general and operations managers,
   BLS OEWS May 2025. It is a field, not a constant. The multiple ladder is ours and is
   disclosed as ours on the page. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('val-calc')) return;

  var rev=$('v-rev'), sde=$('v-sde'), rep=$('v-rep'), emp=$('v-emp'),
      rec=$('v-rec'), conc=$('v-conc'), sales=$('v-sales'), books=$('v-books'), owner=$('v-owner'),
      out=$('out'), empty=$('empty');

  function money(n){
    if(n>=1e6){var m=n/1e6;return '$'+(m>=10?m.toFixed(1):m.toFixed(2).replace(/0$/,''))+'M';}
    if(n>=1000) return '$'+Math.round(n/1000)+'K';
    return '$'+Math.round(n);
  }
  function num(n){return Math.round(n).toLocaleString('en-US');}
  function readn(el){var n=parseFloat(String(el.value).replace(/[^0-9.]/g,''));return isFinite(n)&&n>0?n:0;}
  function fmt(el){var n=readn(el); el.value = n ? '$'+n.toLocaleString('en-US',{maximumFractionDigits:0}) : '';}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function baseMult(e){ if(e<150000)return 3.0; if(e<300000)return 3.75; if(e<600000)return 4.5;
    if(e<1000000)return 5.25; if(e<2000000)return 6.0; return 6.75; }
  function band(e){ if(e<150000)return'under $150K'; if(e<300000)return'$150–300K';
    if(e<600000)return'$300–600K'; if(e<1000000)return'$600K–1M'; if(e<2000000)return'$1–2M'; return'$2M+'; }

  function concTurn(c){ return c<=10?0.4 : c<=20?0.2 : c<=30?0 : c<=40?-0.75 : -1.5; }
  function marginTurn(g){ return g<0.10?-0.5 : g<0.15?-0.15 : g<0.20?0.25 : 0.6; }

  function calc(){
    var r=readn(rev), p=readn(sde), s=readn(rep), n=readn(emp);
    var recPct=+rec.value, concPct=+conc.value;
    $('v-rec-out').textContent=recPct+'%';
    $('v-conc-out').textContent=concPct+'%';

    if(!r || !p){ empty.hidden=false; out.hidden=true; return; }
    empty.hidden=true; out.hidden=false;

    var e = p - s;
    if(e<=0){
      out.innerHTML =
        '<p class="range">No multiple yet.</p>'+
        '<p class="cap">'+num(p)+' produced, less '+num(s)+' to replace you, leaves nothing to '+
        'capitalise. That is the finding, and a buyer runs exactly this line on day one.</p>'+
        '<div class="hr"></div>'+
        '<p class="fine">Fixing this is worth doing whether or not you ever sell: the business '+
        'is not yet paying for the person who runs it.</p>';
      return;
    }

    var mg = e/r;
    var rph = n ? r/n : 0;

    var A = [];
    A.push({ k:'recurring', name:'Recurring mix',
      v: clamp(((recPct-60)/10)*0.5, -1.5, 1.5),
      next: clamp(((Math.min(100,recPct+10)-60)/10)*0.5, -1.5, 1.5),
      step: 'Ten more points of contracted revenue is worth about ',
      score: clamp(recPct,0,100),
      line: recPct>=60
        ? recPct+'% of revenue renews on its own. Contracted revenue is the one thing every buyer pays up for.'
        : 'Only '+recPct+'% of revenue renews on its own. Project work does not transfer with the business, so it is discounted.',
      });
    var ca = concTurn(concPct);
    A.push({ k:'concentration', name:'Client concentration',
      v: ca, next: concTurn(concPct>40?40:concPct>30?30:concPct>20?20:concPct>10?10:concPct),
      step: 'Getting it one band lower is worth about ',
      score: Math.round(clamp(100-Math.max(0,concPct-10)*2.5,0,100)),
      line: ca>=0 ? 'No client is above '+concPct+'% of revenue. Nothing here can walk out and take the year with it.'
                  : 'One client is '+concPct+'% of revenue. This is the defect a buyer cannot fix after closing, so it is priced hard.',
      });
    var ma = marginTurn(mg);
    A.push({ k:'margin', name:'Margin',
      v: ma, next: marginTurn(mg<0.10?0.10:mg<0.15?0.15:mg<0.20?0.20:mg),
      step: 'The next margin band is worth about ',
      score: clamp(Math.round(mg*500),0,100),
      line: 'Adjusted margin '+(mg*100).toFixed(1)+'%'+ (rph ? ', on '+money(rph)+' of revenue per head' : '')+
            '. Neil on his own company: &ldquo;probably 15% more employees than I needed to have, maybe 20% more.&rdquo;',
      });
    var sl=+sales.value, sa=[-0.5,0,0.4][sl+1];
    A.push({ k:'sales', name:'Sales independence',
      v: sa, next: [-0.5,0,0.4][Math.min(1,sl+1)+1], step: 'One step up is worth about ',
      score: (sl+1)*50,
      line: sl<0 ? 'New business comes through you. A buyer reads that as growth that stops the day you do.'
           : sl>0 ? 'Someone other than you brings in new business. That is what makes the growth line believable.'
                  : 'You sell with help. Not a penalty, but nothing is paying a premium for it either.',
      });
    var bk=+books.value, ba=[-0.4,0,0.2][bk+1];
    A.push({ k:'books', name:'Books',
      v: ba, next: [-0.4,0,0.2][Math.min(1,bk+1)+1], step: 'One step up is worth about ',
      score: (bk+1)*50,
      line: bk<0 ? 'The books are not ready for review. Every week of tidying during diligence is a week the buyer uses to renegotiate.'
           : bk>0 ? 'Books ready for review today. Diligence gets shorter and quieter, and short quiet diligence holds the price.'
                  : 'Books mostly ready. The tidying will happen under time pressure instead of now.',
      });
    var ow=+owner.value, oa=[-0.9,0,0.3][ow+1];
    A.push({ k:'owner', name:'Owner dependence',
      v: oa, next: [-0.9,0,0.3][Math.min(1,ow+1)+1], step: 'One step up is worth about ',
      score: (ow+1)*50,
      line: ow<0 ? 'A few days is the longest you have been out. What a buyer acquires has to survive your last day.'
           : ow>0 ? 'Two weeks or more away and it kept running. That is the cleanest signal there is.'
                  : 'About a week away. It holds, but not long enough to prove it holds without you.',
      });

    var b = baseMult(e);
    var tot = A.reduce(function(a,x){return a+x.v;},0);
    var m = clamp(b+tot, 2.5, 8);
    var lo = e*(m-0.6), hi = e*(m+0.6);

    A.forEach(function(x){ x.gain = Math.max(0, x.next - x.v); x.cash = e*x.gain; });
    var worst = A.slice().sort(function(a,c){return c.cash-a.cash;}).filter(function(x){return x.cash>0;}).slice(0,3);
    var allGain = worst.reduce(function(a,x){return a+x.gain;},0);
    var m2 = clamp(m+allGain, 2.5, 8);

    var score = Math.round(A.reduce(function(a,x){return a+x.score;},0)/A.length);

    var html =
      '<p class="range">'+money(lo)+'&ndash;'+money(hi)+'</p>'+
      '<p class="cap">'+money(e)+' of adjusted earnings &middot; '+band(e)+' band &middot; '+
        (m-0.6).toFixed(1)+'&ndash;'+(m+0.6).toFixed(1)+'&times;</p>'+
      '<div class="hr"></div>'+
      '<div class="score"><b>'+score+'</b><span>Diamond Score &middot; out of 100</span></div>'+
      '<div class="bars">';
    A.forEach(function(x){
      html += '<div class="bar'+(x.score<50?' low':'')+'"><i>'+x.name+'</i>'+
              '<u><b style="width:'+x.score+'%"></b></u><s>'+x.score+'</s></div>';
    });
    html += '</div>';

    if(worst.length){
      html += '<div class="worst"><p class="hd" style="margin:22px 0 2px">'+
              'The '+(worst.length===1?'one':worst.length===2?'two':'three')+' costing you the most</p>';
      worst.forEach(function(x){
        html += '<div class="w"><b>'+x.name+'.</b> '+x.line+' <em>'+x.step+money(x.cash)+'.</em></div>';
      });
      html += '</div>';
      if(m2>m){
        html += '<p class="fine" style="color:#D6E4F2;font-size:14.5px">Move '+
          (worst.length===1?'that one':'each of those')+' a single step and the same earnings land at '+
          '<b style="color:#fff">'+money(e*(m2-0.6))+'&ndash;'+money(e*(m2+0.6))+'</b>. '+
          'Nothing about the business changes hands to get there.</p>';
      }
    } else {
      html += '<div class="worst"><div class="w">Nothing on the list is working against you. '+
        'That is rare. Run it again next year &mdash; what slips first is usually concentration '+
        'and your own role in it.</div></div>';
    }

    html += '<p class="fine">Not an offer. Not an appraisal. Arithmetic on figures you typed, '+
            'with the working shown below.</p>';
    out.innerHTML = html;

    window.__review = { revenue:r, under_contract_pct:recPct, profit_before_owner_pay:p,
      replacement_salary:s, employees:n, revenue_per_head:Math.round(rph),
      largest_client_pct:concPct, sells:sales.options[sales.selectedIndex].text,
      books:books.options[books.selectedIndex].text, longest_away:owner.options[owner.selectedIndex].text,
      adjusted_earnings:Math.round(e), base_multiple:b, adjusted_multiple:+m.toFixed(2),
      range:money(lo)+'–'+money(hi), diamond_score:score,
      worst:worst.map(function(x){return x.k;}) };
  }

  [rev,sde,rep,emp,rec,conc].forEach(function(el){ el.addEventListener('input',calc); });
  [rev,sde,rep].forEach(function(el){
    el.addEventListener('blur',function(){fmt(el);calc();});
    el.addEventListener('focus',function(){var v=readn(el);el.value=v?String(v):'';});
  });
  [sales,books,owner].forEach(function(el){ el.addEventListener('change',calc); });

  var send=$('send');
  if(send){
    send.addEventListener('click',function(){
      var m=$('mail'), v=(m.value||'').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){ m.focus(); m.style.borderColor='#F2A33C'; return; }
      m.style.borderColor='';
      $('ok').style.display='block';
      m.disabled=true; send.disabled=true; send.textContent='Sent';
      window.__reportRequest = { email:v, review:window.__review||null, at:new Date().toISOString() };
    });
  }

  calc();
})();
