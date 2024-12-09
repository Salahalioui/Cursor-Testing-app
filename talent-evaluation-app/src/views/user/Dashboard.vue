<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'

const user = ref(null)
const recentEvaluations = ref([])
const loading = ref(true)
const error = ref(null)

const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const [userProfile, evaluations] = await Promise.all([
        firestoreService.getUserProfile(currentUser.uid),
        firestoreService.getRecentEvaluations(currentUser.uid, 5)
      ])
      
      user.value = userProfile
      recentEvaluations.value = evaluations
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboardData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-sm text-gray-700">
          Welcome back{{ user?.displayName ? `, ${user.displayName}` : '' }}!
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading dashboard data...</p>
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

    <div v-else>
      <!-- Quick Actions -->
      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <router-link
          v-for="action in [
            { name: 'View Students', path: '/dashboard/students', icon: '🎓' },
            { name: 'Create Evaluation', path: '/dashboard/evaluations', icon: '📝' },
            { name: 'View Reports', path: '/dashboard/reports', icon: '📈' }
          ]"
          :key="action.path"
          :to="action.path"
          class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
        >
          <div class="flex-shrink-0 text-2xl">{{ action.icon }}</div>
          <div class="flex-1 min-w-0">
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">{{ action.name }}</p>
          </div>
        </router-link>
      </div>

      <!-- Recent Evaluations -->
      <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Evaluations</h3>
        </div>
        <div class="border-t border-gray-200">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-if="recentEvaluations.length === 0" class="px-4 py-4 sm:px-6">
              <p class="text-sm text-gray-500">No recent evaluations found.</p>
            </li>
            <li
              v-for="evaluation in recentEvaluations"
              :key="evaluation.id"
              class="px-4 py-4 sm:px-6 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-blue-600 truncate">
                  {{ evaluation.title }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': evaluation.status === 'completed',
                      'bg-yellow-100 text-yellow-800': evaluation.status === 'in_progress',
                      'bg-gray-100 text-gray-800': evaluation.status === 'pending'
                    }"
                  >
                    {{ evaluation.status }}
                  </p>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    {{ evaluation.studentName }}
                  </p>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {{ new Date(evaluation.date).toLocaleDateString() }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template> 