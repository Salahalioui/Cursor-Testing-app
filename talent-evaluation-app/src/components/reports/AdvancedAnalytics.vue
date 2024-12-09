<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Radar } from 'vue-chartjs'
import { getStudentEvaluations, getAllStudents } from '@/services/db'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  studentId: {
    type: String,
    default: null
  },
  sportType: {
    type: String,
    default: ''
  },
  dateRange: {
    type: String,
    default: 'last-6-months'
  }
})

// State
const loading = ref(true)
const error = ref(null)
const performanceData = ref(null)
const comparativeData = ref(null)
const skillsData = ref(null)

// Chart options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Performance Trends Over Time'
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Comparative Analysis'
    }
  }
}

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Skills Assessment'
    }
  },
  scales: {
    r: {
      min: 0,
      max: 10,
      beginAtZero: true
    }
  }
}

// Data processing functions
const processPerformanceData = (evaluations) => {
  const sortedEvaluations = evaluations
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(evaluation => props.sportType ? evaluation.sportType === props.sportType : true)

  const labels = sortedEvaluations.map(evaluation => new Date(evaluation.date).toLocaleDateString())
  const datasets = [{
    label: 'Overall Performance',
    data: sortedEvaluations.map(evaluation => {
      const scores = Object.values(evaluation.scores)
      return scores.reduce((sum, score) => sum + score, 0) / scores.length
    }),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]

  return { labels, datasets }
}

const processComparativeData = (evaluations, allStudents) => {
  const averageScores = new Map()
  
  evaluations.forEach(evaluation => {
    const scores = Object.values(evaluation.scores)
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    if (!averageScores.has(evaluation.studentId)) {
      averageScores.set(evaluation.studentId, [])
    }
    averageScores.get(evaluation.studentId).push(average)
  })

  const labels = Array.from(averageScores.keys()).map(id => {
    const student = allStudents.find(s => s.id === id)
    return student ? student.name : 'Unknown'
  })

  const datasets = [{
    label: 'Average Performance',
    data: Array.from(averageScores.values()).map(scores => 
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ),
    backgroundColor: 'rgba(75, 192, 192, 0.5)'
  }]

  return { labels, datasets }
}

const processSkillsData = (evaluations) => {
  const latestEval = evaluations
    .filter(evaluation => props.sportType ? evaluation.sportType === props.sportType : true)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  if (!latestEval) return null

  const labels = Object.keys(latestEval.scores)
  const datasets = [{
    label: 'Current Skills',
    data: Object.values(latestEval.scores),
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgb(75, 192, 192)',
    pointBackgroundColor: 'rgb(75, 192, 192)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(75, 192, 192)'
  }]

  return { labels, datasets }
}

// Load data
const loadAnalyticsData = async () => {
  loading.value = true
  error.value = null

  try {
    const allStudents = await getAllStudents()
    let evaluations = []

    if (props.studentId) {
      // Load single student data
      evaluations = await getStudentEvaluations(props.studentId)
    } else {
      // Load all students' data
      const promises = allStudents.map(student => getStudentEvaluations(student.id))
      const results = await Promise.all(promises)
      evaluations = results.flat()
    }

    // Filter by date range
    const cutoffDate = new Date()
    switch (props.dateRange) {
      case 'last-3-months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 3)
        break
      case 'last-6-months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6)
        break
      case 'last-year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
        break
      default:
        cutoffDate.setFullYear(0) // All time
    }

    evaluations = evaluations.filter(evaluation => new Date(evaluation.date) >= cutoffDate)

    // Process data for different charts
    performanceData.value = processPerformanceData(evaluations)
    comparativeData.value = processComparativeData(evaluations, allStudents)
    skillsData.value = processSkillsData(evaluations)
  } catch (err) {
    console.error('Failed to load analytics data:', err)
    error.value = 'Failed to load analytics data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Watch for prop changes
watch([() => props.studentId, () => props.sportType, () => props.dateRange], () => {
  loadAnalyticsData()
})

// Initial load
onMounted(() => {
  loadAnalyticsData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading analytics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
      {{ error }}
    </div>

    <!-- Analytics Content -->
    <template v-else>
      <!-- Performance Trends -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
        <div class="h-80">
          <Line
            v-if="performanceData"
            :data="performanceData"
            :options="lineChartOptions"
          />
        </div>
      </div>

      <!-- Comparative Analysis -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Comparative Analysis</h3>
        <div class="h-80">
          <Bar
            v-if="comparativeData"
            :data="comparativeData"
            :options="barChartOptions"
          />
        </div>
      </div>

      <!-- Skills Assessment -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Skills Assessment</h3>
        <div class="h-80">
          <Radar
            v-if="skillsData"
            :data="skillsData"
            :options="radarChartOptions"
          />
        </div>
      </div>
    </template>
  </div>
</template> 