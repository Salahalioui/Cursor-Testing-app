<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/firebase'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)

const validateEmail = () => {
  if (!email.value) return 'Email is required'
  if (!/\S+@\S+\.\S+/.test(email.value)) return 'Invalid email format'
  return null
}

const handleResetPassword = async () => {
  error.value = validateEmail()
  if (error.value) return

  loading.value = true
  try {
    await authService.resetPassword(email.value)
    success.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleBackToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <a 
            href="#" 
            @click.prevent="handleBackToLogin"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            return to sign in
          </a>
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              Password reset email sent
            </h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Please check your email for instructions to reset your password.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
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

        <div>
          <label for="email-address" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email address"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg 
              v-if="loading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Sending reset instructions...' : 'Reset password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 