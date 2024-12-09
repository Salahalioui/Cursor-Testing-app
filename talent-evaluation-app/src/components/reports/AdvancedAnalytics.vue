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

// Add benchmark constants with default values
const DEFAULT_THRESHOLDS = {
  EXCEEDS: 0.85,
  MEETS: 0.70,
  APPROACHING: 0.50
}

// State for custom thresholds
const customThresholds = ref({
  EXCEEDS: DEFAULT_THRESHOLDS.EXCEEDS,
  MEETS: DEFAULT_THRESHOLDS.MEETS,
  APPROACHING: DEFAULT_THRESHOLDS.APPROACHING
})

const BENCHMARK_LEVELS = computed(() => ({
  EXCEEDS: { 
    label: 'Exceeds Expectations', 
    threshold: customThresholds.value.EXCEEDS, 
    color: 'rgb(34, 197, 94)' 
  },
  MEETS: { 
    label: 'Meets Expectations', 
    threshold: customThresholds.value.MEETS, 
    color: 'rgb(59, 130, 246)' 
  },
  APPROACHING: { 
    label: 'Approaching Expectations', 
    threshold: customThresholds.value.APPROACHING, 
    color: 'rgb(234, 179, 8)' 
  },
  BELOW: { 
    label: 'Below Expectations', 
    threshold: 0, 
    color: 'rgb(239, 68, 68)' 
  }
}))

// Add props for prediction settings
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
  },
  predictionPeriod: {
    type: String,
    default: '3-months'
  }
})

// State
const loading = ref(true)
const error = ref(null)
const performanceData = ref(null)
const comparativeData = ref(null)
const skillsData = ref(null)
const benchmarkStats = ref(null)
const predictions = ref(null)
const showPredictions = ref(true)
const isEditingThresholds = ref(false)

// Function to reset thresholds to defaults
const resetThresholds = () => {
  customThresholds.value = { ...DEFAULT_THRESHOLDS }
}

// Function to save custom thresholds
const saveThresholds = () => {
  isEditingThresholds.value = false
  // Recalculate charts with new thresholds
  if (performanceData.value) {
    performanceData.value = processPerformanceData(evaluations.value)
    comparativeData.value = processComparativeData(evaluations.value, students.value)
  }
}

// Store raw data for reprocessing when thresholds change
const evaluations = ref([])
const students = ref([])

