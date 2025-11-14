// Firebase Configuration
// Your Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyBfesM89w90r4NPJZ7unuBKeE6SZLluuN8",
  authDomain: "hifzmate-project-db.firebaseapp.com",
  projectId: "hifzmate-project-db",
  storageBucket: "hifzmate-project-db.firebasestorage.app",
  messagingSenderId: "887020210268",
  appId: "1:887020210268:web:f7e545e4041e80cb90fe99",
  measurementId: "G-GDC9Q28M3Y"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

