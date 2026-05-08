// ================================================================
// WEDDING GAME DATA — fill in your content here!
// ================================================================

const GAME_DATA = {

  // --- CONNECTIONS ---
  // 4 categories × 4 items each (16 items total)
  // Colors rank difficulty: yellow (easy) → green → blue → purple (hard)
  connections: {
    categories: [
      {
        name: "קוסקוס",
        color: "yellow",
        items: ["שמן ", "סול", "מרק", "יום שלישי"]
      },
      {
        name: "מקומות שגרנו בהם",
        color: "green",
        items: ["אפקה ", "קצרין", "קליבלנד", "לחובר"]
      },
      {
        name: "משותף לנו",
        color: "blue",
        items: ["טבעוני ", "לוחמה אלקטרונית", "מרתון", "פתח תקווה"]
      },
      {
        name: "קטגוריה רביעית — שם הקטגוריה",
        color: "purple",
        items: ["3 ", "2", "1", "4 "]
      }
    ]
  },

  // --- TRIVIA ---
  // answer: index of the correct option (0 = first option)
  trivia: {
    questions: [
      {
        question: "שאלת דוגמה: איפה נפגשו אסף ואילנה?",
        options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
        answer: 0
      },
      {
        question: "שאלת דוגמה נוספת — מה הדבר האהוב על אסף?",
        options: ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אפשרות 4"],
        answer: 2
      }
      // הוסף/י שאלות נוספות כאן...
    ]
  },

  // --- WORDLE ---
  // word: the secret Hebrew word (no nikud), e.g. "חתונה"
  // hint: optional clue shown to players
  // maxGuesses: number of attempts (default 6)
  wordle: {
    word: "כדורת",
    hint: "...",
    maxGuesses: 6
  }

};

// ================================================================
// APP STATE
// ================================================================

let playerName = "";
let currentScreen = "";

// Connections
let conn = {
  items: [],
  selected: [],
  solved: [],
  lives: 4,
  gameOver: false
};

// Trivia
let trivia = {
  questions: [],
  index: 0,
  score: 0,
  answered: false
};

// Wordle
let wordle = {
  word: "",
  wordLength: 0,
  maxGuesses: 6,
  guess: [],
  guesses: [],
  row: 0,
  keyColors: {},
  gameOver: false
};

// ================================================================
// NAVIGATION
// ================================================================

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + name);
  if (el) el.classList.add("active");
  currentScreen = name;
  if (name === "portal") updatePortalBadges();
}

function submitName() {
  const input = document.getElementById("player-name");
  const name = input.value.trim();
  if (!name) {
    input.style.borderColor = "#DC3545";
    input.placeholder = "נא להכניס שם";
    setTimeout(() => {
      input.style.borderColor = "";
      input.placeholder = "הכנס/י את שמך";
    }, 2000);
    return;
  }
  const testMode = new URLSearchParams(window.location.search).has("test");
  const previousName = localStorage.getItem("weddingPlayer");
  if (testMode || (previousName && previousName !== name)) {
    localStorage.removeItem("weddingDone");
    localStorage.removeItem("weddingPlayerId");
  }

  playerName = name;
  window.playerName = name; // used by firebase.js
  localStorage.setItem("weddingPlayer", name);
  document.getElementById("display-name").textContent = name;
  if (window._updateTestBadge) window._updateTestBadge();
  showScreen("portal");
}

function handleNameEnter(e) {
  if (e.key === "Enter") submitName();
}

function startGame(game) {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  if (done[game]) {
    showScreen(game);
    showCompletedGame(game, typeof done[game] === "object" ? done[game] : {});
    return;
  }
  if (game === "connections") initConnections();
  else if (game === "trivia") initTrivia();
  else if (game === "wordle") initWordle();
  showScreen(game);
}

// ================================================================
// SCORING & COMPLETION
// Points: connections 0-100, trivia 0-100, wordle 0-100 (total max 300)
// ================================================================

