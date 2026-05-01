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
        name: "קטגוריה ראשונה — שם הקטגוריה",
        color: "yellow",
        items: ["פריט 1", "פריט 2", "פריט 3", "פריט 4"]
      },
      {
        name: "קטגוריה שנייה — שם הקטגוריה",
        color: "green",
        items: ["פריט 5", "פריט 6", "פריט 7", "פריט 8"]
      },
      {
        name: "קטגוריה שלישית — שם הקטגוריה",
        color: "blue",
        items: ["פריט 9", "פריט 10", "פריט 11", "פריט 12"]
      },
      {
        name: "קטגוריה רביעית — שם הקטגוריה",
        color: "purple",
        items: ["פריט 13", "פריט 14", "פריט 15", "פריט 16"]
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
    word: "שלום",
    hint: "רמז: זה מה שאנחנו רוצים לאחל לכולכם!",
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
  items: [],       // { text, categoryIndex }[]
  selected: [],    // indices into items[]
  solved: [],      // category objects
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
  guess: [],       // current letters being typed
  guesses: [],     // submitted guesses (arrays of letters)
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
  playerName = name;
  localStorage.setItem("weddingPlayer", name);
  document.getElementById("display-name").textContent = name;
  showScreen("portal");
}

function handleNameEnter(e) {
  if (e.key === "Enter") submitName();
}

function startGame(game) {
  if (game === "connections") initConnections();
  else if (game === "trivia") initTrivia();
  else if (game === "wordle") initWordle();
  showScreen(game);
}

// ================================================================
// GAME COMPLETION
// ================================================================

function markComplete(game) {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  done[game] = true;
  localStorage.setItem("weddingDone", JSON.stringify(done));
}

function updatePortalBadges() {
  const done = JSON.parse(localStorage.getItem("weddingDone") || "{}");
  ["connections", "trivia", "wordle"].forEach(g => {
    const badge = document.getElementById("badge-" + g);
    if (badge) badge.style.display = done[g] ? "block" : "none";
  });
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

    // Remove solved items from the board
    const toRemove = [...conn.selected].sort((a, b) => b - a);
    toRemove.forEach(i => conn.items.splice(i, 1));
    conn.selected = [];

    // Append solved row
    const solvedEl = document.getElementById("connections-solved");
    const row = document.createElement("div");
    row.className = `conn-solved ${cat.color}`;
    row.innerHTML = `<strong>${cat.name}</strong><br>${cat.items.join(" · ")}`;
    solvedEl.appendChild(row);

    if (conn.solved.length === 4) {
      conn.gameOver = true;
      markComplete("connections");
      showConnResult("כל הכבוד! פתרת את כל החיבורים! 🎉", "success");
    } else {
      showConnResult("נכון! 🎉", "success");
    }
  } else {
    // Check "one away"
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
      showConnResult("נגמרו החיים 💔", "error");
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
  const finalEl = document.getElementById("trivia-final");
  finalEl.classList.remove("hidden");

  const pct = score / total;
  const icon = pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.5 ? "👏" : "💪";
  document.getElementById("trivia-final-icon").textContent = icon;
  document.getElementById("final-score-text").textContent =
    `ענית נכון על ${score} מתוך ${total} שאלות!`;

  markComplete("trivia");
}

// ================================================================
// WORDLE GAME
// ================================================================

// Hebrew keyboard rows (right to left display, RTL direction on rows)
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

  // Adjust cell size for longer words
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

  // Animate cells and apply colors
  guess.forEach((letter, c) => {
    const cell = document.getElementById(`wcell-${wordle.row}-${c}`);
    setTimeout(() => {
      cell.classList.add("flip");
      cell.classList.remove("filled");
      cell.classList.add(result[c]);
    }, c * 180);

    // Update key color (correct > present > absent)
    const cur = wordle.keyColors[letter];
    if (!cur || result[c] === "correct" || (result[c] === "present" && cur === "absent")) {
      wordle.keyColors[letter] = result[c];
    }
  });

  const animDone = wordle.wordLength * 180 + 200;

  if (guess.join("") === wordle.word) {
    wordle.gameOver = true;
    markComplete("wordle");
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

  // Pass 1: exact matches
  guess.forEach((l, i) => {
    if (l === wordArr[i]) { result[i] = "correct"; used[i] = true; }
  });
  // Pass 2: present but wrong position
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
  const final = document.getElementById("wordle-final");
  final.classList.remove("hidden");
  document.getElementById("wordle-final-icon").textContent  = won ? "🎊" : "😔";
  document.getElementById("wordle-final-title").textContent = won ? "כל הכבוד!" : "אוי...";
  document.getElementById("wordle-final-text").textContent  = won
    ? `מצאת את המילה "${wordle.word}" 🎉`
    : `המילה הייתה: ${wordle.word}`;
}

// Physical Hebrew keyboard support for Wordle
document.addEventListener("keydown", e => {
  if (currentScreen !== "wordle" || wordle.gameOver) return;
  if (e.key === "Enter") { wordleSubmit(); return; }
  if (e.key === "Backspace") { wordleDelete(); return; }
  if (/^[א-ת]$/.test(e.key)) wordleType(e.key);
});

// ================================================================
// INIT
// ================================================================

window.addEventListener("load", () => {
  const saved = localStorage.getItem("weddingPlayer");
  if (saved) {
    playerName = saved;
    document.getElementById("player-name").value = saved;
  }
  showScreen("welcome");
});
