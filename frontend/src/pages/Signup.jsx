import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Lock, Mail, MessageSquare, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

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
                  <h1 className="text-3xl font-bold text-white mb-2">Get Started Free</h1>
                  <p className="text-slate-400">Join MockMate AI and ace your interviews</p>
                </div>

                {/* Card */}
                <div className="border border-slate-800 rounded-2xl p-8 bg-slate-900/60 backdrop-blur">
                  <form onSubmit={handleSignup} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start text-sm text-slate-400 hover:text-slate-300 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-teal-500 mt-0.5" required />
                  <span className="ml-2">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center">
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="px-3 text-sm text-slate-500">OR</span>
                    <div className="flex-1 h-px bg-slate-700"></div>
                  </div>

                  {/* Social Signup */}
                  <button className="w-full py-2.5 border border-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Mail size={18} />
                    Sign up with Google
                  </button>

                  {/* Sign In Link */}
                  <p className="text-center text-slate-400 mt-6">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-teal-300" />
                  <h2 className="text-xl font-semibold">Start strong</h2>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Create your account to unlock mock interviews, coding drills, and performance reports in one place.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { label: 'AI interview sessions', icon: MessageSquare },
                    { label: 'Weekly performance insights', icon: BarChart3 },
                    { label: 'Secure progress history', icon: ShieldCheck },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                      <item.icon size={16} className="text-teal-300" />
                      {item.label}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-200">Tip</p>
                  <p className="mt-2 text-sm text-slate-200">Complete one mock interview to unlock your full report.</p>
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
