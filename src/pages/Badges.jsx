import { useState } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Badges = ({ user }) => {
  const { badges } = useFirebaseData(user)
  const [showModal, setShowModal] = useState(false)

  const medals = [
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨"
  ]

  const getRandomGradient = () => {
    const colors = [
      'from-green-500 to-emerald-600',
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-indigo-500 to-purple-600'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🏆 My Achievements
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {badges.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No badges earned yet. Start reading to earn your first badge! 🏆
          </p>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                You've earned <strong className="text-islamic-green">{badges.length}</strong> out of 114 badges!
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${getRandomGradient()} rounded-xl p-4 text-center text-white cursor-pointer transform hover:scale-105 transition-transform shadow-lg`}
                  onClick={() => setShowModal(true)}
                >
                  <div className="text-4xl mb-2">{badge.medal}</div>
                  <p className="text-sm font-semibold">{badge.surahName}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Badge Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Earned Badges ({badges.length}/114)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${getRandomGradient()} rounded-lg p-4 text-center text-white`}
                >
                  <div className="text-3xl mb-2">{badge.medal}</div>
                  <p className="text-sm font-semibold">{badge.surahName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Badges
