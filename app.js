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

function setPosition(i) {
  let slots = [
    { x: 2, y: 6 },
    { x: 16, y: 6 },
    { x: 2, y: 10 },
    { x: 16, y: 10 },
    { x: 2, y: 14 },
    { x: 16, y: 14 },
    { x: 2, y: 18 },
    { x: 16, y: 18 },
  ];
  return slots[i];
}

function createName() {
  return "Keman";
}

(function () {
  let playerId;
  let playerRef;
  let numberOfPlayers;
  //character info for dom
  let players = {};
  const playerColorButton = document.querySelector("#player-color");

  //dom elements
  let playerElements = {};
  let selectionArrow = document.getElementById("select-arrow");
  let selectionIndex = 0;

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");

  function handleArrowPress(xChange = 0, yChange = 0) {
    console.log(selectionArrow);
    if (yChange == -1) {
      selectionIndex -= 2;
    }
    if (yChange == 1) {
      selectionIndex += 2;
    }
    if (xChange == -1) {
      selectionIndex -= 1;
    }
    if (xChange == 1) {
      selectionIndex += 1;
    }

    selectionIndex = selectionIndex % numberOfPlayers;
    if (selectionIndex == -0) {
      selectionIndex = 0;
    }
    if (selectionIndex < 0) {
      selectionIndex *= -1;
    }
    console.log("index", selectionIndex);

    //move to the next space

    const xPos = setPosition(selectionIndex).x;
    const yPos = setPosition(selectionIndex).y;

    //players[playerId].hp = selectionIndex;

    selectionArrow.style.left = 48 * xPos - 180 + "px";
    selectionArrow.style.top = -30 * yPos + "px";
    console.log(xPos, yPos);
    playerRef.set(players[playerId]);
    console.log(selectionArrow);
  }

  function initGame() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    new KeyPressListener("KeyW", () => handleArrowPress(0, -1));
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1));
    new KeyPressListener("KeyD", () => handleArrowPress(-1, 0));
    new KeyPressListener("KeyA", () => handleArrowPress(1, 0));

    const allPlayersRef = firebase.database().ref("players");
    const allCoinsRef = firebase.database().ref("index");

    allPlayersRef.on("value", (snapshot) => {
      //runs when a change occurs

      players = snapshot.val() || {};
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        // Now update the DOM
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_hp").innerText = characterState.hp;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      });
    });
    Object.keys(players).forEach((key) => {});
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
        addedPlayer.hp;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      console.log(characterElement);
      gameContainer.appendChild(characterElement);
      numberOfPlayers++;
    });

    //Updates player name with text input
    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      playerNameInput.value = newName;
      playerRef.update({
        name: newName,
      });
    });

    playerColorButton.addEventListener("click", () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      playerRef.update({
        color: nextColor,
      });
    });
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log(user);
    if (user.uid) {
      //logged in
      playerId = user.uid;

      //find how many players there are in game
      var pos = { x: 0, y: 0 };
      playerRef = firebase.database().ref(`players/${playerId}`);
      var ref = firebase.database().ref(`players`);
      ref
        .once("value")
        .then(function (snapshot) {
          numberOfPlayers = snapshot.numChildren();
          console.log(setPosition(numberOfPlayers), numberOfPlayers);
          pos = setPosition(numberOfPlayers);
          selectionIndex = numberOfPlayers;
        })
        .then(() => {
          const name = createName();

          playerRef.set({
            id: playerId,
            name,
            hp: 20,
            diraction: "right",
            color: "blue",
            x: pos.x,
            y: pos.y,
            index: numberOfPlayers,
          });
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
