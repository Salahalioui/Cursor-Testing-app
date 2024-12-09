import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Helper function to calculate average score
const calculateAverage = (scores) => {
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0)
  return (total / Object.values(scores).length).toFixed(2)
}

export const exportToPDF = (data, type = 'student') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  let yPos = 20

  // Add title
  doc.setFontSize(20)
  doc.text('Talent Evaluation Report', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Add report type and date
  doc.setFontSize(12)
  doc.text(`Report Type: ${type === 'student' ? 'Student Progress' : 'Team Performance'}`, 20, yPos)
  yPos += 10
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos)
  yPos += 15

  if (type === 'student' && data.student) {
    // Add student information
    doc.setFontSize(16)
    doc.text('Student Information', 20, yPos)
    yPos += 10
    doc.setFontSize(12)
    doc.text(`Name: ${data.student.name}`, 20, yPos)
    yPos += 7
    doc.text(`Grade: ${data.student.grade}`, 20, yPos)
    yPos += 7
    doc.text(`Activities: ${data.student.activities.join(', ')}`, 20, yPos)
    yPos += 15

    // Add evaluation results
    if (data.evaluations && data.evaluations.length > 0) {
      doc.setFontSize(16)
      doc.text('Evaluation History', 20, yPos)
      yPos += 10

      data.evaluations.forEach(evaluation => {
        if (yPos > 250) { // Check if we need a new page
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(12)
        doc.text(`Date: ${formatDate(evaluation.date)}`, 20, yPos)
        yPos += 7
        doc.text(`Evaluator: ${evaluation.evaluator}`, 20, yPos)
        yPos += 7
        doc.text(`Average Score: ${calculateAverage(evaluation.scores)}/5`, 20, yPos)
        yPos += 10

        // Add scores
        Object.entries(evaluation.scores).forEach(([key, score]) => {
          doc.text(`${key.split('-')[1]}: ${score}/5`, 30, yPos)
          yPos += 7
        })
        yPos += 10
      })
    }
  } else if (type === 'team') {
    // Add team statistics
    doc.setFontSize(16)
    doc.text('Team Performance Summary', 20, yPos)
    yPos += 10
    doc.setFontSize(12)

    if (data.stats) {
      doc.text(`Total Students: ${data.stats.totalStudents}`, 20, yPos)
      yPos += 7
      doc.text(`Total Evaluations: ${data.stats.totalEvaluations}`, 20, yPos)
      yPos += 7
      doc.text(`Team Average: ${data.stats.averageScore}/5`, 20, yPos)
      yPos += 15

      // Add category averages
      if (data.stats.categoryAverages) {
        doc.setFontSize(14)
        doc.text('Category Averages', 20, yPos)
        yPos += 10
        doc.setFontSize(12)

        data.stats.categoryAverages.forEach(category => {
          doc.text(`${category.category}: ${category.average}/5`, 30, yPos)
          yPos += 7
        })
      }
    }
  }

  // Save the PDF
  const fileName = type === 'student' 
    ? `${data.student?.name.replace(/\s+/g, '_')}_evaluation_${new Date().toISOString().split('T')[0]}.pdf`
    : `team_performance_${new Date().toISOString().split('T')[0]}.pdf`
  
  doc.save(fileName)
}

export const exportToExcel = (data, type = 'student') => {
  let workbook = XLSX.utils.book_new()
  
  if (type === 'student' && data.evaluations) {
    // Create worksheet for evaluation history
    const wsData = data.evaluations.map(evaluation => ({
      Date: formatDate(evaluation.date),
      Evaluator: evaluation.evaluator,
      'Average Score': calculateAverage(evaluation.scores),
      ...Object.entries(evaluation.scores).reduce((acc, [key, value]) => {
        acc[key.split('-')[1]] = value
        return acc
      }, {})
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    XLSX.utils.book_append_sheet(workbook, ws, 'Evaluation History')

    // Add student info sheet
    if (data.student) {
      const studentInfo = [{
        Name: data.student.name,
        Grade: data.student.grade,
        Activities: data.student.activities.join(', ')
      }]
      const infoWs = XLSX.utils.json_to_sheet(studentInfo)
      XLSX.utils.book_append_sheet(workbook, infoWs, 'Student Info')
    }
  } else if (type === 'team' && data.stats) {
    // Create worksheet for team statistics
    const statsWs = XLSX.utils.json_to_sheet([{
      'Total Students': data.stats.totalStudents,
      'Total Evaluations': data.stats.totalEvaluations,
      'Team Average': data.stats.averageScore
    }])
    XLSX.utils.book_append_sheet(workbook, statsWs, 'Team Stats')

    // Add category averages sheet
    if (data.stats.categoryAverages) {
      const categoryWs = XLSX.utils.json_to_sheet(
        data.stats.categoryAverages.map(cat => ({
          Category: cat.category,
          Average: cat.average
        }))
      )
      XLSX.utils.book_append_sheet(workbook, categoryWs, 'Category Averages')
    }
  }

  // Save the Excel file
  const fileName = type === 'student'
    ? `${data.student?.name.replace(/\s+/g, '_')}_evaluation_${new Date().toISOString().split('T')[0]}.xlsx`
    : `team_performance_${new Date().toISOString().split('T')[0]}.xlsx`
  
  XLSX.writeFile(workbook, fileName)
} 