<script setup>
import { ref, onMounted } from 'vue'
import { firestoreService } from '@/services/firestoreService'

const loading = ref(true)
const error = ref(null)
const teachers = ref([])
const coaches = ref([])
const students = ref([])
const assignments = ref([])

// Load data
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [allUsers, allStudents, allAssignments] = await Promise.all([
      firestoreService.getAllUsers(),
      firestoreService.getAllStudents(),
      firestoreService.getAllAssignments()
    ])
    
    // Filter users by role
    teachers.value = allUsers.filter(user => user.role === 'TEACHER')
    coaches.value = allUsers.filter(user => user.role === 'COACH')
    students.value = allStudents
    assignments.value = allAssignments
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Create assignment
const createAssignment = async (data) => {
  try {
    await firestoreService.createAssignment(data)
    await loadData() // Reload data
  } catch (err) {
    error.value = err.message
  }
}

// Delete assignment
const deleteAssignment = async (assignmentId) => {
  try {
    await firestoreService.deleteAssignment(assignmentId)
    await loadData() // Reload data
  } catch (err) {
    error.value = err.message
  }
}

// Load data on mount
onMounted(loadData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Assignment Management</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage teacher and coach assignments to students.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading assignments...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mt-8 rounded-md bg-red-50 p-4">
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

    <div v-else class="mt-8">
      <!-- Current Assignments -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Current Assignments</h3>
        </div>
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="assignment in assignments" :key="assignment.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ assignment.teacherName || assignment.coachName }}
                </p>
                <p class="text-sm text-gray-500">
                  Assigned to {{ assignment.students.length }} student(s)
                </p>
              </div>
              <button
                @click="deleteAssignment(assignment.id)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create New Assignment -->
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Create New Assignment
          </h3>
          <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Form fields will go here -->
            <p class="sm:col-span-6 text-sm text-gray-500">
              Assignment creation form will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 