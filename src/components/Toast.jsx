import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    achievement: '🎉'
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    achievement: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500'
  }

  if (!isVisible) return null

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${colors[type]} text-white rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md flex items-center gap-3 animate-slide-in border-2 border-white/20`}
      >
        <div className="text-2xl flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(), 300)
          }}
          className="text-white/80 hover:text-white text-xl flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Toast

