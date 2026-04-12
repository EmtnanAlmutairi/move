import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db, initializeAnalytics } from "./firebase-client.js";

initializeAnalytics();

const PLAN_PRICES = {
  "move-plus": 299,
  "move-pro": 499
};

const ROLE_SHARE = {
  coach: 0.35,
  nutrition: 0.2,
  physio: 0.2,
  admin: 0.25
};

const elements = {};
const state = {
  user: null,
  isStaff: false,
  staffRole: "coach",
  activeMemberUid: "",
  subscriptions: [],
  visibleSubscriptions: [],
  myClientMemberUids: [],
  memberProfilesByUid: {},
  payouts: [],
  specialistProfile: null,
  workouts: [],
  workoutLibrary: [],
  meals: [],
  nutritionTemplates: [],
  posts: [],
  injuryReports: [],
  injuryFollowups: [],
  supportMessages: [],
  threadSearch: "",
  selectedThreadId: null,
  supportUnsubscribe: null
};

window.addEventListener("DOMContentLoaded", function () {
  cacheElements();
  bindEvents();
  onAuthStateChanged(auth, onAuthChanged);
});

function cacheElements() {
  elements.authCard = document.getElementById("coachAuthCard");
  elements.dashboard = document.getElementById("coachDashboard");
  elements.loginForm = document.getElementById("coachLoginForm");
  elements.loginBtn = document.getElementById("coachLoginBtn");
  elements.authMessage = document.getElementById("coachAuthMessage");

  elements.refreshBtn = document.getElementById("coachRefreshBtn");
  elements.signOutBtn = document.getElementById("coachSignOutBtn");
  elements.welcome = document.getElementById("coachWelcome");
  elements.dashboardRoleTitle = document.getElementById("dashboardRoleTitle");
  elements.dashboardMessage = document.getElementById("coachDashboardMessage");

  elements.traineesCount = document.getElementById("coachTraineesCount");
  elements.workoutsCount = document.getElementById("coachWorkoutsCount");
  elements.mealsCount = document.getElementById("coachMealsCount");
  elements.threadsCount = document.getElementById("coachThreadsCount");
  elements.kpiLabel1 = document.getElementById("kpiLabel1");
  elements.kpiLabel2 = document.getElementById("kpiLabel2");
  elements.kpiLabel3 = document.getElementById("kpiLabel3");
  elements.kpiLabel4 = document.getElementById("kpiLabel4");
  elements.roleFocusSection = document.getElementById("roleFocusSection");
  elements.roleFocusTitle = document.getElementById("roleFocusTitle");
  elements.roleFocusBadge = document.getElementById("roleFocusBadge");
  elements.roleFocusList = document.getElementById("roleFocusList");
  elements.staffRoleBadge = document.getElementById("staffRoleBadge");
  elements.myClientsList = document.getElementById("myClientsList");
  elements.activeMemberProfileCard = document.getElementById("activeMemberProfileCard");
  elements.activeMemberSelect = document.getElementById("activeMemberSelect");
  elements.financeClients = document.getElementById("financeClients");
  elements.financeGross = document.getElementById("financeGross");
  elements.financeShare = document.getElementById("financeShare");
  elements.financePayout = document.getElementById("financePayout");
  elements.financePlanBreakdown = document.getElementById("financePlanBreakdown");
  elements.financePayoutMonth = document.getElementById("financePayoutMonth");
  elements.financePayoutStatus = document.getElementById("financePayoutStatus");
  elements.specialistProfileForm = document.getElementById("specialistProfileForm");
  elements.saveSpecialistProfileBtn = document.getElementById("saveSpecialistProfileBtn");
  elements.specialistProfileMessage = document.getElementById("specialistProfileMessage");
  elements.workoutSection = document.getElementById("coachWorkoutSection");
  elements.librarySection = document.getElementById("coachLibrarySection");
  elements.mealSection = document.getElementById("coachMealSection");
  elements.nutritionTemplateSection = document.getElementById("nutritionTemplateSection");
  elements.physioRecoverySection = document.getElementById("physioRecoverySection");
  elements.postSection = document.getElementById("coachPostSection");

  elements.workoutForm = document.getElementById("coachWorkoutForm");
  elements.workoutsList = document.getElementById("coachWorkoutsList");
  elements.cancelWorkoutEditBtn = document.getElementById("cancelWorkoutEditBtn");
  elements.saveWorkoutBtn = document.getElementById("saveWorkoutBtn");
  elements.libraryForm = document.getElementById("coachLibraryForm");
  elements.libraryList = document.getElementById("coachLibraryList");
  elements.cancelLibraryEditBtn = document.getElementById("cancelLibraryEditBtn");
  elements.saveLibraryBtn = document.getElementById("saveLibraryBtn");

  elements.mealForm = document.getElementById("coachMealForm");
  elements.mealsList = document.getElementById("coachMealsList");
  elements.cancelMealEditBtn = document.getElementById("cancelMealEditBtn");
  elements.saveMealBtn = document.getElementById("saveMealBtn");
  elements.nutritionTemplateForm = document.getElementById("nutritionTemplateForm");
  elements.nutritionTemplatesList = document.getElementById("nutritionTemplatesList");
  elements.cancelTemplateEditBtn = document.getElementById("cancelTemplateEditBtn");
  elements.saveTemplateBtn = document.getElementById("saveTemplateBtn");
  elements.applyTemplateNameSelect = document.getElementById("applyTemplateNameSelect");
  elements.applyTemplateToMemberBtn = document.getElementById("applyTemplateToMemberBtn");
  elements.physioFollowupForm = document.getElementById("physioFollowupForm");
  elements.physioInjuriesList = document.getElementById("physioInjuriesList");
  elements.physioFollowupsList = document.getElementById("physioFollowupsList");
  elements.savePhysioFollowupBtn = document.getElementById("savePhysioFollowupBtn");

  elements.postForm = document.getElementById("coachPostForm");
  elements.postsList = document.getElementById("coachPostsList");
  elements.cancelPostEditBtn = document.getElementById("cancelPostEditBtn");
  elements.savePostBtn = document.getElementById("savePostBtn");

  elements.threadsList = document.getElementById("coachThreadsList");
  elements.threadSearch = document.getElementById("coachThreadSearch");
  elements.selectedThreadTitle = document.getElementById("coachSelectedThreadTitle");
  elements.threadMessages = document.getElementById("coachThreadMessages");
  elements.replyForm = document.getElementById("coachReplyForm");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", onLoginSubmit);

  elements.signOutBtn.addEventListener("click", function () {
    signOut(auth);
  });

  elements.refreshBtn.addEventListener("click", function () {
    loadDashboardData();
  });

  elements.workoutForm.addEventListener("submit", onWorkoutSubmit);
  elements.mealForm.addEventListener("submit", onMealSubmit);
  elements.postForm.addEventListener("submit", onPostSubmit);
  elements.replyForm.addEventListener("submit", onReplySubmit);
  if (elements.specialistProfileForm) {
    elements.specialistProfileForm.addEventListener("submit", onSpecialistProfileSubmit);
  }
  if (elements.libraryForm) {
    elements.libraryForm.addEventListener("submit", onLibrarySubmit);
  }
  if (elements.nutritionTemplateForm) {
    elements.nutritionTemplateForm.addEventListener("submit", onNutritionTemplateSubmit);
  }
  if (elements.physioFollowupForm) {
    elements.physioFollowupForm.addEventListener("submit", onPhysioFollowupSubmit);
  }

  elements.cancelWorkoutEditBtn.addEventListener("click", clearWorkoutForm);
  elements.cancelMealEditBtn.addEventListener("click", clearMealForm);
  elements.cancelPostEditBtn.addEventListener("click", clearPostForm);
  if (elements.cancelLibraryEditBtn) {
    elements.cancelLibraryEditBtn.addEventListener("click", clearLibraryForm);
  }
  if (elements.cancelTemplateEditBtn) {
    elements.cancelTemplateEditBtn.addEventListener("click", clearNutritionTemplateForm);
  }

  elements.workoutsList.addEventListener("click", onWorkoutListAction);
  elements.mealsList.addEventListener("click", onMealListAction);
  elements.postsList.addEventListener("click", onPostListAction);
  if (elements.libraryList) {
    elements.libraryList.addEventListener("click", onLibraryListAction);
  }
  if (elements.nutritionTemplatesList) {
    elements.nutritionTemplatesList.addEventListener("click", onNutritionTemplateListAction);
  }
  if (elements.applyTemplateToMemberBtn) {
    elements.applyTemplateToMemberBtn.addEventListener("click", applyNutritionTemplateToActiveMember);
  }
  if (elements.threadSearch) {
    elements.threadSearch.addEventListener("input", function () {
      state.threadSearch = String(elements.threadSearch.value || "").trim().toLowerCase();
      renderSupportInbox();
    });
  }
  if (elements.activeMemberSelect) {
    elements.activeMemberSelect.addEventListener("change", onActiveMemberChanged);
  }

  elements.threadsList.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const item = target.closest("[data-thread-id]");
    if (!item) return;
    const threadId = item.getAttribute("data-thread-id");
    if (!threadId) return;

    state.selectedThreadId = threadId;
    renderSupportInbox();
    renderSelectedThread();
  });
}

