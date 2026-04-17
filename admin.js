import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db } from "./firebase-client.js";

const state = {
  user: null,
  hasAdminAccess: false,
  coachEntries: [],
  traineeEntries: [],
  filters: {
    search: "",
    coachSport: "all",
    dateRange: "all"
  }
};

const elements = {};

window.addEventListener("DOMContentLoaded", function () {
  cacheElements();
  bindEvents();
  onAuthStateChanged(auth, handleAuthStateChanged);
});

function cacheElements() {
  elements.authCard = document.getElementById("authCard");
  elements.dashboardCard = document.getElementById("dashboardCard");
  elements.loginForm = document.getElementById("adminLoginForm");
  elements.loginButton = document.getElementById("loginButton");
  elements.authMessage = document.getElementById("authMessage");
  elements.dashboardMessage = document.getElementById("dashboardMessage");
  elements.currentUserEmail = document.getElementById("currentUserEmail");
  elements.currentUserUid = document.getElementById("currentUserUid");
  elements.signupsCount = document.getElementById("signupsCount");
  elements.coachesCount = document.getElementById("coachesCount");
  elements.traineesCount = document.getElementById("traineesCount");
  elements.latestSignup = document.getElementById("latestSignup");
  elements.accessState = document.getElementById("accessState");
  elements.setupNote = document.getElementById("setupNote");
  elements.entriesState = document.getElementById("entriesState");
  elements.traineeEntriesState = document.getElementById("traineeEntriesState");
  elements.entriesMeta = document.getElementById("entriesMeta");
  elements.traineeEntriesMeta = document.getElementById("traineeEntriesMeta");
  elements.coachEntriesList = document.getElementById("coachEntriesList");
  elements.traineeEntriesList = document.getElementById("traineeEntriesList");
  elements.registrationsSearchInput = document.getElementById("registrationsSearchInput");
  elements.coachSportFilter = document.getElementById("coachSportFilter");
  elements.dateFilter = document.getElementById("dateFilter");
  elements.refreshButton = document.getElementById("refreshButton");
  elements.exportButton = document.getElementById("exportButton");
  elements.copyUidButton = document.getElementById("copyUidButton");
  elements.signOutButton = document.getElementById("signOutButton");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.refreshButton.addEventListener("click", refreshDashboard);
  elements.exportButton.addEventListener("click", exportCsv);
  elements.copyUidButton.addEventListener("click", copyUid);
  elements.signOutButton.addEventListener("click", handleSignOut);

  const generateRefBtn = document.getElementById("generateRefBtn");
  const customRefInput = document.getElementById("customRefInput");
  const generatedRefResult = document.getElementById("generatedRefResult");
  const generatedRefLink = document.getElementById("generatedRefLink");
  const copyGeneratedRef = document.getElementById("copyGeneratedRef");

  if (generateRefBtn && customRefInput) {
    generateRefBtn.addEventListener("click", function () {
      const code = customRefInput.value.trim().toUpperCase();
      if (!code) return;
      const link = window.location.origin + "/?ref=" + code;
      generatedRefLink.textContent = link;
      generatedRefResult.classList.remove("panel-hidden");
    });
    copyGeneratedRef.addEventListener("click", function () {
      navigator.clipboard.writeText(generatedRefLink.textContent).then(function () {
        copyGeneratedRef.textContent = "✓ تم النسخ";
        setTimeout(function () { copyGeneratedRef.textContent = "نسخ"; }, 2000);
      });
    });
  }
  if (elements.registrationsSearchInput) {
    elements.registrationsSearchInput.addEventListener("input", function () {
      state.filters.search = String(elements.registrationsSearchInput.value || "").trim().toLowerCase();
      renderEntries();
    });
  }
  if (elements.coachSportFilter) {
    elements.coachSportFilter.addEventListener("change", function () {
      state.filters.coachSport = String(elements.coachSportFilter.value || "all");
      renderEntries();
    });
  }
  if (elements.dateFilter) {
    elements.dateFilter.addEventListener("change", function () {
      state.filters.dateRange = String(elements.dateFilter.value || "all");
      renderEntries();
    });
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = event.currentTarget.email.value.trim();
  const password = event.currentTarget.password.value;

  if (!email || !password) {
    setAuthMessage("يرجى إدخال البريد وكلمة المرور.");
    return;
  }

  setAuthLoading(true);
  setAuthMessage("جارٍ تسجيل الدخول...");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    event.currentTarget.reset();
    setAuthMessage("");
  } catch (error) {
    console.error("Admin sign-in failed", error);
    setAuthMessage(getFriendlyAuthError(error));
  } finally {
    setAuthLoading(false);
  }
}

