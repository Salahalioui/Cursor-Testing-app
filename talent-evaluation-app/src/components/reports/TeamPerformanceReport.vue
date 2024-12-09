<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getAllStudents, getStudentEvaluations } from '@/services/db'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  sportType: {
    type: String,
    default: ''
  },
  gradeLevel: {
    type: String,
    default: ''
  },
  dateRange: {
    type: String,
    default: 'last-6-months'
  }
})

// State
const students = ref([])
const evaluations = ref([])
const loading = ref(false)

// Chart data
const performanceChartData = ref({
  labels: [],
  datasets: []
})

const performanceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 5
    }
  },
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: true,
      text: 'Team Performance by Category'
    }
  }
}

// Load data
watch([() => props.sportType, () => props.gradeLevel, () => props.dateRange], async () => {
  await loadTeamData()
}, { immediate: true })

const loadTeamData = async () => {
  loading.value = true
  try {
    const allStudents = await getAllStudents()
    students.value = allStudents.filter(student => 
      (!props.gradeLevel || student.grade === props.gradeLevel) &&
      (!props.sportType || student.activities.includes(props.sportType))
    )

    const allEvaluations = await Promise.all(
      students.value.map(student => getStudentEvaluations(student.id))
    )
    
    evaluations.value = allEvaluations
      .flat()
      .filter(evaluation => filterEvaluation(evaluation))
    
    updateChartData()
  } catch (error) {
    console.error('Failed to load team data:', error)
  } finally {
    loading.value = false
  }
}

// Filter evaluations based on props
const filterEvaluation = (evaluation) => {
  const date = new Date(evaluation.date)
  const now = new Date()
  
  // Date range filter
  let passesDateFilter = true
  switch (props.dateRange) {
    case 'last-3-months':
      passesDateFilter = date >= new Date(now.setMonth(now.getMonth() - 3))
      break
    case 'last-6-months':
      passesDateFilter = date >= new Date(now.setMonth(now.getMonth() - 6))
      break
    case 'last-year':
      passesDateFilter = date >= new Date(now.setFullYear(now.getFullYear() - 1))
      break
  }

  // Sport type filter
  const passesSportFilter = !props.sportType || evaluation.sportType === props.sportType

  return passesDateFilter && passesSportFilter
}

// Computed properties for analytics
const teamStats = computed(() => {
  if (!evaluations.value.length) return null

  const stats = {
    totalEvaluations: evaluations.value.length,
    averageScore: 0,
    categoryAverages: {},
    topPerformers: [],
    improvementAreas: []
  }

  // Calculate category averages
  const categories = {}
  let totalScore = 0
  let totalCriteria = 0

  evaluations.value.forEach(evaluation => {
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
  stats.averageScore = Math.round((totalScore / totalCriteria) * 10) / 10

  // Calculate and sort category averages
  stats.categoryAverages = Object.entries(categories).map(([category, data]) => ({
    category,
    average: Math.round((data.total / data.count) * 10) / 10
  })).sort((a, b) => b.average - a.average)

  // Identify top performers and improvement areas
  stats.topPerformers = stats.categoryAverages
    .filter(cat => cat.average >= 4)
    .map(cat => cat.category)

  stats.improvementAreas = stats.categoryAverages
    .filter(cat => cat.average < 3)
    .map(cat => cat.category)

  return stats
})

// Update chart data
const updateChartData = () => {
  if (!teamStats.value) return

  const categoryAverages = teamStats.value.categoryAverages
  
  performanceChartData.value = {
    labels: categoryAverages.map(cat => cat.category),
    datasets: [{
      label: 'Average Score',
      data: categoryAverages.map(cat => cat.average),
      backgroundColor: categoryAverages.map(cat => 
        cat.average >= 4 ? 'rgba(34, 197, 94, 0.6)' :
        cat.average >= 3 ? 'rgba(234, 179, 8, 0.6)' :
        'rgba(239, 68, 68, 0.6)'
      )
    }]
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading team data...</p>
    </div>

    <template v-else-if="teamStats">
      <!-- Team Overview -->
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ students.length }}</div>
            <div class="text-sm text-gray-600">Total Students</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ teamStats.totalEvaluations }}</div>
            <div class="text-sm text-gray-600">Total Evaluations</div>
          </div>
          <div class="text-center">
            <div 
              class="text-2xl font-bold"
              :class="teamStats.averageScore >= 4 ? 'text-green-600' : teamStats.averageScore >= 3 ? 'text-yellow-600' : 'text-red-600'"
            >
              {{ teamStats.averageScore }}/5
            </div>
            <div class="text-sm text-gray-600">Team Average</div>
          </div>
        </div>
      </div>

      <!-- Performance Chart -->
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="h-80">
          <Bar
            v-if="performanceChartData.datasets.length"
            :data="performanceChartData"
            :options="performanceChartOptions"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            No evaluation data available for the selected period
          </div>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Strengths -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Team Strengths</h4>
          <div v-if="teamStats.topPerformers.length" class="space-y-2">
            <div
              v-for="category in teamStats.topPerformers"
              :key="category"
              class="flex items-center space-x-2 text-green-600"
            >
              <span class="text-lg">✓</span>
              <span>{{ category }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            No outstanding performance areas identified
          </div>
        </div>

        <!-- Areas for Improvement -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h4>
          <div v-if="teamStats.improvementAreas.length" class="space-y-2">
            <div
              v-for="category in teamStats.improvementAreas"
              :key="category"
              class="flex items-center space-x-2 text-red-600"
            >
              <span class="text-lg">!</span>
              <span>{{ category }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            No significant improvement areas identified
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="category in teamStats.categoryAverages"
            :key="category.category"
            class="p-4 rounded-lg"
            :class="category.average >= 4 ? 'bg-green-50' : category.average >= 3 ? 'bg-yellow-50' : 'bg-red-50'"
          >
            <div class="font-medium text-gray-900">{{ category.category }}</div>
            <div class="mt-1 text-2xl font-bold" :class="category.average >= 4 ? 'text-green-600' : category.average >= 3 ? 'text-yellow-600' : 'text-red-600'">
              {{ category.average }}/5
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">
      No team data available for the selected filters
    </div>
  </div>
</template> 