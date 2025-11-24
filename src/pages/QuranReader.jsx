import { useState, useEffect, useRef } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const QuranReader = ({ user }) => {
  const [surahNames, setSurahNames] = useState([])
  const [qaris, setQaris] = useState([])
  const [currentSurah, setCurrentSurah] = useState(1)
  const [currentQari, setCurrentQari] = useState('ar.alafasy')
  const [tajweed, setTajweed] = useState(false)
  const [ayahs, setAyahs] = useState([])
  const [surahData, setSurahData] = useState(null)
  const [selectedAyah, setSelectedAyah] = useState(null)
  const { bookmarks, badges, earnedBadges, saveData } = useFirebaseData(user)
  const ayahRefs = useRef({})
  const lastAyahObserver = useRef(null)

  useEffect(() => {
    // Load surah names
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))

    // Load qaris
    fetch('https://api.alquran.cloud/v1/edition?format=audio')
      .then(res => res.json())
      .then(data => setQaris(data.data))
  }, [])

  useEffect(() => {
    if (surahNames.length > 0) {
      loadSurah(currentSurah)
    }
  }, [currentSurah, tajweed, surahNames])

  const loadSurah = async (num) => {
    try {
      const api = `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,ur.jalandhry`
      const res = await fetch(api)
      const data = await res.json()
      const [ar, en, ur] = data.data
      setSurahData({ ar, en, ur })
      setAyahs(ar.ayahs)
    } catch (error) {
      console.error('Error loading surah:', error)
    }
  }

  const applyTajweed = (text) => {
    return text
      .replace(/ن/g, '<span class="text-blue-400 font-semibold">ن</span>')
      .replace(/م/g, '<span class="text-green-400 font-semibold">م</span>')
      .replace(/ق/g, '<span class="text-yellow-400 font-semibold">ق</span>')
      .replace(/ل/g, '<span class="text-cyan-400 font-semibold">ل</span>')
  }

  const playAudio = async (ayahNumber) => {
    try {
      const audioRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${currentQari}`)
      const audioData = await audioRes.json()
      const audio = new Audio(audioData.data.audio)
      audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const handleBookmark = async (surahName, ayahNum, text) => {
    const newBookmarks = [...bookmarks, { surah: surahName, ayah: ayahNum, text }]
    await saveData('bookmarks', newBookmarks)
    alert('Ayah bookmarked!')
  }

  const medals = [
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨"
  ]

  const showBadge = async (surahNum, surahName) => {
    if (earnedBadges.includes(surahNum)) return

    const newBadges = [...badges, {
      surahNum,
      surahName,
      medal: medals[surahNum - 1] || "🏆"
    }]
    await saveData('badges', newBadges)

    // Show badge notification
    const badgeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    badgeSound.play().catch(() => {})

    alert(`🎉 Achievement Unlocked!\n\nCompleted Surah ${surahName}\n${medals[surahNum - 1] || "🏆"}`)
  }

  const scrollToAyah = (ayahNum) => {
    setSelectedAyah(ayahNum)
    const ayahElement = ayahRefs.current[ayahNum]
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setSelectedAyah(null), 2000)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!surahData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Surah Header */}
      <div className="text-center mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-4xl font-bold text-islamic-green mb-2 font-arabic" dir="rtl">
          {surahData.ar.name}
        </h2>
        <h3 className="text-2xl text-gray-600 dark:text-gray-300">
          {surahData.en.englishName}
        </h3>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎵 Qari
            </label>
            <select
              value={currentQari}
              onChange={(e) => setCurrentQari(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {qaris.map(q => (
                <option key={q.identifier} value={q.identifier}>
                  {q.englishName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📖 Surah
            </label>
            <select
              value={currentSurah}
              onChange={(e) => setCurrentSurah(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {surahNames.map(s => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔢 Ayah
            </label>
            <select
              onChange={(e) => scrollToAyah(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Ayah</option>
              {ayahs.map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Ayah {index + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={() => setCurrentSurah(Math.max(1, currentSurah - 1))}
              disabled={currentSurah === 1}
              className="px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light disabled:opacity-50"
            >
              ⬅️ Previous
            </button>
            <button
              onClick={() => setCurrentSurah(Math.min(114, currentSurah + 1))}
              disabled={currentSurah === 114}
              className="px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light disabled:opacity-50"
            >
              Next ➡️
            </button>
            <button
              onClick={() => setTajweed(!tajweed)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              🎨 {tajweed ? 'Hide' : 'Show'} Tajweed
            </button>
          </div>
        </div>
      </div>

      {/* Ayahs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {ayahs.map((ayah, index) => {
          const isLastAyah = index === ayahs.length - 1
          return (
          <div
            key={ayah.number}
            ref={el => {
              ayahRefs.current[index + 1] = el
              // Observe last ayah for badge achievement
              if (isLastAyah && el && !lastAyahObserver.current) {
                lastAyahObserver.current = new IntersectionObserver((entries) => {
                  if (entries[0].isIntersecting && !earnedBadges.includes(currentSurah)) {
                    showBadge(currentSurah, surahData.en.englishName)
                  }
                }, { threshold: 0.5 })
                lastAyahObserver.current.observe(el)
              }
            }}
            className={`mb-8 p-6 border-b border-gray-200 dark:border-gray-700 last:border-0 transition-colors ${
              selectedAyah === index + 1 ? 'bg-green-50 dark:bg-green-900/20' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="bg-islamic-green text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <p
                  className="text-3xl font-arabic mb-4 text-right leading-relaxed"
                  dir="rtl"
                  dangerouslySetInnerHTML={{
                    __html: tajweed ? applyTajweed(ayah.text) : ayah.text
                  }}
                />
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 italic">
                  {surahData.en.ayahs[index].text}
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 text-right" dir="rtl">
                  {surahData.ur.ayahs[index].text}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => playAudio(ayah.number)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => handleBookmark(surahData.en.englishName, index + 1, ayah.text)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    🔖 Bookmark
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })}

        {/* Go to Top Button */}
        <div className="text-center mt-8">
          <button
            onClick={scrollToTop}
            className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light"
          >
            ⬆️ Go to Top of Surah
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuranReader
