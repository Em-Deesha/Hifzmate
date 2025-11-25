import { useState, useEffect } from 'react'
import { useFirebaseData } from '../hooks/useFirebaseData'

const Quiz = ({ user }) => {
  const [surahNames, setSurahNames] = useState([])
  const [selectedSurah, setSelectedSurah] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizMistakes, setQuizMistakes] = useState([])
  const [quizComplete, setQuizComplete] = useState(false)
  const { mistakes, saveData, quizScore: totalScore } = useFirebaseData(user)

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/meta')
      .then(res => res.json())
      .then(data => setSurahNames(data.data.surahs.references))
  }, [])

  const loadSurahData = async (surahNum) => {
    try {
      const api = `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih,ur.jalandhry`
      const res = await fetch(api)
      const data = await res.json()
      const [ar, en, ur] = data.data
      return { ar, en, ur }
    } catch (error) {
      console.error('Error loading surah:', error)
      return null
    }
  }

  const generateQuestions = async (surahNum, count) => {
    const surahData = await loadSurahData(surahNum)
    if (!surahData) return []

    const { ar, en, ur } = surahData
    const questions = []
    const ayahs = ar.ayahs

    // Shuffle ayahs to get random selection
    const shuffledAyahs = [...ayahs].sort(() => Math.random() - 0.5)

    for (let i = 0; i < Math.min(count, ayahs.length); i++) {
      const ayah = shuffledAyahs[i]
      const ayahNum = ayah.number
      const arabicText = ayah.text
      const englishText = en.ayahs.find(a => a.number === ayahNum)?.text || ''
      const urduText = ur.ayahs.find(a => a.number === ayahNum)?.text || ''

      // Generate different types of questions
      const questionType = Math.floor(Math.random() * 4)

      if (questionType === 0) {
        // Type 1: Identify ayah from Arabic text
        questions.push({
          type: 'arabic',
          question: `Which ayah number is this Arabic text from?`,
          text: arabicText,
          correctAnswer: ayahNum.toString(),
          options: generateOptions(ayahNum, ayahs.length),
          surahNum,
          ayahNum
        })
      } else if (questionType === 1) {
        // Type 2: Identify ayah from English translation
        questions.push({
          type: 'english',
          question: `Which ayah number is this English translation from?`,
          text: englishText.substring(0, 150) + (englishText.length > 150 ? '...' : ''),
          correctAnswer: ayahNum.toString(),
          options: generateOptions(ayahNum, ayahs.length),
          surahNum,
          ayahNum
        })
      } else if (questionType === 2) {
        // Type 3: Fill in the blank (English)
        const words = englishText.split(' ')
        if (words.length > 3) {
          const blankIndex = Math.floor(Math.random() * (words.length - 2)) + 1
          const blankWord = words[blankIndex]
          words[blankIndex] = '______'
          questions.push({
            type: 'fill-blank',
            question: `Fill in the blank in this translation:`,
            text: words.join(' '),
            correctAnswer: blankWord.toLowerCase(),
            options: generateWordOptions(blankWord, words),
            surahNum,
            ayahNum
          })
        }
      } else {
        // Type 4: Identify ayah from Urdu translation
        questions.push({
          type: 'urdu',
          question: `Which ayah number is this Urdu translation from?`,
          text: urduText.substring(0, 100) + (urduText.length > 100 ? '...' : ''),
          correctAnswer: ayahNum.toString(),
          options: generateOptions(ayahNum, ayahs.length),
          surahNum,
          ayahNum
        })
      }
    }

    return questions.slice(0, count)
  }

  const generateOptions = (correctNum, totalAyahs) => {
    const options = [correctNum.toString()]
    while (options.length < 4) {
      const randomNum = Math.floor(Math.random() * totalAyahs) + 1
      if (!options.includes(randomNum.toString())) {
        options.push(randomNum.toString())
      }
    }
    return options.sort(() => Math.random() - 0.5)
  }

  const generateWordOptions = (correctWord, allWords) => {
    const options = [correctWord.toLowerCase()]
    const otherWords = allWords.filter(w => 
      w.length > 3 && 
      w.toLowerCase() !== correctWord.toLowerCase() &&
      !/[.,!?;:]/.test(w)
    )
    
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)]
      if (!options.includes(randomWord.toLowerCase())) {
        options.push(randomWord.toLowerCase())
      }
    }
    
    // Fill remaining with generic words if needed
    const genericWords = ['the', 'and', 'of', 'to', 'in', 'is', 'it', 'that', 'for', 'with']
    while (options.length < 4) {
      const word = genericWords[Math.floor(Math.random() * genericWords.length)]
      if (!options.includes(word)) {
        options.push(word)
      }
    }
    
    return options.sort(() => Math.random() - 0.5)
  }

  const startQuiz = async () => {
    if (!selectedSurah) {
      if (window.showToast) {
        window.showToast('Please select a surah', 'warning')
      }
      return
    }

    const surahNum = parseInt(selectedSurah)
    setQuizStarted(true)
    setQuizScore(0)
    setQuizMistakes([])
    setCurrentQuestionIndex(0)
    setQuizComplete(false)

    const questions = await generateQuestions(surahNum, numQuestions)
    setQuizQuestions(questions)
    setSelectedAnswer('')
    setShowResult(false)
  }

  const handleAnswerSelect = (answer) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) {
      if (window.showToast) {
        window.showToast('Please select an answer', 'warning')
      }
      return
    }

    const currentQuestion = quizQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()

    setShowResult(true)

    if (isCorrect) {
      setQuizScore(quizScore + 1)
      if (window.showToast) {
        window.showToast('✅ Correct!', 'success', 1000)
      }
    } else {
      const mistake = {
        question: currentQuestion.question,
        text: currentQuestion.text,
        your: selectedAnswer,
        correct: currentQuestion.correctAnswer,
        surahNum: currentQuestion.surahNum,
        ayahNum: currentQuestion.ayahNum
      }
      setQuizMistakes([...quizMistakes, mistake])
      if (window.showToast) {
        window.showToast('❌ Incorrect', 'error', 1000)
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      // Quiz complete
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    setQuizComplete(true)
    
    // Save total score
    const newTotalScore = (totalScore || 0) + quizScore
    await saveData('quizScore', newTotalScore)

    // Save mistakes
    const allMistakes = [...mistakes, ...quizMistakes]
    await saveData('mistakes', allMistakes)

    if (window.showToast) {
      const percentage = Math.round((quizScore / quizQuestions.length) * 100)
      window.showToast(
        `Quiz complete! Score: ${quizScore}/${quizQuestions.length} (${percentage}%)`,
        quizScore === quizQuestions.length ? 'achievement' : 'info',
        3000
      )
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
    setShowResult(false)
    setQuizScore(0)
    setQuizMistakes([])
    setQuizComplete(false)
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const selectedSurahName = surahNames.find(s => s.number == selectedSurah)?.englishName || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🧠 Quran Quiz
      </h1>

      {!quizStarted ? (
        // Quiz Setup
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Quiz Setup
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📖 Select Surah
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a surah...</option>
                {surahNames.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.englishName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔢 Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                      numQuestions === num
                        ? 'bg-islamic-green text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light font-semibold text-lg"
            >
              🚀 Start Quiz
            </button>
          </div>
        </div>
      ) : quizComplete ? (
        // Quiz Results
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {quizScore === quizQuestions.length ? '🎉' : quizScore >= quizQuestions.length * 0.7 ? '🌟' : '📚'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Complete!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {selectedSurahName}
            </p>
            <div className="text-4xl font-bold text-islamic-green mb-2">
              {quizScore} / {quizQuestions.length}
            </div>
            <div className="text-2xl text-gray-600 dark:text-gray-400">
              {Math.round((quizScore / quizQuestions.length) * 100)}% Correct
            </div>
          </div>

          {quizMistakes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ❌ Mistakes ({quizMistakes.length})
              </h3>
              <div className="space-y-3">
                {quizMistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      {mistake.question}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1" dir="rtl">
                      {mistake.text}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-red-600 dark:text-red-400">Your answer: {mistake.your}</span>
                      {' • '}
                      <span className="text-green-600 dark:text-green-400">Correct: {mistake.correct}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetQuiz}
            className="w-full px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light font-semibold text-lg"
          >
            🔄 Start New Quiz
          </button>
        </div>
      ) : currentQuestion ? (
        // Quiz Question
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </div>
              <div className="text-lg font-bold text-islamic-green">
                Score: {quizScore} / {currentQuestionIndex}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-islamic-green h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <p
                className={`text-lg ${
                  currentQuestion.type === 'arabic' || currentQuestion.type === 'urdu'
                    ? 'text-right'
                    : 'text-left'
                }`}
                dir={currentQuestion.type === 'arabic' || currentQuestion.type === 'urdu' ? 'rtl' : 'ltr'}
              >
                {currentQuestion.text}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                        : selectedAnswer === option
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-300'
                      : selectedAnswer === option
                      ? 'bg-islamic-green/20 border-islamic-green'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-islamic-green'
                  }`}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                  {showResult && option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() && (
                    <span className="ml-2 text-green-600 dark:text-green-400">✅</span>
                  )}
                  {showResult && selectedAnswer === option && option.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                    <span className="ml-2 text-red-600 dark:text-red-400">❌</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green-light disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                ✅ Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
              >
                {currentQuestionIndex < quizQuestions.length - 1 ? '➡️ Next Question' : '🏁 Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      )}

      {/* All Mistakes Section */}
      {mistakes.length > 0 && !quizStarted && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              ❌ All Mistakes
            </h2>
            <button
              onClick={async () => {
                await saveData('mistakes', [])
                if (window.showToast) {
                  window.showToast('Mistakes cleared', 'info')
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              🗑️ Clear All
            </button>
          </div>
          <div className="space-y-2">
            {mistakes.slice(0, 10).map((mistake, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
              >
                <p className="text-gray-900 dark:text-white">
                  <strong>Q:</strong> {mistake.question}
                </p>
                {mistake.text && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1" dir="rtl">
                    {mistake.text}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="text-red-600">Your: {mistake.your || '-'}</span>
                  {' • '}
                  <span className="text-green-600">Correct: {mistake.correct}</span>
                </p>
              </div>
            ))}
            {mistakes.length > 10 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Showing 10 of {mistakes.length} mistakes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz
