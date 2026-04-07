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
  workoutFilter: "all",
  selectedChatId: "c1",
  workouts: [
    { id: "w1", title: "تمرين الصدر والتراي", day: "الأحد", durationMin: 60, intensity: "عالية", done: true, focus: "strength" },
    { id: "w2", title: "تمرين الظهر والباي", day: "الاثنين", durationMin: 65, intensity: "عالية", done: true, focus: "strength" },
    { id: "w3", title: "كارديو ولياقة", day: "الثلاثاء", durationMin: 45, intensity: "متوسطة", done: false, focus: "fat-loss" },
    { id: "w4", title: "تمارين الأرجل", day: "الأربعاء", durationMin: 70, intensity: "عالية", done: false, focus: "strength" },
    { id: "w5", title: "تثبيت الجذع والمرونة", day: "الخميس", durationMin: 40, intensity: "متوسطة", done: false, focus: "fitness" }
  ],
  meals: [
    { id: "m1", title: "توست أفوكادو وبيض", kcal: 320, protein: 24, carbs: 28, fat: 14, time: "08:00 ص" },
    { id: "m2", title: "سلطة سلمون مشوي", kcal: 450, protein: 38, carbs: 22, fat: 20, time: "01:00 م" },
    { id: "m3", title: "زبادي يوناني وتوت", kcal: 180, protein: 14, carbs: 16, fat: 6, time: "04:00 م" },
    { id: "m4", title: "دجاج مع خضار مشوية", kcal: 410, protein: 42, carbs: 21, fat: 15, time: "08:30 م" }
  ],
  chats: [
    { id: "c1", name: "فريق الدعم المتكامل", role: "فريق متكامل", msg: "شكل اليوم جميل، تقدم رائع", unread: 2 },
    { id: "c2", name: "سارة منير", role: "تغذية", msg: "أرسلي صورة الوجبة بعد التعديل", unread: 0 },
    { id: "c3", name: "د. يثنى", role: "علاج طبيعي", msg: "كيف استجابة الركبة بعد التمرين؟", unread: 0 },
    { id: "c4", name: "كابتن خالد", role: "مدرب بدني", msg: "غداً نرفع الحمل بنسبة 5%", unread: 1 }
  ],
  chatThreads: {
    c1: [
      { by: "team", text: "صباح الخير، خلصنا مراجعة بياناتك لليوم." },
      { by: "user", text: "ممتاز، أبغى أركز على التحمل هذا الأسبوع." }
    ],
    c2: [
      { by: "team", text: "أرسلي وجبة العشاء قبل النوم بساعتين." }
    ],
    c3: [
      { by: "team", text: "في ألم عند النزول؟ إذا نعم خفف القرفصاء." }
    ],
    c4: [
      { by: "team", text: "اليوم عندك HIIT 45 دقيقة، جاهز؟" }
    ]
  },
  communityFeed: [
    { id: "f1", title: "تحدي 8 آلاف خطوة", body: "86 عضو وصلوا الهدف اليوم. شارك خطوتك الأخيرة قبل منتصف الليل.", meta: "نشاط المجتمع" },
    { id: "f2", title: "إنجاز جديد", body: "محمد أنجز 6 أيام متتالية تدريب والتزام غذائي كامل.", meta: "فريق التدريب" },
    { id: "f3", title: "نصيحة علاج طبيعي", body: "تمارين الإطالة الخلفية بعد التمرين تقلل شد أسفل الظهر بشكل واضح.", meta: "الاستشفاء" }
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
  bindWorkoutFilters();
  bindCommunitySwitch();
  bindChatActions();
  bindTabJumpButtons();
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
      activateTab(target, tabButtons, screens);
    });
  });
}

function bindTabJumpButtons() {
  const jumpButtons = Array.from(document.querySelectorAll("[data-tab-jump]"));
  jumpButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-tab-jump");
      const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
      const screens = Array.from(document.querySelectorAll(".screen"));
      activateTab(target, tabButtons, screens);
    });
  });
}

