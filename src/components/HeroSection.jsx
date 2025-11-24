import { Link } from 'react-router-dom'

const HeroSection = ({ user, stats }) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center islamic-pattern bg-gradient-to-br from-islamic-green via-islamic-green-light to-islamic-green-lighter overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">☪️</div>
        <div className="absolute top-20 right-20 text-5xl">🕌</div>
        <div className="absolute bottom-20 left-20 text-4xl">📿</div>
        <div className="absolute bottom-10 right-10 text-6xl">✨</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          {user ? (
            <>
              Welcome back,{' '}
              <span className="text-islamic-gold">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </>
          ) : (
            'Welcome to HifzMate'
          )}
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Your personal helper for Quran reading, memorization, and progress tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/reader"
            className="px-8 py-4 bg-white text-islamic-green rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
          >
            <span>📖</span>
            <span>Start Reading Quran</span>
          </Link>
          
          <Link
            to="/profile"
            className="px-8 py-4 bg-islamic-gold text-white rounded-lg font-semibold text-lg hover:bg-islamic-gold-light transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Stats */}
        {user && stats && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.badges || 0}</div>
              <div className="text-sm opacity-90">Badges</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.bookmarks || 0}</div>
              <div className="text-sm opacity-90">Bookmarks</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.plans || 0}</div>
              <div className="text-sm opacity-90">Plans</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.quizScore || 0}</div>
              <div className="text-sm opacity-90">Quiz Score</div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

