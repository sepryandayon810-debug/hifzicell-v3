/**
 * FIREBASE CONFIG
 * Inisialisasi Firebase + helper global.
 * GANTI API KEY dengan punya kamu.
 */

var firebaseConfig = {
  apiKey: "AIzaSyCSC05MTnaiiSftj1TA-LVCH4ymHBAbkoU",
  authDomain: "hifzicell-v2.firebaseapp.com",
  databaseURL: "https://hifzicell-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hifzicell-v2",
  storageBucket: "hifzicell-v2.firebasestorage.app",
  messagingSenderId: "766095621773",
  appId: "1:766095621773:web:da40a79eab0f573683acc4",
  measurementId: "G-N9B9PKFCHT"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.database();
window.auth = firebase.auth();

// Helper aman
window.getUid = function() {
  return auth.currentUser ? auth.currentUser.uid : null;
};

window.genId = function(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase();
};

window.nowIso = function() {
  return new Date().toISOString();
};

window.todayKey = function() {
  return new Date().toISOString().split("T")[0];
};
