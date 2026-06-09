(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    var filterPanel = document.querySelector("[data-movie-filter]");
    var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyResult = document.querySelector("[data-empty-result]");

    if (filterPanel && movieCards.length) {
        var input = filterPanel.querySelector("[data-filter-input]");
        var region = filterPanel.querySelector("[data-filter-region]");
        var year = filterPanel.querySelector("[data-filter-year]");
        var type = filterPanel.querySelector("[data-filter-type]");
        var params = new URLSearchParams(window.location.search);

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        if (year && params.get("year")) {
            year.value = params.get("year");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;

            movieCards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
                var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                var matches = matchesKeyword && matchesRegion && matchesYear && matchesType;

                card.style.display = matches ? "" : "none";
                if (matches) {
                    visible += 1;
                }
            });

            if (emptyResult) {
                emptyResult.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }
})();
