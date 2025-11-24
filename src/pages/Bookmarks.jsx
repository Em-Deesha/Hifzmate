import { useFirebaseData } from '../hooks/useFirebaseData'

const Bookmarks = ({ user }) => {
  const { bookmarks, saveData } = useFirebaseData(user)

  const handleDelete = async (index) => {
    const newBookmarks = bookmarks.filter((_, i) => i !== index)
    await saveData('bookmarks', newBookmarks)
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
      await saveData('bookmarks', [])
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
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-islamic-green hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bookmark.surah} - Ayah {bookmark.ayah}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" dir="rtl">
                    {bookmark.text}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ml-4"
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
