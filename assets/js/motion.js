/* 寸又峡温泉 翠紅苑：スクロール連動モーション
   - 対象要素はこのファイルの MOTION 設定で一括指定（HTML側は変更不要）
   - IntersectionObserver で画面に入ったら .is-in を付与（1回のみ）
   - ヒーローは対象外 */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  root.classList.add('js-motion');
  window.__motionReady = true;
  root.classList.add('m-init'); /* 初期状態へはアニメーションさせずに切り替える */

  var MOTION = [
    /* 1文字ずつ浮かぶ見出し */
    { sel: '.concept__copy, .stay__title, .news__title, .sec-head__ja', type: 'split' },
    /* フェードアップ */
    { sel: '.weather__title, .sec-head__en, .sec-head__lead, .insta__title, .plans__title, .access__title, .about__title, .about__text, .about__links, .zigzag__head, .zigzag__catch, .zigzag__text, .zigzag__body .btn, .btn-wrap, .access__list, .f-logo, .f-info, .site-footer .btn-wrap, .f-nav', type: 'fade' },
    { sel: '.spot__body', type: 'fade', delay: 0.35 },
    /* 画像のマスク展開（右側にある画像は右から） */
    { sel: '.spot--1 .spot__img, .zigzag--reverse .zigzag__img', type: 'mask', dir: 'r' },
    { sel: '.spot--2 .spot__img, .zigzag:not(.zigzag--reverse) .zigzag__img, .access__street, .access__map', type: 'mask' },
    { sel: '.about__img', type: 'mask', dir: 'r', delay: 0.2 },
    /* 子要素を順番に */
    { sel: '.weather__list, .courses, .insta__grid, .cards, .news__list', type: 'stagger', step: 0.12 }
  ];

  var targets = [];

  function splitChars(el) {
    if (el.dataset.splitDone) return;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ''));
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      Array.from(node.textContent).forEach(function (ch) {
        if (/\s/.test(ch)) return;
        var s = document.createElement('span');
        s.className = 'm-char';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.splitDone = '1';
  }

  function mark(el, type, opt) {
    if (el.hasAttribute('data-m') || el.closest('.hero')) return;
    el.setAttribute('data-m', type);
    if (opt.dir) el.setAttribute('data-dir', opt.dir);
    if (opt.delay) el.style.setProperty('--d', opt.delay + 's');
    if (type === 'split') splitChars(el);
    targets.push(el);
  }

  MOTION.forEach(function (m) {
    document.querySelectorAll(m.sel).forEach(function (el) {
      if (m.type === 'stagger') {
        Array.prototype.forEach.call(el.children, function (child, i) {
          mark(child, 'fade', { delay: +(i * m.step).toFixed(2) });
        });
      } else {
        mark(el, m.type, m);
      }
    });
  });

  /* コンセプト背景のズームアウト */
  var concept = document.querySelector('.concept');
  if (concept) targets.push(concept);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        (e.target.__mTargets || [e.target]).forEach(function (t) { t.classList.add('is-in'); });
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    root.classList.remove('m-init');
    /* clip-pathで隠れている画像は交差判定されないため、親要素を監視する */
    targets.forEach(function (el) {
      var trigger = el;
      if (el.getAttribute('data-m') === 'mask') {
        trigger = el.parentElement;
        (trigger.__mTargets = trigger.__mTargets || []).push(el);
        if (trigger.__mObserved) return;
        trigger.__mObserved = true;
      }
      io.observe(trigger);
    });
  }); });

  /* 天気予報は描画し直されるので、差し替え後の要素もフェード */
  var wl = document.getElementById('weather-list');
  if (wl && 'MutationObserver' in window) {
    new MutationObserver(function () {
      Array.prototype.forEach.call(wl.children, function (li, i) {
        if (li.hasAttribute('data-m')) return;
        li.setAttribute('data-m', 'fade');
        li.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
        io.observe(li);
      });
    }).observe(wl, { childList: true });
  }

})();
