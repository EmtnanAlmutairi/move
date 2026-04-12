(function () {
  "use strict";

  var activeObserver = null;
  var activeLinks = [];

  window.addEventListener("DOMContentLoaded", function () {
    initializePortalUX();
  });

  function initializePortalUX() {
    var coachDashboard = document.getElementById("coachDashboard");
    var adminDashboard = document.getElementById("dashboardCard");
    if (!coachDashboard && !adminDashboard) {
      return;
    }

    var context = coachDashboard
      ? {
          dashboard: coachDashboard,
          hiddenClass: "hidden",
          sections: getCoachSections
        }
      : {
          dashboard: adminDashboard,
          hiddenClass: "panel-hidden",
          sections: getAdminSections
        };

    ensureBackToTopButton();
    watchDashboardState(context);
    renderQuickNav(context);
  }

  function watchDashboardState(context) {
    var rafToken = 0;
    var observer = new MutationObserver(function () {
      if (rafToken) return;
      rafToken = window.requestAnimationFrame(function () {
        rafToken = 0;
        renderQuickNav(context);
      });
    });

    observer.observe(context.dashboard, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"]
    });
  }

  function renderQuickNav(context) {
    var visible = !context.dashboard.classList.contains(context.hiddenClass);
    var sections = visible ? context.sections() : [];
    var mount = ensureQuickNavMount(context.dashboard);

    if (!visible || !sections.length) {
      mount.classList.add("hidden");
      disconnectSectionObserver();
      return;
    }

    mount.classList.remove("hidden");
    mount.innerHTML = "";

    sections.forEach(function (section) {
      var link = document.createElement("a");
      link.href = "#" + section.id;
      link.textContent = section.label;
      link.className = "portal-quicknav-link";
      link.addEventListener("click", function () {
        window.setTimeout(function () {
          renderQuickNav(context);
        }, 80);
      });
      mount.appendChild(link);
    });

    observeActiveSection(sections, mount);
  }

  function ensureQuickNavMount(dashboard) {
    var existing = dashboard.querySelector(".portal-quicknav");
    if (existing) {
      return existing;
    }

    var nav = document.createElement("nav");
    nav.className = "portal-quicknav";
    nav.setAttribute("aria-label", "أقسام البوابة");

    var firstCard = dashboard.querySelector(".card, .identity-bar");
    if (firstCard && firstCard.parentNode) {
      firstCard.parentNode.insertBefore(nav, firstCard);
    } else {
      dashboard.insertBefore(nav, dashboard.firstChild);
    }

    return nav;
  }

  function getCoachSections() {
    var sections = [];
    var nodes = document.querySelectorAll("#coachDashboard .card[id]");

    nodes.forEach(function (section) {
      if (section.classList.contains("hidden")) return;
      var heading = section.querySelector(".card-head h3");
      var label = heading ? cleanLabel(heading.textContent) : section.id;
      sections.push({ id: section.id, label: label, el: section });
    });

    return sections;
  }

  function getAdminSections() {
    var pairs = [
      { id: "configForm", label: "إعدادات التطبيق" },
      { id: "assignmentForm", label: "تعيين الفريق" },
      { id: "financeTotalRevenue", label: "المالية" },
      { id: "payoutGenerateForm", label: "المدفوعات" },
      { id: "recentSubscriptionsList", label: "الاشتراكات" },
      { id: "recentInjuriesList", label: "الإصابات" }
    ];

    return pairs
      .map(function (item) {
        var anchor = document.getElementById(item.id);
        if (!anchor) return null;

        var section = anchor.closest(".mini-card, .admin-form, .stats-grid, .identity-bar, article, section, form") || anchor;
        if (!section.id) {
          section.id = "portal-section-" + item.id;
        }

        return { id: section.id, label: item.label, el: section };
      })
      .filter(Boolean);
  }

  function observeActiveSection(sections, mount) {
    disconnectSectionObserver();
    activeLinks = Array.from(mount.querySelectorAll(".portal-quicknav-link"));

    var linkById = {};
    activeLinks.forEach(function (link) {
      var target = link.getAttribute("href").slice(1);
      linkById[target] = link;
    });

    activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          if (!id || !linkById[id]) return;
          activeLinks.forEach(function (link) {
            link.classList.remove("is-active");
          });
          linkById[id].classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );

    sections.forEach(function (section) {
      if (section.el && section.el.id) {
        activeObserver.observe(section.el);
      }
    });
  }

  function disconnectSectionObserver() {
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
    activeLinks = [];
  }

  function ensureBackToTopButton() {
    var existing = document.querySelector(".portal-backtotop");
    var button = existing || document.createElement("button");

    if (!existing) {
      button.type = "button";
      button.className = "portal-backtotop";
      button.setAttribute("aria-label", "العودة للأعلى");
      button.textContent = "↑";
      document.body.appendChild(button);
    }

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var sync = function () {
      button.classList.toggle("is-visible", window.scrollY > 380);
    };

    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  function cleanLabel(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
