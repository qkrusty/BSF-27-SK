/* BIG SUMMER FEST 2027 – interaktívna mapa festivalu (vanilla JS) */
(function () {
  'use strict';
  var doc = document;
  var root = doc.getElementById('fmap'); if (!root) return;
  var DATA = JSON.parse(doc.getElementById('fmap-data').textContent);
  var T = DATA.ui, CATS = DATA.cats, SPOTS = DATA.spots, W = DATA.w;
  var byId = {}; SPOTS.forEach(function (s) { byId[s.id] = s; });
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && matchMedia('(hover: none)').matches;

  var vp = root.querySelector('.fmap__viewport'), canvas = root.querySelector('.fmap__canvas'),
      svg = root.querySelector('.fmap__svg'), tip = root.querySelector('.fmap__tip'),
      stage = root.querySelector('.fmap__stage'), detail = root.querySelector('.fmap__detail'),
      legend = root.querySelector('.fmap__legend');
  var spotEls = {}; Array.prototype.forEach.call(svg.querySelectorAll('.spot'), function (g) { spotEls[g.getAttribute('data-id')] = g; });
  var lgEls = {}; Array.prototype.forEach.call(root.querySelectorAll('.lg-item'), function (b) { lgEls[b.getAttribute('data-cat')] = b; });

  if (touch) { var h = root.querySelector('.fmap__hint span'); if (h) h.textContent = T.hint_touch; }

  function iconHTML(cat, cls) {
    var ic = CATS[cat].icon;
    return typeof ic === 'number'
      ? '<span class="mi mi--s ' + (cls || '') + '" style="--i:' + ic + '" aria-hidden="true"></span>'
      : '<svg class="mi ' + (cls || '') + '" aria-hidden="true"><use href="#' + ic + '"/></svg>';
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- zvýraznenie ---------- */
  var hlSpot = null, hlCat = null;
  function clearHL() {
    Object.keys(spotEls).forEach(function (k) { spotEls[k].classList.remove('is-hl', 'is-soft'); });
    Object.keys(lgEls).forEach(function (k) { lgEls[k].classList.remove('is-hl'); });
    Array.prototype.forEach.call(root.querySelectorAll('.fd__chip.is-hl'), function (c) { c.classList.remove('is-hl'); });
  }
  function highlight(spotId, cat, fromLegend) {
    clearHL(); hlSpot = spotId; hlCat = cat;
    if (!cat) { hideTip(); return; }
    SPOTS.forEach(function (s) {
      if (s.cat !== cat) return;
      var el = spotEls[s.id];
      if (!spotId || s.id === spotId) el.classList.add('is-hl'); else el.classList.add('is-soft');
    });
    if (lgEls[cat]) lgEls[cat].classList.add('is-hl');
    if (spotId) {
      var chip = root.querySelector('.fd__chip[data-id="' + spotId + '"]'); if (chip) chip.classList.add('is-hl');
      showTip(spotId);
    } else if (fromLegend) hideTip();
  }

  /* ---------- bublina ---------- */
  function showTip(id) {
    var s = byId[id], g = spotEls[id]; if (!s || !g) return;
    var r = g.getBoundingClientRect(), sr = stage.getBoundingClientRect(), vr = vp.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + (s.shape[0] === 'c' ? 4 : Math.min(r.height * .5, 30));
    if (x < vr.left || x > vr.right || y < vr.top || y > vr.bottom) { hideTip(); return; }
    tip.innerHTML = iconHTML(s.cat) + '<span>' + esc(s.name) + '</span>';
    tip.style.setProperty('--c', CATS[s.cat].c);
    var left = Math.max(sr.left + 90, Math.min(x, sr.right - 90));
    tip.style.left = (left - sr.left) + 'px'; tip.style.top = (y - sr.top) + 'px';
    tip.classList.add('is-on');
  }
  function hideTip() { tip.classList.remove('is-on'); }

  /* ---------- detail ---------- */
  var current = null;
  function mapCrop(s, box) {
    var bw = box.clientWidth || 360, bh = box.clientHeight || 225;
    var region = s.shape[0] === 'c' ? 420 : Math.max(380, Math.min(760, (s.bbox[2] - s.bbox[0]) * 1.6));
    var k = bw / region, cx = s.m[0], cy = s.m[1];
    var px = Math.min(0, Math.max(bw - W * k, bw / 2 - cx * k)), py = Math.min(0, Math.max(bh - DATA.h * k, bh / 2 - cy * k));
    box.style.backgroundImage = 'url(' + DATA.img + ')';
    box.style.backgroundSize = (W * k) + 'px auto';
    box.style.backgroundPosition = px + 'px ' + py + 'px';
  }
  function open(id, opts) {
    var s = byId[id]; if (!s) return;
    var c = CATS[s.cat]; current = id; opts = opts || {};
    var siblings = SPOTS.filter(function (x) { return x.cat === s.cat; });
    var html = '';
    if (c.photo) {
      html += '<button class="fd__media" type="button" data-full="assets/img/' + c.photo[0] + '" data-alt="' + esc(s.name) + '"><img src="assets/img/' + c.photo[0] + '" alt="' + esc(s.name) + '" decoding="async"><span class="fd__cap">' + esc(c.photo[1]) + '</span></button>';
    } else {
      html += '<div class="fd__media fd__media--map" role="img" aria-label="' + esc(s.name) + ' – ' + esc(T.mapdetail) + '"><span class="fd__cap">' + esc(T.mapdetail) + '</span></div>';
    }
    html += '<div class="fd__body" style="--c:' + c.c + '"><span class="fd__cat">' + iconHTML(s.cat) + esc(c.name) + '</span>';
    html += '<h3 id="fd-title">' + esc(s.name) + '</h3>';
    if (s.text) html += '<p>' + esc(s.text) + '</p>';
    html += '<p>' + esc(c.text) + '</p>';
    if (c.facts && c.facts.length) html += '<ul class="checks">' + c.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>';
    if (siblings.length > 1) {
      html += '<div class="fd__spots"><h4>' + esc(T.places) + ' (' + siblings.length + ')</h4><div class="fd__chips">' +
        siblings.map(function (x) { return '<button type="button" class="fd__chip" data-id="' + x.id + '"' + (x.id === id ? ' aria-current="true"' : '') + '>' + esc(x.name) + '</button>'; }).join('') + '</div></div>';
    }
    if (c.cta) {
      var ext = /^https?:/.test(c.cta[1]);
      html += '<a class="btn btn--ink btn--block fd__cta" href="' + c.cta[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(c.cta[0]) + '<svg class="ico"><use href="#' + (ext ? 'i-ext' : 'i-arrow') + '"/></svg></a>';
    }
    html += '</div>';
    detail.querySelector('.fd__content').innerHTML = html;
    detail.setAttribute('aria-labelledby', 'fd-title');
    var mb = detail.querySelector('.fd__media--map'); if (mb) requestAnimationFrame(function () { mapCrop(s, mb); });
    root.classList.add('is-detail');
    Object.keys(spotEls).forEach(function (k) { spotEls[k].classList.remove('is-on'); spotEls[k].setAttribute('aria-pressed', 'false'); });
    spotEls[id].classList.add('is-on'); spotEls[id].setAttribute('aria-pressed', 'true');
    detail.scrollTop = 0;
    if (!opts.noScroll) ensureVisible(id);
    if (!opts.noHash) { try { history.replaceState(null, '', '#' + T.hash + '-' + id); } catch (e) {} }
    if (opts.focus) { var b = detail.querySelector(window.innerWidth <= 980 ? '.fd__close' : '.fd__back'); b && b.focus({ preventScroll: true }); }
  }
  function close(focusBack) {
    if (!root.classList.contains('is-detail')) return;
    root.classList.remove('is-detail');
    Object.keys(spotEls).forEach(function (k) { spotEls[k].classList.remove('is-on'); spotEls[k].setAttribute('aria-pressed', 'false'); });
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    var last = current; current = null; clearHL(); hideTip();
    if (focusBack && last && CATS[byId[last].cat] && lgEls[byId[last].cat]) lgEls[byId[last].cat].focus({ preventScroll: true });
  }

  /* ---------- udalosti na mape ---------- */
  var drag = null, moved = false;
  svg.addEventListener('pointerover', function (e) {
    if (drag && moved) return;
    var g = e.target.closest('.spot'); if (!g) return;
    highlight(g.getAttribute('data-id'), g.getAttribute('data-cat'));
  });
  svg.addEventListener('pointerout', function (e) {
    var g = e.target.closest('.spot'); if (!g) return;
    if (e.relatedTarget && g.contains(e.relatedTarget)) return;
    clearHL(); hideTip();
  });
  svg.addEventListener('click', function (e) {
    if (moved) { moved = false; return; }
    var g = e.target.closest('.spot'); if (!g) return;
    open(g.getAttribute('data-id'), { noScroll: true });
  });
  svg.addEventListener('keydown', function (e) {
    var g = e.target.closest('.spot'); if (!g) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g.getAttribute('data-id'), { focus: true }); }
  });
  svg.addEventListener('focusin', function (e) {
    var g = e.target.closest('.spot'); if (!g) return;
    ensureVisible(g.getAttribute('data-id'));
    highlight(g.getAttribute('data-id'), g.getAttribute('data-cat'));
  });
  svg.addEventListener('focusout', function () { clearHL(); hideTip(); });

  /* ---------- legenda ---------- */
  legend.addEventListener('pointerover', function (e) {
    var b = e.target.closest('.lg-item'); if (!b) return;
    highlight(null, b.getAttribute('data-cat'), true);
  });
  legend.addEventListener('pointerout', function (e) {
    var b = e.target.closest('.lg-item'); if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return;
    clearHL();
  });
  legend.addEventListener('focusin', function (e) { var b = e.target.closest('.lg-item'); if (b) highlight(null, b.getAttribute('data-cat'), true); });
  legend.addEventListener('focusout', function () { clearHL(); });
  legend.addEventListener('click', function (e) {
    var b = e.target.closest('.lg-item'); if (!b) return;
    var cat = b.getAttribute('data-cat');
    var first = SPOTS.filter(function (s) { return s.cat === cat; })[0];
    open(first.id, { focus: e.detail === 0 });
    highlight(first.id, cat);
  });

  /* ---------- detail – ovládanie ---------- */
  detail.addEventListener('click', function (e) {
    var chip = e.target.closest('.fd__chip');
    if (chip) { var id = chip.getAttribute('data-id'); open(id); highlight(id, byId[id].cat); return; }
    if (e.target.closest('.fd__back, .fd__close')) close(true);
  });
  detail.addEventListener('pointerover', function (e) {
    var chip = e.target.closest('.fd__chip'); if (!chip) return;
    var id = chip.getAttribute('data-id'); highlight(id, byId[id].cat);
  });
  detail.addEventListener('pointerout', function (e) { if (e.target.closest('.fd__chip')) { clearHL(); hideTip(); } });
  var bd = root.querySelector('.fmap__backdrop'); if (bd) bd.addEventListener('click', function () { close(false); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('is-detail') && !doc.querySelector('.modal.is-open')) close(true);
  });

  /* ---------- zoom a posun ---------- */
  var Z = [1, 1.5, 2, 2.75, 3.5], zi = 0;
  var zIn = root.querySelector('[data-z="in"]'), zOut = root.querySelector('[data-z="out"]'), zReset = root.querySelector('[data-z="reset"]');
  function setZoom(n, cx, cy, instant) {
    n = Math.max(0, Math.min(Z.length - 1, n));
    var old = Z[zi], z = Z[n];
    // bod, ktorý má zostať v strede (0–1 relatívne k mape)
    var fx = cx != null ? cx : (vp.scrollLeft + vp.clientWidth / 2) / canvas.clientWidth;
    var fy = cy != null ? cy : (vp.scrollTop + vp.clientHeight / 2) / canvas.clientHeight;
    zi = n;
    canvas.classList.add('no-anim');
    canvas.style.setProperty('--z', z);
    vp.style.height = '';
    if (canvas.clientHeight && canvas.clientHeight < vp.clientHeight - 1) vp.style.height = (canvas.clientHeight + vp.offsetHeight - vp.clientHeight) + 'px';
    vp.classList.toggle('is-zoomed', canvas.scrollWidth > vp.clientWidth + 2 || canvas.scrollHeight > vp.clientHeight + 2);
    var tw = canvas.clientWidth, th = canvas.clientHeight;
    vp.scrollTo({ left: fx * tw - vp.clientWidth / 2, top: fy * th - vp.clientHeight / 2, behavior: 'auto' });
    zOut.disabled = zi === 0; zIn.disabled = zi === Z.length - 1;
    hideTip();
  }
  zIn.addEventListener('click', function () { setZoom(zi + 1); });
  zOut.addEventListener('click', function () { setZoom(zi - 1); });
  zReset.addEventListener('click', function () { setZoom(0, .5, .5); });
  vp.addEventListener('dblclick', function (e) {
    if (e.target.closest('.spot')) return;
    var r = canvas.getBoundingClientRect();
    setZoom(zi + 1, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  function ensureVisible(id) {
    var s = byId[id]; if (!s) return;
    var tw = canvas.clientWidth, th = canvas.clientHeight;
    var x = s.m[0] / W * tw, y = s.m[1] / DATA.h * th;
    var pad = 60;
    if (x < vp.scrollLeft + pad || x > vp.scrollLeft + vp.clientWidth - pad || y < vp.scrollTop + pad || y > vp.scrollTop + vp.clientHeight - pad) {
      vp.scrollTo({ left: x - vp.clientWidth / 2, top: y - vp.clientHeight / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  // ťahanie myšou
  vp.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !vp.classList.contains('is-zoomed')) return;
    drag = { x: e.clientX, y: e.clientY, l: vp.scrollLeft, t: vp.scrollTop }; moved = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 5) { moved = true; vp.classList.add('is-dragging'); hideTip(); clearHL(); }
    if (moved) { vp.scrollLeft = drag.l - dx; vp.scrollTop = drag.t - dy; }
  });
  window.addEventListener('pointerup', function () {
    if (!drag) return; drag = null; vp.classList.remove('is-dragging');
    setTimeout(function () { moved = false; }, 0);
  });
  vp.addEventListener('scroll', function () { if (hlSpot) showTip(hlSpot); }, { passive: true });
  window.addEventListener('resize', function () { setZoom(zi, null, null, true); });

  /* ---------- štart ---------- */
  if (window.innerWidth <= 700) {
    setZoom(2, .5, .52, true);
  } else setZoom(0, .5, .5, true);
  requestAnimationFrame(function () { canvas.classList.remove('no-anim'); });
  // úvodné bliknutie všetkých miest – nech je jasné, že sa dajú kliknúť
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; io.disconnect();
      svg.classList.add('is-intro'); setTimeout(function () { svg.classList.remove('is-intro'); }, 3600);
    }, { threshold: .35 });
    io.observe(vp);
  }
  // odkaz priamo na miesto (#miesto-… / #place-…)
  function fromHash() {
    var m = new RegExp('^#' + T.hash + '-([\\w-]+)$').exec(location.hash);
    if (m && byId[m[1]]) { open(m[1], { noHash: true }); highlight(m[1], byId[m[1]].cat); setTimeout(hideTip, 1600); }
  }
  fromHash(); window.addEventListener('hashchange', fromHash);
})();