// Helper function to calculate linear regression
const calculateLinearRegression = (data) => {
  const n = data.length
  if (n < 2) return null

  const xValues = Array.from({ length: n }, (_, i) => i)
  const yValues = data

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((a, x, i) => a + x * yValues[i], 0)
  const sumXX = xValues.reduce((a, x) => a + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

// Function to calculate prediction interval
const calculatePredictionInterval = (regression, data, confidence = 0.95) => {
  if (!regression || data.length < 2) return null

  const { slope, intercept } = regression
  const n = data.length
  const xValues = Array.from({ length: n }, (_, i) => i)
  
  // Calculate standard error of regression
  const yPred = xValues.map(x => slope * x + intercept)
  const residuals = data.map((y, i) => y - yPred[i])
  const sumSquaredResiduals = residuals.reduce((a, b) => a + b * b, 0)
  const standardError = Math.sqrt(sumSquaredResiduals / (n - 2))
  
  // t-value for 95% confidence interval with n-2 degrees of freedom
  const tValue = 1.96 // Approximation for large n
  
  return {
    upper: standardError * tValue,
    lower: -standardError * tValue
  }
}

// Enhanced processPerformanceData function with predictions
const processPerformanceData = (evaluations) => {
  const sortedEvaluations = evaluations
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(evaluation => props.sportType ? evaluation.sportType === props.sportType : true)

  const labels = sortedEvaluations.map(evaluation => new Date(evaluation.date).toLocaleDateString())
  const data = sortedEvaluations.map(evaluation => {
    const scores = Object.values(evaluation.scores)
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  })

  // Calculate predictions if we have enough data
  let predictionData = null
  if (data.length >= 3 && showPredictions.value) {
    const regression = calculateLinearRegression(data)
    if (regression) {
      const { slope, intercept } = regression
      const interval = calculatePredictionInterval(regression, data)
      
      // Calculate number of future points based on prediction period
      const futurePeriods = props.predictionPeriod === '3-months' ? 3 : 
                           props.predictionPeriod === '6-months' ? 6 : 12
      
      const lastX = data.length - 1
      const predictions = Array.from({ length: futurePeriods }, (_, i) => {
        const x = lastX + i + 1
        return slope * x + intercept
      })

      // Generate future dates
      const lastDate = new Date(sortedEvaluations[sortedEvaluations.length - 1].date)
      const futureDates = Array.from({ length: futurePeriods }, (_, i) => {
        const date = new Date(lastDate)
        date.setMonth(date.getMonth() + i + 1)
        return date.toLocaleDateString()
      })

      predictionData = {
        labels: futureDates,
        values: predictions,
        interval: interval
      }
    }
  }

  // Create datasets array
  const datasets = [{
    label: 'Overall Performance',
    data,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]

  // Add benchmark lines
  if (benchmarkStats.value) {
    Object.entries(BENCHMARK_LEVELS.value).forEach(([key, level]) => {
      if (key !== 'BELOW') {
        datasets.push({
          label: level.label,
          data: Array(labels.length).fill(level.threshold * 10),
          borderColor: level.color,
          borderDash: [5, 5],
          fill: false
        })
      }
    })
  }

  // Add prediction line and confidence interval
  if (predictionData) {
    const allLabels = [...labels, ...predictionData.labels]
    datasets.push({
      label: 'Predicted Performance',
      data: [...Array(labels.length).fill(null), ...predictionData.values],
      borderColor: 'rgb(147, 51, 234)',
      borderDash: [10, 5],
      fill: false
    })

    if (predictionData.interval) {
      datasets.push({
        label: 'Prediction Interval',
        data: [...Array(labels.length).fill(null), 
               ...predictionData.values.map(v => v + predictionData.interval.upper)],
        borderColor: 'rgba(147, 51, 234, 0.2)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: '+1'
      }, {
        label: false,
        data: [...Array(labels.length).fill(null), 
               ...predictionData.values.map(v => v + predictionData.interval.lower)],
        borderColor: 'rgba(147, 51, 234, 0.2)',
        fill: false
      })
    }
  }

  return { 
    labels: predictionData ? [...labels, ...predictionData.labels] : labels, 
    datasets 
  }
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
    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading analytics...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
      {{ error }}
    </div>

    <!-- Analytics Content -->
    <template v-else>
      <!-- Settings Panel -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Analytics Settings</h3>
          <div class="space-x-2">
            <button
              @click="showPredictions = !showPredictions"
              class="px-3 py-1 rounded-md text-sm"
              :class="showPredictions ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ showPredictions ? 'Hide Predictions' : 'Show Predictions' }}
            </button>
            <button
              v-if="!isEditingThresholds"
              @click="isEditingThresholds = true"
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
            >
              Edit Thresholds
            </button>
          </div>
        </div>

        <!-- Threshold Editor -->
        <div v-if="isEditingThresholds" class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="(threshold, key) in customThresholds" :key="key" class="space-y-2">
              <label :for="key" class="block text-sm font-medium text-gray-700">
                {{ key.charAt(0) + key.slice(1).toLowerCase() }} Threshold
              </label>
              <input
                :id="key"
                type="number"
                v-model.number="customThresholds[key]"
                step="0.05"
                min="0"
                max="1"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mt-4 flex justify-end space-x-2">
            <button
              @click="resetThresholds"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
            >
              Reset to Defaults
            </button>
            <button
              @click="saveThresholds"
              class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        <!-- Prediction Settings -->
        <div v-if="showPredictions" class="bg-purple-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-purple-900 mb-2">Prediction Settings</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="predictionPeriod" class="block text-sm font-medium text-purple-700">
                Forecast Period
              </label>
              <select
                id="predictionPeriod"
                v-model="props.predictionPeriod"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              >
                <option value="3-months">Next 3 Months</option>
                <option value="6-months">Next 6 Months</option>
                <option value="12-months">Next 12 Months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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