// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDhuDC4kWZvwrpr-3ueD5qRCvlufpy6z2I",
  authDomain: "mandaringathering-d91d4.firebaseapp.com",
  databaseURL: "https://mandaringathering-d91d4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mandaringathering-d91d4",
  storageBucket: "mandaringathering-d91d4.appspot.com",
  messagingSenderId: "477043088588",
  appId: "1:477043088588:web:27aa798583cbbcf30cb669"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
