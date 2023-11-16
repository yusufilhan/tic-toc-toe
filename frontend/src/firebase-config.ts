// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDN8KDPiYjKl1qfGCDMjP9g4EXgqqAkVj4',
  authDomain: 'tic-tac-toe-7edf8.firebaseapp.com',
  projectId: 'tic-tac-toe-7edf8',
  storageBucket: 'tic-tac-toe-7edf8.appspot.com',
  messagingSenderId: '517389188429',
  appId: '1:517389188429:web:127a164ba8f844481dcb04',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const firebaseApp = app
export const db = getFirestore(app)
