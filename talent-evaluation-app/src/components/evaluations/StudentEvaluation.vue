<script setup>
import { ref, onMounted, computed } from 'vue'
import { getStudentById, getStudentEvaluations, getAllTemplates, addEvaluation } from '@/services/db'
import Notification from '@/components/common/Notification.vue'

const props = defineProps({
  studentId: {
    type: [Number, String],
    required: true
  }
})

// State
const student = ref(null)
const evaluations = ref([])
const templates = ref([])
const selectedTemplate = ref(null)
const showEvaluationForm = ref(false)
const evaluatorName = ref('')

// Form data
const evaluationData = ref({
  scores: {},
  comments: {}
})

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Load data
onMounted(async () => {
  await Promise.all([
    loadStudent(),
    loadEvaluations(),
    loadTemplates()
  ])
})

const loadStudent = async () => {
  try {
    student.value = await getStudentById(props.studentId)
  } catch (error) {
    showNotification('Failed to load student information', 'error')
  }
}

const loadEvaluations = async () => {
  try {
    evaluations.value = await getStudentEvaluations(props.studentId)
    // Sort evaluations by date (newest first)
    evaluations.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    showNotification('Failed to load evaluations', 'error')
  }
}

const loadTemplates = async () => {
  try {
    templates.value = await getAllTemplates()
  } catch (error) {
    showNotification('Failed to load evaluation templates', 'error')
  }
}

// Computed properties
const latestEvaluation = computed(() => evaluations.value[0] || null)

const evaluationProgress = computed(() => {
  if (evaluations.value.length < 2) return null
  
  const latest = evaluations.value[0]
  const previous = evaluations.value[1]
  
  // Calculate progress for each criterion
  const progress = {}
  if (latest && previous) {
    Object.keys(latest.scores).forEach(key => {
      progress[key] = {
        change: latest.scores[key] - (previous.scores[key] || 0),
        current: latest.scores[key],
        previous: previous.scores[key] || 0
      }
    })
  }
  
  return progress
})

// Template selection and evaluation
const startNewEvaluation = (template) => {
  selectedTemplate.value = template
  evaluationData.value = {
    scores: {},
    comments: {}
  }
  // Initialize scores and comments for each criterion
  template.criteria.forEach(category => {
    category.items.forEach(item => {
      evaluationData.value.scores[`${category.category}-${item.name}`] = 0
      evaluationData.value.comments[`${category.category}-${item.name}`] = ''
    })
  })
  showEvaluationForm.value = true
}

const handleSubmitEvaluation = async () => {
  if (!evaluatorName.value) {
    showNotification('Please enter evaluator name', 'error')
    return
  }

  try {
    const evaluation = {
      studentId: props.studentId,
      templateId: selectedTemplate.value.id,
      evaluator: evaluatorName.value,
      scores: evaluationData.value.scores,
      comments: evaluationData.value.comments,
      templateName: selectedTemplate.value.name,
      sportType: selectedTemplate.value.sportType,
      date: new Date().toISOString()
    }

    await addEvaluation(evaluation)
    await loadEvaluations()
    showEvaluationForm.value = false
    showNotification('Evaluation saved successfully', 'success')
  } catch (error) {
    showNotification('Failed to save evaluation', 'error')
  }
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

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getScoreColor = (score, maxScore) => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getProgressColor = (change) => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

// Add these computed properties after the existing ones
const calculateBasicScore = (evaluation) => {
  const scores = Object.values(evaluation.scores)
  const total = scores.reduce((sum, score) => sum + score, 0)
  const maxPossible = scores.length * 5 // assuming max score is 5
  return {
    score: total,
    percentage: Math.round((total / maxPossible) * 100),
    maxPossible
  }
}

const getScoreGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A', color: 'text-green-600' }
  if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' }
  if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' }
  if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' }
  return { grade: 'F', color: 'text-red-600' }
}

