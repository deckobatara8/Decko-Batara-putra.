/* =====================================================
   GOOGLE APPS SCRIPT URL
   GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU
===================================================== */

const API_URL =
    "MASUKKAN_URL_GOOGLE_APPS_SCRIPT_DI_SINI";


/* =====================================================
   ELEMENT
===================================================== */

const menuScreen =
    document.getElementById("menuScreen");

const gameScreen =
    document.getElementById("gameScreen");

const finishScreen =
    document.getElementById("finishScreen");

const leaderboardScreen =
    document.getElementById("leaderboardScreen");

const usernameInput =
    document.getElementById("username");

const whatsappInput =
    document.getElementById("whatsapp");

const startBtn =
    document.getElementById("startBtn");

const leaderboardBtn =
    document.getElementById("leaderboardBtn");

const backBtn =
    document.getElementById("backBtn");

const againBtn =
    document.getElementById("againBtn");

const finishLeaderboardBtn =
    document.getElementById("finishLeaderboardBtn");

const leaderboardBackBtn =
    document.getElementById("leaderboardBackBtn");

const refreshLeaderboard =
    document.getElementById("refreshLeaderboard");

const canvas =
    document.getElementById("mazeCanvas");

const ctx =
    canvas.getContext("2d");


/* =====================================================
   GAME VARIABLE
===================================================== */

let username = "";
let whatsapp = "";

let maze = [];
let player = {
    x: 0,
    y: 0
};

let finish = {
    x: 0,
    y: 0
};

let coins = [];

let steps = 0;
let coinCount = 0;

let level = 1;

let startTime = 0;
let timerInterval = null;

let gameRunning = false;


/* =====================================================
   MAZE SETTING
===================================================== */

const SIZE = 17;

let cellSize;


/* =====================================================
   SCREEN
===================================================== */

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    screen.classList.add("active");
}


/* =====================================================
   START GAME
===================================================== */

startBtn.addEventListener("click", function () {
    const name = usernameInput.value.trim();
    const wa = whatsappInput.value.trim();

    if (name === "") {
        alert("Masukkan username terlebih dahulu!");
        usernameInput.focus();
        return;
    }

    if (name.length < 3) {
        alert("Username minimal 3 karakter!");
        usernameInput.focus();
        return;
    }

    if (wa === "") {
        alert("Masukkan nomor WhatsApp terlebih dahulu!");
        whatsappInput.focus();
        return;
    }

    if (!/^[0-9]+$/.test(wa)) {
        alert("Nomor WhatsApp hanya boleh berisi angka!");
        whatsappInput.focus();
        return;
    }

    if (wa.length < 10) {
        alert("Nomor WhatsApp minimal 10 angka!");
        whatsappInput.focus();
        return;
    }

    username = name;
    whatsapp = wa;

    document.getElementById("playerName").textContent = username;

    showScreen(gameScreen);

    startGame();
});


/* =====================================================
   TIMER
===================================================== */

