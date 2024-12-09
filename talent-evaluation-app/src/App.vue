<script setup>
import { ref } from 'vue'
import StudentManagement from './components/students/StudentManagement.vue'
import EvaluationTemplates from './components/evaluations/EvaluationTemplates.vue'
import ReportsDashboard from './components/reports/ReportsDashboard.vue'

const currentSection = ref('dashboard')

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: '📊' },
  { name: 'Student Management', key: 'students', icon: '👥' },
  { name: 'Evaluation Forms', key: 'forms', icon: '📝' },
  { name: 'Reports', key: 'reports', icon: '📈' },
  { name: 'Settings', key: 'settings', icon: '⚙️' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Talent Evaluation</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                v-for="item in navigation"
                :key="item.key"
                @click="currentSection = item.key"
                :class="[
                  'inline-flex items-center px-1 pt-1 text-sm font-medium',
                  currentSection === item.key
                    ? 'border-b-2 border-blue-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                <span class="mr-2">{{ item.icon }}</span>
                {{ item.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <component
        :is="currentSection === 'students' ? StudentManagement :
              currentSection === 'forms' ? EvaluationTemplates :
              currentSection === 'reports' ? ReportsDashboard :
              'div'"
      />
    </main>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