// Connections: 0 mistakes=100, 1=75, 2=50, 3=25, failed=0
function connectionsPoints(mistakes, completed) {
  if (!completed) return 0;
  return Math.max(25, 100 - mistakes * 25);
}

// Trivia: percentage of correct answers
function triviaPoints(score, total) {
  return Math.round((score / total) * 100);
}

// Wordle: fewer guesses = more points; failed = 0
const WORDLE_POINTS = [100, 85, 70, 55, 40, 25];
function wordlePoints(guessRow, completed) {
  return completed ? (WORDLE_POINTS[guessRow] || 25) : 0;
}

function submitGameScore(game, data) {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  done[game] = data;
  localStorage.setItem("weddingDone", JSON.stringify(done));

  // Push to Firebase
  if (window.firebaseReady) {
    window.submitScore(game, data);
  }
}

function updatePortalBadges() {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  ["connections", "trivia", "wordle"].forEach(g => {
    const badge = document.getElementById("badge-" + g);
    if (!badge) return;
    const d = done[g];
    if (d) {
      const pts = typeof d === "object" ? (d.points ?? 0) : 0;
      badge.textContent = `✓ ${pts} נק'`;
      badge.style.display = "block";
      badge.closest(".game-card").classList.add("done");
    } else {
      badge.style.display = "none";
      badge.closest(".game-card").classList.remove("done");
    }
  });
  const total = getLocalTotal(done);
  const el = document.getElementById("portal-total-score");
  if (el) el.textContent = total > 0 ? `סה"כ: ${total} נקודות` : "";
}

function getLocalTotal(done) {
  let total = 0;
  ["connections", "trivia", "wordle"].forEach(g => {
    const d = done[g];
    if (d && typeof d === "object" && d.points != null) total += d.points;
  });
  return total;
}

function showScoreBlock(prefix, points, detail) {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  const total = getLocalTotal(done);
  const pEl = document.getElementById(`${prefix}-score-points`);
  const sEl = document.getElementById(`${prefix}-score-sub`);
  const tEl = document.getElementById(`${prefix}-score-total`);
  if (pEl) pEl.textContent = `${points} נקודות`;
  if (sEl) sEl.textContent = detail;
  if (tEl) tEl.textContent = `סה"כ: ${total} נקודות`;
}

function showCompletedGame(game, data) {
  if (game === "connections") {
    document.getElementById("connections-solved").innerHTML = "";
    GAME_DATA.connections.categories.forEach(cat => {
      const row = document.createElement("div");
      row.className = `conn-solved ${cat.color}`;
      row.innerHTML = `<strong>${cat.name}</strong><br>${cat.items.join(" · ")}`;
      document.getElementById("connections-solved").appendChild(row);
    });
    document.getElementById("connections-grid").innerHTML = "";
    showConnectionsFinal(data);
  } else if (game === "trivia") {
    document.getElementById("trivia-content").style.display = "none";
    document.getElementById("trivia-final").classList.remove("hidden");
    const pct = (data.score || 0) / (data.total || 1);
    document.getElementById("trivia-final-icon").textContent =
      pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.5 ? "👏" : "💪";
    document.getElementById("final-score-text").textContent =
      `ענית נכון על ${data.score || 0} מתוך ${data.total || 0} שאלות!`;
    showScoreBlock("trivia", data.points || 0, `${data.score || 0} מתוך ${data.total || 0} נכון`);
  } else if (game === "wordle") {
    document.getElementById("wordle-hint").textContent =
      GAME_DATA.wordle.hint || `נחש/י מילה בת ${GAME_DATA.wordle.word.length} אותיות`;
    document.getElementById("wordle-grid").style.display = "none";
    document.getElementById("wordle-keyboard").style.display = "none";
    document.getElementById("wordle-final").classList.remove("hidden");
    document.getElementById("wordle-final-icon").textContent  = data.completed ? "🎊" : "😔";
    document.getElementById("wordle-final-title").textContent = data.completed ? "כל הכבוד!" : "אוי...";
    document.getElementById("wordle-final-text").textContent  = data.completed
      ? `מצאת את המילה "${GAME_DATA.wordle.word}" 🎉`
      : `המילה הייתה: ${GAME_DATA.wordle.word}`;
    showScoreBlock("wordle", data.points || 0,
      data.completed ? `${data.guesses} ניסיונות` : "לא הצלחת");
  }
}

