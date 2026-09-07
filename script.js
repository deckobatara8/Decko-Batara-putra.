/* =====================================================
   MAZE RUSH
   GAME + GOOGLE SHEETS DATABASE
===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT URL

   GANTI DENGAN URL WEB APP KAMU

   HARUS BERAKHIR:
   /exec
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzVDjDB34HSh4AQ6lgAB2qGD9flPPie6pP_F_9otQaTYFzY0dOU9WoIpOYQQ2qJXrXdKQ/exec";


/* =====================================================
   ELEMENT
===================================================== */

const menuScreen =
    document.getElementById(
        "menuScreen"
    );

const gameScreen =
    document.getElementById(
        "gameScreen"
    );

const finishScreen =
    document.getElementById(
        "finishScreen"
    );


const usernameInput =
    document.getElementById(
        "username"
    );

const phoneInput =
    document.getElementById(
        "phone"
    );


const startBtn =
    document.getElementById(
        "startBtn"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


const leaderboardList =
    document.getElementById(
        "leaderboardList"
    );


const canvas =
    document.getElementById(
        "mazeCanvas"
    );

const ctx =
    canvas.getContext(
        "2d"
    );


const playerName =
    document.getElementById(
        "playerName"
    );

const timerElement =
    document.getElementById(
        "timer"
    );

const movesElement =
    document.getElementById(
        "moves"
    );


const finalTime =
    document.getElementById(
        "finalTime"
    );

const finalMoves =
    document.getElementById(
        "finalMoves"
    );

const finalScore =
    document.getElementById(
        "finalScore"
    );

const finishPlayer =
    document.getElementById(
        "finishPlayer"
    );

const saveStatus =
    document.getElementById(
        "saveStatus"
    );


/* =====================================================
   PLAYER
===================================================== */

let username = "";

let phone = "";


/* =====================================================
   MAZE
===================================================== */

const SIZE = 21;

let maze = [];

let player = {
    x: 1,
    y: 1
};

let exit = {
    x: SIZE - 2,
    y: SIZE - 2
};


/* =====================================================
   GAME
===================================================== */

let moves = 0;

let startTime = 0;

let timerInterval = null;

let gameRunning = false;


/* =====================================================
   SCREEN
===================================================== */

function showScreen(
    screen
) {

    document
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            function(el) {

                el.classList.remove(
                    "active"
                );

            }
        );


    screen.classList.add(
        "active"
    );

}


/* =====================================================
   API CHECK
===================================================== */

function apiReady() {

    return (
        API_URL &&
        !API_URL.includes(
            "MASUKKAN_URL"
        )
    );

}


/* =====================================================
   START BUTTON
===================================================== */

startBtn.addEventListener(
    "click",
    function() {

        username =
            usernameInput
                .value
                .trim();


        phone =
            phoneInput
                .value
                .trim();


        /* -----------------------------------------
           VALIDASI USERNAME
        ----------------------------------------- */

        if (
            username.length < 3
        ) {

            alert(
                "Username minimal 3 karakter."
            );

            usernameInput.focus();

            return;

        }


        /* -----------------------------------------
           VALIDASI WHATSAPP
        ----------------------------------------- */

        const cleanPhone =
            phone.replace(
                /[\s-]/g,
                ""
            );


        if (
            !/^\+?\d{10,15}$/
                .test(cleanPhone)
        ) {

            alert(
                "Nomor WhatsApp tidak valid."
            );

            phoneInput.focus();

            return;

        }


        phone =
            cleanPhone;


        playerName.textContent =
            username.toUpperCase();


        startGame();

    }
);


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    showScreen(
        gameScreen
    );


    moves = 0;

    movesElement.textContent =
        "0";


    timerElement.textContent =
        "00:00";


    generateMaze();


    resizeCanvas();


    drawMaze();


    startTimer();


    gameRunning = true;

}


/* =====================================================
   GENERATE MAZE
===================================================== */

