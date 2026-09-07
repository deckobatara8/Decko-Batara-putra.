/* =====================================================
   GOOGLE APPS SCRIPT URL

   Setelah membuat Google Apps Script,
   masukkan URL Web App di bawah ini.
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbxM4khBKvnfcBL5OnAkF1Rf9jmZwGmIEtAcOCNtI0FEPMKreTY82_PPOvW4_d6SFXyx/exec";


/* =====================================================
   ELEMENT
===================================================== */

const menuScreen =
    document.getElementById("menuScreen");

const gameScreen =
    document.getElementById("gameScreen");

const finishScreen =
    document.getElementById("finishScreen");

const usernameInput =
    document.getElementById("username");

const phoneInput =
    document.getElementById("phone");

const startBtn =
    document.getElementById("startBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const leaderboardList =
    document.getElementById("leaderboardList");

const canvas =
    document.getElementById("mazeCanvas");

const ctx =
    canvas.getContext("2d");

const playerName =
    document.getElementById("playerName");

const timerElement =
    document.getElementById("timer");

const movesElement =
    document.getElementById("moves");

const finalTime =
    document.getElementById("finalTime");

const finalMoves =
    document.getElementById("finalMoves");

const finalScore =
    document.getElementById("finalScore");

const finishPlayer =
    document.getElementById("finishPlayer");

const saveStatus =
    document.getElementById("saveStatus");


/* =====================================================
   GAME DATA
===================================================== */

let username = "";
let phone = "";

let maze = [];
let player = {
    x: 0,
    y: 0
};

let exit = {
    x: 0,
    y: 0
};

let moves = 0;

let startTime = 0;
let timerInterval = null;

let gameRunning = false;


/*
   Ukuran labirin.
   21 x 21 cukup sulit tetapi masih nyaman
   untuk layar HP.
*/

const SIZE = 21;


/* =====================================================
   SCREEN
===================================================== */

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(el => {
            el.classList.remove("active");
        });

    screen.classList.add("active");
}


/* =====================================================
   START GAME
===================================================== */

startBtn.addEventListener("click", () => {

    username =
        usernameInput.value.trim();

    phone =
        phoneInput.value.trim();


    if (username.length < 3) {

        alert("Username minimal 3 karakter.");

        usernameInput.focus();

        return;
    }


    if (!/^[0-9+ ]{10,15}$/.test(phone)) {

        alert("Masukkan nomor WhatsApp yang valid.");

        phoneInput.focus();

        return;
    }


    playerName.textContent =
        username.toUpperCase();


    startGame();
});


/* =====================================================
   START
===================================================== */

function startGame() {

    showScreen(gameScreen);

    moves = 0;

    movesElement.textContent = "0";

    timerElement.textContent = "00:00";

    generateMaze();

    resizeCanvas();

    drawMaze();

    startTimer();

    gameRunning = true;
}


/* =====================================================
   MAZE GENERATOR
   Recursive Backtracking
===================================================== */

function generateMaze() {

    maze = [];

    for (let y = 0; y < SIZE; y++) {

        maze[y] = [];

        for (let x = 0; x < SIZE; x++) {

            maze[y][x] = 1;

        }
    }


    /*
       Mulai dari (1,1)
    */

    const stack = [];

    maze[1][1] = 0;

    stack.push({
        x: 1,
        y: 1
    });


    const directions = [
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 0 }
    ];


    while (stack.length > 0) {

        const current =
            stack[stack.length - 1];

        let neighbors = [];


        directions.forEach(dir => {

            const nx =
                current.x + dir.x;

            const ny =
                current.y + dir.y;


            if (
                nx > 0 &&
                nx < SIZE - 1 &&
                ny > 0 &&
                ny < SIZE - 1 &&
                maze[ny][nx] === 1
            ) {

                neighbors.push({
                    x: nx,
                    y: ny,
                    wallX:
                        current.x + dir.x / 2,
                    wallY:
                        current.y + dir.y / 2
                });

            }

        });


        if (neighbors.length > 0) {

            const next =
                neighbors[
                    Math.floor(
                        Math.random() *
                        neighbors.length
                    )
                ];


            maze[next.y][next.x] = 0;

            maze[next.wallY][next.wallX] = 0;

            stack.push({
                x: next.x,
                y: next.y
            });

        } else {

            stack.pop();

        }

    }


    player = {
        x: 1,
        y: 1
    };


    exit = {
        x: SIZE - 2,
        y: SIZE - 2
    };


    maze[exit.y][exit.x] = 0;


    /*
       Pastikan jalan keluar terbuka.
    */

    maze[SIZE - 2][SIZE - 3] = 0;
}


