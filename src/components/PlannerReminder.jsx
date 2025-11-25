import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebaseData } from '../hooks/useFirebaseData'

const PlannerReminder = ({ user }) => {
  const [showReminder, setShowReminder] = useState(false)
  const { plans } = useFirebaseData(user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || plans.length === 0) {
      setShowReminder(false)
      return
    }

    // Check if reminder was shown today
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('plannerReminderLastShown')
    
    if (lastShown !== today) {
      setShowReminder(true)
      // Mark as shown for today
      localStorage.setItem('plannerReminderLastShown', today)
    }
  }, [user, plans])

  const handleClick = () => {
    navigate('/planner')
    setShowReminder(false)
  }

  const handleDismiss = () => {
    setShowReminder(false)
  }

  if (!showReminder || plans.length === 0) return null

  return (
    <div
      onClick={handleClick}
      className="fixed top-20 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 border-islamic-green cursor-pointer hover:shadow-3xl transition-all transform hover:scale-105 max-w-sm animate-slide-in"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-islamic-green rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🗓️</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              Daily Reminder
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              You have <strong className="text-islamic-green">{plans.length}</strong> active memorization plan{plans.length > 1 ? 's' : ''}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Click to view your plans →
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlannerReminder

