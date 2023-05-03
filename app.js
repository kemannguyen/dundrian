function getKeyString(x, y) {}

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 4;
const arrowXOffset = 570;
const arrowYOffset = -490;
let numberOfPlayers = 0;
let selectionIndex = 0;
let myPlayerIndex;
let myName = "";

//buttons
const startBtn = document.getElementById("start-btn");
const attackBtn = document.getElementById("attack-btn");
const healBtn = document.getElementById("heal-btn");
const bosshealBtn = document.getElementById("boss-heal-btn");
const parryBtn = document.getElementById("parry-btn");
const activateRoleBtn = document.getElementById("activate-role-btn");

//firebase references
let dragonRef2;

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
function setRole(i) {
  let roles = [
    "paladin",
    "paladin",
    "cultist",
    "ninja",
    "ninja",
    "paladin",
    "cultist",
    "cultist",
  ];
  return roles[i];
}
// Tracks when selection index change
let selectionHook = {};
Object.defineProperty(selectionHook, "selectionIndex", {
  get: function () {
    return selectionIndex;
  },
  set: function (newValue) {
    selectionIndex = newValue; // Run the function every time valueA changes
    selectionFunction();
  },
});

function selectionFunction() {
  console.log("valueA changed:", selectionIndex);
  if (selectionIndex == myPlayerIndex) {
    attackBtn.disabled = true;
    attackBtn.style.opacity = 0.3;
    console.log("true");
  } else {
    attackBtn.disabled = false;
    attackBtn.style.opacity = 0.8;
  }
}

//Tracks when numberOfPlayers change
let numberOfPlayersHook = {};
Object.defineProperty(numberOfPlayersHook, "numberOfPlayers", {
  get: function () {
    return numberOfPlayers;
  },
  set: function (newValue) {
    numberOfPlayers = newValue; // Run the function every time valueA changes
    numberOfPlayerFunction();
  },
});

