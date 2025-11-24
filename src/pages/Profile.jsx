import { useState, useEffect } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState('')
  const [userData, setUserData] = useState(null)
  const { plans, bookmarks, badges, quizScore, loading } = useFirebaseData(user)

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
      alert('Please login to update your profile')
      return
    }

    if (!displayName.trim()) {
      alert('Please enter a display name')
      return
    }

    try {
      await user.updateProfile({ displayName })
      if (window.firebaseService) {
        await window.firebaseService.updateUserProfile(user.uid, { displayName })
      }
      alert('Profile updated successfully!')
      window.location.reload() // Refresh to show updated name
    } catch (error) {
      alert('Error updating profile: ' + error.message)
    }
  }

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

  const memberSince = userData?.createdAt
    ? (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt))
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        👤 My Profile
      </h1>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-islamic-green to-islamic-green-light rounded-full flex items-center justify-center text-4xl text-white">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user.displayName || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {user.email}
            </p>
            {memberSince && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Member since: {memberSince.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-islamic-green">{badges.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-2">🔖</div>
          <div className="text-3xl font-bold text-islamic-green">{bookmarks.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-2">🗓️</div>
          <div className="text-3xl font-bold text-islamic-green">{plans.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Plans</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-2">🧠</div>
          <div className="text-3xl font-bold text-islamic-green">{quizScore}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Score</div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
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