// ================================================================
// HELPERS
// ================================================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ================================================================
// CONNECTIONS GAME
// ================================================================

function initConnections() {
  const allItems = [];
  GAME_DATA.connections.categories.forEach((cat, ci) => {
    cat.items.forEach(text => allItems.push({ text, categoryIndex: ci }));
  });

  conn = {
    items: shuffle(allItems),
    selected: [],
    solved: [],
    lives: 4,
    gameOver: false
  };

  document.getElementById("connections-solved").innerHTML = "";
  document.getElementById("connections-result").className = "result-banner hidden";
  document.getElementById("connections-final").classList.add("hidden");
  document.getElementById("connections-grid").style.display = "";
  document.getElementById("connections-actions").style.display = "";
  renderConnectionsGrid();
  renderConnectionsLives();
}

function renderConnectionsLives() {
  document.getElementById("connections-lives").textContent =
    "❤️".repeat(conn.lives) + "🖤".repeat(4 - conn.lives);
}

function renderConnectionsGrid() {
  const grid = document.getElementById("connections-grid");
  grid.innerHTML = "";
  conn.items.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.className = "conn-item" + (conn.selected.includes(i) ? " selected" : "");
    btn.textContent = item.text;
    btn.onclick = () => connectionsToggle(i);
    grid.appendChild(btn);
  });
}

function connectionsToggle(i) {
  if (conn.gameOver) return;
  const idx = conn.selected.indexOf(i);
  if (idx >= 0) {
    conn.selected.splice(idx, 1);
  } else {
    if (conn.selected.length >= 4) return;
    conn.selected.push(i);
  }
  renderConnectionsGrid();
}

function connectionsDeselect() {
  conn.selected = [];
  renderConnectionsGrid();
}

function connectionsSubmit() {
  if (conn.gameOver) return;
  if (conn.selected.length !== 4) {
    showConnResult("בחר/י בדיוק 4 פריטים", "error");
    return;
  }

  const chosen = conn.selected.map(i => conn.items[i]);
  const catIndex = chosen[0].categoryIndex;
  const allMatch = chosen.every(item => item.categoryIndex === catIndex);

  if (allMatch) {
    const cat = GAME_DATA.connections.categories[catIndex];
    conn.solved.push(cat);

    const toRemove = [...conn.selected].sort((a, b) => b - a);
    toRemove.forEach(i => conn.items.splice(i, 1));
    conn.selected = [];

    const solvedEl = document.getElementById("connections-solved");
    const row = document.createElement("div");
    row.className = `conn-solved ${cat.color}`;
    row.innerHTML = `<strong>${cat.name}</strong><br>${cat.items.join(" · ")}`;
    solvedEl.appendChild(row);

    if (conn.solved.length === 4) {
      conn.gameOver = true;
      const mistakes = 4 - conn.lives;
      const pts = connectionsPoints(mistakes, true);
      const scoreData = { completed: true, mistakes, points: pts };
      submitGameScore("connections", scoreData);
      showConnResult("כל הכבוד! פתרת את כל החיבורים! 🎉", "success");
      setTimeout(() => showConnectionsFinal(scoreData), 1000);
    } else {
      showConnResult("נכון! 🎉", "success");
    }
  } else {
    const counts = {};
    chosen.forEach(item => { counts[item.categoryIndex] = (counts[item.categoryIndex] || 0) + 1; });
    const oneAway = Object.values(counts).some(c => c === 3);

    conn.lives--;
    conn.selected = [];

    const grid = document.getElementById("connections-grid");
    grid.classList.add("shake");
    setTimeout(() => grid.classList.remove("shake"), 500);

    if (conn.lives <= 0) {
      conn.gameOver = true;
      revealRemainingConnections();
      const failData = { completed: false, mistakes: 4, points: 0 };
      submitGameScore("connections", failData);
      showConnResult("נגמרו החיים 💔", "error");
      setTimeout(() => showConnectionsFinal(failData), 1400);
    } else {
      showConnResult(oneAway ? "כמעט! חסר אחד... 🤏" : "לא נכון, נסה שוב", "error");
    }
    renderConnectionsLives();
  }

  renderConnectionsGrid();
}

