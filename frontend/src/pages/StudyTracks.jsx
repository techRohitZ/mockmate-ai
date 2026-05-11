import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Target, Timer, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TRACKS = [
  {
    id: 'dsa150',
    name: 'DSA 150 Sprint',
    cadence: '6-8 weeks',
    level: 'Intermediate',
    description: 'A structured sprint that covers the highest ROI DSA topics in a progression that builds confidence.',
    modules: ['Arrays + Strings', 'Two Pointers', 'Trees + Graphs', 'Dynamic Programming', 'Mock interviews'],
    focus: ['Pattern recognition', 'Speed + accuracy', 'Interview readiness'],
  },
  {
    id: 'arrays',
    name: 'Arrays + Strings',
    cadence: '2-3 weeks',
    level: 'Beginner',
    description: 'Master the fundamentals with repeated patterns and fast feedback loops.',
    modules: ['Sliding Window', 'Two Pointers', 'Prefix Sums', 'Sorting basics'],
    focus: ['Core patterns', 'Edge cases', 'Confidence building'],
  },
  {
    id: 'graphs',
    name: 'Graphs + Trees',
    cadence: '3-4 weeks',
    level: 'Intermediate',
    description: 'Work through traversal, recursion, and graph modeling with practice-first structure.',
    modules: ['DFS + BFS', 'Tree traversal', 'Union Find', 'Topological sorting'],
    focus: ['Problem modeling', 'Complexity intuition', 'Accuracy under pressure'],
  },
  {
    id: 'system-design',
    name: 'System Design Basics',
    cadence: '2 weeks',
    level: 'Intermediate',
    description: 'Build end-to-end thinking for scalable system interviews and design reviews.',
    modules: ['Requirements', 'API design', 'Scaling patterns', 'Observability'],
    focus: ['Trade-offs', 'Clarity', 'Architecture communication'],
  },
  {
    id: 'custom',
    name: 'Custom Plan',
    cadence: 'Flexible',
    level: 'Any level',
    description: 'Combine company collections, practice drills, and interviews into one focused plan.',
    modules: ['Company question sets', 'Practice lab sessions', 'Mock interviews', 'Weekly review'],
    focus: ['Personalized path', 'Goal alignment', 'Weekly progress checks'],
  },
];

const normalizeValue = (value) => value.toLowerCase().replace(/\s+/g, '');

export default function StudyTracks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedKey = normalizeValue(searchParams.get('track') || '');

  const selectedTrack = useMemo(() => {
    if (!selectedKey) {
      return TRACKS[0];
    }
    return (
      TRACKS.find((track) => track.id === selectedKey) ||
      TRACKS.find((track) => normalizeValue(track.name) === selectedKey) ||
      TRACKS[0]
    );
  }, [selectedKey]);

  const handleSelect = (trackId) => {
    setSearchParams({ track: trackId });
  };

  const handlePractice = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/practice');
  };

  const handleInterview = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const query = new URLSearchParams({
      category: 'core cs',
      difficulty: 'Junior (1-3 yrs)',
      duration: '15',
    });
    navigate(`/interview?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="relative pt-28 pb-12 px-6">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              <BookOpen size={14} className="text-teal-300" />
              Study tracks
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-5xl font-semibold">Guided tracks built for momentum</h1>
              <p className="text-slate-300 max-w-2xl">
                Follow a structured path and keep your prep consistent. Each track pairs practice drills with mock interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tracks</p>
            <div className="mt-4 space-y-3">
              {TRACKS.map((track) => {
                const isActive = track.id === selectedTrack.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelect(track.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100'
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold">{track.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{track.cadence} • {track.level}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                  <Sparkles size={14} />
                  {selectedTrack.level}
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">{selectedTrack.name}</h2>
                <p className="text-slate-300">{selectedTrack.description}</p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 inline-flex items-center gap-2">
                  <Timer size={12} />
                  {selectedTrack.cadence}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 inline-flex items-center gap-2">
                  <Target size={12} />
                  {selectedTrack.level}
                </span>
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Weekly modules</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    {selectedTrack.modules.map((module) => (
                      <li key={module} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Focus outcomes</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTrack.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recommended rhythm</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>2 practice sessions per week</li>
                    <li>1 mock interview checkpoint</li>
                    <li>15 minute review + notes</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePractice}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:brightness-110 transition"
                  >
                    Start practice lab <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleInterview}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                  >
                    Schedule mock interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
