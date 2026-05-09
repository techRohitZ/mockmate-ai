import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code,
  Loader2,
  RotateCcw,
  Sparkles,
  Tag,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
];

const TOPIC_OPTIONS = [
  'Arrays',
  'Strings',
  'Hash Maps',
  'Two Pointers',
  'Sliding Window',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
];

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

const DEFAULT_PROBLEM = {
  title: 'Signal Window Alert',
  difficulty: 'Medium',
  topic: 'Sliding Window',
  statement:
    'You are monitoring a stream of signal strengths. Given an array of integers and a window size k, return the maximum sum of any contiguous window of length k. If the array has fewer than k values, return 0. The goal is to detect the strongest sustained signal window. Focus on efficiency and avoid unnecessary recalculations.',
  constraints: [
    '1 <= nums.length <= 200000',
    '1 <= k <= nums.length',
    '-10000 <= nums[i] <= 10000',
  ],
  examples: [
    {
      input: 'nums = [4, -1, 2, 7, -3, 4], k = 3',
      output: '8',
      explanation: 'The window [2, 7, -3] sums to 6, but [4, -1, 2] sums to 5 and [7, -3, 4] sums to 8.',
    },
    {
      input: 'nums = [5, 1, 3], k = 2',
      output: '6',
      explanation: 'The best window is [5, 1] with sum 6.',
    },
  ],
  starterCode: 'function maxSignalWindow(nums, k) {\n  // TODO: implement\n}\n',
  tags: ['Sliding Window', 'Arrays'],
  timeLimitMinutes: 30,
};

