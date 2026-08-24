import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Lock, Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col">
        <section
          className="relative flex-1 px-6 pt-24 pb-20 overflow-hidden"
          style={{ fontFamily: '"Space Grotesk", "Sora", sans-serif' }}
        >
          <style>
            {"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap');"}
          </style>
          <div className="pointer-events-none absolute -top-48 left-[-8%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-[120px]" />
          <div className="pointer-events-none absolute top-24 right-[-12%] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),transparent_55%)]" />

          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.32em] text-slate-300">
                <Sparkles size={14} className="text-emerald-300" />
                Secure sign-in
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
                  Welcome back.
                  <span className="block text-slate-300">Let us pick up where you left off.</span>
                </h1>
                <p className="text-slate-300 max-w-xl">
                  Resume mock interviews, review feedback, and keep your momentum with a calm, focused workspace.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Live interview flow', icon: MessageSquare, detail: 'Structured, conversational questions.' },
                  { label: 'Report-ready feedback', icon: BarChart3, detail: 'Clear takeaways after every session.' },
                  { label: 'Private practice history', icon: ShieldCheck, detail: 'Secure logs of your prep.' },
                  { label: 'AI coaching notes', icon: Sparkles, detail: 'Short, actionable feedback.' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-2 text-slate-100 font-semibold">
                      <item.icon size={16} className="text-emerald-300" />
                      {item.label}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Session snapshot</p>
                    <p className="mt-2 text-sm text-slate-200">Last mock interview • Frontend</p>
                  </div>
                  <span className="text-2xl font-semibold text-emerald-200">82%</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-900/70">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: '82%' }} />
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_30px_90px_-60px_rgba(16,185,129,0.55)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">MockMate AI</p>
                  <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">MM</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="mt-6 space-y-5">
                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Email address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15 transition"
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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-slate-950/70 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15 transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 accent-emerald-400" />
                    Remember me
                  </label>
                  <button type="button" className="text-emerald-300 hover:text-emerald-200 transition">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-3 font-semibold text-slate-900 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
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
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-emerald-300 hover:text-emerald-200 font-semibold"
                >
                  Sign up
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
