// ================================================================
// FIREBASE SETUP — follow these steps once:
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → give it any name → Create
// 3. In the project, click "</>" (Web app) → register app → copy the config below
// 4. In the left sidebar: Build → Realtime Database → Create database
//    → choose any location → Start in TEST MODE → Enable
// 5. Paste your config values into FIREBASE_CONFIG below
// ================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSy6_WTyu-fhp93Qgr2aLan6E6AW7Tzp8",
  authDomain: "wsdb-dc517.firebaseapp.com",
  databaseURL: "https://wsdb-dc517-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wsdb-dc517",
  storageBucket: "wsdb-dc517.firebasestorage.app",
  messagingSenderId: "413896577773",
  appId: "1:413896577773:web:1822c652cc0d100fef72e4"
};

// ================================================================
// Don't edit below this line
// ================================================================

let _db = null;

(function initFirebase() {
  if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase not configured — leaderboard disabled.");
    window.firebaseReady = false;
    return;
  }
  try {
    if (!FIREBASE_CONFIG.databaseURL || FIREBASE_CONFIG.databaseURL.includes("YOUR_PROJECT")) {
      console.warn("Firebase databaseURL is missing or not set.");
      window.firebaseReady = false;
      return;
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    window.firebaseReady = true;
  } catch (e) {
    console.error("Firebase init error:", e);
    window.firebaseReady = false;
  }
})();

// Generate/retrieve a stable anonymous ID for this device
function getPlayerId() {
  let id = localStorage.getItem("weddingPlayerId");
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("weddingPlayerId", id);
    if (window._updateTestBadge) window._updateTestBadge();
  }
  return id;
}
window.getPlayerId = getPlayerId;

const _testMode = () => new URLSearchParams(window.location.search).has("test");

// Save a game score — only overwrites if the new score is higher
window.submitScore = function (game, scoreData) {
  if (!_db || !window.playerName) {
    console.warn("[Firebase] submitScore skipped — db:", !!_db, "name:", window.playerName);
    return;
  }
  const id = getPlayerId();
  if (_testMode()) console.log(`[TEST] submitScore — player: "${window.playerName}", id: ${id}, game: ${game}, points: ${scoreData.points}`);

  const ref = _db.ref("scores/" + id);

  ref.once("value").then(snap => {
    const existing = snap.val() || {};
    const oldPoints = (existing[game] && existing[game].points) ?? -1;

    // Don't overwrite a better score
    if (scoreData.points < oldPoints) return;

    const updated = {
      name: window.playerName,
      updatedAt: Date.now(),
      ...existing,
      [game]: scoreData
    };

    // Recalculate total
    updated.total = ["connections", "trivia", "wordle"]
      .reduce((sum, g) => sum + ((updated[g] && updated[g].points) || 0), 0);

    ref.set(updated)
      .then(() => { if (_testMode()) console.log(`[TEST] Write OK — scores/${id}`, updated); })
      .catch(err => console.error("[Firebase] Write failed:", err));
  }).catch(err => console.error("[Firebase] Read failed:", err));
};

// Fetch all scores, sorted by total descending
window.fetchLeaderboard = function (callback) {
  if (!_db) { callback(null); return; }
  _db.ref("scores")
    .once("value")
    .then(snap => {
      const rows = [];
      snap.forEach(child => { rows.push({ id: child.key, ...child.val() }); });
      if (_testMode()) console.log("[TEST] fetchLeaderboard →", rows.length, "entries:", rows.map(r => `${r.name}(${r.id})`));
      rows.sort((a, b) => (b.total || 0) - (a.total || 0));
      callback(rows.slice(0, 100));
    })
    .catch(err => { console.error("[Firebase] Leaderboard fetch failed:", err); callback(null); });
};
