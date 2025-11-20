// ===================================
// Firebase Authentication
// ===================================

import { auth } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// DOM Elements
const googleLoginBtn = document.getElementById('google-login-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileImage = document.getElementById('profile-image');
const userPoints = document.getElementById('user-points');
const loginModal = document.getElementById('login-modal');

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        console.log('User signed in:', user.displayName);
        
        // Close login modal
        closeLoginModal();
        
        // Show success message (optional)
        showNotification('Welcome back, ' + user.displayName + '!', 'success');
        
    } catch (error) {
        console.error('Error signing in:', error);
        let errorMessage = 'Failed to sign in. Please try again.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in was cancelled.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection.';
        }
        
        showNotification(errorMessage, 'error');
    }
}

// Sign out
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('User signed out');
        showNotification('You have been logged out.', 'info');
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Failed to log out. Please try again.', 'error');
    }
}

// Update UI based on auth state
function updateUI(user) {
    if (user) {
        // User is signed in
        console.log('User is authenticated:', user.displayName);
        
        // Update login button to show user name
        if (loginBtn) {
            loginBtn.innerHTML = `
                <img src="${user.photoURL || '/img/default-avatar.png'}" 
                     alt="${user.displayName}" 
                     style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
                <span>${user.displayName.split(' ')[0]}</span>
            `;
            loginBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            loginBtn.style.backdropFilter = 'blur(10px)';
            loginBtn.style.color = '#fff';
        }
        
        // Update profile dropdown
        if (profileName) profileName.textContent = user.displayName;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileImage) profileImage.src = user.photoURL || '/img/default-avatar.png';
        
        // Set random points for demo (replace with actual points from database later)
        const points = Math.floor(Math.random() * 1000) + 100;
        if (userPoints) userPoints.textContent = points;
        
        // Add click event to show profile dropdown
        if (loginBtn && userProfile) {
            loginBtn.onclick = toggleProfileDropdown;
        }
        
    } else {
        // User is signed out
        console.log('No user authenticated');
        
        // Reset login button
        if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Login</span>
            `;
            loginBtn.style.background = 'linear-gradient(135deg, #d4af37 0%, #f4e4c1 100%)';
            loginBtn.style.color = '#1a0f5c';
            loginBtn.onclick = openLoginModal;
        }
        
        // Hide profile dropdown
        if (userProfile) {
            userProfile.style.display = 'none';
        }
    }
}

// Toggle profile dropdown
function toggleProfileDropdown(e) {
    e.stopPropagation();
    if (userProfile) {
        const isVisible = userProfile.style.display === 'block';
        userProfile.style.display = isVisible ? 'none' : 'block';
    }
}

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (userProfile && 
        userProfile.style.display === 'block' && 
        !userProfile.contains(e.target) && 
        e.target !== loginBtn) {
        userProfile.style.display = 'none';
    }
});

// Helper Functions
function openLoginModal() {
    if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to document
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Event Listeners
googleLoginBtn?.addEventListener('click', signInWithGoogle);
logoutBtn?.addEventListener('click', signOutUser);

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Export functions for use in other files
export { signInWithGoogle, signOutUser };
