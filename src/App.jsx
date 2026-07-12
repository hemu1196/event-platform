import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import SuccessPage from './pages/SuccessPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={
              <div className="min-h-screen mesh-bg flex items-center justify-center text-center px-6">
                <div>
                  <div className="text-8xl font-black gradient-text mb-4">404</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                  <p className="text-slate-400 mb-8">The page you are looking for does not exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