async function onLoginSubmit(event) {
  event.preventDefault();

  const email = event.currentTarget.email.value.trim();
  const password = event.currentTarget.password.value;

  if (!email || !password) {
    elements.authMessage.textContent = "أدخل الإيميل وكلمة المرور.";
    return;
  }

  setLoginLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    elements.authMessage.textContent = "فشل تسجيل الدخول. تأكد من البيانات.";
  } finally {
    setLoginLoading(false);
  }
}

function setLoginLoading(loading) {
  elements.loginBtn.disabled = loading;
  elements.loginBtn.textContent = loading ? "جاري الدخول..." : "دخول";
}

async function onAuthChanged(user) {
  state.user = user;
  state.isStaff = false;
  state.staffRole = "coach";

  if (!user) {
    teardownSupportListener();
    elements.authCard.classList.remove("hidden");
    elements.dashboard.classList.add("hidden");
    elements.authMessage.textContent = "";
    return;
  }

  const staffProfile = await resolveStaffProfile(user.uid);
  if (!staffProfile) {
    elements.authMessage.textContent = "لا تملك صلاحية المدرب. أضف UID في coaches أو admins.";
    await signOut(auth);
    return;
  }

  state.isStaff = true;
  state.staffRole = staffProfile.role;
  elements.authCard.classList.add("hidden");
  elements.dashboard.classList.remove("hidden");
  elements.welcome.textContent = "مرحباً " + (user.email || "Coach") + " ، أنت مسجل كـ " + roleLabel(state.staffRole) + ".";
  if (elements.staffRoleBadge) {
    elements.staffRoleBadge.textContent = roleLabel(state.staffRole);
  }
  applyRoleExperience();

  await loadDashboardData();
  startSupportListener();
}

async function resolveStaffProfile(uid) {
  try {
    const checks = await Promise.all([
      getDoc(doc(db, "practitioners", uid)),
      getDoc(doc(db, "coaches", uid)),
      getDoc(doc(db, "admins", uid))
    ]);
    if (checks[2].exists()) {
      return { role: "admin" };
    }
    if (checks[0].exists()) {
      const role = String(checks[0].data().role || "coach");
      return { role: role };
    }
    if (checks[1].exists()) {
      return { role: "coach" };
    }
    return null;
  } catch (error) {
    console.error("Failed to verify access", error);
    return null;
  }
}

async function loadDashboardData() {
  if (!state.user || !state.isStaff) return;

  elements.dashboardMessage.textContent = "جاري تحديث البيانات...";

  await loadSubscriptions();
  await loadMemberProfiles();
  await loadSpecialistProfile();
  await Promise.all([
    loadWorkouts(),
    loadWorkoutLibrary(),
    loadMeals(),
    loadNutritionTemplates(),
    loadPosts(),
    loadPayouts(),
    loadInjuryReports(),
    loadInjuryFollowups()
  ]);

  render();
  elements.dashboardMessage.textContent = "تم تحديث البيانات.";
}

async function loadPayouts() {
  if (!state.user || !state.user.uid) return;
  const snapshot = await getDocs(
    query(
      collection(db, "payouts"),
      where("specialistUid", "==", state.user.uid),
      limit(80)
    )
  );
  state.payouts = snapshot.docs.map(function (entry) {
    return Object.assign({ id: entry.id }, entry.data());
  }).sort(function (a, b) {
    return String(b.month || "").localeCompare(String(a.month || ""));
  });
}

async function loadSpecialistProfile() {
  if (!state.user || !state.user.uid) return;
  try {
    const snapshot = await getDoc(doc(db, "specialistProfiles", state.user.uid));
    state.specialistProfile = snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Failed to load specialist profile", error);
    state.specialistProfile = null;
  }
}

async function loadWorkoutLibrary() {
  if (!state.user || !state.user.uid) return;
  try {
    const snapshot = await getDocs(
      query(collection(db, "workoutLibrary"), where("createdByUid", "==", state.user.uid), limit(200))
    );
    state.workoutLibrary = snapshot.docs
      .map(function (entry) { return Object.assign({ id: entry.id }, entry.data()); })
      .sort(function (a, b) { return Number(a.sortOrder || 0) - Number(b.sortOrder || 0); });
  } catch (error) {
    console.error("Failed to load workout library", error);
    state.workoutLibrary = [];
  }
}

async function loadNutritionTemplates() {
  if (!state.user || !state.user.uid) return;
  try {
    const snapshot = await getDocs(
      query(collection(db, "nutritionTemplates"), where("createdByUid", "==", state.user.uid), limit(300))
    );
    state.nutritionTemplates = snapshot.docs
      .map(function (entry) { return Object.assign({ id: entry.id }, entry.data()); })
      .sort(function (a, b) {
        const nameCompare = String(a.templateName || "").localeCompare(String(b.templateName || ""));
        if (nameCompare !== 0) return nameCompare;
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
  } catch (error) {
    console.error("Failed to load nutrition templates", error);
    state.nutritionTemplates = [];
  }
}

async function loadInjuryReports() {
  if (!state.activeMemberUid) {
    state.injuryReports = [];
    return;
  }
  try {
    const snapshot = await getDocs(
      query(collection(db, "injuryReports"), where("memberUid", "==", state.activeMemberUid), limit(50))
    );
    state.injuryReports = snapshot.docs
      .map(function (entry) { return Object.assign({ id: entry.id }, entry.data()); })
      .sort(function (a, b) { return toMillis(b.createdAt) - toMillis(a.createdAt); });
  } catch (error) {
    console.error("Failed to load injury reports", error);
    state.injuryReports = [];
  }
}

async function loadInjuryFollowups() {
  if (!state.activeMemberUid) {
    state.injuryFollowups = [];
    return;
  }
  try {
    const snapshot = await getDocs(
      query(collection(db, "injuryFollowups"), where("memberUid", "==", state.activeMemberUid), limit(80))
    );
    state.injuryFollowups = snapshot.docs
      .map(function (entry) { return Object.assign({ id: entry.id }, entry.data()); })
      .sort(function (a, b) { return toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt); });
  } catch (error) {
    console.error("Failed to load injury followups", error);
    state.injuryFollowups = [];
  }
}

async function loadMemberProfiles() {
  const map = {};
  const targets = state.myClientMemberUids.slice(0, 80);
  await Promise.all(
    targets.map(async function (memberUid) {
      try {
        const snap = await getDoc(doc(db, "memberProfiles", memberUid));
        if (snap.exists()) {
          map[memberUid] = snap.data();
        }
      } catch (error) {
        console.error("Failed to load member profile", memberUid, error);
      }
    })
  );
  state.memberProfilesByUid = map;
}

async function loadSubscriptions() {
  try {
    let subsQuery;
    if (state.staffRole === "admin") {
      subsQuery = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(250));
    } else if (state.staffRole === "nutrition") {
      subsQuery = query(collection(db, "subscriptions"), where("assignedNutritionUid", "==", state.user.uid), limit(250));
    } else if (state.staffRole === "physio") {
      subsQuery = query(collection(db, "subscriptions"), where("assignedPhysioUid", "==", state.user.uid), limit(250));
    } else {
      subsQuery = query(collection(db, "subscriptions"), where("assignedCoachUid", "==", state.user.uid), limit(250));
    }

    const snapshot = await getDocs(subsQuery);
    state.subscriptions = snapshot.docs.map((entry) => Object.assign({ id: entry.id }, entry.data()));
    state.visibleSubscriptions = filterSubscriptionsForStaff(state.subscriptions);
    state.myClientMemberUids = state.visibleSubscriptions
      .map(function (item) { return String(item.memberUid || ""); })
      .filter(function (uid) { return uid.length > 0; });

    const activeStillExists = state.myClientMemberUids.includes(state.activeMemberUid);
    state.activeMemberUid = activeStillExists
      ? state.activeMemberUid
      : (state.myClientMemberUids[0] || "");
  } catch (error) {
    console.error("Failed to load subscriptions", error);
    state.subscriptions = [];
    state.visibleSubscriptions = [];
    state.myClientMemberUids = [];
    state.activeMemberUid = "";
  }
}

async function loadWorkouts() {
  if (!state.activeMemberUid) {
    state.workouts = [];
    return;
  }
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "workoutVideos"),
        where("memberUid", "==", state.activeMemberUid),
        limit(120)
      )
    );
    state.workouts = snapshot.docs
      .map((entry) => Object.assign({ id: entry.id }, entry.data()))
      .sort(function (a, b) {
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
  } catch (error) {
    console.error("Failed to load workouts", error);
    state.workouts = [];
  }
}

async function loadMeals() {
  if (!state.activeMemberUid) {
    state.meals = [];
    return;
  }
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "nutritionMeals"),
        where("memberUid", "==", state.activeMemberUid),
        limit(120)
      )
    );
    state.meals = snapshot.docs
      .map((entry) => Object.assign({ id: entry.id }, entry.data()))
      .sort(function (a, b) {
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      });
  } catch (error) {
    console.error("Failed to load meals", error);
    state.meals = [];
  }
}

async function loadPosts() {
  try {
    const snapshot = await getDocs(query(collection(db, "communityPosts"), orderBy("createdAt", "desc"), limit(60)));
    state.posts = snapshot.docs.map((entry) => Object.assign({ id: entry.id }, entry.data()));
  } catch (error) {
    console.error("Failed to load posts", error);
    state.posts = [];
  }
}