function generateMaze() {

    maze = [];


    /* -----------------------------------------
       Semua menjadi dinding
    ----------------------------------------- */

    for (
        let y = 0;
        y < SIZE;
        y++
    ) {

        maze[y] = [];


        for (
            let x = 0;
            x < SIZE;
            x++
        ) {

            maze[y][x] = 1;

        }

    }


    /* -----------------------------------------
       Recursive Backtracking
    ----------------------------------------- */

    const stack = [];


    maze[1][1] = 0;


    stack.push({
        x: 1,
        y: 1
    });


    const directions = [

        {
            x: 0,
            y: -2
        },

        {
            x: 2,
            y: 0
        },

        {
            x: 0,
            y: 2
        },

        {
            x: -2,
            y: 0
        }

    ];


    while (
        stack.length > 0
    ) {

        const current =
            stack[
                stack.length - 1
            ];


        let neighbors = [];


        directions.forEach(
            function(dir) {

                const nx =
                    current.x +
                    dir.x;

                const ny =
                    current.y +
                    dir.y;


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
                            current.x +
                            dir.x / 2,

                        wallY:
                            current.y +
                            dir.y / 2

                    });

                }

            }
        );


        if (
            neighbors.length > 0
        ) {

            const next =
                neighbors[
                    Math.floor(
                        Math.random() *
                        neighbors.length
                    )
                ];


            maze[next.y][next.x] =
                0;


            maze[next.wallY][
                next.wallX
            ] = 0;


            stack.push({

                x: next.x,

                y: next.y

            });


        } else {

            stack.pop();

        }

    }


    /* -----------------------------------------
       PLAYER
    ----------------------------------------- */

    player = {

        x: 1,

        y: 1

    };


    /* -----------------------------------------
       EXIT
    ----------------------------------------- */

    exit = {

        x: SIZE - 2,

        y: SIZE - 2

    };


    maze[
        exit.y
    ][
        exit.x
    ] = 0;


    /*
       Pastikan pintu keluar tersambung.
    */

    maze[
        SIZE - 2
    ][
        SIZE - 3
    ] = 0;

}


/* =====================================================
   RESIZE CANVAS
===================================================== */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    const size =
        Math.min(
            rect.width,
            rect.height
        );


    const ratio =
        window.devicePixelRatio ||
        1;


    canvas.width =
        size * ratio;


    canvas.height =
        size * ratio;


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}


/* =====================================================
   DRAW MAZE
===================================================== */

