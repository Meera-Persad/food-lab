// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
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

// Create and add Auth UI elements
function createAuthUI() {
  // Create the nav link container
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-container';
  authContainer.style.display = 'flex';
  authContainer.style.alignItems = 'center';
  
  // Add to navigation
  const navLinks = document.getElementById('navLinks');
  
  // Check if the navigation exists
  if (navLinks) {
    navLinks.appendChild(authContainer);
    
    // Update UI based on auth state
    updateAuthUI(authContainer);
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      updateAuthUI(authContainer, user);
    });
  }
}

// Update Auth UI based on authentication state
async function updateAuthUI(container, user) {
  // Clear existing content
  container.innerHTML = '';
  
  if (user) {
    // User is signed in
    const username = await findUsernameByUid(user.uid) || sessionStorage.getItem("currentUsername") || "User";
    
    // Create welcome text
    const welcomeText = document.createElement('span');
    welcomeText.textContent = `Hi, ${username}`;
    welcomeText.style.color = 'white';
    welcomeText.style.marginRight = '10px';
    
    // Create logout button styled as link
    const logoutLink = document.createElement('a');
    logoutLink.textContent = 'Log Out';
    logoutLink.href = '#';
    logoutLink.style.color = 'white';
    logoutLink.style.textDecoration = 'none';
    logoutLink.style.padding = '5px 10px';
    logoutLink.style.borderRadius = '20px';
    logoutLink.style.backgroundColor = '#283618';
    logoutLink.style.fontSize = '0.9rem';
    
    // Add hover effect
    logoutLink.addEventListener('mouseover', () => {
      logoutLink.style.backgroundColor = '#FEFAE0';
      logoutLink.style.color = '#BC6C25';
    });
    
    logoutLink.addEventListener('mouseout', () => {
      logoutLink.style.backgroundColor = '#283618';
      logoutLink.style.color = 'white';
    });
    
    // Add logout functionality
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
        // Remove username from session storage
        sessionStorage.removeItem("currentUsername");
        // Redirect to home page
        window.location.href = '/index.html';
      }).catch((error) => {
        console.error("Error signing out:", error);
      });
    });
    
    // Add elements to container
    container.appendChild(welcomeText);
    container.appendChild(logoutLink);
  } else {
    // User is signed out - show login/signup link
    const loginLink = document.createElement('a');
    loginLink.textContent = 'Login / Sign Up';
    loginLink.href = '/login.html';
    loginLink.style.color = 'white';
    loginLink.style.textDecoration = 'none';
    loginLink.style.padding = '5px 10px';
    loginLink.style.borderRadius = '20px';
    loginLink.style.backgroundColor = '#BC6C25';
    loginLink.style.fontSize = '0.9rem';
    
    // Add hover effect
    loginLink.addEventListener('mouseover', () => {
      loginLink.style.backgroundColor = '#FEFAE0';
      loginLink.style.color = '#BC6C25';
    });
    
    loginLink.addEventListener('mouseout', () => {
      loginLink.style.backgroundColor = '#BC6C25';
      loginLink.style.color = 'white';
    });
    
    // Add to container
    container.appendChild(loginLink);
  }
}

// Initialize the auth UI when DOM content is loaded
document.addEventListener('DOMContentLoaded', createAuthUI);

// Export functions to be available globally
window.userLogout = () => {
  signOut(auth).then(() => {
    console.log("User signed out");
    window.location.href = '/index.html';
  }).catch((error) => {
    console.error("Error signing out:", error);
  });
};