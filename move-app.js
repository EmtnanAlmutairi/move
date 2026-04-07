import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  limit,
  query,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db, initializeAnalytics } from "./firebase-client.js";

initializeAnalytics();

const fallbackConfig = {
  workoutPlanVersion: "v2.4",
  nutritionPlanVersion: "v1.9",
  challengesEnabled: true,
  featuredWorkoutTitle: "HIIT لكامل الجسم",
  featuredWorkoutDurationMin: 45,
  featuredWorkoutCoach: "كابتن خالد"
};

const state = {
  config: fallbackConfig,
  workouts: [
    { id: "w1", title: "تمرين الصدر والتراي", day: "الأحد", durationMin: 60, intensity: "عالية", done: true },
    { id: "w2", title: "تمرين الظهر والباي", day: "الاثنين", durationMin: 65, intensity: "عالية", done: true },
    { id: "w3", title: "كارديو ولياقة", day: "الثلاثاء", durationMin: 45, intensity: "متوسطة", done: false },
    { id: "w4", title: "تمارين الأرجل", day: "الأربعاء", durationMin: 70, intensity: "عالية", done: false }
  ],
  meals: [
    { id: "m1", title: "توست أفوكادو وبيض", kcal: 320, time: "08:00 ص" },
    { id: "m2", title: "سلطة سلمون مشوي", kcal: 450, time: "01:00 م" },
    { id: "m3", title: "زبادي يوناني وتوت", kcal: 180, time: "04:00 م" }
  ],
  chats: [
    { id: "c1", name: "فريق الدعم المتكامل", role: "فريق متكامل", msg: "شكرا لكم جميعا فريق رائع", unread: 2 },
    { id: "c2", name: "سارة منير", role: "تغذية", msg: "تأكد من القيام بمقاييس التقدم", unread: 0 },
    { id: "c3", name: "د. يثنى", role: "علاج طبيعي", msg: "كيف كانت وجبة الغداء اليوم؟", unread: 0 },
    { id: "c4", name: "كابتن خالد", role: "مدرب بدني", msg: "هل تشعر بتحسن في الركبة؟", unread: 0 }
  ],
  devices: [
    { id: "d1", name: "Apple Health", status: "غير متصل" },
    { id: "d2", name: "Google Fit", status: "غير متصل" },
    { id: "d3", name: "Garmin Connect", status: "غير متصل" }
  ],
  latestInjury: null
};

window.addEventListener("DOMContentLoaded", init);

async function init() {
  setTodayLabel();
  bindTabs();
  bindOnboarding();
  bindInjuryForm();
  renderAll();

  await Promise.all([loadConfig(), loadLatestInjuryFromFirestore()]);
  renderAll();
}

function setTodayLabel() {
  const todayLabel = document.getElementById("todayLabel");
  if (!todayLabel) return;

  const now = new Date();
  todayLabel.textContent = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(now);
}

function bindTabs() {
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const screens = Array.from(document.querySelectorAll(".screen"));

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      screens.forEach((screen) => {
        const isTarget = screen.getAttribute("data-screen") === target;
        screen.classList.toggle("active", isTarget);
      });
    });
  });
}

function bindOnboarding() {
  const modal = document.getElementById("onboardingModal");
  const openButton = document.getElementById("openOnboardingBtn");
  const form = document.getElementById("onboardingForm");
  const message = document.getElementById("onboardingMessage");

  if (!(modal instanceof HTMLDialogElement) || !openButton || !form || !message) {
    return;
  }

  openButton.addEventListener("click", function () {
    modal.showModal();
  });

  if (!localStorage.getItem("moveSubscriptionProfile")) {
    modal.showModal();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phone: normalizePhone(String(formData.get("phone") || "")),
      goal: String(formData.get("goal") || ""),
      planId: String(formData.get("planId") || ""),
      source: "move-web-mvp",
      createdAt: serverTimestamp()
    };

    if (!payload.fullName || !payload.email || !payload.phone || !payload.goal || !payload.planId) {
      message.textContent = "يرجى تعبئة جميع الحقول المطلوبة.";
      return;
    }

    if (!isLikelyValidPhone(payload.phone)) {
      message.textContent = "رقم الجوال غير صحيح.";
      return;
    }

    message.textContent = "جاري التفعيل...";

    try {
      await addDoc(collection(db, "subscriptions"), payload);
      localStorage.setItem(
        "moveSubscriptionProfile",
        JSON.stringify({
          fullName: payload.fullName,
          goal: payload.goal,
          planId: payload.planId
        })
      );
      message.textContent = "تم تفعيل الاشتراك بنجاح.";
      form.reset();
      setTimeout(function () {
        modal.close();
      }, 700);
    } catch (error) {
      console.error("Failed to save subscription", error);
      message.textContent = "تعذر التفعيل حالياً. حاول مرة أخرى.";
    }
  });
}

function bindInjuryForm() {
  const form = document.getElementById("injuryForm");
  const message = document.getElementById("injuryMessage");

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      area: String(formData.get("area") || "").trim(),
      severity: Number(formData.get("severity") || 1),
      note: String(formData.get("note") || "").trim(),
      status: "new",
      source: "move-web-mvp",
      createdAt: serverTimestamp()
    };

    if (!payload.area || !payload.note || !Number.isFinite(payload.severity)) {
      message.textContent = "يرجى تعبئة بيانات الإصابة بشكل صحيح.";
      return;
    }

    message.textContent = "جاري إرسال البلاغ...";

    try {
      await addDoc(collection(db, "injuryReports"), payload);
      state.latestInjury = {
        area: payload.area,
        severity: payload.severity,
        note: payload.note
      };
      renderLatestInjury();
      form.reset();
      message.textContent = "تم إرسال البلاغ للفريق الطبي.";
    } catch (error) {
      console.error("Failed to save injury report", error);
      message.textContent = "تعذر إرسال البلاغ حالياً.";
    }
  });
}