function drawMaze() {

    const rect =
        canvas.getBoundingClientRect();


    const size =
        Math.min(
            rect.width,
            rect.height
        );


    const cell =
        size / SIZE;


    ctx.clearRect(
        0,
        0,
        size,
        size
    );


    /* -----------------------------------------
       BACKGROUND
    ----------------------------------------- */

    ctx.fillStyle =
        "#020617";


    ctx.fillRect(
        0,
        0,
        size,
        size
    );


    /* -----------------------------------------
       WALL
    ----------------------------------------- */

    for (
        let y = 0;
        y < SIZE;
        y++
    ) {

        for (
            let x = 0;
            x < SIZE;
            x++
        ) {

            if (
                maze[y][x] === 1
            ) {

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


    /* -----------------------------------------
       EXIT
    ----------------------------------------- */

    ctx.fillStyle =
        "#22c55e";


    ctx.beginPath();


    ctx.arc(

        exit.x * cell +
            cell / 2,

        exit.y * cell +
            cell / 2,

        cell * .30,

        0,

        Math.PI * 2

    );


    ctx.fill();


    /* -----------------------------------------
       PLAYER
    ----------------------------------------- */

    ctx.fillStyle =
        "#38bdf8";


    ctx.beginPath();


    ctx.arc(

        player.x * cell +
            cell / 2,

        player.y * cell +
            cell / 2,

        cell * .32,

        0,

        Math.PI * 2

    );


    ctx.fill();


    /* -----------------------------------------
       PLAYER HIGHLIGHT
    ----------------------------------------- */

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.arc(

        player.x * cell +
            cell * .40,

        player.y * cell +
            cell * .40,

        cell * .08,

        0,

        Math.PI * 2

    );


    ctx.fill();

}


/* =====================================================
   MOVE
===================================================== */

function movePlayer(
    dx,
    dy
) {

    if (!gameRunning) {
        return;
    }


    const nx =
        player.x + dx;


    const ny =
        player.y + dy;


    /* -----------------------------------------
       BATAS
    ----------------------------------------- */

    if (

        nx < 0 ||

        nx >= SIZE ||

        ny < 0 ||

        ny >= SIZE

    ) {

        return;

    }


    /* -----------------------------------------
       DINDING
    ----------------------------------------- */

    if (
        maze[ny][nx] === 1
    ) {

        if (
            navigator.vibrate
        ) {

            navigator.vibrate(
                15
            );

        }

        return;

    }


    /* -----------------------------------------
       MOVE
    ----------------------------------------- */

    player.x = nx;

    player.y = ny;

    moves++;


    movesElement.textContent =
        moves;


    drawMaze();


    /* -----------------------------------------
       FINISH
    ----------------------------------------- */

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
    function(event) {

        if (!gameRunning) {
            return;
        }


        switch (
            event.key
        ) {

            case "ArrowUp":

            case "w":

            case "W":

                event.preventDefault();

                movePlayer(
                    0,
                    -1
                );

                break;


            case "ArrowDown":

            case "s":

            case "S":

                event.preventDefault();

                movePlayer(
                    0,
                    1
                );

                break;


            case "ArrowLeft":

            case "a":

            case "A":

                event.preventDefault();

                movePlayer(
                    -1,
                    0
                );

                break;


            case "ArrowRight":

            case "d":

            case "D":

                event.preventDefault();

                movePlayer(
                    1,
                    0
                );

                break;

        }

    }
);


/* =====================================================
   MOBILE CONTROL
===================================================== */

document
    .querySelectorAll(
        ".control[data-direction]"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const direction =
                        button.dataset
                            .direction;


                    if (
                        direction ===
                        "up"
                    ) {

                        movePlayer(
                            0,
                            -1
                        );

                    }


                    if (
                        direction ===
                        "down"
                    ) {

                        movePlayer(
                            0,
                            1
                        );

                    }


                    if (
                        direction ===
                        "left"
                    ) {

                        movePlayer(
                            -1,
                            0
                        );

                    }


                    if (
                        direction ===
                        "right"
                    ) {

                        movePlayer(
                            1,
                            0
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    clearInterval(
        timerInterval
    );


    startTime =
        Date.now();


    timerInterval =
        setInterval(
            function() {

                const elapsed =
                    Math.floor(

                        (
                            Date.now() -
                            startTime
                        ) / 1000

                    );


                timerElement.textContent =
                    formatTime(
                        elapsed
                    );

            },
            1000
        );

}


/* =====================================================
   STOP TIMER
===================================================== */

function stopTimer() {

    clearInterval(
        timerInterval
    );


    const elapsed =
        Math.floor(

            (
                Date.now() -
                startTime
            ) / 1000

        );


    return elapsed;

}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    const secs =
        (
            seconds % 60
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    return (
        minutes +
        ":" +
        secs
    );

}


/* =====================================================
   FINISH
===================================================== */

async function finishGame() {

    gameRunning = false;


    const time =
        stopTimer();


    /* -----------------------------------------
       SCORE
    ----------------------------------------- */

    let score =

        1000

        - (
            time * 3
        )

        - (
            moves * 2
        );


    if (
        score < 10
    ) {

        score = 10;

    }


    /* -----------------------------------------
       DISPLAY
    ----------------------------------------- */

    finalTime.textContent =
        formatTime(
            time
        );


    finalMoves.textContent =
        moves;


    finalScore.textContent =
        score;


    finishPlayer.textContent =
        username;


    showScreen(
        finishScreen
    );


    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    await saveScore(
        username,
        phone,
        score,
        time,
        moves
    );


    /* -----------------------------------------
       UPDATE LEADERBOARD
    ----------------------------------------- */

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


    if (!apiReady()) {

        saveStatus.textContent =
            "⚠️ API belum dipasang.";

        return;

    }


    try {

        const data = {

            action:
                "saveScore",

            username:
                username,

            phone:
                phone,

            score:
                score,

            time:
                time,

            moves:
                moves

        };


        /*
           text/plain digunakan agar
           browser tidak melakukan
           preflight CORS.
        */

        await fetch(
            API_URL,
            {

                method:
                    "POST",

                mode:
                    "no-cors",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(
                        data
                    )

            }
        );


        /*
           Mode no-cors membuat browser
           tidak bisa membaca response.

           Tetapi request tetap dikirim
           ke Google Apps Script.
        */

        saveStatus.textContent =
            "✅ Skor berhasil dikirim!";


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        saveStatus.textContent =
            "⚠️ Skor mungkin belum tersimpan.";

    }

}


/* =====================================================
   LEADERBOARD JSONP
==============================
