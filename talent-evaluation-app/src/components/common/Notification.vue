<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

let timeout

onMounted(() => {
  if (props.duration > 0) {
    timeout = setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
})
</script>

<template>
  <div
    class="fixed top-4 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
    :class="{
      'bg-green-50': type === 'success',
      'bg-red-50': type === 'error',
      'bg-blue-50': type === 'info'
    }"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg
            v-if="type === 'success'"
            class="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <!-- Error Icon -->
          <svg
            v-if="type === 'error'"
            class="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <!-- Info Icon -->
          <svg
            v-if="type === 'info'"
            class="h-6 w-6 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p
            class="text-sm font-medium"
            :class="{
              'text-green-800': type === 'success',
              'text-red-800': type === 'error',
              'text-blue-800': type === 'info'
            }"
          >
            {{ message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="$emit('close')"
            class="inline-flex text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 