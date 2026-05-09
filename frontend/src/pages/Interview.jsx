import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Send, Users, Volume2, VolumeX } from 'lucide-react';
import ConfigModal from './ConfigModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Interview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') || 'frontend';
  const difficulty = searchParams.get('difficulty') || 'Junior (1-3 yrs)';
  const duration = parseInt(searchParams.get('duration')) || 5;

  const [showConfig, setShowConfig] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random()}`);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [introAsked, setIntroAsked] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);

  // Interview state
  const [transcript, setTranscript] = useState('');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { token, refreshUser } = useAuth();
  const endInterviewRef = useRef(false);
  const interviewSessionRef = useRef({
    questionsAsked: 0,
    correctAnswers: 0,
    startTime: null,
    responses: [],
  });

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      setSpeechUnsupported(true);
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setUserInput((prev) => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!interviewStarted || isEnding) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStarted, isEnding]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (speechUnsupported) {
      return;
    }
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
    const fullText = (userInput + transcript).trim();
    if (!fullText || isLoading || isEnding) return;

    const lastAiQuestion = [...messages].reverse().find((msg) => msg.type === 'ai')?.text || '';

    // Add user message to chat
    setMessages((prev) => [...prev, { type: 'user', text: fullText }]);
    setUserInput('');
    setTranscript('');

    // Send to backend
    setIsLoading(true);
    setAiSpeaking(true);
    try {
      const response = await axios.post('http://localhost:5000/api/interview', {
        userMessage: fullText,
        sessionId: sessionId,
        domain: category,
        difficulty: difficulty,
      });

      const aiReply = response.data.reply;

      // Add AI message to chat
      setMessages((prev) => [...prev, { type: 'ai', text: aiReply }]);

      // Track responses
      interviewSessionRef.current.responses.push({
        question: lastAiQuestion,
        answer: fullText,
        aiEvaluation: aiReply,
      });

      // Speak the response if not muted
      if (endInterviewRef.current) {
        setAiSpeaking(false);
      } else if (!isMuted) {
        speakText(aiReply);
      } else {
        setAiSpeaking(false);
      }

      // Increment question counter
      interviewSessionRef.current.questionsAsked += 1;
      setQuestionsAsked(interviewSessionRef.current.questionsAsked);
      setIntroAsked(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: 'Sorry, there was an error processing your response. Please try again.' },
      ]);
      setAiSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (endInterviewRef.current) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.includes('en'));
    if (enVoice) utterance.voice = enVoice;
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setAiSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const initializeInterview = () => {
    setInterviewStarted(true);
    interviewSessionRef.current.startTime = new Date();

    // Send initial greeting asking for intro
    const greeting = `Hi there! I'm your AI interviewer for this ${difficulty.split(' ')[0]} level ${category} interview. Before we dive into technical questions, could you please introduce yourself? Tell me about your background, current role, and what you hope to gain from this practice interview. Just speak naturally or type your response!`;
    setMessages([{ type: 'ai', text: greeting }]);
    setAiSpeaking(true);

    if (!isMuted) {
      speakText(greeting);
    }
  };

  const endInterview = async () => {
    if (endInterviewRef.current) {
      return;
    }

    endInterviewRef.current = true;
    setIsEnding(true);
    stopListening();
    window.speechSynthesis?.cancel();
    setAiSpeaking(false);
    const endTime = new Date();
    const durationMinutes = Math.floor(
      (endTime - interviewSessionRef.current.startTime) / 1000 / 60
    );
    const durationValue = Math.max(1, durationMinutes);

    const responses = interviewSessionRef.current.responses;
    let overallScore = 0;

    if (responses.length > 0) {
      try {
        const evaluationResponse = await axios.post('http://localhost:5000/api/interview/evaluate', {
          sessionId,
          domain: category,
          difficulty,
          responses,
        });

        const scoreValue = Number(evaluationResponse.data?.overallScore);
        overallScore = Number.isFinite(scoreValue) ? Math.round(scoreValue) : 0;
      } catch (error) {
        console.error('Error evaluating interview:', error);
      }
    }

    const questionsTotal = responses.length || interviewSessionRef.current.questionsAsked || 0;
    const estimatedCorrect = questionsTotal
      ? Math.round((overallScore / 100) * questionsTotal)
      : 0;

    if (token) {
      try {
        await axios.post(
          'http://localhost:5000/api/interview/complete',
          {
            sessionId,
            domain: category,
            difficulty,
            score: overallScore,
            duration: `${durationValue} min`,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await refreshUser();
      } catch (error) {
        console.error('Error saving interview results:', error);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/interview/end', { sessionId });
    } catch (error) {
      console.error('Error ending interview session:', error);
    }

    // Calculate score (mock calculation)
    const score = Math.min(100, overallScore || 0);

    // Navigate to results
    navigate('/dashboard', {
      state: {
        interviewResults: {
          category,
          difficulty,
          duration: durationValue,
          score,
          questionsAsked: questionsTotal,
          correctAnswers: estimatedCorrect,
          responses,
        },
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((duration * 60 - timeLeft) / (duration * 60)) * 100))
  );

  if (!interviewStarted) {
    return (
      <ConfigModal
        isOpen={true}
        onClose={() => navigate('/dashboard')}
        onStart={() => initializeInterview()}
        defaultCategory={category}
        defaultDifficulty={difficulty}
        defaultDuration={duration}
      />
    );
  }

  return (
    <div className="h-screen bg-[#0b1220] text-white flex flex-col relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
            >
              <span aria-hidden="true">←</span>
              Back to Dashboard
            </button>
            <span className="text-xs text-slate-500">Interview Session</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="font-bold text-lg">AI</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-teal-300 font-semibold">Mock Interview Room</p>
                <p className="text-lg font-semibold capitalize text-slate-100">
                  {category} Engineer • {difficulty}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80">Secure session</span>
              <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
                <Users size={14} /> 2 participants
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                Connected
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Questions</p>
                <p className="text-xl font-semibold text-slate-100">{questionsAsked}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Time Remaining</p>
                <p className={`text-xl font-semibold ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">{progressPct}%</span>
          </div>

          {speechUnsupported && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Voice input is not supported in this browser. You can continue the interview using text responses.
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 px-6 py-6">
        <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 max-w-7xl mx-auto overflow-hidden">
          <section className="min-h-0 flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                className={`relative rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden min-h-[280px] ${
                  aiSpeaking ? 'ring-2 ring-teal-400/50' : 'ring-1 ring-slate-800/60'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-slate-900/10 to-cyan-500/10" />
                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className={`h-2 w-2 rounded-full ${aiSpeaking ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
                      AI Interviewer
                    </div>
                    <span className="text-slate-400">Host</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/30 transition-transform ${
                        aiSpeaking ? 'scale-105' : 'scale-100'
                      }`}
                    >
                      AI
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{aiSpeaking ? 'Speaking now' : 'Ready to listen'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        aiSpeaking ? 'bg-teal-500/20 text-teal-200' : 'bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      {aiSpeaking ? 'Speaking' : 'Idle'}
                    </span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                        isMuted
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                      title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
                    >
                      {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`relative rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden min-h-[280px] ${
                  isListening ? 'ring-2 ring-teal-400/50' : 'ring-1 ring-slate-800/60'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-teal-500/5 to-cyan-500/10" />
                <div className="relative z-10 h-full flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
                      You
                    </div>
                    <span className="text-slate-400">Candidate</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-xl font-semibold text-slate-200">
                      YOU
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{isListening ? 'Listening...' : 'Ready to respond'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        isListening ? 'bg-teal-500/20 text-teal-200' : 'bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      {isListening ? 'Mic on' : 'Mic idle'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full ${
                        isCameraOn ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      {isCameraOn ? 'Camera on' : 'Camera off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Live Interview Guide</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Answer clearly, explain trade-offs, and ask clarifying questions when needed.
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Session progress: <span className="text-slate-100 font-semibold">{progressPct}%</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLoading ? 'bg-amber-400 animate-pulse' : aiSpeaking ? 'bg-teal-400 animate-pulse' : 'bg-teal-400'
                  }`}
                />
                <span>
                  {isLoading
                    ? 'AI is evaluating your response'
                    : aiSpeaking
                    ? 'AI is speaking'
                    : 'AI is ready for your response'}
                </span>
              </div>
            </div>
          </section>

          <aside className="min-h-0 flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800/70">
              <p className="text-sm font-semibold text-slate-100">Chat</p>
              <p className="text-xs text-slate-400 mt-1">Respond in chat or use the mic controls below.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-center">
                  <p className="text-sm">Interview started. Waiting for your response.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.type === 'user'
                          ? 'bg-teal-500/20 border border-teal-500/30 text-teal-100 rounded-br-none'
                          : 'bg-slate-900/70 border border-slate-800 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/70 border border-slate-800 rounded-bl-none">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-800/70 bg-slate-950/80 p-4 space-y-3">
              <div className="text-xs text-slate-400">Your response</div>
              <div className="relative">
                <input
                  type="text"
                  value={userInput + transcript}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? 'Listening... speak now...' : 'Type your answer or clarification...'}
                  className={`w-full px-4 py-3 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm ${
                    isListening ? 'border-teal-500/50 focus:border-teal-400 ring-2 ring-teal-500/10' : 'border-slate-800 focus:border-teal-400'
                  }`}
                />
                {isListening && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={sendMessage}
                  disabled={!(userInput.trim() || transcript.trim()) || isLoading || isEnding}
                  className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-teal-500/50 text-white"
                >
                  <Send size={16} />
                  Send Answer
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            Session live • {formatTime(timeLeft)} remaining
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || speechUnsupported}
              className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all flex items-center gap-2 ${
                isListening
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Mute mic' : 'Unmute mic'}
            </button>

            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all flex items-center gap-2 ${
                isCameraOn
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
              }`}
              title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {isCameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
              {isCameraOn ? 'Camera on' : 'Camera off'}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
              title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isMuted ? 'AI muted' : 'AI audio'}
            </button>

            <button
              onClick={endInterview}
              disabled={isEnding}
              className="px-5 py-2.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-200 font-semibold flex items-center gap-2 hover:bg-rose-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
              title="Leave interview"
            >
              <PhoneOff size={16} />
              {isEnding ? 'Saving...' : 'Leave'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
