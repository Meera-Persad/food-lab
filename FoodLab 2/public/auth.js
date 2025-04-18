// Import Firebase services
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
  storageBucket: "food-25b17.appspot.com",
  messagingSenderId: "688475810102",
  appId: "1:688475810102:web:fe19272b646833108aeb97",
  measurementId: "G-4P8G35ELH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginToggle = document.getElementById("login-toggle");
const signupToggle = document.getElementById("signup-toggle");

// Toggle between login and signup forms
loginToggle.addEventListener("click", () => {
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  loginToggle.classList.add("active");
  signupToggle.classList.remove("active");
});

signupToggle.addEventListener("click", () => {
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  signupToggle.classList.add("active");
  loginToggle.classList.remove("active");
});

// Status message functions
function showStatus(elementId, message, isError = false) {
  const statusElement = document.getElementById(elementId);
  statusElement.textContent = message;
  statusElement.className = "status-message";
  if (isError) {
    statusElement.classList.add("status-error");
  } else {
    statusElement.classList.add("status-success");
  }
  
  // Clear message after 5 seconds
  setTimeout(() => {
    statusElement.textContent = "";
    statusElement.className = "status-message";
  }, 5000);
}

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
document.getElementById("signup-btn").addEventListener("click", async () => {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!username || !email || !password) {
    showStatus("signup-status", "Please fill all fields", true);
    return;
  }

  try {
    // Check if username already exists
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (usernameDoc.exists()) {
      showStatus("signup-status", "Username already taken", true);
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
    
    showStatus("signup-status", "Account created successfully! You can now log in.");
    
    // Clear form
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    
    // Switch to login form after successful signup
    setTimeout(() => {
      loginToggle.click();
    }, 2000);
    
  } catch (error) {
    showStatus("signup-status", `Signup error: ${error.message}`, true);
    console.error("Signup error:", error);
  }
});

// Login functionality
document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    showStatus("login-status", "Please fill all fields", true);
    return;
  }

  try {
    // Get email from username
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (!usernameDoc.exists()) {
      showStatus("login-status", "Username not found", true);
      return;
    }

    const email = usernameDoc.data().email;
    
    // Sign in with email and password
    await signInWithEmailAndPassword(auth, email, password);
    showStatus("login-status", "Login successful! Redirecting...");
    
    // Save username to session storage
    sessionStorage.setItem("currentUsername", username);
    
    // Redirect to homepage after successful login
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
    
  } catch (error) {
    showStatus("login-status", `Login failed: ${error.message}`, true);
    console.error("Login error:", error);
  }
});

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in - if we're on the login page, redirect to home
    if (window.location.pathname.includes("login.html")) {
      const username = await findUsernameByUid(user.uid) || "user";
      showStatus("login-status", `Already logged in as ${username}. Redirecting...`);
      
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1500);
    }
  }
});