function numberOfPlayerFunction() {
  let players = {};
  const allPlayersRef = firebase.database().ref("players");
  allPlayersRef.on("value", (snapshot) => {
    players = snapshot.val() || {};
  });

  if (numberOfPlayersHook.numberOfPlayers == 4) {
    startBtn.disabled = false;
    //updates dragon hp
    dragonRef2.child("/hp").set(40);

    //updates player hp
    Object.keys(players).forEach((key) => {
      var selectionRef = firebase.database().ref(`players/${key}`);
      selectionRef.child("/hp").set(25);
    });
  } else if (numberOfPlayersHook.numberOfPlayers == 5) {
    startBtn.disabled = false;
    dragonRef2.child("/hp").set(50);

    Object.keys(players).forEach((key) => {
      var selectionRef = firebase.database().ref(`players/${key}`);
      selectionRef.child("/hp").set(20);
    });
  } else if (numberOfPlayersHook.numberOfPlayers > 5) {
    startBtn.disabled = false;
    dragonRef2.child("/hp").set(75);
    Object.keys(players).forEach((key) => {
      var selectionRef = firebase.database().ref(`players/${key}`);
      selectionRef.child("/hp").set(20);
    });
  } else {
    dragonRef2.child("/hp").set(0);
    Object.keys(players).forEach((key) => {
      var selectionRef = firebase.database().ref(`players/${key}`);
      selectionRef.child("/hp").set(0);
    });
    //change to true
    startBtn.disabled = false;
  }
  try {
    nameTag.querySelector(".profile-name").innerText = myName;
  } catch (e) {}
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

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  let oldSelectIndex;

  function handleArrowPress(xChange = 0, yChange = 0) {
    oldSelectIndex = selectionHook.selectionIndex;
    console.log(oldSelectIndex);
    if (yChange == -1) {
      selectionHook.selectionIndex -= 1;

      //skips dragon (index 0)
      if (selectionHook.selectionIndex == 0 && oldSelectIndex == 1) {
        console.log("w");
        selectionHook.selectionIndex -= 1;
      }
    }
    if (yChange == 1) {
      selectionHook.selectionIndex += 1;

      //skips dragon (index 0)
      if (selectionHook.selectionIndex > numberOfPlayersHook.numberOfPlayers) {
        selectionHook.selectionIndex =
          selectionHook.selectionIndex %
          (numberOfPlayersHook.numberOfPlayers + 1);
      }
      if (
        selectionHook.selectionIndex == 0 &&
        oldSelectIndex == numberOfPlayersHook.numberOfPlayers
      ) {
        console.log("Q");
        selectionHook.selectionIndex += 1;
      }
    }
    if (xChange == -1) {
      if (
        selectionHook.selectionIndex >= 1 &&
        selectionHook.selectionIndex <= 4
      ) {
        selectionHook.selectionIndex = oldSelectIndex;
      } else if (selectionHook.selectionIndex == 0) {
        selectionHook.selectionIndex = 1;
      } else {
        selectionHook.selectionIndex = 0;
      }
    }
    if (xChange == 1) {
      if (
        selectionHook.selectionIndex >= 1 &&
        selectionHook.selectionIndex <= 4
      ) {
        selectionHook.selectionIndex = 0;
      } else if (selectionHook.selectionIndex == 0) {
        if (numberOfPlayersHook.numberOfPlayers > 4) {
          selectionHook.selectionIndex = 5;
        }
      }
    }

    selectionHook.selectionIndex =
      selectionHook.selectionIndex % (numberOfPlayersHook.numberOfPlayers + 1);
    if (selectionHook.selectionIndex == -0) {
      //selectionIndex = 0;
    }
    if (selectionHook.selectionIndex < 0) {
      selectionHook.selectionIndex = numberOfPlayersHook.numberOfPlayers;
    }
    console.log("index", selectionHook.selectionIndex);

    //move to the next space

    const xPos = setPosition(selectionHook.selectionIndex).x;
    const yPos = setPosition(selectionHook.selectionIndex).y;

    //players[playerId].hp = selectionIndex;

    selectionArrow.style.left = 48 * xPos - arrowXOffset + "px";
    selectionArrow.style.top = 48 * yPos + arrowYOffset + "px";
    console.log(xPos, yPos);
    playerRef.set(players[playerId]);
    console.log(selectionArrow);
  }

  function initGame() {
    attackBtn.disabled = true;
    attackBtn.style.opacity = 0.3;

    let confirmButton;
    let undoButton;
    //INIT HUD
    //creates player icon on top
    const nameTag = document.createElement("div");
    nameTag.classList.add("Character");

    const roleText = document.createElement("div");
    playerRef.on("value", async (snapshot) => {
      nameTag.innerHTML = `
    <div class="profile-background grid-cell-profile"></div>
        <div class="Character_sprite grid-cell2">
        <img class="img_profile" src="images/dundrian-normal-player.gif"></div>
          <div id="ring" class="profile-ring grid-cell-profile"></div>
        <span class="profile-name" style="color:white"></span>
         
      `;

      gameContainer.appendChild(nameTag);
      nameTag.querySelector(".profile-name").innerText = snapshot
        .child("name")
        .val();
      nameTag
        .querySelector("#ring")
        .setAttribute(
          "class",
          "profile-ring-" + snapshot.child("color").val() + " grid-cell-profile"
        );
      nameTag.setAttribute("data-color", snapshot.child("color").val());

      console.log("tag", nameTag);

      roleText.innerHTML = `
         <span class="role-text" style="color:white"></span>
         
      `;
      gameContainer.appendChild(roleText);
      roleText.querySelector(".role-text").innerText =
        "role: " + snapshot.child("role").val();
    });

    let confirmActionsBtn = document.createElement("div");
    confirmActionsBtn.classList.add("action_btns");
    confirmActionsBtn.innerHTML = `
    <button id="undo-btn" style="margin-top: auto" class="undo_btn" hidden>
        undo
      </button>
    <button id="confirm-btn" style="margin-top: auto" class="confirm_btn" hidden>
        confirm
      </button>
      `;
    gameContainer.appendChild(confirmActionsBtn);

    undoButton = document.getElementById("undo-btn");
    confirmButton = document.getElementById("confirm-btn");

    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    new KeyPressListener("KeyW", () => handleArrowPress(0, -1));
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1));
    new KeyPressListener("KeyD", () => handleArrowPress(-1, 0));
    new KeyPressListener("KeyA", () => handleArrowPress(1, 0));

    //DRAGON
    const dragonRef = firebase.database().ref("dundrian");
    const allPlayersRef = firebase.database().ref("players");
    const dragonElement = document.createElement("div");
    dragonElement.classList.add("Character", "grid-cell");

    let dragon;

    dragonRef.on("value", async (snapshot) => {
      dragon = await snapshot.val();

      const characterState = dragon;
      const left = characterState.x + 200 + "px";
      const top = characterState.y + 100 + "px";

      dragonElement.setAttribute("data-direction", characterState.direction);
      dragonElement.setAttribute("id", "dundrian");
      dragonElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      //players[key]
      console.log("dragon = players[key]", dragon);
      //player el
      console.log("dragonEL = player EL", dragonElement);
      dragonElement.innerHTML = `
        <div  class="grid-cell-dragon"></div>
        <div class="Character_sprite grid-cell-dragon">
        <img  class="img_dragon" src="images/dundrian-dragon.gif"></div>
        <div class="Dragon_name-container">
          <span class="Character_name"></span>
          <span class="Character_hp"></span>
        </div>
      `;

      dragonElement.querySelector(".Character_name").innerText = dragon.name;
      dragonElement.querySelector(".Character_hp").innerText = dragon.hp;
      dragonElement.setAttribute("data-direction", dragon.direction);

      gameContainer.appendChild(dragonElement);

      dragonClick = document.querySelector("#dundrian");

      dragonClick.addEventListener("click", (e) => {
        //DRAGON LOGIC
        const pos = setPosition(0);
        selectionArrow.style.left = 48 * pos.x - arrowXOffset + "px";
        selectionArrow.style.top = 48 * pos.y + arrowYOffset + "px";
        selectionHook.selectionIndex = 0;
      });
    });

    //runs when a change occurs in the DB
    allPlayersRef.on("value", (snapshot) => {
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

        //Change character if role activated
        if (players[key].revealed) {
          if (players[key].role == "cultist") {
            el.querySelector(".img_player").setAttribute(
              "src",
              "images/dundrian-cultist.gif"
            );
          }
          if (players[key].role == "ninja") {
            el.querySelector(".img_player").setAttribute(
              "src",
              "images/dundrian-ninja.gif"
            );
          }
        }
      });
    });

    //runs when a new node is added to the tree in the DB
    allPlayersRef.on("child_added", (snapshot) => {
      console.log("num", numberOfPlayersHook.numberOfPlayers);

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

      //player click function
      let playerClick;

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
                selectionHook.selectionIndex = players[key].index + 1;
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
      numberOfPlayersHook.numberOfPlayers += 1;
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
      numberOfPlayersHook.numberOfPlayers -= 1;

      //notify that player left
      notificationContent.innerHTML = snapshot.val().name + " left";
      notification.className = "notification-show";
      setTimeout(function () {
        notification.className = "notification-hide";
      }, 2000);
    });

    //Updates player name with text input
    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || null;
      playerNameInput.value = newName;
      myName = newName;
      if (newName != undefined) {
        nameTag.querySelector(".profile-name").innerText = myName;
        playerRef.update({
          name: newName,
        });
      }
    });

    startBtn.addEventListener("click", () => {
      console.log("hello there" + myPlayerIndex, selectionIndex);

      //Randomize roles to the players in the game
      let roleArr = [];
      for (let i = 0; i < numberOfPlayersHook.numberOfPlayers; i++) {
        roleArr.push(setRole(i));
      }
      roleArr.sort(() => (Math.random() > 0.5 ? 1 : -1));
      let roleIndex = 0;
      Object.keys(players).forEach((key) => {
        var selectionRef = firebase.database().ref(`players/${key}`);
        selectionRef.child("role").set(roleArr[roleIndex]);
        roleIndex++;
      });
      console.log(roleArr);
      AutoSortPlayers();
      dragonRef.update({ start: true });
    });

    //Auto sort players
    function AutoSortPlayers() {
      let existingIndexes = [];
      let changeIndexes = [];

      var query = firebase.database().ref(`players/`).orderByKey();
      query
        .once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var childIndex = childSnapshot.child("index").val();
            existingIndexes.push(childIndex);
          });
        })
        .then(function () {
          existingIndexes.sort();
          for (let i = 0; i < numberOfPlayersHook.numberOfPlayers; i++) {
            if (existingIndexes[i] != i) {
              console.log(i, existingIndexes[i]);
              changeIndexes.push([i, existingIndexes[i]]);
            }
          }
          Object.keys(players).forEach((key) => {
            for (let i = 0; i < changeIndexes.length; i++) {
              if (players[key].index == changeIndexes[i][1]) {
                var selectionRef = firebase.database().ref(`players/${key}`);
                selectionRef.child("/index").set(changeIndexes[i][0]);
                selectionRef
                  .child("/color")
                  .set(playerColors[changeIndexes[i][0]]);
                selectionRef
                  .child("/x")
                  .set(setPosition(changeIndexes[i][0] + 1).x);
                selectionRef
                  .child("/y")
                  .set(setPosition(changeIndexes[i][0] + 1).y);
              }
            }
          });
        });
    }

    //GAME BUTTONS
    attackBtn.addEventListener("click", () => {
      console.log("atack", selectionIndex);
      if (selectionIndex > 0) {
        Object.keys(players).forEach((key) => {
          if (players[key].index + 1 == selectionIndex) {
            // if (playerId == key) {
            //   notificationContent.innerHTML = "can't attack yourself";
            //   notification.className = "notification-show";
            //   setTimeout(function () {
            //     notification.className = "notification-hide";
            //   }, 2000);
            //   return;
            // }
            var selectionRef = firebase.database().ref(`players/${key}`);
            let newHp;
            selectionRef.on("value", (snapshot) => {
              newHp = snapshot.child("/hp").val();
            });
            newHp -= 5;
            selectionRef.child("/hp").set(newHp);
          }
        });
      } else {
        //change dragon hp
        var selectionRef = firebase.database().ref(`dundrian`);
        let newHp;
        selectionRef.on("value", (snapshot) => {
          newHp = snapshot.child("/hp").val();
        });
        newHp -= 5;
        selectionRef.child("/hp").set(newHp);
      }
    });
    healBtn.addEventListener("click", () => {
      console.log("heal", selectionIndex);
      //Heals player
      if (selectionIndex > 0) {
        Object.keys(players).forEach((key) => {
          if (players[key].index + 1 == selectionIndex) {
            var selectionRef = firebase.database().ref(`players/${key}`);
            let newHp;
            selectionRef.on("value", (snapshot) => {
              newHp = snapshot.child("/hp").val();
            });
            newHp += 5;
            selectionRef.child("/hp").set(newHp);
          }
        });
      }
    });
    bosshealBtn.addEventListener("click", () => {
      console.log("boss heal", selectionIndex);

      //USE THIS AFTER ACTIONS HAS BEEN MADE
      confirmButton.hidden = false;
      undoButton.hidden = false;
      playerRef.child("role").set("ninja");
    });
    parryBtn.addEventListener("click", () => {
      console.log("parry", selectionIndex);
      playerRef.child("role").set("cultist");
    });
    activateRoleBtn.addEventListener("click", () => {
      console.log("parry", selectionIndex);
      playerRef.child("revealed").set(true);
    });

    confirmButton.addEventListener("click", () => {
      console.log("confirm");
    });
    undoButton.addEventListener("click", () => {
      console.log("undo");
    });

    //Stops the game when someone leaves
    window.onbeforeunload = function () {
      dragonRef2.child("/start").set(false);
    };
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user != null) {
      //logged in
      playerId = user.uid;

      //find how many players there are in game
      var pos = { x: 0, y: 0 };
      playerRef = firebase.database().ref(`players/${playerId}`);
      dragonRef2 = firebase.database().ref("dundrian");

      var ref = firebase.database().ref(`players`);
      var ref2 = firebase.database().ref(`players`);

      //find lowest open index for next player to join
      let smallestIndex = 1000;

      let creationIndexArr = [0, 1, 2, 3, 4, 5, 6, 7];
      let creationIndex;
      var query = firebase.database().ref(`players/`).orderByKey();
      query
        .once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
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
        numberOfPlayersHook.numberOfPlayers = snapshot.numChildren();
        if (numberOfPlayersHook.numberOfPlayers < MAX_PLAYERS) {
          dragonRef2.once("value").then(function (snap) {
            let gamestarted = snap.child("/start").val();
            if (gamestarted) {
              const characterElement = document.createElement("div");
              characterElement.innerHTML = `
              <div class="game-full-text">
                <span class="Character_name">GAME HAS STARTED</span>
              </div>
              `;
              gameContainer.appendChild(characterElement);
              selectionArrow.style.opacity = 0;
              return;
            }
            ref2
              .once("value")
              .then(function (snapshot) {
                numberOfPlayersHook.numberOfPlayers = snapshot.numChildren();

                pos = setPosition(creationIndex + 1);
                selectionIndex = creationIndex + 1;
                myPlayerIndex = selectionIndex;
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
                  role: "unknown",
                  revealed: false,
                });
                myName = "player " + (creationIndex + 1);
              });

            //leaves the game
            playerRef.onDisconnect().remove();

            initGame();
          });
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
      console.log(numberOfPlayersHook.numberOfPlayers);
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
