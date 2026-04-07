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

const elements = {};
const state = {
  user: null,
  isStaff: false,
  staffRole: "coach",
  activeMemberUid: "",
  subscriptions: [],
  visibleSubscriptions: [],
  myClientMemberUids: [],
  workouts: [],
  meals: [],
  posts: [],
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
  elements.dashboardMessage = document.getElementById("coachDashboardMessage");

  elements.traineesCount = document.getElementById("coachTraineesCount");
  elements.workoutsCount = document.getElementById("coachWorkoutsCount");
  elements.mealsCount = document.getElementById("coachMealsCount");
  elements.threadsCount = document.getElementById("coachThreadsCount");
  elements.staffRoleBadge = document.getElementById("staffRoleBadge");
  elements.myClientsList = document.getElementById("myClientsList");
  elements.activeMemberSelect = document.getElementById("activeMemberSelect");
  elements.workoutSection = document.getElementById("coachWorkoutSection");
  elements.mealSection = document.getElementById("coachMealSection");
  elements.postSection = document.getElementById("coachPostSection");

  elements.workoutForm = document.getElementById("coachWorkoutForm");
  elements.workoutsList = document.getElementById("coachWorkoutsList");
  elements.cancelWorkoutEditBtn = document.getElementById("cancelWorkoutEditBtn");
  elements.saveWorkoutBtn = document.getElementById("saveWorkoutBtn");

  elements.mealForm = document.getElementById("coachMealForm");
  elements.mealsList = document.getElementById("coachMealsList");
  elements.cancelMealEditBtn = document.getElementById("cancelMealEditBtn");
  elements.saveMealBtn = document.getElementById("saveMealBtn");

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

  elements.cancelWorkoutEditBtn.addEventListener("click", clearWorkoutForm);
  elements.cancelMealEditBtn.addEventListener("click", clearMealForm);
  elements.cancelPostEditBtn.addEventListener("click", clearPostForm);

  elements.workoutsList.addEventListener("click", onWorkoutListAction);
  elements.mealsList.addEventListener("click", onMealListAction);
  elements.postsList.addEventListener("click", onPostListAction);
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
  await Promise.all([
    loadWorkouts(),
    loadMeals(),
    loadPosts()
  ]);

  render();
  elements.dashboardMessage.textContent = "تم تحديث البيانات.";
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

function clearMealForm() {
  const form = elements.mealForm;
  form.reset();
  form.editId.value = "";
  form.sortOrder.value = "10";
  elements.cancelMealEditBtn.classList.add("hidden");
  elements.saveMealBtn.textContent = "نشر الوجبة";
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
  renderActiveMemberSelect();
  renderMyClients();
  renderWorkouts();
  renderMeals();
  renderPosts();
  renderSupportInbox();
  renderSelectedThread();
}

function renderKpis() {
  const threads = buildThreads();
  elements.traineesCount.textContent = String(state.visibleSubscriptions.length);
  elements.workoutsCount.textContent = String(state.workouts.length);
  elements.mealsCount.textContent = String(state.meals.length);
  elements.threadsCount.textContent = String(threads.length);
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
        '<strong>' + escapeHtml(thread.memberName || "مشترك") + '</strong>' +
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
  elements.dashboardMessage.textContent = "جاري تحميل خطة المتدرب...";
  await Promise.all([loadWorkouts(), loadMeals()]);
  const threads = buildThreads();
  state.selectedThreadId = threads.length ? threads[0].threadId : null;
  renderWorkouts();
  renderMeals();
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

function applyRoleExperience() {
  const isCoachRole = state.staffRole === "coach" || state.staffRole === "admin";
  const isNutritionRole = state.staffRole === "nutrition" || state.staffRole === "admin";
  const canPublishCommunity = state.staffRole === "admin" || state.staffRole === "coach";

  if (elements.workoutSection) {
    elements.workoutSection.classList.toggle("hidden", !isCoachRole);
  }
  if (elements.mealSection) {
    elements.mealSection.classList.toggle("hidden", !isNutritionRole);
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
