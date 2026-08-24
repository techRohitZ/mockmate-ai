import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/client';

const BASE_COLLECTIONS = [
  {
    id: 'google',
    name: 'Google',
    tag: 'Core CS + System Design',
    questionCount: 8,
    difficulty: 'Mid to Senior',
    duration: '35-45 min',
    focus: 'Algorithms depth, trade-offs, and clean system thinking.',
    topics: ['Data Structures', 'Algorithms', 'System Design', 'Complexity'],
    interviewCategory: 'core cs',
    interviewDifficulty: 'Mid-level (3-5 yrs)',
    sampleQuestions: [
      'How would you design a scalable URL shortener?',
      'Explain trade-offs between BFS and DFS in graph search.',
      'What are the bottlenecks in a high-QPS cache layer?'
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    tag: 'Frontend + Product Systems',
    questionCount: 8,
    difficulty: 'Mid-level',
    duration: '30-40 min',
    focus: 'UI architecture, performance, and user-centric decisions.',
    topics: ['React', 'Performance', 'Accessibility', 'State Management'],
    interviewCategory: 'frontend',
    interviewDifficulty: 'Junior (1-3 yrs)',
    sampleQuestions: [
      'How do you prevent re-renders in large React lists?',
      'Explain how you would structure a design system.',
      'What accessibility checks are essential before launch?'
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tag: 'Backend + Platform',
    questionCount: 8,
    difficulty: 'Junior to Mid',
    duration: '30-35 min',
    focus: 'API design, scaling patterns, and secure systems.',
    topics: ['REST APIs', 'Databases', 'Caching', 'Security'],
    interviewCategory: 'backend',
    interviewDifficulty: 'Junior (1-3 yrs)',
    sampleQuestions: [
      'How would you design a rate limiter?',
      'Explain ACID vs BASE and when to use each.',
      'What are common API security pitfalls?'
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tag: 'Behavioral + DSA',
    questionCount: 8,
    difficulty: 'Mid-level',
    duration: '35-45 min',
    focus: 'Leadership principles with structured problem solving.',
    topics: ['Behavioral', 'DSA', 'Scalability', 'Ownership'],
    interviewCategory: 'backend',
    interviewDifficulty: 'Mid-level (3-5 yrs)',
    sampleQuestions: [
      'Tell me about a time you disagreed with a decision.',
      'How would you handle bursty traffic spikes?',
      'Walk through your approach to a two-pointer problem.'
    ],
  },
];

const normalizeValue = (value) => value.toLowerCase().replace(/\s+/g, '');

export default function CompanyCollections() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collections, setCollections] = useState(BASE_COLLECTIONS);
  const [questionPreview, setQuestionPreview] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [loadError, setLoadError] = useState('');

  const selectedKey = normalizeValue(searchParams.get('company') || '');

  const selectedCollection = useMemo(() => {
    if (!selectedKey) {
      return collections[0];
    }
    return (
      collections.find((collection) => collection.id === selectedKey) ||
      collections.find((collection) => normalizeValue(collection.name) === selectedKey) ||
      collections[0]
    );
  }, [collections, selectedKey]);

  useEffect(() => {
    let isMounted = true;

    const loadBanks = async () => {
      try {
        const response = await api.get('/api/interview/company-banks');
        const companies = response.data?.companies;
        if (isMounted && Array.isArray(companies) && companies.length > 0) {
          setCollections(companies);
          setLoadError('');
        }
      } catch (error) {
        if (isMounted) {
          setLoadError('Using local preview. Live company banks are unavailable.');
        }
      }
    };

    loadBanks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCollection?.id) {
      return;
    }

    let isMounted = true;
    const loadQuestions = async () => {
      setIsLoadingPreview(true);
      try {
        const response = await api.get(
          `/api/interview/company-bank/${selectedCollection.id}`
        );
        const questions = response.data?.questions || [];
        if (isMounted) {
          setQuestionPreview(questions.slice(0, 4).map((item) => item.question));
        }
      } catch (error) {
        if (isMounted) {
          setQuestionPreview(selectedCollection.sampleQuestions || []);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [selectedCollection?.id]);

  const handleSelect = (collectionId) => {
    setSearchParams({ company: collectionId });
  };

  const handleInterview = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const query = new URLSearchParams({
      category: selectedCollection.interviewCategory,
      difficulty: selectedCollection.interviewDifficulty,
      duration: '20',
      company: selectedCollection.id,
    });
    navigate(`/interview?${query.toString()}`);
  };

  const handlePractice = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/practice');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="relative pt-28 pb-12 px-6">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              <Building2 size={14} className="text-teal-300" />
              Company collections
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-5xl font-semibold">Interview-ready question sets by company</h1>
              <p className="text-slate-300 max-w-2xl">
                Pick a company collection to see the focus areas, sample questions, and a ready-to-run mock interview.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Collections</p>
            <div className="mt-4 space-y-3">
              {collections.map((collection) => {
                const isActive = collection.id === selectedCollection.id;
                return (
                  <button
                    key={collection.id}
                    onClick={() => handleSelect(collection.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      isActive
                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-100'
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold">{collection.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{collection.tag}</div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5">
                        {collection.questionCount} questions
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5">
                        {collection.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-200">
                  <ClipboardList size={14} />
                  {selectedCollection.tag}
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">{selectedCollection.name} interview kit</h2>
                <p className="text-slate-300">{selectedCollection.focus}</p>
                {loadError && <p className="text-xs text-amber-300">{loadError}</p>}
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
                  {selectedCollection.questionCount || questionPreview.length} questions
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
                  {selectedCollection.duration}
                </span>
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Focus topics</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedCollection.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Question preview</p>
                  {isLoadingPreview ? (
                    <p className="mt-4 text-sm text-slate-400">Loading questions...</p>
                  ) : (
                    <ul className="mt-4 space-y-3 text-sm text-slate-200">
                      {(questionPreview.length > 0
                        ? questionPreview
                        : selectedCollection.sampleQuestions
                      ).map((question) => (
                        <li key={question} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 text-teal-300" />
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recommended flow</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>Quick intro + goals alignment</li>
                    <li>Technical questions tailored to {selectedCollection.name}</li>
                    <li>Follow-up depth questions</li>
                    <li>Wrap-up and feedback notes</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleInterview}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:brightness-110 transition"
                  >
                    Start mock interview <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handlePractice}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                  >
                    Open practice lab
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
