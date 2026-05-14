import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileProfileRef = useRef(null);

  const userInitials = useMemo(() => {
    if (!user?.name) {
      return 'U';
    }
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
    return initials || 'U';
  }, [user?.name]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (profileRef.current && profileRef.current.contains(target)) {
        return;
      }
      if (mobileProfileRef.current && mobileProfileRef.current.contains(target)) {
        return;
      }
      setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsProfileOpen(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
  ];

  return (
    <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              navigate('/');
              setIsOpen(false);
            }}
          >
            <div className="w-8 h-8">
              <svg
                viewBox="0 0 64 64"
                className="h-full w-full"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mockmate-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#mockmate-gradient)" />
                <path
                  d="M18 42V22l14 14 14-14v20"
                  stroke="white"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="32" r="22" stroke="white" strokeOpacity="0.2" />
              </svg>
            </div>
            <span className="font-bold text-lg text-white">MockMate AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsProfileOpen(false)}
                className={({ isActive }) =>
                  `transition-colors font-medium ${
                    isActive ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-teal-500/20 ring-1 ring-teal-500/30 hover:shadow-teal-500/40 transition"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  title="Account"
                >
                  {userInitials}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">Signed in</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all text-white"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-800 mt-4 pt-4 space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileOpen(false);
                }}
                className={({ isActive }) =>
                  `block w-full text-left transition-colors font-medium py-2 ${
                    isActive ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            {user ? (
              <div className="border-t border-slate-800 mt-2 pt-3" ref={mobileProfileRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-slate-900/60 transition"
                >
                  <span className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {userInitials}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-200">Account</p>
                    <p className="text-xs text-slate-500">Tap to manage</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
                    <div className="px-4 py-3 text-sm text-slate-200 border-b border-slate-800">
                      {user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-slate-300 hover:text-white transition-colors font-medium py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setIsOpen(false);
                  }}
                  className="w-full px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all text-white mt-2"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}