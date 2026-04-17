import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db, initializeAnalytics } from "./firebase-client.js";

window.__MOVE_APP_BOOTSTRAPPED__ = true;
initializeAnalytics();

window.addEventListener("DOMContentLoaded", function () {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initializeCustomSelects();
  initializeTrainerForm();
  initializeTraineeForm();
  initializeNavigationUX();
  initializeAnimations();
});

function initializeCustomSelects() {
  const selects = Array.from(document.querySelectorAll(".cta-panel .form-grid select"));
  let activeDropdown = null;

  selects.forEach(function (select, index) {
    if (!select || select.dataset.customized === "true") {
      return;
    }

    const field = select.closest(".form-field");
    if (!field) {
      return;
    }

    const options = Array.from(select.options);
    const dropdown = document.createElement("div");
    const trigger = document.createElement("button");
    const menu = document.createElement("div");
    const menuId = "custom-select-menu-" + index;

    dropdown.className = "custom-select";
    trigger.className = "custom-select-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menuId);

    menu.className = "custom-select-menu";
    menu.id = menuId;
    menu.setAttribute("role", "listbox");

    options.forEach(function (option) {
      const item = document.createElement("button");
      const isPlaceholder = option.value === "";

      item.type = "button";
      item.className = "custom-select-option";
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.selected));

      if (isPlaceholder) {
        item.classList.add("is-placeholder");
      }

      if (option.selected) {
        item.classList.add("is-selected");
      }

      item.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncCustomSelect(dropdown, select);
        closeDropdown(dropdown);
      });

      menu.appendChild(item);
    });

    trigger.addEventListener("click", function () {
      if (dropdown.classList.contains("is-open")) {
        closeDropdown(dropdown);
        return;
      }

      if (activeDropdown && activeDropdown !== dropdown) {
        closeDropdown(activeDropdown);
      }

      dropdown.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      activeDropdown = dropdown;
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!dropdown.classList.contains("is-open")) {
          trigger.click();
        }
      }
    });

    select.addEventListener("change", function () {
      syncCustomSelect(dropdown, select);
    });

    select.classList.add("native-select-hidden");
    select.dataset.customized = "true";
    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    field.appendChild(dropdown);
    syncCustomSelect(dropdown, select);

    const form = select.form;
    if (form && !form.dataset.customSelectResetBound) {
      form.dataset.customSelectResetBound = "true";
      form.addEventListener("reset", function () {
        window.requestAnimationFrame(function () {
          const formSelects = form.querySelectorAll("select[data-customized='true']");
          formSelects.forEach(function (formSelect) {
            const custom = formSelect.parentElement && formSelect.parentElement.querySelector(".custom-select");
            if (custom) {
              syncCustomSelect(custom, formSelect);
            }
          });
        });
      });
    }
  });

  document.addEventListener("click", function (event) {
    if (activeDropdown && !activeDropdown.contains(event.target)) {
      closeDropdown(activeDropdown);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeDropdown) {
      closeDropdown(activeDropdown);
    }
  });

  function closeDropdown(dropdown) {
    if (!dropdown) {
      return;
    }

    dropdown.classList.remove("is-open");
    const trigger = dropdown.querySelector(".custom-select-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (activeDropdown === dropdown) {
      activeDropdown = null;
    }
  }
}

function syncCustomSelect(dropdown, select) {
  if (!dropdown || !select) {
    return;
  }

  const trigger = dropdown.querySelector(".custom-select-trigger");
  const options = Array.from(dropdown.querySelectorAll(".custom-select-option"));
  const selectedOption = Array.from(select.options).find(function (option) {
    return option.value === select.value;
  }) || select.options[0];
  const selectedText = selectedOption ? selectedOption.textContent : "";
  const isPlaceholder = !selectedOption || selectedOption.value === "";

  if (trigger) {
    trigger.textContent = selectedText;
    trigger.classList.toggle("is-placeholder", isPlaceholder);
  }

  options.forEach(function (optionButton) {
    const selected = optionButton.dataset.value === select.value;
    optionButton.classList.toggle("is-selected", selected);
    optionButton.setAttribute("aria-selected", String(selected));
  });
}

