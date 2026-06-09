(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  window.initVideoPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var streamUrl = options.streamUrl;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', 'true');
    }

    function start() {
      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        start();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderSearch() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var input = document.querySelector('[data-search-input]');

    if (!results || !window.MOVIE_INDEX) {
      return;
    }

    var query = getQuery();

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var matched = window.MOVIE_INDEX.filter(function (movie) {
      if (!normalized) {
        return true;
      }

      return [movie.title, movie.category, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (summary) {
      summary.textContent = query ? '找到 ' + matched.length + ' 个相关结果' : '显示热门影片 ' + matched.length + ' 部';
    }

    results.innerHTML = matched.map(function (movie) {
      return '<article class="movie-card">' +
        '<a href="' + movie.url + '">' +
        '<div class="poster-frame">' +
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
        '<span class="score-badge">' + movie.score + '</span>' +
        '</div>' +
        '<div class="card-body">' +
        '<div class="card-kicker">' + movie.category + ' · ' + movie.year + '</div>' +
        '<h3>' + movie.title + '</h3>' +
        '<p>' + movie.oneLine + '</p>' +
        '<div class="tag-row"><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }).join('');
  }

  renderSearch();
})();
