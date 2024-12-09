import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/firebase'
import { firestoreService } from '@/services/firestoreService'

// Auth Components
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import ResetPassword from '@/components/auth/ResetPassword.vue'

// Layout Components
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Route Guards
async function requireAuth(to, from, next) {
  const currentUser = authService.getCurrentUser()
  if (!currentUser) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  try {
    const userProfile = await firestoreService.getUserProfile(currentUser.uid)
    if (!userProfile) {
      next({ name: 'login' })
      return
    }

    if (userProfile.status !== 'active') {
      next({ name: 'pending-approval' })
      return
    }

    next()
  } catch (error) {
    console.error('Auth guard error:', error)
    next({ name: 'login' })
  }
}

async function requireAdmin(to, from, next) {
  const currentUser = authService.getCurrentUser()
  if (!currentUser) {
    next({ name: 'login' })
    return
  }

  try {
    const userProfile = await firestoreService.getUserProfile(currentUser.uid)
    if (!userProfile || userProfile.role !== 'ADMIN') {
      next({ name: 'unauthorized' })
      return
    }

    next()
  } catch (error) {
    console.error('Admin guard error:', error)
    next({ name: 'unauthorized' })
  }
}

function requireNoAuth(to, from, next) {
  if (authService.getCurrentUser()) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
}

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    beforeEnter: requireNoAuth,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginForm
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterForm
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPassword
      }
    ]
  },
  {
    path: '/',
    component: DashboardLayout,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('@/components/students/StudentManagement.vue')
      },
      {
        path: 'evaluations',
        name: 'evaluations',
        component: () => import('@/components/evaluations/EvaluationTemplates.vue')
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/components/reports/ReportsDashboard.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: DashboardLayout,
    beforeEnter: requireAdmin,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagement.vue')
      },
      {
        path: 'assignments',
        name: 'admin-assignments',
        component: () => import('@/views/admin/AssignmentManagement.vue')
      }
    ]
  },
  {
    path: '/pending-approval',
    name: 'pending-approval',
    component: () => import('@/views/PendingApproval.vue')
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/Unauthorized.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 