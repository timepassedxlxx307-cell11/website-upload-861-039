(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });
    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });
    window.setInterval(function () { show(index + 1); }, 6500);
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ');
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    if (!lists.length) return;
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');
    if (input && input.hasAttribute('data-query-sync')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) input.value = q;
    }
    function matchesType(card, type) {
      if (!type) return true;
      var text = normalizeText(card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
      return text.indexOf(normalizeText(type)) !== -1;
    }
    function apply() {
      var query = normalizeText(input ? input.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var ok = (!query || haystack.indexOf(query) !== -1) && matchesType(card, type);
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }
    if (input) input.addEventListener('input', apply);
    if (typeSelect) typeSelect.addEventListener('change', apply);
    apply();
  }

  function playWithHls(video, url) {
    if (!video || !url) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      video._hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = url;
    video.play().catch(function () {});
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      if (!video || !button) return;
      var url = video.getAttribute('src');
      var start = function () {
        box.classList.add('is-playing');
        video.controls = true;
        playWithHls(video, url);
      };
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
    });
  }

  setupHero();
  setupFilters();
  setupPlayers();
})();