function startSupportListener() {
  teardownSupportListener();

  const supportQuery = query(collection(db, "supportMessages"), orderBy("createdAt", "desc"), limit(400));

  state.supportUnsubscribe = onSnapshot(
    supportQuery,
    function (snapshot) {
      state.supportMessages = snapshot.docs
        .map(function (entry) {
          return Object.assign({ id: entry.id }, entry.data());
        })
        .filter(function (item) {
          const memberMatch = state.myClientMemberUids.includes(String(item.threadId || ""));
          if (state.staffRole === "admin") return memberMatch;
          return memberMatch && messageVisibleToStaff(item);
        })
        .sort(function (a, b) {
          return toMillis(a.createdAt) - toMillis(b.createdAt);
        });

      if (!state.selectedThreadId) {
        const threads = buildThreads();
        state.selectedThreadId = threads.length ? threads[0].threadId : null;
      }

      renderSupportInbox();
      renderSelectedThread();
      renderKpis();
    },
    function (error) {
      console.error("Failed to listen support messages", error);
    }
  );
}

function teardownSupportListener() {
  if (typeof state.supportUnsubscribe === "function") {
    state.supportUnsubscribe();
    state.supportUnsubscribe = null;
  }
}

async function onWorkoutSubmit(event) {
  event.preventDefault();
  if (!state.user || !state.isStaff) return;
  if (!(state.staffRole === "coach" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "هذه الصلاحية للمدرب البدني فقط.";
    return;
  }

  const form = event.currentTarget;
  const editId = form.editId.value.trim();
  const videoUrl = form.videoUrl.value.trim();

  const activeMemberUid = getActiveMemberUid();
  if (!activeMemberUid) {
    elements.dashboardMessage.textContent = "اختر متدرباً أولاً قبل إضافة الفيديو.";
    return;
  }

  const payload = {
    memberUid: activeMemberUid,
    title: form.title.value.trim(),
    coachName: form.coachName.value.trim(),
    day: form.day.value.trim(),
    durationMin: Number(form.durationMin.value),
    intensity: form.intensity.value,
    focus: form.focus.value,
    videoUrl: videoUrl,
    instructions: form.instructions.value.trim(),
    sortOrder: Number(form.sortOrder.value),
    updatedAt: serverTimestamp()
  };

  if (!payload.title || !payload.coachName || !payload.day || !Number.isFinite(payload.durationMin) || !Number.isFinite(payload.sortOrder)) {
    elements.dashboardMessage.textContent = "تأكد من تعبئة بيانات التدريب بشكل صحيح.";
    return;
  }
  if (payload.videoUrl && !isLikelyHttpUrl(payload.videoUrl)) {
    elements.dashboardMessage.textContent = "رابط الفيديو غير صحيح. استخدم رابط يبدأ بـ http/https.";
    return;
  }

  try {
    setFormBusy(elements.saveWorkoutBtn, true, editId ? "جاري حفظ التعديل..." : "جاري النشر...");
    if (editId) {
      await updateDoc(doc(db, "workoutVideos", editId), payload);
      elements.dashboardMessage.textContent = "تم تحديث فيديو التدريب.";
    } else {
      await addDoc(collection(db, "workoutVideos"), Object.assign({}, payload, {
        createdByUid: state.user.uid,
        createdAt: serverTimestamp()
      }));
      elements.dashboardMessage.textContent = "تم نشر فيديو التدريب.";
    }

    clearWorkoutForm();
    await loadWorkouts();
    renderWorkouts();
    renderKpis();
  } catch (error) {
    console.error("Failed to save workout", error);
    elements.dashboardMessage.textContent = "تعذر حفظ فيديو التدريب.";
  } finally {
    setFormBusy(
      elements.saveWorkoutBtn,
      false,
      "",
      elements.workoutForm.editId.value ? "حفظ تعديل الفيديو" : "نشر فيديو التدريب"
    );
  }
}

async function onMealSubmit(event) {
  event.preventDefault();
  if (!state.user || !state.isStaff) return;
  if (!(state.staffRole === "nutrition" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "هذه الصلاحية لأخصائي التغذية فقط.";
    return;
  }

  const activeMemberUid = getActiveMemberUid();
  if (!activeMemberUid) {
    elements.dashboardMessage.textContent = "اختر متدرباً أولاً قبل إضافة الوجبة.";
    return;
  }

  const form = event.currentTarget;
  const editId = form.editId.value.trim();
  const payload = {
    memberUid: activeMemberUid,
    title: form.title.value.trim(),
    time: form.time.value.trim(),
    kcal: Number(form.kcal.value),
    protein: Number(form.protein.value),
    carbs: Number(form.carbs.value),
    fat: Number(form.fat.value),
    sortOrder: Number(form.sortOrder.value),
    updatedAt: serverTimestamp()
  };

  if (!payload.title || !payload.time || !Number.isFinite(payload.kcal) || !Number.isFinite(payload.sortOrder)) {
    elements.dashboardMessage.textContent = "تأكد من تعبئة بيانات الوجبة بشكل صحيح.";
    return;
  }

  try {
    setFormBusy(elements.saveMealBtn, true, editId ? "جاري حفظ التعديل..." : "جاري النشر...");
    if (editId) {
      await updateDoc(doc(db, "nutritionMeals", editId), payload);
      elements.dashboardMessage.textContent = "تم تحديث الوجبة.";
    } else {
      await addDoc(collection(db, "nutritionMeals"), Object.assign({}, payload, {
        createdByUid: state.user.uid,
        createdAt: serverTimestamp()
      }));
      elements.dashboardMessage.textContent = "تم نشر الوجبة الغذائية.";
    }

    clearMealForm();
    await loadMeals();
    renderMeals();
    renderKpis();
  } catch (error) {
    console.error("Failed to save meal", error);
    elements.dashboardMessage.textContent = "تعذر حفظ الوجبة.";
  } finally {
    setFormBusy(
      elements.saveMealBtn,
      false,
      "",
      elements.mealForm.editId.value ? "حفظ تعديل الوجبة" : "نشر الوجبة"
    );
  }
}

async function onPostSubmit(event) {
  event.preventDefault();
  if (!state.user || !state.isStaff) return;
  if (!(state.staffRole === "coach" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "نشر المجتمع متاح للمدرب أو الإدارة.";
    return;
  }

  const form = event.currentTarget;
  const editId = form.editId.value.trim();
  const payload = {
    title: form.title.value.trim(),
    body: form.body.value.trim(),
    authorRole: form.authorRole.value.trim() || "فريق MOVE"
  };

  if (!payload.title || !payload.body) {
    elements.dashboardMessage.textContent = "أدخل عنوان ومحتوى المنشور.";
    return;
  }

  try {
    setFormBusy(elements.savePostBtn, true, editId ? "جاري حفظ التعديل..." : "جاري النشر...");
    if (editId) {
      await updateDoc(doc(db, "communityPosts", editId), payload);
      elements.dashboardMessage.textContent = "تم تحديث المنشور.";
    } else {
      await addDoc(collection(db, "communityPosts"), Object.assign({}, payload, {
        createdByUid: state.user.uid,
        source: "coach-portal",
        createdAt: serverTimestamp()
      }));
      elements.dashboardMessage.textContent = "تم نشر المنشور في المجتمع.";
    }

    clearPostForm();
    await loadPosts();
    renderPosts();
  } catch (error) {
    console.error("Failed to save post", error);
    elements.dashboardMessage.textContent = "تعذر حفظ المنشور.";
  } finally {
    setFormBusy(
      elements.savePostBtn,
      false,
      "",
      elements.postForm.editId.value ? "حفظ تعديل المنشور" : "نشر في المجتمع"
    );
  }
}

async function onReplySubmit(event) {
  event.preventDefault();
  if (!state.user || !state.isStaff) return;

  if (!state.selectedThreadId) {
    elements.dashboardMessage.textContent = "اختر محادثة أولاً.";
    return;
  }

  const form = event.currentTarget;
  const text = form.reply.value.trim();
  if (!text) return;

  const senderName = (state.user.email || "coach@move").split("@")[0];

  try {
    await addDoc(collection(db, "supportMessages"), {
      threadId: state.selectedThreadId,
      senderRole: state.staffRole === "admin" ? "coach" : state.staffRole,
      targetRole: "member",
      senderName: senderName,
      text: text,
      source: "coach-portal",
      createdAt: serverTimestamp()
    });

    form.reset();
    elements.dashboardMessage.textContent = "تم إرسال الرد.";
  } catch (error) {
    console.error("Failed to send reply", error);
    elements.dashboardMessage.textContent = "تعذر إرسال الرد.";
  }
}

async function onSpecialistProfileSubmit(event) {
  event.preventDefault();
  if (!state.user || !state.user.uid) return;

  const form = event.currentTarget;
  const payload = {
    uid: state.user.uid,
    role: state.staffRole,
    displayName: String(form.displayName.value || "").trim(),
    specialization: String(form.specialization.value || "").trim(),
    yearsExperience: Number(form.yearsExperience.value || 0),
    certifications: String(form.certifications.value || "").trim(),
    bio: String(form.bio.value || "").trim(),
    updatedAt: serverTimestamp()
  };

  if (!payload.displayName || !payload.specialization) {
    if (elements.specialistProfileMessage) elements.specialistProfileMessage.textContent = "أكمل بيانات الملف المهني.";
    return;
  }

  try {
    setFormBusy(elements.saveSpecialistProfileBtn, true, "جاري الحفظ...");
    await setDoc(doc(db, "specialistProfiles", state.user.uid), payload, { merge: true });
    if (elements.specialistProfileMessage) elements.specialistProfileMessage.textContent = "تم حفظ ملف المختص.";
    await loadSpecialistProfile();
    renderSpecialistProfile();
  } catch (error) {
    console.error("Failed to save specialist profile", error);
    if (elements.specialistProfileMessage) elements.specialistProfileMessage.textContent = "تعذر حفظ الملف.";
  } finally {
    setFormBusy(elements.saveSpecialistProfileBtn, false, "", "حفظ الملف");
  }
}

async function onLibrarySubmit(event) {
  event.preventDefault();
  if (!(state.staffRole === "coach" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "مكتبة التمارين للمدرب البدني فقط.";
    return;
  }

  const form = event.currentTarget;
  const editId = String(form.editId.value || "").trim();
  const payload = {
    title: String(form.title.value || "").trim(),
    defaultDay: String(form.defaultDay.value || "").trim(),
    durationMin: Number(form.durationMin.value || 0),
    intensity: String(form.intensity.value || "متوسطة"),
    focus: String(form.focus.value || "fitness"),
    videoUrl: String(form.videoUrl.value || "").trim(),
    instructions: String(form.instructions.value || "").trim(),
    sortOrder: Number(form.sortOrder ? form.sortOrder.value : 10),
    createdByUid: state.user.uid,
    updatedAt: serverTimestamp()
  };

  if (!payload.title || !payload.defaultDay || !isLikelyHttpUrl(payload.videoUrl)) {
    elements.dashboardMessage.textContent = "تحقق من عنوان التمرين ورابط الفيديو.";
    return;
  }

  try {
    setFormBusy(elements.saveLibraryBtn, true, editId ? "جاري التعديل..." : "جاري الحفظ...");
    if (editId) {
      await updateDoc(doc(db, "workoutLibrary", editId), payload);
    } else {
      await addDoc(collection(db, "workoutLibrary"), Object.assign({}, payload, { createdAt: serverTimestamp() }));
    }
    clearLibraryForm();
    await loadWorkoutLibrary();
    renderWorkoutLibrary();
    elements.dashboardMessage.textContent = "تم حفظ التمرين في المكتبة.";
  } catch (error) {
    console.error("Failed to save workout library item", error);
    elements.dashboardMessage.textContent = "تعذر حفظ عنصر المكتبة.";
  } finally {
    setFormBusy(elements.saveLibraryBtn, false, "", "حفظ في المكتبة");
  }
}

async function onNutritionTemplateSubmit(event) {
  event.preventDefault();
  if (!(state.staffRole === "nutrition" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "قوالب الوجبات مخصصة للتغذية.";
    return;
  }

  const form = event.currentTarget;
  const editId = String(form.editId.value || "").trim();
  const payload = {
    templateName: String(form.templateName.value || "").trim(),
    caseType: String(form.caseType.value || "general"),
    weekDay: String(form.weekDay.value || ""),
    title: String(form.title.value || "").trim(),
    time: String(form.time.value || "").trim(),
    kcal: Number(form.kcal.value || 0),
    protein: Number(form.protein.value || 0),
    carbs: Number(form.carbs.value || 0),
    fat: Number(form.fat.value || 0),
    sortOrder: Number(form.sortOrder.value || 10),
    createdByUid: state.user.uid,
    updatedAt: serverTimestamp()
  };

  if (!payload.templateName || !payload.title || !payload.time) {
    elements.dashboardMessage.textContent = "أكمل بيانات قالب الوجبات.";
    return;
  }

  try {
    setFormBusy(elements.saveTemplateBtn, true, editId ? "جاري التعديل..." : "جاري الحفظ...");
    if (editId) {
      await updateDoc(doc(db, "nutritionTemplates", editId), payload);
    } else {
      await addDoc(collection(db, "nutritionTemplates"), Object.assign({}, payload, { createdAt: serverTimestamp() }));
    }
    clearNutritionTemplateForm();
    await loadNutritionTemplates();
    renderNutritionTemplates();
    elements.dashboardMessage.textContent = "تم حفظ سطر القالب الغذائي.";
  } catch (error) {
    console.error("Failed to save nutrition template", error);
    elements.dashboardMessage.textContent = "تعذر حفظ قالب التغذية.";
  } finally {
    setFormBusy(elements.saveTemplateBtn, false, "", "حفظ سطر في القالب");
  }
}

async function onPhysioFollowupSubmit(event) {
  event.preventDefault();
  if (!(state.staffRole === "physio" || state.staffRole === "admin")) {
    elements.dashboardMessage.textContent = "متابعة الإصابات مخصصة للعلاج الطبيعي.";
    return;
  }
  const memberUid = getActiveMemberUid();
  if (!memberUid) {
    elements.dashboardMessage.textContent = "اختر متدرباً أولاً.";
    return;
  }

  const form = event.currentTarget;
  const payload = {
    memberUid: memberUid,
    injuryId: String(form.injuryId.value || ""),
    status: String(form.status.value || "under-review"),
    plan: String(form.plan.value || "").trim(),
    nextCheckDate: String(form.nextCheckDate.value || ""),
    specialistUid: state.user.uid,
    specialistRole: "physio",
    updatedAt: serverTimestamp()
  };

  if (!payload.plan) {
    elements.dashboardMessage.textContent = "أدخل خطة المتابعة.";
    return;
  }

  try {
    setFormBusy(elements.savePhysioFollowupBtn, true, "جاري الحفظ...");
    await addDoc(collection(db, "injuryFollowups"), Object.assign({}, payload, { createdAt: serverTimestamp() }));
    form.reset();
    await loadInjuryFollowups();
    renderPhysioRecovery();
    elements.dashboardMessage.textContent = "تم حفظ متابعة العلاج الطبيعي.";
  } catch (error) {
    console.error("Failed to save physio followup", error);
    elements.dashboardMessage.textContent = "تعذر حفظ المتابعة.";
  } finally {
    setFormBusy(elements.savePhysioFollowupBtn, false, "", "حفظ متابعة");
  }
}

async function onWorkoutListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editTrigger = target.closest("[data-edit-workout]");
  if (editTrigger) {
    const id = editTrigger.getAttribute("data-edit-workout");
    const workout = state.workouts.find((item) => item.id === id);
    if (!workout) return;

    const form = elements.workoutForm;
    form.editId.value = workout.id;
    form.title.value = workout.title || "";
    form.coachName.value = workout.coachName || "";
    form.day.value = workout.day || "";
    form.durationMin.value = workout.durationMin || 30;
    form.intensity.value = workout.intensity || "متوسطة";
    form.focus.value = workout.focus || "strength";
    form.videoUrl.value = workout.videoUrl || "";
    form.instructions.value = workout.instructions || "";
    form.sortOrder.value = workout.sortOrder || 10;
    elements.cancelWorkoutEditBtn.classList.remove("hidden");
    elements.saveWorkoutBtn.textContent = "حفظ تعديل الفيديو";
    return;
  }

  const deleteTrigger = target.closest("[data-delete-workout]");
  if (deleteTrigger) {
    const id = deleteTrigger.getAttribute("data-delete-workout");
    if (!id || !confirm("حذف هذا الفيديو؟")) return;

    try {
      await deleteDoc(doc(db, "workoutVideos", id));
      if (elements.workoutForm.editId.value === id) clearWorkoutForm();
      await loadWorkouts();
      renderWorkouts();
      renderKpis();
      elements.dashboardMessage.textContent = "تم حذف الفيديو.";
    } catch (error) {
      console.error("Failed to delete workout", error);
      elements.dashboardMessage.textContent = "تعذر حذف الفيديو.";
    }
  }
}

async function onMealListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editTrigger = target.closest("[data-edit-meal]");
  if (editTrigger) {
    const id = editTrigger.getAttribute("data-edit-meal");
    const meal = state.meals.find((item) => item.id === id);
    if (!meal) return;

    const form = elements.mealForm;
    form.editId.value = meal.id;
    form.title.value = meal.title || "";
    form.time.value = meal.time || "";
    form.kcal.value = meal.kcal || 0;
    form.protein.value = meal.protein || 0;
    form.carbs.value = meal.carbs || 0;
    form.fat.value = meal.fat || 0;
    form.sortOrder.value = meal.sortOrder || 10;
    elements.cancelMealEditBtn.classList.remove("hidden");
    elements.saveMealBtn.textContent = "حفظ تعديل الوجبة";
    return;
  }

  const deleteTrigger = target.closest("[data-delete-meal]");
  if (deleteTrigger) {
    const id = deleteTrigger.getAttribute("data-delete-meal");
    if (!id || !confirm("حذف هذه الوجبة؟")) return;

    try {
      await deleteDoc(doc(db, "nutritionMeals", id));
      if (elements.mealForm.editId.value === id) clearMealForm();
      await loadMeals();
      renderMeals();
      renderKpis();
      elements.dashboardMessage.textContent = "تم حذف الوجبة.";
    } catch (error) {
      console.error("Failed to delete meal", error);
      elements.dashboardMessage.textContent = "تعذر حذف الوجبة.";
    }
  }
}

async function onPostListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editTrigger = target.closest("[data-edit-post]");
  if (editTrigger) {
    const id = editTrigger.getAttribute("data-edit-post");
    const post = state.posts.find((item) => item.id === id);
    if (!post) return;

    const form = elements.postForm;
    form.editId.value = post.id;
    form.title.value = post.title || "";
    form.authorRole.value = post.authorRole || "فريق MOVE";
    form.body.value = post.body || "";
    elements.cancelPostEditBtn.classList.remove("hidden");
    elements.savePostBtn.textContent = "حفظ تعديل المنشور";
    return;
  }

  const deleteTrigger = target.closest("[data-delete-post]");
  if (deleteTrigger) {
    const id = deleteTrigger.getAttribute("data-delete-post");
    if (!id || !confirm("حذف هذا المنشور؟")) return;

    try {
      await deleteDoc(doc(db, "communityPosts", id));
      if (elements.postForm.editId.value === id) clearPostForm();
      await loadPosts();
      renderPosts();
      elements.dashboardMessage.textContent = "تم حذف المنشور.";
    } catch (error) {
      console.error("Failed to delete post", error);
      elements.dashboardMessage.textContent = "تعذر حذف المنشور.";
    }
  }
}

async function onLibraryListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editTrigger = target.closest("[data-edit-library]");
  if (editTrigger) {
    const id = String(editTrigger.getAttribute("data-edit-library") || "");
    const item = state.workoutLibrary.find(function (entry) { return entry.id === id; });
    if (!item || !elements.libraryForm) return;
    const form = elements.libraryForm;
    form.editId.value = item.id;
    form.title.value = item.title || "";
    form.defaultDay.value = item.defaultDay || "";
    form.durationMin.value = item.durationMin || 30;
    form.intensity.value = item.intensity || "متوسطة";
    form.focus.value = item.focus || "fitness";
    form.videoUrl.value = item.videoUrl || "";
    form.instructions.value = item.instructions || "";
    if (form.sortOrder) form.sortOrder.value = item.sortOrder || 10;
    elements.cancelLibraryEditBtn.classList.remove("hidden");
    elements.saveLibraryBtn.textContent = "حفظ تعديل المكتبة";
    return;
  }

  const addTrigger = target.closest("[data-add-library-to-member]");
  if (addTrigger) {
    const id = String(addTrigger.getAttribute("data-add-library-to-member") || "");
    const item = state.workoutLibrary.find(function (entry) { return entry.id === id; });
    const memberUid = getActiveMemberUid();
    if (!item || !memberUid) {
      elements.dashboardMessage.textContent = "اختر متدرباً نشطاً أولاً.";
      return;
    }
    try {
      await addDoc(collection(db, "workoutVideos"), {
        memberUid: memberUid,
        title: item.title || "تمرين",
        coachName: (state.specialistProfile && state.specialistProfile.displayName) || (state.user.email || "Coach"),
        day: item.defaultDay || "الأحد",
        durationMin: Number(item.durationMin || 30),
        intensity: item.intensity || "متوسطة",
        focus: item.focus || "fitness",
        videoUrl: item.videoUrl || "",
        instructions: item.instructions || "",
        sortOrder: Number(item.sortOrder || 10),
        createdByUid: state.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await loadWorkouts();
      renderWorkouts();
      renderKpis();
      elements.dashboardMessage.textContent = "تمت إضافة التمرين من المكتبة إلى خطة المتدرب.";
    } catch (error) {
      console.error("Failed to add workout from library", error);
      elements.dashboardMessage.textContent = "تعذر الإضافة من المكتبة.";
    }
    return;
  }

  const deleteTrigger = target.closest("[data-delete-library]");
  if (deleteTrigger) {
    const id = String(deleteTrigger.getAttribute("data-delete-library") || "");
    if (!id || !confirm("حذف عنصر المكتبة؟")) return;
    try {
      await deleteDoc(doc(db, "workoutLibrary", id));
      if (elements.libraryForm && elements.libraryForm.editId.value === id) {
        clearLibraryForm();
      }
      await loadWorkoutLibrary();
      renderWorkoutLibrary();
      elements.dashboardMessage.textContent = "تم حذف عنصر المكتبة.";
    } catch (error) {
      console.error("Failed to delete library item", error);
      elements.dashboardMessage.textContent = "تعذر حذف عنصر المكتبة.";
    }
  }
}

async function onNutritionTemplateListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editTrigger = target.closest("[data-edit-template]");
  if (editTrigger) {
    const id = String(editTrigger.getAttribute("data-edit-template") || "");
    const item = state.nutritionTemplates.find(function (entry) { return entry.id === id; });
    if (!item || !elements.nutritionTemplateForm) return;
    const form = elements.nutritionTemplateForm;
    form.editId.value = item.id;
    form.templateName.value = item.templateName || "";
    form.caseType.value = item.caseType || "general";
    form.weekDay.value = item.weekDay || "الأحد";
    form.title.value = item.title || "";
    form.time.value = item.time || "";
    form.kcal.value = item.kcal || 0;
    form.protein.value = item.protein || 0;
    form.carbs.value = item.carbs || 0;
    form.fat.value = item.fat || 0;
    form.sortOrder.value = item.sortOrder || 10;
    elements.cancelTemplateEditBtn.classList.remove("hidden");
    elements.saveTemplateBtn.textContent = "حفظ تعديل القالب";
    return;
  }

  const deleteTrigger = target.closest("[data-delete-template]");
  if (deleteTrigger) {
    const id = String(deleteTrigger.getAttribute("data-delete-template") || "");
    if (!id || !confirm("حذف سطر القالب؟")) return;
    try {
      await deleteDoc(doc(db, "nutritionTemplates", id));
      if (elements.nutritionTemplateForm && elements.nutritionTemplateForm.editId.value === id) {
        clearNutritionTemplateForm();
      }
      await loadNutritionTemplates();
      renderNutritionTemplates();
      elements.dashboardMessage.textContent = "تم حذف سطر القالب.";
    } catch (error) {
      console.error("Failed to delete template row", error);
      elements.dashboardMessage.textContent = "تعذر حذف سطر القالب.";
    }
  }
}

async function applyNutritionTemplateToActiveMember() {
  const memberUid = getActiveMemberUid();
  const templateName = String((elements.applyTemplateNameSelect && elements.applyTemplateNameSelect.value) || "");
  if (!memberUid || !templateName) {
    elements.dashboardMessage.textContent = "اختر متدرباً نشطاً واسم القالب أولاً.";
    return;
  }

  const rows = state.nutritionTemplates
    .filter(function (item) { return String(item.templateName || "") === templateName; })
    .sort(function (a, b) {
      if (Number(a.sortOrder || 0) !== Number(b.sortOrder || 0)) {
        return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      }
      return String(a.weekDay || "").localeCompare(String(b.weekDay || ""));
    });
  if (!rows.length) {
    elements.dashboardMessage.textContent = "القالب المختار فارغ.";
    return;
  }

  try {
    setFormBusy(elements.applyTemplateToMemberBtn, true, "جاري التطبيق...");
    const currentMeals = state.meals.slice();
    await Promise.all(
      currentMeals.map(function (meal) {
        return deleteDoc(doc(db, "nutritionMeals", meal.id));
      })
    );
    await Promise.all(
      rows.map(function (row, index) {
        return addDoc(collection(db, "nutritionMeals"), {
          memberUid: memberUid,
          title: row.title || "وجبة",
          time: row.time || "--:--",
          kcal: Number(row.kcal || 0),
          protein: Number(row.protein || 0),
          carbs: Number(row.carbs || 0),
          fat: Number(row.fat || 0),
          sortOrder: Number(index + 1),
          createdByUid: state.user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      })
    );
    await loadMeals();
    renderMeals();
    renderKpis();
    elements.dashboardMessage.textContent = "تم تطبيق القالب الغذائي على المتدرب النشط.";
  } catch (error) {
    console.error("Failed to apply nutrition template", error);
    elements.dashboardMessage.textContent = "تعذر تطبيق القالب على المتدرب.";
  } finally {
    setFormBusy(elements.applyTemplateToMemberBtn, false, "", "تطبيق القالب");
  }
}

function clearWorkoutForm() {
  const form = elements.workoutForm;
  form.reset();
  form.editId.value = "";
  form.intensity.value = "متوسطة";
  form.focus.value = "strength";
  form.sortOrder.value = "10";
  elements.cancelWorkoutEditBtn.classList.add("hidden");
  elements.saveWorkoutBtn.textContent = "نشر فيديو التدريب";
}

function clearLibraryForm() {
  if (!elements.libraryForm) return;
  const form = elements.libraryForm;
  form.reset();
  form.editId.value = "";
  form.intensity.value = "متوسطة";
  form.focus.value = "strength";
  if (form.sortOrder) form.sortOrder.value = "10";
  if (elements.cancelLibraryEditBtn) elements.cancelLibraryEditBtn.classList.add("hidden");
  if (elements.saveLibraryBtn) elements.saveLibraryBtn.textContent = "حفظ في المكتبة";
}

function clearMealForm() {
  const form = elements.mealForm;
  form.reset();
  form.editId.value = "";
  form.sortOrder.value = "10";
  elements.cancelMealEditBtn.classList.add("hidden");
  elements.saveMealBtn.textContent = "نشر الوجبة";
}

function clearNutritionTemplateForm() {
  if (!elements.nutritionTemplateForm) return;
  const form = elements.nutritionTemplateForm;
  form.reset();
  form.editId.value = "";
  form.caseType.value = "general";
  form.weekDay.value = "الأحد";
  form.sortOrder.value = "10";
  if (elements.cancelTemplateEditBtn) elements.cancelTemplateEditBtn.classList.add("hidden");
  if (elements.saveTemplateBtn) elements.saveTemplateBtn.textContent = "حفظ سطر في القالب";
}

function clearPostForm() {
  const form = elements.postForm;
  form.reset();
  form.editId.value = "";
  form.authorRole.value = "فريق MOVE";
  elements.cancelPostEditBtn.classList.add("hidden");
  elements.savePostBtn.textContent = "نشر في المجتمع";
}

function render() {
  renderKpis();
  renderRoleFocus();
  renderFinance();
  renderSpecialistProfile();
  renderActiveMemberSelect();
  renderActiveMemberProfile();
  renderMyClients();
  renderWorkouts();
  renderWorkoutLibrary();
  renderMeals();
  renderNutritionTemplates();
  renderPhysioRecovery();
  renderPosts();
  renderSupportInbox();
  renderSelectedThread();
}

function renderSpecialistProfile() {
  if (!elements.specialistProfileForm) return;
  const form = elements.specialistProfileForm;
  if (document.activeElement && form.contains(document.activeElement)) return;
  const profile = state.specialistProfile || {};
  form.displayName.value = profile.displayName || (state.user && state.user.email ? state.user.email.split("@")[0] : "");
  form.specialization.value = profile.specialization || roleLabel(state.staffRole);
  form.yearsExperience.value = profile.yearsExperience != null ? profile.yearsExperience : 0;
  form.certifications.value = profile.certifications || "";
  form.bio.value = profile.bio || "";
}

function renderWorkoutLibrary() {
  if (!elements.libraryList) return;
  if (!(state.staffRole === "coach" || state.staffRole === "admin")) {
    elements.libraryList.innerHTML = "";
    return;
  }
  if (!state.workoutLibrary.length) {
    elements.libraryList.innerHTML = '<article class="item"><strong>المكتبة فارغة</strong><p>أضف فيديوهاتك القياسية ثم طبقها على المتدربين.</p></article>';
    return;
  }

  elements.libraryList.innerHTML = state.workoutLibrary
    .map(function (item) {
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(item.title || "تمرين") + " • " + escapeHtml(item.defaultDay || "-") + '</strong>' +
        '<p>' + escapeHtml((item.durationMin || 0) + " دقيقة • " + (item.intensity || "")) + '</p>' +
        '<div class="item-actions">' +
        '<button class="ghost-btn small" type="button" data-add-library-to-member="' + item.id + '">إضافة للمتدرب النشط</button>' +
        '<button class="ghost-btn small" type="button" data-edit-library="' + item.id + '">تعديل</button>' +
        '<button class="ghost-btn small danger" type="button" data-delete-library="' + item.id + '">حذف</button>' +
        '</div>' +
        "</article>"
      );
    })
    .join("");
}

function renderNutritionTemplates() {
  if (!elements.nutritionTemplatesList) return;
  if (!(state.staffRole === "nutrition" || state.staffRole === "admin")) {
    elements.nutritionTemplatesList.innerHTML = "";
    return;
  }

  const templateNames = Array.from(new Set(state.nutritionTemplates.map(function (item) {
    return String(item.templateName || "");
  }).filter(Boolean)));

  if (elements.applyTemplateNameSelect) {
    elements.applyTemplateNameSelect.innerHTML = templateNames.length
      ? templateNames.map(function (name) {
          return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + "</option>";
        }).join("")
      : '<option value="">لا توجد قوالب</option>';
  }

  if (!state.nutritionTemplates.length) {
    elements.nutritionTemplatesList.innerHTML = '<article class="item"><strong>لا توجد قوالب بعد</strong><p>أنشئ جدولاً أسبوعياً للحالات المختلفة ثم طبقه على المتدرب.</p></article>';
    return;
  }

  elements.nutritionTemplatesList.innerHTML = state.nutritionTemplates
    .map(function (item) {
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(item.templateName || "قالب") + ' <span class="badge">' + escapeHtml(caseTypeLabel(item.caseType)) + "</span></strong>" +
        '<p>' + escapeHtml((item.weekDay || "-") + " • " + (item.time || "--:--") + " • " + (item.title || "وجبة")) + '</p>' +
        '<p>' + escapeHtml((item.kcal || 0) + " سعرة • بروتين " + (item.protein || 0) + "ج") + '</p>' +
        '<div class="item-actions">' +
        '<button class="ghost-btn small" type="button" data-edit-template="' + item.id + '">تعديل</button>' +
        '<button class="ghost-btn small danger" type="button" data-delete-template="' + item.id + '">حذف</button>' +
        '</div>' +
        "</article>"
      );
    })
    .join("");
}

function renderPhysioRecovery() {
  if (!elements.physioInjuriesList || !elements.physioFollowupsList) return;
  if (!(state.staffRole === "physio" || state.staffRole === "admin")) {
    elements.physioInjuriesList.innerHTML = "";
    elements.physioFollowupsList.innerHTML = "";
    return;
  }

  if (elements.physioFollowupForm && elements.physioFollowupForm.injuryId) {
    const injuryOptions = ['<option value="">بدون ربط مباشر</option>'].concat(
      state.injuryReports.map(function (item) {
        const label = (item.area || "إصابة") + " • " + severityLabel(item.severity);
        return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(label) + "</option>";
      })
    );
    elements.physioFollowupForm.injuryId.innerHTML = injuryOptions.join("");
  }

  elements.physioInjuriesList.innerHTML = state.injuryReports.length
    ? state.injuryReports.map(function (item) {
        return (
          '<article class="item">' +
          '<strong>' + escapeHtml(item.area || "إصابة") + " • " + escapeHtml(severityLabel(item.severity)) + '</strong>' +
          '<p>' + escapeHtml(item.note || "") + "</p>" +
          "</article>"
        );
      }).join("")
    : '<article class="item"><strong>لا توجد بلاغات إصابة</strong><p>عند الإبلاغ من المتدرب ستظهر هنا.</p></article>';

  elements.physioFollowupsList.innerHTML = state.injuryFollowups.length
    ? state.injuryFollowups.map(function (item) {
        return (
          '<article class="item">' +
          '<strong>' + escapeHtml(followupStatusLabel(item.status)) + '</strong>' +
          '<p>' + escapeHtml(item.plan || "") + "</p>" +
          '<p>' + escapeHtml(item.nextCheckDate ? "المراجعة القادمة: " + item.nextCheckDate : "بدون موعد متابعة") + "</p>" +
          "</article>"
        );
      }).join("")
    : '<article class="item"><strong>لا توجد متابعات علاجية</strong><p>أضف أول متابعة للمتدرب النشط.</p></article>';
}

function renderActiveMemberProfile() {
  if (!elements.activeMemberProfileCard) return;
  if (!state.activeMemberUid) {
    elements.activeMemberProfileCard.innerHTML = "";
    return;
  }

  const profile = state.memberProfilesByUid[state.activeMemberUid] || {};
  const reminder = String(profile.reminderTime || "غير محدد");
  const preferredDays = Array.isArray(profile.preferredDays) && profile.preferredDays.length
    ? profile.preferredDays.join("، ")
    : "غير محدد";

  elements.activeMemberProfileCard.innerHTML =
    '<article class="item">' +
    '<strong>تفضيلات المتدرب النشط</strong>' +
    '<p>تذكير التدريب: ' + escapeHtml(reminder) + '</p>' +
    '<p>الأيام المفضلة: ' + escapeHtml(preferredDays) + '</p>' +
    '</article>';
}

function renderFinance() {
  if (!elements.financeClients || !elements.financeGross || !elements.financeShare || !elements.financePayout) return;

  const share = Number(ROLE_SHARE[state.staffRole] || 0);
  const subscriptions = state.visibleSubscriptions.slice();
  const gross = subscriptions.reduce(function (sum, item) {
    const price = Number(PLAN_PRICES[item.planId] || 0);
    return sum + price;
  }, 0);
  const payout = Math.round(gross * share);

  elements.financeClients.textContent = String(subscriptions.length);
  elements.financeGross.textContent = formatCurrency(gross);
  elements.financeShare.textContent = Math.round(share * 100) + "%";
  elements.financePayout.textContent = formatCurrency(payout);
  if (elements.financePayoutMonth && elements.financePayoutStatus) {
    const latest = state.payouts.length ? state.payouts[0] : null;
    if (latest) {
      elements.financePayoutMonth.textContent = "مستحق " + String(latest.month || "-");
      elements.financePayoutStatus.textContent = "الحالة: " + (latest.status === "paid" ? "Paid" : "Pending") + " • " + formatCurrency(latest.payoutAmount || 0);
    } else {
      elements.financePayoutMonth.textContent = "مستحقات شهرية";
      elements.financePayoutStatus.textContent = "لا توجد بيانات مستحقات بعد.";
    }
  }

  if (!elements.financePlanBreakdown) return;
  if (!subscriptions.length) {
    elements.financePlanBreakdown.innerHTML = '<article class="item"><strong>لا يوجد عملاء بعد</strong><p>سيظهر التحليل المالي عند تعيين أول مشترك.</p></article>';
    return;
  }

  const counts = subscriptions.reduce(function (acc, item) {
    const planId = String(item.planId || "other");
    acc[planId] = Number(acc[planId] || 0) + 1;
    return acc;
  }, {});

  elements.financePlanBreakdown.innerHTML = Object.keys(counts)
    .map(function (planId) {
      const count = Number(counts[planId] || 0);
      const price = Number(PLAN_PRICES[planId] || 0);
      const total = count * price;
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(planLabel(planId)) + '</strong>' +
        '<p>' + escapeHtml(count + " مشترك • " + formatCurrency(total)) + '</p>' +
        '</article>'
      );
    })
    .join("");
}

function renderKpis() {
  const threads = buildThreads();
  const assignedClients = state.visibleSubscriptions.length;
  const workoutsCount = state.workouts.length;
  const mealsCount = state.meals.length;
  const templatesCount = state.nutritionTemplates.length;
  const injuriesCount = state.injuryReports.length;
  const followupsCount = state.injuryFollowups.length;

  if (state.staffRole === "nutrition") {
    elements.kpiLabel1.textContent = "عملاء التغذية";
    elements.kpiLabel2.textContent = "وجبات للعميل النشط";
    elements.kpiLabel3.textContent = "قوالب غذائية";
    elements.kpiLabel4.textContent = "محادثات نشطة";
    elements.traineesCount.textContent = String(assignedClients);
    elements.workoutsCount.textContent = String(mealsCount);
    elements.mealsCount.textContent = String(templatesCount);
    elements.threadsCount.textContent = String(threads.length);
    return;
  }

  if (state.staffRole === "physio") {
    elements.kpiLabel1.textContent = "حالات معيّنة";
    elements.kpiLabel2.textContent = "بلاغات إصابة";
    elements.kpiLabel3.textContent = "متابعات علاجية";
    elements.kpiLabel4.textContent = "محادثات نشطة";
    elements.traineesCount.textContent = String(assignedClients);
    elements.workoutsCount.textContent = String(injuriesCount);
    elements.mealsCount.textContent = String(followupsCount);
    elements.threadsCount.textContent = String(threads.length);
    return;
  }

  if (state.staffRole === "admin") {
    elements.kpiLabel1.textContent = "إجمالي العملاء";
    elements.kpiLabel2.textContent = "خطة تدريب نشطة";
    elements.kpiLabel3.textContent = "خطة غذائية نشطة";
    elements.kpiLabel4.textContent = "محادثات نشطة";
    elements.traineesCount.textContent = String(assignedClients);
    elements.workoutsCount.textContent = String(workoutsCount);
    elements.mealsCount.textContent = String(mealsCount);
    elements.threadsCount.textContent = String(threads.length);
    return;
  }

  elements.kpiLabel1.textContent = "متدربين";
  elements.kpiLabel2.textContent = "فيديوهات تدريب";
  elements.kpiLabel3.textContent = "مكتبة المدرب";
  elements.kpiLabel4.textContent = "محادثات نشطة";
  elements.traineesCount.textContent = String(assignedClients);
  elements.workoutsCount.textContent = String(workoutsCount);
  elements.mealsCount.textContent = String(state.workoutLibrary.length);
  elements.threadsCount.textContent = String(threads.length);
}

function renderRoleFocus() {
  if (!elements.roleFocusSection || !elements.roleFocusList || !elements.roleFocusTitle || !elements.roleFocusBadge) return;

  const activeMemberName = state.activeMemberUid ? memberNameByUid(state.activeMemberUid) : "لا يوجد متدرب محدد";
  let title = "أولويات المدرب";
  let tasks = [
    "راجِع خطة العميل النشط وحدّث الشدة إذا ظهر تعب أو ألم.",
    "أضف تمرين أو بديل آمن لكل يوم ناقص.",
    "تابع محادثات العملاء المفتوحة قبل نهاية اليوم."
  ];

  if (state.staffRole === "nutrition") {
    title = "أولويات التغذية";
    tasks = [
      "راجع وجبات " + activeMemberName + " وتأكد من السعرات والمغذيات.",
      "طبّق قالب غذائي مناسب للحالة الصحية الحالية.",
      "أرسل ملاحظة غذائية قصيرة مرتبطة بالتزام اليوم."
    ];
  } else if (state.staffRole === "physio") {
    title = "أولويات العلاج الطبيعي";
    tasks = [
      "راجع بلاغات الإصابة الحديثة للحالة النشطة.",
      "حدّث خطة العلاج وموعد المراجعة القادمة.",
      "أبلغ المدرب فوراً عند وجود تقييد حركي عالي."
    ];
  } else if (state.staffRole === "admin") {
    title = "أولويات الإدارة";
    tasks = [
      "راقب توزيع العملاء على المختصين وتغطية الفريق.",
      "راجع التنبيهات الحرجة وتحقق من الاستجابة خلال اليوم.",
      "تابع جودة المحتوى: تدريب، تغذية، ومتابعات إصابات."
    ];
  }

  elements.roleFocusTitle.textContent = title;
  elements.roleFocusBadge.textContent = roleLabel(state.staffRole);
  elements.roleFocusList.innerHTML = tasks
    .map(function (task) {
      return '<article class="item"><p>' + escapeHtml(task) + "</p></article>";
    })
    .join("");
}

function renderMyClients() {
  if (!elements.myClientsList) return;

  if (!state.visibleSubscriptions.length) {
    elements.myClientsList.innerHTML = '<article class="item"><strong>لا يوجد عملاء معيّنين</strong><p>اطلب من الأدمن تعيين مشتركين لك.</p></article>';
    return;
  }

  elements.myClientsList.innerHTML = state.visibleSubscriptions
    .slice(0, 10)
    .map(function (item) {
      const isActive = String(item.memberUid || "") === String(state.activeMemberUid || "");
      return (
        '<article class="item' + (isActive ? " active" : "") + '">' +
        '<strong>' + escapeHtml(item.fullName || "مشترك") + '</strong>' +
        '<p>' + escapeHtml((item.goal || "-") + " • " + (item.planId || "-")) + (isActive ? " • (نشط)" : "") + '</p>' +
        '<p>' + escapeHtml(item.email || "") + '</p>' +
        '</article>'
      );
    })
    .join("");
}

function renderWorkouts() {
  if (!state.activeMemberUid) {
    elements.workoutsList.innerHTML = '<article class="item"><strong>اختر متدرباً أولاً</strong><p>بعد اختيار المتدرب تظهر خطته الرياضية.</p></article>';
    return;
  }
  if (!state.workouts.length) {
    elements.workoutsList.innerHTML = '<article class="item"><strong>لا توجد فيديوهات بعد</strong><p>ابدأ بإضافة أول فيديو.</p></article>';
    return;
  }

  elements.workoutsList.innerHTML = state.workouts
    .map(function (item) {
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(item.title || "تمرين") + ' - ' + escapeHtml(item.day || "-") + '</strong>' +
        '<p>' + escapeHtml("المتدرب: " + memberNameByUid(item.memberUid || state.activeMemberUid)) + '</p>' +
        '<p>' + escapeHtml((item.durationMin || 0) + " دقيقة • " + (item.intensity || "")) + '</p>' +
        '<p>' + (item.videoUrl ? '<a target="_blank" rel="noopener noreferrer" href="' + escapeHtml(item.videoUrl) + '">رابط الفيديو</a>' : "لا يوجد رابط فيديو") + '</p>' +
        '<div class="item-actions">' +
        '<button class="ghost-btn small" type="button" data-edit-workout="' + item.id + '">تعديل</button>' +
        '<button class="ghost-btn small danger" type="button" data-delete-workout="' + item.id + '">حذف</button>' +
        '</div>' +
        '</article>'
      );
    })
    .join("");
}

