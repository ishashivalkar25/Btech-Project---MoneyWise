// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp} from "firebase/app";
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence} from 'firebase/auth/react-native';
import { getFirestore,addDoc,getDocs,collection, doc, initializeFirestore,getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getStorage } from '@firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn-FJu98mjxPehbtoeUNhEKwziwJ-eLOU",
  authDomain: "incomeandexpensetracker-aebb3.firebaseapp.com",
  projectId: "incomeandexpensetracker-aebb3",
  storageBucket: "incomeandexpensetracker-aebb3.appspot.com",
  messagingSenderId: "401740120924",
  appId: "1:401740120924:web:83c729f87c24074139f799",
  measurementId: "G-Y9GFMCPCTX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// if(apps.length===0){
//     user_app = initializeApp(firebaseConfig);
//     console.log(app);
// }else {
//     user_app = app();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
  });
// const db = getFirestore(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // this line
  useFetchStreams: false, // and this line
})

const storage = getStorage(app);
export { auth,db, storage,addDoc,getDocs,collection, doc,getDoc, updateDoc, setDoc, deleteDoc };