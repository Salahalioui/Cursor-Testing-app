<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getStudentById, getStudentEvaluations } from '@/services/db'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  studentId: {
    type: [String, Number, null],
    default: null
  },
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
const student = ref(null)
const evaluations = ref([])
const loading = ref(false)

// Chart data
const progressChartData = ref({
  labels: [],
  datasets: []
})

const progressChartOptions = {
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
      text: 'Performance Progress Over Time'
    }
  }
}

// Load data
watch([() => props.studentId, () => props.dateRange], async () => {
  if (props.studentId) {
    await loadStudentData()
  } else {
    // Reset data when no student is selected
    student.value = null
    evaluations.value = []
    progressChartData.value = {
      labels: [],
      datasets: []
    }
  }
}, { immediate: true })

const loadStudentData = async () => {
  loading.value = true
  try {
    const [studentData, evaluationsData] = await Promise.all([
      getStudentById(props.studentId),
      getStudentEvaluations(props.studentId)
    ])
    
    student.value = studentData
    evaluations.value = filterEvaluations(evaluationsData)
    updateChartData()
  } catch (error) {
    console.error('Failed to load student data:', error)
  } finally {
    loading.value = false
  }
}

// Filter evaluations based on props
const filterEvaluations = (evals) => {
  return evals
    .filter(evaluation => {
      const date = new Date(evaluation.date)
      const now = new Date()
      
      switch (props.dateRange) {
        case 'last-3-months':
          return date >= new Date(now.setMonth(now.getMonth() - 3))
        case 'last-6-months':
          return date >= new Date(now.setMonth(now.getMonth() - 6))
        case 'last-year':
          return date >= new Date(now.setFullYear(now.getFullYear() - 1))
        default:
          return true
      }
    })
    .filter(evaluation => !props.sportType || evaluation.sportType === props.sportType)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

// Computed properties for analytics
const averageScores = computed(() => {
  if (!evaluations.value.length) return null
  
  const categories = {}
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
    })
  })

  return Object.entries(categories).map(([category, data]) => ({
    category,
    average: Math.round((data.total / data.count) * 10) / 10
  }))
})

const progressTrend = computed(() => {
  if (evaluations.value.length < 2) return null
  
  const first = evaluations.value[0]
  const last = evaluations.value[evaluations.value.length - 1]
  
  const trend = {}
  Object.keys(last.scores).forEach(key => {
    const firstScore = first.scores[key] || 0
    const lastScore = last.scores[key]
    trend[key] = {
      change: lastScore - firstScore,
      percentage: Math.round(((lastScore - firstScore) / 5) * 100)
    }
  })
  
  return trend
})

// Update chart data
const updateChartData = () => {
  if (!evaluations.value.length) return

  const dates = evaluations.value.map(evaluation => new Date(evaluation.date).toLocaleDateString())
  const categories = {}

  // Collect all unique categories and their scores
  evaluations.value.forEach(evaluation => {
    Object.entries(evaluation.scores).forEach(([key, score]) => {
      const category = key.split('-')[0]
      if (!categories[category]) {
        categories[category] = Array(evaluations.value.length).fill(null)
      }
    })
  })

  // Fill in the scores for each category
  evaluations.value.forEach((evaluation, index) => {
    Object.entries(evaluation.scores).forEach(([key, score]) => {
      const category = key.split('-')[0]
      if (!categories[category][index]) {
        categories[category][index] = []
      }
      categories[category][index].push(score)
    })
  })

  // Calculate averages and create datasets
  const datasets = Object.entries(categories).map(([category, scores]) => ({
    label: category,
    data: scores.map(categoryScores => 
      categoryScores ? categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length : null
    ),
    fill: false,
    tension: 0.1
  }))

  progressChartData.value = {
    labels: dates,
    datasets
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading student data...</p>
    </div>

    <template v-else-if="student">
      <!-- Student Info -->
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">{{ student.name }}</h3>
        <p class="text-gray-600">Grade: {{ student.grade }} | Activities: {{ student.activities.join(', ') }}</p>
      </div>

      <!-- Progress Chart -->
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="h-80">
          <Line
            v-if="progressChartData.datasets.length"
            :data="progressChartData"
            :options="progressChartOptions"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-500">
            No evaluation data available for the selected period
          </div>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Average Scores -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Category Averages</h4>
          <div class="space-y-4">
            <div v-for="score in averageScores" :key="score.category" class="flex justify-between items-center">
              <span class="text-gray-700">{{ score.category }}</span>
              <span class="font-semibold" :class="score.average >= 4 ? 'text-green-600' : score.average >= 3 ? 'text-yellow-600' : 'text-red-600'">
                {{ score.average }}/5
              </span>
            </div>
          </div>
        </div>

        <!-- Progress Trends -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Progress Trends</h4>
          <div v-if="progressTrend" class="space-y-4">
            <div v-for="(trend, key) in progressTrend" :key="key" class="flex justify-between items-center">
              <span class="text-gray-700">{{ key.split('-')[1] }}</span>
              <div class="flex items-center space-x-2">
                <span class="font-semibold" :class="trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-gray-600'">
                  {{ trend.change > 0 ? '+' : '' }}{{ trend.change }}
                </span>
                <span class="text-sm text-gray-500">({{ trend.percentage }}%)</span>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            Not enough data to calculate trends
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-500">
      Select a student to view their progress report
    </div>
  </div>
</template> 