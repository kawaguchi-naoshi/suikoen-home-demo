/* 寸又峡温泉 翠紅苑 トップページ */
(function () {
  'use strict';

  /* ---------- ハンバーガーメニュー ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var gnav = document.getElementById('gnav');
  if (toggle && gnav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      gnav.classList.toggle('is-open', !open);
    });
    gnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        gnav.classList.remove('is-open');
      }
    });
  }

  /* ---------- 宿泊日の初期値＝今日 ---------- */
  var checkin = document.getElementById('checkin');
  if (checkin) {
    var t = new Date();
    var ymd = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    checkin.min = ymd;
    if (!checkin.value) checkin.value = ymd;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 天気アイコン（SVG） ---------- */
  var ICONS = {
    sun: '<svg viewBox="0 0 24 24"><g fill="#f0a422" stroke="#f0a422" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" fill="none"/></g></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path fill="#b9c0c8" d="M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 18.8 10.1 4.5 4.5 0 0 1 18 19z"/></svg>',
    suncloud: '<svg viewBox="0 0 24 24"><g fill="#f0a422"><circle cx="9" cy="8.5" r="4"/></g><path fill="#b9c0c8" d="M9.5 20a4 4 0 0 1-.4-7.98 5.2 5.2 0 0 1 9.9.9A3.6 3.6 0 0 1 18.5 20z"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path fill="#5b5fa8" d="M12 2.5C6.5 2.5 2 6.6 2 11.5h20c0-4.9-4.5-9-10-9z"/><path d="M12 11.5v7.5a2 2 0 0 1-4 0" fill="none" stroke="#5b5fa8" stroke-width="2" stroke-linecap="round"/></svg>',
    snow: '<svg viewBox="0 0 24 24"><g stroke="#7fa7d6" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/></g></svg>'
  };
  var ICON_LABEL = { sun: '晴れ', cloud: 'くもり', suncloud: '晴れ時々くもり', rain: '雨', snow: '雪' };

  function paintIcons(root) {
    root.querySelectorAll('.w-icon[data-icon]').forEach(function (el) {
      var k = el.getAttribute('data-icon');
      el.innerHTML = ICONS[k] || '';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', ICON_LABEL[k] || '');
    });
  }

  /* 気象庁の天気コード → アイコン種別 */
  function codeToIcon(code) {
    var c = parseInt(code, 10);
    if (!c) return 'cloud';
    var head = Math.floor(c / 100);
    if (head === 1) return [100, 123, 124, 130, 131].indexOf(c) >= 0 ? 'sun' : 'suncloud';
    if (head === 2) return [201, 223].indexOf(c) >= 0 ? 'suncloud' : 'cloud';
    if (head === 3) return 'rain';
    if (head === 4) return 'snow';
    return 'cloud';
  }

  /* ---------- 7日間天気予報（気象庁 JSON） ----------
     静岡県（220000）の週間予報を使用。
     ・天気／降水確率：静岡県「中部」（川根本町を含む）
     ・気温：週間予報の気温地点は「静岡」のため、寸又峡の実際の気温より高めに出る点に注意 */
  var JMA_URL = 'https://www.jma.go.jp/bosai/forecast/data/forecast/220000.json';
  var WD = ['日', '月', '火', '水', '木', '金', '土'];
  var list = document.getElementById('weather-list');

  if (list) {
    paintIcons(list);
    fetch(JMA_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { renderWeather(buildDays(data)); })
      .catch(function (err) {
        console.warn('[weather] 取得失敗', err);
        list.innerHTML = '<li class="weather__error">天気予報を取得できませんでした。<a href="https://www.jma.go.jp/bosai/forecast/#area_type=class20s&area_code=2243000" target="_blank" rel="noopener">気象庁の天気予報</a>をご確認ください。</li>';
      });
  }

  function pickArea(areas, preferCodes) {
    for (var i = 0; i < preferCodes.length; i++) {
      for (var j = 0; j < areas.length; j++) if (areas[j].area.code === preferCodes[i]) return areas[j];
    }
    return areas[0];
  }
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  function buildDays(data) {
    var shortF = data[0], week = data[1];
    var wTs = week.timeSeries[0], tTs = week.timeSeries[1];
    var wArea = pickArea(wTs.areas, ['220010', '220000']);
    var tArea = pickArea(tTs.areas, ['50331']);
    var days = {};
    var order = [];

    wTs.timeDefines.forEach(function (td, i) {
      var d = new Date(td);
      var k = dayKey(d);
      days[k] = {
        date: d,
        code: wArea.weatherCodes[i],
        pop: wArea.pops ? wArea.pops[i] : '',
        max: tArea.tempsMax ? tArea.tempsMax[i] : '',
        min: tArea.tempsMin ? tArea.tempsMin[i] : ''
      };
      order.push(k);
    });

    /* 今日・明日の空欄は短期予報で補完 */
    try {
      var sW = pickArea(shortF.timeSeries[0].areas, ['220010']);
      shortF.timeSeries[0].timeDefines.forEach(function (td, i) {
        var d = new Date(td), k = dayKey(d);
        if (!days[k]) { days[k] = { date: d, code: '', pop: '', max: '', min: '' }; order.unshift(k); }
        if (!days[k].code) days[k].code = sW.weatherCodes[i];
      });
      var sP = pickArea(shortF.timeSeries[1].areas, ['220010']);
      var popMax = {};
      shortF.timeSeries[1].timeDefines.forEach(function (td, i) {
        var k = dayKey(new Date(td)), v = parseInt(sP.pops[i], 10);
        if (!isNaN(v)) popMax[k] = Math.max(popMax[k] || 0, v);
      });
      Object.keys(popMax).forEach(function (k) { if (days[k] && days[k].pop === '') days[k].pop = String(popMax[k]); });
    } catch (e) { /* 補完できなくても週間分は表示 */ }

    order = order.filter(function (k, i) { return order.indexOf(k) === i; })
      .sort(function (a, b) { return days[a].date - days[b].date; });
    var todayK = dayKey(new Date());
    order = order.filter(function (k) { return days[k].date >= new Date(new Date().setHours(0, 0, 0, 0)) || k === todayK; });
    return order.slice(0, 7).map(function (k) { var o = days[k]; o.isToday = (k === todayK); return o; });
  }

  function renderWeather(days) {
    if (!days.length) throw new Error('no data');
    list.innerHTML = days.map(function (d) {
      var label = d.isToday ? '今日' : WD[d.date.getDay()];
      var pop = d.pop !== '' && d.pop != null ? d.pop + '%' : '-';
      var max = d.max !== '' && d.max != null ? d.max + '°' : '-';
      var min = d.min !== '' && d.min != null ? d.min + '°' : '-';
      return '<li class="weather__day">' +
        '<span class="w-label">' + label + '</span>' +
        '<span class="w-date">' + (d.date.getMonth() + 1) + '/' + d.date.getDate() + '</span>' +
        '<span class="w-icon" data-icon="' + codeToIcon(d.code) + '"></span>' +
        '<span class="w-pop">' + pop + '</span>' +
        '<span class="w-temp">' + max + ' / ' + min + '</span></li>';
    }).join('');
    paintIcons(list);
  }
})();
