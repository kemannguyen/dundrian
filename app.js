function getKeyString(x, y) {}

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 4;
const arrowXOffset = 490;
const arrowYOffset = -440;

let diceStop;
let numberOfPlayers = 0;
let selectionIndex = 0;
let myPlayerIndex;
let myName = "";
let yourTurn;

//buttons
const startBtn = document.getElementById("start-btn");
const attackBtn = document.getElementById("attack-btn");
const healBtn = document.getElementById("heal-btn");
const bosshealBtn = document.getElementById("boss-heal-btn");
const parryBtn = document.getElementById("parry-btn");
const activateRoleBtn = document.getElementById("activate-role-btn");
const musicBtn = document.getElementById("music-btn");
const diceBtn = document.getElementById("dice-btn");
const diceBtnOl = document.getElementById("dice-btn-outline");

//firebase references
let dragonRef2;

//hud
const waitText = document.getElementById("wait_text");

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

let diceHook = {};
Object.defineProperty(diceHook, "diceStop", {
  get: function () {
    return diceStop;
  },
  set: function (newValue) {
    diceStop = newValue; // Run the function every time valueA changes
    diceFunc();
  },
});
function diceFunc() {
  console.log("TEST", diceHook.diceStop);
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
  if (selectionHook.selectionIndex == myPlayerIndex) {
    attackBtn.disabled = true;
    attackBtn.style.opacity = 0.3;
  } else {
    if (yourTurn) {
      attackBtn.disabled = false;
      attackBtn.style.opacity = 0.8;
    }
  }
  if (selectionHook.selectionIndex == 0) {
    healBtn.disabled = true;
    healBtn.style.opacity = 0.3;
  } else {
    if (yourTurn) {
      healBtn.disabled = false;
      healBtn.style.opacity = 0.8;
    }
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
  console.log("change player num", numberOfPlayersHook.numberOfPlayers);
}

const ListItem = (actor, img, target) => {
  return `
    <div>
      <span class="listitem_title">${actor}</span>
      <img class="action_img" src="${img}" />
      <span class="listitem_title">${target}</span>
    <div/>
    `;
};

(function () {
  let playerId;
  let playerRef;
  let playersIndex = [];
  //character info for dom
  let players = {};
  let selectionLock;
  //Button ref
  //const playerColorButton = document.querySelector("#player-color");
  let dragonClick;
  let playerClicks = [];
  const notification = document.querySelector("#notification");
  const notificationContent = document.querySelector("#notification-content");

  //dom elements
  let playerElements = {};
  let selectionArrow = document.getElementById("select-arrow");
  let dragonSelection = document.getElementById("dragon-select");

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  const textHelper = document.getElementById("text_helper");
  var audio = document.getElementById("background");
  let musicEl = document.querySelector("#music-btn");
  let actionListHTML = document.querySelector("#action_list");

  const diceBtnEl = document.querySelector("#dice-btn");
  function handleArrowPress(xChange = 0, yChange = 0) {
    if (selectionLock) {
      return;
    }
    oldSelectIndex = selectionHook.selectionIndex;
    if (yChange == -1) {
      if (playersIndex.includes(selectionHook.selectionIndex - 1)) {
        if (selectionHook.selectionIndex == 1) {
          let highestIndexPlayer = playersIndex.sort()[playersIndex.length - 1];
          selectionHook.selectionIndex = highestIndexPlayer + 1;
        } else {
          //if (playersIndex[selectionHook.selectionIndex - 1] == undefined) {
          let tempArr = playersIndex.sort();
          let currIndex = playersIndex.findIndex(getIndexOf);
          function getIndexOf(value) {
            return value == selectionHook.selectionIndex - 1;
          }
          selectionHook.selectionIndex = tempArr[currIndex - 1] + 1;
        }
      }
    }
    if (yChange == 1) {
      if (playersIndex.includes(selectionHook.selectionIndex - 1)) {
        if (playersIndex[selectionHook.selectionIndex] == undefined) {
          let lowestIndexPlayer = playersIndex.sort()[0];
          selectionHook.selectionIndex = lowestIndexPlayer + 1;
        } else {
          selectionHook.selectionIndex =
            playersIndex[selectionHook.selectionIndex] + 1;
        }
      }
    }
    if (xChange == -1) {
      if (
        selectionHook.selectionIndex >= 1 &&
        selectionHook.selectionIndex <= 4
      ) {
        return;
      } else if (selectionHook.selectionIndex == 0) {
        let lowestIndexPlayer = playersIndex.sort()[0];
        if (lowestIndexPlayer < 4) {
          selectionHook.selectionIndex = lowestIndexPlayer + 1;
        }
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
        let tempArr = playersIndex.sort();
        let currIndex = playersIndex.findIndex(getIndexOf);
        function getIndexOf(value) {
          return value >= 4;
        }
        let lowestIndexRightSidePlayer = tempArr[currIndex];
        if (lowestIndexRightSidePlayer >= 4) {
          selectionHook.selectionIndex = lowestIndexRightSidePlayer + 1;
        }
      }
    }

    //selectionHook.selectionIndex =
    //selectionHook.selectionIndex % (numberOfPlayersHook.numberOfPlayers + 1);
    if (selectionHook.selectionIndex == -0) {
      //selectionIndex = 0;
    }
    if (selectionHook.selectionIndex < 0) {
      selectionHook.selectionIndex = numberOfPlayersHook.numberOfPlayers;
    }

    //move to the next space

    const xPos = setPosition(selectionHook.selectionIndex).x;
    const yPos = setPosition(selectionHook.selectionIndex).y;

    //players[playerId].hp = selectionIndex;

    selectionArrow.style.left = 43 * xPos - arrowXOffset + "px";
    selectionArrow.style.top = 43 * yPos + arrowYOffset + "px";
    playerRef.set(players[playerId]);
  }

  function initGame() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    new KeyPressListener("KeyW", () => handleArrowPress(0, -1));
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1));
    new KeyPressListener("KeyA", () => handleArrowPress(-1, 0));
    new KeyPressListener("KeyD", () => handleArrowPress(1, 0));

    let realAction = true;
    attackBtn.disabled = true;
    attackBtn.style.opacity = 0.3;
    //audio.play();

    //firebase ref
    const gameRef = firebase.database().ref("game");
    const dragonRef = firebase.database().ref("dundrian");
    const allPlayersRef = firebase.database().ref("players");
    let actionList = [];

    let confirmButton;
    let undoButton;

    //INIT HUD
    //creates player icon on top
    const nameTag = document.createElement("div");
    nameTag.classList.add("Character");

    const roleText = document.createElement("div");
    const playerTurnText = document.createElement("div");

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

    //after each players turn
    var playerTurnRef = firebase.database().ref(`game/playerTurn`);
    playerTurnRef.on("value", async (snapshot) => {
      playerTurnText.innerHTML = `
         <span class="turn-text" style="color:white"></span>
      `;
      gameContainer.appendChild(playerTurnText);
      let activePlayerIndex = await snapshot.val();
      let activePlayerName = "";
      Object.keys(players).forEach((key) => {
        if (players[key].index == activePlayerIndex) {
          activePlayerName = players[key].name;
        }
      });
      if (activePlayerName != "") {
        playerTurnText.querySelector(".turn-text").innerText =
          activePlayerName + "'s turn";
      }
      //load data make it into object array with actor, action and target

      //add thing to list
    });

    let currentPercent;

    async function diceThrowFunc() {
      currentPercent = Math.floor(Math.random() * 6) + 1;
      diceBtnOl.src = `/images/${currentPercent}.png`;
    }

    // var showPercent = window.setInterval(function () {
    //   if (currentPercent < 6) {
    //     currentPercent += 1;
    //   } else {
    //     currentPercent = 1;
    //   }
    //   var result = "";
    //   if (currentPercent == 1) {
    //     result = "⚀";
    //   } else if (currentPercent == 2) {
    //     result = "⚁";
    //   } else if (currentPercent == 3) {
    //     result = "⚂";
    //   } else if (currentPercent == 4) {
    //     result = "⚃";
    //   } else if (currentPercent == 5) {
    //     result = "⚄";
    //   } else if (currentPercent == 6) {
    //     result = "⚅";
    //   }
    //   diceBtnOl.innerText = `${result}`;
    // }, 30);

    gameRef.on("value", (snap) => {
      snap.forEach((child) => {
        if (child.key != "playerTurn" && child.key != "turn") {
          let string = JSON.stringify(child.child("fakeaction").val());
          string = string.replace("{", "");
          string = string.replace("}", "");
          string = string.replaceAll('"', "");
          let data = string.split(":");
          let action = data[0];
          let target = data[1];
          //console.log("child: fake action", action + " who?: " + target);
          var actionItem;
          try {
            if (target != "dundrian") {
              actionItem = `${players[child.key].name},${action},${
                players[target].name
              }`;
            } else {
              actionItem = `${players[child.key].name},${action},${target}`;
            }
          } catch (e) {}
          if (actionList.includes(actionItem)) {
            console.log("already in", actionList);
          } else if (target != undefined && action != undefined) {
            console.log("ADDED ACTION");
            actionList.push(actionItem);
          } else {
            console.log("debug", target);
            console.log("debug", action);
          }
        }
        //console.log(actionList);
      });
      if (actionList != undefined) {
        console.log("AL LENG", actionList.length);
        console.log("??????", actionList);
        let listEl = "";
        for (let i = 0; i < actionList.length; i++) {
          console.log("ALI add", i);
          let temp = actionList[i].split(",");
          listEl += ListItem(temp[0], `/images/${temp[1]}.png`, temp[2]);
        }
        actionListHTML.innerHTML = listEl;
      }
    });

    undoButton = document.getElementById("undo-btn");
    confirmButton = document.getElementById("confirm-btn");

    //arrange the player turn order, representing indexes
    //RUN after all players has done their actions
    var endTurnRef = firebase.database().ref("game/turn");
    endTurnRef.on("value", async (snap) => {
      //console.log("Test", snap.val());
      if ((await snap.val()) != null && (await snap.val()) != 0) {
        let lastPlayer = playersIndex.pop();
        playersIndex.reverse();
        playersIndex.push(lastPlayer);
        playersIndex.reverse();
        if (lastPlayer > 3) {
          dragonRef.child("direction").set("right");
        } else {
          dragonRef.child("direction").set("left");
        }
        Object.keys(players).forEach((key) => {
          try {
            gameRef.child(key).remove();
          } catch (e) {}
        });
        //when you are alone and want action list things
        // let listEl = "";
        // for (let i = 0; i < actionList.length; i++) {
        //   console.log("ALI add", i);
        //   let temp = actionList[i].split(",");
        //   listEl += ListItem(temp[0], `/images/${temp[1]}.png`, temp[2]);
        // }
        // actionListHTML.innerHTML = listEl;
        console.log("AL when show: ", actionList);
      }
      bosshealBtn.disabled = false;
      bosshealBtn.style.opacity = 0.8;
      parryBtn.disabled = false;
      parryBtn.style.opacity = 0.8;
      selectionLock = false;
      let pos = setPosition(playersIndex[playersIndex.length - 1] + 1);
      dragonSelection.style.top = 43 * pos.y - 350 + "px";
      dragonSelection.style.left = 43 * pos.x - 490 + "px";
      actionList.length = 0;
      actionList = [];
      actionListHTML.innerHTML = "";
      console.log("AL cleared", actionList);
      console.log("AL TEST", actionList.length);
    });

    const dragonElement = document.createElement("div");
    dragonElement.classList.add("Dragon", "grid-cell");

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
      //console.log("dragon = players[key]", dragon);
      //console.log("sel index", selectionIndex);
      //player el
      //console.log("dragonEL = player EL", dragonElement);

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
        if (selectionLock) {
          return;
        }
        //DRAGON LOGIC
        const pos = setPosition(0);
        selectionArrow.style.left = 43 * pos.x - arrowXOffset + "px";
        selectionArrow.style.top = 43 * pos.y + arrowYOffset + "px";
        selectionHook.selectionIndex = 0;
      });
    });

    //Text HELPER
    gameRef.child("playerTurn").on("value", (snap) => {
      gameRef.child("phase").on("value", (snapshot) => {
        if (snapshot.val() == "action" && snap.val() != myPlayerIndex - 1) {
          textHelper.innerText = "";
          console.log("RETURNED PT");
        } else if (
          snap.val() == myPlayerIndex - 1 &&
          snapshot.val() == "action"
        ) {
          textHelper.innerText = "select real action";
        } else if (
          //when its nit your turn during dice phase
          snap.val() != myPlayerIndex - 1 &&
          snapshot.val() != "action"
        ) {
          //before game starts
          if (snap.val() == undefined) {
            textHelper.innerText = "";
          } else {
            //shows other player action
            Object.keys(players).forEach((key) => {
              if (players[key].index == snap.val()) {
                var actionRef = firebase.database().ref(`game/${key}/action`);

                actionRef.once("value", (snap) => {
                  let string = JSON.stringify(snap.val());
                  string = string.replace("{", "");
                  string = string.replace("}", "");
                  string = string.replaceAll('"', "");
                  let data = string.split(":");
                  let action = data[0];
                  let target = data[1];
                  console.log("AAA", action);
                  console.log("BBB", target);
                  if (action == null && BBB == undefined) {
                    return;
                  }
                  if (target == "dundrian") {
                    textHelper.innerText =
                      players[key].name + " " + action + "s " + target;
                  } else {
                    try {
                      textHelper.innerText =
                        players[key].name +
                        " " +
                        action +
                        "s " +
                        players[target].name;
                    } catch (e) {}
                  }
                });
              }
            });
          }
        } else {
          textHelper.innerText = "Press on dice to roll";
        }
      });
    });

    //runs when a change occurs in the DB
    allPlayersRef.on("value", async (snapshot) => {
      players = (await snapshot.val()) || {};
      dragonRef.child("start").on("value", async (snap) => {
        if ((await snap.val()) == false) {
          //console.log("ONLY ONCEEE start in allref", snap.val());
          numberOfPlayersHook.numberOfPlayers = snapshot.numChildren();
        }
      });
      Object.keys(players).forEach((key) => {
        if (!playersIndex.includes(players[key].index) && players[key].hp > 0) {
          playersIndex.push(players[key].index);
        }
        const characterState = players[key];
        try {
          let el = playerElements[key];
          // Now update the DOM
          el.querySelector(".Character_name").innerText = characterState.name;
          el.querySelector(".Character_hp").innerText = characterState.hp;
          el.setAttribute("data-color", characterState.color);

          const left = 16 * characterState.x + "px";
          const top = 16 * characterState.y - 4 + "px";

          el.style.transform = `translate3d(${left}, ${top}, 0)`;
          if (players[key].hp <= 0) {
            el.classList.add("disabled");
            console.log("dead", el);
            gameRef.child(key).remove();
            let modifiedPlayersIndex = playersIndex.filter(
              (e) => e !== players[key].index
            );
            playersIndex.length = 0;
            playersIndex = [...modifiedPlayersIndex];
            if (numberOfPlayersHook.numberOfPlayers == 0) {
              dragonRef.child("start").set(false);
            }
          }
        } catch (e) {}

        //activates buttons when its your turn
        gameRef.on("value", (snapshot) => {
          console.log(snapshot.child("playerTurn").val());
          if (snapshot.child("playerTurn").val() != myPlayerIndex - 1) {
            yourTurn = false;
            attackBtn.hidden = true;
            healBtn.hidden = true;
            bosshealBtn.hidden = true;
            parryBtn.hidden = true;
            activateRoleBtn.hidden = true;
            diceBtn.hidden = true;
            diceBtnOl.hidden = true;
          } else {
            gameRef.child("phase").on("value", (snapshot) => {
              yourTurn = true;
              let result = snapshot.val();
              if (result == "action") {
                diceBtn.hidden = true;
                diceBtnOl.hidden = true;
                attackBtn.hidden = false;
                healBtn.hidden = false;
                bosshealBtn.hidden = false;
                parryBtn.hidden = false;
                activateRoleBtn.hidden = false;
                selectionFunction();
              } else {
                if (yourTurn) {
                  diceHook.diceStop = false;
                  currentPercent = 0;
                  diceBtn.hidden = false;
                  diceBtnOl.hidden = false;
                  attackBtn.hidden = true;
                  healBtn.hidden = true;
                  bosshealBtn.hidden = true;
                  parryBtn.hidden = true;
                  activateRoleBtn.hidden = true;
                }
              }
            });
          }
        });
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
    allPlayersRef.on("child_added", async (snapshot) => {
      const addedPlayer = await snapshot.val();
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
      playerClick = document.querySelector(`#${addedPlayer.id}`);

      //selects the player and moves the arrow to the pressed one
      setTimeout(function () {
        if (playerClick != undefined) {
          playerClick.addEventListener("click", (e) => {
            if (selectionLock) {
              return;
            }
            Object.keys(players).forEach((key) => {
              let el = playerElements[key];
              if (e.currentTarget.style.transform == el.style.transform) {
                const pos = setPosition(players[key].index + 1);
                selectionArrow.style.left = 43 * pos.x - arrowXOffset + "px";
                selectionArrow.style.top = 43 * pos.y + arrowYOffset + "px";
                selectionHook.selectionIndex = players[key].index + 1;
              }
            });
          });
        }
      }, 1000);

      //adds new player click if its doenst exist
      setInterval(function () {
        if (!playerClicks.includes(playerClick) && playerClick != null) {
          playerClicks.push(playerClick);
        }
      }, 2000);
      numberOfPlayersHook.numberOfPlayers++;
    });

    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", async (snapshot) => {
      const removedKey = await snapshot.val().id;
      var index = playerClicks.indexOf(playerElements[removedKey]);
      if (index > -1) {
        playerClicks.splice(index, 1);
      }
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
      numberOfPlayersHook.numberOfPlayers--;
      playersIndex.pop();

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

    //activates role button at gamestart
    dragonRef.child("start").on("value", async (snapshot) => {
      if (await snapshot.val()) {
        playersIndex.sort();
        //console.log("START");
        let players2 = {};
        const allPlayersRef2 = firebase.database().ref("players");
        allPlayersRef2.on("value", (snapshot) => {
          players2 = snapshot.val();
        });

        //console.log("before super");
        //updates player hp
        Object.keys(players2).forEach((key) => {
          //console.log("SUPER");
          let el = document.querySelector(`#${key}`);

          el.classList.remove("disabled");

          if (numberOfPlayersHook.numberOfPlayers == 4) {
            startBtn.disabled = false;
            dragonRef2.child("/hp").set(40);
            var selectionRef = firebase.database().ref(`players/${key}`);
            selectionRef.child("/hp").set(25);
          } else if (numberOfPlayersHook.numberOfPlayers == 5) {
            startBtn.disabled = false;
            dragonRef2.child("/hp").set(50);
            var selectionRef = firebase.database().ref(`players/${key}`);
            selectionRef.child("/hp").set(20);
          } else if (numberOfPlayersHook.numberOfPlayers > 5) {
            startBtn.disabled = false;
            dragonRef2.child("/hp").set(75);
            var selectionRef = firebase.database().ref(`players/${key}`);
            selectionRef.child("/hp").set(20);
          } else {
            //change to true WHEN YOU WANT GAME START TO BE ALBE TO START WITH RIGHT AMOUNT
            startBtn.disabled = false;
            dragonRef2.child("/hp").set(5);
            var selectionRef = firebase.database().ref(`players/${key}`);
            selectionRef.child("/hp").set(2);
          }
        });

        try {
          nameTag.querySelector(".profile-name").innerText = myName;
        } catch (e) {}

        activateRoleBtn.disabled = false;
        activateRoleBtn.style.opacity = 0.8;
        startBtn.disabled = true;
        healBtn.disabled = false;
        healBtn.style.opacity = 0.8;
        bosshealBtn.disabled = false;
        bosshealBtn.style.opacity = 0.8;
        parryBtn.disabled = false;
        parryBtn.style.opacity = 0.8;
        dragonSelection.hidden = false;
        waitText.hidden = true;
      } else {
        //game ended
        activateRoleBtn.disabled = true;
        activateRoleBtn.style.opacity = 0.3;
        startBtn.disabled = false;
        attackBtn.disabled = true;
        attackBtn.style.opacity = 0.3;
        healBtn.disabled = true;
        healBtn.style.opacity = 0.3;
        bosshealBtn.disabled = true;
        bosshealBtn.style.opacity = 0.3;
        parryBtn.disabled = true;
        parryBtn.style.opacity = 0.3;
        attackBtn.hidden = true;
        healBtn.hidden = true;
        bosshealBtn.hidden = true;
        activateRoleBtn.hidden = true;
        dragonSelection.hidden = true;
        Object.keys(players).forEach((key) => {
          allPlayersRef.child(key).child("role").set("???");
        });
        waitText.hidden = false;
        gameRef.remove();
      }
    });
    startBtn.addEventListener("click", () => {
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
      AutoSortPlayers();
      dragonRef.update({ start: true });

      var game = {
        turn: 0,
        playerTurn: "",
        phase: "action",
      };
      gameRef.set(game);
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
    var confirmVal = "";
    var confirmAction = "";
    var confirmChild = "";

    attackBtn.addEventListener("click", () => {
      selectionLock = true;
      //attack player
      if (selectionIndex > 0) {
        Object.keys(players).forEach((key) => {
          if (players[key].index + 1 == selectionIndex) {
            if (realAction) {
              confirmChild = "action";
              confirmAction = "attack";
              confirmVal = key;
              bosshealBtn.disabled = true;
              parryBtn.disabled = true;
              bosshealBtn.style.opacity = 0.3;
              parryBtn.style.opacity = 0.3;
            } else {
              confirmChild = "fakeaction";
              confirmAction = "attack";
              confirmVal = key;
            }
          }
        });
      }
      //attack dragon
      else {
        if (realAction) {
          confirmChild = "action";
          confirmAction = "attack";
          confirmVal = "dundrian";
        } else {
          confirmChild = "fakeaction";
          confirmAction = "attack";
          confirmVal = "dundrian";
        }
      }
      confirmButton.hidden = false;
      undoButton.hidden = false;
    });
    healBtn.addEventListener("click", () => {
      selectionLock = true;
      //Heals player
      if (selectionIndex > 0) {
        Object.keys(players).forEach((key) => {
          if (players[key].index + 1 == selectionIndex) {
            if (realAction) {
              confirmChild = "action";
              confirmAction = "heal";
              confirmVal = key;
              bosshealBtn.disabled = true;
              parryBtn.disabled = true;
              bosshealBtn.style.opacity = 0.3;
              parryBtn.style.opacity = 0.3;
            } else {
              confirmChild = "fakeaction";
              confirmAction = "heal";
              confirmVal = key;
            }
          }
        });
      }
      confirmButton.hidden = false;
      undoButton.hidden = false;
    });
    bosshealBtn.addEventListener("click", () => {
      //console.log(playersIndex);
      //USE THIS AFTER ACTIONS HAS BEEN MADE
      confirmButton.hidden = false;
      undoButton.hidden = false;
      if (realAction) {
        confirmChild = "action";
        confirmAction = "heal";
        confirmVal = "dundrian";
      } else {
        confirmChild = "fakeaction";
        confirmAction = "heal";
        confirmVal = "dundrian";
      }
    });
    parryBtn.addEventListener("click", () => {
      confirmButton.hidden = false;
      undoButton.hidden = false;
      if (realAction) {
        confirmChild = "action";
        confirmAction = "parry";
        confirmVal = playerId;
      } else {
        confirmChild = "fakeaction";
        confirmAction = "parry";
        confirmVal = playerId;
      }
    });
    activateRoleBtn.addEventListener("click", () => {
      playerRef.child("revealed").set(true);
      playerRef.once("value", (snap) => {
        if (snap.child("role").val() == "paladin") {
          return;
        }
        nameTag
          .querySelector(".img_profile")
          .setAttribute(
            "src",
            `images/dundrian-${snap.child("role").val()}.gif`
          );
        if (snap.child("role").val() == "cultist") {
          nameTag
            .querySelector(".img_profile")
            .setAttribute("style", `margin-left: -22; margin-top: 5`);
        } else if (snap.child("role").val() == "ninja") {
          nameTag
            .querySelector(".img_profile")
            .setAttribute("style", ` margin-top: 5`);
        }
      });
    });

    confirmButton.addEventListener("click", () => {
      gameRef
        .child(`${playerId}`)
        .child(confirmChild)
        .child(confirmAction)
        .set(confirmVal);
      //Next player turn
      if (!realAction) {
        let newPlayerIndex;

        //Player order turn logic -> move this to dice throw section, split each player action
        // into its own firebase set
        if (myPlayerIndex - 1 == playersIndex[playersIndex.length - 1]) {
          //lead to first dice throw from here
          //...
          gameRef.child("phase").set("dice");
          //new player after full round end
          newPlayerIndex = playersIndex[0];
        } else {
          //needs fixing
          //find next player turn
          let currIndex = playersIndex.findIndex(getIndexOf);
          function getIndexOf(value) {
            return value == myPlayerIndex - 1;
          }
          newPlayerIndex = playersIndex[currIndex + 1];
        }

        gameRef.child("playerTurn").set(newPlayerIndex);
        realAction = true;
        confirmButton.hidden = true;
        undoButton.hidden = true;
      } else {
        textHelper.innerText = "declare fake action";
        realAction = false;
        confirmButton.hidden = true;
        undoButton.hidden = true;
      }
    });
    undoButton.addEventListener("click", () => {
      selectionLock = false;
      realAction = true;
      gameRef.child(`${playerId}`).child("action").set({});
      gameRef.child(`${playerId}`).child("fakeaction").set({});
      confirmButton.hidden = true;
      undoButton.hidden = true;
      bosshealBtn.disabled = false;
      parryBtn.disabled = false;
      bosshealBtn.style.opacity = 0.8;
      parryBtn.style.opacity = 0.8;
    });

    musicBtn.addEventListener("click", () => {
      if (!audio.paused) {
        audio.pause();
        musicEl.setAttribute("src", "/images/music_off.png");
      } else {
        audio.play();
        musicEl.setAttribute("src", "/images/music_on.png");
      }
    });
    diceBtn.addEventListener("click", () => {
      diceHook.diceStop = true;
      diceThrowFunc();
      setTimeout(function () {
        dicePhase();
      }, 3000);
    });
    window.setInterval(function () {
      if (diceHook.diceStop == false && yourTurn) {
        diceThrowFunc();
        console.log("1");
      }
    }, 50);

    async function sleep(milliseconds) {
      const date = Date.now();
      let currentDate = null;
      do {
        currentDate = Date.now();
      } while (currentDate - date < milliseconds);
    }
    function dicePhase() {
      diceThrow = currentPercent;
      console.log("DICE", diceThrow);

      //reads users action data from db and implements it
      var actionRef = firebase.database().ref(`game/${playerId}/action`);

      actionRef.once("value", (snap) => {
        let string = JSON.stringify(snap.val());
        string = string.replace("{", "");
        string = string.replace("}", "");
        string = string.replaceAll('"', "");
        let data = string.split(":");
        let action = data[0];
        let target = data[1];
        console.log("AAA", action);
        console.log("BBB", target);
        if (action == null && BBB == undefined) {
          return;
        }

        let targetParry;
        //for parry
        var targetActionRef = firebase.database().ref(`game/${target}/action`);
        targetActionRef.on("value", (snap2) => {
          let string = JSON.stringify(snap2.val());
          if (snap2.val() == null) {
            return;
          }
          string = string.replace("{", "");
          string = string.replace("}", "");
          string = string.replaceAll('"', "");
          let data2 = string.split(":");
          let targetAction = data2[0];

          if (targetAction == "parry") {
            targetParry = true;
          } else {
            targetParry = false;
          }
        });

        let newHp;
        if (target != "dundrian") {
          allPlayersRef.child(target).once("value", (snap) => {
            newHp = snap.child("hp").val();
          });
        } else {
          dragonRef.on("value", (snap) => {
            newHp = snap.child("hp").val();
          });
        }

        if (action == "heal") {
          if (target != "dundrian") {
            if (!targetParry) {
              newHp += diceThrow;
            } else {
              newHp -= Math.ceil(diceThrow / 2);
              players[playerId].hp += Math.ceil(diceThrow / 2);

              allPlayersRef
                .child(playerId)
                .child("hp")
                .set(players[playerId].hp);
            }
            if (newHp <= 0) {
              numberOfPlayersHook.numberOfPlayers--;
              //remove from index here
              let modifiedPlayersIndex = playersIndex.filter(
                (e) => e !== players[target].index
              );
              playersIndex.length = 0;
              playersIndex = [...modifiedPlayersIndex];
            }
            allPlayersRef.child(target).child("hp").set(newHp);
          } else {
            newHp += diceThrow;

            dragonRef.child("hp").set(newHp);
          }
        }
        if (action == "attack") {
          if (target != "dundrian") {
            if (!targetParry) {
              newHp -= diceThrow;
            } else {
              players[playerId].hp -= Math.ceil(diceThrow / 2);
              allPlayersRef
                .child(playerId)
                .child("hp")
                .set(players[playerId].hp);
            }

            allPlayersRef.child(target).child("hp").set(newHp);
            //implement if kill remove from num
            if (newHp <= 0) {
              numberOfPlayersHook.numberOfPlayers--;
              //remove from index here
              let modifiedPlayersIndex = playersIndex.filter(
                (e) => e !== players[target].index
              );
              playersIndex.length = 0;
              playersIndex = [...modifiedPlayersIndex];
            }
          } else {
            //dragon attack logic
            newHp -= diceThrow;

            dragonRef.child("hp").set(newHp);
            if (newHp <= 0) {
              dragonRef.child("start").set(false);
            }
          }
        }
        //if action parry add logic later
      });
      if (myPlayerIndex - 1 == playersIndex[playersIndex.length - 1]) {
        //new player after full round end
        newPlayerIndex = playersIndex[playersIndex.length - 1];

        gameRef.child("playerTurn").set(newPlayerIndex);

        //DO THIS AFTER ALL PLAYERS HAS ROLLED THE
        gameRef.once("value", (snap) => {
          gameRef.child("turn").set(snap.child("turn").val() + 1);
        });
        gameRef.child("phase").set("action");
      } else {
        //needs fixing
        //find next player turn
        console.log("find next player....");
        let currIndex = playersIndex.findIndex(getIndexOf);
        function getIndexOf(value) {
          return value == myPlayerIndex - 1;
        }
        newPlayerIndex = playersIndex[currIndex + 1];
        gameRef.child("playerTurn").set(newPlayerIndex);
      }
    }
    //Stops the game when someone leaves
    window.onbeforeunload = function () {
      dragonRef2.child("/start").set(false);
      gameRef.remove();
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

        //blocks players from entering after a game is currently running
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
                //data for local visuals
                numberOfPlayersHook.numberOfPlayers = snapshot.numChildren();
                pos = setPosition(creationIndex + 1);
                selectionIndex = creationIndex + 1;
                myPlayerIndex = selectionIndex;
                selectionArrow.style.left = 43 * pos.x - arrowXOffset + "px";
                selectionArrow.style.top = 43 * pos.y + arrowYOffset + "px";
              })
              .then(() => {
                //db data
                playerRef.set({
                  id: playerId,
                  name: "player " + (creationIndex + 1),
                  hp: 1,
                  color: playerColors[creationIndex],
                  x: pos.x,
                  y: pos.y,
                  index: creationIndex,
                  role: "???",
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
      console.log("LOGGED OUT");
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
