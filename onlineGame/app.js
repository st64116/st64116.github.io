(function () {
    let playerId;
    let playerRef;

    let players = {}

    var lastRender = Date.now();

    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");

    function draw() {
        var progress = lastRender - Date.now();
        lastRender = Date.now();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Object.keys(players).forEach((key) => {
            ctx.beginPath();
            ctx.rect(players[key].x, players[key].y, 50, 50);
            ctx.fillStyle = players[key].color;
            ctx.fill();
            console.log(key);
        })
        window.requestAnimationFrame(draw);
    }

    function initGame() {

        window.onkeydown = function (e) {
            if (e.key === "ArrowRight") {
                players[playerId].x = (parseInt(players[playerId].x) + 5);
            }
            if (e.key === "ArrowLeft") {
                players[playerId].x = (parseInt(players[playerId].x) - 5);
                console.log(players[playerId].x);
            }
            if (e.key === "ArrowDown") {
                players[playerId].y = (parseInt(players[playerId].y) + 5);
                console.log(players[playerId].x);
            }
            if (e.key === "ArrowUp") {
                players[playerId].y = (parseInt(players[playerId].y) - 5);
                console.log(players[playerId].x);
            }
            playerRef.set(players[playerId]);
        }

        const allPlayersRef = firebase.database().ref(`players`);

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            console.log("valueeeee");
            console.log(players);
            draw();
        })

        firebase.database().ref(`players`).on("child_added", (snapshot) => {
            const addPlayer = snapshot.val();
            players[addPlayer.id] = addPlayer;
            console.log("child added");
            console.log(addPlayer);
        })
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);

            playerRef.set({
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