import {
  collection,
  getDocs,
  limit,
  orderBy,
  query
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
  sessions: [
    { id: "s1", trainee: "أمـان", time: "09:30 ص", type: "متابعة تدريب" },
    { id: "s2", trainee: "نورة", time: "01:00 م", type: "تعديل خطة تغذية" },
    { id: "s3", trainee: "وليد", time: "07:00 م", type: "مراجعة استشفاء" }
  ],
  injuries: [],
  subscriptions: [],
  notes: loadNotes()
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
  elements.signOutBtn = document.getElementById("coachSignOutBtn");
  elements.refreshBtn = document.getElementById("coachRefreshBtn");
  elements.welcome = document.getElementById("coachWelcome");
  elements.traineesCount = document.getElementById("coachTraineesCount");
  elements.sessionsCount = document.getElementById("coachSessionsCount");
  elements.injuriesCount = document.getElementById("coachInjuriesCount");
  elements.sessions = document.getElementById("coachSessions");
  elements.injuries = document.getElementById("coachInjuries");
  elements.notes = document.getElementById("coachNotes");
  elements.notesForm = document.getElementById("coachNotesForm");
  elements.dashboardMessage = document.getElementById("coachDashboardMessage");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", onLoginSubmit);
  elements.signOutBtn.addEventListener("click", function () {
    signOut(auth);
  });
  elements.refreshBtn.addEventListener("click", function () {
    loadCoachData();
  });
  elements.notesForm.addEventListener("submit", onNoteSubmit);
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
  if (!user) {
    elements.authCard.classList.remove("hidden");
    elements.dashboard.classList.add("hidden");
    elements.authMessage.textContent = "";
    return;
  }

  elements.authCard.classList.add("hidden");
  elements.dashboard.classList.remove("hidden");
  elements.welcome.textContent = "مرحباً " + (user.email || "Coach") + " ، جدولك جاهز.";
  await loadCoachData();
  render();
}

async function loadCoachData() {
  if (!state.user) return;

  elements.dashboardMessage.textContent = "جاري تحديث البيانات...";

  await Promise.all([loadSubscriptions(), loadInjuries()]);
  render();

  elements.dashboardMessage.textContent = "تم التحديث.";
}

async function loadSubscriptions() {
  try {
    const snapshot = await getDocs(query(collection(db, "subscriptions"), orderBy("createdAt", "desc"), limit(20)));
    state.subscriptions = snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Failed to load subscriptions", error);
    state.subscriptions = [];
    elements.dashboardMessage.textContent = "تم الدخول بنمط محدود. أضف صلاحيات القراءة للمدرب عند الحاجة.";
  }
}

async function loadInjuries() {
  try {
    const snapshot = await getDocs(query(collection(db, "injuryReports"), orderBy("createdAt", "desc"), limit(6)));
    state.injuries = snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Failed to load injuries", error);
    state.injuries = [];
  }
}

function onNoteSubmit(event) {
  event.preventDefault();
  const noteInput = event.currentTarget.note;
  const note = noteInput.value.trim();
  if (!note) return;

  state.notes.unshift({ text: note, createdAt: new Date().toISOString() });
  state.notes = state.notes.slice(0, 10);
  saveNotes(state.notes);
  noteInput.value = "";
  renderNotes();
}

function render() {
  elements.traineesCount.textContent = String(state.subscriptions.length);
  elements.sessionsCount.textContent = String(state.sessions.length);
  elements.injuriesCount.textContent = String(state.injuries.length);
  renderSessions();
  renderInjuries();
  renderNotes();
}

function renderSessions() {
  elements.sessions.innerHTML = state.sessions
    .map(function (session) {
      return (
        '<article class="item">' +
        "<strong>" + escapeHtml(session.trainee) + " - " + escapeHtml(session.time) + "</strong>" +
        "<p>" + escapeHtml(session.type) + "</p>" +
        "</article>"
      );
    })
    .join("");
}

function renderInjuries() {
  if (!state.injuries.length) {
    elements.injuries.innerHTML = '<article class="item"><strong>لا توجد بلاغات حالياً</strong><p>الحالة مستقرة.</p></article>';
    return;
  }

  elements.injuries.innerHTML = state.injuries
    .map(function (injury) {
      const severity = injury.severity === 1 ? "خفيفة" : injury.severity === 2 ? "متوسطة" : "عالية";
      return (
        '<article class="item">' +
        "<strong>" + escapeHtml(injury.area || "غير محدد") + " - " + severity + "</strong>" +
        "<p>" + escapeHtml(injury.note || "") + "</p>" +
        "</article>"
      );
    })
    .join("");
}

function renderNotes() {
  if (!state.notes.length) {
    elements.notes.innerHTML = '<article class="item"><strong>لا توجد ملاحظات</strong><p>أضف أول ملاحظة سريعة.</p></article>';
    return;
  }

  elements.notes.innerHTML = state.notes
    .map(function (note) {
      const date = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" }).format(new Date(note.createdAt));
      return '<article class="item"><strong>' + date + '</strong><p>' + escapeHtml(note.text) + "</p></article>";
    })
    .join("");
}

function loadNotes() {
  try {
    const raw = localStorage.getItem("moveCoachNotes");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("moveCoachNotes", JSON.stringify(notes));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
