<script setup>
import { ref, onMounted, computed } from 'vue'
import { firestoreService } from '@/services/firestoreService'

const loading = ref(true)
const error = ref(null)
const users = ref([])
const recentActivities = ref([])

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Load users and recent activities
    const [usersList, activities] = await Promise.all([
      firestoreService.getAllUsers(),
      firestoreService.getRecentActivities(5) // Get last 5 activities
    ])
    
    users.value = usersList
    recentActivities.value = activities
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Computed statistics
const stats = computed(() => {
  const totalUsers = users.value.length
  const activeUsers = users.value.filter(u => u.status === 'active').length
  const pendingUsers = users.value.filter(u => u.status === 'pending').length
  
  return {
    totalUsers,
    activeUsers,
    pendingUsers
  }
})

// Load data on mount
onMounted(loadDashboardData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-sm text-gray-700">
          Overview of system statistics and recent activities.
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
      <!-- Stats Grid -->
      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <!-- Total Users -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Users
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ stats.totalUsers }}
            </dd>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Active Users
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">
              {{ stats.activeUsers }}
            </dd>
          </div>
        </div>

        <!-- Pending Users -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Pending Approvals
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-yellow-600">
              {{ stats.pendingUsers }}
            </dd>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <router-link
              to="/admin/users"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Manage Users
            </router-link>
            <router-link
              to="/admin/assignments"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Manage Assignments
            </router-link>
            <router-link
              to="/admin/reports"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Reports
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Activities</h3>
          <div class="mt-6 flow-root">
            <ul role="list" class="-mb-8">
              <li v-for="(activity, index) in recentActivities" :key="activity.id">
                <div class="relative pb-8">
                  <span
                    v-if="index !== recentActivities.length - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        :class="[
                          activity.type === 'user_created' ? 'bg-green-500' :
                          activity.type === 'user_updated' ? 'bg-blue-500' :
                          'bg-gray-500',
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                        ]"
                      >
                        <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ activity.description }}
                        </p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time :datetime="activity.timestamp">{{ new Date(activity.timestamp).toLocaleDateString() }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 