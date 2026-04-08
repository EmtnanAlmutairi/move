import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db } from "./firebase-client.js";

const PLAN_PRICES = {
  "move-plus": 299,
  "move-pro": 499
};

const SHARE = {
  coach: 0.35,
  nutrition: 0.2,
  physio: 0.2
};

const elements = {};
const state = {
  user: null,
  isAdmin: false,
  assignmentSearch: "",
  subscriptions: [],
  memberProfilesByUid: {},
  payouts: [],
  injuries: [],
  threads: [],
  practitioners: []
};

window.addEventListener("DOMContentLoaded", function () {
  cacheElements();
  bindEvents();
  onAuthStateChanged(auth, handleAuthState);
});

function cacheElements() {
  elements.authCard = document.getElementById("authCard");
  elements.dashboardCard = document.getElementById("dashboardCard");
  elements.loginForm = document.getElementById("adminLoginForm");
  elements.loginButton = document.getElementById("loginButton");
  elements.authMessage = document.getElementById("authMessage");
  elements.dashboardMessage = document.getElementById("dashboardMessage");
  elements.configForm = document.getElementById("configForm");
  elements.refreshButton = document.getElementById("refreshButton");
  elements.signOutButton = document.getElementById("signOutButton");
  elements.saveButton = document.getElementById("saveButton");
  elements.adminIdentityEmail = document.getElementById("adminIdentityEmail");
  elements.adminLastSync = document.getElementById("adminLastSync");
  elements.subscriptionsCount = document.getElementById("subscriptionsCount");
  elements.injuriesCount = document.getElementById("injuriesCount");
  elements.threadsCount = document.getElementById("threadsCount");
  elements.recentSubscriptionsList = document.getElementById("recentSubscriptionsList");
  elements.recentSubscriptionsEmpty = document.getElementById("recentSubscriptionsEmpty");
  elements.recentInjuriesList = document.getElementById("recentInjuriesList");
  elements.recentInjuriesEmpty = document.getElementById("recentInjuriesEmpty");
  elements.assignmentForm = document.getElementById("assignmentForm");
  elements.assignmentSubscriptionId = document.getElementById("assignmentSubscriptionId");
  elements.assignmentSearchInput = document.getElementById("assignmentSearchInput");
  elements.assignmentCoachUid = document.getElementById("assignmentCoachUid");
  elements.assignmentNutritionUid = document.getElementById("assignmentNutritionUid");
  elements.assignmentPhysioUid = document.getElementById("assignmentPhysioUid");
  elements.assignmentSaveButton = document.getElementById("assignmentSaveButton");
  elements.assignmentMessage = document.getElementById("assignmentMessage");
  elements.assignmentPreview = document.getElementById("assignmentPreview");
  elements.financeTotalRevenue = document.getElementById("financeTotalRevenue");
  elements.financeCoachRevenue = document.getElementById("financeCoachRevenue");
  elements.financeNutritionRevenue = document.getElementById("financeNutritionRevenue");
  elements.financePhysioRevenue = document.getElementById("financePhysioRevenue");
  elements.payoutGenerateForm = document.getElementById("payoutGenerateForm");
  elements.payoutMonthInput = document.getElementById("payoutMonthInput");
  elements.payoutGenerateButton = document.getElementById("payoutGenerateButton");
  elements.payoutsList = document.getElementById("payoutsList");
  elements.payoutsMessage = document.getElementById("payoutsMessage");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", onLoginSubmit);
  elements.refreshButton.addEventListener("click", loadDashboardData);
  elements.signOutButton.addEventListener("click", function () {
    signOut(auth);
  });
  elements.configForm.addEventListener("submit", onSaveConfig);
  if (elements.assignmentForm) {
    elements.assignmentForm.addEventListener("submit", onSaveAssignment);
    elements.assignmentSubscriptionId.addEventListener("change", syncAssignmentFormWithSelectedSubscription);
    [elements.assignmentCoachUid, elements.assignmentNutritionUid, elements.assignmentPhysioUid].forEach(function (select) {
      if (!select) return;
      select.addEventListener("change", function () {
        const currentId = elements.assignmentSubscriptionId.value;
        const selected = state.subscriptions.find(function (item) {
          return item.id === currentId;
        });
        renderAssignmentPreview(selected || null);
      });
    });
    if (elements.assignmentSearchInput) {
      elements.assignmentSearchInput.addEventListener("input", function () {
        state.assignmentSearch = String(elements.assignmentSearchInput.value || "").trim().toLowerCase();
        const currentId = elements.assignmentSubscriptionId.value;
        renderAssignmentOptions();
        if (currentId) {
          elements.assignmentSubscriptionId.value = currentId;
        }
        syncAssignmentFormWithSelectedSubscription();
      });
    }
  }
  if (elements.payoutGenerateForm) {
    elements.payoutGenerateForm.addEventListener("submit", onGeneratePayouts);
    if (elements.payoutsList) {
      elements.payoutsList.addEventListener("click", onPayoutListAction);
    }
    if (elements.payoutMonthInput) {
      elements.payoutMonthInput.addEventListener("change", renderPayouts);
    }
  }
}

