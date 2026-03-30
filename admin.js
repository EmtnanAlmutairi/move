import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { auth, db } from "./firebase-client.js";

const state = {
  entries: [],
  unsubscribe: null,
  user: null,
  hasAdminAccess: false
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
  elements.latestSignup = document.getElementById("latestSignup");
  elements.accessState = document.getElementById("accessState");
  elements.setupNote = document.getElementById("setupNote");
  elements.entriesState = document.getElementById("entriesState");
  elements.entriesList = document.getElementById("entriesList");
  elements.entriesMeta = document.getElementById("entriesMeta");
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
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = event.currentTarget.email.value.trim();
  const password = event.currentTarget.password.value;

  if (!email || !password) {
    setAuthMessage("Enter both email and password.");
    return;
  }

  setAuthLoading(true);
  setAuthMessage("Signing in...");

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
  stopListening();
  state.user = user;
  state.hasAdminAccess = false;
  state.entries = [];
  renderEntries([]);

  if (!user) {
    showSignedOutState();
    return;
  }

  showDashboardState();
  elements.currentUserEmail.textContent = user.email || "No email";
  elements.currentUserUid.textContent = user.uid;
  elements.entriesState.textContent = "Checking admin access...";
  elements.accessState.textContent = "Checking";
  elements.signupsCount.textContent = "0";
  elements.latestSignup.textContent = "No data yet";

  try {
    const adminSnapshot = await getDoc(doc(db, "admins", user.uid));

    if (!adminSnapshot.exists()) {
      state.hasAdminAccess = false;
      elements.accessState.textContent = "Needs approval";
      elements.setupNote.classList.remove("panel-hidden");
      elements.entriesState.textContent = "Create your admin document, then refresh.";
      setDashboardMessage("This account can sign in, but it is not listed in Firestore admins yet.");
      updateActionState();
      return;
    }

    state.hasAdminAccess = true;
    elements.accessState.textContent = "Approved";
    elements.setupNote.classList.add("panel-hidden");
    setDashboardMessage("Live waitlist data is connected.");
    subscribeToWaitlist();
  } catch (error) {
    console.error("Failed to verify admin access", error);
    elements.accessState.textContent = "Error";
    elements.setupNote.classList.remove("panel-hidden");
    elements.entriesState.textContent = "Could not verify admin access.";
    setDashboardMessage("Check your Firebase Authentication and Firestore configuration.");
    updateActionState();
  }
}

function showSignedOutState() {
  elements.authCard.classList.remove("panel-hidden");
  elements.dashboardCard.classList.add("panel-hidden");
  elements.setupNote.classList.add("panel-hidden");
  setDashboardMessage("");
  setAuthMessage("Sign in with a Firebase Authentication admin account.");
  updateActionState();
}

function showDashboardState() {
  elements.authCard.classList.add("panel-hidden");
  elements.dashboardCard.classList.remove("panel-hidden");
  setAuthMessage("");
  updateActionState();
}

function subscribeToWaitlist() {
  elements.entriesState.textContent = "Loading waitlist signups...";

  const waitlistQuery = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));

  state.unsubscribe = onSnapshot(
    waitlistQuery,
    function (snapshot) {
      state.entries = snapshot.docs.map(function (docSnapshot) {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          email: data.email || "",
          source: data.source || "unknown",
          createdAt: data.createdAt || null
        };
      });

      renderEntries(state.entries);
      elements.accessState.textContent = "Approved";
      setDashboardMessage("Dashboard synced successfully.");
      updateActionState();
    },
    function (error) {
      console.error("Failed to read waitlist", error);
      state.entries = [];
      renderEntries([]);
      elements.entriesState.textContent = "Could not load waitlist data.";
      setDashboardMessage("This account is signed in, but Firestore did not allow the query.");
      updateActionState();
    }
  );
}

async function refreshDashboard() {
  if (!state.user) {
    return;
  }

  setDashboardMessage("Refreshing dashboard...");
  await handleAuthStateChanged(state.user);
}

async function handleSignOut() {
  stopListening();
  await signOut(auth);
}

async function copyUid() {
  if (!state.user) {
    return;
  }

  try {
    await navigator.clipboard.writeText(state.user.uid);
    setDashboardMessage("UID copied to clipboard.");
  } catch (error) {
    console.error("Failed to copy UID", error);
    setDashboardMessage("Copy failed. Use the UID shown on screen.");
  }
}

function exportCsv() {
  if (!state.entries.length) {
    setDashboardMessage("There is no data to export yet.");
    return;
  }

  const rows = [
    ["email", "source", "createdAt", "documentId"],
    ...state.entries.map(function (entry) {
      return [
        entry.email,
        entry.source,
        formatDate(entry.createdAt),
        entry.id
      ];
    })
  ];

  const csv = rows
    .map(function (row) {
      return row.map(escapeCsvValue).join(",");
    })
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "move-waitlist.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDashboardMessage("CSV exported.");
}

function renderEntries(entries) {
  elements.signupsCount.textContent = String(entries.length);
  elements.latestSignup.textContent = entries.length
    ? entries[0].email
    : "No data yet";
  elements.entriesMeta.textContent = entries.length
    ? entries.length + " signups loaded"
    : "Newest first";
  elements.entriesList.innerHTML = "";

  if (!entries.length) {
    elements.exportButton.disabled = true;
    elements.entriesState.textContent = state.hasAdminAccess
      ? "No waitlist signups yet."
      : "Waiting for admin access.";
    return;
  }

  elements.exportButton.disabled = false;
  elements.entriesState.textContent = "";

  entries.forEach(function (entry) {
    const item = document.createElement("li");
    item.className = "entries-item";
    item.innerHTML =
      '<div>' +
      '<strong class="entry-email">' + escapeHtml(entry.email) + "</strong>" +
      '<div class="entry-date">' + escapeHtml(formatDate(entry.createdAt)) + "</div>" +
      "</div>" +
      '<div class="entry-meta"><span class="entry-badge">' + escapeHtml(entry.source) + "</span></div>" +
      '<div class="entry-meta">ID: ' + escapeHtml(entry.id) + "</div>";
    elements.entriesList.appendChild(item);
  });
}

function updateActionState() {
  const signedIn = Boolean(state.user);
  elements.refreshButton.disabled = !signedIn;
  elements.copyUidButton.disabled = !signedIn;
  elements.signOutButton.disabled = !signedIn;
  elements.exportButton.disabled = !state.hasAdminAccess || !state.entries.length;
}

function stopListening() {
  if (state.unsubscribe) {
    state.unsubscribe();
    state.unsubscribe = null;
  }
}

function setAuthLoading(isLoading) {
  elements.loginButton.disabled = isLoading;
  elements.loginButton.textContent = isLoading ? "Signing in..." : "Sign in";
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
    return "Incorrect email or password.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again in a few minutes.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }

  return "Sign-in failed. Check Firebase Auth and your admin account.";
}

function formatDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "Pending server timestamp";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp.toDate());
}

function escapeCsvValue(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