async function handleAuthStateChanged(user) {
  state.user = user;
  state.hasAdminAccess = false;
  state.coachEntries = [];
  state.traineeEntries = [];
  renderEntries();

  if (!user) {
    showSignedOutState();
    return;
  }

  showDashboardState();
  elements.currentUserEmail.textContent = user.email || "بدون بريد";
  elements.currentUserUid.textContent = user.uid;
  elements.accessState.textContent = "جارٍ التحقق";
  elements.signupsCount.textContent = "0";
  elements.coachesCount.textContent = "0";
  elements.traineesCount.textContent = "0";
  elements.latestSignup.textContent = "لا يوجد";
  elements.entriesState.textContent = "جارٍ التحقق من صلاحية الأدمن...";
  elements.traineeEntriesState.textContent = "جارٍ التحقق من صلاحية الأدمن...";

  try {
    const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnapshot.exists()) {
      state.hasAdminAccess = false;
      elements.accessState.textContent = "غير مفعل";
      elements.setupNote.classList.remove("panel-hidden");
      elements.entriesState.textContent = "أضف الحساب داخل admins في Firestore.";
      elements.traineeEntriesState.textContent = "أضف الحساب داخل admins في Firestore.";
      setDashboardMessage("هذا الحساب غير مضاف كأدمن في قاعدة البيانات.");
      updateActionState();
      return;
    }

    state.hasAdminAccess = true;
    elements.accessState.textContent = "مفعل";
    elements.setupNote.classList.add("panel-hidden");
    await loadRegistrations();
  } catch (error) {
    console.error("Failed to verify admin access", error);
    elements.accessState.textContent = "خطأ";
    elements.setupNote.classList.remove("panel-hidden");
    elements.entriesState.textContent = "تعذر التحقق من الصلاحية.";
    elements.traineeEntriesState.textContent = "تعذر التحقق من الصلاحية.";
    setDashboardMessage(getFriendlyFirestoreError(error));
    updateActionState();
  }
}

function showSignedOutState() {
  elements.authCard.classList.remove("panel-hidden");
  elements.dashboardCard.classList.add("panel-hidden");
  elements.setupNote.classList.add("panel-hidden");
  setDashboardMessage("");
  setAuthMessage("ادخل بحساب Firebase Admin.");
  if (elements.registrationsSearchInput) elements.registrationsSearchInput.value = "";
  if (elements.coachSportFilter) elements.coachSportFilter.value = "all";
  if (elements.dateFilter) elements.dateFilter.value = "all";
  state.filters.search = "";
  state.filters.coachSport = "all";
  state.filters.dateRange = "all";
  updateActionState();
}

function showDashboardState() {
  elements.authCard.classList.add("panel-hidden");
  elements.dashboardCard.classList.remove("panel-hidden");
  setAuthMessage("");
  if (elements.registrationsSearchInput) elements.registrationsSearchInput.value = state.filters.search;
  if (elements.coachSportFilter) elements.coachSportFilter.value = state.filters.coachSport;
  if (elements.dateFilter) elements.dateFilter.value = state.filters.dateRange;
  updateActionState();
}

