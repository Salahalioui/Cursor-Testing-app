import { openDB } from 'idb'

const DB_NAME = 'talentEvalDB'
const USER_STORE = 'users'
const ACTIVITY_STORE = 'activities'
const DB_VERSION = 1

// Role definitions with their permissions
export const ROLES = {
  ADMIN: {
    name: 'Administrator',
    permissions: ['manage_users', 'manage_roles', 'view_all', 'edit_all', 'manage_templates']
  },
  TEACHER: {
    name: 'Teacher',
    permissions: ['view_assigned', 'edit_assigned', 'view_templates']
  },
  COACH: {
    name: 'Coach',
    permissions: ['view_sport', 'edit_sport', 'view_templates']
  }
}

// Initialize the database
const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'uid' })
        userStore.createIndex('email', 'email', { unique: true })
        userStore.createIndex('role', 'role')
      }

      // Activity logs store
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) {
        const activityStore = db.createObjectStore(ACTIVITY_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        activityStore.createIndex('userId', 'userId')
        activityStore.createIndex('timestamp', 'timestamp')
      }
    }
  })
  return db
}

// User management service
export const userManagementService = {
  // Create or update user profile
  async upsertUser(userData) {
    const db = await initDB()
    try {
      await db.put(USER_STORE, {
        ...userData,
        updatedAt: new Date().toISOString()
      })
      await this.logActivity(userData.uid, 'profile_update')
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }
  },

  // Get user profile by ID
  async getUserProfile(uid) {
    const db = await initDB()
    try {
      return await db.get(USER_STORE, uid)
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`)
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    const db = await initDB()
    try {
      return await db.getAll(USER_STORE)
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`)
    }
  },

  // Update user role
  async updateUserRole(uid, role, assignments = {}) {
    const db = await initDB()
    try {
      const user = await this.getUserProfile(uid)
      if (!user) throw new Error('User not found')

      user.role = role
      user.assignments = assignments
      user.updatedAt = new Date().toISOString()

      await db.put(USER_STORE, user)
      await this.logActivity(uid, 'role_update', { newRole: role })
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`)
    }
  },

  // Check if user has permission
  async hasPermission(uid, permission) {
    try {
      const user = await this.getUserProfile(uid)
      if (!user || !user.role) return false

      const rolePermissions = ROLES[user.role]?.permissions || []
      return rolePermissions.includes(permission)
    } catch (error) {
      console.error(`Permission check failed: ${error.message}`)
      return false
    }
  },

  // Log user activity
  async logActivity(userId, action, details = {}) {
    const db = await initDB()
    try {
      await db.add(ACTIVITY_STORE, {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Failed to log activity: ${error.message}`)
    }
  },

  // Get user activities (for audit log)
  async getUserActivities(userId, limit = 50) {
    const db = await initDB()
    try {
      const tx = db.transaction(ACTIVITY_STORE, 'readonly')
      const index = tx.store.index('userId')
      const activities = await index.getAll(userId)
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
    } catch (error) {
      throw new Error(`Failed to get user activities: ${error.message}`)
    }
  },

  // Deactivate user
  async deactivateUser(uid) {
    const db = await initDB()
    try {
      const user = await this.getUserProfile(uid)
      if (!user) throw new Error('User not found')

      user.status = 'inactive'
      user.updatedAt = new Date().toISOString()

      await db.put(USER_STORE, user)
      await this.logActivity(uid, 'account_deactivated')
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`)
    }
  },

  // Activate user
  async activateUser(uid) {
    const db = await initDB()
    try {
      const user = await this.getUserProfile(uid)
      if (!user) throw new Error('User not found')

      user.status = 'active'
      user.updatedAt = new Date().toISOString()

      await db.put(USER_STORE, user)
      await this.logActivity(uid, 'account_activated')
    } catch (error) {
      throw new Error(`Failed to activate user: ${error.message}`)
    }
  }
} 