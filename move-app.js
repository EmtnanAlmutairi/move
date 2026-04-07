import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db, initializeAnalytics } from "./firebase-client.js";

initializeAnalytics();

const fallbackConfig = {
  workoutPlanVersion: "v2.4",
  nutritionPlanVersion: "v1.9",
  challengesEnabled: true,
  featuredWorkoutTitle: "HIIT لكامل الجسم",
  featuredWorkoutDurationMin: 45,
  featuredWorkoutCoach: "كابتن خالد"
};

const fallbackWorkouts = [
  { id: "w1", title: "تمرين الصدر والتراي", day: "الأحد", durationMin: 60, intensity: "عالية", focus: "strength", coachName: "كابتن خالد", videoUrl: "" },
  { id: "w2", title: "كارديو ولياقة", day: "الاثنين", durationMin: 45, intensity: "متوسطة", focus: "fat-loss", coachName: "كابتن خالد", videoUrl: "" },
  { id: "w3", title: "تثبيت الجذع والمرونة", day: "الثلاثاء", durationMin: 40, intensity: "متوسطة", focus: "fitness", coachName: "د. يثنى", videoUrl: "" }
];

const fallbackMeals = [
  { id: "m1", title: "توست أفوكادو وبيض", kcal: 320, protein: 24, carbs: 28, fat: 14, time: "08:00 ص" },
  { id: "m2", title: "سلطة سلمون مشوي", kcal: 450, protein: 38, carbs: 22, fat: 20, time: "01:00 م" },
  { id: "m3", title: "زبادي يوناني وتوت", kcal: 180, protein: 14, carbs: 16, fat: 6, time: "04:00 م" }
];

const fallbackFeed = [
  { id: "f1", title: "تحدي 8 آلاف خطوة", body: "شارك إنجازك اليومي مع المجتمع.", meta: "نشاط المجتمع" },
  { id: "f2", title: "نصيحة تغذوية", body: "حافظ على البروتين في أول وجبة بعد التمرين.", meta: "فريق التغذية" }
];

const state = {
  config: fallbackConfig,
  userUid: null,
  workoutFilter: "all",
  workoutSearch: "",
  workouts: fallbackWorkouts,
  meals: fallbackMeals,
  communityFeed: fallbackFeed,
  latestInjury: null,
  devices: [
    { id: "d1", name: "Apple Health", status: "غير متصل" },
    { id: "d2", name: "Google Fit", status: "غير متصل" },
    { id: "d3", name: "Garmin Connect", status: "غير متصل" }
  ],
  supportMessages: [],
  unreadCoachMessages: 0,
  lastUnreadCoachMessages: 0,
  supportUnsubscribe: null
};

window.addEventListener("DOMContentLoaded", init);

async function init() {
  showAppNotice("جاري تحميل بياناتك الصحية...");
  setTodayLabel();
  bindTabs();
  bindOnboarding();
  bindInjuryForm();
  bindWorkoutFilters();
  bindWorkoutSearch();
  bindCommunitySwitch();
  bindChatActions();
  bindTabJumpButtons();
  bindWorkoutToggles();
  renderAll();

  await ensureMemberSession();

  await Promise.all([
    loadConfig(),
    loadLatestInjuryFromFirestore(),
    loadWorkouts(),
    loadMeals(),
    loadCommunityFeed()
  ]);

  requestNotificationPermissionIfNeeded();
  startSupportMessagesListener();
  restoreLastTab();
  showAppNotice("");
  renderAll();
}

async function ensureMemberSession() {
  if (auth.currentUser) {
    state.userUid = auth.currentUser.uid;
    return;
  }

  await signInAnonymously(auth).catch(function (error) {
    console.error("Anonymous auth failed", error);
  });

  state.userUid = auth.currentUser ? auth.currentUser.uid : null;

  if (!state.userUid) {
    await new Promise(function (resolve) {
      const unsubscribe = onAuthStateChanged(auth, function (user) {
        if (user) {
          state.userUid = user.uid;
          unsubscribe();
          resolve();
        }
      });
      setTimeout(resolve, 1200);
    });
  }
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
      localStorage.setItem("moveLastTab", String(target || "home"));
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
  if (!target) return;
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-tab") === target));
  screens.forEach((screen) => {
    const isTarget = screen.getAttribute("data-screen") === target;
    screen.classList.toggle("active", isTarget);
  });
}