async function onLoginSubmit(event) {
  event.preventDefault();
  const email = event.currentTarget.email.value.trim();
  const password = event.currentTarget.password.value;

  if (!email || !password) {
    elements.authMessage.textContent = "Enter email and password.";
    return;
  }

  elements.loginButton.disabled = true;
  elements.loginButton.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    elements.authMessage.textContent = "Sign-in failed.";
  } finally {
    elements.loginButton.disabled = false;
    elements.loginButton.textContent = "Sign in";
  }
}

async function handleAuthState(user) {
  state.user = user;
  state.isAdmin = false;

  if (!user) {
    elements.authCard.classList.remove("panel-hidden");
    elements.dashboardCard.classList.add("panel-hidden");
    return;
  }

  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (!adminDoc.exists()) {
      elements.authCard.classList.remove("panel-hidden");
      elements.dashboardCard.classList.add("panel-hidden");
      elements.authMessage.textContent = "No admin access. Add admins/<uid> first.";
      return;
    }

    state.isAdmin = true;
    elements.authCard.classList.add("panel-hidden");
    elements.dashboardCard.classList.remove("panel-hidden");
    elements.authMessage.textContent = "";
    await loadDashboardData();
  } catch (error) {
    console.error(error);
    elements.authMessage.textContent = "Could not verify admin access.";
  }
}

async function loadDashboardData() {
  if (!state.user || !state.isAdmin) return;

  elements.dashboardMessage.textContent = "Refreshing dashboard...";

  try {
    await loadSubscriptions();
    await Promise.all([loadConfig(), loadInjuries(), loadSupportThreads(), loadPractitioners(), loadMemberProfiles(), loadPayouts()]);

    renderSummary();
    renderFinanceOverview();
    renderPayouts();
    renderRecentSubscriptions();
    renderRecentInjuries();
    renderAssignmentOptions();
    syncAssignmentFormWithSelectedSubscription();

    if (elements.adminIdentityEmail) {
      elements.adminIdentityEmail.textContent = state.user.email || state.user.uid;
    }
    if (elements.adminLastSync) {
      elements.adminLastSync.textContent = formatDate(new Date());
    }

    elements.dashboardMessage.textContent = "Dashboard updated.";
  } catch (error) {
    console.error(error);
    elements.dashboardMessage.textContent = "Failed to refresh dashboard.";
  }
}

