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
  setDoc,
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

const WEEK_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const state = {
  config: fallbackConfig,
  userUid: null,
  existingSubscription: null,
  profile: {
    fullName: "",
    email: "",
    phone: "",
    goal: "fitness",
    reminderTime: "",
    preferredDays: []
  },
  scheduleOverrides: {},
  orderedWorkoutIds: [],
  dragWorkoutId: "",
  memberTeam: {
    coachName: "سيتم التعيين قريباً",
    nutritionName: "سيتم التعيين قريباً",
    physioName: "سيتم التعيين قريباً"
  },
  chatTargetRole: "coach",
  workoutFilter: "all",
  workoutSearch: "",
  workouts: fallbackWorkouts,
  meals: fallbackMeals,
  communityFeed: fallbackFeed,
  latestInjury: null,
  latestInjuryFollowup: null,
  devices: [
    { id: "d1", name: "Apple Health", status: "غير متصل" },
    { id: "d2", name: "Google Fit", status: "غير متصل" },
    { id: "d3", name: "Garmin Connect", status: "غير متصل" }
  ],
  supportMessages: [],
  unreadCoachMessages: 0,
  lastUnreadCoachMessages: 0,
  supportUnsubscribe: null,
  reminderIntervalId: null
};

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("beforeunload", function () {
  if (state.reminderIntervalId) {
    clearInterval(state.reminderIntervalId);
  }
});

async function init() {
  showAppNotice("جاري تحميل بياناتك الصحية...");
  setTodayLabel();
  bindTabs();
  bindOnboarding();
  bindInjuryForm();
  bindWorkoutFilters();
  bindWorkoutSearch();
  bindCommunitySwitch();
  bindChatRoleSwitch();
  bindChatActions();
  bindProfileActions();
  bindTabJumpButtons();
  bindWorkoutToggles();
  initRunningTracker();
  renderAll();

  await ensureMemberSession();

  await Promise.all([
    loadConfig(),
    loadExistingSubscription(),
    loadMemberProfile(),
    loadMemberSchedule(),
    loadMemberTeam(),
    loadLatestInjuryFromFirestore(),
    loadLatestInjuryFollowupFromFirestore(),
    loadWorkouts(),
    loadMeals(),
    loadCommunityFeed()
  ]);

  requestNotificationPermissionIfNeeded();
  startProfileReminderLoop();
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
    hydrateOnboardingForm(form);
    modal.showModal();
  });

  if (!localStorage.getItem("moveSubscriptionProfile")) {
    hydrateOnboardingForm(form);
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
      if (state.existingSubscription) {
        const before = state.existingSubscription;
        await addDoc(collection(db, "supportMessages"), {
          threadId: state.userUid || "anon",
          senderRole: "member",
          targetRole: "coach",
          senderName: payload.fullName || "مشترك MOVE",
          text:
            "طلب تعديل بيانات الاشتراك: " +
            "الهدف (" + (before.goal || "-") + " -> " + payload.goal + ")، " +
            "الخطة (" + (before.planId || "-") + " -> " + payload.planId + ")، " +
            "الجوال (" + (before.phone || "-") + " -> " + payload.phone + ").",
          source: "move-web-mvp",
          createdAt: serverTimestamp()
        });
        state.existingSubscription = Object.assign({}, state.existingSubscription, {
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          goal: payload.goal,
          planId: payload.planId
        });
        localStorage.setItem(
          "moveSubscriptionProfile",
          JSON.stringify({
            fullName: payload.fullName,
            goal: payload.goal,
            planId: payload.planId,
            memberUid: payload.memberUid
          })
        );
        message.textContent = "تم إرسال طلب التعديل للفريق المختص.";
        setTimeout(function () {
          modal.close();
        }, 700);
        return;
      }

      await addDoc(collection(db, "subscriptions"), payload);
      state.existingSubscription = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        goal: payload.goal,
        planId: payload.planId,
        memberUid: payload.memberUid
      };
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

function hydrateOnboardingForm(form) {
  if (!form) return;
  const profile = getProfileFromStorage();
  const source = state.existingSubscription || profile || {};
  if (form.fullName) form.fullName.value = source.fullName || "";
  if (form.email) form.email.value = source.email || "";
  if (form.phone) form.phone.value = source.phone || "";
  if (form.goal) form.goal.value = source.goal || "muscle-gain";
  if (form.planId) form.planId.value = source.planId || "move-plus";
}

async function loadExistingSubscription() {
  if (!state.userUid) return;

  try {
    const subsQuery = query(
      collection(db, "subscriptions"),
      where("memberUid", "==", state.userUid),
      limit(1)
    );
    const snapshot = await getDocs(subsQuery);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      state.existingSubscription = {
        id: snapshot.docs[0].id,
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        goal: data.goal || "",
        planId: data.planId || "",
        memberUid: data.memberUid || state.userUid
      };
      localStorage.setItem(
        "moveSubscriptionProfile",
        JSON.stringify({
          fullName: state.existingSubscription.fullName,
          email: state.existingSubscription.email,
          phone: state.existingSubscription.phone,
          goal: state.existingSubscription.goal,
          planId: state.existingSubscription.planId,
          memberUid: state.userUid
        })
      );
    }
  } catch (error) {
    console.error("Failed to load existing subscription", error);
  }
}