function restoreLastTab() {
  const lastTab = localStorage.getItem("moveLastTab");
  if (!lastTab) return;
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const screens = Array.from(document.querySelectorAll(".screen"));
  activateTab(lastTab, tabButtons, screens);
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
      memberUid: state.userUid || "anon",
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
          planId: payload.planId,
          memberUid: payload.memberUid
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
      memberUid: state.userUid || "anon",
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

function bindWorkoutSearch() {
  const input = document.getElementById("workoutSearchInput");
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener("input", function () {
    state.workoutSearch = input.value.trim().toLowerCase();
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
  const composeForm = document.getElementById("chatComposeForm");
  const markReadBtn = document.getElementById("markChatReadBtn");
  if (!composeForm) return;

  composeForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const input = composeForm.querySelector("input[name='message']");
    if (!(input instanceof HTMLInputElement)) return;

    const text = input.value.trim();
    if (!text) return;

    const profile = getProfileFromStorage();

    try {
      await addDoc(collection(db, "supportMessages"), {
        threadId: state.userUid || "anon",
        senderRole: "member",
        senderName: profile.fullName || "مشترك MOVE",
        text: text,
        source: "move-web-mvp",
        createdAt: serverTimestamp()
      });
      input.value = "";
    } catch (error) {
      console.error("Failed to send support message", error);
    }
  });

  if (markReadBtn) {
    markReadBtn.addEventListener("click", function () {
      markSupportAsRead();
    });
  }
}

function bindWorkoutToggles() {
  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const trigger = target.closest("[data-workout-toggle]");
    if (!trigger) return;

    const workoutId = trigger.getAttribute("data-workout-toggle");
    if (!workoutId) return;

    const doneMap = readWorkoutDoneMap();
    doneMap[workoutId] = !doneMap[workoutId];
    writeWorkoutDoneMap(doneMap);
    renderWeeklyPlan();
    renderWorkoutLibrary();
  });
}