/* =====================================================
   CANVAS
===================================================== */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const size =
        Math.min(
            rect.width,
            rect.height
        );


    canvas.width = size * devicePixelRatio;

    canvas.height = size * devicePixelRatio;

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );
}


/* =====================================================
   DRAW MAZE
===================================================== */

function drawMaze() {

    const size =
        canvas.getBoundingClientRect().width;

    const cell =
        size / SIZE;


    ctx.clearRect(
        0,
        0,
        size,
        size
    );


    /*
       Background
    */

    ctx.fillStyle =
        "#020617";

    ctx.fillRect(
        0,
        0,
        size,
        size
    );


    /*
       Dinding
    */

    for (let y = 0; y < SIZE; y++) {

        for (let x = 0; x < SIZE; x++) {

            if (maze[y][x] === 1) {

                ctx.fillStyle =
                    "#1e3a8a";

                ctx.fillRect(
                    x * cell,
                    y * cell,
                    cell + 1,
                    cell + 1
                );

            }

        }

    }


    /*
       Exit
    */

    ctx.fillStyle =
        "#22c55e";

    ctx.beginPath();

    ctx.arc(
        exit.x * cell + cell / 2,
        exit.y * cell + cell / 2,
        cell * .3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Player
    */

    ctx.fillStyle =
        "#38bdf8";

    ctx.beginPath();

    ctx.arc(
        player.x * cell + cell / 2,
        player.y * cell + cell / 2,
        cell * .32,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Player highlight
    */

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        player.x * cell + cell * .4,
        player.y * cell + cell * .4,
        cell * .08,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =====================================================
   MOVE PLAYER
===================================================== */

function movePlayer(dx, dy) {

    if (!gameRunning) return;


    const nx =
        player.x + dx;

    const ny =
        player.y + dy;


    /*
       Tidak boleh menembus dinding.
    */

    if (
        nx < 0 ||
        nx >= SIZE ||
        ny < 0 ||
        ny >= SIZE
    ) return;


    if (maze[ny][nx] === 1) {

        /*
           Efek getar ringan jika tersedia.
        */

        if (navigator.vibrate) {
            navigator.vibrate(15);
        }

        return;
    }


    player.x = nx;

    player.y = ny;

    moves++;

    movesElement.textContent =
        moves;


    drawMaze();


    /*
       Check finish
    */

    if (
        player.x === exit.x &&
        player.y === exit.y
    ) {

        finishGame();

    }
}


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (!gameRunning) return;


        switch (event.key) {

            case "ArrowUp":
            case "w":
            case "W":

                movePlayer(0, -1);

                break;


            case "ArrowDown":
            case "s":
            case "S":

                movePlayer(0, 1);

                break;


            case "ArrowLeft":
            case "a":
            case "A":

                movePlayer(-1, 0);

                break;


            case "ArrowRight":
            case "d":
            case "D":

                movePlayer(1, 0);

                break;

        }

    }
);


/* =====================================================
   MOBILE CONTROL
===================================================== */

document.querySelectorAll(
    ".control[data-direction]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const direction =
                button.dataset.direction;


            if (direction === "up")
                movePlayer(0, -1);

            if (direction === "down")
                movePlayer(0, 1);

            if (direction === "left")
                movePlayer(-1, 0);

            if (direction === "right")
                movePlayer(1, 0);

        }
    );

});


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    clearInterval(timerInterval);

    startTime = Date.now();


    timerInterval =
        setInterval(() => {

            const elapsed =
                Math.floor(
                    (Date.now() - startTime)
                    / 1000
                );


            timerElement.textContent =
                formatTime(elapsed);

        }, 1000);
}


function stopTimer() {

    clearInterval(timerInterval);

    const elapsed =
        Math.floor(
            (Date.now() - startTime)
            / 1000
        );

    return elapsed;
}