async function loadMemberProfile() {
  if (!state.userUid) return;
  try {
    const snap = await getDoc(doc(db, "memberProfiles", state.userUid));
    if (snap.exists()) {
      const data = snap.data();
      state.profile = {
        fullName: String(data.fullName || ""),
        email: String(data.email || ""),
        phone: String(data.phone || ""),
        goal: String(data.goal || "fitness"),
        reminderTime: String(data.reminderTime || ""),
        preferredDays: Array.isArray(data.preferredDays) ? data.preferredDays.slice(0, 7) : []
      };
    } else {
      const source = state.existingSubscription || getProfileFromStorage();
      state.profile = {
        fullName: String(source.fullName || ""),
        email: String(source.email || ""),
        phone: String(source.phone || ""),
        goal: String(source.goal || "fitness"),
        reminderTime: "",
        preferredDays: []
      };
    }
  } catch (error) {
    console.error("Failed to load member profile", error);
  }
}

async function loadMemberSchedule() {
  if (!state.userUid) return;
  try {
    const snap = await getDoc(doc(db, "memberSchedules", state.userUid));
    if (!snap.exists()) return;
    const data = snap.data();
    const overrides = data && typeof data.overrides === "object" ? data.overrides : {};
    state.scheduleOverrides = Object.keys(overrides).reduce(function (acc, key) {
      const day = String(overrides[key] || "");
      if (WEEK_DAYS.includes(day)) {
        acc[key] = day;
      }
      return acc;
    }, {});
    state.orderedWorkoutIds = Array.isArray(data.orderedWorkoutIds)
      ? data.orderedWorkoutIds.map(function (item) { return String(item || ""); }).filter(Boolean)
      : [];
  } catch (error) {
    console.error("Failed to load member schedule", error);
  }
}

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!state.userUid) return;

  const form = event.currentTarget;
  const message = document.getElementById("profileMessage");
  const picker = document.getElementById("preferredDaysPicker");
  if (!picker) return;

  const preferredDays = Array.from(picker.querySelectorAll("input[type='checkbox']"))
    .filter(function (input) {
      return input instanceof HTMLInputElement && input.checked;
    })
    .map(function (input) {
      return input.value;
    })
    .filter(function (day) {
      return WEEK_DAYS.includes(day);
    });

  const nextProfile = {
    fullName: String(form.fullName.value || "").trim(),
    email: String(form.email.value || "").trim().toLowerCase(),
    phone: normalizePhone(String(form.phone.value || "")),
    goal: String(form.goal.value || "fitness"),
    reminderTime: String(form.reminderTime.value || ""),
    preferredDays: preferredDays
  };

  if (!nextProfile.fullName || !nextProfile.email || !nextProfile.phone) {
    if (message) message.textContent = "يرجى تعبئة جميع بيانات الملف.";
    return;
  }
  if (!isLikelyValidPhone(nextProfile.phone)) {
    if (message) message.textContent = "رقم الجوال غير صحيح.";
    return;
  }

  if (message) message.textContent = "جاري حفظ الملف...";
  try {
    await setDoc(doc(db, "memberProfiles", state.userUid), Object.assign({}, nextProfile, {
      memberUid: state.userUid,
      updatedAt: serverTimestamp()
    }), { merge: true });

    state.profile = nextProfile;
    localStorage.setItem("moveSubscriptionProfile", JSON.stringify(Object.assign({}, getProfileFromStorage(), nextProfile, {
      memberUid: state.userUid
    })));
    renderDashboard();
    renderMemberExperience();
    startProfileReminderLoop();
    if (message) message.textContent = "تم حفظ الملف بنجاح.";
  } catch (error) {
    console.error("Failed to save profile", error);
    if (message) message.textContent = "تعذر حفظ الملف حالياً.";
  }
}

async function persistMemberSchedule() {
  if (!state.userUid) return;
  try {
    await setDoc(doc(db, "memberSchedules", state.userUid), {
      memberUid: state.userUid,
      overrides: state.scheduleOverrides,
      orderedWorkoutIds: state.orderedWorkoutIds,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to persist schedule", error);
  }
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
    { id: "fitness", label: "لياقة" },
    { id: "pilates", label: "بيلاتس" },
    { id: "yoga", label: "يوغا" },
    { id: "running", label: "جري" },
    { id: "cardio", label: "كارديو" }
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

function bindChatRoleSwitch() {
  const container = document.getElementById("chatRoleSwitch");
  if (!container) return;

  container.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-chat-role]");
    if (!button) return;

    const role = String(button.getAttribute("data-chat-role") || "coach");
    state.chatTargetRole = role;
    renderChatRoleSwitch();
    renderChats();
    renderChatThread();
  });

  renderChatRoleSwitch();
}