function updateTimer() {

    if (!gameRunning) return;

    const elapsed =
        Math.floor(
            (Date.now() - startTime) / 1000
        );

    document.getElementById(
        "timer"
    ).textContent = formatTime(elapsed);
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
   GENERATE MAZE
   Recursive Backtracker
===================================================== */

function generateMaze() {

    maze = [];

    for (let y = 0; y < SIZE; y++) {

        maze[y] = [];

        for (let x = 0; x < SIZE; x++) {

            maze[y][x] = {
                visited: false,
                walls: {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                }
            };

        }
    }

    const stack = [];

    let current = {
        x: 0,
        y: 0
    };

    maze[0][0].visited = true;

    stack.push(current);

    while (stack.length > 0) {

        const neighbors =
            getUnvisitedNeighbors(
                current.x,
                current.y
            );

        if (neighbors.length > 0) {

            const next =
                neighbors[
                    Math.floor(
                        Math.random() *
                        neighbors.length
                    )
                ];

            removeWall(
                current,
                next
            );

            next.visited = true;

            stack.push(current);

            current = next;

        } else {

            current =
                stack.pop();

        }
    }

    player = {
        x: 0,
        y: 0
    };

    finish = {
        x: SIZE - 1,
        y: SIZE - 1
    };

    generateCoins();
}


/* =====================================================
   NEIGHBORS
===================================================== */

function getUnvisitedNeighbors(x, y) {

    const result = [];

    if (
        y > 0 &&
        !maze[y - 1][x].visited
    ) {
        result.push({
            x: x,
            y: y - 1
        });
    }

    if (
        x < SIZE - 1 &&
        !maze[y][x + 1].visited
    ) {
        result.push({
            x: x + 1,
            y: y
        });
    }

    if (
        y < SIZE - 1 &&
        !maze[y + 1][x].visited
    ) {
        result.push({
            x: x,
            y: y + 1
        });
    }

    if (
        x > 0 &&
        !maze[y][x - 1].visited
    ) {
        result.push({
            x: x - 1,
            y: y
        });
    }

    return result;
}


/* =====================================================
   REMOVE WALL
===================================================== */

function removeWall(current, next) {

    const dx =
        next.x - current.x;

    const dy =
        next.y - current.y;

    if (dx === 1) {

        maze[current.y][current.x]
            .walls.right = false;

        maze[next.y][next.x]
            .walls.left = false;
    }

    if (dx === -1) {

        maze[current.y][current.x]
            .walls.left = false;

        maze[next.y][next.x]
            .walls.right = false;
    }

    if (dy === 1) {

        maze[current.y][current.x]
            .walls.bottom = false;

        maze[next.y][next.x]
            .walls.top = false;
    }

    if (dy === -1) {

        maze[current.y][current.x]
            .walls.top = false;

        maze[next.y][next.x]
            .walls.bottom = false;
    }
}


/* =====================================================
   COINS
===================================================== */

function generateCoins() {

    coins = [];

    const amount = 8;

    while (coins.length < amount) {

        const x =
            Math.floor(
                Math.random() * SIZE
            );

        const y =
            Math.floor(
                Math.random() * SIZE
            );

        if (
            (x === 0 && y === 0) ||
            (x === SIZE - 1 &&
             y === SIZE - 1)
        ) {
            continue;
        }

        const exists =
            coins.some(
                coin =>
                    coin.x === x &&
                    coin.y === y
            );

        if (!exists) {

            coins.push({
                x,
                y
            });

        }
    }
}


/* =====================================================
   DRAW MAZE
===================================================== */

function resizeCanvas() {

    const rect =
        document
            .getElementById("mazeContainer")
            .getBoundingClientRect();

    const size =
        Math.floor(rect.width);

    canvas.width = size;
    canvas.height = size;

    cellSize =
        size / SIZE;
}


function drawMaze() {

    if (!maze.length) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* background */

    ctx.fillStyle = "#080d1d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* cells */

    for (let y = 0; y < SIZE; y++) {

        for (let x = 0; x < SIZE; x++) {

            const cell =
                maze[y][x];

            const px =
                x * cellSize;

            const py =
                y * cellSize;


            /* visited background */

            ctx.fillStyle =
                "#0c1429";

            ctx.fillRect(
                px + 2,
                py + 2,
                cellSize - 4,
                cellSize - 4
            );


            /* walls */

            ctx.strokeStyle =
                "#30466f";

            ctx.lineWidth = 2;

            ctx.beginPath();

            if (cell.walls.top) {

                ctx.moveTo(px, py);
                ctx.lineTo(
                    px + cellSize,
                    py
                );
            }

            if (cell.walls.right) {

                ctx.moveTo(
                    px + cellSize,
                    py
                );

                ctx.lineTo(
                    px + cellSize,
                    py + cellSize
                );
            }

            if (cell.walls.bottom) {

                ctx.moveTo(
                    px + cellSize,
                    py + cellSize
                );

                ctx.lineTo(
                    px,
                    py + cellSize
                );
            }

            if (cell.walls.left) {

                ctx.moveTo(px, py);
                ctx.lineTo(
                    px,
                    py + cellSize
                );
            }

            ctx.stroke();
        }
    }


    /* finish */

    drawFinish();


    /* coins */

    coins.forEach(drawCoin);


    /* player */

    drawPlayer();
}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    const cx =
        player.x * cellSize +
        cellSize / 2;

    const cy =
        player.y * cellSize +
        cellSize / 2;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        cellSize * .28,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#00eaff";

    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        cellSize * .1,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "white";

    ctx.fill();
}


/* =====================================================
   DRAW FINISH
===================================================== */

function drawFinish() {

    const cx =
        finish.x * cellSize +
        cellSize / 2;

    const cy =
        finish.y * cellSize +
        cellSize / 2;

    ctx.font =
        `${cellSize * .55}px Arial`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "🏁",
        cx,
        cy
    );
}


/* =====================================================
   DRAW COIN
===================================================== */

function drawCoin(coin) {

    const cx =
        coin.x * cellSize +
        cellSize / 2;

    const cy =
        coin.y * cellSize +
        cellSize / 2;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        cellSize * .17,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffd43b";

    ctx.shadowColor = "#ffd43b";
    ctx.shadowBlur = 10;

    ctx.fill();

    ctx.shadowBlur = 0;
}


/* =====================================================
   MOVEMENT
===================================================== */