function activateTab(target, tabButtons, screens) {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-tab") === target));
  screens.forEach((screen) => {
    const isTarget = screen.getAttribute("data-screen") === target;
    screen.classList.toggle("active", isTarget);
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

function bindWorkoutFilters() {
  const container = document.getElementById("workoutFilters");
  if (!container) return;

  renderWorkoutFilters();

  if (container.getAttribute("data-bound") === "true") {
    return;
  }
  container.setAttribute("data-bound", "true");

  container.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("[data-filter-id]")) return;

    const nextFilter = target.getAttribute("data-filter-id") || "all";
    state.workoutFilter = nextFilter;
    renderWorkoutFilters();
    renderWorkoutLibrary();
  });
}

function renderWorkoutFilters() {
  const container = document.getElementById("workoutFilters");
  if (!container) return;

  const filters = [
    { id: "all", label: "الكل" },
    { id: "strength", label: "قوة" },
    { id: "fat-loss", label: "حرق دهون" },
    { id: "fitness", label: "لياقة" }
  ];

  container.innerHTML = filters
    .map(function (filter) {
      return '<button type="button" class="filter-chip' +
        (filter.id === state.workoutFilter ? " active" : "") +
        '" data-filter-id="' +
        filter.id +
        '">' +
        filter.label +
        "</button>";
    })
    .join("");
}

function bindCommunitySwitch() {
  const buttons = Array.from(document.querySelectorAll(".switch-btn"));
  const panels = Array.from(document.querySelectorAll(".community-view"));

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-community-view");
      buttons.forEach((btn) => btn.classList.toggle("active", btn === button));
      panels.forEach((panel) => panel.classList.toggle("active", panel.getAttribute("data-community-panel") === target));
    });
  });
}

function bindChatActions() {
  const list = document.getElementById("chatList");
  const composeForm = document.getElementById("chatComposeForm");

  if (list) {
    list.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const item = target.closest("[data-chat-id]");
      if (!item) return;
      const id = item.getAttribute("data-chat-id");
      if (!id) return;
      state.selectedChatId = id;
      renderChats();
      renderChatThread();
    });
  }

  if (composeForm) {
    composeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = composeForm.querySelector("input[name='message']");
      if (!(input instanceof HTMLInputElement)) return;
      const text = input.value.trim();
      if (!text) return;

      if (!state.chatThreads[state.selectedChatId]) {
        state.chatThreads[state.selectedChatId] = [];
      }
      state.chatThreads[state.selectedChatId].push({ by: "user", text: text });
      input.value = "";
      renderChatThread();
    });
  }
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
  renderCommunityHighlights();
  renderWeeklyPlan();
  renderWorkoutLibrary();
  renderMeals();
  renderLatestInjury();
  renderCommunityFeed();
  renderChats();
  renderChatThread();
  renderDevices();
}

function renderDashboard() {
  const readinessValue = document.getElementById("readinessValue");
  const planVersionBadge = document.getElementById("planVersionBadge");
  const challengeBadge = document.getElementById("challengeBadge");
  const featuredWorkout = document.getElementById("featuredWorkout");
  const goalProgressBar = document.getElementById("goalProgressBar");

  if (readinessValue) readinessValue.textContent = "75%";
  if (planVersionBadge) planVersionBadge.textContent = "خطة " + (state.config.workoutPlanVersion || "v2.4");
  if (challengeBadge) challengeBadge.textContent = state.config.challengesEnabled ? "التحديات مفعلة" : "التحديات متوقفة";
  if (goalProgressBar) goalProgressBar.style.width = "75%";

  if (featuredWorkout) {
    featuredWorkout.innerHTML =
      '<div class="item-row">' +
      '<div>' +
      '<p class="item-title">' + escapeHtml(state.config.featuredWorkoutTitle || "HIIT لكامل الجسم") + "</p>" +
      '<p class="item-sub">' +
      escapeHtml((state.config.featuredWorkoutDurationMin || 45) + " دقيقة") +
      "</p>" +
      '<p class="item-meta">' +
      "<span>المدرب: " + escapeHtml(state.config.featuredWorkoutCoach || "كابتن خالد") + "</span>" +
      "<span>تحديث: " + escapeHtml(state.config.workoutPlanVersion || "v2.4") + "</span>" +
      "</p>" +
      "</div>" +
      '<span class="badge">فيديو</span>' +
      "</div>";
  }
}

