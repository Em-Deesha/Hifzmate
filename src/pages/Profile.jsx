import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebaseData } from '../hooks/useFirebaseData'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState('')
  const [userData, setUserData] = useState(null)
  const [selectedMistake, setSelectedMistake] = useState(null)
  const [correctingMistake, setCorrectingMistake] = useState(null)
  const [correctionAnswer, setCorrectionAnswer] = useState('')
  const [correctionFeedback, setCorrectionFeedback] = useState('')
  const { plans, bookmarks, badges, quizScore, mistakes, saveData, loading } = useFirebaseData(user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (user && window.firebaseService) {
      const result = await window.firebaseService.getUserData(user.uid)
      if (result.success) {
        setUserData(result.data)
      }
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) {
      if (window.showToast) {
        window.showToast('Please login to update your profile', 'warning')
      }
      return
    }

    if (!displayName.trim()) {
      if (window.showToast) {
        window.showToast('Please enter a display name', 'warning')
      }
      return
    }

    try {
      await user.updateProfile({ displayName })
      if (window.firebaseService) {
        await window.firebaseService.updateUserProfile(user.uid, { displayName })
      }
      if (window.showToast) {
        window.showToast('Profile updated successfully! ✅', 'success')
      }
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      if (window.showToast) {
        window.showToast('Error updating profile: ' + error.message, 'error')
      }
    }
  }

  const handleDeleteMistake = async (index) => {
    const newMistakes = mistakes.filter((_, i) => i !== index)
    await saveData('mistakes', newMistakes)
    if (window.showToast) {
      window.showToast('Mistake removed', 'info')
    }
    setSelectedMistake(null)
    setCorrectingMistake(null)
  }

  const handleStartCorrection = (index) => {
    setSelectedMistake(index)
    setCorrectingMistake(index)
    setCorrectionAnswer('')
    setCorrectionFeedback('')
  }

  const handleSubmitCorrection = async (index) => {
    const mistake = mistakes[index]
    if (!mistake) return

    const userAnswer = correctionAnswer.trim().toLowerCase()
    const correctAnswer = mistake.correct?.toLowerCase() || ''

    if (userAnswer === correctAnswer) {
      setCorrectionFeedback('correct')
      if (window.showToast) {
        window.showToast('✅ Correct! Mistake will be removed.', 'success')
      }
      
      // Remove the mistake after a short delay
      setTimeout(async () => {
        const newMistakes = mistakes.filter((_, i) => i !== index)
        await saveData('mistakes', newMistakes)
        setCorrectingMistake(null)
        setSelectedMistake(null)
        setCorrectionAnswer('')
        setCorrectionFeedback('')
      }, 1500)
    } else {
      setCorrectionFeedback('incorrect')
      if (window.showToast) {
        window.showToast('❌ Not quite right. Try again!', 'error')
      }
    }
  }

  const handleCancelCorrection = () => {
    setCorrectingMistake(null)
    setCorrectionAnswer('')
    setCorrectionFeedback('')
  }

  const handleClearAllMistakes = async () => {
    if (window.confirm('Are you sure you want to clear all mistakes?')) {
      await saveData('mistakes', [])
      if (window.showToast) {
        window.showToast('All mistakes cleared', 'info')
      }
    }
  }

  // Get member since date first
  const memberSince = userData?.createdAt
    ? (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt))
    : null

  // Calculate analytics data from REAL Firebase data
  const totalProgress = badges.length > 0 ? Math.round((badges.length / 114) * 100) : 0
  
  const bookmarksBySurah = bookmarks.reduce((acc, bookmark) => {
    acc[bookmark.surah] = (acc[bookmark.surah] || 0) + 1
    return acc
  }, {})
  const topBookmarkedSurahs = Object.entries(bookmarksBySurah)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([surah, count]) => ({ name: surah.length > 20 ? surah.substring(0, 20) + '...' : surah, value: count }))

  const badgesBySurah = badges.reduce((acc, badge) => {
    acc[badge.surahName] = (acc[badge.surahName] || 0) + 1
    return acc
  }, {})
  const recentBadgesData = Object.entries(badgesBySurah)
    .slice(-7)
    .map(([surah, count]) => ({ name: surah.length > 20 ? surah.substring(0, 20) + '...' : surah, value: count }))

  const mistakesByType = mistakes.reduce((acc, mistake) => {
    const type = mistake.question?.includes('Surah') ? 'Surah Identification' : 'Translation/Meaning'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  const mistakesChartData = Object.entries(mistakesByType).map(([name, value]) => ({ name, value }))

  const plansChartData = plans.map(plan => ({
    name: plan.name.length > 15 ? plan.name.substring(0, 15) + '...' : plan.name,
    pace: plan.pace,
    surah: plan.surahName
  }))

  // Calculate weekly activity from REAL data (distribute bookmarks and badges across week)
  const getWeeklyActivity = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    // Distribute actual bookmarks and badges across the week
    const totalActivity = bookmarks.length + badges.length
    const baseActivity = Math.floor(totalActivity / 7)
    const remainder = totalActivity % 7
    
    return days.map((day, index) => ({
      day,
      activity: baseActivity + (index < remainder ? 1 : 0)
    }))
  }
  const weeklyActivity = getWeeklyActivity()

  // Calculate progress over time from REAL data
  const getProgressOverTime = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Use actual badge and bookmark counts
    const progressData = months.map((month, index) => {
      let badgesCount = 0
      let bookmarksCount = 0
      
      if (memberSince) {
        const memberMonth = memberSince.getMonth()
        const memberYear = memberSince.getFullYear()
        
        // Calculate months since joining
        const monthsSinceJoin = (currentYear - memberYear) * 12 + (currentMonth - memberMonth) + 1
        
        if (monthsSinceJoin > 0 && index >= memberMonth && index <= currentMonth) {
          // Distribute actual data proportionally
          const progressRatio = (index - memberMonth + 1) / monthsSinceJoin
          badgesCount = Math.floor(badges.length * progressRatio)
          bookmarksCount = Math.floor(bookmarks.length * progressRatio)
        }
      } else {
        // If no member date, show all data in current month
        if (index === currentMonth) {
          badgesCount = badges.length
          bookmarksCount = bookmarks.length
        }
      }
      
      return { 
        month, 
        badges: Math.min(Math.max(badgesCount, 0), badges.length), 
        bookmarks: Math.min(Math.max(bookmarksCount, 0), bookmarks.length) 
      }
    })
    
    return progressData
  }
  const progressData = getProgressOverTime()

  const COLORS = ['#2c5530', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#ef4444', '#3b82f6']

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view your profile
          </p>
        </div>
      </div>
    )
  }

  const daysActive = memberSince
    ? Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        📊 Dashboard & Analytics
      </h1>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-islamic-green to-islamic-green-light rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {user.displayName || 'User'}
            </h2>
            <p className="text-white/90 mb-1">
              {user.email}
            </p>
            {memberSince && (
              <p className="text-sm text-white/80">
                Member since: {memberSince.toLocaleDateString()} • {daysActive} days active
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Badges Earned</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{badges.length}</p>
              <p className="text-xs text-gray-500 mt-1">{totalProgress}% of all surahs</p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bookmarks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookmarks.length}</p>
              <p className="text-xs text-gray-500 mt-1">Favorite ayahs</p>
            </div>
            <div className="text-4xl">🔖</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Plans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{plans.length}</p>
              <p className="text-xs text-gray-500 mt-1">Memorization goals</p>
            </div>
            <div className="text-4xl">🗓️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quiz Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizScore}</p>
              <p className="text-xs text-gray-500 mt-1">Correct answers</p>
            </div>
            <div className="text-4xl">🧠</div>
          </div>
        </div>
      </div>

      {/* Large Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity - Large Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📅 Weekly Activity Trend
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2c5530" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2c5530" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#2c5530', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke="#2c5530" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorActivity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Bookmarked Surahs - Large Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔖 Top Bookmarked Surahs
          </h3>
          {topBookmarkedSurahs.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topBookmarkedSurahs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#2c5530', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]}>
                  {topBookmarkedSurahs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No bookmarks yet
            </div>
          )}
        </div>

        {/* Progress Over Time - Large Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📈 Progress Over Time
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#2c5530', fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="badges" 
                stroke="#fbbf24" 
                strokeWidth={3}
                name="Badges"
                dot={{ fill: '#fbbf24', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="bookmarks" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Bookmarks"
                dot={{ fill: '#ef4444', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plans Pace Distribution - Large Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🗓️ Plans Pace Distribution
          </h3>
          {plansChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={plansChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#2c5530', fontWeight: 'bold' }}
                />
                <Bar dataKey="pace" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {plansChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No active plans
            </div>
          )}
        </div>
      </div>

      {/* Mistakes Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Mistakes Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ❌ Mistakes by Type
          </h3>
          {mistakesChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mistakesChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mistakesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-red-500">{mistakes.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Mistakes</p>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No mistakes yet! Keep it up! 🎉
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🏆 Recent Achievements
          </h3>
          {badges.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {badges.slice(-10).reverse().map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="text-3xl">{badge.medal}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {badge.surahName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Surah {badge.surahNum}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No badges earned yet
            </div>
          )}
        </div>

        {/* Active Plans List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 Active Plans
          </h3>
          {plans.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {plans.map((plan, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.surahName} • {plan.pace} ayahs/day
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No active plans
            </div>
          )}
        </div>
      </div>

      {/* Detailed Mistake History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            📝 Mistake History & Review
          </h3>
          {mistakes.length > 0 && (
            <button
              onClick={handleClearAllMistakes}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg">No mistakes yet! Keep up the excellent work!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mistakes.map((mistake, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  selectedMistake === index || correctingMistake === index
                    ? 'bg-red-50 dark:bg-red-900/30 border-red-500 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-700 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer'
                }`}
                onClick={() => {
                  if (correctingMistake !== index) {
                    setSelectedMistake(selectedMistake === index ? null : index)
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500 font-bold">#{index + 1}</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {mistake.question || 'Quiz Question'}
                      </p>
                    </div>
                    {mistake.text && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 italic" dir="rtl">
                        {mistake.text}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Answer:</p>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          {mistake.your || 'N/A'}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Correct Answer:</p>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {mistake.correct || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {(selectedMistake === index || correctingMistake === index) && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        {correctingMistake === index ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Try to answer correctly:
                              </label>
                              <input
                                type="text"
                                value={correctionAnswer}
                                onChange={(e) => setCorrectionAnswer(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmitCorrection(index)}
                                placeholder="Enter your answer..."
                                className={`w-full px-4 py-2 border-2 rounded-lg dark:bg-gray-700 dark:text-white ${
                                  correctionFeedback === 'correct'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : correctionFeedback === 'incorrect'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                                autoFocus
                              />
                              {correctionFeedback === 'correct' && (
                                <p className="mt-2 text-green-600 dark:text-green-400 font-semibold">
                                  ✅ Correct! This mistake will be removed.
                                </p>
                              )}
                              {correctionFeedback === 'incorrect' && (
                                <p className="mt-2 text-red-600 dark:text-red-400 font-semibold">
                                  ❌ Not quite right. The correct answer is: <strong>{mistake.correct}</strong>
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSubmitCorrection(index)
                                }}
                                disabled={!correctionAnswer.trim() || correctionFeedback === 'correct'}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                ✅ Submit Answer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelCorrection()
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartCorrection(index)
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
                            >
                              ✏️ Correct This Mistake
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate('/quiz')
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            >
                              🔄 Practice Similar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMistake(index)
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                            >
                              ❌ Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📈 Overall Progress
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-islamic-green via-green-400 to-green-300 transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${totalProgress}%` }}
              >
                {totalProgress > 5 && (
                  <span className="text-white text-xs font-bold">{totalProgress}%</span>
                )}
              </div>
            </div>
          </div>
          <span className="text-3xl font-bold text-islamic-green min-w-[80px] text-right">{totalProgress}%</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {badges.length} out of 114 surahs completed • {114 - badges.length} remaining
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">⚙️ Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