async function loadRegistrations() {
  elements.entriesState.textContent = "جارٍ تحميل تسجيلات المدربين...";
  elements.traineeEntriesState.textContent = "جارٍ تحميل تسجيلات المتدربين...";

  try {
    const coachQuery = query(collection(db, "coachApplications"), orderBy("createdAt", "desc"));
    const traineeQuery = query(collection(db, "traineeInterests"), orderBy("createdAt", "desc"));

    const [coachSnapshot, traineeSnapshot] = await Promise.all([
      getDocs(coachQuery),
      getDocs(traineeQuery)
    ]);

    state.coachEntries = coachSnapshot.docs.map(function (docSnapshot) {
      return Object.assign({ id: docSnapshot.id }, docSnapshot.data());
    });
    state.traineeEntries = traineeSnapshot.docs.map(function (docSnapshot) {
      return Object.assign({ id: docSnapshot.id }, docSnapshot.data());
    });

    renderEntries();
    setDashboardMessage("تم تحديث بيانات التسجيلات بنجاح.");
    updateActionState();
  } catch (error) {
    console.error("Failed to read registrations", error);
    state.coachEntries = [];
    state.traineeEntries = [];
    renderEntries();
    setDashboardMessage(getFriendlyFirestoreError(error));
    updateActionState();
  }
}

async function refreshDashboard() {
  if (!state.user) return;
  setDashboardMessage("جارٍ التحديث...");
  await handleAuthStateChanged(state.user);
}

async function handleSignOut() {
  await signOut(auth);
}

async function copyUid() {
  if (!state.user) return;

  try {
    await navigator.clipboard.writeText(state.user.uid);
    setDashboardMessage("تم نسخ UID.");
  } catch (error) {
    console.error("Failed to copy UID", error);
    setDashboardMessage("تعذر النسخ. انسخ UID يدويًا.");
  }
}

function exportCsv() {
  const coachEntries = getFilteredCoachEntries();
  const traineeEntries = getFilteredTraineeEntries();
  const total = coachEntries.length + traineeEntries.length;
  if (!total) {
    setDashboardMessage("لا توجد بيانات للتصدير.");
    return;
  }

  const rows = [
    [
      "type",
      "fullName",
      "email",
      "phone",
      "specialization_or_goal",
      "sport",
      "fitnessLevel",
      "coachingType",
      "coachingLocation_or_trainingLocation",
      "experience_or_equipment",
      "createdAt",
      "documentId"
    ]
  ];

  coachEntries.forEach(function (entry) {
    rows.push([
      "coach",
      entry.fullName || "",
      entry.email || "",
      entry.phone || "",
      entry.specialization || "",
      entry.sportCategory || "",
      "",
      entry.coachingType || "",
      entry.coachingLocation || "",
      entry.experienceDetails || "",
      formatDate(entry.createdAt),
      entry.id || ""
    ]);
  });

  traineeEntries.forEach(function (entry) {
    rows.push([
      "trainee",
      entry.fullName || "",
      entry.email || "",
      entry.phone || "",
      entry.goal || "",
      entry.sportType || "",
      entry.fitnessLevel || "",
      "",
      entry.trainingLocation || "",
      entry.equipment || "",
      formatDate(entry.createdAt),
      entry.id || ""
    ]);
  });

  const csv = rows
    .map(function (row) {
      return row.map(escapeCsvValue).join(",");
    })
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "move-registrations.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDashboardMessage("تم تصدير CSV.");
}

