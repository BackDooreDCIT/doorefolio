(function () {
  var canvas = document.getElementById('hero-portrait');
  if (!canvas || !canvas.getContext) return;

  var data = window.PORTRAIT_DATA;
  if (!data) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ACTIVE_THRESHOLD = 6;
  var FLICKER_SHARE = 0.05;
  var FLICKER_MIN_MS = 500;
  var FLICKER_MAX_MS = 1600;

  var cols = data.cols;
  var rows = data.rows;
  var weights = decodeWeights(data.weights);
  var cellW = 0, cellH = 0;
  var cells = [];
  var flickerTimers = [];

  function decodeWeights(b64) {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function buildCells() {
    cells = [];
    for (var i = 0; i < cols * rows; i++) {
      var w = weights[i];
      cells.push({
        active: w > ACTIVE_THRESHOLD,
        weight: w / 255,
        char: Math.random() < 0.5 ? '0' : '1'
      });
    }
  }

  function sizeCanvas() {
    var widthCss = canvas.parentElement.getBoundingClientRect().width;
    if (!widthCss) return false;

    var heightCss = rows * (widthCss / cols);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = widthCss * dpr;
    canvas.height = heightCss * dpr;
    canvas.style.width = widthCss + 'px';
    canvas.style.height = heightCss + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellW = widthCss / cols;
    cellH = heightCss / rows;
    return true;
  }

  function drawCell(index) {
    var x = index % cols;
    var y = Math.floor(index / cols);
    var cell = cells[index];
    var px = x * cellW;
    var py = y * cellH;
    ctx.clearRect(px, py, cellW, cellH);
    if (!cell.active) return;
    ctx.fillStyle = 'rgba(242,242,240,' + cell.weight + ')';
    ctx.fillText(cell.char, px + cellW / 2, py + cellH / 2);
  }

  function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = Math.ceil(cellH * 0.9) + "px 'IBM Plex Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < cells.length; i++) drawCell(i);
  }

  function clearFlicker() {
    flickerTimers.forEach(clearTimeout);
    flickerTimers = [];
  }

  function scheduleFlicker(index) {
    var delay = FLICKER_MIN_MS + Math.random() * (FLICKER_MAX_MS - FLICKER_MIN_MS);
    var t = setTimeout(function () {
      cells[index].char = cells[index].char === '0' ? '1' : '0';
      drawCell(index);
      scheduleFlicker(index);
    }, delay);
    flickerTimers.push(t);
  }

  function startFlicker() {
    clearFlicker();
    if (reduceMotion || document.hidden) return;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].active && Math.random() < FLICKER_SHARE) {
        scheduleFlicker(i);
      }
    }
  }

  function render() {
    if (!sizeCanvas()) return;
    drawAll();
    startFlicker();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  try {
    buildCells();
    render();
    window.addEventListener('resize', debounce(render, 250));
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearFlicker();
      } else {
        startFlicker();
      }
    });
  } catch (err) {
    /* decorative canvas; fail silently */
  }
})();
