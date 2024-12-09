<script setup>
import { ref, onMounted, computed } from 'vue'
import { initDB, getAllTemplates, deleteTemplate, addTemplate, updateTemplate } from '@/services/db'
import EvaluationTemplateForm from './EvaluationTemplateForm.vue'
import Notification from '@/components/common/Notification.vue'

// State
const templates = ref([])
const searchQuery = ref('')
const selectedSportType = ref('')
const selectedGradeLevel = ref('')
const showTemplateForm = ref(false)
const editingTemplate = ref(null)

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Filter options
const sportTypes = [
  'Football',
  'Basketball',
  'Athletics',
  'Swimming',
  'Volleyball',
  'Tennis'
]

const gradeLevels = [
  'Elementary',
  'Middle School',
  'High School'
]

// Load templates
onMounted(async () => {
  try {
    await initDB()
    console.log('Database initialized')
    await loadTemplates()
  } catch (error) {
    console.error('Failed to initialize:', error)
    showNotification('Failed to initialize database', 'error')
  }
})

const loadTemplates = async () => {
  try {
    templates.value = await getAllTemplates()
    console.log('Loaded templates:', templates.value)
  } catch (error) {
    console.error('Failed to load templates:', error)
    showNotification('Failed to load templates', 'error')
  }
}

// Computed properties for filtering
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesSport = !selectedSportType.value || template.sportType === selectedSportType.value
    const matchesGrade = !selectedGradeLevel.value || template.gradeLevel === selectedGradeLevel.value
    
    return matchesSearch && matchesSport && matchesGrade
  })
})

// Template actions
const handleEditTemplate = (template) => {
  editingTemplate.value = template
  showTemplateForm.value = true
}

const handleDeleteTemplate = async (template) => {
  if (confirm('Are you sure you want to delete this template?')) {
    try {
      await deleteTemplate(template.id)
      await loadTemplates()
      showNotification('Template deleted successfully', 'success')
    } catch (error) {
      console.error('Delete error:', error) // Debug log
      showNotification('Failed to delete template', 'error')
    }
  }
}

const handleSaveTemplate = async (templateData) => {
  try {
    console.log('Saving template:', templateData)
    
    if (editingTemplate.value) {
      await updateTemplate({ ...templateData, id: editingTemplate.value.id })
      showNotification('Template updated successfully', 'success')
    } else {
      const result = await addTemplate(templateData)
      console.log('Template saved with ID:', result)
      showNotification('Template created successfully', 'success')
    }
    
    await loadTemplates()
    showTemplateForm.value = false
    editingTemplate.value = null
  } catch (error) {
    console.error('Failed to save template:', error)
    showNotification(error.message || 'Failed to save template', 'error')
  }
}

const handleFormClose = () => {
  showTemplateForm.value = false
  editingTemplate.value = null
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

// Helper function to count criteria
const countCriteria = (template) => {
  return template.criteria.reduce((total, category) => total + category.items.length, 0)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Evaluation Templates</h2>
      <button
        @click="showTemplateForm = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Template
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search templates..."
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Sport Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Sport Type</label>
          <select
            v-model="selectedSportType"
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
      </div>
    </div>

    <!-- Templates List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="min-w-full divide-y divide-gray-200">
        <!-- Table Header -->
        <div class="bg-gray-50 px-6 py-3 grid grid-cols-6 gap-4">
          <div class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-2">Template</div>
          <div class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport Type</div>
          <div class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</div>
          <div class="text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</div>
          <div class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-gray-200">
          <div v-for="template in filteredTemplates" :key="template.id" class="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50">
            <!-- Template Name & Description -->
            <div class="col-span-2">
              <div class="text-sm font-medium text-gray-900">{{ template.name }}</div>
              <div class="text-sm text-gray-500">{{ template.description || 'No description' }}</div>
            </div>

            <!-- Sport Type -->
            <div class="text-sm text-gray-900">{{ template.sportType }}</div>

            <!-- Grade Level -->
            <div class="text-sm text-gray-900">{{ template.gradeLevel }}</div>

            <!-- Criteria Count -->
            <div class="text-sm text-gray-900 text-center">
              {{ countCriteria(template) }} criteria
            </div>

            <!-- Actions -->
            <div class="text-right space-x-2">
              <button
                @click="handleEditTemplate(template)"
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
              <button
                @click="handleDeleteTemplate(template)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTemplates.length === 0" class="px-6 py-4 text-center text-gray-500">
            No templates found
          </div>
        </div>
      </div>
    </div>

    <!-- Template Form Modal -->
    <EvaluationTemplateForm
      :is-open="showTemplateForm"
      :template="editingTemplate"
      @close="handleFormClose"
      @save="handleSaveTemplate"
    />

    <!-- Notification -->
    <Notification
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
  </div>
</template> 