function movePlayer(direction) {

    if (!gameRunning) return;

    const cell =
        maze[player.y][player.x];

    let nx = player.x;
    let ny = player.y;

    if (
        direction === "up" &&
        !cell.walls.top
    ) {
        ny--;
    }

    if (
        direction === "right" &&
        !cell.walls.right
    ) {
        nx++;
    }

    if (
        direction === "down" &&
        !cell.walls.bottom
    ) {
        ny++;
    }

    if (
        direction === "left" &&
        !cell.walls.left
    ) {
        nx--;
    }

    if (
        nx !== player.x ||
        ny !== player.y
    ) {

        player.x = nx;
        player.y = ny;

        steps++;

        document.getElementById(
            "steps"
        ).textContent = steps;

        checkCoin();

        drawMaze();

        checkFinish();
    }
}


/* =====================================================
   COIN CHECK
===================================================== */

function checkCoin() {

    const index =
        coins.findIndex(
            coin =>
                coin.x === player.x &&
                coin.y === player.y
        );

    if (index !== -1) {

        coins.splice(index, 1);

        coinCount++;

        document.getElementById(
            "coinCount"
        ).textContent = coinCount;
    }
}


/* =====================================================
   FINISH CHECK
===================================================== */

function checkFinish() {

    if (
        player.x === finish.x &&
        player.y === finish.y
    ) {

        finishGame();
    }
}


/* =====================================================
   FINISH GAME
===================================================== */

function finishGame() {

    gameRunning = false;

    clearInterval(timerInterval);

    const elapsed =
        Math.floor(
            (Date.now() - startTime) / 1000
        );

    document.getElementById(
        "resultName"
    ).textContent = username;

    document.getElementById(
        "resultTime"
    ).textContent =
        formatTime(elapsed);

    document.getElementById(
        "resultSteps"
    ).textContent =
        steps;

    document.getElementById(
        "resultCoins"
    ).textContent =
        coinCount;

    showScreen(finishScreen);

    saveScore(
        username,
        whatsapp,
        elapsed,
        steps,
        coinCount
    );
}


/* =====================================================
   SAVE SCORE TO GOOGLE SHEETS
===================================================== */

async function saveScore(
    name,
    wa,
    time,
    step,
    coin
) {

    const status =
        document.getElementById(
            "saveStatus"
        );

    status.textContent =
        "⏳ Menyimpan skor...";

    if (
        API_URL.includes(
            "MASUKKAN_URL"
        )
    ) {

        status.textContent =
            "⚠️ URL Google Apps Script belum dipasang.";

        return;
    }

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    username: name,

                    whatsapp: wa,

                    time: time,

                    steps: step,

                    coins: coin

                })

            });

        const result =
            await response.json();

        if (result.success) {

            status.textContent =
                "✅ Skor berhasil disimpan!";

        } else {

            status.textContent =
                "❌ Gagal menyimpan skor.";

        }

    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ Tidak dapat terhubung ke database.";
    }
}


/* =====================================================
   LEADERBOARD
===================================================== */

leaderboardBtn.addEventListener(
    "click",
    () => {

        showScreen(
            leaderboardScreen
        );

        loadLeaderboard();
    }
);


finishLeaderboardBtn.addEventListener(
    "click",
    () => {

        showScreen(
            leaderboardScreen
        );

        loadLeaderboard();
    }
);


refreshLeaderboard.addEventListener(
    "click",
    loadLeaderboard
);


/* =====================================================
   LOAD LEADERBOARD
===================================================== */

async function loadLeaderboard() {

    const container =
        document.getElementById(
            "leaderboardList"
        );

    container.innerHTML =
        `<div class="loading">
            ⏳ Memuat leaderboard...
        </div>`;

    if (
        API_URL.includes(
            "MASUKKAN_URL"
        )
    ) {

        container.innerHTML =
            `<div class="loading">
                ⚠️ URL Google Apps Script belum dipasang.
            </div>`;

        return;
    }

    try {

        const response =
            await fetch(
                API_URL
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                "Gagal mengambil data"
            );
        }

        renderLeaderboard(
            data.players
        );

    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="loading">
                ❌ Gagal memuat leaderboard.
            </div>`;
    }
}


/* =====================================================
   RENDER LEADERBOARD
===================================================== */

function renderLeaderboard(players) {

    const container =
        document.getElementById(
            "leaderboardList"
        );

    if (!players.length) {

        container.innerHTML =
            `<div class="loading">
                Belum ada pemain.
            </div>`;

        return;
    }

    container.innerHTML = "";

    players
        .slice(0, 50)
        .forEach((player, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "rank-item";

            item.innerHTML = `

                <div class="rank">
                    #${index + 1}
                </div>

                <div class="rank-name">
                    ${escapeHTML(
                        player.username
                    )}
                </div>

                <div class="rank-time">
                    ${formatTime(
                        Number(player.time)
                    )}
                </div>

                <div class="rank-step">
                    ${player.steps} STEP
                </div>

            `;

            container.appendChild(item);
        });
}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   BUTTONS
===================================================== */

document.querySelectorAll(
    ".control-btn[data-direction]"
).forEach(button => {

    button.addEventListener(
        "pointerdown",
        event => {

   
