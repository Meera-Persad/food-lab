// Firebase Authentication & Firestore Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWy1tKJEk7gFWQ3BSSRSWNl6GbExvozs0",
  authDomain: "food-25b17.firebaseapp.com",
  projectId: "food-25b17",
  storageBucket: "food-25b17.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "688475810102",
  appId: "1:688475810102:web:fe19272b646833108aeb97",
  measurementId: "G-4P8G35ELH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const signupForm = {
  username: document.getElementById("signup-username"),
  email: document.getElementById("signup-email"),
  password: document.getElementById("signup-password"),
  button: document.getElementById("signup-btn")
};

const loginForm = {
  username: document.getElementById("login-username"),
  password: document.getElementById("login-password"),
  button: document.getElementById("login-btn")
};

const statusText = document.getElementById("status");
const logoutBtn = document.getElementById("logout-btn");

// Helper function to find username by user ID
async function findUsernameByUid(uid) {
  try {
    const usernamesCollection = collection(db, "usernames");
    const q = query(usernamesCollection, where("uid", "==", uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error finding username:", error);
    return null;
  }
}

// Sign Up functionality
signupForm.button.addEventListener("click", async () => {
  const username = signupForm.username.value.trim();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;

  if (!username || !email || !password) {
    statusText.innerText = "Please fill all fields";
    return;
  }

  try {
    // Check if username already exists
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (usernameDoc.exists()) {
      statusText.innerText = "Username already taken";
      return;
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store username association
    await setDoc(doc(db, "usernames", username), {
      uid: userCredential.user.uid,
      email: email,
      createdAt: new Date().toISOString()
    });
    
    statusText.innerText = "Signup successful!";
    
    // Clear form
    signupForm.username.value = "";
    signupForm.email.value = "";
    signupForm.password.value = "";
  } catch (error) {
    statusText.innerText = `Signup error: ${error.message}`;
    console.error("Signup error:", error);
  }
});

// Login functionality
loginForm.button.addEventListener("click", async () => {
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;

  if (!username || !password) {
    statusText.innerText = "Please fill all fields";
    return;
  }

  try {
    // Get email from username
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (!usernameDoc.exists()) {
      statusText.innerText = "Username not found";
      return;
    }

    const email = usernameDoc.data().email;
    
    // Sign in with email and password
    await signInWithEmailAndPassword(auth, email, password);
    statusText.innerText = `Welcome back, ${username}!`;
    
    // Clear login form
    loginForm.username.value = "";
    loginForm.password.value = "";
  } catch (error) {
    statusText.innerText = `Login error: ${error.message}`;
    console.error("Login error:", error);
  }
});

// Logout functionality
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    statusText.innerText = "Logged out successfully";
  } catch (error) {
    statusText.innerText = `Logout error: ${error.message}`;
    console.error("Logout error:", error);
  }
});

// Auth state change listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    logoutBtn.style.display = "inline";
    
    // Try to find username
    const username = await findUsernameByUid(user.uid);
    const displayName = username || user.email;
    
    statusText.innerText = `Logged in as ${displayName}`;
    
    // You could redirect authenticated users or show protected content here
    console.log("User is authenticated:", user.uid);
  } else {
    // User is signed out
    logoutBtn.style.display = "none";
    statusText.innerText = "Not logged in";
    console.log("User is not authenticated");
  }
});

// Initialize status check on page load
console.log("Firebase authentication initialized");