function revealRemainingConnections() {
  const solvedNames = new Set(conn.solved.map(s => s.name));
  const solvedEl = document.getElementById("connections-solved");
  GAME_DATA.connections.categories.forEach(cat => {
    if (!solvedNames.has(cat.name)) {
      const row = document.createElement("div");
      row.className = `conn-solved ${cat.color}`;
      row.style.opacity = "0.65";
      row.innerHTML = `<strong>${cat.name}</strong><br>${cat.items.join(" · ")}`;
      solvedEl.appendChild(row);
    }
  });
}

function showConnResult(msg, type) {
  const el = document.getElementById("connections-result");
  el.textContent = msg;
  el.className = `result-banner ${type}`;
  setTimeout(() => { el.className = "result-banner hidden"; }, 2800);
}

function showConnectionsFinal(data) {
  document.getElementById("connections-grid").style.display = "none";
  document.getElementById("connections-actions").style.display = "none";
  document.getElementById("connections-result").className = "result-banner hidden";
  document.getElementById("connections-final").classList.remove("hidden");

  document.getElementById("conn-final-icon").textContent = data.completed ? "🎉" : "😔";
  document.getElementById("conn-final-title").textContent = data.completed ? "כל הכבוד!" : "אוי...";
  document.getElementById("conn-final-text").textContent = data.completed
    ? `סיימת עם ${data.mistakes === 0 ? "ללא טעויות" : `${data.mistakes} טעויות`}!`
    : "נגמרו החיים 💔";
  showScoreBlock("conn", data.points || 0,
    data.completed ? (data.mistakes === 0 ? "ללא טעויות" : `${data.mistakes} טעויות`) : "לא הושלם");
  setTimeout(() =>
    document.getElementById("connections-final").scrollIntoView({ behavior: "smooth", block: "start" })
  , 100);
}

// ================================================================
// TRIVIA GAME
// ================================================================

function initTrivia() {
  trivia = {
    questions: shuffle(GAME_DATA.trivia.questions),
    index: 0,
    score: 0,
    answered: false
  };

  document.getElementById("trivia-final").classList.add("hidden");
  document.getElementById("trivia-content").style.display = "";
  renderTrivia();
}

function renderTrivia() {
  const { questions, index } = trivia;
  const total = questions.length;
  const q = questions[index];

  document.getElementById("trivia-progress").style.width = `${(index / total) * 100}%`;
  document.getElementById("question-counter").textContent = `שאלה ${index + 1} מתוך ${total}`;
  document.getElementById("trivia-question").textContent = q.question;

  const opts = document.getElementById("trivia-options");
  opts.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => triviaAnswer(i);
    opts.appendChild(btn);
  });

  document.getElementById("trivia-next").classList.add("hidden");
  trivia.answered = false;
}

function triviaAnswer(chosen) {
  if (trivia.answered) return;
  trivia.answered = true;

  const q = trivia.questions[trivia.index];
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    else if (i === chosen) btn.classList.add("wrong");
  });

  if (chosen === q.answer) trivia.score++;
  document.getElementById("trivia-next").classList.remove("hidden");
}

