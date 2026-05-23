// ================================================================
// WEDDING GAME DATA — fill in your content here!
// ================================================================

const GAME_DATA = {

  // --- CONNECTIONS ---
  // 4 categories × 4 items each (16 items total)
  connections: {
    categories: [
      {
        name: "קוסקוס",
        color: "yellow",
        items: ["שמן ", "סול", "מרק", "יום שלישי"]
      },
      {
        name: "מקומות שגרנו בהם ביחד",
        color: "green",
        items: ["אפקה ", "קצרין", "קליבלנד", "לחובר"]
      },
      {
        name: "דברים שאסף עשה בגלל אילנה",
        color: "blue",
        items: ["טבעונות", "אומנה", "חופשה בתאילנד", "לעבור לתל אביב"]
      },
      {
        name: "דברים שאילנה עשתה בגלל אסף",
        color: "purple",
        items: ["מרתון", "טיפוס פסגות", "שתיית בירה", "3 ארוחות ביום"]
      }
    ]
  },

  // --- TRIVIA ---
  // answer: index of the correct option (0 = first option)
  trivia: {
    questions: [
      {
        question: "מאיזו שנה אסף ואילנה ביחד?",
        answer: "2019"
      },
      {
        question: "באילו מדינות בעולם טיילנו ביחד?",
        answer: "אוסטריה, יוון, פרו, בוליביה, הודו, סרי לנקה, נפאל"
      },
      {
        question: "לאן אנחנו טסים בירח דבש?",
        answer: "ניו זילנד"
      },
      {
        question: "איפה אסף הציע לאילנה נישואין?",
        answer: "Pico Austria בבוליביה"
      },
      {
        question: "לכמה כלבים עשינו אומנה?",
        answer: "10"
      },
      {
        question: "מה האטרקציה האהובה עלינו בכל יעד?",
        answer: "סופרמרקט"
      },
      {
        question: "מי היה טבעוני קודם ומי סתם מושפע?",
        answer: "אילנה (הטבעונית המקורית), אסף (המושפע)"
      },
      {
        question: "כמה בירות שונות אסף שתה עד היום?",
        answer: "806"
      },
      {
        question: "באיזה סוג חקלאות עבדנו ברמת הגולן?",
        answer: "קטיף תפוחים"
      },
      {
        question: "איזה מקום לקח אסף במרתון ים המלח?",
        answer: "מקום 13"
      },
      {
        question: "איזה פודקאסט אילנה שמעה במהלך רוב ריצת המרתון?",
        answer: "למי אכפת"
      },
      {
        question: "אם צריך לנחש מדינה, איזו מדינה אילנה תנחש?",
        answer: "ג'יבוטי"
      },
      {
        question: "מה מהבאים קוסקוס אכל ברחוב: לאפה שווארמה / יונה פצועה / פיינט של בן אנד ג'ריס?",
        answer: "פיינט של בן אנד ג'ריס"
      },
      {
        question: "מה הגובה הכי גבוה שטיפסנו אליו? (6200 / 6380 / 6342 / 6236 מטר)",
        answer: "6348" 
      },
      {
        question: "איזו רופאה אילנה רוצה להיות?",
        answer: "פנימאית (בינתיים!)"
      },
      {
        question: "מה המקום הכי מוזר שאסף עבד בו מרחוק?",
        answer: "משאית לוחמה אלקטרונית בצפון"
      },
      {
        question: "מהי הלהקה הישראלית האהובה על אסף?",
        answer: "כוורת"
      },
      {
        question: "מה הדבר הכי ביזארי שאילנה עשתה בשביל לחסוך כסף בטיול הגדול?",
        answer: "ליקוט מזון בהוסטלים"
      },
      {
        question: "מה הסדרה הנוכחית שאילנה ואסף צופים בה?",
        answer: "Six Feet Under"
      },
      {
        question: "באיזה מקום אסף ואילנה היו ביחד במילואים?",
        answer: "דלתון"
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
  else if (game === "memes") initMemes();
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
function triviaPoints(score) {
  return score * 10;
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
    questions: [...GAME_DATA.trivia.questions],
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

  document.getElementById("trivia-reveal").classList.remove("hidden");
  document.getElementById("trivia-answer").classList.add("hidden");
  document.getElementById("trivia-answer").textContent = "";
  document.getElementById("trivia-self-assess").classList.add("hidden");
  trivia.answered = false;
}

function triviaReveal() {
  const q = trivia.questions[trivia.index];
  document.getElementById("trivia-reveal").classList.add("hidden");
  document.getElementById("trivia-answer").textContent = q.answer;
  document.getElementById("trivia-answer").classList.remove("hidden");
  document.getElementById("trivia-self-assess").classList.remove("hidden");
}

function triviaAnswer(correct) {
  if (trivia.answered) return;
  trivia.answered = true;
  if (correct) trivia.score++;
  document.getElementById("trivia-self-assess").classList.add("hidden");
  trivia.index++;
  if (trivia.index >= trivia.questions.length) {
    triviaFinish();
  } else {
    setTimeout(() => renderTrivia(), 350);
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

  const pts = triviaPoints(score);
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
            <span title="20 שאלות">❓ ${trivScore}</span>
            <span title="וורדל">📝 ${wordScore}</span>
          </div>
        </div>
        <div class="lb-total">${total}<span class="lb-pts"> נק'</span></div>
      </div>`;
  }).join("");

  content.innerHTML = `<div class="lb-list">${html}</div>`;
}

// ================================================================
// MEME CONTEST
// ================================================================

let meme = {
  selectedBlob: null,
  myMemeId: null,
  votedIds: new Set()
};

function initMemes() {
  meme.votedIds = new Set(JSON.parse(localStorage.getItem("weddingVotedMemes") || "[]"));
  meme.myMemeId = localStorage.getItem("weddingMyMemeId") || null;

  const form = document.getElementById("meme-upload-form");
  const done = document.getElementById("meme-already-uploaded");
  cancelMemeUpload();

  if (meme.myMemeId) {
    form.classList.add("hidden");
    done.classList.remove("hidden");
  } else if (window.firebaseReady) {
    window.getUserMemeId(id => {
      if (id) {
        meme.myMemeId = id;
        localStorage.setItem("weddingMyMemeId", id);
        form.classList.add("hidden");
        done.classList.remove("hidden");
      } else {
        form.classList.remove("hidden");
        done.classList.add("hidden");
      }
    });
  } else {
    form.classList.remove("hidden");
    done.classList.add("hidden");
  }

  refreshMemes();
}

function handleMemeFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("נא לבחור קובץ תמונה"); return; }
  if (file.size > 5 * 1024 * 1024) { alert("גודל מקסימלי: 5MB"); return; }

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("meme-preview").src = ev.target.result;
    document.getElementById("meme-drop-zone").style.display = "none";
    document.getElementById("meme-preview-wrap").classList.remove("hidden");
  };
  reader.readAsDataURL(file);

  resizeMemeImage(file, blob => { meme.selectedBlob = blob; });
}

function resizeMemeImage(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      const r = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * r);
      canvas.height = Math.round(img.height * r);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(callback, "image/jpeg", 0.82);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function cancelMemeUpload() {
  meme.selectedBlob = null;
  const input = document.getElementById("meme-file-input");
  if (input) input.value = "";
  const dz = document.getElementById("meme-drop-zone");
  const pw = document.getElementById("meme-preview-wrap");
  const prog = document.getElementById("meme-upload-progress");
  if (dz) dz.style.display = "";
  if (pw) pw.classList.add("hidden");
  if (prog) prog.classList.add("hidden");
}

function submitMeme() {
  if (!meme.selectedBlob) { alert("נא לבחור תמונה"); return; }
  if (!window.firebaseReady) { alert("Firebase לא מוגדר"); return; }

  document.getElementById("meme-preview-wrap").classList.add("hidden");
  document.getElementById("meme-upload-progress").classList.remove("hidden");
  document.getElementById("meme-upload-bar").style.width = "0%";
  document.getElementById("meme-upload-pct").textContent = "0%";

  window.uploadMeme(meme.selectedBlob, playerName,
    pct => {
      document.getElementById("meme-upload-bar").style.width = pct + "%";
      document.getElementById("meme-upload-pct").textContent = pct + "%";
    },
    (memeId, err) => {
      document.getElementById("meme-upload-progress").classList.add("hidden");
      if (err) {
        console.error("[Meme upload error]", err);
        alert("שגיאה בהעלאה: " + (err.message || err.code || err));
        document.getElementById("meme-preview-wrap").classList.remove("hidden");
        return;
      }
      meme.myMemeId = memeId;
      localStorage.setItem("weddingMyMemeId", memeId);
      document.getElementById("meme-upload-form").classList.add("hidden");
      document.getElementById("meme-already-uploaded").classList.remove("hidden");
      refreshMemes();
    }
  );
}

function showMemeReplaceForm() {
  meme.myMemeId = null;
  localStorage.removeItem("weddingMyMemeId");
  document.getElementById("meme-already-uploaded").classList.add("hidden");
  document.getElementById("meme-upload-form").classList.remove("hidden");
  cancelMemeUpload();
}

function refreshMemes() {
  const gallery = document.getElementById("meme-gallery");
  gallery.innerHTML = '<p class="meme-loading">טוען מימים...</p>';
  if (!window.firebaseReady) {
    gallery.innerHTML = '<p class="meme-loading">Firebase לא מוגדר</p>';
    return;
  }
  window.fetchMemes(renderMemeGallery);
}

function renderMemeGallery(memes) {
  const gallery = document.getElementById("meme-gallery");
  const myPlayerId = window.getPlayerId ? window.getPlayerId() : null;

  if (!memes || !memes.length) {
    gallery.innerHTML = '<p class="meme-empty">אין מימים עדיין — העלה/י את הראשון! 😄</p>';
    return;
  }

  gallery.innerHTML = "";
  memes.forEach((m, rank) => {
    const isOwn = m.uploaderId === myPlayerId;
    const voted = meme.votedIds.has(m.id);
    const canVote = !isOwn && !voted;

    const card = document.createElement("div");
    card.className = "meme-card" + (rank === 0 ? " meme-top" : "");
    card.innerHTML = `
      ${rank === 0 ? '<div class="meme-crown">👑 הכי מצחיק</div>' : ""}
      <img class="meme-img" src="${m.imageUrl}" alt="מם" loading="lazy">
      <div class="meme-card-footer">
        <span class="meme-uploader">${escapeHtml(m.uploaderName || "אנונימי")}</span>
        <button class="meme-vote-btn${voted ? " voted" : ""}${isOwn ? " own" : ""}"
                ${canVote ? "" : "disabled"}
                onclick="handleMemeVote('${m.id}', this)">
          👍 <span class="meme-vote-count">${m.voteCount || 0}</span>
        </button>
      </div>`;
    gallery.appendChild(card);
  });
}

function handleMemeVote(memeId, btn) {
  btn.disabled = true;
  window.voteMeme(memeId, (newCount, err) => {
    if (err) { btn.disabled = false; return; }
    meme.votedIds.add(memeId);
    localStorage.setItem("weddingVotedMemes", JSON.stringify([...meme.votedIds]));
    btn.classList.add("voted");
    btn.querySelector(".meme-vote-count").textContent = newCount;
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
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
