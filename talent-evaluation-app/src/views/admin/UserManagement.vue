<script setup>
import { ref, onMounted } from 'vue'
import { firestoreService } from '@/services/firestoreService'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')

// User being edited
const editingUser = ref(null)
const showEditModal = ref(false)

// Load users
const loadUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const usersList = await firestoreService.getAllUsers()
    users.value = usersList
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Filtered users
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = searchQuery.value === '' || 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value
    const matchesStatus = statusFilter.value === 'all' || user.status === statusFilter.value
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

// Update user status
const updateUserStatus = async (userId, newStatus) => {
  try {
    await firestoreService.updateUserProfile(userId, { status: newStatus })
    await loadUsers() // Reload users
  } catch (err) {
    error.value = err.message
  }
}

// Update user role
const updateUserRole = async (userId, newRole) => {
  try {
    await firestoreService.updateUserProfile(userId, { role: newRole })
    await loadUsers() // Reload users
  } catch (err) {
    error.value = err.message
  }
}

// Edit user
const startEditing = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const saveUserEdit = async () => {
  try {
    await firestoreService.updateUserProfile(editingUser.value.id, editingUser.value)
    showEditModal.value = false
    await loadUsers() // Reload users
  } catch (err) {
    error.value = err.message
  }
}

// Load users on mount
onMounted(loadUsers)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage user accounts, roles, and permissions.
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Search -->
      <div>
        <label for="search" class="sr-only">Search users</label>
        <input
          id="search"
          type="search"
          v-model="searchQuery"
          placeholder="Search users..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
      </div>

      <!-- Role Filter -->
      <div>
        <select
          v-model="roleFilter"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="COACH">Coach</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <select
          v-model="statusFilter"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="mt-8 flex flex-col">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="loading" class="animate-pulse">
                  <td colspan="5" class="py-4 text-center text-sm text-gray-500">
                    Loading users...
                  </td>
                </tr>
                <tr v-else-if="error" class="bg-red-50">
                  <td colspan="5" class="py-4 text-center text-sm text-red-500">
                    {{ error }}
                  </td>
                </tr>
                <tr v-else-if="filteredUsers.length === 0" class="bg-gray-50">
                  <td colspan="5" class="py-4 text-center text-sm text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ user.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      v-model="user.role"
                      @change="updateUserRole(user.id, $event.target.value)"
                      class="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="COACH">Coach</option>
                    </select>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800',
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold'
                      ]"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="startEditing(user)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      v-if="user.status === 'active'"
                      @click="updateUserStatus(user.id, 'inactive')"
                      class="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                    <button
                      v-else
                      @click="updateUserStatus(user.id, 'active')"
                      class="text-green-600 hover:text-green-900"
                    >
                      Activate
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              v-model="editingUser.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              v-model="editingUser.department"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              v-model="editingUser.phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveUserEdit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 