function renderCommunityHighlights() {
  const highlights = document.getElementById("communityHighlights");
  if (!highlights) return;

  highlights.innerHTML = state.communityFeed
    .slice(0, 2)
    .map(function (item) {
      return (
        '<article class="highlight-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + escapeHtml(item.meta) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(item.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(item.body) + "</p>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");
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

  const visibleWorkouts = state.workoutFilter === "all"
    ? state.workouts
    : state.workouts.filter((workout) => workout.focus === state.workoutFilter);

  workoutLibrary.innerHTML = visibleWorkouts
    .map(function (workout) {
      return (
        '<article class="workout-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + escapeHtml(workout.intensity) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(workout.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(workout.day + " • " + workout.durationMin + " دقيقة") + "</p>" +
        '<p class="item-meta"><span>فيديو تدريبي</span><span>' + (workout.done ? "أنهيته" : "ابدأ") + "</span></p>" +
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
  const macroGrid = document.getElementById("macroGrid");
  const todayCalories = document.getElementById("todayCalories");

  if (nutritionVersion) {
    nutritionVersion.textContent = state.config.nutritionPlanVersion || "v1.9";
  }

  const totals = state.meals.reduce(
    function (acc, meal) {
      acc.kcal += meal.kcal;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (todayCalories) {
    todayCalories.textContent = totals.kcal + " سعرة";
  }

  if (macroGrid) {
    macroGrid.innerHTML =
      '<article><strong>' + totals.protein + 'ج</strong><span>بروتين</span></article>' +
      '<article><strong>' + totals.carbs + 'ج</strong><span>كارب</span></article>' +
      '<article><strong>' + totals.fat + 'ج</strong><span>دهون</span></article>';
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
        '<p class="item-meta"><span>بروتين " + meal.protein + "ج</span><span>كارب " + meal.carbs + "ج</span><span>دهون " + meal.fat + "ج</span></p>" +
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

  const severityText = state.latestInjury.severity === 1 ? "خفيفة" : state.latestInjury.severity === 2 ? "متوسطة" : "عالية";

  latestInjuryCard.innerHTML =
    "<h3>تم الإبلاغ عن إصابة نشطة</h3>" +
    '<p class="item-sub">' +
    escapeHtml(
      state.latestInjury.area +
        " (" + severityText + ") • " +
        state.latestInjury.note
    ) +
    "</p>";
}

function renderCommunityFeed() {
  const feed = document.getElementById("communityFeed");
  if (!feed) return;

  feed.innerHTML = state.communityFeed
    .map(function (item) {
      return (
        '<article class="feed-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + escapeHtml(item.meta) + "</span>" +
        '<h4 class="item-title">' + escapeHtml(item.title) + "</h4>" +
        "</div>" +
        '<p>' + escapeHtml(item.body) + "</p>" +
        '<div class="item-meta"><span>+18 تفاعل</span><span>#MOVE_community</span></div>' +
        "</article>"
      );
    })
    .join("");
}

function renderChats() {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  chatList.innerHTML = state.chats
    .map(function (chat) {
      return (
        '<article class="chat-item' + (chat.id === state.selectedChatId ? " active" : "") + '" data-chat-id="' + chat.id + '">' +
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

function renderChatThread() {
  const title = document.getElementById("chatThreadTitle");
  const threadContainer = document.getElementById("chatThreadMessages");
  if (!title || !threadContainer) return;

  const chat = state.chats.find((item) => item.id === state.selectedChatId) || state.chats[0];
  const messages = state.chatThreads[chat.id] || [];

  title.textContent = chat.name;
  threadContainer.innerHTML = messages
    .map(function (message) {
      return '<div class="chat-bubble ' + (message.by === "user" ? "user" : "team") + '">' + escapeHtml(message.text) + "</div>";
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
