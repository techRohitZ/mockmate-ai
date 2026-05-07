import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Clock,
  Code,
  Database,
  Gauge,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const recentInterviews = useMemo(() => {
    const interviews = Array.isArray(user?.interviews) ? [...user.interviews] : [];
    interviews.sort((a, b) => {
      const aTime = a?.date ? new Date(a.date).getTime() : 0;
      const bTime = b?.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });
    return interviews;
  }, [user?.interviews]);

  const latestResult = location.state?.interviewResults;
  const latestInterview = recentInterviews[0] || null;

  const parseMinutes = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const match = String(value).match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const formatDuration = (value) => {
    if (!value && value !== 0) return 'N/A';
    if (typeof value === 'string') return value;
    return `${value} min`;
  };

  const latestSession = useMemo(() => {
    if (latestResult) {
      return {
        domain: latestResult.category,
        difficulty: latestResult.difficulty,
        duration: formatDuration(latestResult.duration),
        score: latestResult.score,
        questionsAsked: latestResult.questionsAsked,
        date: new Date().toISOString(),
      };
    }

    if (!latestInterview) {
      return null;
    }

    return {
      domain: latestInterview.domain,
      difficulty: latestInterview.difficulty || 'Practice',
      duration: latestInterview.duration,
      score: latestInterview.score,
      questionsAsked: latestInterview.questionsAsked || null,
      date: latestInterview.date,
    };
  }, [latestResult, latestInterview]);

  const totalMinutes = useMemo(() => {
    return recentInterviews.reduce((sum, interview) => sum + parseMinutes(interview.duration), 0);
  }, [recentInterviews]);

  const bestScore = useMemo(() => {
    const scores = recentInterviews.map((item) => Number(item?.score || 0)).filter((item) => Number.isFinite(item));
    return scores.length ? Math.max(...scores) : null;
  }, [recentInterviews]);

  // Stats
  const stats = [
    { 
      label: 'Total Interviews', 
      value: user?.totalInterviews || '0', 
      icon: TrendingUp, 
      color: 'from-teal-500 to-cyan-500' 
    },
    { 
      label: 'Average Score', 
      value: user?.averageScore ? `${user.averageScore.toFixed(1)}%` : 'N/A', 
      icon: Award, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'Minutes Practiced', 
      value: totalMinutes ? `${totalMinutes}` : '0', 
      icon: Clock, 
      color: 'from-emerald-500 to-teal-500' 
    },
    { 
      label: 'Best Score', 
      value: Number.isFinite(bestScore) ? `${bestScore}%` : 'N/A', 
      icon: Target, 
      color: 'from-cyan-500 to-teal-500' 
    },
  ];

  // Interview categories
  const categories = [
    { name: 'Frontend', icon: Code, color: 'from-teal-500 to-cyan-500' },
    { name: 'Backend', icon: Database, color: 'from-emerald-500 to-teal-500' },
    { name: 'DBMS', icon: Database, color: 'from-amber-500 to-orange-500' },
    { name: 'Core CS', icon: Brain, color: 'from-cyan-500 to-teal-500' },
  ];

  const difficulties = ['Fresher (0-1 yrs)', 'Junior (1-3 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)'];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Junior (1-3 yrs)');
  const [interviewDuration, setInterviewDuration] = useState('5');

  const startInterview = () => {
    if (selectedCategory) {
      navigate(`/interview?category=${selectedCategory.toLowerCase()}&difficulty=${selectedDifficulty}&duration=${interviewDuration}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading your workspace...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400 text-lg">Session expired. Please sign in again.</div>
      </div>
    );
  }

  const focusBase = Number.isFinite(user?.averageScore) ? user.averageScore : 72;
  const focusAreas = [
    { label: 'Communication', value: Math.min(100, Math.max(0, Math.round(focusBase - 6))) },
    { label: 'Problem Solving', value: Math.min(100, Math.max(0, Math.round(focusBase + 8))) },
    { label: 'Algorithms & DSA', value: Math.min(100, Math.max(0, Math.round(focusBase - 4))) },
    { label: 'Coding Fluency', value: Math.min(100, Math.max(0, Math.round(focusBase + 2))) },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-teal-200">
                <Sparkles size={14} />
                Interview cockpit
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold text-white">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="mt-3 text-slate-300 max-w-xl">
                  Jump into your next mock interview or review your latest results. Keep the momentum going.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/interview')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-teal-500/50 transition"
                >
                  Start Mock Interview <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/practice')}
                  className="px-6 py-3 rounded-lg border border-slate-700 text-slate-200 font-semibold hover:bg-slate-900 transition"
                >
                  Open Practice Lab
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon size={18} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest session</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {latestSession ? 'Mock interview summary' : 'No interview yet'}
                  </p>
                </div>
                <Gauge size={20} className="text-teal-300" />
              </div>

              {latestSession ? (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1">
                      {latestSession.domain}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1">
                      {latestSession.difficulty}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1">
                      {latestSession.duration}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
                      <p className="mt-2 text-2xl font-semibold text-teal-200">
                        {Number.isFinite(latestSession.score) ? `${latestSession.score}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Questions</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-200">
                        {latestSession.questionsAsked ?? '—'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Latest session recorded on {new Date(latestSession.date).toLocaleDateString()}.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  Complete your first mock interview to unlock a full performance summary here.
                </div>
              )}
            </div>
          </section>

          <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Start a mock interview</h2>
                  <p className="text-sm text-slate-400 mt-2">Pick a focus area and match the difficulty to your goal.</p>
                </div>
                <Sparkles size={20} className="text-teal-300" />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Interview track</p>
                  <div className="mt-4 space-y-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          selectedCategory === cat.name
                            ? `border-teal-500 bg-teal-500/10`
                            : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                          <cat.icon size={20} />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                        {selectedCategory === cat.name && <ArrowRight size={18} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Experience level</p>
                    <div className="mt-4 space-y-2">
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`w-full p-3 rounded-xl border-2 transition-all font-medium text-left text-sm ${
                            selectedDifficulty === diff
                              ? `border-teal-500 bg-teal-500/10`
                              : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Duration</p>
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={interviewDuration}
                          onChange={(e) => setInterviewDuration(e.target.value)}
                          className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                        <span className="text-xl font-semibold text-amber-200 min-w-14">{interviewDuration} min</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3">Short sessions keep focus tight.</p>
                    </div>
                  </div>

                  <button
                    onClick={startInterview}
                    disabled={!selectedCategory}
                    className={`w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                      selectedCategory
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg hover:shadow-teal-500/50 text-white'
                        : 'bg-slate-700 opacity-50 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <Zap size={20} />
                    Start Interview
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Skill focus</h3>
                  <BarChart3 size={18} className="text-teal-300" />
                </div>
                <div className="mt-5 space-y-4">
                  {focusAreas.map((area) => (
                    <div key={area.label}>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{area.label}</span>
                        <span className="text-teal-200 font-semibold">{area.value}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                          style={{ width: `${area.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-teal-200" />
                  <h3 className="text-lg font-semibold">Coach tip</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Keep your responses structured: problem restatement, approach, and complexity. It makes your
                  communication score jump quickly.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Recent interviews</h2>
                <p className="text-sm text-slate-400">Track your latest practice sessions and results.</p>
              </div>
              <button
                onClick={() => navigate('/practice')}
                className="text-sm font-semibold text-teal-200 hover:text-teal-100 transition inline-flex items-center gap-2"
              >
                Explore practice <ArrowRight size={14} />
              </button>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Brain size={32} />
                </div>
                <p className="text-slate-300 text-lg">No interviews yet</p>
                <p className="text-slate-500 mt-2">Start your first mock interview to unlock analytics and progress reports.</p>
                <button
                  onClick={() => {
                    if (categories[0]) {
                      setSelectedCategory(categories[0].name);
                    }
                  }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition inline-flex items-center gap-2"
                >
                  <Zap size={18} />
                  Start your first mock
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Domain</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInterviews.slice(0, 6).map((interview, idx) => (
                        <tr key={idx} className="border-b border-slate-800 hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-sm font-medium">
                              {interview.domain}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {interview.date ? new Date(interview.date).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{interview.duration || '—'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-slate-800 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-gradient-to-r from-teal-500 to-amber-400 h-2 rounded-full transition-all"
                                  style={{ width: `${interview.score}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-sm">{interview.score}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
