import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function InterviewFeedback() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token } = useAuth();

  const [evaluation, setEvaluation] = useState(state?.evaluation || null);
  const [interviewResults, setInterviewResults] = useState(state?.interviewResults || null);
  const [responses, setResponses] = useState(Array.isArray(state?.responses) ? state.responses : []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [recentSessions, setRecentSessions] = useState([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState('');
  const activeRequestRef = useRef(0);

  const sessionId = state?.sessionId || state?.interviewResults?.sessionId || null;

  const normalizeEvaluation = (value) => {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
    return value;
  };

  useEffect(() => {
    setEvaluation(normalizeEvaluation(state?.evaluation));
    setInterviewResults(state?.interviewResults || null);
    setResponses(Array.isArray(state?.responses) ? state.responses : []);
    setLoadError('');
  }, [state]);

  const loadFeedback = async (targetSessionId) => {
    if (!targetSessionId || !token) {
      return;
    }

    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/interview/feedback/${targetSessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (activeRequestRef.current !== requestId) {
        return;
      }

      const payload = response.data || {};
      const parsedEvaluation = normalizeEvaluation(payload.evaluation);
      const transcript = Array.isArray(payload.transcript) ? payload.transcript : [];

      setEvaluation((prev) => parsedEvaluation || prev || null);
      setResponses((prev) => (transcript.length > 0 ? transcript : prev));
      setInterviewResults((prev) => ({
        sessionId: payload.sessionId || prev?.sessionId || targetSessionId,
        category: prev?.category || payload.domain || 'Interview',
        difficulty: prev?.difficulty || payload.difficulty || 'N/A',
        duration: prev?.duration || payload.duration || 'N/A',
        score: Number.isFinite(Number(prev?.score)) ? prev.score : payload.score ?? 0,
        questionsAsked: prev?.questionsAsked ?? payload.metrics?.questionCount ?? null,
        correctAnswers: prev?.correctAnswers ?? null,
      }));
    } catch (error) {
      if (activeRequestRef.current !== requestId) {
        return;
      }
      console.error('Failed to load interview feedback:', error);
      setLoadError('Unable to load feedback for this session.');
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  const regenerateFeedback = async () => {
    if (!sessionId || !token) {
      return;
    }

    setIsRegenerating(true);
    setRegenerateError('');
    try {
      const response = await axios.post(
        `http://localhost:5000/api/interview/feedback/${sessionId}/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const evaluationPayload = normalizeEvaluation(response.data?.evaluation);
      setEvaluation(evaluationPayload || null);
      await loadFeedback(sessionId);
    } catch (error) {
      console.error('Failed to regenerate feedback:', error);
      setRegenerateError('Unable to regenerate feedback right now. Please try again later.');
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    if (!sessionId || !token) {
      return;
    }

    loadFeedback(sessionId);
  }, [sessionId, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadRecent = async () => {
      setIsRecentLoading(true);
      setRecentError('');
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const items = Array.isArray(response.data?.recentInterviews)
          ? response.data.recentInterviews
          : [];
        setRecentSessions(items);
      } catch (error) {
        console.error('Failed to load recent interviews:', error);
        setRecentError('Unable to load recent interviews.');
      } finally {
        setIsRecentLoading(false);
      }
    };

    loadRecent();
  }, [token]);

  const score = Number.isFinite(Number(interviewResults?.score))
    ? Number(interviewResults.score)
    : Number.isFinite(Number(evaluation?.overallScore))
    ? Number(evaluation.overallScore)
    : 0;

  const categoryLabel = interviewResults?.category || interviewResults?.domain || 'Interview';
  const durationLabel = interviewResults?.duration
    ? String(interviewResults.duration).replace(/\s*min\s*$/i, '')
    : 'N/A';
  const durationDisplay = durationLabel === 'N/A' ? durationLabel : `${durationLabel} min`;

  const strengths = Array.isArray(evaluation?.strengths) ? evaluation.strengths : [];
  const improvements = Array.isArray(evaluation?.weaknesses) ? evaluation.weaknesses : [];
  const detailedFeedback = Array.isArray(evaluation?.detailedFeedback) ? evaluation.detailedFeedback : [];

  const fallbackFeedback = responses.map((item) => ({
    question: item.question,
    userAnswer: item.answer,
    idealAnswer: '',
    feedback: '',
  }));

  const feedbackItems = detailedFeedback.length > 0 ? detailedFeedback : fallbackFeedback;

  if (!interviewResults && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <AlertTriangle size={20} />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Feedback not available</h1>
          <p className="mt-2 text-sm text-slate-400">
            We could not load your interview feedback. Please return to your dashboard.
          </p>
          {loadError && (
            <p className="mt-3 text-xs text-amber-200">{loadError}</p>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 transition"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Interview Feedback</p>
              <h1 className="text-xl font-semibold text-slate-100">MockMate AI Review</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80">
              {categoryLabel} • {interviewResults?.difficulty || 'N/A'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80">
              Duration: {durationDisplay}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
              Score: {score}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Performance Summary</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-100">Overall Interview Review</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-emerald-200 text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  {score}/100
                </div>
              </div>
              {isLoading && (
                <p className="mt-4 text-sm text-slate-400">Loading feedback...</p>
              )}
              {loadError && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  {loadError}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={regenerateFeedback}
                  disabled={isRegenerating || !sessionId}
                  className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate feedback'}
                </button>
                {regenerateError && (
                  <span className="text-xs text-amber-200">{regenerateError}</span>
                )}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Questions</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{interviewResults.questionsAsked}</p>
                </div>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated Correct</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{interviewResults.correctAnswers}</p>
                </div>
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interview Style</p>
                  <p className="mt-2 text-sm text-slate-200">Structured, real-time feedback</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
                <Sparkles size={16} className="text-teal-300" />
                Question-by-Question Feedback
              </div>
              <div className="mt-4 space-y-4">
                {feedbackItems.length === 0 && !isLoading && (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-400">
                    No feedback items available for this session yet. Use regenerate to rebuild ideal answers.
                  </div>
                )}
                {feedbackItems.map((item, index) => (
                  <div key={`${item.question}-${index}`} className="rounded-xl border border-slate-800/70 bg-slate-950/70 p-4 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                      <p className="mt-2 text-sm text-slate-100">{item.question}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Your answer</p>
                        <p className="mt-2 text-slate-200">{item.userAnswer || 'Not provided.'}</p>
                      </div>
                      <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Ideal answer</p>
                        <p className="mt-2 text-slate-100">{item.idealAnswer || 'Not available.'}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Improvement notes</p>
                      <p className="mt-2 text-slate-100">{item.feedback || 'No additional feedback provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Strengths</p>
              {strengths.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {strengths.map((item, index) => (
                    <li key={index} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No strengths captured yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Improvements</p>
              {improvements.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {improvements.map((item, index) => (
                    <li key={index} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No improvement notes captured yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Previous feedback</p>
                  <p className="mt-2 text-sm text-slate-300">Open any past interview review.</p>
                </div>
                <span className="rounded-full border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-400">
                  {recentSessions.length}
                </span>
              </div>
              {isRecentLoading && (
                <p className="mt-4 text-sm text-slate-400">Loading recent interviews...</p>
              )}
              {recentError && (
                <p className="mt-4 text-sm text-amber-200">{recentError}</p>
              )}
              {!isRecentLoading && !recentError && recentSessions.length === 0 && (
                <p className="mt-4 text-sm text-slate-400">No past interviews yet.</p>
              )}
              <div className="mt-4 space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {recentSessions.map((item) => {
                  const isActive = item.sessionId === sessionId;
                  return (
                    <button
                      key={item.sessionId}
                      onClick={() =>
                        navigate('/interview/feedback', {
                          state: {
                            sessionId: item.sessionId,
                            interviewResults: {
                              sessionId: item.sessionId,
                              category: item.domain || 'Interview',
                              difficulty: item.difficulty || 'N/A',
                              duration: item.duration || 'N/A',
                              score: item.score ?? 0,
                              questionsAsked: item.questionsAsked ?? null,
                              correctAnswers: null,
                            },
                          },
                        })
                      }
                      className={`w-full text-left rounded-xl border px-3 py-3 text-sm transition ${
                        isActive
                          ? 'border-teal-500/40 bg-teal-500/10 text-teal-100'
                          : 'border-slate-800/70 bg-slate-950/60 text-slate-200 hover:bg-slate-900/70'
                      }`}
                      aria-current={isActive ? 'true' : 'false'}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {item.domain} • {item.difficulty}
                        </span>
                        <span className={`text-xs ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>{item.duration || 'N/A'}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-600" />
                          <span>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</span>
                        </div>
                        <span className={`text-xs ${isActive ? 'text-teal-200' : 'text-slate-500'}`}>
                          {isActive ? 'Current' : 'Open'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next Steps</p>
              <p className="mt-3 text-sm text-slate-300">
                Review the ideal answers, then rehearse your response out loud. Use the improvements list to target your next mock interview.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/interview')}
                  className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:brightness-110 transition"
                >
                  Start another interview
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
