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

  initializeTrainerForm();
  initializeTraineeForm();
  initializeNavigationUX();
  initializeAnimations();
});

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
      coachingType: getFormValue(form, "coachingType"),
      coachingLocation: getFormValue(form, "coachingLocation"),
      experienceDetails: getFormValue(form, "experienceDetails"),
      availability: getFormValue(form, "availability"),
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
      !payload.coachingType ||
      !payload.coachingLocation ||
      !payload.experienceDetails ||
      !payload.availability
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

  window.gsap.registerPlugin(window.ScrollTrigger);

  window.gsap.from(".hero-copy > *", {
    opacity: 0,
    y: 28,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });

  window.gsap.from(".hero-visual .dashboard-card", {
    opacity: 0,
    x: -40,
    y: 20,
    duration: 1.1,
    stagger: 0.16,
    ease: "power3.out",
    delay: 0.2
  });

  window.gsap.utils.toArray("[data-animate]").forEach(function (element) {
    const animation = element.getAttribute("data-animate");
    const vars = {
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%"
      }
    };

    if (animation === "fade-left") {
      vars.x = -44;
    }

    if (animation === "fade-right") {
      vars.x = 44;
    }

    if (!vars.x) {
      vars.y = 34;
    }

    window.gsap.from(element, vars);
  });

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
