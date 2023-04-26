require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "dundrian-a472a.firebaseapp.com",
  databaseURL:
    "https://dundrian-a472a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dundrian-a472a",
  storageBucket: "dundrian-a472a.appspot.com",
  messagingSenderId: "797181178057",
  appId: "1:797181178057:web:157fdbb1b90830c0df5d18",
};
firebase.initializeApp(firebaseConfig);
