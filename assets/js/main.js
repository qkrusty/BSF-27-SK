/* BIG SUMMER FEST 2027 – main.js (vanilla, bez knižníc) */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMBED = window.BSF_EMBED !== false; // v náhľade (artifact) sa videá otvárajú na YouTube
  root.classList.add('js');

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- 0. Bežiace pásy – doplniť obsah, aby v slučke nebola medzera ---------- */
  $$('.marquee__track').forEach(function (tr) {
    var groups = $$('.marquee__group', tr); if (groups.length !== 2) return;
    var need = window.innerWidth * 1.2 + 200, orig = Array.prototype.slice.call(groups[0].children), base = groups[0].scrollWidth, copies = 1;
    if (!base) return;
    while (groups[0].scrollWidth < need && copies < 12) {
      groups.forEach(function (g) {
        orig.forEach(function (n) { var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); if (c.tagName === 'BUTTON' || c.tagName === 'A') c.tabIndex = -1; if (c.alt !== undefined) c.alt = ''; g.appendChild(c); });
      });
      copies++;
    }
    if (copies > 1) {
      var dur = parseFloat(tr.style.getPropertyValue('--dur')) || 30;
      tr.style.setProperty('--dur', (dur * copies) + 's');
    }
  });

  /* ---------- 1. Nadpisy s vlniacimi sa písmenami ---------- */
  $$('[data-wave]').forEach(function (el) {
    var text = el.textContent.trim(), i = 0;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach(function (word, wi, arr) {
      var w = doc.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (chr) {
        var c = doc.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i++); c.textContent = chr; w.appendChild(c);
      });
      el.appendChild(w);
      if (wi < arr.length - 1) el.appendChild(doc.createTextNode(' '));
    });
  });

  /* ---------- 2. Odpočet ---------- */
  var cd = $('#countdown');
  if (cd) {
    var target = new Date(cd.getAttribute('data-target')).getTime();
    var els = {}; $$('[data-u]', cd).forEach(function (n) { els[n.getAttribute('data-u')] = n; });
    var last = {};
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var v = {
        d: Math.floor(diff / 864e5),
        h: pad(Math.floor(diff / 36e5) % 24),
        m: pad(Math.floor(diff / 6e4) % 60),
        s: pad(Math.floor(diff / 1e3) % 60)
      };
      Object.keys(v).forEach(function (k) {
        if (last[k] !== v[k]) {
          els[k].textContent = v[k];
          if (!reduce && last[k] !== undefined) { els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick'); }
          last[k] = v[k];
        }
      });
      if (diff <= 0) { cd.innerHTML = '<p class="hand" style="color:var(--pink)">Festival práve prebieha – vidíme sa pri vode!</p>'; return; }
      setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
  }

  /* ---------- 3. Mobilné menu + hlavička ---------- */
  var burger = $('.burger'), nav = $('#nav'), header = $('.site-header');
  function closeNav() { if (!nav) return; nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otvoriť menu'); doc.body.style.overflow = ''; }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  }
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* aktívna položka v menu */
  if ('IntersectionObserver' in window) {
    var links = {}; $$('.nav > a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id]; if (!a) return;
        if (e.isIntersecting) { $$('.nav > a.is-active').forEach(function (x) { x.classList.remove('is-active'); }); a.classList.add('is-active'); }
        else a.classList.remove('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = doc.getElementById(id); if (s) secObs.observe(s); });
  }

  /* ---------- 4. Reveal pri scrolle (len prvky pod prvou obrazovkou) ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh) { el.classList.add('in'); return; }
      el.style.transitionDelay = ((i % 4) * 80) + 'ms';
      rv.observe(el);
    });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- 5. Počítadlá v štatistikách ---------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var fmt = function (n, sep) { return sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n); };
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = +el.getAttribute('data-count'), sep = el.hasAttribute('data-sep'), t0 = performance.now(), dur = 1600;
        cObs.unobserve(el);
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(to * ease), sep);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .6 });
    counters.forEach(function (c) { cObs.observe(c); });
  }

  /* ---------- 6. Modálne okná ---------- */
  var lastFocus = null;
  function openModal(m) {
    lastFocus = doc.activeElement;
    m.hidden = false; doc.body.classList.add('is-modal-open');
    var f = $('.modal__x', m); f && f.focus({ preventScroll: true });
  }
  function closeModal(m) {
    if (!m || m.hidden) return;
    m.hidden = true;
    if (!$$('.modal').some(function (x) { return !x.hidden; })) doc.body.classList.remove('is-modal-open');
    if (m.id === 'media') $('.media__inner', m).innerHTML = '';
    if (m.id === 'reader' && /^#clanok-/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
    if (m.id === 'promo') store('bsf-promo-closed', '1');
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(m); });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { $$('.modal').forEach(function (m) { closeModal(m); }); closeNav(); }
  });

  /* ---------- 7. Promo pop-up (predpredaj 99,90 €) ---------- */
  var promo = $('#promo');
  function confetti() {
    if (reduce) return;
    var box = $('.confetti', promo), cols = ['#FF3E5C', '#FFDA30', '#1CFFB6', '#3FA9F5', '#FF2884'], html = '';
    for (var i = 0; i < 46; i++) {
      html += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + cols[i % 5] + ';--t:' + (2.2 + Math.random() * 2).toFixed(2) + 's;--dl:' + (Math.random() * .6).toFixed(2) + 's;border-radius:' + (i % 3 ? '2px' : '50%') + '"></i>';
    }
    box.innerHTML = html;
  }
  function showPromo() { if (!promo) return; confetti(); openModal(promo); }
  $$('[data-open-promo]').forEach(function (b) { b.addEventListener('click', showPromo); });
  if (promo && !store('bsf-promo-closed')) {
    setTimeout(function () {
      if ($$('.modal').some(function (x) { return !x.hidden; })) return;
      showPromo();
    }, 3500);
  }

  /* ---------- 8. Novinky – čítačka článkov (#clanok-…) ---------- */
  var reader = $('#reader');
  function openPost(slug) {
    var src = doc.getElementById('post-' + slug); if (!src || !reader) return false;
    var img = src.getAttribute('data-img'), date = src.getAttribute('data-date'), from = src.getAttribute('data-src');
    $('.reader__inner', reader).innerHTML =
      (img ? '<div class="reader__hero"><img src="' + img + '" alt=""></div>' : '') +
      '<div class="reader__body"><div class="reader__meta">' + (date ? '<span>' + date + '</span>' : '') + (from ? '<span>zdroj: ' + from + '</span>' : '') + '</div>' + src.innerHTML + '</div>';
    openModal(reader);
    $('.reader', reader).scrollTop = 0; reader.scrollTop = 0;
    return true;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-post]'); if (!a) return;
    e.preventDefault();
    var slug = a.getAttribute('data-post');
    if (reader && !reader.hidden) closeModal(reader);
    if (openPost(slug)) { try { history.replaceState(null, '', '#clanok-' + slug); } catch (err) {} }
  });
  function fromHash() { var m = /^#clanok-([\w-]+)$/.exec(location.hash); if (m) openPost(m[1]); }
  window.addEventListener('hashchange', fromHash); fromHash();

  /* ---------- 8b. Galéria – fotky sa načítajú, až keď sa k nim priblížite ---------- */
  var gal = $('.gallery');
  if (gal) {
    var loadGal = function () { $$('img[data-src]', gal).forEach(function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }); };
    if ('IntersectionObserver' in window) {
      var gObs = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadGal(); gObs.disconnect(); } }, { rootMargin: '900px 0px' });
      gObs.observe(gal);
    } else loadGal();
  }

  /* ---------- 9. Videá – prehrajú sa priamo v kazete (bez vyskakovacieho okna) ---------- */
  $$('[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.closest('.vhs'); if (card && card.classList.contains('is-playing')) return;
      var id = b.getAttribute('data-yt'), title = b.getAttribute('data-title') || 'Video';
      if (EMBED) {
        b.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" title="' + title + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      } else {
        b.innerHTML = '<span class="media__fallback" style="position:absolute;inset:0;display:grid;place-content:center;gap:12px;background:#101014"><span style="font:400 1.2rem/1.1 var(--f-display);color:#FFF8E2">' + title + '</span><a class="btn btn--yellow btn--sm" href="https://youtu.be/' + id + '" target="_blank" rel="noopener">Pozrieť na YouTube</a></span>';
      }
      card && card.classList.add('is-playing');
      b.removeAttribute('aria-label');
    });
  });

  /* ---------- 9b. Lightbox – fotky, mapa so zoomom ---------- */
  var media = $('#media');
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-full]'); if (!b || !media) return;
    var img = $('img', b), src = b.getAttribute('data-full'), alt = b.getAttribute('data-alt') || (img && img.alt) || 'Fotografia z festivalu';
    var inner = $('.media__inner', media);
    if (b.hasAttribute('data-zoom')) {
      inner.innerHTML = '<div class="zoomwrap"><img src="' + src + '" alt="' + alt + '"></div><p class="zoom-hint">kliknite do mapy – priblížiť / oddialiť</p>';
      var zw = $('.zoomwrap', inner);
      zw.addEventListener('click', function (ev) {
        var r = zw.getBoundingClientRect(), fx = (ev.clientX - r.left + zw.scrollLeft) / zw.scrollWidth, fy = (ev.clientY - r.top + zw.scrollTop) / zw.scrollHeight;
        var z = zw.classList.toggle('is-zoomed');
        var img2 = $('img', zw);
        if (z) { zw.scrollLeft = fx * img2.offsetWidth - zw.clientWidth / 2; zw.scrollTop = fy * img2.offsetHeight - zw.clientHeight / 2; }
      });
      // ťahanie myšou pri priblížení
      var drag = null;
      zw.addEventListener('pointerdown', function (ev) { if (ev.pointerType !== 'mouse' || !zw.classList.contains('is-zoomed')) return; drag = { x: ev.clientX, y: ev.clientY, l: zw.scrollLeft, t: zw.scrollTop, moved: false }; });
      zw.addEventListener('pointermove', function (ev) { if (!drag) return; var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; zw.scrollLeft = drag.l - dx; zw.scrollTop = drag.t - dy; });
      zw.addEventListener('click', function (ev) { if (drag && drag.moved) { ev.stopImmediatePropagation(); } drag = null; }, true);
      window.addEventListener('pointerup', function () { setTimeout(function () { drag = null; }, 0); });
    } else {
      inner.innerHTML = '<img src="' + src + '" alt="' + alt + '">';
    }
    openModal(media);
  });

  /* ---------- 9c. Interpreti – okno s bio a hitmi ---------- */
  var amodal = $('#artist-modal');
  $$('[data-artist]').forEach(function (b) {
    b.addEventListener('click', function () {
      var src = doc.getElementById('bio-' + b.getAttribute('data-artist')); if (!src || !amodal) return;
      var c = src.getAttribute('data-c'), badge = src.getAttribute('data-badge');
      var card = b.closest('.artist'), hitEl = card && $('.artist__hit', card), hit = hitEl ? hitEl.textContent : '';
      $('.amodal', amodal).style.setProperty('--ac', c);
      $('.amodal__inner', amodal).innerHTML =
        '<div class="amodal__photo"><img src="' + src.getAttribute('data-photo') + '" alt="' + $('h2', src).textContent + '">' + (badge ? '<span class="badge badge--yellow">' + badge + '</span>' : '') + (hit ? '<p class="amodal__hit"><svg aria-hidden="true"><use href="#i-star"/></svg><span>' + hit + '</span></p>' : '') + '</div>' +
        '<div class="amodal__body">' + src.innerHTML +
        '<div class="amodal__cta"><a class="btn btn--ink" href="https://www.superticket.sk/big-summer-fest-2027" target="_blank" rel="noopener">Kúpiť vstupenku</a><a class="btn btn--blue" href="https://www.facebook.com/bigsummerfest.sk/" target="_blank" rel="noopener">Ďalšie mená na FB</a></div></div>';
      openModal(amodal); amodal.scrollTop = 0;
    });
  });

  /* ---------- 9d. Logo – klik = boing + ohňostroj hviezd ---------- */
  var logoBtn = $('.hero__logo-btn'), fx = $('.logo-fx');
  if (logoBtn && fx) {
    var phrases = ['Vidíme sa pri vode!', '29. – 31. 7. 2027!', '3 dni leta!', 'Veľká párty!', 'Hity 90. rokov!', 'Kto príde s vami?', 'Pláž, piesok a palmy!'], ph = 0;
    var cols = ['#FF3E5C', '#FFDA30', '#1CFFB6', '#3FA9F5', '#FF2884'], shapes = ['#i-star', '#i-spark', '#i-plus', '#i-heart'];
    logoBtn.addEventListener('click', function () {
      logoBtn.classList.remove('boing'); void logoBtn.offsetWidth; logoBtn.classList.add('boing');
      var hint = $('.logo-hint'); if (hint) hint.remove();
      var html = '';
      for (var i = 0; i < 18; i++) {
        var ang = (i / 18) * Math.PI * 2 + Math.random() * .3, dist = 130 + Math.random() * 110;
        html += '<svg class="p" viewBox="0 0 100 100" style="color:' + cols[i % 5] + ';--tx:' + Math.round(Math.cos(ang) * dist) + 'px;--ty:' + Math.round(Math.sin(ang) * dist) + 'px;--rot:' + Math.round(Math.random() * 540 - 270) + 'deg"><use href="' + shapes[i % 4] + '" width="100" height="100"/></svg>';
      }
      html += '<span class="bubble">' + phrases[ph++ % phrases.length] + '</span>';
      fx.innerHTML = html;
      clearTimeout(fx._t); fx._t = setTimeout(function () { fx.innerHTML = ''; }, 1900);
    });
  }

  /* ---------- 9f. Plávajúca vstupenka – ukáže sa až po odscrollovaní z úvodu ---------- */
  var fab = $('.ticket-fab'), heroEl = $('.hero');
  if (fab) {
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { fab.classList.toggle('is-away', en[0].isIntersecting); }, { rootMargin: '0px 0px -30% 0px' }).observe(heroEl);
    } else fab.classList.remove('is-away');
  }

  /* ---------- 10. FAQ – akordeón + filter ---------- */
  var faqId = 0;
  $$('.qa').forEach(function (qa) {
    var btn = $('.qa__q', qa), ans = $('.qa__a', qa), id = 'qa-' + (++faqId);
    ans.id = id; btn.setAttribute('aria-controls', id);
    btn.addEventListener('click', function () {
      var open = !qa.classList.contains('open');
      qa.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  $$('.fchip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.getAttribute('data-cat');
      $$('.fchip').forEach(function (c) { var on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $$('.qa').forEach(function (qa) { qa.hidden = !(cat === 'all' || qa.getAttribute('data-cat') === cat); });
    });
  });

  /* ---------- 11. TV – statický šum (canvas) ---------- */
  var cv = $('.tv__noise');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, idata = ctx.createImageData(W, H), buf = new Uint32Array(idata.data.buffer);
    var visible = false, timer = null;
    var draw = function () {
      for (var i = 0; i < buf.length; i++) { var v = (Math.random() * 255) | 0; buf[i] = 0xff000000 | (v << 16) | (v << 8) | v; }
      ctx.putImageData(idata, 0, 0);
    };
    var loop = function () { draw(); timer = visible ? setTimeout(function () { requestAnimationFrame(loop); }, 60) : null; };
    draw();
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !timer) loop(); }).observe(cv);
    }
  }

  /* ---------- 12. Iskričky za kurzorom (ľahká verzia, len myš) ---------- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var pool = [], idx = 0, lastT = 0, colors = ['#FF3E5C', '#FFDA30', '#1CFFB6', '#3FA9F5', '#FF2884'];
    for (var p = 0; p < 10; p++) {
      var sp = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      sp.setAttribute('class', 'spark'); sp.setAttribute('aria-hidden', 'true'); sp.setAttribute('viewBox', '0 0 100 100');
      sp.innerHTML = '<use href="#i-spark" width="100" height="100"/>'; sp.style.color = colors[p % 5];
      doc.body.appendChild(sp); pool.push(sp);
    }
    window.addEventListener('pointermove', function (e) {
      var t = performance.now(); if (t - lastT < 70) return; lastT = t;
      var el = pool[idx++ % pool.length];
      el.classList.remove('go');
      el.style.setProperty('--x', (e.clientX - 9) + 'px'); el.style.setProperty('--y', (e.clientY - 9) + 'px');
      el.style.setProperty('--dx', ((Math.random() - .5) * 40).toFixed(0) + 'px'); el.style.setProperty('--dy', '36px');
      void el.getBoundingClientRect(); el.classList.add('go');
    }, { passive: true });
  }

  /* ---------- 13. Výkon – animácie v sekciách mimo obrazovky stoja ---------- */
  if ('IntersectionObserver' in window) {
    var offObs = new IntersectionObserver(function (en) {
      en.forEach(function (x) { x.target.classList.toggle('is-off', !x.isIntersecting); });
    }, { rootMargin: '150px 0px' });
    $$('main > section, main > .tapes, .site-footer, .topbar').forEach(function (sec) { offObs.observe(sec); });
  }
})();
