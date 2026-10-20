/* Demo layer. Renders the handoff bar and the back-end notes.
   Nothing here touches the product markup: delete demo-notes.* and the two
   <link>/<script> lines and the page is the real thing. */
(function () {
  var PAGES = [
    ['index.html', 'Сайт'],
    ['stage.html', 'Слайд'],
    ['desk.html', 'Кабинет'],
    ['build.html', 'Что делать']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');

  var NOTES = {
    'index.html': {
      lead: 'Жёлтым обведено всё, что требует бэка или ассета. Остальное работает как есть.',
      items: {
        1: ['Фотография партнёра', 'Статичный ассет. На каждого партнёра свой файл — путь берётся из профиля партнёра, не зашивается.', ''],
        2: ['Снимок дороги', 'Сейчас нарисован SVG-заглушкой. Нужен настоящий кадр от Джоша — у него свой есть, он фотограф. Права спросить.', ''],
        3: ['Поля калькулятора', 'Чистый фронт: значения живут в браузере, ничего не отправляется. Так и должно остаться — первый шаг анонимный.', ''],
        4: ['Чек — здесь нужен бэк', 'Арифметика сейчас в app.js. Её надо перенести на сервер: коэффициенты меняются, а фронт у каждого партнёра свой, и расхождений быть не должно. Фронт шлёт шесть чисел, получает готовые строки чека.', 'POST /api/estimate → { lines[], range, recoverable }'],
        5: ['Письменная версия — бэк', 'Адрес плюс все ответы калькулятора. На выходе — PDF на одну страницу и письмо. Это же событие кладёт прогон в базу, из которой потом собирается отчёт.', 'POST /api/lead · subject: valuation'],
        6: ['Подписка на бенчмарк — бэк', 'Только адрес. Отдельный список: это те, кто не продаёт. Их держит отчёт, а не звонок.', 'POST /api/lead · subject: benchmark'],
        7: ['Форма связи — бэк', 'Имя, адрес, текст. Падает Джошу в почту и в кабинет одной строкой.', 'POST /api/lead · subject: talk']
      }
    },
    'desk.html': {
      lead: 'Кабинет Джошуа. Всё, что здесь показано, собирается из прогонов калькулятора и трёх форм.',
      items: {
        1: ['Счётчики — его формула', 'Выступления × конверсия × средний чек. Первые два бэк считает сам, третий Джошуа вводит руками — поле справа.', 'GET /api/partner/:id/stats'],
        2: ['Метка выступления', 'Берётся из ?t= в QR-ссылке. Без неё конверсию по сценам не посчитать: на каждое выступление генерируется свой код.', ''],
        3: ['Список обращений', 'Одна строка — один прогон калькулятора с оставленным адресом. Колонки «что против них» и «сколько можно вернуть» считает тот же движок, что и чек.', 'GET /api/partner/:id/leads'],
        4: ['Кнопка отчёта — главное', 'Одна кнопка собирает квартальный бенчмарк: берёт все прогоны за период, считает медианы и квартили по региону, подставляет имя и фотографию партнёра, оставляет пустую страницу под его комментарий и отдаёт PDF.', 'POST /api/partner/:id/report { period, region }'],
        5: ['Список бенчмарка', 'Те, кто подписался, но не продаёт. Отчёт уходит им, и ссылки внутри ведут обратно на его сайт.', 'GET /api/partner/:id/subscribers']
      }
    },
    'stage.html': {
      lead: 'Слайд, который Джошуа выводит в конце доклада.',
      items: {
        1: ['QR — генерируется на каждое выступление', 'В ссылку зашивается метка ?t=, по ней считается конверсия именно этой сцены. Подпись под кодом обязана совпадать с тем, что внутри кода, дословно.', 'GET /api/partner/:id/qr?talk=ascii-sa-2026']
      }
    }
  };

  var bar = document.getElementById('demobar');
  if (bar) {
    bar.innerHTML = '<div class="in"><b>Демо · Find Your Best Exit</b>' +
      PAGES.map(function (p) {
        return '<a href="' + p[0] + '"' + (p[0] === here ? ' aria-current="page"' : '') + '>' + p[1] + '</a>';
      }).join('') +
      '<span class="sp"></span><button id="ntoggle" type="button">Показать, где бэк</button></div>';
  }

  var cfg = NOTES[here];
  if (cfg) {
    var panel = document.createElement('aside');
    panel.id = 'notepanel';
    panel.innerHTML = '<h5>Что здесь делает бэк</h5><p class="lead">' + cfg.lead + '</p>' +
      Object.keys(cfg.items).map(function (k) {
        var n = cfg.items[k];
        return '<div class="n"><b><i>' + k + '</i>' + n[0] + '</b><p>' + n[1] +
          (n[2] ? '<br><code>' + n[2] + '</code>' : '') + '</p></div>';
      }).join('');
    document.body.appendChild(panel);
  }

  var btn = document.getElementById('ntoggle');
  if (btn) btn.addEventListener('click', function () {
    var on = document.body.classList.toggle('notes');
    btn.setAttribute('data-on', on ? '1' : '0');
    btn.textContent = on ? 'Скрыть разметку' : 'Показать, где бэк';
  });
})();