function formatTime(seconds) {

    const min =
        Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");

    const sec =
        (seconds % 60)
            .toString()
            .padStart(2, "0");


    return `${min}:${sec}`;
}


/* =====================================================
   FINISH GAME
===================================================== */

async function finishGame() {

    gameRunning = false;

    const time =
        stopTimer();


    /*
       Rumus skor.

       Skor dasar 1000.
       Semakin cepat = semakin besar.
       Semakin sedikit langkah = semakin besar.
    */

    let score =
        1000
        - (time * 3)
        - (moves * 2);


    if (score < 10) {
        score = 10;
    }


    finalTime.textContent =
        formatTime(time);

    finalMoves.textContent =
        moves;

    finalScore.textContent =
        score;

    finishPlayer.textContent =
        username;


    showScreen(finishScreen);


    await saveScore(
        username,
        phone,
        score,
        time,
        moves
    );


    loadLeaderboard();
}


/* =====================================================
   SAVE SCORE
===================================================== */

async function saveScore(
    username,
    phone,
    score,
    time,
    moves
) {

    saveStatus.textContent =
        "💾 Menyimpan skor...";


    /*
       Jika API belum dipasang,
       jangan membuat game error.
    */

    if (
        !API_URL ||
        API_URL.includes("MASUKKAN_URL")
    ) {

        saveStatus.textContent =
            "⚠️ API Google Sheets belum dipasang.";

        return;
    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "saveScore",

                    username: username,

                    phone: phone,

                    score: score,

                    time: time,

                    moves: moves

                })

            });


        const result =
            await response.json();


        if (result.success) {

            saveStatus.textContent =
                "✅ Skor berhasil disimpan!";

        } else {

            saveStatus.textContent =
                "❌ Gagal menyimpan skor.";

        }

    } catch (error) {

        console.error(error);

        saveStatus.textContent =
            "❌ Tidak dapat terhubung ke database.";

    }
}


/* =====================================================
   LOAD LEADERBOARD
===================================================== */

async function loadLeaderboard() {

    leaderboardList.innerHTML =
        `<p class="loading">
            Memuat leaderboard...
        </p>`;


    if (
        !API_URL ||
        API_URL.includes("MASUKKAN_URL")
    ) {

        leaderboardList.innerHTML =
            `<p class="loading">
                Hubungkan Google Sheets terlebih dahulu.
            </p>`;

        return;
    }


    try {

        const response =
            await fetch(
                API_URL + "?action=getLeaderboard"
            );


        const data =
            await response.json();


        if (
            !data.success ||
            !Array.isArray(data.data)
        ) {

            throw new Error(
                "Data leaderboard tidak valid."
            );

        }


        leaderboardList.innerHTML = "";


        if (data.data.length === 0) {

            leaderboardList.innerHTML =
                `<p class="loading">
                    Belum ada pemain.
                </p>`;

            return;
        }


        data.data
            .slice(0, 10)
            .forEach((player, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "rank-item";


                item.innerHTML = `

                    <div class="rank-number">
                        #${index + 1}
                    </div>

                    <div class="rank-name">
                        ${escapeHTML(player.username)}
                    </div>

                    <div class="rank-score">
                        ${player.score}
                    </div>

                `;


                leaderboardList.appendChild(item);

            });


    } catch (error) {

        console.error(error);

        leaderboardList.innerHTML =
            `<p class="loading">
                ❌ Gagal memuat leaderboard.
            </p>`;
    }
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   REFRESH
===================================================== */

refreshBtn.addEventListener(
    "click",
    loadLeaderboard
);


/* =====================================================
   PLAY AGAIN
===================================================== */

document.getElementById(
    "playAgainBtn"
).addEventListener(
    "click",
    () => {

        startGame();

    }
);


/* =====================================================
   HOME
===================================================== */

document.getElementById(
    "homeBtn"
).addEventListener(
    "click",
    () => {

        showScreen(menuScreen);

        loadLeaderboard();

    }
);


/* =====================================================
   BACK
===================================================== */

document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Keluar dari permainan?"
            )
        ) {

            gameRunning = false;

            stopTimer();

            showScreen(menuScreen);

        }

    }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        if (gameRunning) {

            resizeCanvas();

            drawMaze();

        }

    }
);


/* =====================================================
   INITIAL LOAD
===================================================== */

loadLeaderboard();
