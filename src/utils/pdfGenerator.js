import jsPDF from 'jspdf'
import { format } from 'date-fns'

export const generateRegistrationPDF = (registration, event) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  
  const W = 210
  const teal = [13, 61, 58]
  const gold = [201, 146, 58]
  const darkTeal = [6, 31, 29]
  const bgIvory = [250, 247, 242]
  const textDark = [26, 20, 16]
  const textMuted = [138, 122, 109]
  const borderIvory = [221, 211, 196]
  const white = [255, 255, 255]

  // Background
  doc.setFillColor(...bgIvory)
  doc.rect(0, 0, W, 297, 'F')

  // Top header band
  doc.setFillColor(...teal)
  doc.rect(0, 0, W, 60, 'F')
  doc.setFillColor(...darkTeal)
  doc.rect(120, 0, W - 120, 60, 'F')

  // Decorative circles
  doc.setFillColor(255, 255, 255, 0.04)
  doc.circle(30, 30, 40, 'F')
  doc.circle(180, 10, 30, 'F')

  // Logo/Title
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('EventHub', 20, 26)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(243, 237, 227)
  doc.text('Event Registration Portal', 20, 36)

  // Registration Confirmed badge
  doc.setFillColor(...white)
  doc.roundedRect(20, 43, 60, 10, 2, 2, 'F')
  doc.setTextColor(...teal)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('✓  REGISTRATION CONFIRMED', 22, 49.5)

  // Registration ID (top right)
  doc.setTextColor(...white)
  doc.setFontSize(10)
  doc.text('Registration ID', W - 20, 20, { align: 'right' })
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(registration.registration_id, W - 20, 30, { align: 'right' })
  
  const date = new Date()
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(243, 237, 227)
  doc.text(`Issued: ${format(date, 'dd MMM yyyy, hh:mm a')}`, W - 20, 40, { align: 'right' })

  // Event Card
  doc.setFillColor(...white)
  doc.roundedRect(15, 70, W - 30, 55, 4, 4, 'F')
  doc.setDrawColor(...borderIvory)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, 70, W - 30, 55, 4, 4, 'S')

  doc.setFillColor(...teal)
  doc.roundedRect(15, 70, 4, 55, 4, 4, 'F')
  doc.rect(16, 70, 3, 55, 'F')

  doc.setTextColor(...textMuted)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('EVENT DETAILS', 28, 81)

  doc.setTextColor(...teal)
  doc.setFontSize(15)
  doc.text(event?.title || registration.events?.title || 'Event Title', 28, 91)

  doc.setFillColor(...gold)
  doc.roundedRect(28, 96, 25, 5.5, 1.5, 1.5, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(7)
  doc.text(event?.category || 'Event', 32, 100)

  doc.setTextColor(...textDark)
  doc.setFontSize(9.5)
  const eventDate = event?.date ? format(new Date(event.date), 'EEEE, MMMM dd, yyyy') : (registration.events?.date || '')
  doc.text(`📅  ${eventDate} at ${event?.time || 'TBA'}`, 28, 110)
  doc.text(`📍  ${event?.venue || registration.events?.venue || ''}`, 28, 117)

  // Participant Details
  doc.setFillColor(...white)
  doc.roundedRect(15, 135, W - 30, 80, 4, 4, 'F')
  doc.setDrawColor(...borderIvory)
  doc.roundedRect(15, 135, W - 30, 80, 4, 4, 'S')
  doc.setFillColor(...gold)
  doc.roundedRect(15, 135, 4, 80, 4, 4, 'F')
  doc.rect(16, 135, 3, 80, 'F')

  doc.setTextColor(...textMuted)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PARTICIPANT DETAILS', 28, 146)

  const details = [
    ['Full Name', registration.name],
    ['Email Address', registration.email],
    ['Phone Number', registration.phone],
    ['College / Institution', registration.college],
    ['Department', registration.department],
    ['Year of Study', `${registration.year}`],
  ]

  doc.setFont('helvetica', 'normal')
  details.forEach(([label, value], i) => {
    const y = 156 + i * 9
    doc.setFontSize(8)
    doc.setTextColor(...textMuted)
    doc.text(label, 28, y)
    doc.setFontSize(9.5)
    doc.setTextColor(...textDark)
    doc.text(value || '-', 90, y)
  })

  // Fee & Payment Details Block
  doc.setFillColor(243, 237, 227)
  doc.roundedRect(15, 220, W - 30, 32, 4, 4, 'F')
  doc.roundedRect(15, 220, W - 30, 32, 4, 4, 'S')
  
  doc.setTextColor(...textMuted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('REGISTRATION FEE', 25, 228)
  doc.text('PAYMENT STATUS', 75, 228)
  doc.text('TRANSACTION ID', 75, 240)

  doc.setTextColor(...teal)
  doc.setFontSize(12)
  doc.text(event?.fee === 0 ? 'FREE' : `₹ ${event?.fee || 0}`, 25, 238)
  
  doc.setFillColor(...teal)
  doc.roundedRect(75, 231, 16, 5, 1, 1, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(6.5)
  doc.text('✓ PAID', 79, 234.5)
  
  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(registration.payment_id || 'FREE', 75, 246)

  // Vector QR Simulation
  const qrX = 160
  const qrY = 222
  doc.setFillColor(...white)
  doc.roundedRect(qrX - 2, qrY - 2, 28, 28, 2, 2, 'F')
  doc.setDrawColor(...borderIvory)
  doc.roundedRect(qrX - 2, qrY - 2, 28, 28, 2, 2, 'S')
  
  doc.setFillColor(...teal)
  // Draw three outer corner squares
  doc.rect(qrX, qrY, 7, 7, 'F')
  doc.rect(qrX + 17, qrY, 7, 7, 'F')
  doc.rect(qrX, qrY + 17, 7, 7, 'F')
  
  doc.setFillColor(...white)
  doc.rect(qrX + 2, qrY + 2, 3, 3, 'F')
  doc.rect(qrX + 19, qrY + 2, 3, 3, 'F')
  doc.rect(qrX + 2, qrY + 19, 3, 3, 'F')
  
  doc.setFillColor(...teal)
  doc.rect(qrX + 3, qrY + 3, 1, 1, 'F')
  doc.rect(qrX + 20, qrY + 3, 1, 1, 'F')
  doc.rect(qrX + 3, qrY + 20, 1, 1, 'F')
  
  // Draw random pixels inside QR
  doc.rect(qrX + 10, qrY + 1, 2, 2, 'F')
  doc.rect(qrX + 13, qrY + 4, 3, 1, 'F')
  doc.rect(qrX + 8, qrY + 9, 2, 3, 'F')
  doc.rect(qrX + 12, qrY + 11, 4, 2, 'F')
  doc.rect(qrX + 19, qrY + 9, 3, 2, 'F')
  doc.rect(qrX + 9, qrY + 16, 2, 4, 'F')
  doc.rect(qrX + 14, qrY + 15, 3, 3, 'F')
  doc.rect(qrX + 18, qrY + 17, 3, 1, 'F')
  doc.rect(qrX + 22, qrY + 13, 2, 3, 'F')

  // Footer
  doc.setFillColor(...teal)
  doc.rect(0, 270, W, 27, 'F')
  doc.setTextColor(243, 237, 227)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('This is an auto-generated confirmation. Present this at the event for entry.', W / 2, 278, { align: 'center' })
  doc.text('EventHub — Premium College Event Management Platform', W / 2, 284, { align: 'center' })
  doc.setTextColor(...gold)
  doc.text('www.eventhub.vercel.app', W / 2, 290, { align: 'center' })

  doc.save(`${registration.registration_id}.pdf`)
}
