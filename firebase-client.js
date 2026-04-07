import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbxZRRqDAKekUdq_iDu_acdJ7Y2aHK8vY",
  authDomain: "move-6cef6.firebaseapp.com",
  projectId: "move-6cef6",
  storageBucket: "move-6cef6.firebasestorage.app",
  messagingSenderId: "265605044325",
  appId: "1:265605044325:web:0f164bdd30eb05a98b8e8c",
  measurementId: "G-K93QLZNW7L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

function initializeAnalytics() {
  return isAnalyticsSupported()
    .then(function (supported) {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(function () {
      return null;
    });
}

export { app, auth, db, storage, initializeAnalytics };
