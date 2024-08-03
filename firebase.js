// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa2C42ehjDFlZnkrYlVfIfKqg2oBngegQ",
  authDomain: "pantryapp-d027b.firebaseapp.com",
  projectId: "pantryapp-d027b",
  storageBucket: "pantryapp-d027b.appspot.com",
  messagingSenderId: "353254231526",
  appId: "1:353254231526:web:18f041953dcc17191f1a27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app)
export{
    app,
    db,
    firebaseConfig
}