function startSupportMessagesListener() {
  if (!state.userUid) return;

  if (typeof state.supportUnsubscribe === "function") {
    state.supportUnsubscribe();
  }

  const supportQuery = query(
    collection(db, "supportMessages"),
    where("threadId", "==", state.userUid),
    limit(120)
  );

  state.supportUnsubscribe = onSnapshot(
    supportQuery,
    function (snapshot) {
      const all = snapshot.docs.map(function (entry) {
        return Object.assign({ id: entry.id }, entry.data());
      });

      state.supportMessages = all
        .filter(function (message) {
          return message.threadId === state.userUid;
        })
        .sort(function (a, b) {
          return toMillis(a.createdAt) - toMillis(b.createdAt);
        });

      updateUnreadNotifications();
      renderChats();
      renderChatThread();
    },
    function (error) {
      console.error("Failed to listen to support messages", error);
    }
  );
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
  if (!state.userUid) return;

  try {
    const injuryQuery = query(
      collection(db, "injuryReports"),
      where("memberUid", "==", state.userUid),
      limit(20)
    );
    const snapshot = await getDocs(injuryQuery);
    if (!snapshot.empty) {
      const data = snapshot.docs
        .map(function (entry) {
          return entry.data();
        })
        .sort(function (a, b) {
          return toMillis(b.createdAt) - toMillis(a.createdAt);
        })[0];
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

async function loadWorkouts() {
  if (!state.userUid) return;
  try {
    const workoutsQuery = query(
      collection(db, "workoutVideos"),
      where("memberUid", "==", state.userUid),
      limit(60)
    );
    const snapshot = await getDocs(workoutsQuery);

    if (!snapshot.empty) {
      state.workouts = snapshot.docs.map(function (entry) {
        const data = entry.data();
        return {
          id: entry.id,
          title: data.title || "تمرين",
          day: data.day || "-",
          durationMin: Number(data.durationMin || 30),
          intensity: data.intensity || "متوسطة",
          focus: data.focus || "fitness",
          coachName: data.coachName || "Coach",
          memberUid: data.memberUid || "",
          sortOrder: Number(data.sortOrder || 0),
          videoUrl: data.videoUrl || "",
          instructions: data.instructions || ""
        };
      }).sort(function (a, b) {
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
    } else {
      state.workouts = fallbackWorkouts.slice();
    }
  } catch (error) {
    console.error("Failed to load workouts", error);
    showAppNotice("تعذر تحميل التمارين حالياً. نعرض النسخة المحفوظة.");
  }
}

async function loadMeals() {
  if (!state.userUid) return;
  try {
    const mealsQuery = query(
      collection(db, "nutritionMeals"),
      where("memberUid", "==", state.userUid),
      limit(60)
    );
    const snapshot = await getDocs(mealsQuery);

    if (!snapshot.empty) {
      state.meals = snapshot.docs.map(function (entry) {
        const data = entry.data();
        return {
          id: entry.id,
          title: data.title || "وجبة",
          kcal: Number(data.kcal || 0),
          protein: Number(data.protein || 0),
          carbs: Number(data.carbs || 0),
          fat: Number(data.fat || 0),
          memberUid: data.memberUid || "",
          sortOrder: Number(data.sortOrder || 0),
          time: data.time || "--:--"
        };
      }).sort(function (a, b) {
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
    } else {
      state.meals = fallbackMeals.slice();
    }
  } catch (error) {
    console.error("Failed to load meals", error);
    showAppNotice("تعذر تحميل جدول التغذية حالياً.");
  }
}

async function loadCommunityFeed() {
  try {
    const feedQuery = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(feedQuery);

    if (!snapshot.empty) {
      state.communityFeed = snapshot.docs.map(function (entry) {
        const data = entry.data();
        return {
          id: entry.id,
          title: data.title || "منشور",
          body: data.body || "",
          meta: data.authorRole || "المجتمع"
        };
      });
    }
  } catch (error) {
    console.error("Failed to load community feed", error);
    showAppNotice("تعذر تحميل المجتمع الصحي حالياً.");
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

  const progress = calculateProgressPercent();

  if (readinessValue) readinessValue.textContent = progress + "%";
  if (planVersionBadge) planVersionBadge.textContent = "خطة " + (state.config.workoutPlanVersion || "v2.4");
  if (challengeBadge) challengeBadge.textContent = state.config.challengesEnabled ? "التحديات مفعلة" : "التحديات متوقفة";
  if (goalProgressBar) goalProgressBar.style.width = progress + "%";

  const featured = state.workouts[0];

  if (featuredWorkout && featured) {
    featuredWorkout.innerHTML =
      '<div class="item-row">' +
      '<div>' +
      '<p class="item-title">' + escapeHtml(featured.title) + "</p>" +
      '<p class="item-sub">' +
      escapeHtml(featured.durationMin + " دقيقة") +
      "</p>" +
      '<p class="item-meta">' +
      "<span>المدرب: " + escapeHtml(featured.coachName || state.config.featuredWorkoutCoach || "كابتن خالد") + "</span>" +
      "<span>تحديث: " + escapeHtml(state.config.workoutPlanVersion || "v2.4") + "</span>" +
      "</p>" +
      "</div>" +
      (featured.videoUrl ? '<a class="badge video-link" target="_blank" rel="noopener noreferrer" href="' + escapeHtml(featured.videoUrl) + '">فتح الفيديو</a>' : '<span class="badge">فيديو قريباً</span>') +
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

  const doneMap = readWorkoutDoneMap();
  const doneCount = state.workouts.filter(function (item) {
    return Boolean(doneMap[item.id]);
  }).length;

  weeklyProgress.textContent = doneCount + " من " + state.workouts.length;

  weeklyList.innerHTML = state.workouts
    .map(function (workout) {
      const done = Boolean(doneMap[workout.id]);

      return (
        '<article class="plan-item">' +
        '<div class="item-row">' +
        '<button class="badge toggle-done" data-workout-toggle="' + workout.id + '">' + (done ? "مكتمل" : "تحديد كمكتمل") + "</button>" +
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

  const doneMap = readWorkoutDoneMap();

  const byFilter = state.workoutFilter === "all"
    ? state.workouts
    : state.workouts.filter((workout) => workout.focus === state.workoutFilter);

  const visibleWorkouts = state.workoutSearch
    ? byFilter.filter(function (workout) {
        const hay = (workout.title + " " + workout.day + " " + workout.coachName).toLowerCase();
        return hay.includes(state.workoutSearch);
      })
    : byFilter;

  if (!visibleWorkouts.length) {
    workoutLibrary.innerHTML = '<article class="workout-item"><p class="item-sub">لا توجد نتائج مطابقة.</p></article>';
    return;
  }

  workoutLibrary.innerHTML = visibleWorkouts
    .map(function (workout) {
      const done = Boolean(doneMap[workout.id]);
      const media = workout.videoUrl
        ? '<a class="video-link" target="_blank" rel="noopener noreferrer" href="' + escapeHtml(workout.videoUrl) + '">مشاهدة فيديو المدرب</a>'
        : '<span class="muted">سيتم إضافة الفيديو من لوحة المدرب</span>';

      return (
        '<article class="workout-item">' +
        '<div class="item-row">' +
        '<span class="badge">' + escapeHtml(workout.intensity) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(workout.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(workout.day + " • " + workout.durationMin + " دقيقة") + "</p>" +
        '<p class="item-meta"><span>المدرب: ' + escapeHtml(workout.coachName || "Coach") + '</span><span>' + (done ? "مكتمل" : "قيد التنفيذ") + "</span></p>" +
        '<p class="item-sub">' + escapeHtml(workout.instructions || "") + "</p>" +
        media +
        "</div>" +
        "</div>" +
        '<button class="ghost-btn mini" type="button" data-workout-toggle="' + workout.id + '">' + (done ? "إلغاء الاكتمال" : "تحديد كمكتمل") + "</button>" +
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
        '<div class="item-meta"><span>#MOVE_community</span></div>' +
        "</article>"
      );
    })
    .join("");
}

function renderChats() {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  const lastMessage = state.supportMessages.length ? state.supportMessages[state.supportMessages.length - 1] : null;

  chatList.innerHTML =
    '<article class="chat-item active">' +
    '<div class="item-row">' +
    '<span class="badge">' + (state.unreadCoachMessages > 0 ? state.unreadCoachMessages + " جديد" : "دعم MOVE") + "</span>" +
    '<div>' +
    '<p class="item-title">فريق الدعم المتكامل</p>' +
    '<p class="item-sub">' + escapeHtml(lastMessage ? lastMessage.text : "ابدأ محادثتك مع الفريق") + "</p>" +
    "</div>" +
    "</div>" +
    "</article>";
}

function renderChatThread() {
  const title = document.getElementById("chatThreadTitle");
  const threadContainer = document.getElementById("chatThreadMessages");
  if (!title || !threadContainer) return;

  title.textContent = "فريق الدعم المتكامل";

  if (!state.supportMessages.length) {
    threadContainer.innerHTML = '<div class="chat-bubble team">أهلاً بك، اكتب رسالتك لنساعدك في التدريب والتغذية.</div>';
    return;
  }

  threadContainer.innerHTML = state.supportMessages
    .map(function (message) {
      return '<div class="chat-bubble ' + (message.senderRole === "member" ? "user" : "team") + '">' + escapeHtml(message.text || "") + "</div>";
    })
    .join("");
  threadContainer.scrollTop = threadContainer.scrollHeight;
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

function readWorkoutDoneMap() {
  try {
    const raw = localStorage.getItem("moveWorkoutDoneMap");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeWorkoutDoneMap(doneMap) {
  localStorage.setItem("moveWorkoutDoneMap", JSON.stringify(doneMap));
}

function calculateProgressPercent() {
  const doneMap = readWorkoutDoneMap();
  if (!state.workouts.length) return 0;
  const doneCount = state.workouts.filter(function (item) {
    return Boolean(doneMap[item.id]);
  }).length;
  return Math.min(100, Math.round((doneCount / state.workouts.length) * 100));
}

function getProfileFromStorage() {
  try {
    const raw = localStorage.getItem("moveSubscriptionProfile");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getLastSeenSupportAt() {
  const raw = localStorage.getItem("moveLastSeenSupportAt");
  const value = Number(raw || 0);
  return Number.isFinite(value) ? value : 0;
}

function setLastSeenSupportAt(value) {
  localStorage.setItem("moveLastSeenSupportAt", String(value));
}

function markSupportAsRead() {
  const lastMessage = state.supportMessages.length
    ? state.supportMessages[state.supportMessages.length - 1]
    : null;

  if (lastMessage) {
    setLastSeenSupportAt(toMillis(lastMessage.createdAt));
  } else {
    setLastSeenSupportAt(Date.now());
  }

  updateUnreadNotifications();
  renderChats();
}

function updateUnreadNotifications() {
  const navCommunityBadge = document.getElementById("navCommunityBadge");
  const lastSeen = getLastSeenSupportAt();

  state.unreadCoachMessages = state.supportMessages.filter(function (message) {
    return message.senderRole === "coach" && toMillis(message.createdAt) > lastSeen;
  }).length;

  if (navCommunityBadge) {
    if (state.unreadCoachMessages > 0) {
      navCommunityBadge.textContent = String(state.unreadCoachMessages);
      navCommunityBadge.classList.remove("hidden");
      document.title = "(" + state.unreadCoachMessages + ") MOVE";
    } else {
      navCommunityBadge.classList.add("hidden");
      document.title = "MOVE App MVP";
    }
  }

  if (
    state.unreadCoachMessages > state.lastUnreadCoachMessages &&
    document.hidden &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification("MOVE", {
      body: "لديك رسالة جديدة من فريقك الصحي.",
      silent: true
    });
  }

  state.lastUnreadCoachMessages = state.unreadCoachMessages;
}

function requestNotificationPermissionIfNeeded() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  Notification.requestPermission().catch(function () {
    return null;
  });
}

function showAppNotice(message) {
  const notice = document.getElementById("appNotice");
  if (!notice) return;
  if (!message) {
    notice.classList.add("hidden");
    notice.textContent = "";
    return;
  }
  notice.classList.remove("hidden");
  notice.textContent = message;
}

function toMillis(timestampValue) {
  if (!timestampValue) return 0;
  if (typeof timestampValue.toMillis === "function") return timestampValue.toMillis();
  if (typeof timestampValue.seconds === "number") return timestampValue.seconds * 1000;
  return 0;
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
