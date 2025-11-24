import { useState } from 'react'
// Firebase service available globally
const getFirebaseService = () => {
  if (window.firebaseService) return window.firebaseService;
  // Fallback if service not loaded
  return {
    signIn: async (email, password) => {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    },
    signUp: async (email, password, displayName) => {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName });
      return { success: true, user: userCredential.user };
    }
  };
};

const AuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const firebaseService = getFirebaseService();
      if (isLogin) {
        const result = await firebaseService.signIn(email, password)
        if (result.success) {
          onSuccess(result.user)
          onClose()
        } else {
          setError(result.error || 'Login failed')
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        const result = await firebaseService.signUp(email, password, name)
        if (result.success) {
          onSuccess(result.user)
          onClose()
        } else {
          setError(result.error || 'Signup failed')
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 font-semibold ${
              isLogin
                ? 'text-islamic-green border-b-2 border-islamic-green'
                : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 font-semibold ${
              !isLogin
                ? 'text-islamic-green border-b-2 border-islamic-green'
                : 'text-gray-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-islamic-green text-white py-3 rounded-lg font-semibold hover:bg-islamic-green-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal

