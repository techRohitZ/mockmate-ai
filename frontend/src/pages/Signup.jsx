import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Lock, Mail, MessageSquare, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            setError('Google sign-in failed. Please try again.');
            return;
          }

          setLoading(true);
          setError('');
          const result = await loginWithGoogle(response.credential);
          if (result.success) {
            navigate('/dashboard');
          } else {
            setError(result.error || 'Google sign-in failed');
          }
          setLoading(false);
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: '100%',
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, loginWithGoogle, navigate]);

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
      <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col">
        <section
          className="relative flex-1 px-6 pt-24 pb-20 overflow-hidden"
          style={{ fontFamily: '"Space Grotesk", "Sora", sans-serif' }}
        >
          <style>
            {"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap');"}
          </style>
          <div className="pointer-events-none absolute -top-44 right-[-10%] h-[26rem] w-[26rem] rounded-full bg-amber-400/15 blur-[120px]" />
          <div className="pointer-events-none absolute top-20 left-[-8%] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%)]" />

          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.32em] text-slate-300">
                <Sparkles size={14} className="text-amber-300" />
                Start free
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
                  Build your interview edge.
                  <span className="block text-slate-300">Structured prep, real progress.</span>
                </h1>
                <p className="text-slate-300 max-w-xl">
                  Create your account to unlock mock interviews, coding drills, and performance reports in one place.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'AI interview sessions', icon: MessageSquare, detail: 'Realistic, conversational flows.' },
                  { label: 'Weekly performance insights', icon: BarChart3, detail: 'Score trends and focus areas.' },
                  { label: 'Secure progress history', icon: ShieldCheck, detail: 'Keep your prep private.' },
                  { label: 'Personalized prep tracks', icon: Sparkles, detail: 'Plans matched to your goals.' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-2 text-slate-100 font-semibold">
                      <item.icon size={16} className="text-amber-300" />
                      {item.label}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Tip</p>
                <p className="mt-2 text-sm text-slate-200">Complete one mock interview to unlock your first report.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_30px_90px_-60px_rgba(251,191,36,0.45)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">MockMate AI</p>
                  <h2 className="mt-2 text-2xl font-semibold">Create account</h2>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 to-cyan-400 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">MM</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="mt-6 space-y-5">
                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Full name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Confirm password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 transition"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 accent-amber-400 mt-0.5"
                    required
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-cyan-400 py-3 font-semibold text-slate-900 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-3 text-xs uppercase tracking-[0.25em] text-slate-500">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-3">
                <div ref={googleButtonRef} className="min-h-[44px]" />
                {!googleClientId && (
                  <p className="text-xs text-amber-300">
                    Google sign-in is not configured. Add `VITE_GOOGLE_CLIENT_ID` to enable it.
                  </p>
                )}
              </div>

              <p className="text-center text-sm text-slate-400 mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-amber-300 hover:text-amber-200 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}
