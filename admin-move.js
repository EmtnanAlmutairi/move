import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db } from "./firebase-client.js";

const elements = {};
const state = { user: null, isAdmin: false };

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
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", onLoginSubmit);
  elements.refreshButton.addEventListener("click", loadConfig);
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
    await loadConfig();
  } catch (error) {
    console.error(error);
    elements.authMessage.textContent = "Could not verify admin access.";
  }
}

async function loadConfig() {
  if (!state.user || !state.isAdmin) return;

  elements.dashboardMessage.textContent = "Loading config...";

  try {
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

    elements.dashboardMessage.textContent = "Config loaded.";
  } catch (error) {
    console.error(error);
    elements.dashboardMessage.textContent = "Failed to load config.";
  }
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
  } catch (error) {
    console.error(error);
    elements.dashboardMessage.textContent = "Failed to save config.";
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = "Save Config";
  }
}
