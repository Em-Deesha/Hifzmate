import { useState, useEffect } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Planner = ({ user }) => {
  const [surahNames, setSurahNames] = useState([])
  const [planName, setPlanName] = useState('')
  const [selectedSurah, setSelectedSurah] = useState('1')
  const [pace, setPace] = useState(3)
  const { plans, saveData } = useFirebaseData(user)

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))
  }, [])

  const handleAddPlan = async () => {
    if (!planName.trim()) {
      if (window.showToast) {
        window.showToast('Please enter a plan name', 'warning')
      }
      return
    }

    const surah = surahNames.find(s => s.number == selectedSurah)
    if (!surah) return

    const newPlan = {
      name: planName,
      surahNum: selectedSurah,
      surahName: surah.englishName,
      pace: pace
    }

    const newPlans = [...plans, newPlan]
    await saveData('plans', newPlans)
    setPlanName('')
    setSelectedSurah('1')
    setPace(3)
    if (window.showToast) {
      window.showToast(`Plan "${newPlan.name}" created successfully! 🗓️`, 'success')
    }
  }

  const handleDeletePlan = async (index) => {
    const planName = plans[index].name
    const newPlans = plans.filter((_, i) => i !== index)
    await saveData('plans', newPlans)
    if (window.showToast) {
      window.showToast(`Plan "${planName}" deleted`, 'info')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🗓️ Memorization Planner
      </h1>

      {/* Add Plan Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📝 Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="My Ramadan Goal"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📖 Surah
            </label>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value)}
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
              ⚡ Pace (Ayahs/day)
            </label>
            <input
              type="number"
              value={pace}
              onChange={(e) => setPace(parseInt(e.target.value))}
              min="1"
              max="10"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleAddPlan}
          className="px-6 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light"
        >
          ➕ Add Plan
        </button>
      </div>

      {/* Plans List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Plans</h2>
        {plans.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No plans yet. Create your first memorization plan above!
          </p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-islamic-green"
              >
                <div>
                  <strong className="text-lg text-gray-900 dark:text-white">
                    {plan.name}
                  </strong>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plan.surahName} - {plan.pace} Ayahs/day
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePlan(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ❌ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Planner
