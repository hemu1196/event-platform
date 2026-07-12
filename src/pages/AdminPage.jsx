import { useState, useEffect } from 'react'
import { FiLock, FiPlus, FiEdit2, FiTrash2, FiUsers, FiCalendar, FiTrendingUp, FiEye, FiX, FiSave, FiLogOut, FiSearch, FiCheckCircle, FiAlertCircle, FiCamera } from 'react-icons/fi'
import { getEvents, createEvent, updateEvent, deleteEvent, getRegistrations } from '../services/supabase'
import { mockEvents } from '../utils/mockData'
import { format } from 'date-fns'

const ADMIN_PASSWORD = 'admin123'

const defaultForm = {
  title: '', description: '', image: '', date: '', time: '',
  venue: '', category: 'Technology', fee: 0, seats: 100, organizer: ''
}

const CATEGORIES = ['Technology', 'Hackathon', 'Cultural', 'Business', 'Sports', 'Workshop']

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminAuth') === 'true')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('events')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formLoading, setFormLoading] = useState(false)
  const [regSearch, setRegSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Ticket Validator states
  const [validateId, setValidateId] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [cameraSimulating, setCameraSimulating] = useState(false)

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  const loadData = async () => {
    setLoading(true)
    try {
      const [evData, regData] = await Promise.all([getEvents(), getRegistrations()])
      const dbRegs = regData || []
      const localRegs = window.localRegistrations || []
      
      // Merge local mock registrations with DB registrations
      const combinedRegs = [...localRegs, ...dbRegs]
      
      setEvents(evData.length > 0 ? evData : mockEvents)
      setRegistrations(combinedRegs)
    } catch {
      const localRegs = window.localRegistrations || []
      setEvents(mockEvents)
      setRegistrations(localRegs)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateTicket = (e) => {
    if (e) e.preventDefault()
    setScanResult(null)
    const targetId = validateId.trim().toUpperCase()
    
    if (!targetId) return

    const reg = registrations.find(r => r.registration_id?.toUpperCase() === targetId)

    if (reg) {
      if (reg.checked_in) {
        setScanResult({
          status: 'warning',
          message: 'Ticket already validated & check-in approved!',
          registration: reg
        })
      } else {
        reg.checked_in = true
        setScanResult({
          status: 'success',
          message: 'Ticket validated successfully! Attendee checked in.',
          registration: reg
        })
      }
    } else {
      setScanResult({
        status: 'error',
        message: 'Invalid Ticket ID! Access Denied.'
      })
    }
  }

  const simulateCameraScan = () => {
    setCameraSimulating(true)
    setScanResult(null)
    
    setTimeout(() => {
      setCameraSimulating(false)
      if (registrations.length > 0) {
        const randomReg = registrations[Math.floor(Math.random() * registrations.length)]
        setValidateId(randomReg.registration_id)
        
        const targetId = randomReg.registration_id.toUpperCase()
        const reg = registrations.find(r => r.registration_id?.toUpperCase() === targetId)
        if (reg) {
          if (reg.checked_in) {
            setScanResult({
              status: 'warning',
              message: 'Ticket already scanned & check-in approved!',
              registration: reg
            })
          } else {
            reg.checked_in = true
            setScanResult({
              status: 'success',
              message: 'Camera scanned successfully! Attendee checked in.',
              registration: reg
            })
          }
        }
      } else {
        setScanResult({
          status: 'error',
          message: 'No registered attendees found to simulate scan.'
        })
      }
    }, 1800)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true')
      setAuthed(true)
      setLoginError('')
    } else {
      setLoginError('Invalid password. Try: admin123')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    setAuthed(false)
  }

  const openCreate = () => {
    setEditingEvent(null)
    setForm(defaultForm)
    setShowForm(true)
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setForm({ ...event })
    setShowForm(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'fee' || name === 'seats' ? Number(value) : value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form)
      } else {
        await createEvent(form)
      }
      await loadData()
      setShowForm(false)
    } catch {
      // Demo fallback
      if (editingEvent) {
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...form } : ev))
      } else {
        const newEvent = { ...form, id: Date.now().toString() }
        setEvents(prev => [...prev, newEvent])
      }
      setShowForm(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id)
      await loadData()
    } catch {
      setEvents(prev => prev.filter(e => e.id !== id))
    }
    setDeleteConfirm(null)
  }

  const filteredRegs = registrations.filter(r =>
    !regSearch || r.name?.toLowerCase().includes(regSearch.toLowerCase()) ||
    r.email?.toLowerCase().includes(regSearch.toLowerCase()) ||
    r.registration_id?.toLowerCase().includes(regSearch.toLowerCase())
  )

  if (!authed) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8" style={{ borderRadius: '1.5rem' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
              <FiLock size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Admin Portal</h2>
            <p className="text-slate-400 text-sm">Enter password to access the admin dashboard</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password" className="input-field" autoFocus />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3">
              <FiLock size={14} /> Access Dashboard
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl text-center"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-xs text-slate-500">Demo password: <span className="font-mono font-bold text-blue-400">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  )

  const upcomingCount = events.filter(e => new Date(e.date) > new Date()).length

  return (
    <div className="min-h-screen mesh-bg pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage events and view registrations</p>
          </div>
          <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
            <FiLogOut size={14} /> Logout
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Events', value: events.length, icon: FiCalendar, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
            { label: 'Total Registrations', value: registrations.length, icon: FiUsers, color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
            { label: 'Upcoming Events', value: upcomingCount, icon: FiTrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-5 flex items-center gap-4" style={{ borderRadius: '1.25rem' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg, border: `1px solid ${color}33` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? '...' : value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'events', label: 'Events', icon: FiCalendar },
            { key: 'registrations', label: 'Registrations', icon: FiUsers },
            { key: 'validator', label: 'Ticket Validator', icon: FiCheckCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: tab === key ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.05)',
                color: tab === key ? '#fff' : 'rgba(148,163,184,0.8)',
                border: tab === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {tab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">All Events ({events.length})</h2>
              <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">
                <FiPlus size={14} /> Create Event
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(event => (
                  <div key={event.id} className="glass-card p-4 flex items-start justify-between gap-4"
                    style={{ borderRadius: '1rem' }}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=60'}
                        alt={event.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{event.venue}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs" style={{ color: '#a78bfa' }}>{event.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{event.date}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs" style={{ color: '#34d399' }}>{event.fee === 0 ? 'FREE' : `₹${event.fee}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(event)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}>
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(event.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registrations Tab */}
        {tab === 'registrations' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">All Registrations ({registrations.length})</h2>
              <div className="relative w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                <input value={regSearch} onChange={e => setRegSearch(e.target.value)}
                  placeholder="Search registrations..." className="input-field pl-9 text-sm py-2" />
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-16 glass-card" style={{ borderRadius: '1.25rem' }}>
                <FiUsers size={40} className="mx-auto mb-3 opacity-20 text-purple-400" />
                <h3 className="text-white font-bold mb-2">No Registrations Yet</h3>
                <p className="text-slate-500 text-sm">Registrations will appear here once people start signing up.</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                        {['Reg ID', 'Name', 'Email', 'College', 'Year', 'Event', 'Date'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegs.map((reg, i) => (
                        <tr key={reg.id || i}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: '#a78bfa' }}>
                            {reg.registration_id}
                          </td>
                          <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{reg.name}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{reg.email}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{reg.college}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{reg.year}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {reg.events?.title || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                            {reg.created_at ? format(new Date(reg.created_at), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ticket Validator Tab */}
        {tab === 'validator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left - Scanner Interface */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6" style={{ borderRadius: '1.25rem' }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiCamera className="text-purple-400" /> Ticket Scanner
                </h3>
                
                {/* Visual Camera Simulation Box */}
                <div className="relative aspect-video md:aspect-square w-full rounded-xl overflow-hidden bg-black/60 border border-white/06 flex flex-col items-center justify-center mb-6">
                  {cameraSimulating ? (
                    <div className="text-center z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
                      <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">Scanning QR Code...</p>
                    </div>
                  ) : (
                    <div className="text-center z-10 p-4">
                      <FiCamera size={36} className="text-slate-600 mx-auto mb-3 animate-pulse" />
                      <p className="text-xs text-slate-500 font-semibold">Simulate Ticket Check-In via Camera</p>
                      <button onClick={simulateCameraScan} className="btn-primary py-1.5 px-4 text-xs mt-4 justify-center mx-auto">
                        Simulate QR Scan
                      </button>
                    </div>
                  )}

                  {/* High tech green scanner line overlay */}
                  {cameraSimulating && (
                    <div className="absolute left-0 right-0 h-0.5 bg-green-400/80 shadow-[0_0_10px_#4ade80]"
                      style={{
                        animation: 'scanner 2.5s ease-in-out infinite'
                      }}
                    />
                  )}

                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-700" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-700" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-700" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-700" />
                </div>

                <div className="text-center text-xs text-slate-500 mb-4">— OR ENTER TICKET ID MANUALLY —</div>

                <form onSubmit={handleValidateTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registration Ticket ID</label>
                    <input value={validateId} onChange={e => setValidateId(e.target.value)}
                      placeholder="e.g. REG-2026-1234" className="input-field uppercase font-mono tracking-wider animate-fadeIn" required />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm">
                    Verify & Validate Ticket
                  </button>
                </form>
              </div>
            </div>

            {/* Right - Scanned Result / Verification Report */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 min-h-[300px] flex flex-col justify-between" style={{ borderRadius: '1.25rem' }}>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Verification Report</h3>
                  
                  {!scanResult ? (
                    <div className="text-center py-16 text-slate-500">
                      <FiCheckCircle size={48} className="mx-auto mb-3 opacity-10 text-purple-400" />
                      <p className="text-sm">Scan a QR code or submit a Registration ID to validate tickets and manage attendance.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Result Banner */}
                      <div className="p-4 rounded-xl flex items-center gap-3 border"
                        style={{
                          background: scanResult.status === 'success' ? 'rgba(16,185,129,0.1)' : scanResult.status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          borderColor: scanResult.status === 'success' ? 'rgba(16,185,129,0.3)' : scanResult.status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
                          color: scanResult.status === 'success' ? '#34d399' : scanResult.status === 'warning' ? '#fbbf24' : '#f87171'
                        }}>
                        {scanResult.status === 'success' ? <FiCheckCircle size={22} /> : <FiAlertCircle size={22} />}
                        <div>
                          <div className="font-bold text-sm uppercase tracking-wider">
                            {scanResult.status === 'success' ? 'ACCESS GRANTED' : scanResult.status === 'warning' ? 'DUPLICATE TICKET' : 'ACCESS DENIED'}
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">{scanResult.message}</div>
                        </div>
                      </div>

                      {scanResult.registration && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/02 border border-white/06 animate-fadeIn">
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Attendee Name</div>
                            <div className="text-sm font-bold text-white mt-0.5">{scanResult.registration.name}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Registration ID</div>
                            <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">{scanResult.registration.registration_id}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Registered Event</div>
                            <div className="text-sm font-bold text-white mt-0.5 leading-snug">{scanResult.registration.events?.title || 'Unknown Event'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">College & Dept</div>
                            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{scanResult.registration.college} • {scanResult.registration.department}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Payment Info</div>
                            <div className="text-xs text-slate-300 mt-0.5 font-bold uppercase" style={{ color: '#34d399' }}>
                              PAID (TXN: {scanResult.registration.payment_id || 'FREE'})
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Attendance Log</div>
                            <div className="text-xs text-purple-300 mt-0.5 font-semibold">
                              Checked In: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {scanResult && (
                  <button onClick={() => { setScanResult(null); setValidateId('') }} className="btn-outline justify-center py-2 text-xs mt-6">
                    Clear Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto glass-card p-6"
            style={{ borderRadius: '1.5rem' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                <FiX size={15} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Event Title *</label>
                  <input name="title" value={form.title} onChange={handleFormChange}
                    required placeholder="TechFest 2026 — Annual Tech Summit" className="input-field" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange}
                    required rows={3} placeholder="Describe the event..." className="input-field resize-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Image URL</label>
                  <input name="image" value={form.image} onChange={handleFormChange}
                    placeholder="https://images.unsplash.com/..." className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date *</label>
                  <input name="date" type="date" value={form.date} onChange={handleFormChange}
                    required className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Time *</label>
                  <input name="time" value={form.time} onChange={handleFormChange}
                    required placeholder="10:00 AM" className="input-field" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Venue *</label>
                  <input name="venue" value={form.venue} onChange={handleFormChange}
                    required placeholder="IIIT Hyderabad, Main Auditorium" className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
                  <select name="category" value={form.category} onChange={handleFormChange} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Organizer</label>
                  <input name="organizer" value={form.organizer} onChange={handleFormChange}
                    placeholder="ACM Student Chapter" className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fee (₹)</label>
                  <input name="fee" type="number" min="0" value={form.fee} onChange={handleFormChange}
                    className="input-field" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total Seats</label>
                  <input name="seats" type="number" min="1" value={form.seats} onChange={handleFormChange}
                    className="input-field" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center py-2.5 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                  {formLoading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving...</>
                  ) : (
                    <><FiSave size={14} />{editingEvent ? 'Update Event' : 'Create Event'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card p-6 max-w-sm w-full text-center" style={{ borderRadius: '1.5rem' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <FiTrash2 size={22} style={{ color: '#f87171' }} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Delete Event?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. All data for this event will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 justify-center py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
