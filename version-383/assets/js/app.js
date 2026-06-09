(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        showSlide(idx);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("#search-input");
    var searchGrid = document.querySelector("#search-results");
    var emptyState = document.querySelector(".empty-state");

    function filterCards(value) {
      if (!searchGrid) {
        return;
      }
      var q = (value || "").trim().toLowerCase();
      var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
        var ok = !q || text.indexOf(q) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    }

    if (searchInput && searchGrid) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInput.value = q;
      filterCards(q);
      searchInput.addEventListener("input", function () {
        filterCards(searchInput.value);
      });
    }

    Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-button");
      var started = false;

      function startPlayer(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (!video) {
          return;
        }
        var source = video.querySelector("source");
        var src = source ? source.getAttribute("src") : video.getAttribute("src");
        if (!src) {
          return;
        }
        shell.classList.add("is-playing");
        video.setAttribute("controls", "controls");

        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegURL")) {
            video.src = src;
            var nativePlay = video.play();
            if (nativePlay && nativePlay.catch) {
              nativePlay.catch(function () {});
            }
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              var play = video.play();
              if (play && play.catch) {
                play.catch(function () {});
              }
            });
          } else {
            video.src = src;
            var basicPlay = video.play();
            if (basicPlay && basicPlay.catch) {
              basicPlay.catch(function () {});
            }
          }
        } else {
          var replay = video.play();
          if (replay && replay.catch) {
            replay.catch(function () {});
          }
        }
      }

      shell.addEventListener("click", startPlayer);
      if (button) {
        button.addEventListener("click", startPlayer);
      }
      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
      }
    });
  });
})();
