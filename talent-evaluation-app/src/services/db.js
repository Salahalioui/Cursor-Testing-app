const DB_NAME = 'talentEvaluationDB'
const DB_VERSION = 2
const STUDENT_STORE = 'students'
const TEMPLATE_STORE = 'evaluationTemplates'
const EVALUATION_STORE = 'evaluations'

let db = null

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Database error:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('Database initialized successfully')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      console.log('Database upgrade needed')
      
      // Create the students object store if it doesn't exist
      if (!db.objectStoreNames.contains(STUDENT_STORE)) {
        const store = db.createObjectStore(STUDENT_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        })

        store.createIndex('name', 'name', { unique: false })
        store.createIndex('grade', 'grade', { unique: false })
        store.createIndex('studentId', 'studentId', { unique: true })
      }

      // Create the evaluation templates store if it doesn't exist
      if (!db.objectStoreNames.contains(TEMPLATE_STORE)) {
        const templateStore = db.createObjectStore(TEMPLATE_STORE, {
          keyPath: 'id',
          autoIncrement: true
        })

        templateStore.createIndex('name', 'name', { unique: false })
        templateStore.createIndex('sportType', 'sportType', { unique: false })
        templateStore.createIndex('gradeLevel', 'gradeLevel', { unique: false })
        console.log('Template store created')
      }

      // Create the evaluations store if it doesn't exist
      if (!db.objectStoreNames.contains(EVALUATION_STORE)) {
        const evaluationStore = db.createObjectStore(EVALUATION_STORE, {
          keyPath: 'id',
          autoIncrement: true
        })

        evaluationStore.createIndex('studentId', 'studentId', { unique: false })
        evaluationStore.createIndex('templateId', 'templateId', { unique: false })
        evaluationStore.createIndex('date', 'date', { unique: false })
        evaluationStore.createIndex('evaluator', 'evaluator', { unique: false })
      }
    }
  })
}

// Helper function to prepare student data for storage
const prepareStudentData = (student) => {
  return {
    ...student,
    // Ensure activities is an array and convert it to JSON string
    activities: JSON.stringify(Array.isArray(student.activities) ? student.activities : []),
    // Add timestamp for sorting/tracking
    updatedAt: new Date().toISOString()
  }
}

// Helper function to parse student data from storage
const parseStudentData = (student) => {
  return {
    ...student,
    // Parse activities back to array
    activities: JSON.parse(student.activities || '[]')
  }
}

// Check if student ID already exists
export const checkStudentIdExists = async (studentId, excludeId = null) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STUDENT_STORE], 'readonly')
    const store = transaction.objectStore(STUDENT_STORE)
    const request = store.openCursor()
    let exists = false

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        if (cursor.value.studentId === studentId && cursor.value.id !== excludeId) {
          exists = true
        }
        cursor.continue()
      } else {
        resolve(exists)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

// CRUD operations for students
export const addStudent = async (student) => {
  // Check if student ID already exists
  const exists = await checkStudentIdExists(student.studentId)
  if (exists) {
    throw new Error('Student ID already exists')
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STUDENT_STORE], 'readwrite')
      const store = transaction.objectStore(STUDENT_STORE)
      const preparedData = prepareStudentData(student)
      const request = store.add(preparedData)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to add student'))
    } catch (error) {
      reject(new Error('Failed to process student data'))
    }
  })
}

export const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STUDENT_STORE], 'readonly')
    const store = transaction.objectStore(STUDENT_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const students = request.result.map(parseStudentData)
      resolve(students)
    }
    request.onerror = () => reject(new Error('Failed to fetch students'))
  })
}

export const updateStudent = async (student) => {
  // Check if student ID already exists (excluding current student)
  const exists = await checkStudentIdExists(student.studentId, student.id)
  if (exists) {
    throw new Error('Student ID already exists')
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STUDENT_STORE], 'readwrite')
      const store = transaction.objectStore(STUDENT_STORE)
      const preparedData = prepareStudentData(student)
      const request = store.put(preparedData)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to update student'))
    } catch (error) {
      reject(new Error('Failed to process student data'))
    }
  })
}

export const deleteStudent = (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STUDENT_STORE], 'readwrite')
    const store = transaction.objectStore(STUDENT_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Failed to delete student'))
  })
}

export const getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STUDENT_STORE], 'readonly')
    const store = transaction.objectStore(STUDENT_STORE)
    const request = store.get(id)

    request.onsuccess = () => {
      const student = request.result ? parseStudentData(request.result) : null
      resolve(student)
    }
    request.onerror = () => reject(new Error('Failed to fetch student'))
  })
}

// Template CRUD operations
export const addTemplate = async (template) => {
  console.log('Adding template:', template) // Debug log

  if (!db) {
    console.error('Database not initialized')
    throw new Error('Database not initialized')
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([TEMPLATE_STORE], 'readwrite')
      const store = transaction.objectStore(TEMPLATE_STORE)

      // Prepare template data
      const templateData = {
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('Prepared template data:', templateData) // Debug log

      const request = store.add(templateData)

      request.onsuccess = () => {
        console.log('Template added successfully:', request.result)
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('Error adding template:', request.error)
        reject(new Error('Failed to add template'))
      }

      transaction.oncomplete = () => {
        console.log('Transaction completed')
      }

      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error)
      }
    } catch (error) {
      console.error('Error in addTemplate:', error)
      reject(new Error('Failed to process template data'))
    }
  })
}

export const getAllTemplates = () => {
  if (!db) {
    console.error('Database not initialized')
    throw new Error('Database not initialized')
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([TEMPLATE_STORE], 'readonly')
      const store = transaction.objectStore(TEMPLATE_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        console.log('Retrieved templates:', request.result)
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('Error getting templates:', request.error)
        reject(new Error('Failed to fetch templates'))
      }
    } catch (error) {
      console.error('Error in getAllTemplates:', error)
      reject(new Error('Failed to fetch templates'))
    }
  })
}

export const updateTemplate = async (template) => {
  const templateData = {
    ...template,
    criteria: JSON.stringify(template.criteria),
    updatedAt: new Date().toISOString()
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([TEMPLATE_STORE], 'readwrite')
      const store = transaction.objectStore(TEMPLATE_STORE)
      const request = store.put(templateData)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to update template'))
    } catch (error) {
      reject(new Error('Failed to process template data'))
    }
  })
}

export const deleteTemplate = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([TEMPLATE_STORE], 'readwrite')
      const store = transaction.objectStore(TEMPLATE_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to delete template'))
    } catch (error) {
      reject(new Error('Failed to delete template'))
    }
  })
}

// Evaluation CRUD operations
export const addEvaluation = async (evaluation) => {
  const evaluationData = {
    ...evaluation,
    scores: JSON.stringify(evaluation.scores),
    comments: JSON.stringify(evaluation.comments || {}),
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([EVALUATION_STORE], 'readwrite')
      const store = transaction.objectStore(EVALUATION_STORE)
      const request = store.add(evaluationData)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to add evaluation'))
    } catch (error) {
      reject(new Error('Failed to process evaluation data'))
    }
  })
}

export const getStudentEvaluations = (studentId) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EVALUATION_STORE], 'readonly')
    const store = transaction.objectStore(EVALUATION_STORE)
    const index = store.index('studentId')
    const request = index.getAll(studentId)

    request.onsuccess = () => {
      const evaluations = request.result.map(evaluation => ({
        ...evaluation,
        scores: JSON.parse(evaluation.scores),
        comments: JSON.parse(evaluation.comments || '{}')
      }))
      resolve(evaluations)
    }
    request.onerror = () => reject(new Error('Failed to fetch evaluations'))
  })
} 