export default function CodePractice() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [problemSource, setProblemSource] = useState('ai'); // 'ai' or 'curated'
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [problemId, setProblemId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [curatedProblems, setCuratedProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemStats, setProblemStats] = useState(null);
  const [sessionId] = useState(
    () => `practice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const hasLoadedRef = useRef(false);

  // Load curated problem list
  const loadCuratedProblems = useCallback(async () => {
    setLoadingProblems(true);
    setError('');
    try {
      // Load all problems without filtering by current state
      const response = await axios.get(`http://localhost:5000/api/practice/problems`);
      setCuratedProblems(response.data?.problems || []);
      setProblemStats(response.data?.stats);
    } catch (err) {
      console.error('Failed to load curated problems:', err);
      setError('Unable to load problem list. Please try again.');
    } finally {
      setLoadingProblems(false);
    }
  }, []);

  // Load a specific curated problem
  const loadCuratedProblem = useCallback(async (curatedProblemId) => {
    setIsGenerating(true);
    setError('');
    setSubmission(null);
    setCode(''); // Clear code editor - user writes from scratch
    try {
      const response = await axios.get(`http://localhost:5000/api/practice/problem/${curatedProblemId}`);
      const nextProblem = response.data?.problem;

      if (nextProblem) {
        setProblem(nextProblem);
        setProblemId(nextProblem.id);
        setProblemSource('curated');
      }
    } catch (err) {
      console.error('Failed to load curated problem:', err);
      setError('Unable to load the selected problem. Please try another.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateProblem = useCallback(async () => {
    if (problemSource === 'curated') {
      // For curated problems, load the list first
      await loadCuratedProblems();
      return;
    }

    // AI-generated problems
    setIsGenerating(true);
    setError('');
    setSubmission(null);
    setCode(''); // Clear code editor when loading new problem
    try {
      const response = await axios.post('http://localhost:5000/api/practice/problem', {
        sessionId,
        topic,
        difficulty,
        language,
      });

      const nextProblem = response.data?.problem;
      const nextProblemId = response.data?.problemId || null;

      if (nextProblem) {
        setProblem(nextProblem);
        setProblemId(nextProblemId);
        // Don't auto-fill code - user writes from scratch
        setProblemSource('ai');
      }
    } catch (err) {
      console.error('Failed to generate problem:', err);
      setError('Unable to fetch a fresh problem right now. Showing a fallback prompt.');
      setProblem(DEFAULT_PROBLEM);
      setProblemId(null);
      // Don't auto-fill code
    } finally {
      setIsGenerating(false);
    }
  }, [difficulty, language, sessionId, topic, problemSource, loadCuratedProblems]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    // Load AI-generated problem by default
    if (problemSource === 'ai') {
      generateProblem();
    } else {
      loadCuratedProblems();
    }
  }, []);

  const submitSolution = async () => {
    if (!code.trim() || !problem) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/practice/submit', {
        sessionId,
        problemId,
        problem,
        language,
        code,
      });

      setSubmission(response.data?.evaluation || null);
    } catch (err) {
      console.error('Failed to submit solution:', err);
      setError('Submission failed. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    setCode(problem?.starterCode || '');
  };

  const canSubmit = code.trim().length > 0 && !isSubmitting && !isGenerating;

  return (
    <div
      className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden"
      style={{
        '--accent': '#2dd4bf',
        '--accent-soft': 'rgba(45,212,191,0.2)',
        '--panel': 'rgba(12,18,32,0.86)',
      }}
    >
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-teal-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-5%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),transparent_55%)]" />

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Practice Workspace</p>
              <h1 className="text-xl font-semibold text-slate-100">Code Practice</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
            {/* Problem Source Toggle */}
            <div className="flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 p-1">
              <button
                onClick={() => setProblemSource('ai')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  problemSource === 'ai'
                    ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={13} />
                AI Generated
              </button>
              <button
                onClick={() => {
                  setProblemSource('curated');
                  loadCuratedProblems();
                }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  problemSource === 'curated'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp size={13} />
                Top 100 Problems
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
              {isGenerating || loadingProblems ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} className="text-[color:var(--accent)]" />
              )}
              {isGenerating ? 'Generating problem...' : loadingProblems ? 'Loading problems...' : 'Problem ready'}
            </div>

            {problemSource === 'ai' ? (
              <>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-full px-4 py-2 focus:outline-none focus:border-teal-400"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-full px-4 py-2 focus:outline-none focus:border-teal-400"
                >
                  {TOPIC_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-full px-4 py-2 focus:outline-none focus:border-teal-400"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={generateProblem}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] text-slate-900 text-xs font-semibold px-4 py-2 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} />
                  New Problem
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-400">
                {problemStats && `${problemStats.filtered} problems loaded`}
              </div>
            )}
          </div>
        </div>

      </header>

      <main className="relative z-10 flex-1 min-h-0 px-6 py-5">
        <div
          className={`max-w-7xl mx-auto grid grid-cols-1 gap-6 min-h-0 ${
            problemSource === 'curated'
              ? 'xl:grid-cols-[300px_1.35fr_1.05fr]'
              : 'xl:grid-cols-[1.3fr_1fr]'
          }`}
        >
          {problemSource === 'curated' && (
            <aside className="min-h-0 rounded-2xl border border-slate-800/80 bg-slate-950/70 overflow-hidden flex flex-col animate-fade-in-up">
              <div className="px-4 py-4 border-b border-slate-800/70 bg-slate-950/90">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Top 100</p>
                <h2 className="mt-1 text-sm font-semibold text-slate-100">Problem List</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {problemStats ? `${problemStats.filtered} loaded` : 'Curated interview problems'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingProblems ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm px-2 py-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading problems...
                  </div>
                ) : curatedProblems.length > 0 ? (
                  curatedProblems.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadCuratedProblem(p.id)}
                      className={`w-full text-left rounded-xl px-3 py-3 border transition ${
                        problemId === p.id
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-100'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="line-clamp-1 text-sm font-semibold">{p.title}</div>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <span
                          className={`rounded-full border px-2 py-0.5 ${
                            p.difficulty === 'Easy'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                              : p.difficulty === 'Medium'
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                              : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-slate-300">
                          {p.topic}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 px-2 py-2">No problems found.</p>
                )}
              </div>
            </aside>
          )}

          <section className="min-h-0 flex flex-col gap-6 animate-fade-in-up">
            {error && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.8)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Problem Statement</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50">
                    {problem?.title || 'Generating problem...'}
                  </h2>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/15 px-3 py-1.5 text-teal-200 font-medium">
                      <Tag size={13} />
                      {problem?.topic || topic}
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium ${
                      problem?.difficulty === 'Easy'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                        : problem?.difficulty === 'Medium'
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                        : 'border-rose-500/40 bg-rose-500/15 text-rose-200'
                    }`}>
                      {problem?.difficulty || difficulty}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-slate-300">
                      <Clock size={13} />
                      {problem?.timeLimitMinutes ? `${problem.timeLimitMinutes} min` : '30 min'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-5 text-sm text-slate-300 leading-relaxed">
                <p className="text-slate-200">
                  {problem?.statement || 'Your AI-generated problem will appear here.'}
                </p>

                <div>
                  <h3 className="text-xs uppercase tracking-[0.25em] text-slate-500">Constraints</h3>
                  <ul className="mt-3 space-y-2">
                    {(problem?.constraints || []).map((item, index) => (
                      <li key={index} className="rounded-lg border border-slate-800/70 bg-slate-950/70 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-[0.25em] text-slate-500">Examples</h3>
                  <div className="mt-3 grid gap-3">
                    {(problem?.examples || []).map((example, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3"
                      >
                        <p className="text-xs text-slate-500">Example {index + 1}</p>
                        <p className="mt-2 text-slate-200">Input: {example.input}</p>
                        <p className="mt-1 text-slate-200">Output: {example.output}</p>
                        {example.explanation && (
                          <p className="mt-2 text-slate-400">{example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[color:var(--panel)] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">Notes & Approach</h3>
                <span className="text-xs text-slate-500">Auto-saved locally</span>
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-4 h-40 w-full resize-none rounded-xl bg-slate-950/70 border border-slate-800/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                placeholder="Sketch your approach, outline edge cases, and plan the solution before coding."
              />
            </div>
          </section>

          <section className="min-h-0 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex-1 min-h-[360px] rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-950/80 to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
                    <Code size={18} className="text-teal-400" />
                    Solution Editor
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-700" />
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetCode}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 hover:border-slate-600 transition"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    onClick={submitSolution}
                    disabled={!canSubmit}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      canSubmit
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Run Code
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value ?? '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 16 },
                    automaticLayout: true,
                    fontFamily: 'var(--mono)',
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[color:var(--panel)] p-6 overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Zap size={16} className="text-amber-400" />
                  Professional Code Review
                </div>
                <span className="text-xs text-slate-500">AI Analysis</span>
              </div>

              {!submission && (
                <p className="mt-4 text-sm text-slate-400">
                  Submit your solution to receive a comprehensive AI review with complexity analysis, code quality assessment, and interview tips.
                </p>
              )}

              {submission && (
                <div className="space-y-4 text-sm text-slate-300">
                  {/* Score and Verdict */}
                  <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-slate-800/50">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      submission.score >= 80 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' :
                      submission.score >= 60 ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' :
                      'bg-rose-500/20 border-rose-500/40 text-rose-200'
                    }`}>
                      Score: {submission.score ?? 'N/A'}/100
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      submission.verdict === 'excellent' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' :
                      submission.verdict === 'good' ? 'bg-teal-500/20 border-teal-500/40 text-teal-200' :
                      submission.verdict === 'acceptable' ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' :
                      submission.verdict === 'needs improvement' ? 'bg-orange-500/20 border-orange-500/40 text-orange-200' :
                      'bg-rose-500/20 border-rose-500/40 text-rose-200'
                    }`}>
                      {submission.verdict ? submission.verdict.charAt(0).toUpperCase() + submission.verdict.slice(1) : 'Review'}
                    </span>
                  </div>

                  {/* Summary */}
                  {submission.summary && (
                    <p className="text-slate-200 italic border-l-2 border-teal-500/30 pl-3 py-2">
                      {submission.summary}
                    </p>
                  )}

                  {/* Correctness */}
                  {submission.correctness && (
                    <div className="rounded-lg bg-slate-800/30 border border-slate-800/50 p-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-400 mb-2">Correctness</p>
                      <p className="text-slate-200">
                        {submission.correctness.isCorrect ? '✓ ' : '✗ '}
                        {submission.correctness.analysis}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {Array.isArray(submission.strengths) && submission.strengths.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2 font-semibold">✓ Strengths</p>
                      <ul className="space-y-2">
                        {submission.strengths.map((item, index) => (
                          <li key={index} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-slate-200">
                            <span className="text-emerald-400 font-semibold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {Array.isArray(submission.improvements) && submission.improvements.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-2 font-semibold">→ Improvements</p>
                      <ul className="space-y-2">
                        {submission.improvements.map((item, index) => (
                          <li key={index} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-slate-200">
                            <span className="text-amber-400 font-semibold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Complexity Analysis */}
                  {submission.complexity && (
                    <div className="rounded-lg bg-slate-800/40 border border-slate-800/60 p-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Complexity Analysis</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-400">Time Complexity</p>
                          <p className="text-teal-300 font-mono font-bold">{submission.complexity.time || 'N/A'}</p>
                          {submission.complexity.timeExplanation && (
                            <p className="text-slate-400 text-[11px] mt-1">{submission.complexity.timeExplanation}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-slate-400">Space Complexity</p>
                          <p className="text-amber-300 font-mono font-bold">{submission.complexity.space || 'N/A'}</p>
                          {submission.complexity.spaceExplanation && (
                            <p className="text-slate-400 text-[11px] mt-1">{submission.complexity.spaceExplanation}</p>
                          )}
                        </div>
                      </div>
                      {submission.complexity.isOptimal !== undefined && (
                        <p className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                          <span className="font-semibold">Optimal:</span> {submission.complexity.isOptimal ? 'Yes ✓' : 'No - Consider: ' + (submission.complexity.alternativeApproach || 'alternative approaches')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Code Quality */}
                  {submission.codeQuality && (
                    <div className="rounded-lg bg-slate-800/30 border border-slate-800/50 p-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Code Quality</p>
                      <div className="text-xs space-y-1 text-slate-300">
                        {submission.codeQuality.readability && (
                          <p><span className="text-slate-500">Readability:</span> {submission.codeQuality.readability}</p>
                        )}
                        {submission.codeQuality.readabilityNotes && (
                          <p className="text-slate-400 text-[11px]">{submission.codeQuality.readabilityNotes}</p>
                        )}
                        {submission.codeQuality.structure && (
                          <p className="text-slate-400 text-[11px]">{submission.codeQuality.structure}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Patterns */}
                  {Array.isArray(submission.patterns) && submission.patterns.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-teal-400 mb-2 font-semibold">Design Patterns</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.patterns.map((item, index) => (
                          <span key={index} className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-1 text-xs text-teal-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edge Cases */}
                  {Array.isArray(submission.edgeCases) && submission.edgeCases.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2 font-semibold">Edge Cases to Consider</p>
                      <ul className="space-y-2">
                        {submission.edgeCases.map((item, index) => (
                          <li key={index} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-slate-300 text-xs">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {Array.isArray(submission.commonMistakes) && submission.commonMistakes.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2 font-semibold">Common Pitfalls (Avoided/Watch Out For)</p>
                      <ul className="space-y-2">
                        {submission.commonMistakes.map((item, index) => (
                          <li key={index} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-slate-300 text-xs">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {Array.isArray(submission.nextSteps) && submission.nextSteps.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2 font-semibold">Next Steps</p>
                      <ul className="space-y-2">
                        {submission.nextSteps.map((item, index) => (
                          <li key={index} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-slate-200 text-xs">
                            {index + 1}. {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interview Tips */}
                  {Array.isArray(submission.interviewTips) && submission.interviewTips.length > 0 && (
                    <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-2 font-semibold">💡 Interview Tips</p>
                      <ul className="space-y-2">
                        {submission.interviewTips.map((item, index) => (
                          <li key={index} className="text-slate-200 text-xs">
                            <span className="text-amber-400 font-semibold">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
