(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });

      reveals.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('main section[id]');
  if (navLinks.length && sections.length) {
    var linkByHash = {};
    navLinks.forEach(function (link) {
      linkByHash[link.getAttribute('href')] = link;
    });

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkByHash['#' + entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  var bkkTimeEl = document.getElementById('bkk-time');
  if (bkkTimeEl) {
    var bkkFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    var bkkTimer = null;

    function renderBkkTime() {
      bkkTimeEl.textContent = bkkFormatter.format(new Date());
    }

    function startClock() {
      if (bkkTimer) return;
      renderBkkTime();
      bkkTimer = setInterval(renderBkkTime, 1000);
    }

    function stopClock() {
      clearInterval(bkkTimer);
      bkkTimer = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopClock();
      } else {
        startClock();
      }
    });

    startClock();
  }

  var aboutPhoto = document.querySelector('.about-photo');
  if (aboutPhoto) {
    aboutPhoto.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    aboutPhoto.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
})();