function renderMeals() {
  if (!state.activeMemberUid) {
    elements.mealsList.innerHTML = '<article class="item"><strong>اختر متدرباً أولاً</strong><p>بعد اختيار المتدرب تظهر خطته الغذائية.</p></article>';
    return;
  }
  if (!state.meals.length) {
    elements.mealsList.innerHTML = '<article class="item"><strong>لا توجد وجبات بعد</strong><p>أضف خطة غذائية الآن.</p></article>';
    return;
  }

  elements.mealsList.innerHTML = state.meals
    .map(function (item) {
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(item.title || "وجبة") + ' - ' + escapeHtml(item.time || "") + '</strong>' +
        '<p>' + escapeHtml("المتدرب: " + memberNameByUid(item.memberUid || state.activeMemberUid)) + '</p>' +
        '<p>' + escapeHtml((item.kcal || 0) + " سعرة • بروتين " + (item.protein || 0) + "ج") + '</p>' +
        '<div class="item-actions">' +
        '<button class="ghost-btn small" type="button" data-edit-meal="' + item.id + '">تعديل</button>' +
        '<button class="ghost-btn small danger" type="button" data-delete-meal="' + item.id + '">حذف</button>' +
        '</div>' +
        '</article>'
      );
    })
    .join("");
}

function renderPosts() {
  if (!state.posts.length) {
    elements.postsList.innerHTML = '<article class="item"><strong>لا توجد منشورات بعد</strong><p>أضف منشور توعوي للمجتمع.</p></article>';
    return;
  }

  elements.postsList.innerHTML = state.posts
    .slice(0, 12)
    .map(function (item) {
      return (
        '<article class="item">' +
        '<strong>' + escapeHtml(item.title || "منشور") + '</strong>' +
        '<p>' + escapeHtml(item.body || "") + '</p>' +
        '<div class="item-actions">' +
        '<button class="ghost-btn small" type="button" data-edit-post="' + item.id + '">تعديل</button>' +
        '<button class="ghost-btn small danger" type="button" data-delete-post="' + item.id + '">حذف</button>' +
        '</div>' +
        '</article>'
      );
    })
    .join("");
}

