(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (navButton && siteNav) {
    navButton.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('.hero-thumb'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === activeIndex);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        showSlide(index);
        stopHero();
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function (input) {
    var targetSelector = input.getAttribute('data-target') || '#movieList';
    var target = document.querySelector(targetSelector);
    var emptyState = document.querySelector('[data-empty-state]');

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    });
  });

  var video = document.getElementById('moviePlayer');
  var gate = document.getElementById('playGate');

  if (video && typeof playbackUrl === 'string' && playbackUrl) {
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
    }

    function playVideo() {
      prepareVideo();
      if (gate) {
        gate.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (gate) {
            gate.classList.remove('is-hidden');
          }
        });
      }
    }

    if (gate) {
      gate.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (gate) {
        gate.classList.add('is-hidden');
      }
    });
  }
})();
