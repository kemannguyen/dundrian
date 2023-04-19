function getKeyString(x, y) {}

const playerColors = [
  "blue",
  "red",
  "orange",
  "yellow",
  "green",
  "purple",
  "pink",
  "gray",
];

function createName() {
  return "Keman";
}

(function () {
  let playerId;
  let playerRef;
  //character info for dom
  let players = {};

  //dom elements
  let playerElements = {};

  const gameContainer = document.querySelector(".game-container");

  function handleArrowPress(xChange = 0, yChange = 0) {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;

    if (true) {
      //move to the next space
      players[playerId].x = newX;
      players[playerId].y = newY;
      if (xChange === 1) {
        players[playerId].direction = "right";
      }
      if (xChange === -1) {
        players[playerId].direction = "left";
      }
      playerRef.set(players[playerId]);
    }
  }

  function initGame() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    const allPlayersRef = firebase.database().ref("players");
    const allCoinsRef = firebase.database().ref("coins");

    allPlayersRef.on("value", (snapshot) => {
      //runs when a change occurs

      players = snapshot.val() || {};
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        // Now update the DOM
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_hp").innerText = characterState.coins;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      });
    });
    allPlayersRef.on("child_added", (snapshot) => {
      //runs when a new node is added to the tree
      const addedPlayer = snapshot.val();
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if (addedPlayer.id == playerId) {
        characterElement.classList.add("you");
      }

      characterElement.innerHTML = `
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell"></div>
        <div class="Character_name-container">
          <span class="Character_name"></span>
          <span class="Character_hp">0</span>
        </div>
        <div class="Character_you-arrow"></div>
      `;
      playerElements[addedPlayer.id] = characterElement;

      characterElement.querySelector(".Character_name").innerText =
        addedPlayer.name;
      characterElement.querySelector(".Character_hp").innerText =
        addedPlayer.coins;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      gameContainer.appendChild(characterElement);
    });
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      //logged in
      playerId = user.uid;
      playerRef = firebase.database().ref(`players/${playerId}`);

      const name = createName();

      playerRef.set({
        id: playerId,
        name,
        diraction: "right",
        color: "blue",
        x: 3,
        y: 3,
        coins: 0,
      });

      //leaves the game
      playerRef.onDisconnect().remove();

      initGame();
    } else {
      //logged out
    }
  });

  firebase
    .auth()
    .signInAnonymously()
    .catch((e) => {
      var errorCode = e.code;
      var errorMsg = e.message;

      console.log(errorCode, errorMsg);
    });
})();
