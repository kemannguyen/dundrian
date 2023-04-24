function getKeyString(x, y) {}

const MAX_PLAYERS = 8;
const arrowXOffset = 480;
const arrowYOffset = -440;
let numberOfPlayers = 0;

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
    { x: 15, y: 9.75 },
    { x: 5, y: 6 },
    { x: 5, y: 8.5 },
    { x: 5, y: 11 },
    { x: 5, y: 13.5 },
    { x: 25, y: 6 },
    { x: 25, y: 8.5 },
    { x: 25, y: 11 },
    { x: 25, y: 13.5 },
  ];
  return slots[i];
}

(function () {
  let playerId;
  let playerRef;
  //character info for dom
  let players = {};

  //Button ref
  //const playerColorButton = document.querySelector("#player-color");
  const playerNameButton = document.querySelector("#player-name-btn");

  //dom elements
  let playerElements = {};
  let selectionArrow = document.getElementById("select-arrow");
  let selectionIndex = 0;

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  let oldSelectIndex;
  function handleArrowPress(xChange = 0, yChange = 0) {
    oldSelectIndex = selectionIndex;
    console.log(oldSelectIndex);
    if (yChange == -1) {
      selectionIndex -= 1;

      //skips dragon (index 0)
      if (selectionIndex == 0 && oldSelectIndex == 1) {
        console.log("w");
        selectionIndex -= 1;
      }
      //   if(selectionIndex == -1){
      //     selectionIndex
      //   }
    }
    if (yChange == 1) {
      selectionIndex += 1;

      //skips dragon (index 0)
      if (selectionIndex > numberOfPlayers) {
        selectionIndex = selectionIndex % (numberOfPlayers + 1);
      }
      if (selectionIndex == 0 && oldSelectIndex == numberOfPlayers) {
        console.log("Q");
        selectionIndex += 1;
      }
    }
    if (xChange == -1) {
      if (selectionIndex >= 1 && selectionIndex < 4) {
        selectionIndex = oldSelectIndex;
      } else if (selectionIndex == 0) {
        selectionIndex = 1;
      } else {
        selectionIndex = 0;
      }
    }
    if (xChange == 1) {
      if (selectionIndex >= 1 && selectionIndex < 4) {
        selectionIndex = 0;
      } else if (selectionIndex == 0) {
        if (numberOfPlayers > 4) {
          selectionIndex = 5;
        }
      }
    }

    selectionIndex = selectionIndex % (numberOfPlayers + 1);
    if (selectionIndex == -0) {
      //selectionIndex = 0;
    }
    if (selectionIndex < 0) {
      selectionIndex = numberOfPlayers;
    }
    console.log("index", selectionIndex);

    //move to the next space

    const xPos = setPosition(selectionIndex).x;
    const yPos = setPosition(selectionIndex).y;

    //players[playerId].hp = selectionIndex;

    selectionArrow.style.left = 48 * xPos - arrowXOffset + "px";
    selectionArrow.style.top = 48 * yPos + arrowYOffset + "px";
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

    allPlayersRef.on("child_added", (snapshot) => {
      //runs when a new node is added to the tree in the DATABASE
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

    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
      numberOfPlayers--;

      //updates existing players
    });

    //Updates player name with text input
    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      playerNameInput.value = newName;
      playerRef.update({
        name: newName,
      });
    });

    //changes color att button click
    // playerNameButton.addEventListener("click", () => {
    //   const mySkinIndex = playerColors.indexOf(players[playerId].color);
    //   const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
    //   playerRef.update({
    //     color: nextColor,
    //   });
    // });
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log();
    if (user.uid) {
      //logged in
      playerId = user.uid;

      //find how many players there are in game
      var pos = { x: 0, y: 0 };
      playerRef = firebase.database().ref(`players/${playerId}`);

      var ref = firebase.database().ref(`players`);
      var ref2 = firebase.database().ref(`players`);

      //find lowest open index
      let creationIndex = 0;

      var query = firebase.database().ref(`players/`).orderByKey();
      query.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key;
          var childIndex = childSnapshot.child("index").val();
          if (childIndex == creationIndex) {
            creationIndex++;
          }
        });
        console.log("createIndex", creationIndex);
      });

      ref.once("value").then(function (snapshot) {
        numberOfPlayers = snapshot.numChildren();
        if (numberOfPlayers < MAX_PLAYERS) {
          ref2
            .once("value")
            .then(function (snapshot) {
              numberOfPlayers = snapshot.numChildren();
              console.log(setPosition(creationIndex), numberOfPlayers);

              pos = setPosition(creationIndex + 1);
              selectionIndex = creationIndex;
              selectionArrow.style.left = 48 * pos.x - arrowXOffset + "px";
              selectionArrow.style.top = 48 * pos.y + arrowYOffset + "px";
            })
            .then(() => {
              //visuals
              playerRef.set({
                id: playerId,
                name: "player " + (creationIndex + 1),
                hp: 20,
                diraction: "right",
                color: playerColors[creationIndex],
                x: pos.x,
                y: pos.y,
                index: creationIndex,
              });
            });

          //leaves the game
          playerRef.onDisconnect().remove();

          initGame();
        } else {
          //when game is full
          const characterElement = document.createElement("div");
          characterElement.innerHTML = `
        <div class="game-full-text">
          <span class="Character_name">GAME IS FULL</span>
        </div>
      `;
          gameContainer.appendChild(characterElement);
          selectionArrow.style.opacity = 0;
        }
      });
    } else {
      //logged out
      console.log(numberOfPlayers);
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
