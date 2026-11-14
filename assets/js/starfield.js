(function () {
  var canvas = document.getElementById('starfield');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LAYERS = [
    { r: 0.4, alpha: 0.25, factor: 0.15 },
    { r: 0.7, alpha: 0.45, factor: 0.35 },
    { r: 1.1, alpha: 0.70, factor: 0.60 }
  ];
  var MAX_STARS = 140;
  var TWINKLE_SHARE = 0.25;
  var DRIFT_AMP = 0.035;
  var DRIFT_SPEED_X = 0.05;
  var DRIFT_SPEED_Y = 0.037;

  var width = 0, height = 0, dpr = 1;
  var stars = [];
  var scrollY = 0, targetScrollY = 0;
  var pointerX = 0, pointerY = 0, targetPointerX = 0, targetPointerY = 0;
  var rafId = null;
  var lastMeteorAt = 0;
  var nextMeteorDelay = meteorDelay();
  var meteor = null;
  var startTime = performance.now();

  function meteorDelay() {
    return 20000 + Math.random() * 20000;
  }

  function buildStars() {
    var area = width * height;
    var total = Math.min(MAX_STARS, Math.round(area / 9000));
    stars = [];
    for (var i = 0; i < total; i++) {
      var layer = LAYERS[i % LAYERS.length];
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: layer.r * (0.7 + Math.random() * 0.6),
        baseAlpha: layer.alpha,
        factor: layer.factor,
        twinkle: Math.random() < TWINKLE_SHARE,
        twinkleSpeed: 0.5 + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + s.baseAlpha + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function maybeSpawnMeteor(now) {
    if (meteor || now - lastMeteorAt < nextMeteorDelay) return;
    lastMeteorAt = now;
    nextMeteorDelay = meteorDelay();
    var fromLeft = Math.random() < 0.5;
    meteor = {
      x: fromLeft ? -20 : width + 20,
      y: Math.random() * height * 0.5,
      vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 4),
      vy: 2 + Math.random() * 2,
      life: 1
    };
  }

  function drawMeteor() {
    if (!meteor) return;
    meteor.x += meteor.vx;
    meteor.y += meteor.vy;
    meteor.life -= 0.02;
    if (meteor.life <= 0 || meteor.x < -40 || meteor.x > width + 40 || meteor.y > height + 40) {
      meteor = null;
      return;
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,' + meteor.life + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(meteor.x - meteor.vx * 4, meteor.y - meteor.vy * 4);
    ctx.stroke();
    ctx.restore();
  }

  function render(now) {
    scrollY += (targetScrollY - scrollY) * 0.08;
    pointerX += (targetPointerX - pointerX) * 0.08;
    pointerY += (targetPointerY - pointerY) * 0.08;

    ctx.clearRect(0, 0, width, height);

    var elapsed = (now - startTime) / 1000;
    var driftX = Math.sin(elapsed * DRIFT_SPEED_X) * DRIFT_AMP;
    var driftY = Math.cos(elapsed * DRIFT_SPEED_Y) * DRIFT_AMP;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var dx = (pointerX + driftX) * s.factor * 12;
      var scrollShift = Math.max(-140, Math.min(140, scrollY * 0.03));
      var dy = scrollShift * s.factor - (pointerY + driftY) * s.factor * 12;
      var alpha = s.baseAlpha;
      if (s.twinkle) {
        alpha *= 0.55 + 0.45 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase);
      }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(alpha, 0) + ')';
      var y = ((s.y + dy) % (height + 20) + (height + 20)) % (height + 20) - 10;
      ctx.arc(s.x + dx, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    maybeSpawnMeteor(now);
    drawMeteor();

    rafId = requestAnimationFrame(render);
  }

  function wake() {
    if (reduceMotion || rafId || document.hidden) return;
    rafId = requestAnimationFrame(render);
  }

  function onScroll() {
    targetScrollY = window.scrollY;
    wake();
  }

  function onPointerMove(e) {
    targetPointerX = (e.clientX / width) - 0.5;
    targetPointerY = (e.clientY / height) - 0.5;
    wake();
  }

  try {
    resize();
    drawStatic();

    if (!reduceMotion) {
      window.addEventListener('resize', debounce(function () {
        resize();
        drawStatic();
        wake();
      }, 200));
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        } else {
          wake();
        }
      });
      wake();
    } else {
      window.addEventListener('resize', debounce(function () {
        resize();
        drawStatic();
      }, 200));
    }
  } catch (err) {
    /* body background already matches the void; fail silently */
  }
})();