function renderSupportInbox() {
  const threads = buildThreads().filter(function (thread) {
    if (!state.threadSearch) return true;
    const hay = ((thread.memberName || "") + " " + (thread.threadId || "") + " " + (thread.lastText || "")).toLowerCase();
    return hay.includes(state.threadSearch);
  });

  if (!threads.length) {
    elements.threadsList.innerHTML = '<article class="item"><strong>لا توجد محادثات</strong><p>ستظهر هنا رسائل المتدربين.</p></article>';
    return;
  }

  elements.threadsList.innerHTML = threads
    .map(function (thread) {
      return (
        '<article class="item thread-item' + (thread.threadId === state.selectedThreadId ? " active" : "") + '" data-thread-id="' + escapeHtml(thread.threadId) + '">' +
        '<strong>' + escapeHtml(thread.memberName || "مشترك") + ' <span class="badge">' + escapeHtml(roleLabel(thread.lastTargetRole || "coach")) + '</span></strong>' +
        '<p>' + escapeHtml(thread.lastText || "") + '</p>' +
        '</article>'
      );
    })
    .join("");
}

function renderSelectedThread() {
  if (!state.selectedThreadId) {
    elements.selectedThreadTitle.textContent = "اختر محادثة";
    elements.threadMessages.innerHTML = '<div class="bubble coach">لا توجد رسائل حالياً.</div>';
    return;
  }

  const threadMessages = state.supportMessages.filter(function (message) {
    return message.threadId === state.selectedThreadId;
  });

  elements.selectedThreadTitle.textContent = "محادثة " + memberNameByUid(state.selectedThreadId);

  if (!threadMessages.length) {
    elements.threadMessages.innerHTML = '<div class="bubble coach">لا توجد رسائل داخل هذه المحادثة.</div>';
    return;
  }

  elements.threadMessages.innerHTML = threadMessages
    .map(function (message) {
      return '<div class="bubble ' + (message.senderRole === "member" ? "member" : "coach") + '">' + escapeHtml(message.text || "") + '</div>';
    })
    .join("");
  elements.threadMessages.scrollTop = elements.threadMessages.scrollHeight;
}

