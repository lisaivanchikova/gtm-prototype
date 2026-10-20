/* Find Your Best Exit — estimate.
   Two numbers the owner knows by heart; the conversion to adjusted earnings is
   done in the open and printed on the receipt line by line.
   Replacement salary default $105,770 — US median for general and operations
   managers, BLS OEWS May 2025. It is a field, not a constant.
   Multiple ladder and the five adjustments carry over from the Intwin engine
   and still need a citable source before launch — see build.html. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var root = $('val-calc'); if (!root) return;
  var rev=$('v-rev'), sde=$('v-sde'), rep=$('v-rep'), rec=$('v-rec'), conc=$('v-conc'),
      growth=$('v-growth'), owner=$('v-owner'), out=$('rcpt'), fork=$('fork-note');

  var NAMES={recurring:'your recurring mix',concentration:'client concentration',
             growth:'the revenue trend',margin:'your margin',owner:'your own role in it'};
  var state={};

  function num(n){return Math.round(n).toLocaleString('en-US');}
  function money(n){ if(n>=1e6){var m=n/1e6;return '$'+(m>=10?m.toFixed(1):m.toFixed(2).replace(/0$/,''))+'M';}
    if(n>=1000) return '$'+Math.round(n/1000)+'K'; return '$'+Math.round(n); }
  function base(e){ if(e<150000)return 3.0; if(e<300000)return 3.75; if(e<600000)return 4.5;
    if(e<1000000)return 5.25; if(e<2000000)return 6.0; return 6.75; }
  function band(e){ if(e<150000)return'<150K'; if(e<300000)return'150–300K'; if(e<600000)return'300–600K';
    if(e<1000000)return'600K–1M'; if(e<2000000)return'1–2M'; return'2M+'; }
  function read(el){var n=parseFloat(String(el.value).replace(/[^0-9.]/g,''));return isFinite(n)&&n>0?n:0;}
  function write(el){var n=read(el); el.value = n ? '$'+n.toLocaleString('en-US',{maximumFractionDigits:0}) : '';}
  function row(l,v,cls){return '<div class="r'+(cls?' '+cls:'')+'"><span>'+l+'</span><span>'+v+'</span></div>';}

  function calc() {
    var r=read(rev), p=read(sde), s=read(rep);
    var recPct=+rec.value, concPct=+conc.value;
    $('v-rec-out').textContent=recPct+'%';
    $('v-conc-out').textContent=concPct+'%';

    var head='<h4>Find Your Best Exit</h4><p class="sub">Valuation estimate · join.intwin.tech</p>';
    if(!r||!p){ out.innerHTML=head+'<div class="note">Put in a revenue figure and what the business produced for you.</div>'; return; }

    var e=p-s;
    if(e<=0){
      out.innerHTML=head+row('REVENUE',num(r))+row('PRODUCED FOR YOU',num(p))+
        row('REPLACEMENT SALARY','-'+num(s))+row('ADJ. EARNINGS',num(e),'b')+
        '<div class="hr"></div><div class="note">The business does not yet cover the cost of '+
        'replacing you. There is no multiple to apply, and that is the finding: a buyer runs '+
        'exactly this calculation on day one.</div><div class="bars"></div>';
      fork.innerHTML='Then it is a scorecard, and it says the business is not yet paying for the '+
        'person who runs it. That is the one thing to fix, and it is worth fixing for its own sake.';
      state={revenue:r,owner_earnings:p,replacement_salary:s,result:'below replacement cost'};
      return;
    }

    var b=base(e), adj=[];
    var ra=Math.max(-1.5,Math.min(1.5,((recPct-60)/10)*0.5));
    adj.push({v:Math.abs(ra)>=0.05?ra:0,k:'recurring',lab:'RECURRING '+recPct+'%',
      text:recPct>=60?recPct+'% recurring. Contracted revenue is the single thing every buyer pays up for.'
        :'Only '+recPct+'% recurring. Project revenue does not transfer with the business, so it is discounted.'});
    var ca = concPct<=10?0.4 : concPct<=20?0.2 : concPct<=30?0 : concPct<=40?-0.75 : -1.5;
    adj.push({v:ca,k:'concentration',lab:'LARGEST CLIENT '+concPct+'%',
      text:ca>=0?'No client above '+concPct+'% of revenue. Nothing here can walk out and take the year with it.'
        :'One client at '+concPct+'% of revenue. This is the defect a buyer cannot fix after closing, so it is priced hard.'});
    var g=+growth.value, ga=[-0.75,-0.25,0.25,0.6][g+1];
    adj.push({v:ga,k:'growth',lab:['REVENUE SHRINKING','FLAT REVENUE','GROWTH <10%','GROWTH >10%'][g+1],
      text:['Revenue shrinking. A buyer is pricing the trend, not the last good year.',
            'Flat revenue: not a penalty on its own, but nothing is paying for a premium either.',
            'Steady growth under 10% a year.',
            'Growing over 10% a year, which is what pulls a business to the top of its size band.'][g+1]});
    var mg=e/r, ma = mg<0.10?-0.5 : mg<0.15?-0.15 : mg<0.20?0.25 : 0.6;
    adj.push({v:ma,k:'margin',lab:'MARGIN '+(mg*100).toFixed(1)+'%',
      text: mg<0.10?'Adjusted margin under 10%. The sector average is around 11% and the top of the market runs near 20%.'
        : mg<0.15?'Margin just under the sector average of about 11%.'
        : mg<0.20?'Margin above the sector average.':'Margin over 20%, which is best-in-class for this size.'});
    var o=+owner.value, oa=[-0.9,0,0.3][o+1];
    adj.push({v:oa,k:'owner',lab:['STILL ON THE TOOLS','OWNER RUNS IT','RUNS WITHOUT OWNER'][o+1],
      text:o<0?'You are still doing technical work. What a buyer is acquiring has to survive your last day.'
        :o>0?'It runs without you day to day, which is what makes a clean transition possible.'
        :'You run it day to day. Not a penalty, but nothing is paying a premium for it either.'});

    var tot=adj.reduce(function(a,x){return a+x.v;},0);
    var m=Math.max(2.5,Math.min(8,b+tot));
    var lo=e*(m-0.6), hi=e*(m+0.6);
    var neg=adj.filter(function(x){return x.v<0;}).sort(function(a,c){return a.v-c.v;});
    var turns=neg.reduce(function(a,x){return a-x.v;},0);

    var html=head
      + row('REVENUE',num(r)) + row('PRODUCED FOR YOU',num(p))
      + row('REPLACEMENT SALARY','-'+num(s)) + row('ADJ. EARNINGS',num(e),'b')
      + '<div class="hr"></div>'
      + row('BASE · '+band(e)+' BAND',b.toFixed(2)+'x');
    adj.forEach(function(x){
      html += row(x.lab, (x.v>0?'+':'')+x.v.toFixed(2), x.v<0?'hl':'');
    });
    html += row('MULTIPLE ±0.6',(m-0.6).toFixed(1)+'–'+(m+0.6).toFixed(1)+'x','b')
      + '<div class="hr"></div>'
      + '<p class="sub" style="text-align:left;margin:0">A buyer would pay</p>'
      + '<div class="big">'+money(lo)+'–'+money(hi)+'</div>'
      + row('≈ REVENUE MULTIPLE',(lo/r).toFixed(2)+'–'+(hi/r).toFixed(2)+'x')
      + (turns ? row("FIX WHAT'S AGAINST YOU",'+'+num(e*turns),'b') : '')
      + '<div class="hr"></div>'
      + '<div class="note">'+ neg.slice(0,2).map(function(x){return x.text;}).join(' ') +
        (neg.length?'<br><br>':'') + 'Not an offer. Not an appraisal. Arithmetic on your own figures.</div>'
      + '<div class="bars"></div>';
    out.innerHTML=html;

    fork.innerHTML = neg.length
      ? 'Then it is a scorecard. The line costing you most right now is <b>'+NAMES[neg[0].k]+
        '</b> &mdash; about <b>'+money(e*-neg[0].v)+'</b> of value. Fix that one, and run this again in a year to see if it moved.'
      : 'Then it is a scorecard, and nothing on this list is working against you. That is rare. Run it again in a year — what slips first is usually concentration and your own role in it.';

    state={revenue:r,owner_earnings:p,replacement_salary:s,adjusted_earnings:e,
      recurring_pct:recPct,largest_client_pct:concPct,
      growth:growth.options[growth.selectedIndex].text,owner_role:owner.options[owner.selectedIndex].text,
      base_multiple:b,adjusted_multiple:m.toFixed(2),indicative_range:money(lo)+' - '+money(hi),
      against_you:neg.map(function(x){return x.k;}).join(',')};
  }

  [rev,sde,rep,rec,conc].forEach(function(el){el.addEventListener('input',calc);});
  [rev,sde,rep].forEach(function(el){
    el.addEventListener('blur',function(){write(el);calc();});
    el.addEventListener('focus',function(){var n=read(el);el.value=n?String(n):'';});
  });
  [growth,owner].forEach(function(el){el.addEventListener('change',calc);});
  calc();
  window.FYBE_STATE=function(){return JSON.parse(JSON.stringify(state));};
})();

/* Credentials ticker — doubled so the loop is seamless. */
(function(){
  var el=document.getElementById('tick'); if(!el) return;
  var items=['Net Sciences, Inc. 1996–2026','Sold to Qual IT','ASCII Group member since 1996',
    'ASCII Executive Strategic Committee','MSP 500 ×2','MSP 501','NextGen 101',
    'New Mexico Private 100 ×2','36 years in networking, 30 in security'];
  var html=items.map(function(t){return '<span>'+t+'</span>';}).join('');
  el.innerHTML=html+html;
})();