function initializeTrainerForm() {
  const form = document.getElementById("trainerForm");
  const formMessage = document.getElementById("trainerFormMessage");

  if (!form || !formMessage) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const payload = {
      fullName: getFormValue(form, "fullName"),
      email: getFormValue(form, "email").toLowerCase(),
      phone: normalizePhone(getFormValue(form, "phone")),
      yearsExperience: Number(getFormValue(form, "yearsExperience")),
      specialization: getFormValue(form, "specialization"),
      sportCategory: getFormValue(form, "sportCategory"),
      certifications: getFormValue(form, "certifications"),
      coachingType: "online",
      coachingLocation: "online",
      experienceDetails: getFormValue(form, "experienceDetails"),
      availability: "full-time",
      source: "landing-page-coach",
      createdAt: serverTimestamp()
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !isLikelyValidPhone(payload.phone) ||
      !Number.isFinite(payload.yearsExperience) ||
      payload.yearsExperience < 0 ||
      !payload.specialization ||
      !payload.sportCategory ||
      !payload.certifications ||
      !payload.experienceDetails
    ) {
      formMessage.textContent = "يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "جاري الإرسال...";
    }

    formMessage.textContent = "جاري حفظ بيانات المدرب...";

    try {
      await addDoc(collection(db, "coachApplications"), payload);
      formMessage.textContent = "تم استلام طلب المدرب بنجاح.";
      form.reset();
    } catch (error) {
      console.error("Failed to save coach application", error);
      formMessage.textContent = getSubmissionErrorMessage(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
}

function initializeTraineeForm() {
  const form = document.getElementById("traineeForm");
  const formMessage = document.getElementById("traineeFormMessage");

  if (!form || !formMessage) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const payload = {
      fullName: getFormValue(form, "fullName"),
      email: getFormValue(form, "email").toLowerCase(),
      phone: normalizePhone(getFormValue(form, "phone")),
      goal: getFormValue(form, "goal"),
      fitnessLevel: getFormValue(form, "fitnessLevel"),
      sportType: getFormValue(form, "sportType"),
      trainingLocation: getFormValue(form, "trainingLocation"),
      equipment: getFormValue(form, "equipment"),
      healthNotes: getFormValue(form, "healthNotes") || "none",
      source: "landing-page-trainee",
      createdAt: serverTimestamp()
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !isLikelyValidPhone(payload.phone) ||
      !payload.goal ||
      !payload.fitnessLevel ||
      !payload.sportType ||
      !payload.trainingLocation ||
      !payload.equipment
    ) {
      formMessage.textContent = "يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "جاري الإرسال...";
    }

    formMessage.textContent = "جاري حفظ تسجيل المتدرب...";

    try {
      await addDoc(collection(db, "traineeInterests"), payload);
      formMessage.textContent = "تم استلام تسجيل المتدرب بنجاح.";
      form.reset();
    } catch (error) {
      console.error("Failed to save trainee signup", error);
      formMessage.textContent = getSubmissionErrorMessage(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
}

function initializeAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCompactViewport = window.matchMedia("(max-width: 820px)").matches;

  if (prefersReducedMotion) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  window.gsap.from(".hero-copy > *", {
    opacity: 0,
    y: 28,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });

  if (!isCompactViewport) {
    window.gsap.from(".hero-visual .dashboard-card", {
      opacity: 0,
      x: -40,
      y: 20,
      duration: 1.1,
      stagger: 0.16,
      ease: "power3.out",
      delay: 0.2
    });
  }

  window.gsap.utils.toArray("[data-animate]").forEach(function (element) {
    if (element.closest(".hero")) {
      return;
    }

    const animation = element.getAttribute("data-animate");
    const vars = {
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
        once: true
      }
    };

    if (!isCompactViewport && animation === "fade-left") {
      vars.x = -44;
    }

    if (!isCompactViewport && animation === "fade-right") {
      vars.x = 44;
    }

    if (!vars.x) {
      vars.y = isCompactViewport ? 18 : 34;
    }

    window.gsap.from(element, vars);
  });

  if (isCompactViewport) {
    return;
  }

  window.gsap.utils.toArray("[data-parallax]").forEach(function (element) {
    const distance = Number(element.getAttribute("data-parallax")) || 18;

    window.gsap.to(element, {
      y: distance,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });
}

function initializeNavigationUX() {
  const body = document.body;
  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const navOverlay = document.querySelector(".nav-overlay");
  const backToTop = document.querySelector(".back-to-top");
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

  syncLayoutState();
  window.addEventListener("resize", syncLayoutState);

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const open = !body.classList.contains("nav-open");
      setNavOpen(open);
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", function () {
      setNavOpen(false);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setNavOpen(false);
    });
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  highlightActiveSection(navLinks);

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const syncBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 560);
    };

    window.addEventListener("scroll", syncBackToTop, { passive: true });
    syncBackToTop();
  }

  function setNavOpen(open) {
    body.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function updateHeaderHeight() {
    if (!header) {
      return;
    }

    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-height", String(height) + "px");
  }

  function syncLayoutState() {
    updateHeaderHeight();
    if (window.innerWidth > 820) {
      setNavOpen(false);
    }
  }
}

function highlightActiveSection(navLinks) {
  if (!navLinks.length || typeof window.IntersectionObserver === "undefined") {
    return;
  }

  const byId = {};
  navLinks.forEach(function (link) {
    const targetId = link.getAttribute("href").slice(1);
    if (targetId) {
      byId[targetId] = link;
    }
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");
        if (!id || !byId[id]) {
          return;
        }

        navLinks.forEach(function (link) {
          link.classList.remove("is-active");
        });
        byId[id].classList.add("is-active");
      });
    },
    { rootMargin: "-42% 0px -46% 0px", threshold: 0.01 }
  );

  Object.keys(byId).forEach(function (id) {
    const section = document.getElementById(id);
    if (section) {
      observer.observe(section);
    }
  });
}

function getFormValue(form, fieldName) {
  const field = form.querySelector('[name="' + fieldName + '"]');
  return field ? field.value.trim() : "";
}

function normalizePhone(value) {
  return value.replace(/\s+/g, "");
}

function isLikelyValidPhone(value) {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 8 && digitsOnly.length <= 15;
}

function getSubmissionErrorMessage(error) {
  const message = error && error.message ? error.message : "";

  if (message.indexOf("Database '(default)' not found") !== -1) {
    return "يجب تفعيل Firestore أولاً في مشروع Firebase.";
  }

  if (message.indexOf("Missing or insufficient permissions") !== -1) {
    return "تم رفض الحفظ بسبب قواعد Firestore. تأكد من تحديث قواعد الأمان.";
  }

  return "تعذر حفظ الطلب حالياً. حاول مرة أخرى.";
}
