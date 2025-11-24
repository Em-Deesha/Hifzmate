import { Link, useLocation } from 'react-router-dom'

const Navbar = ({ user, onAuthClick, onLogout, darkMode, toggleDarkMode }) => {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/home' && location.pathname === '/') return true
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-islamic-green to-islamic-green-light shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="HifzMate" className="h-10 w-auto" />
            <span className="text-white text-xl font-bold">HifzMate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/home" isActive={isActive('/home') || isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/reader" isActive={isActive('/reader')}>
              Quran Reader
            </NavLink>
            <NavLink to="/planner" isActive={isActive('/planner')}>
              Planner
            </NavLink>
            <NavLink to="/quiz" isActive={isActive('/quiz')}>
              Quiz
            </NavLink>
            <NavLink to="/badges" isActive={isActive('/badges')}>
              Badges
            </NavLink>
            <NavLink to="/bookmarks" isActive={isActive('/bookmarks')}>
              Bookmarks
            </NavLink>
            <NavLink to="/profile" isActive={isActive('/profile')}>
              Profile
            </NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center space-x-2 text-white">
                <span className="text-sm">Welcome, {user.displayName || user.email}</span>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            )}

            {/* Auth Button */}
            {!user && (
              <button
                onClick={onAuthClick}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Login/Signup"
              >
                👤
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-islamic-green-light">
        <div className="px-4 py-2 space-y-1">
          <MobileNavLink to="/home" isActive={isActive('/home') || isActive('/')}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/reader" isActive={isActive('/reader')}>
            Quran Reader
          </MobileNavLink>
          <MobileNavLink to="/planner" isActive={isActive('/planner')}>
            Planner
          </MobileNavLink>
          <MobileNavLink to="/quiz" isActive={isActive('/quiz')}>
            Quiz
          </MobileNavLink>
          <MobileNavLink to="/badges" isActive={isActive('/badges')}>
            Badges
          </MobileNavLink>
          <MobileNavLink to="/bookmarks" isActive={isActive('/bookmarks')}>
            Bookmarks
          </MobileNavLink>
          <MobileNavLink to="/profile" isActive={isActive('/profile')}>
            Profile
          </MobileNavLink>
        </div>
      </div>
    </nav>
  )
}

const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white text-islamic-green shadow-md'
        : 'text-white hover:bg-white/20'
    }`}
  >
    {children}
  </Link>
)

const MobileNavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-white text-islamic-green'
        : 'text-white hover:bg-white/20'
    }`}
  >
    {children}
  </Link>
)

export default Navbar