function bindChatActions() {
  const composeForm = document.getElementById("chatComposeForm");
  const markReadBtn = document.getElementById("markChatReadBtn");
  const chatList = document.getElementById("chatList");
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
        targetRole: state.chatTargetRole,
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

  if (chatList) {
    chatList.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const item = target.closest("[data-chat-open-role]");
      if (!item) return;
      state.chatTargetRole = String(item.getAttribute("data-chat-open-role") || "coach");
      renderChatRoleSwitch();
      renderChats();
      renderChatThread();
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

function bindProfileActions() {
  const profileForm = document.getElementById("profileForm");
  const weeklyList = document.getElementById("weeklyList");
  const dropzones = document.getElementById("scheduleDropzones");

  if (profileForm) {
    profileForm.addEventListener("submit", onProfileSubmit);
  }

  if (weeklyList) {
    weeklyList.addEventListener("dragstart", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const card = target.closest("[data-workout-id]");
      if (!card) return;
      const workoutId = String(card.getAttribute("data-workout-id") || "");
      if (!workoutId) return;
      state.dragWorkoutId = workoutId;
      card.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", workoutId);
      }
    });

    weeklyList.addEventListener("dragend", function (event) {
      const target = event.target;
      if (target instanceof HTMLElement) {
        target.classList.remove("dragging");
      }
      state.dragWorkoutId = "";
    });
  }

  if (dropzones) {
    dropzones.addEventListener("dragover", function (event) {
      event.preventDefault();
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const zone = target.closest("[data-drop-day]");
      if (!zone) return;
      zone.classList.add("active-drop");
    });

    dropzones.addEventListener("dragleave", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const zone = target.closest("[data-drop-day]");
      if (!zone) return;
      zone.classList.remove("active-drop");
    });

    dropzones.addEventListener("drop", function (event) {
      event.preventDefault();
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const zone = target.closest("[data-drop-day]");
      if (!zone) return;
      zone.classList.remove("active-drop");

      const nextDay = String(zone.getAttribute("data-drop-day") || "");
      const workoutId = state.dragWorkoutId || (event.dataTransfer ? event.dataTransfer.getData("text/plain") : "");
      if (!workoutId || !WEEK_DAYS.includes(nextDay)) return;
      state.scheduleOverrides[workoutId] = nextDay;
      reorderWorkoutIds(workoutId);
      renderWeeklyPlan();
      renderWorkoutLibrary();
      persistMemberSchedule();
    });
  }
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

async function loadMemberTeam() {
  if (!state.userUid) return;

  try {
    const assignmentRef = doc(db, "memberAssignments", state.userUid);
    const assignmentSnap = await getDoc(assignmentRef);
    if (assignmentSnap.exists()) {
      const data = assignmentSnap.data();
      const coachName = String(data.assignedCoachName || "");
      const nutritionName = String(data.assignedNutritionName || "");
      const physioName = String(data.assignedPhysioName || "");
      const resolved = await Promise.all([
        coachName ? Promise.resolve(coachName) : resolvePractitionerName(data.assignedCoachUid),
        nutritionName ? Promise.resolve(nutritionName) : resolvePractitionerName(data.assignedNutritionUid),
        physioName ? Promise.resolve(physioName) : resolvePractitionerName(data.assignedPhysioUid)
      ]);
      state.memberTeam = {
        coachName: resolved[0] || "غير معيّن",
        nutritionName: resolved[1] || "غير معيّن",
        physioName: resolved[2] || "غير معيّن"
      };
      return;
    }
  } catch (error) {
    console.error("Failed to load member assignments", error);
  }

  try {
    const subsQuery = query(
      collection(db, "subscriptions"),
      where("memberUid", "==", state.userUid),
      limit(1)
    );
    const subsSnapshot = await getDocs(subsQuery);
    if (!subsSnapshot.empty) {
      const data = subsSnapshot.docs[0].data();
      state.memberTeam = {
        coachName: data.assignedCoachUid ? "مدرب معيّن" : "غير معيّن",
        nutritionName: data.assignedNutritionUid ? "أخصائي تغذية معيّن" : "غير معيّن",
        physioName: data.assignedPhysioUid ? "أخصائي علاج طبيعي معيّن" : "غير معيّن"
      };
    }
  } catch (error) {
    console.error("Failed to load fallback subscription team", error);
  }
}

