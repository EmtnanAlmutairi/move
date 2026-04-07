import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db } from "./firebase-client.js";

const elements = {};
const state = {
  user: null,
  isAdmin: false,
  subscriptions: [],
  injuries: [],
  threads: []
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
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", onLoginSubmit);
  elements.refreshButton.addEventListener("click", loadDashboardData);
  elements.signOutButton.addEventListener("click", function () {
    signOut(auth);
  });
  elements.configForm.addEventListener("submit", onSaveConfig);
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
    await Promise.all([loadConfig(), loadSubscriptions(), loadInjuries(), loadSupportThreads()]);

    renderSummary();
    renderRecentSubscriptions();
    renderRecentInjuries();

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
  const subsQuery = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(8));
  const snapshot = await getDocs(subsQuery);
  state.subscriptions = snapshot.docs.map(function (entry) {
    return Object.assign({ id: entry.id }, entry.data());
  });
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
        "</li>"
      );
    })
    .join("");
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

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateValue);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
