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
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCR9uLboAOByyzfuJ64HDJ71OxyeE-6lKc",
  authDomain: "talent-evaluation-app.firebaseapp.com",
  projectId: "talent-evaluation-app",
  storageBucket: "talent-evaluation-app.firebasestorage.app",
  messagingSenderId: "366370273436",
  appId: "1:366370273436:web:6a450cb4aa74e34b1e9559"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
export const db = getFirestore(app)

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