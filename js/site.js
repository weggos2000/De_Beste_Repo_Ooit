(function () {
  "use strict";

  /* Leesvoortgang bovenaan de pagina */
  var progressBar = document.getElementById("reading-progress-bar");
  var backToTop = document.getElementById("back-to-top");

  function updateScrollUI() {
    if (progressBar) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    }
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  /* Voortgangstracker voor de GitHub-lessen */
  var lessonChecks = document.querySelectorAll("[data-lesson]");
  if (lessonChecks.length) {
    var STORAGE_KEY = "icw-github-progress";
    var progressFill = document.getElementById("progress-fill");
    var progressCount = document.getElementById("progress-count");

    var state = {};
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      state = {};
    }

    function refreshSummary() {
      var total = lessonChecks.length;
      var done = 0;
      lessonChecks.forEach(function (input) {
        if (input.checked) done++;
      });
      if (progressFill) {
        progressFill.style.width = (total ? (done / total) * 100 : 0) + "%";
      }
      if (progressCount) {
        progressCount.textContent = done + "/" + total + " voltooid";
      }
    }

    lessonChecks.forEach(function (input) {
      var lessonId = input.dataset.lesson;
      var item = input.closest(".lesson-item");

      input.checked = !!state[lessonId];
      if (item) item.classList.toggle("is-done", input.checked);

      input.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      input.addEventListener("change", function () {
        state[lessonId] = input.checked;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
          /* localStorage niet beschikbaar, voortgang wordt niet bewaard */
        }
        if (item) item.classList.toggle("is-done", input.checked);
        refreshSummary();
      });
    });

    refreshSummary();
  }

  /* Jaarfilter voor de Wall of Fame */
  var filterButtons = document.querySelectorAll(".filter-btn");
  if (filterButtons.length) {
    var timelineItems = document.querySelectorAll(".timeline li");

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        var year = btn.dataset.year;
        timelineItems.forEach(function (li) {
          var match = year === "all" || li.dataset.year === year;
          li.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* Tabs voor de Nokia-pagina */
  var tabButtons = document.querySelectorAll(".tab-btn");
  if (tabButtons.length) {
    var activateTab = function (tab) {
      tabButtons.forEach(function (b) {
        var selected = b === tab;
        b.classList.toggle("is-active", selected);
        b.setAttribute("aria-selected", selected ? "true" : "false");
        b.tabIndex = selected ? 0 : -1;

        var panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    };

    tabButtons.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab);
      });

      tab.addEventListener("keydown", function (event) {
        var i = Array.prototype.indexOf.call(tabButtons, tab);
        var next = null;
        if (event.key === "ArrowRight") next = tabButtons[(i + 1) % tabButtons.length];
        if (event.key === "ArrowLeft") next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length];
        if (next) {
          event.preventDefault();
          next.focus();
          activateTab(next);
        }
      });
    });
  }
})();
