import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// Collection names
const USERS_COLLECTION = 'users'
const ROLES_COLLECTION = 'roles'
const ASSIGNMENTS_COLLECTION = 'assignments'

export const firestoreService = {
  // User Profile Management
  async createUserProfile(uid, userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      })
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }
  },

  async updateUserProfile(uid, userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }
  },

  async getUserProfile(uid) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? userSnap.data() : null
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`)
    }
  },

  // Role Management
  async assignRole(uid, role, assignments = {}) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid)
      await updateDoc(userRef, {
        role,
        assignments,
        updatedAt: serverTimestamp()
      })

      // Create role-specific assignments
      if (Object.keys(assignments).length > 0) {
        const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, uid)
        await setDoc(assignmentRef, {
          userId: uid,
          role,
          ...assignments,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      throw new Error(`Failed to assign role: ${error.message}`)
    }
  },

  async getUsersByRole(role) {
    try {
      const q = query(collection(db, USERS_COLLECTION), where("role", "==", role))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error.message}`)
    }
  },

  // Assignment Management
  async getTeacherAssignments(uid) {
    try {
      const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, uid)
      const assignmentSnap = await getDoc(assignmentRef)
      return assignmentSnap.exists() ? assignmentSnap.data() : null
    } catch (error) {
      throw new Error(`Failed to get teacher assignments: ${error.message}`)
    }
  },

  async getCoachAssignments(uid) {
    try {
      const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, uid)
      const assignmentSnap = await getDoc(assignmentRef)
      return assignmentSnap.exists() ? assignmentSnap.data() : null
    } catch (error) {
      throw new Error(`Failed to get coach assignments: ${error.message}`)
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
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`)
    }
  },

  // Bulk Operations
  async getAllActiveUsers() {
    try {
      const q = query(collection(db, USERS_COLLECTION), where("status", "==", "active"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      throw new Error(`Failed to get active users: ${error.message}`)
    }
  },

  // Role Validation
  async validateUserRole(uid, requiredRole) {
    try {
      const userProfile = await this.getUserProfile(uid)
      return userProfile?.role === requiredRole && userProfile?.status === 'active'
    } catch (error) {
      console.error(`Role validation failed: ${error.message}`)
      return false
    }
  },

  // Assignment Validation
  async validateAssignment(uid, studentId) {
    try {
      const userProfile = await this.getUserProfile(uid)
      if (!userProfile || userProfile.status !== 'active') return false

      const assignments = await this.getTeacherAssignments(uid) || await this.getCoachAssignments(uid)
      if (!assignments) return false

      // Check if the student is in the user's assigned students/teams
      return assignments.students?.includes(studentId) || 
             assignments.teams?.some(team => team.students?.includes(studentId))
    } catch (error) {
      console.error(`Assignment validation failed: ${error.message}`)
      return false
    }
  }
} 