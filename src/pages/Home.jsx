import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import FeatureCard from '../components/FeatureCard'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Home = ({ user }) => {
  const { badges, bookmarks, plans, quizScore } = useFirebaseData(user)
  const features = [
    {
      icon: '📖',
      title: 'Quran Reader',
      description: 'Read the Holy Quran with beautiful Arabic text, translations, and audio recitations from renowned Qaris.',
      link: '/reader',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🗓️',
      title: 'Memorization Planner',
      description: 'Create personalized memorization schedules and track your Hifz progress with daily goals.',
      link: '/planner',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🧠',
      title: 'Daily Quiz',
      description: 'Test your knowledge with interactive quizzes and learn from your mistakes.',
      link: '/quiz',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: '🏆',
      title: 'Achievement Badges',
      description: 'Earn beautiful badges as you complete surahs and reach your memorization milestones.',
      link: '/badges',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection user={user} stats={{ badges: badges.length, bookmarks: bookmarks.length, plans: plans.length, quizScore }} />

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need for your Quran learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-islamic-green to-islamic-green-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of learners using HifzMate to enhance their Quran study
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reader"
              className="px-8 py-3 bg-white text-islamic-green rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Reading Quran
            </Link>
            <Link
              to="/profile"
              className="px-8 py-3 bg-islamic-gold text-white rounded-lg font-semibold hover:bg-islamic-gold-light transition-all transform hover:scale-105 shadow-lg"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

