(function () {
    let playerId;
    let playerRef;

    let players = {}

    var lastRender = Date.now();

    var c = document.getElementById("canvas");
    // var plocha = document.getElementById("plocha");
    var ctx = c.getContext("2d");

    // c.width = plocha.offsetWidth;
    // c.height = plocha.offsetHeight;

    let speed = 300; // 20px za sekundu
    var right = false;
    var left = false;
    var up = false;
    var down = false;

    let mezera = 0;
    let zmena = false;

    function draw() {
        var pohyb = false;
        var progress = (Date.now() - lastRender) / 1000;
        // console.log("last: " + lastRender + " now " + Date.now());
        lastRender = Date.now();
        // console.log(progress);

        if (right) {
            players[playerId].x = (parseFloat(players[playerId].x) + (speed * progress));
            players[playerId].direction = "right";
            pohyb = true;
            zmena = true;
        }
        if (left) {
            players[playerId].x = (parseFloat(players[playerId].x) - (speed * progress));
            players[playerId].direction = "left";
            pohyb = true;
            zmena = true;
        }
        if (down) {
            players[playerId].y = (parseFloat(players[playerId].y) + (speed * progress));
            if (players[playerId].direction === "right") {
                players[playerId].direction = "rightdown";
            } else if (players[playerId].direction === "left") {
                players[playerId].direction = "leftdown";
            } else {
                players[playerId].direction = "down";
            }
            pohyb = true;
            zmena = true;
        }
        if (up) {
            players[playerId].y = (parseFloat(players[playerId].y) - (speed * progress));
            if (players[playerId].direction === "right") {
                players[playerId].direction = "rightup";
            } else if (players[playerId].direction === "left") {
                players[playerId].direction = "leftup";
            } else {
                players[playerId].direction = "up";
            }
            pohyb = true;
            zmena = true;
        }
        if (!pohyb) {
            players[playerId].direction = "idle";
        }
        // console.log("mezera = " + mezera);

        if (mezera > 0.033 && players[playerId].position !== "idle") {
            mezera = 0;
            playerRef.set(players[playerId]);
        } else {
            mezera += progress;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Object.keys(players).forEach((key) => {
            if (key != playerId) {
                if (players[key].direction === "right") {
                    players[key].x = (parseFloat(players[key].x) + (speed * progress));
                }
                if (players[key].direction === "left") {
                    players[key].x = (parseFloat(players[key].x) - (speed * progress));
                }
                if (players[key].direction === "down") {
                    players[key].y = (parseFloat(players[key].y) + (speed * progress));
                }
                if (players[key].direction === "up") {
                    players[key].y = (parseFloat(players[key].y) - (speed * progress));
                }
                if (players[key].direction === "rightdown") {
                    players[key].x = (parseFloat(players[key].x) + (speed * progress));
                    players[key].y = (parseFloat(players[key].y) + (speed * progress));
                }
                if (players[key].direction === "leftdown") {
                    players[key].x = (parseFloat(players[key].x) - (speed * progress));
                    players[key].y = (parseFloat(players[key].y) + (speed * progress));
                }
                if (players[key].direction === "rightup") {
                    players[key].x = (parseFloat(players[key].x) + (speed * progress));
                    players[key].y = (parseFloat(players[key].y) - (speed * progress));
                }
                if (players[key].direction === "leftup") {
                    players[key].x = (parseFloat(players[key].x) - (speed * progress));
                    players[key].y = (parseFloat(players[key].y) - (speed * progress));
                }
            }
            ctx.beginPath();
            ctx.rect(players[key].x, players[key].y, 50, 50);
            ctx.fillStyle = players[key].color;
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = "12px Comic Sans MS";
            ctx.fillText(players[key].name, players[key].x, players[key].y);
            // console.log(key);
        })
        window.requestAnimationFrame(draw);
    }

    function initGame() {

        window.onkeyup = function (e) {
            if (e.key === "ArrowRight") {
                right = false;
            }
            if (e.key === "ArrowLeft") {
                left = false;

            }
            if (e.key === "ArrowDown") {
                down = false;

            }
            if (e.key === "ArrowUp") {
                up = false;
            }
        }

        window.onkeydown = function (e) {
            if (e.key === "ArrowRight") {
                right = true;
            }
            if (e.key === "ArrowLeft") {
                left = true;

            }
            if (e.key === "ArrowDown") {
                down = true;

            }
            if (e.key === "ArrowUp") {
                up = true;
            }
            // playerRef.set(players[playerId]);
        }

        const allPlayersRef = firebase.database().ref(`players`);

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
        })

        firebase.database().ref(`players`).on("child_added", (snapshot) => {
            const addPlayer = snapshot.val();
            players[addPlayer.id] = addPlayer;
            console.log(addPlayer.id);
            console.log(playerId);
            if (addPlayer.id == playerId) {
                requestAnimationFrame(draw);
            }
        })

    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);

            playerRef.set({
                id: playerId,
                name: "name",
                direction: "right",
                color: "blue",
                x: "3",
                y: "3"
            });

            playerRef.onDisconnect().remove();
            initGame();
        } else {

        }
    });

    firebase.auth().signInAnonymously().catch((error) => {
        console.log(error);
    });
})();