async function loadMemberProfiles() {
  const map = {};
  await Promise.all(
    state.subscriptions.slice(0, 120).map(async function (item) {
      const memberUid = String(item.memberUid || "");
      if (!memberUid) return;
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

async function loadConfig() {
  const ref = doc(db, "appConfig", "main");
  const snap = await getDoc(ref);
  const data = snap.exists()
    ? snap.data()
    : {
        workoutPlanVersion: "v2.4",
        nutritionPlanVersion: "v1.9",
        featuredWorkoutTitle: "HIIT لكامل الجسم",
        featuredWorkoutDurationMin: 45,
        featuredWorkoutCoach: "كابتن خالد",
        challengesEnabled: true
      };

  elements.configForm.workoutPlanVersion.value = data.workoutPlanVersion || "";
  elements.configForm.nutritionPlanVersion.value = data.nutritionPlanVersion || "";
  elements.configForm.featuredWorkoutTitle.value = data.featuredWorkoutTitle || "";
  elements.configForm.featuredWorkoutDurationMin.value = data.featuredWorkoutDurationMin || 45;
  elements.configForm.featuredWorkoutCoach.value = data.featuredWorkoutCoach || "";
  elements.configForm.challengesEnabled.value = String(Boolean(data.challengesEnabled));
}

async function loadSubscriptions() {
  const subsQuery = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(80));
  const snapshot = await getDocs(subsQuery);
  state.subscriptions = snapshot.docs.map(function (entry) {
    return Object.assign({ id: entry.id }, entry.data());
  });
}

async function loadPractitioners() {
  const items = [];
  const practitionersSnapshot = await getDocs(query(collection(db, "practitioners"), limit(200)));
  practitionersSnapshot.docs.forEach(function (entry) {
    const data = entry.data();
    items.push({
      uid: entry.id,
      role: String(data.role || "coach"),
      displayName: String(data.displayName || data.fullName || data.email || entry.id)
    });
  });

  if (!items.length) {
    const coachesSnapshot = await getDocs(query(collection(db, "coaches"), limit(120)));
    coachesSnapshot.docs.forEach(function (entry) {
      const data = entry.data();
      items.push({
        uid: entry.id,
        role: "coach",
        displayName: String(data.displayName || data.fullName || data.email || entry.id)
      });
    });
  }

  state.practitioners = items;
}

async function loadInjuries() {
  const injuriesQuery = query(collection(db, "injuryReports"), orderBy("createdAt", "desc"), limit(8));
  const snapshot = await getDocs(injuriesQuery);
  state.injuries = snapshot.docs.map(function (entry) {
    return Object.assign({ id: entry.id }, entry.data());
  });
}

async function loadSupportThreads() {
  const threadsQuery = query(collection(db, "supportMessages"), orderBy("createdAt", "desc"), limit(120));
  const snapshot = await getDocs(threadsQuery);

  const uniqueThreads = new Set();
  snapshot.docs.forEach(function (entry) {
    const data = entry.data();
    if (data && data.threadId) {
      uniqueThreads.add(String(data.threadId));
    }
  });
  state.threads = Array.from(uniqueThreads);
}

async function onSaveConfig(event) {
  event.preventDefault();
  if (!state.user || !state.isAdmin) return;

  const payload = {
    workoutPlanVersion: elements.configForm.workoutPlanVersion.value.trim(),
    nutritionPlanVersion: elements.configForm.nutritionPlanVersion.value.trim(),
    featuredWorkoutTitle: elements.configForm.featuredWorkoutTitle.value.trim(),
    featuredWorkoutDurationMin: Number(elements.configForm.featuredWorkoutDurationMin.value),
    featuredWorkoutCoach: elements.configForm.featuredWorkoutCoach.value.trim(),
    challengesEnabled: elements.configForm.challengesEnabled.value === "true",
    updatedAt: serverTimestamp(),
    updatedByUid: state.user.uid
  };

  if (
    !payload.workoutPlanVersion ||
    !payload.nutritionPlanVersion ||
    !payload.featuredWorkoutTitle ||
    !payload.featuredWorkoutCoach ||
    !Number.isFinite(payload.featuredWorkoutDurationMin)
  ) {
    elements.dashboardMessage.textContent = "Please fill all config fields correctly.";
    return;
  }

  elements.saveButton.disabled = true;
  elements.saveButton.textContent = "Saving...";

  try {
    await setDoc(doc(db, "appConfig", "main"), payload, { merge: true });
    elements.dashboardMessage.textContent = "Config saved successfully.";
    if (elements.adminLastSync) {
      elements.adminLastSync.textContent = formatDate(new Date());
    }
  } catch (error) {
    console.error(error);
    elements.dashboardMessage.textContent = "Failed to save config.";
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = "Save Config";
  }
}

function renderSummary() {
  if (elements.subscriptionsCount) {
    elements.subscriptionsCount.textContent = String(state.subscriptions.length);
  }
  if (elements.injuriesCount) {
    elements.injuriesCount.textContent = String(state.injuries.length);
  }
  if (elements.threadsCount) {
    elements.threadsCount.textContent = String(state.threads.length);
  }
}

function renderFinanceOverview() {
  if (!elements.financeTotalRevenue) return;
  const totalRevenue = state.subscriptions.reduce(function (sum, item) {
    return sum + Number(PLAN_PRICES[item.planId] || 0);
  }, 0);

  elements.financeTotalRevenue.textContent = formatCurrency(totalRevenue);
  elements.financeCoachRevenue.textContent = formatCurrency(Math.round(totalRevenue * SHARE.coach));
  elements.financeNutritionRevenue.textContent = formatCurrency(Math.round(totalRevenue * SHARE.nutrition));
  elements.financePhysioRevenue.textContent = formatCurrency(Math.round(totalRevenue * SHARE.physio));
}

async function loadPayouts() {
  const snapshot = await getDocs(query(collection(db, "payouts"), limit(400)));
  state.payouts = snapshot.docs.map(function (entry) {
    return Object.assign({ id: entry.id }, entry.data());
  });
}

function renderPayouts() {
  if (!elements.payoutsList) return;

  const month = elements.payoutMonthInput && elements.payoutMonthInput.value
    ? elements.payoutMonthInput.value
    : getCurrentMonthKey();
  if (elements.payoutMonthInput && !elements.payoutMonthInput.value) {
    elements.payoutMonthInput.value = month;
  }

  const list = state.payouts
    .filter(function (item) { return String(item.month || "") === month; })
    .sort(function (a, b) {
      return String(a.role || "").localeCompare(String(b.role || ""));
    });

  if (!list.length) {
    elements.payoutsList.innerHTML = '<li><p class="mini-title">لا توجد مستحقات لهذا الشهر</p><p class="mini-meta">اضغط Generate Payouts.</p></li>';
    return;
  }

  elements.payoutsList.innerHTML = list
    .map(function (item) {
      const canMarkPaid = item.status !== "paid";
      const statusText = item.status === "paid" ? "Paid" : "Pending";
      return (
        '<li>' +
        '<p class="mini-title">' + escapeHtml(practitionerName(item.specialistUid) + " • " + roleLabel(item.role)) + "</p>" +
        '<p class="mini-meta">' + escapeHtml("الشهر: " + item.month + " • الإجمالي: " + formatCurrency(item.grossRevenue || 0)) + "</p>" +
        '<p class="mini-meta">' + escapeHtml("النسبة: " + Math.round(Number(item.shareRate || 0) * 100) + "% • المستحق: " + formatCurrency(item.payoutAmount || 0)) + "</p>" +
        '<p class="mini-meta">' + escapeHtml("الحالة: " + statusText) + "</p>" +
        (canMarkPaid ? '<button class="admin-btn admin-btn-secondary" type="button" data-mark-paid="' + escapeHtml(item.id) + '">Mark as Paid</button>' : "") +
        '</li>'
      );
    })
    .join("");
}

async function onGeneratePayouts(event) {
  event.preventDefault();
  if (!state.user || !state.isAdmin) return;

  const month = String((elements.payoutMonthInput && elements.payoutMonthInput.value) || "").trim();
  if (!/^\d{4}-\d{2}$/.test(month)) {
    if (elements.payoutsMessage) elements.payoutsMessage.textContent = "اختر شهر صحيح.";
    return;
  }

  if (elements.payoutGenerateButton) {
    elements.payoutGenerateButton.disabled = true;
    elements.payoutGenerateButton.textContent = "Generating...";
  }

  try {
    const specialists = state.practitioners.filter(function (item) {
      return item.role === "coach" || item.role === "nutrition" || item.role === "physio";
    });

    await Promise.all(
      specialists.map(async function (specialist) {
        const subs = state.subscriptions.filter(function (sub) {
          if (specialist.role === "coach") return sub.assignedCoachUid === specialist.uid;
          if (specialist.role === "nutrition") return sub.assignedNutritionUid === specialist.uid;
          if (specialist.role === "physio") return sub.assignedPhysioUid === specialist.uid;
          return false;
        });
        const gross = subs.reduce(function (sum, sub) {
          return sum + Number(PLAN_PRICES[sub.planId] || 0);
        }, 0);
        const shareRate = Number(SHARE[specialist.role] || 0);
        const payoutAmount = Math.round(gross * shareRate);
        const payoutId = month + "_" + specialist.role + "_" + specialist.uid;
        const currentDoc = await getDoc(doc(db, "payouts", payoutId));
        const current = currentDoc.exists() ? currentDoc.data() : {};

        await setDoc(doc(db, "payouts", payoutId), {
          month: month,
          role: specialist.role,
          specialistUid: specialist.uid,
          grossRevenue: gross,
          shareRate: shareRate,
          payoutAmount: payoutAmount,
          status: current.status === "paid" ? "paid" : "pending",
          paidAt: current.status === "paid" ? current.paidAt : null,
          updatedAt: serverTimestamp(),
          updatedByUid: state.user.uid
        }, { merge: true });
      })
    );

    await loadPayouts();
    renderPayouts();
    if (elements.payoutsMessage) elements.payoutsMessage.textContent = "تم توليد المستحقات الشهرية.";
  } catch (error) {
    console.error(error);
    if (elements.payoutsMessage) elements.payoutsMessage.textContent = "فشل توليد المستحقات.";
  } finally {
    if (elements.payoutGenerateButton) {
      elements.payoutGenerateButton.disabled = false;
      elements.payoutGenerateButton.textContent = "Generate Payouts";
    }
  }
}

async function onPayoutListAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const trigger = target.closest("[data-mark-paid]");
  if (!trigger) return;

  const payoutId = String(trigger.getAttribute("data-mark-paid") || "");
  if (!payoutId || !state.user || !state.isAdmin) return;

  try {
    await setDoc(doc(db, "payouts", payoutId), {
      status: "paid",
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedByUid: state.user.uid
    }, { merge: true });
    await loadPayouts();
    renderPayouts();
    if (elements.payoutsMessage) elements.payoutsMessage.textContent = "تم تحديث حالة الدفع.";
  } catch (error) {
    console.error(error);
    if (elements.payoutsMessage) elements.payoutsMessage.textContent = "فشل تحديث حالة الدفع.";
  }
}

function renderRecentSubscriptions() {
  const list = elements.recentSubscriptionsList;
  const emptyState = elements.recentSubscriptionsEmpty;
  if (!list || !emptyState) return;

  if (!state.subscriptions.length) {
    list.innerHTML = "";
    emptyState.style.display = "";
    return;
  }

  emptyState.style.display = "none";
  list.innerHTML = state.subscriptions
    .map(function (subscription) {
      return (
        "<li>" +
        '<p class="mini-title">' + escapeHtml(subscription.fullName || "Unknown") + "</p>" +
        '<p class="mini-meta">' + escapeHtml(subscription.email || "-") + "</p>" +
        '<p class="mini-meta">' + escapeHtml((subscription.planId || "-") + " • " + (subscription.goal || "-")) + "</p>" +
        '<p class="mini-meta">' + escapeHtml(
          "مدرب: " + practitionerName(subscription.assignedCoachUid) +
          " | تغذية: " + practitionerName(subscription.assignedNutritionUid) +
          " | علاج: " + practitionerName(subscription.assignedPhysioUid)
        ) + "</p>" +
        "</li>"
      );
    })
    .join("");
}

function renderAssignmentOptions() {
  if (!elements.assignmentSubscriptionId) return;

  const filteredSubscriptions = state.subscriptions.filter(function (item) {
    if (!state.assignmentSearch) return true;
    const hay = (
      String(item.fullName || "") + " " +
      String(item.email || "") + " " +
      String(item.phone || "")
    ).toLowerCase();
    return hay.includes(state.assignmentSearch);
  }).sort(function (a, b) {
    return String(a.fullName || "").localeCompare(String(b.fullName || ""), "ar");
  });

  elements.assignmentSubscriptionId.innerHTML =
    '<option value="">اختر مشترك...</option>' +
    filteredSubscriptions
      .map(function (item) {
        return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml((item.fullName || "Unknown") + " - " + (item.phone || item.email || "")) + "</option>";
      })
      .join("");

  fillPractitionerSelect(elements.assignmentCoachUid, ["coach"]);
  fillPractitionerSelect(elements.assignmentNutritionUid, ["nutrition"]);
  fillPractitionerSelect(elements.assignmentPhysioUid, ["physio"]);
}

function fillPractitionerSelect(selectElement, roles) {
  if (!selectElement) return;
  const roleSet = new Set(roles);
  const filtered = state.practitioners.filter(function (item) {
    return roleSet.has(item.role);
  });

  selectElement.innerHTML =
    '<option value="">غير معيّن</option>' +
    filtered
      .map(function (item) {
        return '<option value="' + escapeHtml(item.uid) + '">' + escapeHtml(item.displayName) + "</option>";
      })
      .join("");
}

function syncAssignmentFormWithSelectedSubscription() {
  if (!elements.assignmentSubscriptionId) return;
  const id = elements.assignmentSubscriptionId.value;
  if (!id) {
    elements.assignmentCoachUid.value = "";
    elements.assignmentNutritionUid.value = "";
    elements.assignmentPhysioUid.value = "";
    renderAssignmentPreview(null);
    return;
  }

  const sub = state.subscriptions.find(function (item) {
    return item.id === id;
  });
  if (!sub) return;

  elements.assignmentCoachUid.value = sub.assignedCoachUid || "";
  elements.assignmentNutritionUid.value = sub.assignedNutritionUid || "";
  elements.assignmentPhysioUid.value = sub.assignedPhysioUid || "";
  renderAssignmentPreview(sub);
}

async function onSaveAssignment(event) {
  event.preventDefault();
  if (!state.user || !state.isAdmin) return;

  const subscriptionId = elements.assignmentSubscriptionId.value;
  if (!subscriptionId) {
    elements.assignmentMessage.textContent = "اختر مشترك أولاً.";
    return;
  }

  const selectedSubscription = state.subscriptions.find(function (item) {
    return item.id === subscriptionId;
  });
  const memberUid = String((selectedSubscription && selectedSubscription.memberUid) || "");
  if (!memberUid) {
    elements.assignmentMessage.textContent = "لا يمكن الحفظ: UID المتدرب غير موجود.";
    return;
  }

  const payload = {
    assignedCoachUid: elements.assignmentCoachUid.value || "",
    assignedNutritionUid: elements.assignmentNutritionUid.value || "",
    assignedPhysioUid: elements.assignmentPhysioUid.value || "",
    updatedAt: serverTimestamp(),
    updatedByUid: state.user.uid
  };

  elements.assignmentSaveButton.disabled = true;
  elements.assignmentSaveButton.textContent = "جاري الحفظ...";

  try {
    await Promise.all([
      updateDoc(doc(db, "subscriptions", subscriptionId), payload),
      setDoc(
        doc(db, "memberAssignments", memberUid),
        {
          memberUid: memberUid,
          assignedCoachUid: payload.assignedCoachUid,
          assignedCoachName: practitionerName(payload.assignedCoachUid),
          assignedNutritionUid: payload.assignedNutritionUid,
          assignedNutritionName: practitionerName(payload.assignedNutritionUid),
          assignedPhysioUid: payload.assignedPhysioUid,
          assignedPhysioName: practitionerName(payload.assignedPhysioUid),
          updatedAt: payload.updatedAt,
          updatedByUid: payload.updatedByUid
        },
        { merge: true }
      )
    ]);
    elements.assignmentMessage.textContent = "تم حفظ التعيين بنجاح.";
    await loadSubscriptions();
    renderSummary();
    renderRecentSubscriptions();
    renderAssignmentOptions();
    elements.assignmentSubscriptionId.value = subscriptionId;
    syncAssignmentFormWithSelectedSubscription();
  } catch (error) {
    console.error(error);
    elements.assignmentMessage.textContent = "فشل حفظ التعيين.";
  } finally {
    elements.assignmentSaveButton.disabled = false;
    elements.assignmentSaveButton.textContent = "حفظ التعيين";
  }
}

function renderRecentInjuries() {
  const list = elements.recentInjuriesList;
  const emptyState = elements.recentInjuriesEmpty;
  if (!list || !emptyState) return;

  if (!state.injuries.length) {
    list.innerHTML = "";
    emptyState.style.display = "";
    return;
  }

  emptyState.style.display = "none";
  list.innerHTML = state.injuries
    .map(function (injury) {
      return (
        "<li>" +
        '<p class="mini-title">' + escapeHtml(injury.area || "Area not specified") + "</p>" +
        '<p class="mini-meta">' + escapeHtml("Severity " + severityLabel(injury.severity)) + "</p>" +
        '<p class="mini-meta">' + escapeHtml(injury.note || "") + "</p>" +
        "</li>"
      );
    })
    .join("");
}

function severityLabel(value) {
  if (value === 1) return "Low";
  if (value === 2) return "Medium";
  if (value === 3) return "High";
  return String(value || "-");
}

function renderAssignmentPreview(subscription) {
  if (!elements.assignmentPreview) return;
  if (!subscription) {
    elements.assignmentPreview.innerHTML = "";
    return;
  }

  const memberUid = String(subscription.memberUid || "");
  const profile = state.memberProfilesByUid[memberUid] || {};
  const reminder = String(profile.reminderTime || "غير محدد");
  const preferredDays = Array.isArray(profile.preferredDays) && profile.preferredDays.length
    ? profile.preferredDays.join("، ")
    : "غير محدد";

  elements.assignmentPreview.innerHTML =
    '<li>' +
    '<p class="mini-title">' + escapeHtml(subscription.fullName || "مشترك") + "</p>" +
    '<p class="mini-meta">' + escapeHtml("الجوال: " + (subscription.phone || "-")) + "</p>" +
    '<p class="mini-meta">' + escapeHtml("الهدف: " + (subscription.goal || "-") + " • الخطة: " + (subscription.planId || "-")) + "</p>" +
    '<p class="mini-meta">' + escapeHtml("تذكير: " + reminder + " • أيام مفضلة: " + preferredDays) + "</p>" +
    '<p class="mini-meta">' + escapeHtml(
      "الفريق الحالي - مدرب: " + practitionerName(elements.assignmentCoachUid.value || subscription.assignedCoachUid) +
      " | تغذية: " + practitionerName(elements.assignmentNutritionUid.value || subscription.assignedNutritionUid) +
      " | علاج: " + practitionerName(elements.assignmentPhysioUid.value || subscription.assignedPhysioUid)
    ) + "</p>" +
    "</li>";
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateValue);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ar-SA").format(Number(value || 0)) + " ر.س";
}

function getCurrentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return String(now.getFullYear()) + "-" + month;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function practitionerName(uid) {
  if (!uid) return "غير معيّن";
  const item = state.practitioners.find(function (entry) {
    return entry.uid === uid;
  });
  return item ? item.displayName : uid;
}

function roleLabel(role) {
  if (role === "coach") return "مدرب بدني";
  if (role === "nutrition") return "أخصائي تغذية";
  if (role === "physio") return "علاج طبيعي";
  return role || "Role";
}
