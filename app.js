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

  initializeWaitlistForm();
  initializeAnimations();
});

function initializeWaitlistForm() {
  const form = document.getElementById("waitlistForm");
  const formMessage = document.getElementById("formMessage");

  if (!form || !formMessage) {
    return;
  }

  const emailInput = form.querySelector('input[name="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";

    if (!email) {
      formMessage.textContent = "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0635\u062D\u064A\u062D.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644...";
    }

    formMessage.textContent = "\u062C\u0627\u0631\u064A \u062D\u0641\u0638 \u0628\u064A\u0627\u0646\u0627\u062A\u0643...";

    try {
      await addDoc(collection(db, "waitlist"), {
        email: email,
        source: "landing-page",
        createdAt: serverTimestamp()
      });

      formMessage.textContent =
        "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 " + email + " \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0628\u0643\u0631\u0629.";
      form.reset();
    } catch (error) {
      console.error("Failed to save waitlist signup", error);
      formMessage.textContent =
        "\u062A\u0639\u0630\u0631 \u062D\u0641\u0638 \u0627\u0644\u0637\u0644\u0628 \u062D\u0627\u0644\u064A\u0627\u064B. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.";
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
