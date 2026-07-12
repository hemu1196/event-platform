import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiGrid, FiList, FiCalendar } from 'react-icons/fi'
import EventCard from '../components/events/EventCard'
import { getEvents } from '../services/supabase'
import { mockEvents, categories } from '../utils/mockData'

export default function EventsPage() {
  const [searchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All')
  }, [searchParams])

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await getEvents({ category: selectedCategory, search })
        setEvents(data.length > 0 ? data : mockEvents)
      } catch {
        setEvents(mockEvents)
      } finally {
        setLoading(false)
      }
    }
    const debounce = setTimeout(fetchEvents, 300)
    return () => clearTimeout(debounce)
  }, [selectedCategory, search])

  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'All' || e.category === selectedCategory
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen mesh-bg pt-20">
      {/* Page Header */}
      <div className="py-12 px-6" style={{ background: '#f3ede3', borderBottom: '1px solid #ddd3c4' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-semibold">
            <span>Home</span><span>/</span><span style={{ color: '#0d3d3a' }}>Events</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-teal mb-3">
            Discover <span className="gradient-text italic font-serif">Events</span>
          </h1>
          <p className="text-slate-600 text-base font-semibold">
            Browse {events.length}+ events from colleges across India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filter Bar */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row items-center gap-4"
          style={{ borderRadius: '1rem' }}>
          {/* Search */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search events by name or venue..."
              className="input-field pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
            <FiFilter size={14} className="text-slate-500 flex-shrink-0" />
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer"
                  style={{
                    background: selectedCategory === cat ? '#0d3d3a' : '#faf7f2',
                    color: selectedCategory === cat ? '#faf7f2' : '#4a3f35',
                    border: selectedCategory === cat ? 'none' : '1px solid #ddd3c4',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 glass p-1 rounded-lg flex-shrink-0 border border-border-ivory">
            {[{ mode: 'grid', Icon: FiGrid }, { mode: 'list', Icon: FiList }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="p-2 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  background: viewMode === mode ? 'rgba(13,61,58,0.15)' : 'transparent',
                  color: viewMode === mode ? '#0d3d3a' : '#8a7a6d',
                }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600 font-semibold">
            Showing <span className="text-teal font-extrabold">{filtered.length}</span> events
            {selectedCategory !== 'All' && <span> in <span className="font-extrabold" style={{ color: '#0d3d3a' }}>{selectedCategory}</span></span>}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-80 animate-pulse"
                style={{ background: 'rgba(13,61,58,0.04)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FiCalendar size={56} className="mx-auto mb-4 opacity-25 text-teal" />
            <h3 className="text-xl font-extrabold text-teal mb-2">No Events Found</h3>
            <p className="text-slate-600 mb-6 font-semibold">Try adjusting your search or filter criteria</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All') }}
              className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
