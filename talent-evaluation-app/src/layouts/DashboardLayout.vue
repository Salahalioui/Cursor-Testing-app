<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'

const router = useRouter()
const userProfile = ref(null)
const userMenuOpen = ref(false)
const sidebarOpen = ref(false)

// Load user profile
const loadUserProfile = async () => {
  try {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      userProfile.value = await firestoreService.getUserProfile(currentUser.uid)
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}

// Navigation items based on user role
const navigation = computed(() => {
  const items = [
    { name: 'Dashboard', path: userProfile.value?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', icon: '📊' }
  ]

  if (userProfile.value) {
    if (userProfile.value.role === 'ADMIN') {
      items.push(
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Assignments', path: '/admin/assignments', icon: '📋' }
      )
    }

    items.push(
      { name: 'Students', path: '/dashboard/students', icon: '🎓' },
      { name: 'Evaluations', path: '/dashboard/evaluations', icon: '📝' },
      { name: 'Reports', path: '/dashboard/reports', icon: '📈' }
    )
  }

  return items
})

// Handle logout
const handleLogout = async () => {
  try {
    await authService.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Load profile on mount
onMounted(loadUserProfile)
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Left side -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Talent Evaluation</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.path"
                :to="item.path"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[
                  $route.path === item.path
                    ? 'border-b-2 border-blue-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                <span class="mr-2">{{ item.icon }}</span>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center">
            <!-- Profile dropdown -->
            <div class="ml-3 relative">
              <div>
                <button
                  @click="userMenuOpen = !userMenuOpen"
                  class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
                      {{ userProfile?.displayName?.[0]?.toUpperCase() || '?' }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Dropdown menu -->
              <div
                v-if="userMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                role="menu"
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b">
                  <div class="font-medium">{{ userProfile?.displayName }}</div>
                  <div class="text-gray-500">{{ userProfile?.email }}</div>
                </div>

                <router-link
                  to="/dashboard/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  @click="userMenuOpen = false"
                >
                  Your Profile
                </router-link>

                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile menu -->
    <div class="sm:hidden" v-if="sidebarOpen">
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="block pl-3 pr-4 py-2 text-base font-medium"
          :class="[
            $route.path === item.path
              ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
              : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="sidebarOpen = false"
        >
          <span class="mr-2">{{ item.icon }}</span>
          {{ item.name }}
        </router-link>
      </div>
    </div>

    <!-- Page Content -->
    <main>
      <router-view></router-view>
    </main>
  </div>
</template> 