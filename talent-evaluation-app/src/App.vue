<script setup>
import { ref } from 'vue'
import StudentManagement from './components/students/StudentManagement.vue'
import EvaluationTemplates from './components/evaluations/EvaluationTemplates.vue'

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
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <nav class="w-64 bg-white shadow-lg">
      <div class="p-4">
        <h1 class="text-xl font-bold text-gray-800">Talent Evaluation</h1>
      </div>
      <ul class="space-y-2 p-4">
        <li v-for="item in navigation" :key="item.key">
          <button
            @click="currentSection = item.key"
            :class="[
              'w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3',
              currentSection === item.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 p-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">
          {{ navigation.find(item => item.key === currentSection)?.name }}
        </h2>
        <!-- Dynamic content based on current section -->
        <StudentManagement v-if="currentSection === 'students'" />
        <EvaluationTemplates v-else-if="currentSection === 'forms'" />
        <div v-else class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600">Welcome to the {{ navigation.find(item => item.key === currentSection)?.name }} section!</p>
        </div>
      </div>
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
