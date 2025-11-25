import { useEffect } from 'react'

const AchievementModal = ({ surahName, medal, onClose }) => {
  useEffect(() => {
    // Play achievement sound
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    sound.play().catch(() => {})

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center transform animate-scale-in relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="text-8xl mb-6 animate-bounce drop-shadow-2xl">{medal}</div>
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Achievement Unlocked!
          </h2>
          <p className="text-2xl text-white/95 mb-8 font-semibold drop-shadow-md">
            Completed Surah {surahName}
          </p>
          <p className="text-lg text-white/80 mb-8">
            Keep up the great work! Your dedication is inspiring. 🌟
          </p>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Awesome! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default AchievementModal

