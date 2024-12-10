<script setup>
import { ref } from 'vue'
import StudentManagement from './components/students/StudentManagement.vue'
import EvaluationTemplates from './components/evaluations/EvaluationTemplates.vue'
import ReportsDashboard from './components/reports/ReportsDashboard.vue'

const currentSection = ref('dashboard')
const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: '📊' },
  { name: 'Student Management', key: 'students', icon: '👥' },
  { name: 'Evaluation Forms', key: 'forms', icon: '📝' },
  { name: 'Reports', key: 'reports', icon: '📈' },
  { name: 'Settings', key: 'settings', icon: '⚙️' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full z-50 transition-all duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Talent Evaluation
              </h1>
            </div>
            <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
              <button
                v-for="item in navigation"
                :key="item.key"
                @click="currentSection = item.key"
                class="inline-flex items-center px-3 pt-1 text-sm font-medium transition-all duration-200"
                :class="[
                  currentSection === item.key
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                ]"
              >
                <span class="mr-2 text-lg">{{ item.icon }}</span>
                {{ item.name }}
              </button>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center sm:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="mobileMenuOpen"
        class="sm:hidden bg-white border-t border-gray-200"
      >
        <div class="pt-2 pb-3 space-y-1">
          <button
            v-for="item in navigation"
            :key="item.key"
            @click="currentSection = item.key; mobileMenuOpen = false"
            class="block pl-3 pr-4 py-2 text-base font-medium w-full text-left transition-colors duration-200"
            :class="[
              currentSection === item.key
                ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            ]"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.name }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component
            :is="currentSection === 'students' ? StudentManagement :
                  currentSection === 'forms' ? EvaluationTemplates :
                  currentSection === 'reports' ? ReportsDashboard :
                  'div'"
            class="bg-white shadow-sm rounded-lg p-6"
          />
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            &copy; {{ new Date().getFullYear() }} Talent Evaluation. All rights reserved.
          </p>
          <div class="flex space-x-6">
            <a href="#" class="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <span class="sr-only">Help Center</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 13.355z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <span class="sr-only">Settings</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 100 6 3 3 0 000-6z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom styles */
.router-link-active {
  @apply text-blue-600;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus outline styles */
*:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