function renderEntries() {
  const coachEntries = getFilteredCoachEntries();
  const traineeEntries = getFilteredTraineeEntries();
  const total = coachEntries.length + traineeEntries.length;
  const totalRaw = state.coachEntries.length + state.traineeEntries.length;

  elements.signupsCount.textContent = String(total);
  elements.coachesCount.textContent = String(coachEntries.length);
  elements.traineesCount.textContent = String(traineeEntries.length);
  elements.latestSignup.textContent = getLatestSignupLabel();

  elements.entriesMeta.textContent = coachEntries.length
    ? coachEntries.length + " مدرب" + (totalRaw !== total ? " (بعد الفلترة)" : "")
    : "الأحدث أولاً";
  elements.traineeEntriesMeta.textContent = traineeEntries.length
    ? traineeEntries.length + " متدرب" + (totalRaw !== total ? " (بعد الفلترة)" : "")
    : "الأحدث أولاً";

  elements.coachEntriesList.innerHTML = "";
  elements.traineeEntriesList.innerHTML = "";

  if (!coachEntries.length) {
    elements.entriesState.textContent = state.hasAdminAccess
      ? "لا توجد تسجيلات مدربين بعد."
      : "بانتظار صلاحية الأدمن.";
  } else {
    elements.entriesState.textContent = "";
    coachEntries.forEach(function (entry) {
      const item = document.createElement("li");
      item.className = "entries-item";
      item.innerHTML =
        '<div>' +
        '<strong class="entry-email">' + escapeHtml(entry.fullName || "-") + "</strong>" +
        '<div class="entry-date">' + escapeHtml(entry.email || "-") + " • " + escapeHtml(entry.phone || "-") + "</div>" +
        "</div>" +
        '<div class="entry-meta">' +
        '<span class="entry-badge">' + escapeHtml(formatSportLabel(entry.sportCategory)) + "</span>" +
        '<div class="entry-date">' + escapeHtml(formatSpecializationLabel(entry.specialization)) + "</div>" +
        "</div>" +
        '<div class="entry-meta">ID: ' + escapeHtml(entry.id || "-") + "<br>" + escapeHtml(formatDate(entry.createdAt)) + "</div>" +
        renderCoachProfileDetails(entry);
      elements.coachEntriesList.appendChild(item);
    });
  }

  if (!traineeEntries.length) {
    elements.traineeEntriesState.textContent = state.hasAdminAccess
      ? "لا توجد تسجيلات متدربين بعد."
      : "بانتظار صلاحية الأدمن.";
  } else {
    elements.traineeEntriesState.textContent = "";
    traineeEntries.forEach(function (entry) {
      const item = document.createElement("li");
      item.className = "entries-item";
      item.innerHTML =
        '<div>' +
        '<strong class="entry-email">' + escapeHtml(entry.fullName || "-") + "</strong>" +
        '<div class="entry-date">' + escapeHtml(entry.email || "-") + " • " + escapeHtml(entry.phone || "-") + "</div>" +
        "</div>" +
        '<div class="entry-meta">' +
        '<span class="entry-badge">' + escapeHtml(formatGoalLabel(entry.goal)) + "</span>" +
        '<div class="entry-date">' + escapeHtml(formatSportLabel(entry.sportType)) + " • " + escapeHtml(formatFitnessLevelLabel(entry.fitnessLevel)) + " • " + escapeHtml(formatTrainingLocationLabel(entry.trainingLocation)) + "</div>" +
        "</div>" +
        '<div class="entry-meta">ID: ' + escapeHtml(entry.id || "-") + "<br>" + escapeHtml(formatDate(entry.createdAt)) + "</div>" +
        renderTraineeProfileDetails(entry);
      elements.traineeEntriesList.appendChild(item);
    });
  }

  bindProfileAccordion(elements.coachEntriesList);
  bindProfileAccordion(elements.traineeEntriesList);
}

function renderRefSection(entry, collectionName) {
  const incomingCode = entry.referralCode
    ? '<div class="ref-incoming">سجّل من رابط: <strong>' + escapeHtml(entry.referralCode) + '</strong></div>'
    : '<div class="ref-incoming ref-direct">سجّل مباشرة (بدون رابط)</div>';

  const customCode = entry.customCode ? entry.customCode.toUpperCase() : "";
  const refLink = customCode ? window.location.origin + "/?ref=" + customCode : "";

  const ownCodeSection = customCode
    ? '<div class="entry-ref-box">' +
      '<span>' + escapeHtml(refLink) + '</span>' +
      '<button type="button" class="copy-ref-btn" data-link="' + escapeHtml(refLink) + '">نسخ</button>' +
      '<button type="button" class="change-code-btn" data-id="' + escapeHtml(entry.id) + '" data-collection="' + collectionName + '">تغيير الكود</button>' +
      '</div>'
    : '<div class="assign-code-box">' +
      '<input type="text" class="assign-code-input" placeholder="اكتب كوداً مخصصاً مثل im2" maxlength="20" data-id="' + escapeHtml(entry.id) + '" data-collection="' + collectionName + '" />' +
      '<button type="button" class="assign-code-btn" data-id="' + escapeHtml(entry.id) + '" data-collection="' + collectionName + '">تعيين كود</button>' +
      '</div>';

  return (
    '<div class="entry-actions">' +
    incomingCode +
    '<div class="ref-own-label">كود الدعوة الخاص به:</div>' +
    ownCodeSection +
    '<button type="button" class="delete-entry-btn" data-id="' + escapeHtml(entry.id) + '" data-collection="' + collectionName + '">حذف التسجيل</button>' +
    "</div>"
  );
}

