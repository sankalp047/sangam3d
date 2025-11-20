// ===================================
// Firebase Configuration
// ===================================

// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAN8Qm0z1X9VVlo7rLNz8qTZtWNB3Hf-9Q",
    authDomain: "radiosangam-da24d.firebaseapp.com",
    projectId: "radiosangam-da24d",
    storageBucket: "radiosangam-da24d.firebasestorage.app",
    messagingSenderId: "924482851867",
    appId: "1:924482851867:web:81d162dfffb761c47354be",
    measurementId: "G-0PJG3HSQ53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export for use in other files
export { app, auth, analytics };
