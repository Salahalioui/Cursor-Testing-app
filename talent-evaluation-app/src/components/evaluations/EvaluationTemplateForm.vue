<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  template: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

// Preset Templates
const presetTemplates = {
  football: {
    elementary: {
      name: 'Elementary Football Evaluation',
      sportType: 'Football',
      gradeLevel: 'Elementary',
      description: 'Basic football skills evaluation for elementary students (ages 5-11)',
      criteria: [
        {
          category: 'Basic Skills',
          items: [
            { name: 'Ball Control - Basic', maxScore: 5 },
            { name: 'Short Passing', maxScore: 5 },
            { name: 'Kicking Form', maxScore: 5 },
            { name: 'Basic Dribbling', maxScore: 5 }
          ]
        },
        {
          category: 'Physical Development',
          items: [
            { name: 'Running Form', maxScore: 5 },
            { name: 'Basic Coordination', maxScore: 5 },
            { name: 'Balance', maxScore: 5 }
          ]
        },
        {
          category: 'Social Skills',
          items: [
            { name: 'Following Instructions', maxScore: 5 },
            { name: 'Team Participation', maxScore: 5 },
            { name: 'Sportsmanship', maxScore: 5 }
          ]
        }
      ]
    },
    middle: {
      name: 'Middle School Football Evaluation',
      sportType: 'Football',
      gradeLevel: 'Middle School',
      description: 'Intermediate football skills evaluation for middle school students (ages 11-14)',
      criteria: [
        {
          category: 'Technical Skills',
          items: [
            { name: 'Ball Control', maxScore: 5 },
            { name: 'Passing Accuracy', maxScore: 5 },
            { name: 'Shooting Technique', maxScore: 5 },
            { name: 'Dribbling Skills', maxScore: 5 },
            { name: 'First Touch', maxScore: 5 }
          ]
        },
        {
          category: 'Physical Attributes',
          items: [
            { name: 'Speed', maxScore: 5 },
            { name: 'Agility', maxScore: 5 },
            { name: 'Stamina', maxScore: 5 },
            { name: 'Coordination', maxScore: 5 }
          ]
        },
        {
          category: 'Game Understanding',
          items: [
            { name: 'Basic Positioning', maxScore: 5 },
            { name: 'Decision Making', maxScore: 5 },
            { name: 'Team Play', maxScore: 5 }
          ]
        }
      ]
    },
    high: {
      name: 'High School Football Evaluation',
      sportType: 'Football',
      gradeLevel: 'High School',
      description: 'Advanced football skills and attributes evaluation for high school students (ages 14-18)',
      criteria: [
        {
          category: 'Technical Skills',
          items: [
            { name: 'Advanced Ball Control', maxScore: 5 },
            { name: 'Long & Short Passing', maxScore: 5 },
            { name: 'Shooting Power & Accuracy', maxScore: 5 },
            { name: 'Advanced Dribbling', maxScore: 5 },
            { name: 'First Touch Control', maxScore: 5 }
          ]
        },
        {
          category: 'Physical Attributes',
          items: [
            { name: 'Explosive Speed', maxScore: 5 },
            { name: 'Endurance', maxScore: 5 },
            { name: 'Strength', maxScore: 5 },
            { name: 'Agility & Balance', maxScore: 5 }
          ]
        },
        {
          category: 'Tactical Understanding',
          items: [
            { name: 'Strategic Positioning', maxScore: 5 },
            { name: 'Game Reading', maxScore: 5 },
            { name: 'Leadership', maxScore: 5 },
            { name: 'Tactical Awareness', maxScore: 5 }
          ]
        }
      ]
    }
  },
  basketball: {
    elementary: {
      name: 'Elementary Basketball Evaluation',
      sportType: 'Basketball',
      gradeLevel: 'Elementary',
      description: 'Basic basketball skills evaluation for elementary students',
      criteria: [
        {
          category: 'Basic Skills',
          items: [
            { name: 'Basic Dribbling', maxScore: 5 },
            { name: 'Basic Passing', maxScore: 5 },
            { name: 'Basic Shooting Form', maxScore: 5 }
          ]
        },
        {
          category: 'Movement',
          items: [
            { name: 'Running Form', maxScore: 5 },
            { name: 'Basic Footwork', maxScore: 5 },
            { name: 'Balance', maxScore: 5 }
          ]
        },
        {
          category: 'Learning & Participation',
          items: [
            { name: 'Following Rules', maxScore: 5 },
            { name: 'Team Play', maxScore: 5 },
            { name: 'Enthusiasm', maxScore: 5 }
          ]
        }
      ]
    },
    middle: {
      name: 'Middle School Basketball Evaluation',
      sportType: 'Basketball',
      gradeLevel: 'Middle School',
      description: 'Intermediate basketball skills assessment for middle school students',
      criteria: [
        {
          category: 'Offensive Skills',
          items: [
            { name: 'Dribbling Control', maxScore: 5 },
            { name: 'Passing Accuracy', maxScore: 5 },
            { name: 'Shooting Form', maxScore: 5 },
            { name: 'Layup Technique', maxScore: 5 }
          ]
        },
        {
          category: 'Defensive Skills',
          items: [
            { name: 'Defensive Stance', maxScore: 5 },
            { name: 'Basic Rebounding', maxScore: 5 },
            { name: 'Court Movement', maxScore: 5 }
          ]
        },
        {
          category: 'Game Understanding',
          items: [
            { name: 'Basic Strategy', maxScore: 5 },
            { name: 'Team Cooperation', maxScore: 5 },
            { name: 'Game Rules', maxScore: 5 }
          ]
        }
      ]
    },
    high: {
      name: 'High School Basketball Evaluation',
      sportType: 'Basketball',
      gradeLevel: 'High School',
      description: 'Advanced basketball skills assessment for high school students',
      criteria: [
        {
          category: 'Advanced Offensive Skills',
          items: [
            { name: 'Advanced Ball Handling', maxScore: 5 },
            { name: 'Complex Passing', maxScore: 5 },
            { name: 'Jump Shot Form', maxScore: 5 },
            { name: 'Free Throw Accuracy', maxScore: 5 },
            { name: 'Offensive Moves', maxScore: 5 }
          ]
        },
        {
          category: 'Advanced Defense',
          items: [
            { name: 'Man-to-Man Defense', maxScore: 5 },
            { name: 'Zone Defense', maxScore: 5 },
            { name: 'Rebounding Technique', maxScore: 5 },
            { name: 'Shot Blocking', maxScore: 5 }
          ]
        },
        {
          category: 'Game IQ',
          items: [
            { name: 'Court Vision', maxScore: 5 },
            { name: 'Strategic Play', maxScore: 5 },
            { name: 'Leadership', maxScore: 5 },
            { name: 'Decision Making', maxScore: 5 }
          ]
        }
      ]
    }
  },
  swimming: {
    elementary: {
      name: 'Elementary Swimming Evaluation',
      sportType: 'Swimming',
      gradeLevel: 'Elementary',
      description: 'Basic swimming skills assessment for elementary students',
      criteria: [
        {
          category: 'Basic Techniques',
          items: [
            { name: 'Water Comfort', maxScore: 5 },
            { name: 'Basic Float', maxScore: 5 },
            { name: 'Basic Kicks', maxScore: 5 },
            { name: 'Basic Arm Movement', maxScore: 5 }
          ]
        },
        {
          category: 'Safety Skills',
          items: [
            { name: 'Pool Safety Rules', maxScore: 5 },
            { name: 'Basic Breathing', maxScore: 5 },
            { name: 'Water Entry/Exit', maxScore: 5 }
          ]
        },
        {
          category: 'Learning Progress',
          items: [
            { name: 'Following Instructions', maxScore: 5 },
            { name: 'Water Confidence', maxScore: 5 },
            { name: 'Practice Participation', maxScore: 5 }
          ]
        }
      ]
    },
    middle: {
      name: 'Middle School Swimming Evaluation',
      sportType: 'Swimming',
      gradeLevel: 'Middle School',
      description: 'Intermediate swimming skills assessment for middle school students',
      criteria: [
        {
          category: 'Stroke Development',
          items: [
            { name: 'Freestyle Technique', maxScore: 5 },
            { name: 'Backstroke Form', maxScore: 5 },
            { name: 'Breaststroke Basics', maxScore: 5 },
            { name: 'Butterfly Introduction', maxScore: 5 }
          ]
        },
        {
          category: 'Performance Elements',
          items: [
            { name: 'Basic Turns', maxScore: 5 },
            { name: 'Breathing Pattern', maxScore: 5 },
            { name: 'Endurance', maxScore: 5 }
          ]
        },
        {
          category: 'Competition Skills',
          items: [
            { name: 'Start Technique', maxScore: 5 },
            { name: 'Race Rules', maxScore: 5 },
            { name: 'Pacing', maxScore: 5 }
          ]
        }
      ]
    },
    high: {
      name: 'High School Swimming Evaluation',
      sportType: 'Swimming',
      gradeLevel: 'High School',
      description: 'Advanced swimming skills assessment for high school students',
      criteria: [
        {
          category: 'Advanced Techniques',
          items: [
            { name: 'Advanced Freestyle', maxScore: 5 },
            { name: 'Advanced Backstroke', maxScore: 5 },
            { name: 'Advanced Breaststroke', maxScore: 5 },
            { name: 'Advanced Butterfly', maxScore: 5 }
          ]
        },
        {
          category: 'Race Performance',
          items: [
            { name: 'Competition Turns', maxScore: 5 },
            { name: 'Race Strategy', maxScore: 5 },
            { name: 'Sprint Technique', maxScore: 5 },
            { name: 'Distance Technique', maxScore: 5 }
          ]
        },
        {
          category: 'Elite Skills',
          items: [
            { name: 'Underwater Work', maxScore: 5 },
            { name: 'Race Analysis', maxScore: 5 },
            { name: 'Mental Preparation', maxScore: 5 },
            { name: 'Competition Focus', maxScore: 5 }
          ]
        }
      ]
    }
  },
  athletics: {
    elementary: {
      name: 'Elementary Athletics Evaluation',
      sportType: 'Athletics',
      gradeLevel: 'Elementary',
      description: 'Basic track and field skills for elementary students',
      criteria: [
        {
          category: 'Basic Movement',
          items: [
            { name: 'Running Form', maxScore: 5 },
            { name: 'Basic Jumping', maxScore: 5 },
            { name: 'Basic Throwing', maxScore: 5 }
          ]
        },
        {
          category: 'Physical Skills',
          items: [
            { name: 'Balance', maxScore: 5 },
            { name: 'Coordination', maxScore: 5 },
            { name: 'Basic Strength', maxScore: 5 }
          ]
        },
        {
          category: 'Learning Attitude',
          items: [
            { name: 'Following Instructions', maxScore: 5 },
            { name: 'Participation', maxScore: 5 },
            { name: 'Safety Awareness', maxScore: 5 }
          ]
        }
      ]
    },
    middle: {
      name: 'Middle School Athletics Evaluation',
      sportType: 'Athletics',
      gradeLevel: 'Middle School',
      description: 'Intermediate track and field skills assessment',
      criteria: [
        {
          category: 'Running Events',
          items: [
            { name: 'Sprint Technique', maxScore: 5 },
            { name: 'Starting Position', maxScore: 5 },
            { name: 'Running Endurance', maxScore: 5 },
            { name: 'Relay Skills', maxScore: 5 }
          ]
        },
        {
          category: 'Field Events',
          items: [
            { name: 'Long Jump Form', maxScore: 5 },
            { name: 'Shot Put Technique', maxScore: 5 },
            { name: 'High Jump Basics', maxScore: 5 }
          ]
        },
        {
          category: 'Athletic Development',
          items: [
            { name: 'Strength Training', maxScore: 5 },
            { name: 'Flexibility', maxScore: 5 },
            { name: 'Event Rules', maxScore: 5 }
          ]
        }
      ]
    },
    high: {
      name: 'High School Athletics Evaluation',
      sportType: 'Athletics',
      gradeLevel: 'High School',
      description: 'Advanced track and field performance assessment',
      criteria: [
        {
          category: 'Advanced Running',
          items: [
            { name: 'Sprint Mechanics', maxScore: 5 },
            { name: 'Race Strategy', maxScore: 5 },
            { name: 'Advanced Starting', maxScore: 5 },
            { name: 'Relay Exchange', maxScore: 5 }
          ]
        },
        {
          category: 'Advanced Field Events',
          items: [
            { name: 'Jump Specialization', maxScore: 5 },
            { name: 'Throwing Events', maxScore: 5 },
            { name: 'Multi-Event Skills', maxScore: 5 },
            { name: 'Technical Mastery', maxScore: 5 }
          ]
        },
        {
          category: 'Elite Performance',
          items: [
            { name: 'Competition Strategy', maxScore: 5 },
            { name: 'Mental Toughness', maxScore: 5 },
            { name: 'Performance Analysis', maxScore: 5 },
            { name: 'Leadership', maxScore: 5 }
          ]
        }
      ]
    }
  }
}

