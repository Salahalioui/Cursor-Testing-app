<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'

const router = useRouter()
const userProfile = ref(null)
const userMenuOpen = ref(false)

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
    { name: 'Dashboard', path: '/', icon: '📊' }
  ]

  if (userProfile.value) {
    if (userProfile.value.role === 'ADMIN') {
      items.push(
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Assignments', path: '/admin/assignments', icon: '📋' }
      )
    }

    items.push(
      { name: 'Students', path: '/students', icon: '🎓' },
      { name: 'Evaluations', path: '/evaluations', icon: '��' },
      { name: 'Reports', path: '/reports', icon: '📈' }
    )
  }

  return items
})

// User menu items
const userMenuItems = [
  { name: 'Your Profile', path: '/profile' },
  { name: 'Settings', path: '/settings' }
]

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
loadUserProfile()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full z-50 transition-all duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Left side -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Talent Evaluation</h1>
            </div>
            <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.path"
                :to="item.path"
                class="inline-flex items-center px-3 pt-1 text-sm font-medium transition-all duration-200"
                :class="[
                  $route.path === item.path
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                ]"
              >
                <span class="mr-2 text-lg">{{ item.icon }}</span>
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
                  class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-inner">
                    <span class="text-sm font-medium">
                      {{ userProfile?.name?.[0]?.toUpperCase() || '?' }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Dropdown menu -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="userMenuOpen"
                  class="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 backdrop-blur-sm"
                  role="menu"
                >
                  <div class="px-4 py-3 border-b">
                    <div class="font-medium text-gray-900">{{ userProfile?.name }}</div>
                    <div class="text-sm text-gray-500">{{ userProfile?.email }}</div>
                  </div>

                  <router-link
                    v-for="item in userMenuItems"
                    :key="item.path"
                    :to="item.path"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    role="menuitem"
                    @click="userMenuOpen = false"
                  >
                    {{ item.name }}
                  </router-link>

                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view v-slot="{ Component }">
          <transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template> 