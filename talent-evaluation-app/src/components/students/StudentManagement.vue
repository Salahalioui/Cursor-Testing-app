<script setup>
import { ref, onMounted, computed } from 'vue'
import { initDB, getAllStudents, addStudent, updateStudent, deleteStudent } from '@/services/db'
import AddStudentForm from './AddStudentForm.vue'
import StudentEvaluation from '../evaluations/StudentEvaluation.vue'
import Notification from '@/components/common/Notification.vue'

// Student interface
const studentData = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const studentsPerPage = 10
const sortField = ref('name')
const sortDirection = ref('asc')
const showAddForm = ref(false)
const editingStudent = ref(null)

// Evaluation state
const showEvaluation = ref(false)
const selectedStudentId = ref(null)

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Initialize DB and load students
onMounted(async () => {
  try {
    await initDB()
    await loadStudents()
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
})

const loadStudents = async () => {
  try {
    studentData.value = await getAllStudents()
  } catch (error) {
    console.error('Failed to load students:', error)
  }
}

// Computed properties for filtered and sorted students
const filteredStudents = computed(() => {
  return studentData.value.filter(student => 
    student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    student.grade.toString().includes(searchQuery.value) ||
    student.activities.some(activity => 
      activity.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
})

const sortedStudents = computed(() => {
  return [...filteredStudents.value].sort((a, b) => {
    const aValue = a[sortField.value]
    const bValue = b[sortField.value]
    const modifier = sortDirection.value === 'asc' ? 1 : -1
    
    return aValue > bValue ? modifier : -modifier
  })
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * studentsPerPage
  const end = start + studentsPerPage
  return sortedStudents.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredStudents.value.length / studentsPerPage)
)

// Methods for sorting and navigation
const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const changePage = (page) => {
  currentPage.value = page
}

// Student CRUD operations
const handleDeleteStudent = async (id) => {
  if (confirm('Are you sure you want to delete this student?')) {
    try {
      await deleteStudent(id)
      await loadStudents()
      showNotification('Student deleted successfully', 'success')
    } catch (error) {
      showNotification('Failed to delete student', 'error')
    }
  }
}

const handleAddStudent = async (studentData) => {
  try {
    await addStudent(studentData)
    await loadStudents()
    showAddForm.value = false
    showNotification('Student added successfully', 'success')
  } catch (error) {
    showNotification(error.message || 'Failed to add student', 'error')
  }
}

// Evaluation handlers
const handleEvaluateStudent = (student) => {
  selectedStudentId.value = student.id
  showEvaluation.value = true
}

const handleCloseEvaluation = () => {
  showEvaluation.value = false
  selectedStudentId.value = null
}

// Notification handler
const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  }
}

const hideNotification = () => {
  notification.value.show = false
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Bar -->
    <div class="flex justify-between items-center">
      <div class="relative flex-1 max-w-md">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search students..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        @click="showAddForm = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add New Student
      </button>
    </div>

    <!-- Students Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="header in ['ID', 'Name', 'Grade', 'Gender', 'Activities', 'Actions']"
              :key="header"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              @click="toggleSort(header.toLowerCase())"
            >
              {{ header }}
              <span v-if="sortField === header.toLowerCase()" class="ml-1">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="student in paginatedStudents" :key="student.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ student.studentId }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ student.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ student.grade }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ student.gender }}</td>
            <td class="px-6 py-4">
              <span
                v-for="activity in student.activities"
                :key="activity"
                class="inline-block px-2 py-1 mr-1 mb-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {{ activity }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="handleEvaluateStudent(student)"
                class="text-blue-600 hover:text-blue-900"
              >
                Evaluate
              </button>
              <button 
                @click="handleDeleteStudent(student.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="paginatedStudents.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
              No students found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ (currentPage - 1) * studentsPerPage + 1 }}</span>
            to
            <span class="font-medium">
              {{ Math.min(currentPage * studentsPerPage, filteredStudents.length) }}
            </span>
            of
            <span class="font-medium">{{ filteredStudents.length }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage === page
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Add Student Form Modal -->
    <AddStudentForm
      :is-open="showAddForm"
      @close="showAddForm = false"
      @save="handleAddStudent"
    />

    <!-- Student Evaluation Modal -->
    <div v-if="showEvaluation && selectedStudentId" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto">
      <div class="min-h-screen px-4 text-center">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal content -->
        <div class="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Student Evaluation</h3>
            <button
              @click="handleCloseEvaluation"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <div class="p-6">
            <StudentEvaluation
              :student-id="selectedStudentId"
              @close="handleCloseEvaluation"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <Notification
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
  </div>
</template> 