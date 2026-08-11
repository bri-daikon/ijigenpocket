import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// TODO: ここにFirebaseコンソールから取得した設定を貼り付けてください。
// Firebaseプロジェクトを作成し、Webアプリを追加して得られる「firebaseConfig」をそのまま上書きしてください。
const firebaseConfig = {
  apiKey: "AIzaSyDWihGTCFg9hC5M2mqqn0xr2Fw9qPHgVmg",
  authDomain: "battlemanager-93b66.firebaseapp.com",
  projectId: "battlemanager-93b66",
  storageBucket: "battlemanager-93b66.firebasestorage.app",
  messagingSenderId: "1264794788",
  appId: "1:1264794788:web:4151c6956c7d5f7e99ba31",
  measurementId: "G-79J6PMDNK8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, get, child };
