<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '@/services/firebase'

const user = ref(null)

onMounted(async () => {
  user.value = authService.getCurrentUser()
})
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

    <!-- Dashboard Content -->
    <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Quick Actions -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div class="mt-4 space-y-2">
            <router-link
              to="/students"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Manage Students
            </router-link>
            <router-link
              to="/evaluations"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Create Evaluation
            </router-link>
            <router-link
              to="/reports"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              View Reports
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p class="mt-4 text-sm text-gray-500">
            No recent activity to display.
          </p>
        </div>
      </div>

      <!-- System Status -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <h3 class="text-lg font-medium text-gray-900">System Status</h3>
          <div class="mt-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-2.5 w-2.5 rounded-full bg-green-400"></div>
              </div>
              <p class="ml-2 text-sm text-gray-500">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 