const calculateCategoryScores = (evaluation) => {
  const categoryScores = {}
  Object.entries(evaluation.scores).forEach(([key, score]) => {
    const category = key.split('-')[0]
    if (!categoryScores[category]) {
      categoryScores[category] = {
        scores: [],
        total: 0,
        count: 0
      }
    }
    categoryScores[category].scores.push(score)
    categoryScores[category].total += score
    categoryScores[category].count++
  })

  return Object.entries(categoryScores).map(([category, data]) => ({
    category,
    average: Math.round((data.total / data.count) * 10) / 10,
    percentage: Math.round((data.total / (data.count * 5)) * 100)
  }))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Student Info -->
    <div v-if="student" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">{{ student.name }}</h3>
          <p class="text-gray-600">Grade: {{ student.grade }} | ID: {{ student.studentId }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="activity in student.activities"
              :key="activity"
              class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {{ activity }}
            </span>
          </div>
        </div>
        <button
          v-if="!showEvaluationForm"
          @click="showEvaluationForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Evaluation
        </button>
      </div>
    </div>

    <!-- New Evaluation Form -->
    <div v-if="showEvaluationForm" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900">New Evaluation</h3>
        <button
          @click="showEvaluationForm = false"
          class="text-gray-400 hover:text-gray-500"
        >
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Template Selection -->
      <div v-if="!selectedTemplate" class="space-y-4">
        <h4 class="text-md font-medium text-gray-700">Select Evaluation Template</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="template in templates"
            :key="template.id"
            class="border rounded-lg p-4 hover:border-blue-500 cursor-pointer"
            @click="startNewEvaluation(template)"
          >
            <h5 class="font-medium text-gray-900">{{ template.name }}</h5>
            <p class="text-sm text-gray-600">{{ template.sportType }} | {{ template.gradeLevel }}</p>
            <p class="text-sm text-gray-500 mt-2">{{ template.description }}</p>
          </div>
        </div>
      </div>

      <!-- Evaluation Form -->
      <form v-else @submit.prevent="handleSubmitEvaluation" class="space-y-6">
        <!-- Evaluator Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Evaluator Name *</label>
          <input
            type="text"
            v-model="evaluatorName"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Criteria -->
        <div v-for="category in selectedTemplate.criteria" :key="category.category" class="space-y-4">
          <h4 class="text-lg font-medium text-gray-900">{{ category.category }}</h4>
          <div class="space-y-4">
            <div
              v-for="item in category.items"
              :key="item.name"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ item.name }}</label>
                <select
                  v-model="evaluationData.scores[`${category.category}-${item.name}`]"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option v-for="score in item.maxScore" :key="score" :value="score">
                    {{ score }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Comments</label>
                <textarea
                  v-model="evaluationData.comments[`${category.category}-${item.name}`]"
                  rows="2"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="showEvaluationForm = false"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Evaluation
          </button>
        </div>
      </form>
    </div>

    <!-- Previous Evaluations -->
    <div v-if="!showEvaluationForm && evaluations.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Evaluation History</h3>
      </div>
      <div class="divide-y divide-gray-200">
        <div
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          class="p-6"
        >
          <!-- Evaluation Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="font-medium text-gray-900">{{ evaluation.templateName }}</h4>
              <p class="text-sm text-gray-600">
                Evaluated by {{ evaluation.evaluator }} on {{ formatDate(evaluation.date) }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="getScoreGrade(calculateBasicScore(evaluation).percentage).color">
                {{ getScoreGrade(calculateBasicScore(evaluation).percentage).grade }}
              </div>
              <div class="text-sm text-gray-600">
                {{ calculateBasicScore(evaluation).score }}/{{ calculateBasicScore(evaluation).maxPossible }}
                ({{ calculateBasicScore(evaluation).percentage }}%)
              </div>
            </div>
          </div>

          <!-- Category Scores -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              v-for="categoryScore in calculateCategoryScores(evaluation)"
              :key="categoryScore.category"
              class="bg-gray-50 rounded-lg p-3"
            >
              <div class="text-sm font-medium text-gray-700">{{ categoryScore.category }}</div>
              <div class="mt-1">
                <span class="text-lg font-semibold" :class="getScoreColor(categoryScore.percentage, 100)">
                  {{ categoryScore.average }}
                </span>
                <span class="text-sm text-gray-600">/5 ({{ categoryScore.percentage }}%)</span>
              </div>
            </div>
          </div>

          <!-- Detailed Scores (Collapsed by Default) -->
          <div class="mt-4">
            <button
              @click="evaluation.showDetails = !evaluation.showDetails"
              class="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {{ evaluation.showDetails ? 'Hide Details' : 'Show Details' }}
            </button>
            
            <div v-if="evaluation.showDetails" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="(score, key) in evaluation.scores"
                  :key="key"
                  class="bg-gray-50 rounded p-2"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700">{{ key.split('-')[1] }}</span>
                    <span :class="getScoreColor(score, 5)" class="font-medium">
                      {{ score }}/5
                    </span>
                  </div>
                  <div v-if="evaluation.comments[key]" class="mt-1 text-sm text-gray-600">
                    {{ evaluation.comments[key] }}
                  </div>
                  <div v-if="evaluationProgress && evaluationProgress[key]" class="mt-1 text-xs">
                    <span
                      :class="getProgressColor(evaluationProgress[key].change)"
                      class="font-medium"
                    >
                      {{ evaluationProgress[key].change > 0 ? '+' : '' }}{{ evaluationProgress[key].change }}
                    </span>
                    from previous
                  </div>
                </div>
              </div>
            </div>
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