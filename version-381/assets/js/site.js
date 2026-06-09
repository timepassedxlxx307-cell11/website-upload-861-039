(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      if (initial && !input.value) {
        input.value = initial;
      }
    });

    function filterCards() {
      var value = normalize(inputs[0] ? inputs[0].value : initial);
      var items = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
      var matched = 0;
      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute("data-search"));
        var ok = !value || haystack.indexOf(value) !== -1;
        item.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          matched += 1;
        }
      });
      var note = document.querySelector("[data-result-note]");
      if (note) {
        if (value) {
          note.textContent = "关键词 “" + value + "” 找到 " + matched + " 部作品";
        } else {
          note.textContent = "输入关键词可按影片名称、地区、类型、标签筛选";
        }
      }
      var empty = document.querySelector("[data-empty-state]");
      if (empty) {
        empty.classList.toggle("active", matched === 0);
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", filterCards);
    });

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    filterForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterCards();
      });
    });

    if (inputs.length) {
      filterCards();
    }
  });
})();