function triviaNext() {
  trivia.index++;
  if (trivia.index >= trivia.questions.length) {
    triviaFinish();
  } else {
    renderTrivia();
  }
}

function triviaFinish() {
  const { score, questions } = trivia;
  const total = questions.length;

  document.getElementById("trivia-content").style.display = "none";
  document.getElementById("trivia-final").classList.remove("hidden");

  const pct = score / total;
  const icon = pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.5 ? "👏" : "💪";
  document.getElementById("trivia-final-icon").textContent = icon;
  document.getElementById("final-score-text").textContent =
    `ענית נכון על ${score} מתוך ${total} שאלות!`;

  const pts = triviaPoints(score, total);
  submitGameScore("trivia", { score, total, points: pts });
  showScoreBlock("trivia", pts, `${score} מתוך ${total} נכון`);
}

// ================================================================
// WORDLE GAME
// ================================================================

const KEYBOARD_ROWS = [
  ["פ", "ו", "ט", "א", "ר", "ק", "ם", "ן"],
  ["ף", "ך", "ל", "ח", "י", "ע", "כ", "ג", "ד", "ש"],
  ["ENTER", "ץ", "ת", "צ", "מ", "נ", "ה", "ב", "ס", "ז", "DEL"]
];

function initWordle() {
  const data = GAME_DATA.wordle;
  wordle = {
    word: data.word,
    wordLength: data.word.length,
    maxGuesses: data.maxGuesses || 6,
    guess: [],
    guesses: [],
    row: 0,
    keyColors: {},
    gameOver: false
  };

  document.getElementById("wordle-hint").textContent =
    data.hint || `נחש/י מילה בת ${data.word.length} אותיות`;
  document.getElementById("wordle-final").classList.add("hidden");
  document.getElementById("wordle-grid").style.display = "";
  document.getElementById("wordle-keyboard").style.display = "";
  document.getElementById("wordle-message").textContent = "";

  const sz = wordle.wordLength <= 5 ? 52 : wordle.wordLength <= 6 ? 46 : 40;
  document.querySelectorAll(".wordle-cell").forEach(c => {
    c.style.width = sz + "px";
    c.style.height = sz + "px";
  });

  buildWordleGrid();
  buildWordleKeyboard();
  updateWordleCounter();
}

function buildWordleGrid() {
  const grid = document.getElementById("wordle-grid");
  grid.innerHTML = "";
  for (let r = 0; r < wordle.maxGuesses; r++) {
    const row = document.createElement("div");
    row.className = "wordle-row";
    row.id = `wrow-${r}`;
    for (let c = 0; c < wordle.wordLength; c++) {
      const cell = document.createElement("div");
      cell.className = "wordle-cell";
      cell.id = `wcell-${r}-${c}`;
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function buildWordleKeyboard() {
  const kb = document.getElementById("wordle-keyboard");
  kb.innerHTML = "";
  KEYBOARD_ROWS.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key-btn";
      if (key === "ENTER") {
        btn.textContent = "נחש";
        btn.classList.add("wide");
        btn.onclick = wordleSubmit;
      } else if (key === "DEL") {
        btn.textContent = "⌫";
        btn.classList.add("wide");
        btn.onclick = wordleDelete;
      } else {
        btn.textContent = key;
        btn.id = `wkey-${key}`;
        const color = wordle.keyColors[key];
        if (color) btn.classList.add(color);
        btn.onclick = () => wordleType(key);
      }
      rowEl.appendChild(btn);
    });
    kb.appendChild(rowEl);
  });
}

function wordleType(letter) {
  if (wordle.gameOver || wordle.guess.length >= wordle.wordLength) return;
  wordle.guess.push(letter);
  updateWordleCurrentRow();
}

function wordleDelete() {
  if (wordle.guess.length === 0) return;
  wordle.guess.pop();
  updateWordleCurrentRow();
}

