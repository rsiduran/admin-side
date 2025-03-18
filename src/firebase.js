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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Export the initialized services for use in your project
export { db, auth, analytics };