async function resolvePractitionerName(uid) {
  const normalizedUid = String(uid || "");
  if (!normalizedUid) return "";
  try {
    const practitioner = await getDoc(doc(db, "practitioners", normalizedUid));
    if (practitioner.exists()) {
      const data = practitioner.data();
      return String(data.displayName || data.fullName || data.email || normalizedUid);
    }
    const coach = await getDoc(doc(db, "coaches", normalizedUid));
    if (coach.exists()) {
      const data = coach.data();
      return String(data.displayName || data.fullName || data.email || normalizedUid);
    }
  } catch (error) {
    console.error("Failed to resolve practitioner name", error);
  }
  return normalizedUid;
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

async function loadLatestInjuryFollowupFromFirestore() {
  if (!state.userUid) return;

  try {
    const followupQuery = query(
      collection(db, "injuryFollowups"),
      where("memberUid", "==", state.userUid),
      limit(20)
    );
    const snapshot = await getDocs(followupQuery);
    if (!snapshot.empty) {
      const latest = snapshot.docs
        .map(function (entry) {
          return entry.data();
        })
        .sort(function (a, b) {
          return toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt);
        })[0];
      state.latestInjuryFollowup = latest || null;
    } else {
      state.latestInjuryFollowup = null;
    }
  } catch (error) {
    console.error("Failed to load injury followup", error);
    state.latestInjuryFollowup = null;
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
  renderMemberTeam();
  renderMemberExperience();
  renderProfile();
  renderScheduleDropzones();
  renderCommunityHighlights();
  renderWeeklyPlan();
  renderWorkoutLibrary();
  renderMeals();
  renderLatestInjury();
  renderCommunityFeed();
  renderChatRoleSwitch();
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
  const memberGreeting = document.getElementById("memberGreeting");

  const progress = calculateProgressPercent();

  if (readinessValue) readinessValue.textContent = progress + "%";
  if (memberGreeting) {
    const fullName = state.profile.fullName || (state.existingSubscription && state.existingSubscription.fullName) || getProfileFromStorage().fullName || "";
    memberGreeting.textContent = fullName ? ("أهلاً " + fullName) : "رحلة صحية مخصصة";
  }
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

function renderMemberExperience() {
  const badge = document.getElementById("memberPlanBadge");
  const box = document.getElementById("memberExperienceSummary");
  if (!badge || !box) return;

  const profile = state.profile.fullName ? state.profile : (state.existingSubscription || getProfileFromStorage());
  const goalText = profile.goal ? goalLabel(profile.goal) : "غير محدد";
  const planText = profile.planId ? planLabel(profile.planId) : "غير مفعل";

  badge.textContent = planText;

  box.innerHTML =
    '<div class="exp-grid">' +
    '<article class="exp-chip"><strong>' + escapeHtml(goalText) + '</strong><span>الهدف</span></article>' +
    '<article class="exp-chip"><strong>' + escapeHtml(String(state.workouts.length)) + '</strong><span>تمارينك هذا الأسبوع</span></article>' +
    '<article class="exp-chip"><strong>' + escapeHtml(String(state.meals.length)) + '</strong><span>وجباتك اليومية</span></article>' +
    "</div>";
}

function renderProfile() {
  const form = document.getElementById("profileForm");
  const picker = document.getElementById("preferredDaysPicker");
  if (!form || !picker) return;

  form.fullName.value = state.profile.fullName || "";
  form.email.value = state.profile.email || "";
  form.phone.value = state.profile.phone || "";
  form.goal.value = state.profile.goal || "fitness";
  form.reminderTime.value = state.profile.reminderTime || "";

  Array.from(picker.querySelectorAll("input[type='checkbox']")).forEach(function (input) {
    if (!(input instanceof HTMLInputElement)) return;
    input.checked = state.profile.preferredDays.includes(input.value);
  });
}

function getEffectiveWorkoutDay(workout) {
  const overrideDay = state.scheduleOverrides[workout.id];
  if (overrideDay && WEEK_DAYS.includes(overrideDay)) return overrideDay;
  if (state.profile.preferredDays.length) {
    const ordered = getOrderedWorkouts(state.workouts);
    const idx = ordered.findIndex(function (item) { return item.id === workout.id; });
    if (idx >= 0) {
      return state.profile.preferredDays[idx % state.profile.preferredDays.length];
    }
  }
  if (WEEK_DAYS.includes(workout.day)) return workout.day;
  return "الأحد";
}

function getOrderedWorkouts(list) {
  const items = list.slice();
  if (!state.orderedWorkoutIds.length) return items;
  const rank = state.orderedWorkoutIds.reduce(function (acc, id, idx) {
    acc[id] = idx;
    return acc;
  }, {});
  return items.sort(function (a, b) {
    const ra = Number.isFinite(rank[a.id]) ? rank[a.id] : 9999;
    const rb = Number.isFinite(rank[b.id]) ? rank[b.id] : 9999;
    if (ra !== rb) return ra - rb;
    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });
}

function reorderWorkoutIds(workoutId) {
  const unique = Array.from(new Set(state.orderedWorkoutIds.concat(state.workouts.map(function (item) { return item.id; }))));
  if (!unique.includes(workoutId)) return;
  state.orderedWorkoutIds = unique.filter(function (id) { return id !== workoutId; });
  state.orderedWorkoutIds.unshift(workoutId);
}

function renderScheduleDropzones() {
  const container = document.getElementById("scheduleDropzones");
  if (!container) return;
  container.innerHTML = WEEK_DAYS.map(function (day) {
    return '<div class="schedule-zone" data-drop-day="' + day + '">اسحب التمرين إلى ' + day + "</div>";
  }).join("");
}

function renderMemberTeam() {
  const container = document.getElementById("memberTeamSummary");
  if (!container) return;

  container.innerHTML =
    '<div class="team-grid">' +
    '<article class="team-pill"><strong>المدرب</strong><span>' + escapeHtml(state.memberTeam.coachName || "غير معيّن") + "</span></article>" +
    '<article class="team-pill"><strong>التغذية</strong><span>' + escapeHtml(state.memberTeam.nutritionName || "غير معيّن") + "</span></article>" +
    '<article class="team-pill"><strong>العلاج الطبيعي</strong><span>' + escapeHtml(state.memberTeam.physioName || "غير معيّن") + "</span></article>" +
    "</div>";
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

  const orderedWorkouts = getOrderedWorkouts(state.workouts);
  const doneMap = readWorkoutDoneMap();
  const doneCount = orderedWorkouts.filter(function (item) {
    return Boolean(doneMap[item.id]);
  }).length;

  weeklyProgress.textContent = doneCount + " من " + orderedWorkouts.length;

  weeklyList.innerHTML = orderedWorkouts
    .map(function (workout) {
      const done = Boolean(doneMap[workout.id]);
      const effectiveDay = getEffectiveWorkoutDay(workout);

      return (
        '<article class="plan-item" draggable="true" data-workout-id="' + workout.id + '">' +
        '<div class="plan-row">' +
        '<button class="badge toggle-done" data-workout-toggle="' + workout.id + '">' + (done ? "مكتمل" : "تحديد كمكتمل") + "</button>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(workout.title) + "</p>" +
        '<p class="item-sub">' + escapeHtml(effectiveDay + " • " + workout.durationMin + " دقيقة • " + workout.intensity) + "</p>" +
        '<p class="item-meta"><span>اسحب البطاقة وحدد اليوم من الأعلى</span></p>' +
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
  const orderedWorkouts = getOrderedWorkouts(state.workouts);

  const byFilter = state.workoutFilter === "all"
    ? orderedWorkouts
    : orderedWorkouts.filter((workout) => workout.focus === state.workoutFilter);

  const visibleWorkouts = state.workoutSearch
    ? byFilter.filter(function (workout) {
        const hay = (workout.title + " " + getEffectiveWorkoutDay(workout) + " " + workout.coachName).toLowerCase();
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
        '<p class="item-sub">' + escapeHtml(getEffectiveWorkoutDay(workout) + " • " + workout.durationMin + " دقيقة") + "</p>" +
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
        '<p class="item-meta"><span>بروتين ' + escapeHtml(meal.protein + "ج") + '</span><span>كارب ' + escapeHtml(meal.carbs + "ج") + '</span><span>دهون ' + escapeHtml(meal.fat + "ج") + "</span></p>" +
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

  if (!state.latestInjury && !state.latestInjuryFollowup) {
    latestInjuryCard.innerHTML =
      "<h3>حالة الاستشفاء</h3>" + '<p class="muted">لا توجد بلاغات حديثة.</p>';
    return;
  }

  const injuryHtml = state.latestInjury
    ? '<p class="item-sub">' + escapeHtml(
      (state.latestInjury.area || "إصابة") +
      " (" + (state.latestInjury.severity === 1 ? "خفيفة" : state.latestInjury.severity === 2 ? "متوسطة" : "عالية") + ") • " +
      (state.latestInjury.note || "")
    ) + "</p>"
    : '<p class="item-sub">لا يوجد بلاغ إصابة جديد.</p>';

  const followup = state.latestInjuryFollowup;
  const followupHtml = followup
    ? '<p class="item-sub">' + escapeHtml("متابعة العلاج الطبيعي: " + (followup.plan || "")) + "</p>" +
      '<p class="item-sub">' + escapeHtml(
        "الحالة: " + followupStatusLabel(followup.status) +
        (followup.nextCheckDate ? " • المراجعة القادمة: " + followup.nextCheckDate : "")
      ) + "</p>"
    : '<p class="item-sub">بانتظار متابعة المختص في العلاج الطبيعي.</p>';

  latestInjuryCard.innerHTML = "<h3>حالة الاستشفاء</h3>" + injuryHtml + followupHtml;
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

function renderChatRoleSwitch() {
  const buttons = Array.from(document.querySelectorAll("#chatRoleSwitch [data-chat-role]"));
  buttons.forEach(function (button) {
    const role = button.getAttribute("data-chat-role");
    button.classList.toggle("active", role === state.chatTargetRole);
  });
}

function roleDisplayName(role) {
  if (role === "coach") return "المدرب";
  if (role === "nutrition") return "أخصائي التغذية";
  if (role === "physio") return "أخصائي العلاج الطبيعي";
  return "فريق MOVE";
}

function roleLabel(role) {
  if (role === "coach") return "تدريب";
  if (role === "nutrition") return "تغذية";
  if (role === "physio") return "علاج";
  return "فريق";
}

function followupStatusLabel(status) {
  if (status === "under-review") return "قيد المتابعة";
  if (status === "improving") return "تحسن";
  if (status === "stable") return "مستقرة";
  if (status === "closed") return "مغلقة";
  return "متابعة";
}

function getMessagesForRole(role) {
  return state.supportMessages.filter(function (message) {
    const sender = String(message.senderRole || "");
    const target = String(message.targetRole || "");

    if (sender === role) return true;

    if (sender === "member") {
      if (role === "coach") {
        return target === "" || target === "coach";
      }
      return target === role;
    }

    return target === role;
  });
}

function getUnreadForRole(role) {
  const lastSeen = getLastSeenSupportAt();
  return getMessagesForRole(role).filter(function (message) {
    return message.senderRole !== "member" && toMillis(message.createdAt) > lastSeen;
  }).length;
}

function renderChats() {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  const roles = ["coach", "nutrition", "physio"];

  chatList.innerHTML = roles
    .map(function (role) {
      const roleMessages = getMessagesForRole(role);
      const lastMessage = roleMessages.length ? roleMessages[roleMessages.length - 1] : null;
      const unread = getUnreadForRole(role);

      return (
        '<article class="chat-item' + (state.chatTargetRole === role ? " active" : "") + '" data-chat-open-role="' + role + '">' +
        '<div class="item-row">' +
        '<span class="badge">' + (unread > 0 ? unread + " جديد" : roleLabel(role)) + "</span>" +
        '<div>' +
        '<p class="item-title">' + escapeHtml(roleDisplayName(role)) + "</p>" +
        '<p class="item-sub">' + escapeHtml(lastMessage ? lastMessage.text : "ابدأ المحادثة مع المختص") + "</p>" +
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

  title.textContent = "محادثة " + roleDisplayName(state.chatTargetRole);
  const roleMessages = getMessagesForRole(state.chatTargetRole);

  if (!roleMessages.length) {
    threadContainer.innerHTML = '<div class="chat-bubble team">أهلاً بك، اكتب رسالتك لنساعدك في التدريب والتغذية.</div>';
    return;
  }

  threadContainer.innerHTML = roleMessages
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
  const currentThread = getMessagesForRole(state.chatTargetRole);
  const lastMessage = currentThread.length
    ? currentThread[currentThread.length - 1]
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
    return message.senderRole !== "member" && toMillis(message.createdAt) > lastSeen;
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

function startProfileReminderLoop() {
  if (state.reminderIntervalId) {
    clearInterval(state.reminderIntervalId);
    state.reminderIntervalId = null;
  }

  state.reminderIntervalId = window.setInterval(function () {
    maybeTriggerWorkoutReminder();
  }, 60 * 1000);

  maybeTriggerWorkoutReminder();
}

function maybeTriggerWorkoutReminder() {
  const reminderTime = String(state.profile.reminderTime || "");
  if (!/^\d{2}:\d{2}$/.test(reminderTime)) return;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = hh + ":" + mm;
  if (current !== reminderTime) return;

  const key = "moveLastReminderDate";
  const today = now.toISOString().slice(0, 10);
  const last = localStorage.getItem(key);
  if (last === today) return;
  localStorage.setItem(key, today);

  const body = "حان وقت تدريبك اليوم. افتح الجدول وابدأ أول تمرين.";
  showAppNotice(body);

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("MOVE Reminder", { body: body, silent: false });
  }
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

function goalLabel(goal) {
  if (goal === "muscle-gain") return "بناء العضلات";
  if (goal === "weight-loss") return "خسارة الوزن";
  if (goal === "fitness") return "الحفاظ على اللياقة";
  return String(goal || "غير محدد");
}

function planLabel(planId) {
  if (planId === "move-plus") return "MOVE Plus";
  if (planId === "move-pro") return "MOVE Pro Team";
  return String(planId || "غير مفعل");
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

// ─────────────────────────────────────────────
//  RUNNING TRACKER
// ─────────────────────────────────────────────

const run = {
  watchId: null,
  timerInterval: null,
  motionHandler: null,
  map: null,
  polyline: null,
  summaryMap: null,
  summaryPolyline: null,
  points: [],          // [[lat,lng], ...]
  distanceM: 0,
  startTime: 0,
  elapsedSec: 0,
  paused: false,
  pauseStart: 0,
  totalPauseSec: 0,
  steps: 0,
  lastMag: 0,
  lastStepMs: 0,
  lastKmAlert: 0,
  recentPacePoints: [],  // {t, d} for current-pace calc
  sessions: []
};

function initRunningTracker() {
  document.getElementById("startRunBtn")?.addEventListener("click", requestRunStart);
  document.getElementById("pauseRunBtn")?.addEventListener("click", pauseRun);
  document.getElementById("resumeRunBtn")?.addEventListener("click", resumeRun);
  document.getElementById("stopRunBtn")?.addEventListener("click", stopRun);
  document.getElementById("newRunBtn")?.addEventListener("click", resetToReady);
  loadRunHistory();
  renderRunHistory();
}

// ── Start ──────────────────────────────────────
async function requestRunStart() {
  const tip = document.getElementById("runPermTip");
  if (tip) tip.style.display = "block";

  // Request iOS motion permission if needed
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    try { await DeviceMotionEvent.requestPermission(); } catch (_) {}
  }

  if (!navigator.geolocation) {
    alert("المتصفح لا يدعم GPS. يرجى تجربة التطبيق على جهاز محمول.");
    return;
  }

  resetRunState();
  showRunState("active");

  // Init Leaflet map
  if (!run.map) {
    run.map = L.map("runMap", { zoomControl: false, attributionControl: false })
               .setView([24.7136, 46.6753], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(run.map);
    run.polyline = L.polyline([], { color: "#ff5937", weight: 4, opacity: 0.9 }).addTo(run.map);
  } else {
    run.map.setView([24.7136, 46.6753], 15);
    run.polyline.setLatLngs([]);
  }

  run.startTime = Date.now();
  run.timerInterval = setInterval(tickTimer, 1000);

  run.watchId = navigator.geolocation.watchPosition(
    onGpsPoint,
    onGpsError,
    { enableHighAccuracy: true, maximumAge: 1500, timeout: 15000 }
  );

  startMotionTracking();
}

// ── GPS callback ───────────────────────────────
function onGpsPoint(pos) {
  const badge = document.getElementById("runGpsBadge");
  if (badge) { badge.textContent = "GPS ✓"; badge.style.color = "#2c9d63"; }

  const { latitude: lat, longitude: lng, accuracy } = pos.coords;
  if (accuracy > 60) return; // ignore noisy points

  const pt = [lat, lng];
  if (run.points.length > 0) {
    const last = run.points[run.points.length - 1];
    const dist = haversine(last[0], last[1], lat, lng);
    if (dist < 2) return; // filter GPS drift under 2 m
    run.distanceM += dist;
    run.recentPacePoints.push({ t: Date.now(), d: run.distanceM });
    if (run.recentPacePoints.length > 20) run.recentPacePoints.shift();
  }

  run.points.push(pt);
  run.polyline.addLatLng(pt);
  run.map.panTo(pt, { animate: true, duration: 0.5 });

  // Km milestones
  const kmDone = Math.floor(run.distanceM / 1000);
  if (kmDone > run.lastKmAlert) {
    run.lastKmAlert = kmDone;
    triggerKmAlert(kmDone);
  }

  updateLiveDisplay();
}

function onGpsError(err) {
  const badge = document.getElementById("runGpsBadge");
  if (badge) { badge.textContent = "GPS ✗"; badge.style.color = "#e94221"; }
  console.warn("GPS error", err.message);
}

// ── Timer ──────────────────────────────────────
function tickTimer() {
  if (run.paused) return;
  run.elapsedSec++;
  updateLiveDisplay();
}

// ── Motion / Steps ─────────────────────────────
function startMotionTracking() {
  run.motionHandler = function (e) {
    const g = e.accelerationIncludingGravity;
    if (!g) return;
    const mag = Math.sqrt((g.x || 0) ** 2 + (g.y || 0) ** 2 + (g.z || 0) ** 2);
    const THRESHOLD = 11.5;
    const MIN_INTERVAL_MS = 280;
    if (run.lastMag < THRESHOLD && mag >= THRESHOLD) {
      const now = Date.now();
      if (now - run.lastStepMs > MIN_INTERVAL_MS) {
        run.steps++;
        run.lastStepMs = now;
        const el = document.getElementById("liveSteps");
        if (el) el.textContent = String(run.steps);
      }
    }
    run.lastMag = mag;
  };
  window.addEventListener("devicemotion", run.motionHandler);
}

// ── Km alert ──────────────────────────────────
function triggerKmAlert(km) {
  // Vibrate if supported
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

  // Visual km badge
  const badges = document.getElementById("runKmBadges");
  if (badges) {
    const b = document.createElement("span");
    b.className = "run-km-chip";
    b.textContent = km + " كم ✓";
    badges.appendChild(b);
  }

  // Audio beep
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(); osc.stop(ctx.currentTime + 0.6);
  } catch (_) {}
}

// ── Pause / Resume ─────────────────────────────
function pauseRun() {
  run.paused = true;
  run.pauseStart = Date.now();
  document.getElementById("pauseRunBtn").style.display = "none";
  document.getElementById("resumeRunBtn").style.display = "";
}

function resumeRun() {
  run.totalPauseSec += Math.floor((Date.now() - run.pauseStart) / 1000);
  run.paused = false;
  document.getElementById("pauseRunBtn").style.display = "";
  document.getElementById("resumeRunBtn").style.display = "none";
}

// ── Stop ──────────────────────────────────────
async function stopRun() {
  // Stop GPS
  if (run.watchId !== null) {
    navigator.geolocation.clearWatch(run.watchId);
    run.watchId = null;
  }
  // Stop timer
  if (run.timerInterval) { clearInterval(run.timerInterval); run.timerInterval = null; }
  // Stop motion
  if (run.motionHandler) { window.removeEventListener("devicemotion", run.motionHandler); run.motionHandler = null; }

  const distKm = run.distanceM / 1000;
  const avgPaceMin = distKm > 0.05 ? run.elapsedSec / 60 / distKm : 0;
  const estCal = Math.round(distKm * 62); // ~62 kcal/km for avg 70 kg

  const session = {
    id: String(Date.now()),
    date: new Date().toISOString(),
    distanceM: Math.round(run.distanceM),
    durationSec: run.elapsedSec,
    avgPaceMinPerKm: avgPaceMin,
    steps: run.steps,
    estCalories: estCal,
    points: run.points
  };

  // Save locally
  run.sessions.unshift(session);
  if (run.sessions.length > 50) run.sessions.pop();
  localStorage.setItem("moveRunSessions", JSON.stringify(run.sessions));

  // Save to Firebase
  if (state.userUid) {
    try {
      await addDoc(collection(db, "runSessions"), {
        userId: state.userUid,
        distanceM: session.distanceM,
        durationSec: session.durationSec,
        avgPaceMinPerKm: avgPaceMin,
        steps: session.steps,
        estCalories: session.estCalories,
        pointCount: session.points.length,
        date: session.date,
        createdAt: serverTimestamp()
      });
    } catch (err) { console.warn("Run save error", err); }
  }

  showRunSummary(session);
}

// ── Summary ───────────────────────────────────
function showRunSummary(session) {
  showRunState("summary");

  const distKm = session.distanceM / 1000;
  document.getElementById("summaryDist").textContent = distKm.toFixed(2) + " كم";
  document.getElementById("sumTime").textContent = formatSecs(session.durationSec);
  document.getElementById("sumPace").textContent = session.avgPaceMinPerKm > 0
    ? formatPace(session.avgPaceMinPerKm) + " د/كم"
    : "—";
  document.getElementById("sumSteps").textContent = session.steps.toLocaleString("ar");
  document.getElementById("sumCal").textContent = session.estCalories.toLocaleString("ar");

  const msg = distKm >= 5 ? "أداء رائع! استمر في التطور."
    : distKm >= 2 ? "جلسة ممتازة! في كل مرة ستتحسن أكثر."
    : "خطوة أولى رائعة! استمر.";
  document.getElementById("summaryMsg").textContent = msg;

  // Summary map
  setTimeout(() => {
    if (!run.summaryMap) {
      run.summaryMap = L.map("runSummaryMap", { zoomControl: false, attributionControl: false, dragging: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(run.summaryMap);
      run.summaryPolyline = L.polyline([], { color: "#ff5937", weight: 4 }).addTo(run.summaryMap);
    }
    if (session.points.length > 1) {
      run.summaryPolyline.setLatLngs(session.points);
      run.summaryMap.fitBounds(run.summaryPolyline.getBounds(), { padding: [20, 20] });
    } else {
      run.summaryMap.setView([24.7136, 46.6753], 13);
    }
    run.summaryMap.invalidateSize();
  }, 100);

  renderRunHistory();
}

// ── Reset ─────────────────────────────────────
function resetToReady() {
  resetRunState();
  showRunState("ready");
  renderRunHistory();
}

function resetRunState() {
  run.points = [];
  run.distanceM = 0;
  run.elapsedSec = 0;
  run.paused = false;
  run.totalPauseSec = 0;
  run.steps = 0;
  run.lastMag = 0;
  run.lastStepMs = 0;
  run.lastKmAlert = 0;
  run.recentPacePoints = [];

  const el = document.getElementById("runKmBadges");
  if (el) el.innerHTML = "";
  const pauseBtn = document.getElementById("pauseRunBtn");
  const resumeBtn = document.getElementById("resumeRunBtn");
  if (pauseBtn) pauseBtn.style.display = "";
  if (resumeBtn) resumeBtn.style.display = "none";
  updateLiveDisplay();
}

function showRunState(state) {
  document.getElementById("runReadyState").style.display = state === "ready" ? "" : "none";
  document.getElementById("runActiveState").style.display = state === "active" ? "" : "none";
  document.getElementById("runSummaryState").style.display = state === "summary" ? "" : "none";

  if (state === "active" && run.map) {
    setTimeout(() => run.map.invalidateSize(), 150);
  }
}

// ── Live display ───────────────────────────────
function updateLiveDisplay() {
  const distKm = run.distanceM / 1000;
  const distEl = document.getElementById("liveDist");
  if (distEl) distEl.textContent = distKm.toFixed(2);

  const timeEl = document.getElementById("liveTime");
  if (timeEl) timeEl.textContent = formatSecs(run.elapsedSec);

  // Avg pace
  const avgPaceEl = document.getElementById("livePaceAvg");
  if (avgPaceEl) {
    if (distKm > 0.05 && run.elapsedSec > 0) {
      avgPaceEl.textContent = formatPace(run.elapsedSec / 60 / distKm);
    } else {
      avgPaceEl.textContent = "—";
    }
  }

  // Current pace (last 30s window)
  const curPaceEl = document.getElementById("livePaceCurrent");
  if (curPaceEl) {
    const now = Date.now();
    const window30 = run.recentPacePoints.filter(p => now - p.t < 30000);
    if (window30.length >= 2) {
      const oldest = window30[0];
      const newest = window30[window30.length - 1];
      const deltaDM = (newest.d - oldest.d) / 1000; // km
      const deltaTMin = (newest.t - oldest.t) / 60000;
      const pace = deltaDM > 0.01 ? deltaTMin / deltaDM : 0;
      curPaceEl.textContent = pace > 0 ? formatPace(pace) : "—";
    } else {
      curPaceEl.textContent = "—";
    }
  }

  const stepsEl = document.getElementById("liveSteps");
  if (stepsEl) stepsEl.textContent = String(run.steps);
}

// ── History ───────────────────────────────────
function loadRunHistory() {
  try {
    const raw = localStorage.getItem("moveRunSessions");
    if (raw) run.sessions = JSON.parse(raw);
  } catch (_) { run.sessions = []; }
}

function renderRunHistory() {
  const container = document.getElementById("runHistory");
  if (!container) return;

  if (run.sessions.length === 0) {
    container.innerHTML = "<p class=\"muted\">لا توجد جلسات محفوظة بعد.</p>";
    return;
  }

  // Update last session stats
  const last = run.sessions[0];
  const lastDistKm = last.distanceM / 1000;
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el("lastDist", lastDistKm.toFixed(2));
  el("lastTime", formatSecs(last.durationSec));
  el("lastPace", last.avgPaceMinPerKm > 0 ? formatPace(last.avgPaceMinPerKm) : "—");
  el("lastSteps", last.steps.toLocaleString("ar"));
  const dateEl = document.getElementById("lastRunDate");
  if (dateEl) {
    dateEl.textContent = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(new Date(last.date));
  }

  container.innerHTML = run.sessions.slice(0, 10).map(function (s) {
    const dk = (s.distanceM / 1000).toFixed(2);
    const d = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(new Date(s.date));
    return `<div class="run-history-item">
      <div class="run-hist-left">
        <strong class="run-hist-dist">${dk} كم</strong>
        <span class="run-hist-meta">${formatSecs(s.durationSec)} · ${s.avgPaceMinPerKm > 0 ? formatPace(s.avgPaceMinPerKm) + " د/كم" : "—"}</span>
      </div>
      <div class="run-hist-right">
        <span class="run-hist-date">${d}</span>
        <span class="run-hist-steps">${s.steps.toLocaleString("ar")} خطوة</span>
      </div>
    </div>`;
  }).join("");
}

// ── Helpers ────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatSecs(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatPace(minPerKm) {
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
