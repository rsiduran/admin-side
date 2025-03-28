// Import the required Firebase services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Import Analytics if needed
import { getAnalytics } from "firebase/analytics";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAoaNKMO2jwSLbx5xy7GK1-VGP3RWN18G0",
  authDomain: "wanderpets-db-2307b.firebaseapp.com",
  databaseURL: "https://wanderpets-db-2307b-default-rtdb.firebaseio.com",
  projectId: "wanderpets-db-2307b",
  storageBucket: "wanderpets-db-2307b.appspot.com",
  messagingSenderId: "101528582501",
  appId: "1:101528582501:web:16a85b58bc4c25fa67498c",
  measurementId: "G-WGV4V1ESYH",
};

const firebaseConfig2 = {
  apiKey: "AIzaSyDukiaImMg8ksap2uOb5WnfN8UK-1LPlO4",
  authDomain: "wander-pets-aac0c.firebaseapp.com",
  projectId: "wander-pets-aac0c",
  storageBucket: "wander-pets-aac0c.firebasestorage.app",
  messagingSenderId: "998232988350",
  appId: "1:998232988350:web:87488c862ca652ce939cef",
  measurementId: "G-P0CHBJGRBW"
};

const app2 = initializeApp(firebaseConfig2, "app2");
const db2 = getFirestore(app2); 



// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Export the initialized services for use in your project
export { db, db2, auth, analytics };