function renderCoachProfileDetails(entry) {
  return (
    '<details class="entry-profile">' +
    '<summary>عرض الملف الكامل</summary>' +
    '<div class="entry-profile-grid">' +
    renderProfileField("الاسم", entry.fullName) +
    renderProfileField("البريد", entry.email) +
    renderProfileField("الجوال", entry.phone) +
    renderProfileField("سنوات الخبرة", entry.yearsExperience) +
    renderProfileField("التخصص", formatSpecializationLabel(entry.specialization)) +
    renderProfileField("الرياضة", formatSportLabel(entry.sportCategory)) +
    renderProfileField("الشهادات", entry.certifications) +
    renderProfileField("المؤهل الأكاديمي", entry.academicQualification) +
    renderProfileField("نمط التدريب", formatCoachingType(entry.coachingType)) +
    renderProfileField("مكان التدريب", formatCoachingLocation(entry.coachingLocation)) +
    renderProfileField("نبذة الخبرة", entry.experienceDetails) +
    renderProfileField("التفرغ", formatAvailability(entry.availability)) +
    renderProfileField("المصدر", entry.source) +
    renderProfileField("وقت التسجيل", formatDate(entry.createdAt)) +
    renderProfileField("رقم المستند", entry.id) +
    "</div>" +
    renderRefSection(entry, "coachApplications") +
    "</details>"
  );
}

function renderTraineeProfileDetails(entry) {
  return (
    '<details class="entry-profile">' +
    '<summary>عرض الملف الكامل</summary>' +
    '<div class="entry-profile-grid">' +
    renderProfileField("الاسم", entry.fullName) +
    renderProfileField("البريد", entry.email) +
    renderProfileField("الجوال", entry.phone) +
    renderProfileField("الهدف", formatGoalLabel(entry.goal)) +
    renderProfileField("الرياضة", formatSportLabel(entry.sportType)) +
    renderProfileField("مستوى اللياقة", formatFitnessLevelLabel(entry.fitnessLevel)) +
    renderProfileField("مكان التمرين", formatTrainingLocationLabel(entry.trainingLocation)) +
    renderProfileField("المعدات", entry.equipment) +
    renderProfileField("ملاحظات صحية", entry.healthNotes) +
    renderProfileField("المصدر", entry.source) +
    renderProfileField("وقت التسجيل", formatDate(entry.createdAt)) +
    renderProfileField("رقم المستند", entry.id) +
    "</div>" +
    renderRefSection(entry, "traineeInterests") +
    "</details>"
  );
}

function renderProfileField(label, value) {
  return (
    '<div class="entry-profile-field">' +
    '<small>' + escapeHtml(label) + "</small>" +
    '<strong>' + escapeHtml(value || "-") + "</strong>" +
    "</div>"
  );
}

function bindProfileAccordion(container) {
  if (!container) return;
  container.querySelectorAll(".entry-profile").forEach(function (details) {
    details.addEventListener("toggle", function () {
      if (!details.open) return;
      container.querySelectorAll(".entry-profile").forEach(function (other) {
        if (other !== details) other.open = false;
      });
    });
  });

  container.querySelectorAll(".copy-ref-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(btn.dataset.link).then(function () {
        const prev = btn.textContent;
        btn.textContent = "✓ تم النسخ";
        setTimeout(function () { btn.textContent = prev; }, 2000);
      });
    });
  });

  container.querySelectorAll(".assign-code-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      const actions = btn.closest(".entry-actions");
      const input = actions.querySelector(".assign-code-input");
      const code = (input ? input.value : "").trim().toUpperCase();
      if (!code) { input && (input.style.borderColor = "red"); return; }
      try {
        await updateDoc(doc(db, btn.dataset.collection, btn.dataset.id), { customCode: code });
        btn.textContent = "✓ تم الحفظ";
        setTimeout(refreshDashboard, 800);
      } catch (e) {
        alert("تعذر الحفظ: " + e.message);
      }
    });
  });

  container.querySelectorAll(".change-code-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      const newCode = prompt("أدخل الكود الجديد:");
      if (!newCode || !newCode.trim()) return;
      try {
        await updateDoc(doc(db, btn.dataset.collection, btn.dataset.id), { customCode: newCode.trim().toUpperCase() });
        refreshDashboard();
      } catch (e) {
        alert("تعذر التغيير: " + e.message);
      }
    });
  });

  container.querySelectorAll(".delete-entry-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      if (!confirm("هل أنت متأكد من حذف هذا التسجيل؟")) return;
      try {
        await deleteDoc(doc(db, btn.dataset.collection, btn.dataset.id));
        btn.closest("li").remove();
      } catch (e) {
        alert("تعذر الحذف: " + e.message);
      }
    });
  });
}