const initialFormState = {
  name: '',
  sportType: '',
  gradeLevel: '',
  description: '',
  criteria: [
    {
      category: 'Physical Attributes',
      items: [
        { name: 'Speed', maxScore: 5 },
        { name: 'Agility', maxScore: 5 },
        { name: 'Strength', maxScore: 5 }
      ]
    },
    {
      category: 'Technical Skills',
      items: [
        { name: 'Ball Control', maxScore: 5 },
        { name: 'Passing', maxScore: 5 },
        { name: 'Shooting', maxScore: 5 }
      ]
    },
    {
      category: 'Mental Attributes',
      items: [
        { name: 'Focus', maxScore: 5 },
        { name: 'Teamwork', maxScore: 5 },
        { name: 'Leadership', maxScore: 5 }
      ]
    }
  ]
}

const formData = ref({ ...initialFormState })
const errors = ref({})
const selectedPreset = ref('')

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

const resetForm = () => {
  formData.value = { ...initialFormState }
  selectedPreset.value = ''
  errors.value = {}
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const loadPresetTemplate = (presetKey) => {
  const [sport, level] = presetKey.split('-')
  if (sport && level && presetTemplates[sport]?.[level]) {
    formData.value = { ...presetTemplates[sport][level] }
    selectedPreset.value = presetKey
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true
  
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Template name is required'
    isValid = false
  }
  
  if (!formData.value.sportType) {
    errors.value.sportType = 'Sport type is required'
    isValid = false
  }
  
  if (!formData.value.gradeLevel) {
    errors.value.gradeLevel = 'Grade level is required'
    isValid = false
  }
  
  if (!formData.value.criteria?.length) {
    errors.value.criteria = 'At least one evaluation criterion is required'
    isValid = false
  }

  // Validate criteria
  formData.value.criteria.forEach((category, categoryIndex) => {
    if (!category.category?.trim()) {
      errors.value[`category-${categoryIndex}`] = 'Category name is required'
      isValid = false
    }
    
    if (!category.items?.length) {
      errors.value[`category-items-${categoryIndex}`] = 'At least one criterion is required'
      isValid = false
    } else {
      category.items.forEach((item, itemIndex) => {
        if (!item.name?.trim()) {
          errors.value[`item-${categoryIndex}-${itemIndex}`] = 'Criterion name is required'
          isValid = false
        }
      })
    }
  })
  
  return isValid
}

const handleSubmit = () => {
  console.log('Form submitted with data:', formData.value) // Debug log
  if (validateForm()) {
    try {
      // Create a clean copy of the form data
      const templateData = {
        name: formData.value.name.trim(),
        sportType: formData.value.sportType,
        gradeLevel: formData.value.gradeLevel,
        description: formData.value.description?.trim() || '',
        criteria: formData.value.criteria.map(category => ({
          category: category.category.trim(),
          items: category.items.map(item => ({
            name: item.name.trim(),
            maxScore: Number(item.maxScore)
          }))
        }))
      }

      console.log('Prepared template data:', templateData) // Debug log
      emit('save', templateData)
    } catch (error) {
      console.error('Error preparing template data:', error)
    }
  } else {
    console.log('Form validation failed:', errors.value) // Debug log
  }
}

const addCategory = () => {
  formData.value.criteria.push({
    category: 'New Category',
    items: [{ name: 'New Criterion', maxScore: 5 }]
  })
}

const addCriterion = (categoryIndex) => {
  formData.value.criteria[categoryIndex].items.push({
    name: 'New Criterion',
    maxScore: 5
  })
}

const removeCategory = (categoryIndex) => {
  formData.value.criteria.splice(categoryIndex, 1)
}

const removeCriterion = (categoryIndex, criterionIndex) => {
  formData.value.criteria[categoryIndex].items.splice(criterionIndex, 1)
}

// Watch for changes in the template prop to populate form for editing
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    formData.value = { ...newTemplate }
    selectedPreset.value = ''
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
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ template ? 'Edit Evaluation Template' : 'Create Evaluation Template' }}
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Preset Template Selection -->
            <div v-if="!template" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Start with a Preset Template</label>
              <div class="grid grid-cols-1 gap-4">
                <div v-for="(sportTemplates, sport) in presetTemplates" :key="sport" class="border rounded-lg p-4">
                  <h3 class="text-lg font-medium text-gray-900 mb-3 capitalize">{{ sport }}</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      v-for="(levelTemplate, level) in sportTemplates"
                      :key="`${sport}-${level}`"
                      @click="loadPresetTemplate(`${sport}-${level}`)"
                      class="p-4 border rounded-lg text-left hover:border-blue-500 transition-colors"
                      :class="{
                        'border-blue-500 bg-blue-50': selectedPreset === `${sport}-${level}`,
                        'border-gray-200': selectedPreset !== `${sport}-${level}`
                      }"
                    >
                      <h4 class="font-medium text-gray-900">{{ levelTemplate.name }}</h4>
                      <p class="text-sm text-gray-500 mt-1">{{ levelTemplate.description }}</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Template Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  v-model="formData.name"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <!-- Sport Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sport Type *</label>
                <select
                  v-model="formData.sportType"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.sportType }"
                >
                  <option value="">Select sport type</option>
                  <option v-for="sport in sportTypes" :key="sport" :value="sport">
                    {{ sport }}
                  </option>
                </select>
                <p v-if="errors.sportType" class="mt-1 text-sm text-red-600">{{ errors.sportType }}</p>
              </div>

              <!-- Grade Level -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Grade Level *</label>
                <select
                  v-model="formData.gradeLevel"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.gradeLevel }"
                >
                  <option value="">Select grade level</option>
                  <option v-for="level in gradeLevels" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
                <p v-if="errors.gradeLevel" class="mt-1 text-sm text-red-600">{{ errors.gradeLevel }}</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="formData.description"
                  rows="2"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <!-- Evaluation Criteria -->
            <div class="space-y-4 mt-6">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-medium text-gray-900">Evaluation Criteria</h4>
                <button
                  type="button"
                  @click="addCategory"
                  class="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  Add Category
                </button>
              </div>

              <div v-if="errors.criteria" class="text-sm text-red-600">{{ errors.criteria }}</div>

              <!-- Categories and Criteria -->
              <div v-for="(category, categoryIndex) in formData.criteria" :key="categoryIndex" class="border rounded-lg p-4 space-y-4">
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <input
                      v-model="category.category"
                      class="w-full text-lg font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
                      placeholder="Category Name"
                    />
                    <p v-if="errors[`category-${categoryIndex}`]" class="mt-1 text-sm text-red-600">
                      {{ errors[`category-${categoryIndex}`] }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="removeCategory(categoryIndex)"
                    class="ml-4 text-red-600 hover:text-red-700"
                  >
                    Remove Category
                  </button>
                </div>

                <!-- Criteria Items -->
                <div class="space-y-2">
                  <div v-for="(item, itemIndex) in category.items" :key="itemIndex" class="space-y-2">
                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <input
                          v-model="item.name"
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Criterion Name"
                        />
                        <p v-if="errors[`item-${categoryIndex}-${itemIndex}`]" class="mt-1 text-sm text-red-600">
                          {{ errors[`item-${categoryIndex}-${itemIndex}`] }}
                        </p>
                      </div>
                      <select
                        v-model="item.maxScore"
                        class="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option :value="5">1-5</option>
                        <option :value="10">1-10</option>
                      </select>
                      <button
                        type="button"
                        @click="removeCriterion(categoryIndex, itemIndex)"
                        class="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="addCriterion(categoryIndex)"
                    class="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Criterion
                  </button>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t mt-6">
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
                {{ template ? 'Update Template' : 'Create Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template> 