import { useState, useEffect } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Quiz = ({ user }) => {
  const [surahNames, setSurahNames] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showNext, setShowNext] = useState(false)
  const { quizScore, mistakes, saveData } = useFirebaseData(user)
  const [score, setScore] = useState(0)

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))
  }, [])

  useEffect(() => {
    if (surahNames.length > 0) {
      newQuestion()
    }
  }, [surahNames])

  useEffect(() => {
    setScore(quizScore)
  }, [quizScore])

  const newQuestion = () => {
    const randomNum = Math.floor(Math.random() * 114) + 1
    const surah = surahNames[randomNum - 1]
    if (surah) {
      setCurrentQuestion({
        number: randomNum,
        surah: surah
      })
      setAnswer('')
      setFeedback('')
      setShowNext(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion) return

    const userAnswer = answer.trim().toLowerCase()
    const correctAnswer = currentQuestion.surah.englishName.toLowerCase()

    if (userAnswer === correctAnswer) {
      setFeedback('✅ Correct!')
      const newScore = score + 1
      setScore(newScore)
      await saveData('quizScore', newScore)
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${currentQuestion.surah.englishName}`)
      const newMistakes = [...mistakes, {
        question: `Which Surah has number ${currentQuestion.number}?`,
        correct: correctAnswer,
        your: userAnswer
      }]
      await saveData('mistakes', newMistakes)
    }
    setShowNext(true)
  }

  const handleClearMistakes = async () => {
    await saveData('mistakes', [])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🧠 Quran Quiz
      </h1>

      {/* Quiz Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        {currentQuestion && (
          <>
            <div className="mb-6">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Which Surah has number {currentQuestion.number}?
              </p>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Your answer..."
                className="w-full px-4 py-3 border rounded-lg text-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light"
              >
                ✅ Submit
              </button>
              {showNext && (
                <button
                  onClick={newQuestion}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  ➡️ Next Question
                </button>
              )}
            </div>

            {feedback && (
              <div className={`p-4 rounded-lg mb-4 ${
                feedback.startsWith('✅') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <p className="font-semibold">{feedback}</p>
              </div>
            )}

            <div className="text-xl font-bold text-islamic-green">
              Score: {score}
            </div>
          </>
        )}
      </div>

      {/* Mistakes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            ❌ My Mistakes
          </h2>
          {mistakes.length > 0 && (
            <button
              onClick={handleClearMistakes}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              🗑️ Clear Mistakes
            </button>
          )}
        </div>
        {mistakes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No mistakes yet! Keep up the great work! 🎉
          </p>
        ) : (
          <ul className="space-y-2">
            {mistakes.map((mistake, index) => (
              <li
                key={index}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
              >
                <p className="text-gray-900 dark:text-white">
                  <strong>Q:</strong> {mistake.question}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Your answer:</strong> {mistake.your || '-'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Correct:</strong> {mistake.correct}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Quiz