function buildThreads() {
  const bucket = new Map();

  state.supportMessages.forEach(function (message) {
    const id = String(message.threadId || "");
    if (!id) return;

    const current = bucket.get(id);
    if (!current || toMillis(message.createdAt) > current.time) {
      bucket.set(id, {
        threadId: id,
        memberName: message.senderRole === "member"
          ? message.senderName
          : (current ? current.memberName : memberNameByUid(id)),
        lastText: message.text || "",
        lastTargetRole: message.senderRole === "member" ? message.targetRole : message.senderRole,
        time: toMillis(message.createdAt)
      });
    }
  });

  return Array.from(bucket.values()).sort(function (a, b) {
    return b.time - a.time;
  });
}

function filterSubscriptionsForStaff(subscriptions) {
  if (state.staffRole === "admin") {
    return subscriptions.slice();
  }

  return subscriptions.filter(function (item) {
    if (state.staffRole === "coach") return item.assignedCoachUid === state.user.uid;
    if (state.staffRole === "nutrition") return item.assignedNutritionUid === state.user.uid;
    if (state.staffRole === "physio") return item.assignedPhysioUid === state.user.uid;
    return false;
  });
}

function memberNameByUid(memberUid) {
  const item = state.visibleSubscriptions.find(function (entry) {
    return String(entry.memberUid || "") === String(memberUid || "");
  });
  return item ? item.fullName || "مشترك" : "مشترك";
}