function getLatestSignupLabel() {
  const all = getFilteredCoachEntries()
    .map(function (entry) {
      return { type: "مدرب", name: entry.fullName || "-", createdAt: toMillis(entry.createdAt) };
    })
    .concat(
      getFilteredTraineeEntries().map(function (entry) {
        return { type: "متدرب", name: entry.fullName || "-", createdAt: toMillis(entry.createdAt) };
      })
    )
    .sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });

  if (!all.length) return "لا يوجد";
  return all[0].type + ": " + all[0].name;
}

function updateActionState() {
  const signedIn = Boolean(state.user);
  const hasData = getFilteredCoachEntries().length + getFilteredTraineeEntries().length > 0;

  elements.refreshButton.disabled = !signedIn;
  elements.copyUidButton.disabled = !signedIn;
  elements.signOutButton.disabled = !signedIn;
  elements.exportButton.disabled = !state.hasAdminAccess || !hasData;
}

function setAuthLoading(isLoading) {
  elements.loginButton.disabled = isLoading;
  elements.loginButton.textContent = isLoading ? "جارٍ الدخول..." : "دخول";
}

function setAuthMessage(message) {
  elements.authMessage.textContent = message;
}

function setDashboardMessage(message) {
  elements.dashboardMessage.textContent = message;
}

function getFriendlyAuthError(error) {
  const code = error && error.code ? error.code : "";

  if (code === "auth/invalid-credential") {
    return "البريد أو كلمة المرور غير صحيحة.";
  }
  if (code === "auth/too-many-requests") {
    return "محاولات كثيرة. حاول بعد قليل.";
  }
  if (code === "auth/network-request-failed") {
    return "مشكلة اتصال. تحقق من الإنترنت.";
  }

  return "فشل تسجيل الدخول. تحقق من إعدادات Firebase.";
}

function getFriendlyFirestoreError(error) {
  const message = error && error.message ? error.message : "";
  const code = error && error.code ? error.code : "";

  if (message.indexOf("Database '(default)' not found") !== -1) {
    return "فعّل Firestore أولاً في مشروع Firebase ثم أعد المحاولة.";
  }
  if (code === "permission-denied") {
    return "هذا الحساب لا يملك صلاحية قراءة التسجيلات.";
  }

  return "تحقق من إعدادات Firestore ثم أعد المحاولة.";
}

function toMillis(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.seconds === "number") return timestamp.seconds * 1000;
  return 0;
}

function getFilteredCoachEntries() {
  return state.coachEntries.filter(function (entry) {
    if (!passesSearchFilter(entry)) return false;
    if (!passesDateFilter(entry.createdAt)) return false;
    if (
      state.filters.coachSport !== "all" &&
      (entry.specialization || "") !== state.filters.coachSport
    ) {
      return false;
    }
    return true;
  });
}

function getFilteredTraineeEntries() {
  return state.traineeEntries.filter(function (entry) {
    if (!passesSearchFilter(entry)) return false;
    if (!passesDateFilter(entry.createdAt)) return false;
    return true;
  });
}

function passesSearchFilter(entry) {
  const search = state.filters.search;
  if (!search) return true;
  const haystack = [
    entry.fullName,
    entry.email,
    entry.phone,
    entry.specialization,
    entry.goal,
    entry.sportCategory,
    entry.sportType
  ]
    .map(function (value) {
      return String(value || "").toLowerCase();
    })
    .join(" ");
  return haystack.indexOf(search) !== -1;
}

