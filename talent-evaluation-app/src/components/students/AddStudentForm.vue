<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  student: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const initialFormState = {
  name: '',
  studentId: '',
  grade: '',
  gender: '',
  activities: [],
  notes: ''
}

const formData = ref({ ...initialFormState })
const errors = ref({})

const availableActivities = [
  'Football',
  'Basketball',
  'Athletics',
  'Swimming',
  'Volleyball',
  'Tennis',
  'Chess',
  'Drama',
  'Music'
]

const resetForm = () => {
  formData.value = { ...initialFormState }
  errors.value = {}
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (!formData.value.studentId.trim()) {
    errors.value.studentId = 'Student ID is required'
  }
  
  if (!formData.value.grade) {
    errors.value.grade = 'Grade is required'
  } else if (isNaN(formData.value.grade) || formData.value.grade < 1) {
    errors.value.grade = 'Grade must be a valid number'
  }
  
  if (!formData.value.gender) {
    errors.value.gender = 'Gender is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('save', { ...formData.value })
  }
}

const toggleActivity = (activity) => {
  const index = formData.value.activities.indexOf(activity)
  if (index === -1) {
    formData.value.activities.push(activity)
  } else {
    formData.value.activities.splice(index, 1)
  }
}

// Watch for changes in the student prop to populate form for editing
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    formData.value = { ...newStudent }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for changes in isOpen to reset form when closed
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ student ? 'Edit Student' : 'Add New Student' }}
        </h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-500"
        >
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            v-model="formData.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <!-- Student ID -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Student ID *</label>
          <input
            type="text"
            v-model="formData.studentId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.studentId }"
          />
          <p v-if="errors.studentId" class="mt-1 text-sm text-red-600">{{ errors.studentId }}</p>
        </div>

        <!-- Grade -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Grade *</label>
          <input
            type="number"
            v-model="formData.grade"
            min="1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.grade }"
          />
          <p v-if="errors.grade" class="mt-1 text-sm text-red-600">{{ errors.grade }}</p>
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Gender *</label>
          <select
            v-model="formData.gender"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.gender }"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <p v-if="errors.gender" class="mt-1 text-sm text-red-600">{{ errors.gender }}</p>
        </div>

        <!-- Activities -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Activities</label>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="activity in availableActivities"
              :key="activity"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :id="activity"
                :value="activity"
                :checked="formData.activities.includes(activity)"
                @change="toggleActivity(activity)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label :for="activity" class="ml-2 text-sm text-gray-700">
                {{ activity }}
              </label>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            v-model="formData.notes"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {{ student ? 'Update Student' : 'Save Student' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 