function updateWordleCurrentRow() {
  for (let c = 0; c < wordle.wordLength; c++) {
    const cell = document.getElementById(`wcell-${wordle.row}-${c}`);
    if (!cell) continue;
    if (c < wordle.guess.length) {
      cell.textContent = wordle.guess[c];
      cell.classList.add("filled");
    } else {
      cell.textContent = "";
      cell.classList.remove("filled");
    }
  }
}

function wordleSubmit() {
  if (wordle.gameOver) return;
  if (wordle.guess.length < wordle.wordLength) {
    showWordleMsg(`המילה חייבת להיות בת ${wordle.wordLength} אותיות`);
    document.getElementById(`wrow-${wordle.row}`).classList.add("shake");
    setTimeout(() => document.getElementById(`wrow-${wordle.row}`).classList.remove("shake"), 450);
    return;
  }

  const guess = [...wordle.guess];
  const result = scoreWordle(guess, wordle.word);
  wordle.guesses.push(guess);

  guess.forEach((letter, c) => {
    const cell = document.getElementById(`wcell-${wordle.row}-${c}`);
    setTimeout(() => {
      cell.classList.add("flip");
      cell.classList.remove("filled");
      cell.classList.add(result[c]);
    }, c * 180);

    const cur = wordle.keyColors[letter];
    if (!cur || result[c] === "correct" || (result[c] === "present" && cur === "absent")) {
      wordle.keyColors[letter] = result[c];
    }
  });

  const animDone = wordle.wordLength * 180 + 200;

  if (guess.join("") === wordle.word) {
    wordle.gameOver = true;
    const guessRow = wordle.row;
    submitGameScore("wordle", {
      completed: true,
      guesses: guessRow + 1,
      points: wordlePoints(guessRow, true)
    });
    setTimeout(() => {
      buildWordleKeyboard();
      showWordleFinal(true);
    }, animDone);
  } else {
    wordle.row++;
    wordle.guess = [];
    setTimeout(() => {
      buildWordleKeyboard();
      if (wordle.row >= wordle.maxGuesses) {
        wordle.gameOver = true;
        submitGameScore("wordle", { completed: false, guesses: wordle.maxGuesses, points: 0 });
        showWordleFinal(false);
      } else {
        updateWordleCounter();
      }
    }, animDone);
  }
}

function scoreWordle(guess, word) {
  const result = Array(guess.length).fill("absent");
  const wordArr = word.split("");
  const used = Array(wordArr.length).fill(false);

  guess.forEach((l, i) => {
    if (l === wordArr[i]) { result[i] = "correct"; used[i] = true; }
  });
  guess.forEach((l, i) => {
    if (result[i] === "correct") return;
    const j = wordArr.findIndex((wl, wi) => !used[wi] && wl === l);
    if (j !== -1) { result[i] = "present"; used[j] = true; }
  });

  return result;
}

function showWordleMsg(msg) {
  const el = document.getElementById("wordle-message");
  el.textContent = msg;
  setTimeout(() => { el.textContent = ""; }, 2000);
}

function updateWordleCounter() {
  const left = wordle.maxGuesses - wordle.row;
  document.getElementById("wordle-attempts-left").textContent =
    left === wordle.maxGuesses ? "" : `${left} ניסיונות נותרו`;
}

function showWordleFinal(won) {
  document.getElementById("wordle-grid").style.display = "none";
  document.getElementById("wordle-keyboard").style.display = "none";
  document.getElementById("wordle-final").classList.remove("hidden");
  document.getElementById("wordle-final-icon").textContent  = won ? "🎊" : "😔";
  document.getElementById("wordle-final-title").textContent = won ? "כל הכבוד!" : "אוי...";
  document.getElementById("wordle-final-text").textContent  = won
    ? `מצאת את המילה "${wordle.word}" 🎉`
    : `המילה הייתה: ${wordle.word}`;
  const wDone = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  const wd = wDone.wordle || {};
  showScoreBlock("wordle", wd.points || 0, won ? `${wd.guesses} ניסיונות` : "לא הצלחת");
}

