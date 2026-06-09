(function () {
    var pageSize = 36;
    var state = {
        page: 1,
        items: []
    };

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function getParams() {
        return new URLSearchParams(window.location.search);
    }

    function movieCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"poster-wrap\" href=\"movies/" + escapeHtml(movie.filename) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" data-fallback-image>" +
                    "<span class=\"play-badge\">播放</span>" +
                    "<span class=\"score-badge\">" + escapeHtml(movie.rating) + "</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<a class=\"card-title\" href=\"movies/" + escapeHtml(movie.filename) + "\">" + escapeHtml(movie.title) + "</a>" +
                    "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
                    "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"card-tags\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function collectFilters(form) {
        return {
            q: normalize(form.elements.q.value),
            category: normalize(form.elements.category.value),
            type: normalize(form.elements.type.value),
            year: normalize(form.elements.year.value)
        };
    }

    function matches(movie, filters) {
        if (filters.category && normalize(movie.categorySlug) !== filters.category) {
            return false;
        }
        if (filters.type && normalize(movie.type).indexOf(filters.type) === -1) {
            return false;
        }
        if (filters.year && normalize(movie.year) !== filters.year) {
            return false;
        }
        if (!filters.q) {
            return true;
        }
        var corpus = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags.join(" "),
            movie.oneLine,
            movie.categoryName
        ].join(" "));
        return corpus.indexOf(filters.q) !== -1;
    }

    function render(resultsEl, statusEl, paginationEl) {
        var total = state.items.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize));
        state.page = Math.min(Math.max(1, state.page), totalPages);
        var start = (state.page - 1) * pageSize;
        var pageItems = state.items.slice(start, start + pageSize);

        statusEl.textContent = "共找到 " + total + " 部影片，当前显示第 " + state.page + " / " + totalPages + " 页。";
        resultsEl.innerHTML = pageItems.map(movieCard).join("");
        paginationEl.innerHTML = "";

        var first = Math.max(1, state.page - 3);
        var last = Math.min(totalPages, state.page + 3);
        for (var page = first; page <= last; page += 1) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = page;
            button.className = page === state.page ? "is-active" : "";
            button.addEventListener("click", (function (pageNumber) {
                return function () {
                    state.page = pageNumber;
                    render(resultsEl, statusEl, paginationEl);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                };
            })(page));
            paginationEl.appendChild(button);
        }
    }

    function init() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MOVIE_DATA) {
            return;
        }
        var form = root.querySelector("[data-search-form]");
        var resultsEl = root.querySelector("[data-search-results]");
        var statusEl = root.querySelector("[data-search-status]");
        var paginationEl = root.querySelector("[data-search-pagination]");
        var params = getParams();

        form.elements.q.value = params.get("q") || "";
        form.elements.category.value = params.get("category") || "";
        form.elements.type.value = params.get("type") || "";
        form.elements.year.value = params.get("year") || "";

        function apply() {
            var filters = collectFilters(form);
            state.page = 1;
            state.items = window.MOVIE_DATA.filter(function (movie) {
                return matches(movie, filters);
            });
            render(resultsEl, statusEl, paginationEl);
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        form.addEventListener("reset", function () {
            window.setTimeout(apply, 0);
        });
        Array.prototype.forEach.call(form.elements, function (element) {
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        });
        apply();
    }

    ready(init);
})();
