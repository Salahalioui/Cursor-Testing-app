<script setup>
import { ref, onMounted, computed } from 'vue'
import { initDB, getAllStudents, getStudentEvaluations, getStudentById } from '@/services/db'
import { exportToPDF as generatePDF, exportToExcel as generateExcel } from '@/services/exportService'
import StudentProgressReport from './StudentProgressReport.vue'
import TeamPerformanceReport from './TeamPerformanceReport.vue'
import AdvancedAnalytics from './AdvancedAnalytics.vue'

// State
const activeTab = ref('student-progress')
const students = ref([])
const selectedStudent = ref(null)
const selectedSport = ref('')
const selectedGradeLevel = ref('')
const dateRange = ref('last-6-months')
const predictionPeriod = ref('3-months')
const loading = ref(false)
const error = ref(null)

// Add computed property for selected student ID
const selectedStudentId = computed(() => {
  return selectedStudent.value ? selectedStudent.value : null
})

// Date range options
const dateRangeOptions = [
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'all-time', label: 'All Time' }
]

// Load initial data
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // Initialize database first
    await initDB()
    // Then load students
    students.value = await getAllStudents()
  } catch (err) {
    console.error('Failed to load students:', err)
    error.value = 'Failed to load data. Please try refreshing the page.'
  } finally {
    loading.value = false
  }
})

// Filter options
const sportTypes = [
  'Football',
  'Basketball',
  'Athletics',
  'Swimming'
]

const gradeLevels = [
  'Elementary',
  'Middle School',
  'High School'
]

// Export functions
const exportToPDF = async () => {
  try {
    if (activeTab.value === 'student-progress' && selectedStudent.value) {
      // Export student progress
      const student = await getStudentById(selectedStudent.value)
      const evaluations = await getStudentEvaluations(selectedStudent.value)
      
      generatePDF({
        student,
        evaluations: evaluations.filter(evaluation => 
          (!selectedSport.value || evaluation.sportType === selectedSport.value)
        )
      }, 'student')
    } else {
      // Export team performance
      const stats = await getTeamStats()
      generatePDF({ stats }, 'team')
    }
  } catch (error) {
    console.error('Export to PDF failed:', error)
  }
}

const exportToExcel = async () => {
  try {
    if (activeTab.value === 'student-progress' && selectedStudent.value) {
      // Export student progress
      const student = await getStudentById(selectedStudent.value)
      const evaluations = await getStudentEvaluations(selectedStudent.value)
      
      generateExcel({
        student,
        evaluations: evaluations.filter(evaluation => 
          (!selectedSport.value || evaluation.sportType === selectedSport.value)
        )
      }, 'student')
    } else {
      // Export team performance
      const stats = await getTeamStats()
      generateExcel({ stats }, 'team')
    }
  } catch (error) {
    console.error('Export to Excel failed:', error)
  }
}

// Helper function to get team statistics
const getTeamStats = async () => {
  const allStudents = students.value.filter(student =>
    (!selectedGradeLevel.value || student.grade === selectedGradeLevel.value) &&
    (!selectedSport.value || student.activities.includes(selectedSport.value))
  )

  const allEvaluations = await Promise.all(
    allStudents.map(student => getStudentEvaluations(student.id))
  )

  const flatEvaluations = allEvaluations
    .flat()
    .filter(evaluation => 
      (!selectedSport.value || evaluation.sportType === selectedSport.value)
    )

  // Calculate statistics
  const stats = {
    totalStudents: allStudents.length,
    totalEvaluations: flatEvaluations.length,
    averageScore: 0,
    categoryAverages: []
  }

  // Calculate category averages
  const categories = {}
  let totalScore = 0
  let totalCriteria = 0

  flatEvaluations.forEach(evaluation => {
    Object.entries(evaluation.scores).forEach(([key, score]) => {
      const category = key.split('-')[0]
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          count: 0
        }
      }
      categories[category].total += score
      categories[category].count++
      totalScore += score
      totalCriteria++
    })
  })

  // Calculate overall average
  stats.averageScore = totalCriteria > 0 
    ? Math.round((totalScore / totalCriteria) * 10) / 10 
    : 0

  // Calculate category averages
  stats.categoryAverages = Object.entries(categories).map(([category, data]) => ({
    category,
    average: Math.round((data.total / data.count) * 10) / 10
  })).sort((a, b) => b.average - a.average)

  return stats
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
      {{ error }}
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Performance Reports</h2>
        <div class="space-x-2">
          <button
            @click="exportToPDF"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Export to PDF
          </button>
          <button
            @click="exportToExcel"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Student Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Student</label>
            <select
              v-model="selectedStudent"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Students</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }}
              </option>
            </select>
          </div>

          <!-- Sport Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Sport</label>
            <select
              v-model="selectedSport"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Sports</option>
              <option v-for="sport in sportTypes" :key="sport" :value="sport">
                {{ sport }}
              </option>
            </select>
          </div>

          <!-- Grade Level Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Grade Level</label>
            <select
              v-model="selectedGradeLevel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              <option v-for="level in gradeLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Time Period</label>
            <select
              v-model="dateRange"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option v-for="option in dateRangeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Report Tabs -->
      <div class="bg-white rounded-lg shadow">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'student-progress'"
              :class="[
                'px-6 py-3 text-sm font-medium',
                activeTab === 'student-progress'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Student Progress
            </button>
            <button
              @click="activeTab = 'team-performance'"
              :class="[
                'px-6 py-3 text-sm font-medium',
                activeTab === 'team-performance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Team Performance
            </button>
            <button
              @click="activeTab = 'analytics'"
              :class="[
                'px-6 py-3 text-sm font-medium',
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Advanced Analytics
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <StudentProgressReport
            v-if="activeTab === 'student-progress'"
            :student-id="selectedStudentId"
            :sport-type="selectedSport"
            :grade-level="selectedGradeLevel"
            :date-range="dateRange"
          />
          <TeamPerformanceReport
            v-else-if="activeTab === 'team-performance'"
            :sport-type="selectedSport"
            :grade-level="selectedGradeLevel"
            :date-range="dateRange"
          />
          <AdvancedAnalytics
            v-else-if="activeTab === 'analytics'"
            :student-id="selectedStudentId"
            :sport-type="selectedSport"
            :date-range="dateRange"
            v-model:prediction-period="predictionPeriod"
          />
        </div>
      </div>
    </template>
  </div>
</template> 