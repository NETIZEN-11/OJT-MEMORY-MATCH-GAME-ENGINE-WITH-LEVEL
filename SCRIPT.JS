// SOUND ELEMENTS
const flipSound = document.getElementById("s_flip");
const matchSound = document.getElementById("s_match");
const wrongSound = document.getElementById("s_wrong");
const winSound = document.getElementById("s_win");

// SCREEN ELEMENTS
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const levelScreen = document.getElementById("levelScreen");
const gameScreen = document.getElementById("gameScreen");

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const matchesEl = document.getElementById("matches");

const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const backBtn = document.getElementById("backBtn");
const message = document.getElementById("message");

// GAME VARIABLES
let score = 0;
let timer = 30;
let interval = null;
let selected = [];
let matchedCount = 0;
let totalCards = 6;
let isPaused = false;
let currentLevel = "easy"; //  last selected level remember

// Level configuration (TOTAL CARDS)
const levelConfig = {
    easy: 6,   // 3x2
    medium: 12, // 4x3
    hard: 16   // 4x4
};

// START BUTTON
startBtn.onclick = () => {
    startScreen.classList.add("hidden");
    levelScreen.classList.remove("hidden");
};

// LEVEL SELECTION
document.querySelectorAll(".level").forEach(btn => {
    btn.addEventListener("click", () => {
        startGame(btn.dataset.level);
    });
});

// START GAME
function startGame(level) {
    currentLevel = level; //  store current level
    resetGame();
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    totalCards = levelConfig[level];
    createBoard(totalCards);
    startTimer();
}

// RESET GAME
function resetGame() {
    score = 0;
    timer = 30;
    matchedCount = 0;
    selected = [];
    isPaused = false;

    scoreEl.textContent = score;
    timeEl.textContent = timer;
    matchesEl.textContent = matchedCount;

    board.innerHTML = "";
    message.classList.add("hidden");

    clearInterval(interval);
}

// CREATE BOARD
function createBoard(total) {
    const arr = [];

    // Proper PAIRS create karo
    for (let i = 1; i <= total / 2; i++) {
        arr.push(i, i);
    }

    const shuffled = shuffle(arr);

    //  FIXED GRID (no weird sqrt)
    let cols;
    if (total === 6) cols = 3;       // 3 x 2
    else if (total === 12) cols = 4; // 4 x 3
    else if (total === 16) cols = 4; // 4 x 4
    else cols = Math.round(Math.sqrt(total)); // fallback

    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.innerHTML = "";

    shuffled.forEach(value => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.value = value;

        // 3D flip structure
        card.innerHTML = `
           <div class="inner">
             <div class="front">?</div>
             <div class="back">${value}</div>
           </div>
        `;

        card.onclick = () => flipCard(card);
        board.appendChild(card);
    });
}

// FLIP CARD
function flipCard(card) {
    if (isPaused) return;
    if (timer <= 0) return; //  time over pe flip mat karo
    if (selected.length >= 2) return;
    if (card.classList.contains("flipped")) return;

    if (flipSound) {
        flipSound.currentTime = 0;
        flipSound.play();
    }

    card.classList.add("flipped");
    selected.push(card);

    if (selected.length === 2) {
        checkMatch();
    }
}

// CHECK MATCH
function checkMatch() {
    const [c1, c2] = selected;

    if (c1.dataset.value === c2.dataset.value) {
        if (matchSound) {
            matchSound.currentTime = 0;
            matchSound.play();
        }

        score += 10;
        matchedCount += 2;

        scoreEl.textContent = score;
        matchesEl.textContent = matchedCount;

        selected = [];

        // All cards matched
        if (matchedCount === totalCards) {
            if (winSound) {
                winSound.currentTime = 0;
                winSound.play();
            }

            message.textContent = "🎉 Level Complete!";
            message.classList.remove("hidden");
            clearInterval(interval);
        }
    } else {
        if (wrongSound) {
            wrongSound.currentTime = 0;
            wrongSound.play();
        }

        setTimeout(() => {
            c1.classList.remove("flipped");
            c2.classList.remove("flipped");
            selected = [];
        }, 700);
    }
}

// TIMER
function startTimer() {
    clearInterval(interval);

    interval = setInterval(() => {
        if (isPaused) return;

        timer--;
        timeEl.textContent = timer;

        if (timer <= 0) {
            clearInterval(interval);
            message.textContent = "⏳ Time Over!";
            message.classList.remove("hidden");
        }
    }, 1000);
}

// SHUFFLE
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// CONTROLS
pauseBtn.onclick = () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
};

restartBtn.onclick = () => {
    startGame(currentLevel); //  same level se restart
};

backBtn.onclick = () => {
    clearInterval(interval);         //  timer stop
    gameScreen.classList.add("hidden");
    levelScreen.classList.remove("hidden");
};
