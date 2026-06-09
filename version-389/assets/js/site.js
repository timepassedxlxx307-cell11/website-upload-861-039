(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img[data-fallback-image]"));
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                var wrap = image.closest(".poster-wrap, .hero-poster, .category-tile, .category-cover-stack");
                if (wrap) {
                    wrap.classList.add("has-missing-image");
                }
            }, { once: true });
        });
    }

    function initLocalFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
        inputs.forEach(function (input) {
            var section = input.closest(".library-section") || document;
            var scope = section.querySelector("[data-filter-scope]");
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var text = normalize(card.textContent);
                    card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initImageFallbacks();
        initLocalFilters();
    });
})();
