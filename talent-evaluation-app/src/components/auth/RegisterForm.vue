<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'
import { ROLES } from '@/services/userManagement'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const role = ref('TEACHER') // Default role
const loading = ref(false)
const error = ref(null)

const validateForm = () => {
  if (!email.value) return 'Email is required'
  if (!password.value) return 'Password is required'
  if (password.value.length < 6) return 'Password must be at least 6 characters'
  if (password.value !== confirmPassword.value) return 'Passwords do not match'
  if (!name.value) return 'Name is required'
  if (!/\S+@\S+\.\S+/.test(email.value)) return 'Invalid email format'
  return null
}

const handleRegister = async () => {
  error.value = validateForm()
  if (error.value) return

  loading.value = true
  try {
    // Create Firebase auth user
    const user = await authService.register(email.value, password.value)

    // Create user profile in Firestore
    await firestoreService.createUserProfile(user.uid, {
      email: email.value,
      name: name.value,
      role: role.value,
      status: 'pending', // New users start as pending until approved by admin
      createdAt: new Date().toISOString()
    })

    // Show success message and redirect to login
    alert('Registration successful! Please verify your email and wait for admin approval.')
    router.push('/auth/login')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link 
            to="/auth/login" 
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </router-link>
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Error Alert -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div class="rounded-md shadow-sm space-y-4">
          <!-- Name Input -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="John Doe"
            >
          </div>

          <!-- Email Input -->
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="john@example.com"
            >
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
            >
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
            >
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              v-model="role"
              name="role"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="TEACHER">Teacher</option>
              <option value="COACH">Coach</option>
            </select>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg 
                v-if="!loading"
                class="h-5 w-5 text-blue-500 group-hover:text-blue-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <svg 
                v-else
                class="animate-spin h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 