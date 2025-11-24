import { useState, useEffect } from 'react'

export const useFirebaseData = (user) => {
  const [plans, setPlans] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [badges, setBadges] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [quizScore, setQuizScore] = useState(0)
  const [earnedBadges, setEarnedBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Load from localStorage
      setPlans(JSON.parse(localStorage.getItem('plans') || '[]'))
      setBookmarks(JSON.parse(localStorage.getItem('bookmarks') || '[]'))
      setBadges(JSON.parse(localStorage.getItem('badges') || '[]'))
      setMistakes(JSON.parse(localStorage.getItem('mistakes') || '[]'))
      setQuizScore(parseInt(localStorage.getItem('quizScore') || '0'))
      setEarnedBadges(JSON.parse(localStorage.getItem('earnedBadges') || '[]'))
      setLoading(false)
      return
    }

    // Load from Firebase
    const loadData = async () => {
      if (window.firebaseService) {
        const result = await window.firebaseService.getUserData(user.uid)
        if (result.success) {
          setPlans(result.data.plans || [])
          setBookmarks(result.data.bookmarks || [])
          setBadges(result.data.badges || [])
          setMistakes(result.data.mistakes || [])
          setQuizScore(result.data.quizScore || 0)
          setEarnedBadges(result.data.earnedBadges || [])
        }
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  const saveData = async (type, data) => {
    if (user && window.firebaseService) {
      const uid = user.uid
      switch(type) {
        case 'plans':
          await window.firebaseService.savePlans(uid, data)
          setPlans(data)
          break
        case 'bookmarks':
          await window.firebaseService.saveBookmarks(uid, data)
          setBookmarks(data)
          break
        case 'badges':
          await window.firebaseService.saveBadges(uid, data)
          setBadges(data)
          setEarnedBadges(data.map(b => b.surahNum))
          break
        case 'mistakes':
          await window.firebaseService.saveMistakes(uid, data)
          setMistakes(data)
          break
        case 'quizScore':
          await window.firebaseService.updateQuizScore(uid, data)
          setQuizScore(data)
          break
      }
    } else {
      // Fallback to localStorage
      switch(type) {
        case 'plans':
          localStorage.setItem('plans', JSON.stringify(data))
          setPlans(data)
          break
        case 'bookmarks':
          localStorage.setItem('bookmarks', JSON.stringify(data))
          setBookmarks(data)
          break
        case 'badges':
          localStorage.setItem('badges', JSON.stringify(data))
          localStorage.setItem('earnedBadges', JSON.stringify(data.map(b => b.surahNum)))
          setBadges(data)
          setEarnedBadges(data.map(b => b.surahNum))
          break
        case 'mistakes':
          localStorage.setItem('mistakes', JSON.stringify(data))
          setMistakes(data)
          break
        case 'quizScore':
          localStorage.setItem('quizScore', data.toString())
          setQuizScore(data)
          break
      }
    }
  }

  return {
    plans,
    bookmarks,
    badges,
    mistakes,
    quizScore,
    earnedBadges,
    loading,
    saveData
  }
}