document.addEventListener("keydown", e => {
  if (currentScreen !== "wordle" || wordle.gameOver) return;
  if (e.key === "Enter") { wordleSubmit(); return; }
  if (e.key === "Backspace") { wordleDelete(); return; }
  if (/^[א-ת]$/.test(e.key)) wordleType(e.key);
});

// ================================================================
// LEADERBOARD
// ================================================================

const MEDALS = ["🥇", "🥈", "🥉"];

function openLeaderboard() {
  showScreen("leaderboard");
  const content = document.getElementById("leaderboard-content");
  content.innerHTML = '<p class="lb-loading">טוען תוצאות...</p>';

  if (!window.firebaseReady) {
    content.innerHTML = '<p class="lb-empty">לוח התוצאות יהיה זמין לאחר הגדרת Firebase.<br>ראה הוראות ב־firebase.js</p>';
    return;
  }

  window.fetchLeaderboard(rows => {
    renderLeaderboard(rows);
    // Re-fetch once after a short delay to catch scores that just finished writing
    setTimeout(() => {
      if (currentScreen === "leaderboard") window.fetchLeaderboard(renderLeaderboard);
    }, 2000);
  });
}

function renderLeaderboard(rows) {
  const content = document.getElementById("leaderboard-content");
  const myId = window.getPlayerId ? window.getPlayerId() : null;

  if (!rows || rows.length === 0) {
    content.innerHTML = '<p class="lb-empty">אין תוצאות עדיין — היו הראשונים! 🎮</p>';
    return;
  }

  const html = rows.map((row, i) => {
    const isMe = row.id === myId;
    const medal = MEDALS[i] || `${i + 1}.`;
    const total = row.total || 0;

    const connScore  = row.connections ? (row.connections.completed ? `${row.connections.points}` : "0") : "—";
    const trivScore  = row.trivia      ? `${row.trivia.score}/${row.trivia.total}` : "—";
    const wordScore  = row.wordle      ? (row.wordle.completed ? `${row.wordle.guesses} ניסיונות` : "לא הושלם") : "—";

    return `
      <div class="lb-row${isMe ? " lb-me" : ""}">
        <div class="lb-rank">${medal}</div>
        <div class="lb-info">
          <div class="lb-name">${row.name || "אנונימי"}</div>
          <div class="lb-details">
            <span title="חיבורים">🔗 ${connScore}</span>
            <span title="טריוויה">❓ ${trivScore}</span>
            <span title="וורדל">📝 ${wordScore}</span>
          </div>
        </div>
        <div class="lb-total">${total}<span class="lb-pts"> נק'</span></div>
      </div>`;
  }).join("");

  content.innerHTML = `<div class="lb-list">${html}</div>`;
}

// ================================================================
// INIT
// ================================================================

window.addEventListener("load", () => {
  const saved = localStorage.getItem("weddingPlayer");
  if (saved) {
    playerName = saved;
    window.playerName = saved;
    document.getElementById("player-name").value = saved;
  }
  if (new URLSearchParams(window.location.search).has("test")) {
    const badge = document.createElement("div");
    badge.id = "test-badge";
    badge.style.cssText = "position:fixed;top:8px;left:8px;background:#e74c3c;color:#fff;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:6px;z-index:9999;opacity:0.9;line-height:1.5;max-width:200px;word-break:break-all;";
    badge.textContent = "🧪 TEST MODE";
    document.body.appendChild(badge);
    window._updateTestBadge = () => {
      const id = localStorage.getItem("weddingPlayerId") || "(not yet assigned)";
      badge.innerHTML = `🧪 TEST MODE<br><span style="font-weight:400;opacity:0.85">${id}</span>`;
    };
    window._updateTestBadge();
  }
  showScreen("welcome");
});