function messageVisibleToStaff(message) {
  if (state.staffRole === "admin") return true;

  const senderRole = String(message.senderRole || "");
  const targetRole = String(message.targetRole || "");

  if (senderRole === state.staffRole) return true;
  if (targetRole === state.staffRole) return true;

  if (state.staffRole === "coach" && senderRole === "member" && !targetRole) {
    return true;
  }

  return false;
}

function renderActiveMemberSelect() {
  if (!elements.activeMemberSelect) return;

  const options = ['<option value="">اختر متدرب...</option>']
    .concat(
      state.visibleSubscriptions.map(function (item) {
        const label = (item.fullName || "مشترك") + " - " + (item.phone || item.email || item.memberUid || "");
        return '<option value="' + escapeHtml(item.memberUid || "") + '">' + escapeHtml(label) + "</option>";
      })
    )
    .join("");

  elements.activeMemberSelect.innerHTML = options;
  elements.activeMemberSelect.value = state.activeMemberUid || "";
}

async function onActiveMemberChanged() {
  if (!elements.activeMemberSelect) return;
  state.activeMemberUid = String(elements.activeMemberSelect.value || "");
  clearWorkoutForm();
  clearMealForm();
  clearLibraryForm();
  clearNutritionTemplateForm();
  elements.dashboardMessage.textContent = "جاري تحميل خطة المتدرب...";
  await Promise.all([loadWorkouts(), loadMeals(), loadInjuryReports(), loadInjuryFollowups()]);
  const threads = buildThreads();
  state.selectedThreadId = threads.length ? threads[0].threadId : null;
  renderWorkouts();
  renderWorkoutLibrary();
  renderMeals();
  renderNutritionTemplates();
  renderPhysioRecovery();
  renderActiveMemberProfile();
  renderSupportInbox();
  renderSelectedThread();
  renderKpis();
  renderMyClients();
  elements.dashboardMessage.textContent = state.activeMemberUid ? "تم تحديث خطة المتدرب." : "اختر متدرباً لإدارة الخطة.";
}