function passesDateFilter(createdAt) {
  const range = state.filters.dateRange;
  if (range === "all") return true;

  const millis = toMillis(createdAt);
  if (!millis) return false;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === "7d") return now - millis <= 7 * day;
  if (range === "30d") return now - millis <= 30 * day;
  if (range === "90d") return now - millis <= 90 * day;
  return true;
}

function formatDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "بانتظار وقت الخادم";
  }
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp.toDate());
}

function formatSportLabel(value) {
  const map = {
    bodybuilding: "بناء أجسام Bodybuilding",
    physique: "فيزيك Physique",
    strength: "قوة وأداء Power & Performance",
    crossfit: "كروس فيت CrossFit",
    calisthenics: "كاليسثينكس Calisthenics",
    "functional-fitness": "لياقة وظيفية Functional Fitness",
    cardio: "كارديو وتحمل Cardio & Endurance",
    running: "جري",
    cycling: "دراجة Cycling",
    powerlifting: "باور لفتنق",
    rehab: "تأهيل وإصابات Rehab",
    other: "أخرى",
    "injury-rehab-online": "تأهيل الإصابات أون لاين",
    "running-general-fitness": "جري Runningولياقة عامة",
    "strength-muscle": "بناء عضلات وقوة",
    "weight-loss-fitness": "خسارة وزن ولياقة",
    "running-cardio": "جري Runningوكارديو",
    yoga: "يوغا Yoga",
    pilates: "بيلاتس Pilates",
    "mobility-recovery": "مرونة وتعافٍ",
    "rehab-physio": "تأهيل وعلاج طبيعي"
  };
  return map[value] || "غير محدد";
}

function normalizeSportValue(value) {
  const normalized = String(value || "").trim();
  const map = {
    bodybuilding: "bodybuilding",
    physique: "physique",
    strength: "strength",
    "strength-muscle": "strength",
    crossfit: "crossfit",
    calisthenics: "calisthenics",
    "functional-fitness": "functional-fitness",
    cardio: "cardio",
    "weight-loss-fitness": "cardio",
    running: "running",
    "running-cardio": "running",
    "running-general-fitness": "running",
    cycling: "cycling",
    yoga: "yoga",
    pilates: "pilates",
    rehab: "rehab",
    "rehab-physio": "rehab",
    "injury-rehab-online": "rehab",
    "mobility-recovery": "rehab",
    other: "other"
  };
  return map[normalized] || normalized;
}


function formatSpecializationLabel(value) {
  const map = {
    "sports-training": "التدريب الرياضي",
    "sports-nutrition": "التغذية الرياضية",
    "high-performance": "الأداء العالي",
    "recovery-rehab": "الاستشفاء والتأهيل",
    "sports-psychology": "الصحة النفسية الرياضية",
    "therapeutic-nutrition": "التغذية العلاجية",
    "yoga-relaxation": "اليوغا والاسترخاء",
    "academic-qualification": "المؤهل الأكاديمي"
  };
  return map[value] || value || "غير محدد";
}

function formatGoalLabel(value) {
  const map = {
    "fat-loss": "خسارة وزن",
    "muscle-gain": "زيادة عضلات",
    fitness: "تحسين اللياقة",
    performance: "تحسين الأداء",
    rehab: "عودة بعد إصابة"
  };
  return map[value] || "غير محدد";
}

function formatFitnessLevelLabel(value) {
  const map = {
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم"
  };
  return map[value] || "غير محدد";
}

function formatTrainingLocationLabel(value) {
  const map = {
    gym: "النادي",
    home: "البيت",
    outdoor: "مساحة مفتوحة",
    both: "الاثنين"
  };
  return map[value] || "غير محدد";
}

function formatCoachingType(value) {
  const map = {
    online: "أون لاين",
    "in-person": "حضوري",
    hybrid: "هجين"
  };
  return map[value] || "غير محدد";
}

function formatCoachingLocation(value) {
  const map = {
    online: "أون لاين",
    gym: "داخل نادي",
    "home-visits": "زيارات منزلية",
    both: "الاثنين"
  };
  return map[value] || "غير محدد";
}

function formatAvailability(value) {
  const map = {
    "full-time": "دوام كامل"
  };
  return map[value] || (value ? String(value) : "غير محدد");
}

function escapeCsvValue(value) {
  return '"' + String(value || "").replace(/"/g, '""') + '"';
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
