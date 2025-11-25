import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Bookmarks = ({ user }) => {
  const { bookmarks, saveData } = useFirebaseData(user)
  const [surahNames, setSurahNames] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))
  }, [])

  const handleDelete = async (index, e) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    const newBookmarks = bookmarks.filter((_, i) => i !== index)
    await saveData('bookmarks', newBookmarks)
    if (window.showToast) {
      window.showToast('Bookmark removed', 'info')
    }
  }

  const handleBookmarkClick = (bookmark) => {
    // Use stored surahNum if available, otherwise find by name
    let surahNum = bookmark.surahNum
    
    if (!surahNum) {
      const surah = surahNames.find(s => 
        s.englishName.toLowerCase() === bookmark.surah.toLowerCase()
      )
      surahNum = surah?.number
    }
    
    if (surahNum) {
      // Navigate to Quran Reader with surah and ayah
      navigate(`/reader?surah=${surahNum}&ayah=${bookmark.ayah}`)
      if (window.showToast) {
        window.showToast(`Opening ${bookmark.surah} - Ayah ${bookmark.ayah}`, 'info', 1500)
      }
    } else {
      if (window.showToast) {
        window.showToast('Could not find surah. Please try again.', 'error')
      }
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
      await saveData('bookmarks', [])
      if (window.showToast) {
        window.showToast('All bookmarks cleared', 'info')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🔖 My Bookmarks
        </h1>
        {bookmarks.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🗑️ Clear All Bookmarks
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {bookmarks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No bookmarks yet. Start reading the Quran and bookmark your favorite ayahs! 📖
          </p>
        ) : (
          <ul className="space-y-3">
            {bookmarks.map((bookmark, index) => (
              <li
                key={index}
                onClick={() => handleBookmarkClick(bookmark)}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-islamic-green hover:shadow-lg hover:border-islamic-green-light transition-all cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-islamic-green transition-colors">
                      {bookmark.surah} - Ayah {bookmark.ayah}
                    </p>
                    <span className="text-islamic-green opacity-0 group-hover:opacity-100 transition-opacity">
                      👆 Click to open
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" dir="rtl">
                    {bookmark.text}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(index, e)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ml-4 flex-shrink-0"
                  title="Delete bookmark"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Bookmarks
