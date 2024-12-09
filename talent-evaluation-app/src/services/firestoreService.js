import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore'
import { db } from './firebase'

// Collection names
const USERS_COLLECTION = 'users'
const ROLES_COLLECTION = 'roles'
const ASSIGNMENTS_COLLECTION = 'assignments'
const ACTIVITIES_COLLECTION = 'activities'

export const firestoreService = {
  // User Profile Management
  async createUserProfile(uid, userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      const defaultData = {
        role: 'TEACHER', // Default role
        status: 'pending', // New users start as pending
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        displayName: userData.displayName || '',
        email: userData.email || '',
        photoURL: userData.photoURL || '',
        department: '',
        bio: '',
        phone: '',
        alternativeEmail: ''
      }

      await setDoc(userRef, {
        ...defaultData,
        ...userData
      })

      // Log activity
      await this.logActivity('user_created', `New user registered: ${userData.email}`, uid)
      
      return defaultData
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }
  },

  async getUserProfile(uid) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        return null
      }
      return {
        id: userSnap.id,
        ...userSnap.data()
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw new Error(`Failed to get user profile: ${error.message}`)
    }
  },

  async updateUserProfile(uid, userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      const updateData = {
        ...userData,
        updatedAt: serverTimestamp()
      }
      await updateDoc(userRef, updateData)

      // Log activity
      await this.logActivity(
        'user_updated',
        `User profile updated: ${userData.email || uid}`,
        uid
      )

      return updateData
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error.message}`)
    }
  },

  // Activity Logging
  async logActivity(type, description, userId) {
    try {
      const activitiesRef = collection(db, ACTIVITIES_COLLECTION)
      await addDoc(activitiesRef, {
        type,
        description,
        userId,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error to prevent disrupting the main flow
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const usersRef = collection(db, USERS_COLLECTION)
      const snapshot = await getDocs(usersRef)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error(`Failed to get all users: ${error.message}`)
    }
  },

  // Get recent activities (admin only)
  async getRecentActivities(limitCount = 10) {
    try {
      const activitiesRef = collection(db, ACTIVITIES_COLLECTION)
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw new Error(`Failed to get recent activities: ${error.message}`)
    }
  },

  // Role Management
  async assignRole(uid, role) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp()
      })

      // Log activity
      await this.logActivity(
        'role_assigned',
        `User role updated to ${role}`,
        uid
      )
    } catch (error) {
      console.error('Error assigning role:', error)
      throw new Error(`Failed to assign role: ${error.message}`)
    }
  },

  // User Status Management
  async updateUserStatus(uid, status) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp()
      })

      // Log activity
      await this.logActivity(
        'status_updated',
        `User status updated to ${status}`,
        uid
      )
    } catch (error) {
      console.error('Error updating user status:', error)
      throw new Error(`Failed to update user status: ${error.message}`)
    }
  }
} 