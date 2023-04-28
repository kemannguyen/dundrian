function getKeyString(x, y) {}

const MAX_PLAYERS = 8;
const arrowXOffset = 570;
const arrowYOffset = -490;
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
    { x: 15, y: 4.75 },
    { x: 7, y: 6 },
    { x: 5, y: 7.5 },
    { x: 5, y: 10.5 },
    { x: 7, y: 12 },
    { x: 23, y: 6 },
    { x: 25, y: 8.5 },
    { x: 25, y: 11 },
    { x: 23, y: 13.5 },
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
  let dragonClick;
  let playerClicks = [];
  const notification = document.querySelector("#notification");
  const notificationContent = document.querySelector("#notification-content");

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
      if (selectionIndex >= 1 && selectionIndex <= 4) {
        selectionIndex = oldSelectIndex;
      } else if (selectionIndex == 0) {
        selectionIndex = 1;
      } else {
        selectionIndex = 0;
      }
    }
    if (xChange == 1) {
      if (selectionIndex >= 1 && selectionIndex <= 4) {
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
    let test = false;
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    new KeyPressListener("KeyW", () => handleArrowPress(0, -1));
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1));
    new KeyPressListener("KeyD", () => handleArrowPress(-1, 0));
    new KeyPressListener("KeyA", () => handleArrowPress(1, 0));

    const dragonRef = firebase.database().ref("dundrian");
    const allPlayersRef = firebase.database().ref("players");
    const dragonElement = document.createElement("div");
    dragonElement.classList.add("Character", "grid-cell");
    //DRAGON

    dragonRef.on("value", (snapshot) => {
      dragon = snapshot.val();
      //like players
      // Object.keys(dragon).forEach((key) => {
      //   let el = dragonElements[0];
      //   console.log("drag EL", el);
      // });
      const characterState = dragon;
      let el = dragonElement;
      const left = characterState.x + 200 + "px";
      const top = characterState.y + 100 + "px";

      el.setAttribute("data-direction", characterState.direction);
      el.setAttribute("id", "dundrian");
      el.style.transform = `translate3d(${left}, ${top}, 0)`;

      //players[key]
      console.log("dragon = players[key]", dragon);
      //player el
      console.log("dragonEL = player EL", dragonElement);
      try {
        el.querySelector(".Character_hp").innerText = characterState.hp;
      } catch (e) {}
    });

    dragonElement.innerHTML = `
        <div  class="grid-cell-dragon"></div>
        <div class="Character_sprite grid-cell-dragon">
        <img  class="img_dragon" src="images/dundrian-dragon.gif"></div>
        <div class="Dragon_name-container">
          <span class="Character_name"></span>
          <span class="Character_hp">0</span>
        </div>
      `;

    dragonElement.querySelector(".Character_name").innerText = dragon.name;
    dragonElement.querySelector(".Character_hp").innerText = dragon.hp;
    dragonElement.setAttribute("data-direction", dragon.direction);

    gameContainer.appendChild(dragonElement);

    dragonClick = document.querySelector("#dundrian");
    allPlayersRef.on("value", (snapshot) => {
      //changes dragon hp based on players
      if (numberOfPlayers == 4) {
        dragonRef.child("/hp").set(40);
      } else if (numberOfPlayers == 5) {
        dragonRef.child("/hp").set(50);
      } else if (numberOfPlayers > 5) {
        dragonRef.child("/hp").set(75);
      } else {
        dragonRef.child("/hp").set(40);
      }

      //runs when a change occurs
      players = snapshot.val() || {};

      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        // Now update the DOM
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_hp").innerText = characterState.hp;
        el.setAttribute("data-color", characterState.color);

        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";

        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      });
    });

    allPlayersRef.on("child_added", (snapshot) => {
      //runs when a new node is added to the tree in the DATABASE
      const addedPlayer = snapshot.val();
      console.log("A_P = P_K", addedPlayer);
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if (addedPlayer.id == playerId) {
        characterElement.classList.add("you");
      }
      characterElement.innerHTML = `
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell">
        <img class="img_player" src="images/dundrian-normal-player.gif"></div>
        <div class="Character_name-container">
          <span class="Character_name"></span>
          <span class="Character_hp">0</span>
        </div>
        <div class="Character_you-arrow"></div>
      `;
      playerElements[addedPlayer.id] = characterElement;
      console.log("EL[A_P] = P_EL", playerElements[addedPlayer.id]);

      characterElement.querySelector(".Character_name").innerText =
        addedPlayer.name;
      characterElement.querySelector(".Character_hp").innerText =
        addedPlayer.hp;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("id", addedPlayer.id);

      //notify that player joined
      notificationContent.innerHTML = addedPlayer.name + " joined";
      notification.className = "notification-show";
      setTimeout(function () {
        notification.className = "notification-hide";
      }, 2000);

      gameContainer.appendChild(characterElement);
      let playerClick;
      //player click function
      setInterval(function () {
        playerClick = document.querySelector(`#${addedPlayer.id}`);
      }, 200);

      //selects the player and moves the arrow to the pressed one
      setTimeout(function () {
        if (playerClick != undefined) {
          playerClick.addEventListener("click", (e) => {
            console.log(e.currentTarget.style.transform);
            Object.keys(players).forEach((key) => {
              let el = playerElements[key];
              if (e.currentTarget.style.transform == el.style.transform) {
                const pos = setPosition(players[key].index + 1);
                selectionArrow.style.left = 48 * pos.x - arrowXOffset + "px";
                selectionArrow.style.top = 48 * pos.y + arrowYOffset + "px";
              }
            });
          });
        }
      }, 1000);

      //adds new player click if its doenst exist
      setInterval(function () {
        if (!playerClicks.includes(playerClick) && playerClick != null) {
          console.log("playerclick", playerClick);
          playerClicks.push(playerClick);
        }
      }, 2000);
      console.log(playerClicks.length);
      numberOfPlayers++;
    });

    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      console.log("snap", playerElements[removedKey]);
      var index = playerClicks.indexOf(playerElements[removedKey]);
      if (index > -1) {
        playerClicks.splice(index, 1);
      }
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
      console.log("PC_L", playerClicks.length);
      console.log("PC", playerClicks);
      numberOfPlayers--;

      //notify that player left
      notificationContent.innerHTML = snapshot.val().name + " left";

      notification.className = "notification-show";
      setTimeout(function () {
        notification.className = "notification-hide";
      }, 2000);
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
    dragonClick.addEventListener("click", (e) => {
      //DRAGON LOGIC

      //console.log(e.currentTarget);
      //var tempElement = e.currentTarget;

      const pos = setPosition(0);
      selectionArrow.style.left = 48 * pos.x - arrowXOffset + "px";
      selectionArrow.style.top = 48 * pos.y + arrowYOffset + "px";
    });
  }

  firebase.auth().onAuthStateChanged((user) => {
    console.log();
    if (user.uid) {
      //logged in
      playerId = user.uid;

      // //creates dundrian

      var dpos = setPosition(0);
      var rootRef = firebase.database().ref(`dundrian`);
      var dragon = {
        name: "dundrian",
        hp: 40,
        direction: "right",
        x: dpos.x,
        y: dpos.y,
      };
      rootRef.set(dragon);

      //find how many players there are in game
      var pos = { x: 0, y: 0 };
      playerRef = firebase.database().ref(`players/${playerId}`);

      var ref = firebase.database().ref(`players`);
      var ref2 = firebase.database().ref(`players`);

      //find lowest open index
      let smallestIndex = 1000;

      let creationIndexArr = [0, 1, 2, 3, 4, 5, 6, 7];
      let creationIndex;
      var query = firebase.database().ref(`players/`).orderByKey();
      query
        .once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childIndex = childSnapshot.child("index").val();

            creationIndexArr[childIndex] = 100;
          });
        })
        .then(function () {
          for (let i = 7; i >= 0; i--) {
            if (smallestIndex > creationIndexArr[i]) {
              smallestIndex = creationIndexArr[i];
            }
          }
          creationIndex = smallestIndex;
        });

      //creates new player in DB
      ref.once("value").then(function (snapshot) {
        numberOfPlayers = snapshot.numChildren();
        if (numberOfPlayers < MAX_PLAYERS) {
          ref2
            .once("value")
            .then(function (snapshot) {
              numberOfPlayers = snapshot.numChildren();

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