/* Three forms, one endpoint; the subject separates them. */
(function(){
  var ok=function(v){return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v);};
  var talk=function(){return new URLSearchParams(location.search).get('t')||'';};
  function post(p){return fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(p)}).then(function(r){if(!r.ok)throw new Error(r.status);});}
  function wire(btnId,inId,msgId,subj,extra,done){
    var b=document.getElementById(btnId); if(!b) return;
    var i=document.getElementById(inId), m=document.getElementById(msgId);
    b.addEventListener('click',function(){
      var v=(i.value||'').trim();
      if(!ok(v)){m.textContent='That address does not look right — check it and send again.';i.focus();return;}
      b.disabled=true; m.textContent='Sending…';
      var p={subject:subj,source:'liberman',talk:talk(),email:v};
      if(extra) extra(p);
      post(p).then(function(){m.textContent=done;i.value='';})
        .catch(function(){b.disabled=false;m.textContent='That did not go through. Try once more in a minute.';});
    });
  }
  wire('v-send','v-email','v-msg','Valuation estimate — written breakdown',
    function(p){p.answers=window.FYBE_STATE?window.FYBE_STATE():{};},
    'On its way. I read these myself — expect a reply from me, not a sequence.');
  wire('b-send','b-email','b-msg','Regional benchmark — subscribe',null,
    'Done. The next one goes out at the end of the quarter.');

  var t=document.getElementById('t-send');
  if(t) t.addEventListener('click',function(){
    var e=(document.getElementById('t-email').value||'').trim(),
        m=document.getElementById('t-msg');
    if(!ok(e)){m.textContent='I need an address that works to answer you.';return;}
    t.disabled=true; m.textContent='Sending…';
    post({subject:'Talk to me',source:'liberman',talk:talk(),email:e,
      name:(document.getElementById('t-name').value||'').trim(),
      note:(document.getElementById('t-note').value||'').trim()})
      .then(function(){m.textContent='Got it. I answer these myself, usually the same day.';})
      .catch(function(){t.disabled=false;m.textContent='That did not go through. Try once more in a minute.';});
  });
})();
