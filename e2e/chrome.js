/* ChannelE2E header and footer, with their real menus.
   Read off the live dropdowns on 23 October 2026. Every item points where it
   points on their site: internal pages to their live URLs, external ones out. */
(function () {
  var S = 'https://www.channele2e.com';
  var MENU = [
    /* Was a dropdown scattering the reader across three different domains, with the
       actual calendar page not even listed in it. Now one link to one calendar;
       their own three destinations sit pinned at the top of it. */
    { label: 'Events', href: 'events.html', ours: 1 },
    { label: 'Resources', items: [
      { t: 'Resource Library', u: S + '/resource-library' },
      { t: 'Tech M&amp;A List', u: 'mna.html', ours: 1 },
      { t: 'Top 250 Cloud MSPs', u: S + '/msp-top-250' },
      { t: 'Top 100 Vertical Market MSPs', u: S + '/msp-top-100' },
      { t: 'Channel Terms Glossary', u: S + '/resource/channel-terms-glossary' }
    ]},
    { label: 'Sponsors', href: S + '/sponsors' },
    { label: 'About', items: [
      { t: 'CyberRisk Alliance', u: 'https://www.cyberriskalliance.com/', ext: 1 },
      { t: 'Editorial Team', u: S + '/editorial-team' },
      { t: 'Surveys', u: S + '/surveys' },
      { t: 'Subscriptions', u: S + '/sign-up-for-enewsletter' }
    ]},
    { label: 'Contact', items: [
      { t: 'Advertise', u: S + '/become-a-sponsor' },
      { t: 'Contact Us', u: S + '/contact-us' }
    ]}
  ];

  var MARK = '<svg class="mk" viewBox="0 0 34 34" aria-hidden="true">'+
    '<rect x="1" y="1" width="32" height="32" rx="2" fill="none" stroke="#77c338" stroke-width="2.6"/>'+
    '<path d="M9 11h13M9 17h10M9 23h13" stroke="#77c338" stroke-width="2.6" stroke-linecap="round"/></svg>';

  function nav(active) {
    return MENU.map(function (m) {
      var on = (m.label === active) ? ' class="on"' : '';
      if (!m.items) return '<a href="' + m.href + '"' + on + '>' + m.label + '</a>';
      return '<span class="dd"><button type="button"' + (on ? ' class="on"' : '') + ' aria-expanded="false">' +
        m.label + '<i></i></button><span class="dd-m">' + m.items.map(function (x) {
          return '<a href="' + x.u + '"' + (x.ext ? ' target="_blank" rel="noopener"' : '') +
                 (x.ours ? ' class="ours"' : '') + '>' + x.t + (x.ext ? ' <em>&#8599;</em>' : '') + '</a>';
        }).join('') + '</span></span>';
    }).join('');
  }

  window.C2Echrome = function (active) {
    document.write(
      '<header class="hdr"><div class="wrap">' +
        '<a class="lg" href="index.html">' + MARK +
          '<span><span class="wd">Channel<i>E2E</i></span>' +
          '<span class="cra">&#9883; CyberRisk Alliance</span></span></a>' +
        '<nav>' + nav(active) + '</nav>' +
        '<span class="sp"></span>' +
        '<span class="ico">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/></svg>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18"/></svg>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
        '</span>' +
        '<a class="login" href="' + S + '/sign-up-for-enewsletter">Log In</a>' +
        '<a class="cta" href="' + S + '/sign-up-for-enewsletter">Create Account</a>' +
      '</div></header>');
  };

  window.C2Efooter = function () {
    document.write(
      '<footer class="ftr"><div class="wrap">' +
        '<a href="https://www.cyberriskalliance.com/terms-of-use#privacy-policy" target="_blank" rel="noopener">Privacy Statement</a>' +
        '<a href="https://cyberriskalliance.com/editorial-policy" target="_blank" rel="noopener">Editorial Policy</a>' +
        '<a href="' + S + '/contact-us">Contact Us</a>' +
        '<a href="kelly.html">For partners</a>' +
        '<span class="sp"></span>' +
        '<span>All contents Copyright &copy; 2026 ChannelE2E and CyberRisk Alliance</span>' +
      '</div></footer>');
  };

  /* dropdowns: click to open, click away or Escape to close */
  addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.dd > button') : null;
    var open = document.querySelector('.dd.open');
    if (open && (!b || open !== b.parentNode)) {
      open.classList.remove('open');
      open.querySelector('button').setAttribute('aria-expanded', 'false');
    }
    if (b) {
      e.preventDefault();
      var d = b.parentNode, now = !d.classList.contains('open');
      d.classList.toggle('open', now);
      b.setAttribute('aria-expanded', String(now));
    }
  });
  addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var o = document.querySelector('.dd.open');
    if (o) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded','false'); }
  });
})();
