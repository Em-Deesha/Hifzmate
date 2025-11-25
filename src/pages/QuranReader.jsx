import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFirebaseData } from '../hooks/useFirebaseData'

const QuranReader = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [surahNames, setSurahNames] = useState([])
  const [qaris, setQaris] = useState([])
  const [currentSurah, setCurrentSurah] = useState(1)
  const [currentQari, setCurrentQari] = useState('ar.alafasy')
  const [tajweed, setTajweed] = useState(false)
  const [ayahs, setAyahs] = useState([])
  const [surahData, setSurahData] = useState(null)
  const [selectedAyah, setSelectedAyah] = useState(null)
  const [loadingSurah, setLoadingSurah] = useState(false)
  const [bookmarking, setBookmarking] = useState({})
  const [playingAudio, setPlayingAudio] = useState(null)
  const [loadingAudio, setLoadingAudio] = useState({})
  const [surahAudioPlaying, setSurahAudioPlaying] = useState(false)
  const [surahAudioLoading, setSurahAudioLoading] = useState(false)
  const [surahAudioProgress, setSurahAudioProgress] = useState(0)
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0)
  const { bookmarks, badges, earnedBadges, saveData } = useFirebaseData(user)
  const ayahRefs = useRef({})
  const lastAyahObserver = useRef(null)
  const scrollToAyahOnLoad = useRef(null)
  const surahCache = useRef({})
  const audioCache = useRef({})
  const currentAudioRef = useRef(null)
  const surahAudioQueue = useRef([])
  const surahAudioIntervalRef = useRef(null)
  const surahAudioRef = useRef(null)
  const badgeShownForSurah = useRef(new Set())

  useEffect(() => {
    // Load surah names
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))

    // Load qaris
    fetch('https://api.alquran.cloud/v1/edition?format=audio')
      .then(res => res.json())
      .then(data => setQaris(data.data))

    // Check URL parameters for navigation from bookmark
    const surahParam = searchParams.get('surah')
    const ayahParam = searchParams.get('ayah')
    
    if (surahParam) {
      const surahNum = parseInt(surahParam)
      if (surahNum >= 1 && surahNum <= 114) {
        setCurrentSurah(surahNum)
        if (ayahParam) {
          const ayahNum = parseInt(ayahParam)
          scrollToAyahOnLoad.current = ayahNum
        }
        // Clear URL parameters after reading
        setSearchParams({})
      }
    }
  }, [])

  useEffect(() => {
    if (surahNames.length > 0) {
      // Stop any playing audio when switching surahs
      stopAudio()
      stopSurahAudio()
      
      // Disconnect previous observer when switching surahs
      if (lastAyahObserver.current) {
        lastAyahObserver.current.disconnect()
        lastAyahObserver.current = null
      }
      
      loadSurah(currentSurah)
    }
  }, [currentSurah, surahNames])

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      stopAudio()
      stopSurahAudio()
    }
  }, [])

  // Cleanup surah audio interval
  useEffect(() => {
    return () => {
      if (surahAudioIntervalRef.current) {
        clearInterval(surahAudioIntervalRef.current)
      }
    }
  }, [])

  // Preload first few ayahs audio when surah loads
  useEffect(() => {
    if (surahData && ayahs.length > 0 && currentQari) {
      // Preload first 5 ayahs audio in background
      const preloadCount = Math.min(5, ayahs.length)
      
      for (let i = 0; i < preloadCount; i++) {
        const ayahNumber = ayahs[i].number
        const cacheKey = `${ayahNumber}-${currentQari}`
        
        // Only preload if not already cached
        if (!audioCache.current[cacheKey]) {
          // Preload in background without blocking
          fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${currentQari}`)
            .then(res => res.json())
            .then(audioData => {
              if (audioData.data && audioData.data.audio) {
                const audio = new Audio(audioData.data.audio)
                audio.preload = 'auto'
                // Preload the audio
                audio.load()
                audioCache.current[cacheKey] = {
                  url: audioData.data.audio,
                  loaded: false
                }
                
                // Mark as loaded when ready
                audio.addEventListener('canplaythrough', () => {
                  audioCache.current[cacheKey].loaded = true
                  audioCache.current[cacheKey].audio = audio
                }, { once: true })
              }
            })
            .catch(err => {
              // Silently fail preloading - it's not critical
              console.debug('Preload failed for ayah', ayahNumber)
            })
        }
      }
    }
  }, [surahData, ayahs, currentQari])

  // Scroll to ayah after surah loads (for bookmark navigation)
  useEffect(() => {
    if (scrollToAyahOnLoad.current && ayahs.length > 0 && surahData) {
      const ayahNum = scrollToAyahOnLoad.current
      setTimeout(() => {
        scrollToAyah(ayahNum)
        scrollToAyahOnLoad.current = null
      }, 800) // Wait for ayahs to render
    }
  }, [ayahs, surahData])

  const scrollToAyah = (ayahNum) => {
    if (!ayahNum || ayahNum < 1) return
    
    setSelectedAyah(ayahNum)
    const ayahElement = ayahRefs.current[ayahNum]
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight the ayah
      setTimeout(() => setSelectedAyah(null), 3000)
    } else {
      // If element not found yet, try again after a short delay
      setTimeout(() => scrollToAyah(ayahNum), 200)
    }
  }

  const loadSurah = async (num) => {
    // Check cache first
    if (surahCache.current[num]) {
      const cached = surahCache.current[num]
      setSurahData(cached)
      setAyahs(cached.ar.ayahs)
      setLoadingSurah(false)
      return
    }

    setLoadingSurah(true)
    try {
      const api = `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,ur.jalandhry`
      const res = await fetch(api)
      const data = await res.json()
      const [ar, en, ur] = data.data
      const surahDataObj = { ar, en, ur }
      
      // Cache the data
      surahCache.current[num] = surahDataObj
      
      setSurahData(surahDataObj)
      setAyahs(ar.ayahs)
    } catch (error) {
      console.error('Error loading surah:', error)
      if (window.showToast) {
        window.showToast('Error loading surah. Please try again.', 'error')
      }
    } finally {
      setLoadingSurah(false)
    }
  }

  const applyTajweed = (text) => {
    return text
      .replace(/ن/g, '<span class="text-blue-400 font-semibold">ن</span>')
      .replace(/م/g, '<span class="text-green-400 font-semibold">م</span>')
      .replace(/ق/g, '<span class="text-yellow-400 font-semibold">ق</span>')
      .replace(/ل/g, '<span class="text-cyan-400 font-semibold">ل</span>')
  }

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
      setPlayingAudio(null)
    }
  }

  const playAudio = async (ayahNumber) => {
    // If same audio is playing, stop it
    if (playingAudio === ayahNumber && currentAudioRef.current) {
      stopAudio()
      return
    }

    // Stop any currently playing audio (including surah audio)
    stopAudio()
    stopSurahAudio()

    const cacheKey = `${ayahNumber}-${currentQari}`
    
    // Check cache first
    if (audioCache.current[cacheKey] && audioCache.current[cacheKey].audio) {
      const cached = audioCache.current[cacheKey].audio
      try {
        cached.currentTime = 0 // Reset to start
        setPlayingAudio(ayahNumber)
        currentAudioRef.current = cached
        
        // Play audio
        await cached.play()
        
        // Handle audio end
        cached.onended = () => {
          setPlayingAudio(null)
          currentAudioRef.current = null
        }
        
        // Handle errors
        cached.onerror = () => {
          setPlayingAudio(null)
          setLoadingAudio(prev => ({ ...prev, [ayahNumber]: false }))
          // Remove from cache if error
          delete audioCache.current[cacheKey]
          if (window.showToast) {
            window.showToast('Error playing audio. Please try again.', 'error')
          }
        }
        return
      } catch (error) {
        console.error('Error playing cached audio:', error)
        // Remove bad cache entry
        delete audioCache.current[cacheKey]
      }
    }

    // Show loading state
    setLoadingAudio(prev => ({ ...prev, [ayahNumber]: true }))

    try {
      // Fetch audio URL
      const audioRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${currentQari}`)
      if (!audioRes.ok) throw new Error('Failed to fetch audio')
      
      const audioData = await audioRes.json()
      if (!audioData.data || !audioData.data.audio) {
        throw new Error('Invalid audio data')
      }

      // Create audio object
      const audio = new Audio(audioData.data.audio)
      
      // Set up event handlers before playing
      audio.onended = () => {
        setPlayingAudio(null)
        currentAudioRef.current = null
        setLoadingAudio(prev => ({ ...prev, [ayahNumber]: false }))
      }
      
      audio.onerror = () => {
        setPlayingAudio(null)
        setLoadingAudio(prev => ({ ...prev, [ayahNumber]: false }))
        delete audioCache.current[cacheKey]
        if (window.showToast) {
          window.showToast('Error playing audio. Please try again.', 'error')
        }
      }

      // Wait for audio to be ready (but with timeout)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'))
        }, 8000) // 8 second timeout
        
        audio.oncanplaythrough = () => {
          clearTimeout(timeout)
          resolve()
        }
        audio.onerror = () => {
          clearTimeout(timeout)
          reject(new Error('Audio load error'))
        }
        
        // Start loading
        audio.load()
      })

      // Cache the audio for future use
      audioCache.current[cacheKey] = {
        url: audioData.data.audio,
        audio: audio,
        loaded: true
      }

      // Play audio
      await audio.play()
      setPlayingAudio(ayahNumber)
      currentAudioRef.current = audio
      setLoadingAudio(prev => ({ ...prev, [ayahNumber]: false }))

    } catch (error) {
      console.error('Error playing audio:', error)
      setLoadingAudio(prev => ({ ...prev, [ayahNumber]: false }))
      if (window.showToast) {
        window.showToast('Error loading audio. Please check your connection.', 'error')
      }
    }
  }

  const handleBookmark = async (surahName, ayahNum, text) => {
    // Check if already bookmarked
    const isBookmarked = bookmarks.some(
      b => b.surah === surahName && b.ayah === ayahNum
    )

    if (isBookmarked) {
      if (window.showToast) {
        window.showToast('This ayah is already bookmarked! 📖', 'info')
      }
      return
    }

    // Show immediate feedback
    setBookmarking({ [ayahNum]: true })
    if (window.showToast) {
      window.showToast('Ayah bookmarked successfully! 📖', 'success')
    }

    // Save in background (non-blocking)
    const surah = surahNames.find(s => s.englishName === surahName)
    const newBookmarks = [...bookmarks, { 
      surah: surahName, 
      ayah: ayahNum, 
      text,
      surahNum: surah?.number || currentSurah
    }]
    
    // Save without blocking
    saveData('bookmarks', newBookmarks).catch(error => {
      console.error('Error saving bookmark:', error)
      if (window.showToast) {
        window.showToast('Error saving bookmark. Please try again.', 'error')
      }
    }).finally(() => {
      setBookmarking({ [ayahNum]: false })
    })
  }

  const medals = [
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨"
  ]

  const showBadge = async (surahNum, surahName) => {
    // Check if badge already earned
    if (earnedBadges.includes(surahNum)) {
      badgeShownForSurah.current.add(surahNum)
      return
    }

    // Check if badge was already shown in this session
    if (badgeShownForSurah.current.has(surahNum)) {
      return
    }

    // Mark as shown immediately to prevent duplicates
    badgeShownForSurah.current.add(surahNum)

    const newBadges = [...badges, {
      surahNum,
      surahName,
      medal: medals[surahNum - 1] || "🏆"
    }]
    await saveData('badges', newBadges)

    // Disconnect observer to prevent multiple triggers
    if (lastAyahObserver.current) {
      lastAyahObserver.current.disconnect()
      lastAyahObserver.current = null
    }

    // Show achievement modal
    if (window.showAchievement) {
      window.showAchievement(surahName, medals[surahNum - 1] || "🏆")
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const playSurahAudio = async () => {
    if (surahAudioPlaying) {
      // Pause if already playing
      stopSurahAudio()
      return
    }

    if (!surahData || !ayahs.length) {
      if (window.showToast) {
        window.showToast('No surah data available', 'error')
      }
      return
    }

    // Stop any ayah audio
    stopAudio()

    setSurahAudioLoading(true)
    setCurrentAyahIndex(0)
    setSurahAudioProgress(0)

    try {
      // Build queue of all ayahs
      const queue = []
      for (let i = 0; i < ayahs.length; i++) {
        const ayah = ayahs[i]
        const cacheKey = `${ayah.number}-${currentQari}`
        
        // Check cache first
        if (audioCache.current[cacheKey] && audioCache.current[cacheKey].audio) {
          queue.push({
            audio: audioCache.current[cacheKey].audio,
            ayahNumber: ayah.number,
            index: i
          })
        } else {
          // Fetch audio
          const audioRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/${currentQari}`)
          if (!audioRes.ok) continue
          
          const audioData = await audioRes.json()
          if (!audioData.data || !audioData.data.audio) continue

          const audio = new Audio(audioData.data.audio)
          audio.preload = 'auto'
          
          // Cache it
          audioCache.current[cacheKey] = {
            url: audioData.data.audio,
            audio: audio,
            loaded: true
          }

          queue.push({
            audio: audio,
            ayahNumber: ayah.number,
            index: i
          })
        }
      }

      if (queue.length === 0) {
        throw new Error('No audio available')
      }

      surahAudioQueue.current = queue
      setSurahAudioLoading(false)
      setSurahAudioPlaying(true)
      playNextAyahInQueue(0)

    } catch (error) {
      console.error('Error loading surah audio:', error)
      setSurahAudioLoading(false)
      if (window.showToast) {
        window.showToast('Error loading surah audio. Please try again.', 'error')
      }
    }
  }

  const playNextAyahInQueue = (index) => {
    if (index >= surahAudioQueue.current.length) {
      // Finished playing all ayahs
      stopSurahAudio()
      if (window.showToast) {
        window.showToast('Finished playing surah', 'success')
      }
      return
    }

    const item = surahAudioQueue.current[index]
    const audio = item.audio.cloneNode() // Clone to allow replay
    audio.src = item.audio.src

    setCurrentAyahIndex(index)
    setSurahAudioProgress((index / surahAudioQueue.current.length) * 100)

    // Scroll to current ayah
    const ayahElement = ayahRefs.current[index + 1]
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    audio.onended = () => {
      // Play next ayah
      playNextAyahInQueue(index + 1)
    }

    audio.onerror = () => {
      // Skip to next on error
      playNextAyahInQueue(index + 1)
    }

    // Update progress while playing
    surahAudioIntervalRef.current = setInterval(() => {
      if (audio && !audio.paused) {
        const ayahProgress = (audio.currentTime / audio.duration) * 100
        const totalProgress = ((index + ayahProgress / 100) / surahAudioQueue.current.length) * 100
        setSurahAudioProgress(totalProgress)
      }
    }, 100)

    audio.play().catch(error => {
      console.error('Error playing ayah audio:', error)
      playNextAyahInQueue(index + 1)
    })

    // Store current audio for pause/stop
    surahAudioRef.current = audio
  }

  const stopSurahAudio = () => {
    if (surahAudioRef.current) {
      surahAudioRef.current.pause()
      surahAudioRef.current.currentTime = 0
      surahAudioRef.current = null
    }
    setSurahAudioPlaying(false)
    setSurahAudioProgress(0)
    setCurrentAyahIndex(0)
    surahAudioQueue.current = []
    if (surahAudioIntervalRef.current) {
      clearInterval(surahAudioIntervalRef.current)
      surahAudioIntervalRef.current = null
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSurahAudioDuration = () => {
    // Estimate: ~30 seconds per ayah average
    return ayahs.length * 30
  }

  if (!surahData && !loadingSurah) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Indicator */}
      {loadingSurah && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl px-6 py-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-islamic-green"></div>
          <span className="text-gray-900 dark:text-white font-semibold">Loading surah...</span>
        </div>
      )}

      {/* Surah Header */}
      {surahData && (
        <div className="text-center mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-4xl font-bold text-islamic-green mb-2 font-arabic" dir="rtl">
            {surahData.ar.name}
          </h2>
          <h3 className="text-2xl text-gray-600 dark:text-gray-300">
            {surahData.en.englishName}
          </h3>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎵 Qari
            </label>
            <select
              value={currentQari}
              onChange={(e) => {
                stopAudio() // Stop ayah audio when changing Qari
                stopSurahAudio() // Stop surah audio when changing Qari
                setCurrentQari(e.target.value)
                // Clear audio cache for this surah when Qari changes
                Object.keys(audioCache.current).forEach(key => {
                  if (key.includes(`-${currentQari}`)) {
                    delete audioCache.current[key]
                  }
                })
              }}
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

      {/* Surah Audio Player Bar - Above Ayahs */}
      {surahData && !loadingSurah && ayahs.length > 0 && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={playSurahAudio}
              disabled={surahAudioLoading}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                surahAudioLoading
                  ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                  : surahAudioPlaying
                  ? 'bg-islamic-green hover:bg-islamic-green-light text-white'
                  : 'bg-islamic-green hover:bg-islamic-green-light text-white'
              }`}
            >
              {surahAudioLoading ? (
                <span className="animate-spin text-gray-500 text-lg">⏳</span>
              ) : surahAudioPlaying ? (
                <span className="text-white text-lg">⏸️</span>
              ) : (
                <span className="text-white text-lg">▶️</span>
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-islamic-green rounded-full transition-all duration-300"
                  style={{ width: `${surahAudioProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs mt-1.5">
                <span className="font-medium">
                  {surahAudioPlaying ? `Playing Ayah ${currentAyahIndex + 1} / ${ayahs.length}` : 'Ready to play full surah'}
                </span>
                <span className="font-medium">
                  {Math.round(surahAudioProgress)}% Complete
                </span>
              </div>
            </div>

            {/* Surah Info */}
            <div className="flex-shrink-0 text-right">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{surahData.en.englishName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{ayahs.length} Ayahs</div>
            </div>
          </div>
        </div>
      )}

      {/* Ayahs */}
      {loadingSurah ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading ayahs...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {ayahs.map((ayah, index) => {
          const isLastAyah = index === ayahs.length - 1
          return (
          <div
            key={ayah.number}
            ref={el => {
              ayahRefs.current[index + 1] = el
              // Observe last ayah for badge achievement
              if (isLastAyah && el && !lastAyahObserver.current && !earnedBadges.includes(currentSurah) && !badgeShownForSurah.current.has(currentSurah)) {
                lastAyahObserver.current = new IntersectionObserver((entries) => {
                  if (entries[0].isIntersecting) {
                    // Double check before showing badge
                    if (!earnedBadges.includes(currentSurah) && !badgeShownForSurah.current.has(currentSurah)) {
                      showBadge(currentSurah, surahData.en.englishName)
                    }
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
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => playingAudio === ayah.number ? stopAudio() : playAudio(ayah.number)}
                    disabled={loadingAudio[ayah.number]}
                    className={`p-2 rounded-lg transition-all ${
                      loadingAudio[ayah.number]
                        ? 'text-gray-400 cursor-not-allowed'
                        : playingAudio === ayah.number
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={playingAudio === ayah.number ? 'Stop audio' : 'Play audio'}
                  >
                    {loadingAudio[ayah.number] ? (
                      <span className="animate-spin text-lg">⏳</span>
                    ) : playingAudio === ayah.number ? (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleBookmark(surahData.en.englishName, index + 1, ayah.text)}
                    disabled={bookmarking[index + 1]}
                    className={`p-2 rounded-lg transition-all ${
                      bookmarks.some(b => b.surah === surahData.en.englishName && b.ayah === index + 1)
                        ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : bookmarking[index + 1]
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title={bookmarks.some(b => b.surah === surahData.en.englishName && b.ayah === index + 1) ? 'Remove bookmark' : 'Bookmark this ayah'}
                  >
                    {bookmarking[index + 1] ? (
                      <span className="animate-spin text-lg">⏳</span>
                    ) : bookmarks.some(b => b.surah === surahData.en.englishName && b.ayah === index + 1) ? (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })}
        </div>
      )}

      {/* Go to Top Button */}
      {surahData && !loadingSurah && (
        <div className="text-center mt-8">
          <button
            onClick={scrollToTop}
            className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light"
          >
            ⬆️ Go to Top of Surah
          </button>
        </div>
      )}
    </div>
  )
}

export default QuranReader
