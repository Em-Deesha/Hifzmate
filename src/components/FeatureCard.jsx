import { Link } from 'react-router-dom'

const FeatureCard = ({ icon, title, description, link, gradient }) => {
  return (
    <Link
      to={link}
      className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-islamic-green dark:group-hover:text-islamic-green-lighter transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
        
        {/* Arrow */}
        <div className="mt-4 flex items-center text-islamic-green group-hover:translate-x-2 transition-transform duration-300">
          <span className="font-semibold">Learn more</span>
          <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  )
}

export default FeatureCard

