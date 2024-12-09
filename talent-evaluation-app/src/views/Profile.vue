<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'

const user = ref(null)
const loading = ref(true)
const error = ref(null)
const success = ref(false)
const isEditing = ref(false)

// Form fields
const formData = ref({
  name: '',
  email: '',
  phone: '',
  alternativeEmail: '',
  department: '',
  // Role-specific fields
  assignedGrades: [],
  assignedSports: [],
  bio: ''
})

// Available options
const gradeOptions = [
  'Elementary',
  'Middle School',
  'High School'
]

const sportOptions = [
  'Football',
  'Basketball',
  'Athletics',
  'Swimming'
]

// Load user profile
const loadUserProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      error.value = 'No user found'
      return
    }

    const profile = await firestoreService.getUserProfile(currentUser.uid)
    user.value = profile
    
    // Populate form data
    formData.value = {
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      alternativeEmail: profile.alternativeEmail || '',
      department: profile.department || '',
      assignedGrades: profile.assignedGrades || [],
      assignedSports: profile.assignedSports || [],
      bio: profile.bio || ''
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  loading.value = true
  error.value = null
  success.value = false

  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) throw new Error('No user found')

    await firestoreService.updateUserProfile(currentUser.uid, {
      ...formData.value,
      updatedAt: new Date().toISOString()
    })

    success.value = true
    isEditing.value = false
    await loadUserProfile() // Reload profile
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Toggle edit mode
const startEditing = () => {
  isEditing.value = true
  success.value = false
}

const cancelEditing = () => {
  isEditing.value = false
  loadUserProfile() // Reset form data
}

// Load profile on mount
onMounted(loadUserProfile)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Profile Settings
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-else-if="success" class="rounded-md bg-green-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              Profile updated successfully
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <form v-else @submit.prevent="updateProfile" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Basic Information
            </h3>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <!-- Name -->
              <div class="sm:col-span-3">
                <label for="name" class="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div class="mt-1">
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    :readonly="!isEditing"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'bg-gray-50': !isEditing }"
                  >
                </div>
              </div>

              <!-- Email -->
              <div class="sm:col-span-3">
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div class="mt-1">
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    readonly
                    class="shadow-sm bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                </div>
              </div>

              <!-- Phone -->
              <div class="sm:col-span-3">
                <label for="phone" class="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div class="mt-1">
                  <input
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    :readonly="!isEditing"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'bg-gray-50': !isEditing }"
                  >
                </div>
              </div>

              <!-- Alternative Email -->
              <div class="sm:col-span-3">
                <label for="alt-email" class="block text-sm font-medium text-gray-700">
                  Alternative Email
                </label>
                <div class="mt-1">
                  <input
                    id="alt-email"
                    v-model="formData.alternativeEmail"
                    type="email"
                    :readonly="!isEditing"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'bg-gray-50': !isEditing }"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role-Specific Information -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Role Information
            </h3>
            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <!-- Department -->
              <div class="sm:col-span-3">
                <label for="department" class="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div class="mt-1">
                  <input
                    id="department"
                    v-model="formData.department"
                    type="text"
                    :readonly="!isEditing"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'bg-gray-50': !isEditing }"
                  >
                </div>
              </div>

              <!-- Role-specific fields based on user role -->
              <template v-if="user?.role === 'TEACHER'">
                <!-- Assigned Grades -->
                <div class="sm:col-span-6">
                  <label class="block text-sm font-medium text-gray-700">
                    Assigned Grade Levels
                  </label>
                  <div class="mt-2 space-y-2">
                    <div 
                      v-for="grade in gradeOptions" 
                      :key="grade"
                      class="relative flex items-start"
                    >
                      <div class="flex items-center h-5">
                        <input
                          :id="'grade-' + grade"
                          v-model="formData.assignedGrades"
                          :value="grade"
                          type="checkbox"
                          :disabled="!isEditing"
                          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        >
                      </div>
                      <div class="ml-3 text-sm">
                        <label :for="'grade-' + grade" class="font-medium text-gray-700">
                          {{ grade }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="user?.role === 'COACH'">
                <!-- Assigned Sports -->
                <div class="sm:col-span-6">
                  <label class="block text-sm font-medium text-gray-700">
                    Assigned Sports
                  </label>
                  <div class="mt-2 space-y-2">
                    <div 
                      v-for="sport in sportOptions" 
                      :key="sport"
                      class="relative flex items-start"
                    >
                      <div class="flex items-center h-5">
                        <input
                          :id="'sport-' + sport"
                          v-model="formData.assignedSports"
                          :value="sport"
                          type="checkbox"
                          :disabled="!isEditing"
                          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        >
                      </div>
                      <div class="ml-3 text-sm">
                        <label :for="'sport-' + sport" class="font-medium text-gray-700">
                          {{ sport }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Bio -->
              <div class="sm:col-span-6">
                <label for="bio" class="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div class="mt-1">
                  <textarea
                    id="bio"
                    v-model="formData.bio"
                    rows="4"
                    :readonly="!isEditing"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'bg-gray-50': !isEditing }"
                  ></textarea>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Write a few sentences about yourself.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div v-if="isEditing" class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelEditing"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 