async function loadConfig() {
  try {
    const configRef = doc(db, "appConfig", "main");
    const snapshot = await getDoc(configRef);
    if (snapshot.exists()) {
      state.config = Object.assign({}, fallbackConfig, snapshot.data());
    }
  } catch (error) {
    console.error("Failed to load app config", error);
  }
}

async function loadLatestInjuryFromFirestore() {
  try {
    const injuryQuery = query(collection(db, "injuryReports"), orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(injuryQuery);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      state.latestInjury = {
        area: data.area || "غير محدد",
        severity: data.severity || 1,
        note: data.note || ""
      };
    }
  } catch (error) {
    console.error("Failed to load latest injury", error);
  }
}

function renderAll() {
  renderDashboard();
  renderWeeklyPlan();
  renderWorkoutLibrary();
  renderMeals();
  renderLatestInjury();
  renderChats();
  renderDevices();
}

function renderDashboard() {
  const readinessValue = document.getElementById("readinessValue");
  const planVersionBadge = document.getElementById("planVersionBadge");
  const challengeBadge = document.getElementById("challengeBadge");
  const featuredWorkout = document.getElementById("featuredWorkout");

  if (readinessValue) readinessValue.textContent = "75%";
  if (planVersionBadge) planVersionBadge.textContent = "خطة " + (state.config.workoutPlanVersion || "v2.4");
  if (challengeBadge) challengeBadge.textContent = state.config.challengesEnabled ? "مفعلة" : "متوقفة";

  if (featuredWorkout) {
    featuredWorkout.innerHTML =
      '<div class="item-row">' +
      '<div>' +
      '<p class="item-title">' + escapeHtml(state.config.featuredWorkoutTitle || "HIIT لكامل الجسم") + "</p>" +
      '<p class="item-sub">' +
      escapeHtml((state.config.featuredWorkoutDurationMin || 45) + " دقيقة • " + (state.config.featuredWorkoutCoach || "كابتن خالد")) +
      "</p>" +
      "</div>" +
      '<span class="badge">فيديو</span>' +
      "</div>";
  }
}

function renderWeeklyPlan() {
  const weeklyList = document.getElementById("weeklyList");
  const weeklyProgress = document.getElementById("weeklyProgress");
  if (!weeklyList || !weeklyProgress) return;

  const doneCount = state.workouts.filter((w) => w.done).length;
  weeklyProgress.textContent = doneCount + " من " + state.workouts.length;

  weeklyList.innerHTML = state.workouts
    .map(function (workout) {
      return (
        '<article class="plan-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + (workout.done ? "مكتمل" : "قادم") + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(workout.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(workout.day + " • " + workout.durationMin + " دقيقة • " + workout.intensity) + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderWorkoutLibrary() {
  const workoutLibrary = document.getElementById("workoutLibrary");
  if (!workoutLibrary) return;

  workoutLibrary.innerHTML = state.workouts
    .map(function (workout) {
      return (
        '<article class="workout-item">' +
        '<div class="item-row">' +
        '<span class="badge">فيديو</span>' +
        '<div>' +
        '<p class="item-title">' + escapeHtml(workout.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(workout.durationMin + " دقيقة") + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderMeals() {
  const nutritionVersion = document.getElementById("nutritionVersion");
  const mealList = document.getElementById("mealList");

  if (nutritionVersion) {
    nutritionVersion.textContent = state.config.nutritionPlanVersion || "v1.9";
  }

  if (!mealList) return;

  mealList.innerHTML = state.meals
    .map(function (meal) {
      return (
        '<article class="meal-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + escapeHtml(meal.time) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(meal.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(meal.kcal + " سعرة") + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderLatestInjury() {
  const latestInjuryCard = document.getElementById("latestInjuryCard");
  if (!latestInjuryCard) return;

  if (!state.latestInjury) {
    latestInjuryCard.innerHTML =
      "<h3>حالة الاستشفاء</h3>" + '<p class="muted">لا توجد بلاغات حديثة.</p>';
    return;
  }

  latestInjuryCard.innerHTML =
    "<h3>تم الإبلاغ عن إصابة نشطة</h3>" +
    '<p class="item-sub">' +
    escapeHtml(
      state.latestInjury.area +
        " (الدرجة " +
        state.latestInjury.severity +
        ") • " +
        state.latestInjury.note
    ) +
    "</p>";
}

function renderChats() {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  chatList.innerHTML = state.chats
    .map(function (chat) {
      return (
        '<article class="chat-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + (chat.unread > 0 ? chat.unread + " جديد" : chat.role) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(chat.name) + "</p>" +
        '<p class="item-sub">' + escapeHtml(chat.msg) + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function renderDevices() {
  const deviceList = document.getElementById("deviceList");
  if (!deviceList) return;

  deviceList.innerHTML = state.devices
    .map(function (device) {
      return (
        '<article class="device-item">' +
        '<div class="item-row">' +
        '<button class="ghost-btn" type="button">ربط</button>' +
        '<div>' +
        '<p class="item-title">' + escapeHtml(device.name) + "</p>" +
        '<p class="item-sub">' + escapeHtml(device.status) + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
}

function normalizePhone(value) {
  return value.replace(/\s+/g, "");
}

function isLikelyValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
