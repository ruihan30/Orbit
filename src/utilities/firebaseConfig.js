import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj0AjOQ6eGA1CZaKKeOzf5SB9APDTgu6w",
  authDomain: "orbit-9f229.firebaseapp.com",
  projectId: "orbit-9f229",
  storageBucket: "orbit-9f229.appspot.com",
  messagingSenderId: "226869919323",
  appId: "1:226869919323:android:8106d8225c595c340b497e",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };

// android: 226869919323-nkog4dbbqniscijkhddfik67fouq1duv.apps.googleusercontent.com
// 226869919323-5ktefds9afuu9qg5ovamsc75rospoqlo.apps.googleusercontent.com
