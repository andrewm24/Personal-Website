import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.js";

// Enable verbose logging to troubleshoot hanging connections
setLogLevel('debug');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;
analyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, db, analytics };
