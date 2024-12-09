import { firestoreService } from './firestoreService'
import { authService } from './firebase'

export const createAdminUser = async (email, password) => {
  try {
    // Register the user first
    const userCredential = await authService.register(email, password)
    
    // Create admin profile
    await firestoreService.createUserProfile(userCredential.user.uid, {
      email,
      displayName: 'Admin User',
      role: 'ADMIN',
      status: 'active',
    })
    
    return userCredential.user
  } catch (error) {
    console.error('Error creating admin:', error)
    throw error
  }
} 