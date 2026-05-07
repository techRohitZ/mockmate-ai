import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Lock, Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <div className="relative flex-1 flex items-center justify-center px-6 pt-32 pb-20">
          {/* Background gradient effect */}
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative w-full max-w-5xl">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 items-start">
              <div>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">MM</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                  <p className="text-slate-400">Sign in to continue your interview prep</p>
                </div>

                {/* Card */}
                <div className="border border-slate-800 rounded-2xl p-8 bg-slate-900/60 backdrop-blur">
                  <form onSubmit={handleLogin} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-slate-400 hover:text-slate-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-teal-500" />
                    <span className="ml-2">Remember me</span>
                  </label>
                  <a href="#" className="text-teal-300 hover:text-teal-200 transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center">
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="px-3 text-sm text-slate-500">OR</span>
                    <div className="flex-1 h-px bg-slate-700"></div>
                  </div>

                  {/* Social Login */}
                  <button className="w-full py-2.5 border border-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Mail size={18} />
                    Continue with Google
                  </button>

                  {/* Sign Up Link */}
                  <p className="text-center text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-teal-300" />
                  <h2 className="text-xl font-semibold">Why MockMate AI?</h2>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Train like it is the real interview with guided mock sessions, coaching feedback, and progress analytics.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { label: 'Live interview flow', icon: MessageSquare },
                    { label: 'Structured feedback', icon: BarChart3 },
                    { label: 'Secure practice history', icon: ShieldCheck },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                      <item.icon size={16} className="text-teal-300" />
                      {item.label}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-200">Quick win</p>
                  <p className="mt-2 text-sm text-slate-200">Finish one mock interview to unlock your first report.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
