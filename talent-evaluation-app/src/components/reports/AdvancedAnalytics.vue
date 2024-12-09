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

// Add benchmark constants
const BENCHMARK_LEVELS = {
  EXCEEDS: { label: 'Exceeds Expectations', threshold: 0.85, color: 'rgb(34, 197, 94)' },
  MEETS: { label: 'Meets Expectations', threshold: 0.7, color: 'rgb(59, 130, 246)' },
  APPROACHING: { label: 'Approaching Expectations', threshold: 0.5, color: 'rgb(234, 179, 8)' },
  BELOW: { label: 'Below Expectations', threshold: 0, color: 'rgb(239, 68, 68)' }
}

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
const benchmarkStats = ref(null)

// Computed properties for benchmarking
const performanceBenchmarks = computed(() => {
  if (!benchmarkStats.value) return null
  
  return {
    exceeds: benchmarkStats.value.average + benchmarkStats.value.standardDev,
    meets: benchmarkStats.value.average,
    approaching: benchmarkStats.value.average - benchmarkStats.value.standardDev
  }
})

// Enhanced chart options with benchmarks
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
    },
    tooltip: {
      callbacks: {
        afterBody: (context) => {
          if (!benchmarkStats.value) return ''
          const value = context[0].parsed.y
          const benchmark = getBenchmarkLevel(value)
          return `\nPerformance Level: ${benchmark.label}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 10
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
    },
    tooltip: {
      callbacks: {
        afterBody: (context) => {
          if (!benchmarkStats.value) return ''
          const value = context[0].parsed.y
          const benchmark = getBenchmarkLevel(value)
          return `Performance Level: ${benchmark.label}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 10
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

// Helper function to calculate benchmarks
const calculateBenchmarks = (evaluations) => {
  if (!evaluations.length) return null

  const scores = evaluations.map(evaluation => {
    const values = Object.values(evaluation.scores)
    return values.reduce((sum, score) => sum + score, 0) / values.length
  })

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
  const standardDev = Math.sqrt(variance)

  return {
    average,
    standardDev,
    min: Math.min(...scores),
    max: Math.max(...scores)
  }
}

// Helper function to determine benchmark level
const getBenchmarkLevel = (score) => {
  for (const [level, data] of Object.entries(BENCHMARK_LEVELS)) {
    if (score >= data.threshold * 10) {
      return data
    }
  }
  return BENCHMARK_LEVELS.BELOW
}

// Enhanced data processing functions
const processPerformanceData = (evaluations) => {
  const sortedEvaluations = evaluations
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(evaluation => props.sportType ? evaluation.sportType === props.sportType : true)

  const labels = sortedEvaluations.map(evaluation => new Date(evaluation.date).toLocaleDateString())
  
  // Calculate average scores
  const data = sortedEvaluations.map(evaluation => {
    const scores = Object.values(evaluation.scores)
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  })

  // Add benchmark lines if available
  const datasets = [{
    label: 'Overall Performance',
    data,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]

  if (performanceBenchmarks.value) {
    // Add benchmark lines
    datasets.push(
      {
        label: 'Exceeds Expectations',
        data: Array(labels.length).fill(performanceBenchmarks.value.exceeds),
        borderColor: BENCHMARK_LEVELS.EXCEEDS.color,
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Meets Expectations',
        data: Array(labels.length).fill(performanceBenchmarks.value.meets),
        borderColor: BENCHMARK_LEVELS.MEETS.color,
        borderDash: [5, 5],
        fill: false
      },
      {
        label: 'Approaching Expectations',
        data: Array(labels.length).fill(performanceBenchmarks.value.approaching),
        borderColor: BENCHMARK_LEVELS.APPROACHING.color,
        borderDash: [5, 5],
        fill: false
      }
    )
  }

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

  const data = Array.from(averageScores.values()).map(scores => 
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  )

  // Add colors based on benchmark levels
  const backgroundColor = data.map(score => getBenchmarkLevel(score).color)

  const datasets = [{
    label: 'Average Performance',
    data,
    backgroundColor
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

// Enhanced loadAnalyticsData function
const loadAnalyticsData = async () => {
  loading.value = true
  error.value = null

  try {
    const allStudents = await getAllStudents()
    let evaluations = []

    if (props.studentId) {
      evaluations = await getStudentEvaluations(props.studentId)
    } else {
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
        cutoffDate.setFullYear(0)
    }

    evaluations = evaluations.filter(evaluation => new Date(evaluation.date) >= cutoffDate)

    // Calculate benchmarks first
    benchmarkStats.value = calculateBenchmarks(evaluations)

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
      <!-- Benchmark Legend -->
      <div v-if="benchmarkStats" class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Benchmarks</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div v-for="(level, key) in BENCHMARK_LEVELS" :key="key" 
               class="flex items-center space-x-2 p-2 rounded-lg"
               :style="{ backgroundColor: level.color + '20' }">
            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: level.color }"></div>
            <div>
              <div class="font-medium" :style="{ color: level.color }">{{ level.label }}</div>
              <div class="text-sm text-gray-600">{{ (level.threshold * 10).toFixed(1) }}+ points</div>
            </div>
          </div>
        </div>
      </div>

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
        <div v-if="benchmarkStats" class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-600">Average Score</div>
            <div class="text-2xl font-semibold">{{ benchmarkStats.average.toFixed(1) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-600">Score Range</div>
            <div class="text-2xl font-semibold">
              {{ benchmarkStats.min.toFixed(1) }} - {{ benchmarkStats.max.toFixed(1) }}
            </div>
          </div>
        </div>
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