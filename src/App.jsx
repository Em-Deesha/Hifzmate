import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import QuranReader from './pages/QuranReader'
import Planner from './pages/Planner'
import Quiz from './pages/Quiz'
import Bookmarks from './pages/Bookmarks'
import Badges from './pages/Badges'
import Profile from './pages/Profile'
import AuthModal from './components/AuthModal'
import ToastContainer, { useToast } from './components/ToastContainer'
import AchievementModal from './components/AchievementModal'
import PlannerReminder from './components/PlannerReminder'
// Firebase service will be available globally via script tag

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')
  const [achievement, setAchievement] = useState(null)
  const { showToast, removeToast, toasts } = useToast()

  // Make toast available globally
  useEffect(() => {
    window.showToast = showToast
    window.showAchievement = (surahName, medal) => {
      setAchievement({ surahName, medal })
    }
  }, [showToast])

  useEffect(() => {
    // Initialize Firebase auth listener
    if (typeof firebase !== 'undefined') {
      firebase.auth().onAuthStateChanged((user) => {
        setUser(user)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleLogout = async () => {
    if (window.firebaseService) {
      await window.firebaseService.signOut()
    } else if (typeof firebase !== 'undefined') {
      await firebase.auth().signOut()
    }
    setUser(null)
    if (window.showToast) {
      window.showToast('Logged out successfully', 'info')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-islamic-green to-islamic-green-light">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
        <div className="text-white text-xl font-semibold">Loading HifzMate...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar 
          user={user} 
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={user ? <Home user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/home" element={<Home user={user} />} />
          <Route path="/reader" element={<QuranReader user={user} />} />
          <Route path="/planner" element={<Planner user={user} />} />
          <Route path="/quiz" element={<Quiz user={user} />} />
          <Route path="/bookmarks" element={<Bookmarks user={user} />} />
          <Route path="/badges" element={<Badges user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={<div>Login page - redirecting...</div>} />
        </Routes>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={(user) => setUser(user)} />
        )}

        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {achievement && (
          <AchievementModal
            surahName={achievement.surahName}
            medal={achievement.medal}
            onClose={() => setAchievement(null)}
          />
        )}

        <PlannerReminder user={user} />
      </div>
    </Router>
  )
}

export default App

