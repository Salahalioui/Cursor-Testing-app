import { initializeApp } from 'firebase/app'
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Authentication service
export const authService = {
  // Register new user
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(userCredential.user)
      return userCredential.user
    } catch (error) {
      throw new Error(error.message)
    }
  },

  // Sign in user
  async login(email, password, rememberMe = false) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (rememberMe) {
        await auth.setPersistence('LOCAL')
      } else {
        await auth.setPersistence('SESSION')
      }
      return userCredential.user
    } catch (error) {
      throw new Error(error.message)
    }
  },

  // Sign out user
  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Subscribe to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  }
}

export default auth 