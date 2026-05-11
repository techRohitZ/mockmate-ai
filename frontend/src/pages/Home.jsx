import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Code,
  Gauge,
  MessageSquare,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      title: 'Pick a plan',
      description: 'Choose a company set or a study track tailored to your goals.',
      icon: Target,
    },
    {
      title: 'Run a mock interview',
      description: 'Practice communication and coding with a realistic AI interviewer.',
      icon: Mic,
    },
    {
      title: 'Review and iterate',
      description: 'Get structured feedback and repeat with measurable progress.',
      icon: BarChart3,
    },
  ];

  const companyPlans = [
    { name: 'Google', count: '70 core questions' },
    { name: 'Meta', count: '120 interview drills' },
    { name: 'Microsoft', count: '50 must-know prompts' },
    { name: 'Amazon', count: '100 behavioral + DSA' },
  ];

  const studyTracks = [
    { name: 'DSA 150 Sprint', count: 'Curated progression' },
    { name: 'Arrays + Strings', count: '40 focused drills' },
    { name: 'Graphs + Trees', count: '32 guided prompts' },
    { name: 'System Design Basics', count: '16 walkthroughs' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute top-32 right-[-10%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-teal-200">
              <Sparkles size={14} />
              AI mock interview platform
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                Realistic interviews. Structured feedback. Measurable growth.
              </h1>
              <p className="text-lg text-slate-300 max-w-xl">
                MockMate AI simulates real interview flow with targeted questions, coding prompts, and actionable reports
                so you improve faster with every session.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="px-7 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-teal-500/50 transition"
              >
                Start mock interview <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate(isAuthenticated ? '/practice' : '/login')}
                className="px-7 py-3 rounded-lg border border-slate-700 text-slate-200 font-semibold hover:bg-slate-900 transition"
              >
                Open practice lab
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Adaptive AI coach', icon: Sparkles },
                { label: 'Voice + chat flow', icon: MessageSquare },
                { label: 'Deep interview reports', icon: Gauge },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300"
                >
                  <item.icon size={18} className="text-teal-300" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Session snapshot
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1">Level: Mid</span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1">24:10</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>MockMate AI</span>
                    <ShieldCheck size={14} className="text-teal-300" />
                  </div>
                  <p className="mt-3 text-sm text-slate-200">
                    Walk me through how you would optimize a sliding window solution. What trade-offs matter here?
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>You</span>
                    <span className="text-emerald-300">Responding</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">
                    I would keep a rolling sum and update it in $O(1)$ by removing the outgoing element and adding the incoming element.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Code Editor</span>
                    <span className="text-amber-300">JavaScript</span>
                  </div>
                  <div className="mt-3 font-mono text-xs text-slate-300 space-y-1">
                    <div>const maxWindow = (nums, k) =&gt; &#123;</div>
                    <div>&nbsp;&nbsp;let sum = 0;</div>
                    <div>&nbsp;&nbsp;for (let i = 0; i &lt; k; i++) sum += nums[i];</div>
                    <div>&nbsp;&nbsp;let best = sum;</div>
                    <div>&nbsp;&nbsp;for (let i = k; i &lt; nums.length; i++) &#123;</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;sum += nums[i] - nums[i - k];</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;best = Math.max(best, sum);</div>
                    <div>&nbsp;&nbsp;&#125;</div>
                    <div>&nbsp;&nbsp;return best;</div>
                    <div>&#125;;</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-10 rounded-2xl border border-teal-500/30 bg-slate-950/90 px-4 py-3 shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-teal-200">Score trend</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="text-2xl font-semibold text-white">82%</div>
                <div className="text-xs text-emerald-300">+12 this week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Row */}
      <section className="px-6 pb-14">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Trusted by engineers from</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb', 'NVIDIA'].map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-300"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold">A better loop for interview prep</h2>
            <p className="text-slate-300">
              Each session blends mock conversation, targeted questions, and structured feedback so you keep improving on
              both clarity and correctness.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-200">
                    <step.icon size={18} />
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Plans */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Practice plans</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Targeted prep without the noise</h2>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Focus on what matters for your next interview. Each plan blends curated questions with mock interview runs.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-400">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search for a company or track"
                className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-500 w-56"
              />
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Company collections</h3>
                <span className="text-xs text-slate-400">Most practiced</span>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {companyPlans.map((plan) => (
                  <div key={plan.name} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{plan.name}</p>
                    <p className="mt-2 text-xs text-slate-400">{plan.count}</p>
                    <button
                      onClick={() => navigate(`/collections?company=${encodeURIComponent(plan.name)}`)}
                      className="mt-4 text-xs font-semibold text-teal-300 hover:text-teal-200 transition"
                    >
                      View plan
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Study tracks</h3>
                  <span className="text-xs text-slate-400">Guided progression</span>
                </div>
                <div className="mt-5 space-y-3">
                  {studyTracks.map((track) => (
                    <div key={track.name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{track.name}</p>
                        <p className="text-xs text-slate-400">{track.count}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/tracks?track=${encodeURIComponent(track.name)}`)}
                        className="text-xs font-semibold text-teal-300 hover:text-teal-200 transition"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-6">
                <h3 className="text-lg font-semibold">Need a custom plan?</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Build a personalized schedule based on your timeline, role, and target company list.
                </p>
                <button
                  onClick={() => navigate('/tracks?track=custom')}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-200"
                >
                  Build custom plan <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Feedback that matters</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Know exactly what to improve after every mock</h2>
            <p className="text-slate-300">
              MockMate AI scores communication, problem-solving, and coding clarity. You get actionable steps instead of
              vague comments.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Real-time feedback', icon: Zap },
                { label: 'Structured interview reports', icon: BarChart3 },
                { label: 'Communication analysis', icon: MessageSquare },
                { label: 'Progress tracking', icon: Brain },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <item.icon size={16} className="text-teal-300" />
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interview report</h3>
              <span className="text-xs text-slate-400">Last session</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Communication', value: 72 },
                { label: 'Problem Solving', value: 84 },
                { label: 'Algorithms & DSA', value: 68 },
                { label: 'Coding Fluency', value: 77 },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{metric.label}</span>
                    <span className="text-teal-200 font-semibold">{metric.value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="p-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold">Ready to level up your interview prep?</h2>
              <p className="mt-3 text-slate-400 max-w-2xl">
                Start with a free mock interview and see where you can improve right away.
              </p>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
