(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
    }

    function initLocalFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
            var empty = section.querySelector("[data-filter-empty]");
            var chips = Array.prototype.slice.call(section.querySelectorAll("[data-chip]"));
            var activeChip = "";

            function apply() {
                var query = (input.value || "").trim().toLowerCase();
                var shown = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedChip = !activeChip || text.indexOf(activeChip.toLowerCase()) !== -1;
                    var visible = matchedQuery && matchedChip;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeChip = chip.getAttribute("data-chip") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip && activeChip !== "");
                    });
                    apply();
                });
            });
            input.addEventListener("input", apply);
            apply();
        });
    }

    function initPlayers() {
        var stages = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        stages.forEach(function (stage) {
            var video = stage.querySelector("video");
            var button = stage.querySelector("[data-play-button]");
            var stream = stage.getAttribute("data-stream");
            var hlsInstance = null;

            function loadAndPlay() {
                if (!video || !stream) {
                    return;
                }
                if (!video.getAttribute("data-ready")) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                    video.setAttribute("data-ready", "1");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }
            stage.addEventListener("click", function (event) {
                if (event.target === video || event.target === stage) {
                    loadAndPlay();
                }
            });
            video.addEventListener("playing", function () {
                stage.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    stage.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                stage.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function renderSearchResults(items) {
        var target = document.getElementById("globalSearchResults");
        var empty = document.getElementById("globalSearchEmpty");
        if (!target) {
            return;
        }
        target.innerHTML = items.map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card searchable-card\">",
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\">",
                "<span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>",
                "<img class=\"poster\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "</a>",
                "<div class=\"card-body\">",
                "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "年</span></div>",
                "<h2><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h2>",
                "<p>" + escapeHtml(movie.oneLine) + "</p>",
                "<div class=\"tag-row\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
        if (empty) {
            empty.classList.toggle("is-visible", items.length === 0);
        }
    }

    function initGlobalSearch() {
        var input = document.getElementById("globalSearchInput");
        var title = document.getElementById("searchTitle");
        if (!input || !Array.isArray(window.SITE_SEARCH_DATA)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function run() {
            var query = (input.value || "").trim().toLowerCase();
            var results = window.SITE_SEARCH_DATA.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return movie.searchText.indexOf(query) !== -1;
            }).slice(0, 120);
            if (title) {
                title.textContent = query ? "搜索结果" : "推荐影片";
            }
            renderSearchResults(results);
        }

        input.addEventListener("input", run);
        run();
    }

    ready(function () {
        initMenu();
        initHero();
        initLocalFilters();
        initPlayers();
        initGlobalSearch();
    });
})();