function getActiveMemberUid() {
  if (elements.activeMemberSelect) {
    state.activeMemberUid = String(elements.activeMemberSelect.value || state.activeMemberUid || "");
  }
  return state.activeMemberUid;
}

function roleLabel(role) {
  if (role === "coach") return "مدرب بدني";
  if (role === "nutrition") return "أخصائي تغذية";
  if (role === "physio") return "أخصائي علاج طبيعي";
  if (role === "admin") return "إدارة";
  return role || "Staff";
}

function caseTypeLabel(caseType) {
  if (caseType === "insulin-resistance") return "مقاومة إنسولين";
  if (caseType === "weight-loss") return "خسارة وزن";
  if (caseType === "allergy-friendly") return "حساسية غذائية";
  return "عام";
}

function followupStatusLabel(status) {
  if (status === "under-review") return "قيد المتابعة";
  if (status === "improving") return "تحسن";
  if (status === "stable") return "مستقرة";
  if (status === "closed") return "مغلقة";
  return "متابعة";
}

function severityLabel(value) {
  const severity = Number(value || 1);
  if (severity >= 3) return "شديدة";
  if (severity === 2) return "متوسطة";
  return "خفيفة";
}

function planLabel(planId) {
  if (planId === "move-plus") return "MOVE Plus";
  if (planId === "move-pro") return "MOVE Pro Team";
  return planId || "Plan";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ar-SA").format(Number(value || 0)) + " ر.س";
}

function applyRoleExperience() {
  const isCoachRole = state.staffRole === "coach" || state.staffRole === "admin";
  const isNutritionRole = state.staffRole === "nutrition" || state.staffRole === "admin";
  const isPhysioRole = state.staffRole === "physio" || state.staffRole === "admin";
  const canPublishCommunity = state.staffRole === "admin" || state.staffRole === "coach";
  const titleByRole = {
    coach: "لوحة المدرب البدني",
    nutrition: "لوحة أخصائي التغذية",
    physio: "لوحة العلاج الطبيعي",
    admin: "لوحة الإدارة"
  };

  if (elements.dashboardRoleTitle) {
    elements.dashboardRoleTitle.textContent = titleByRole[state.staffRole] || "لوحة الفريق";
  }

  if (elements.workoutSection) {
    elements.workoutSection.classList.toggle("hidden", !isCoachRole);
  }
  if (elements.librarySection) {
    elements.librarySection.classList.toggle("hidden", !isCoachRole);
  }
  if (elements.mealSection) {
    elements.mealSection.classList.toggle("hidden", !isNutritionRole);
  }
  if (elements.nutritionTemplateSection) {
    elements.nutritionTemplateSection.classList.toggle("hidden", !isNutritionRole);
  }
  if (elements.physioRecoverySection) {
    elements.physioRecoverySection.classList.toggle("hidden", !isPhysioRole);
  }
  if (elements.postSection) {
    elements.postSection.classList.toggle("hidden", !canPublishCommunity);
  }
}

function toMillis(timestampValue) {
  if (!timestampValue) return 0;
  if (typeof timestampValue.toMillis === "function") return timestampValue.toMillis();
  if (typeof timestampValue.seconds === "number") return timestampValue.seconds * 1000;
  return 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isLikelyHttpUrl(value) {
  return /^https?:\/\/.+/i.test(String(value || "").trim());
}

function setFormBusy(button, busy, busyText, idleText) {
  if (!button) return;
  if (idleText) {
    button.dataset.defaultText = idleText;
  }
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent || "";
  }
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.defaultText;
}
