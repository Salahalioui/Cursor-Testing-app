<script setup>
import { authService } from '@/services/firebase'

const handleLogout = async () => {
  try {
    await authService.logout()
    window.location.href = '/auth/login'
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Pending Approval
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Your account is currently pending administrator approval.
          Please check back later or contact support for assistance.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">What happens next?</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  1. An administrator will review your account details
                </p>
                <p class="text-sm text-gray-500">
                  2. You'll receive an email when your account is approved
                </p>
                <p class="text-sm text-gray-500">
                  3. You can then log in and access the system
                </p>
              </div>
            </div>

            <div>
              <button
                @click="handleLogout"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 