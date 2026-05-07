import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Interview from './models/Interview.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import { TOP_100_PROBLEMS } from './data/top100Problems.js';

dotenv.config();

const STARTUP_TIME = new Date().toISOString();
console.log(`[${STARTUP_TIME}] Server starting...`);

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate-ai';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Continue without database for development
  }
};

connectDB();

console.log('Auth routes loading...');
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
console.log('Auth routes loaded successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: process.env.PORT || 5000 });
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');
    return decoded.id;
  } catch (error) {
    return null;
  }
};

const countWords = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const buildInterviewMetrics = (responses) => {
  const safeResponses = Array.isArray(responses) ? responses : [];
  const candidateWordCount = safeResponses.reduce((sum, item) => sum + countWords(item?.answer), 0);
  const aiWordCount = safeResponses.reduce((sum, item) => sum + countWords(item?.question), 0);
  const questionCount = safeResponses.length;
  const estimatedTalkTimeSec = Math.round((candidateWordCount / 130) * 60);
  const estimatedAvgResponseSec = questionCount ? Math.round(estimatedTalkTimeSec / questionCount) : 0;

  return {
    candidateWordCount,
    aiWordCount,
    estimatedTalkTimeSec,
    estimatedAvgResponseSec,
    questionCount,
  };
};

const buildQuestionBankPrompt = ({ domain, difficulty, count }) => {
  return `You are creating a focused interview question bank.

Generate ${count} distinct technical interview questions for domain "${domain}" at "${difficulty}" difficulty.

Return ONLY valid JSON with this exact schema:
{
  "domain": "${domain}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "<short-id>",
      "title": "<question title>",
      "question": "<full interview question>",
      "tags": ["<tag1>", "<tag2>", "<tag3>"],
      "expectedSignals": ["<signal 1>", "<signal 2>"],
      "followUps": ["<follow-up 1>", "<follow-up 2>"]
    }
  ]
}

Rules:
- No markdown or code fences.
- Questions must be practical and interview-relevant.
- Avoid duplicates.
- Keep expectedSignals concise.`;
};

// Store conversation history per session
const interviewSessions = {};
const interviewArtifacts = {};
const practiceSessions = {};

// Domain-specific system prompts
const getDomainPrompt = (domain, difficulty) => {
  const basePrompt = `You are a professional senior technical interviewer with 10+ years of experience conducting interviews at top tech companies. Your job is to assess the candidate's knowledge, problem-solving approach, and communication skills through thoughtful questions. You are warm, encouraging, and professional - not intimidating.

IMPORTANT RULES:
- Ask ONE question at a time
- Listen actively and acknowledge good answers with phrases like "That's a great point" or "Exactly right"
- For weaker answers, gently redirect: "Let me clarify... what about..." or "That's a start, but consider..."
- Ask follow-up questions that dig deeper into their understanding
- Make it a natural conversation, not an interrogation
- DO NOT ask them to write code or pseudocode - this is purely theoretical
- Evaluate their answers on: understanding, real-world application, critical thinking
- Keep responses concise (2-3 sentences) unless they ask for more detail
- Never provide a full answer or full explanation
- Avoid teaching or solving; provide only short acknowledgment and a follow-up question
- Always end with a follow-up question that moves the interview forward`;

  const difficultyMap = {
    'Fresher (0-1 yrs)': 'junior',
    'Junior (1-3 yrs)': 'mid',
    'Mid-level (3-5 yrs)': 'senior',
    'Senior (5+ yrs)': 'principal',
  };

  const mappedDifficulty = difficultyMap[difficulty] || 'mid';

  const difficultyGuidelines = {
    junior: `Ask foundational questions about core concepts. Start easy and gradually increase difficulty. Accept answers that show basic understanding. Look for: Do they know the fundamentals? Can they explain simply?`,
    mid: `Ask practical, real-world questions. Expect solid understanding of concepts. Ask about trade-offs and when to use different approaches. Look for: Have they applied this in real projects? Do they understand the "why"?`,
    senior: `Ask advanced architectural and design questions. Expect them to think critically. Ask about scalability, performance, edge cases. Look for: Can they make informed design decisions? Do they understand system-level thinking?`,
    principal: `Ask deep, nuanced questions about complex systems. Challenge their thinking. Discuss trade-offs, optimizations, and future-proofing. Look for: Can they architect at scale? Do they understand all the implications?`,
  };

  const domainSpecific = {
    frontend: `You're interviewing for Frontend Developer role. Core topics: HTML/CSS fundamentals, JavaScript (ES6+), React/Vue basics, state management, component lifecycle, performance optimization, accessibility, browser APIs, debugging. ${difficultyGuidelines[mappedDifficulty]}`,
    backend: `You're interviewing for Backend Developer role. Core topics: REST APIs, HTTP, databases (SQL/NoSQL), authentication/authorization, caching strategies, scalability, microservices, message queues, security best practices. ${difficultyGuidelines[mappedDifficulty]}`,
    dbms: `You're interviewing for Database Engineer role. Core topics: SQL queries, database design, indexing, query optimization, transactions and ACID, normalization, scaling, backup/recovery strategies. ${difficultyGuidelines[mappedDifficulty]}`,
    "core cs": `You're interviewing for Software Engineer role. Core topics: Data structures, algorithms, complexity analysis (Big O), design patterns, operating systems, concurrency, problem-solving approach. ${difficultyGuidelines[mappedDifficulty]}`,
  };

  return basePrompt + "\n\n" + (domainSpecific[domain.toLowerCase()] || domainSpecific.frontend);
};

const buildPracticePrompt = ({ topic, difficulty, language }) => {
  return `You are a senior software engineer creating a realistic coding interview question. Generate ONE ${difficulty} problem about ${topic} in ${language}.

Return ONLY valid JSON (no markdown, no extra text, no code fences). The JSON must follow this schema:
{
  "title": "<short problem title>",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "statement": "<6-10 sentences describing the problem>",
  "constraints": ["<constraint 1>", "<constraint 2>", "<constraint 3>", "<constraint 4>"],
  "examples": [
    { "input": "<example input>", "output": "<example output>", "explanation": "<why that output>" }
  ],
  "starterCode": "function or code with proper JSON escaping (use \\n for newlines, avoid backticks, escape quotes)",
  "tags": ["<tag 1>", "<tag 2>", "<tag 3>"],
  "timeLimitMinutes": <number between 20 and 45>
}

Rules:
- Provide 2-3 examples with realistic inputs and outputs.
- Use realistic constraints (n up to 1e5 or similar).
- starterCode: Write as a JSON string. Use \\n for newlines, \\t for tabs, escape all quotes as \\".
- NEVER use backticks or triple quotes in starterCode. Plain function syntax only.
- Return ONLY the JSON object, no additional text.
`;
};

const buildPracticeReviewPrompt = ({ problem, language, code }) => {
  const constraintsText = Array.isArray(problem.constraints) ? problem.constraints.join('\n') : '';
  const examplesText = Array.isArray(problem.examples)
    ? problem.examples
        .map(
          (example, index) =>
            `Example ${index + 1}: Input: ${example.input} | Output: ${example.output} | Explanation: ${example.explanation}`
        )
        .join('\n')
    : '';
  const tagsText = Array.isArray(problem.tags) ? problem.tags.join(', ') : '';

  return `You are a senior engineer reviewing a candidate's solution. Analyze correctness, clarity, complexity, and edge cases. Do NOT execute the code. Be precise and concise.

Return ONLY valid JSON (no markdown, no backticks, no extra text) in this schema:
{
  "score": <number 0-100>,
  "verdict": "pass" | "needs work" | "fail",
  "summary": "<1-2 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "complexity": { "time": "<Big-O>", "space": "<Big-O>" },
  "edgeCases": ["<edge case 1>", "<edge case 2>"],
  "nextSteps": ["<next step 1>", "<next step 2>"]
}

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Topic: ${problem.topic}
Tags: ${tagsText}
Statement: ${problem.statement}
Constraints:\n${constraintsText}
Examples:\n${examplesText}

Candidate Language: ${language}
Candidate Code:\n${code}
`;
};

// ==========================================
// ENHANCED PROFESSIONAL CODE REVIEW PROMPT
// ==========================================
const buildEnhancedReviewPrompt = ({ problem, language, code }) => {
  const constraintsText = Array.isArray(problem.constraints) ? problem.constraints.join('\n') : '';
  const examplesText = Array.isArray(problem.examples)
    ? problem.examples
        .map(
          (example, index) =>
            `Example ${index + 1}: Input: ${example.input} | Output: ${example.output} | Explanation: ${example.explanation}`
        )
        .join('\n')
    : '';
  const tagsText = Array.isArray(problem.tags) ? problem.tags.join(', ') : '';

  return `You are a SENIOR software engineer conducting a professional code review for a technical interview. Be thorough, constructive, and precise. Analyze the solution as if the candidate were interviewing at a top tech company.

ANALYSIS FRAMEWORK:
1. Correctness: Does the solution solve the problem correctly?
2. Code Quality: Readability, naming conventions, code structure
3. Time & Space Complexity: Detailed Big-O analysis with explanation
4. Best Practices: Language idioms, design patterns, optimizations
5. Edge Cases: Handling of boundary conditions
6. Communication: How well is the approach explained?

Return ONLY valid JSON (no markdown, no backticks, no extra text) using this exact schema:
{
  "score": <number 0-100>,
  "verdict": "excellent" | "good" | "acceptable" | "needs improvement" | "fail",
  "summary": "<2-3 sentence professional summary of solution quality>",
  "correctness": {
    "isCorrect": true | false,
    "analysis": "<detailed analysis of logic correctness>"
  },
  "strengths": [
    "<specific strength 1 with concrete detail>",
    "<specific strength 2 with concrete detail>",
    "<specific strength 3 with concrete detail>"
  ],
  "improvements": [
    "<specific actionable improvement 1>",
    "<specific actionable improvement 2>",
    "<specific actionable improvement 3>"
  ],
  "complexity": {
    "time": "<Big-O notation>",
    "timeExplanation": "<clear explanation of how you arrived at this>",
    "space": "<Big-O notation>",
    "spaceExplanation": "<clear explanation of space usage>",
    "isOptimal": "<true|false: is this the optimal approach?>",
    "alternativeApproach": "<suggest a better approach if not optimal>"
  },
  "codeQuality": {
    "readability": "excellent|good|fair|poor",
    "readabilityNotes": "<notes on variable naming and structure>",
    "structure": "<assessment of code organization and functions>"
  },
  "patterns": [
    "<design pattern or technique used>",
    "<design pattern or technique used>"
  ],
  "edgeCases": [
    "<edge case: description and how it's handled>",
    "<edge case: description and how it's handled>"
  ],
  "commonMistakes": [
    "<mistakes avoided>",
    "<common pitfalls in this problem type>"
  ],
  "nextSteps": [
    "<specific next step to improve skills>",
    "<recommended practice focus area>"
  ],
  "interviewTips": [
    "<tip for discussing this in a real interview>",
    "<communication strategy>"
  ]
}

PROBLEM CONTEXT:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Topic: ${problem.topic}
Tags: ${tagsText}
Statement: ${problem.statement}
Constraints:\n${constraintsText}
Examples:\n${examplesText}

CANDIDATE SUBMISSION:
Language: ${language}
Code:\n${code}

Provide a thorough, professional review that would help this candidate improve their technical interviewing skills.
`;
};

// ==========================================
// 1. MAIN INTERVIEW CHAT ENDPOINT
// ==========================================
app.post('/api/interview', async (req, res) => {
  try {
    const { userMessage, sessionId, domain, difficulty } = req.body;

    console.log(`[Interview] Received: domain=${domain}, difficulty=${difficulty}, sessionId=${sessionId}`);

    if (!userMessage || userMessage.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    // Use sessionId to maintain conversation history per session
    const sid = sessionId || 'default';
    const userId = getUserIdFromRequest(req);

    // Initialize session if it doesn't exist
    if (!interviewSessions[sid]) {
      console.log(`[Interview] Starting new session: ${sid}`);
      interviewSessions[sid] = [
        {
          role: 'system',
          content: getDomainPrompt(domain || 'frontend', difficulty || 'Junior (1-3 yrs)'),
        },
      ];

      interviewArtifacts[sid] = {
        userId: userId || null,
        domain: domain || 'frontend',
        difficulty: difficulty || 'Junior (1-3 yrs)',
        responses: [],
        evaluation: null,
      };
    }

    const conversationHistory = interviewSessions[sid];
    conversationHistory.push({ role: 'user', content: userMessage });

    try {
      console.log(`[Interview] Calling Groq API with ${GROQ_MODEL}...`);
      const chatCompletion = await groq.chat.completions.create({
        messages: conversationHistory,
        model: GROQ_MODEL,
        max_tokens: 300,
        temperature: 0.8,
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || "I didn't catch that clearly. Could you please repeat your answer?";
      console.log(`[Interview] ✓ Got response from Groq`);

      // Add AI response to conversation history
      conversationHistory.push({ role: 'assistant', content: aiResponse });

      if (!interviewArtifacts[sid]) {
        interviewArtifacts[sid] = {
          userId: userId || null,
          domain: domain || 'frontend',
          difficulty: difficulty || 'Junior (1-3 yrs)',
          responses: [],
          evaluation: null,
        };
      }

      interviewArtifacts[sid].userId = userId || interviewArtifacts[sid].userId;
      interviewArtifacts[sid].domain = domain || interviewArtifacts[sid].domain;
      interviewArtifacts[sid].difficulty = difficulty || interviewArtifacts[sid].difficulty;

      const latestQuestion = [...conversationHistory]
        .slice(0, -1)
        .reverse()
        .find((message) => message.role === 'assistant')?.content;

      interviewArtifacts[sid].responses.push({
        question: latestQuestion || 'Interview question',
        answer: userMessage,
        aiEvaluation: aiResponse,
      });

      // Clean up old sessions (keep last 50 messages to avoid token bloat)
      if (conversationHistory.length > 50) {
        interviewSessions[sid] = [conversationHistory[0], ...conversationHistory.slice(-49)];
      }

      res.json({ reply: aiResponse, sessionId: sid });
    } catch (groqError) {
      console.error('❌ Groq API error:', {
        message: groqError.message,
        status: groqError.status,
        error: groqError.error?.error?.message
      });
      
      // Provide detailed error message
      if (groqError.status === 401) {
        res.status(500).json({ error: 'API authentication failed. Check your API key.' });
      } else if (groqError.status === 429) {
        res.status(500).json({ error: 'API rate limit exceeded. Please wait a moment.' });
      } else if (groqError.message?.includes('ECONNREFUSED')) {
        res.status(500).json({ error: 'Cannot reach API server. Check your internet.' });
      } else {
        res.status(500).json({ error: 'Failed to process response. Please try again.' });
      }
    }
  } catch (error) {
    console.error('❌ Interview endpoint error:', error.message);
    res.status(500).json({ error: 'Unexpected error. Please try again.' });
  }
});

// ==========================================
// 2. FINAL INTERVIEW EVALUATION ENDPOINT
// ==========================================
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { sessionId, domain, difficulty, responses } = req.body;

    if (!responses || responses.length === 0) {
      return res.status(400).json({ error: 'No interview data provided for evaluation.' });
    }

    console.log(`[Evaluation] Generating report for session: ${sessionId}`);

    // Format the transcript for the AI to read easily
    const formattedTranscript = responses.map((r, i) => 
      `Q${i + 1}: ${r.question}\nCandidate Answer: ${r.answer}`
    ).join('\n\n');

    const evaluationPrompt = `You are an expert technical lead evaluating a candidate's performance in a ${difficulty} level ${domain} interview. 
    
Review the following Q&A transcript. You MUST respond with ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json. Do not include any intro or outro text.

The JSON object must strictly follow this structure:
{
  "overallScore": <a number between 0 and 100 representing their total performance>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>"],
  "detailedFeedback": [
    {
      "question": "<copy the question asked>",
      "userAnswer": "<summarize the user's answer>",
      "idealAnswer": "<what a perfect, concise answer would have been>",
      "feedback": "<brief feedback on what they missed or did well>"
    }
  ]
}

TRANSCRIPT TO EVALUATE:
${formattedTranscript}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: evaluationPrompt }],
      model: GROQ_MODEL, 
      temperature: 0.2, 
    });

    let evaluationText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Clean up potential markdown wrapper from the AI response
    evaluationText = evaluationText.replace(/```json/g, '').replace(/```/g, '').trim();

    const evaluationJSON = JSON.parse(evaluationText);

    if (sessionId) {
      if (!interviewArtifacts[sessionId]) {
        interviewArtifacts[sessionId] = {
          userId: null,
          domain: domain || 'frontend',
          difficulty: difficulty || 'Junior (1-3 yrs)',
          responses: [],
          evaluation: null,
        };
      }

      interviewArtifacts[sessionId].domain = domain || interviewArtifacts[sessionId].domain;
      interviewArtifacts[sessionId].difficulty = difficulty || interviewArtifacts[sessionId].difficulty;
      interviewArtifacts[sessionId].responses = responses;
      interviewArtifacts[sessionId].evaluation = evaluationJSON;
    }
    
    console.log(`[Evaluation] ✓ Successfully generated report for ${sessionId}`);
    
    res.json(evaluationJSON);

  } catch (error) {
    console.error('❌ Evaluation endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate interview evaluation.' });
  }
});

// ==========================================
// 2.1 PRACTICE PROBLEM GENERATION ENDPOINT
// ==========================================
app.post('/api/practice/problem', async (req, res) => {
  try {
    const { topic, difficulty, language, sessionId } = req.body;

    if (!topic || !difficulty || !language) {
      return res.status(400).json({ error: 'Missing topic, difficulty, or language.' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const prompt = buildPracticePrompt({ topic, difficulty, language });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      max_tokens: 900,
      temperature: 0.7,
    });

    let problemText = chatCompletion.choices[0]?.message?.content || '{}';
    // Remove markdown code blocks and clean up
    problemText = problemText
      .replace(/^```[a-z]*\n?/gm, '')
      .replace(/```$/gm, '')
      .replace(/^\s*`+/gm, '')
      .replace(/`+\s*$/gm, '')
      .trim();

    // Try to extract JSON if it's wrapped in text
    const jsonMatch = problemText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      problemText = jsonMatch[0];
    }

    let problemJSON;
    try {
      problemJSON = JSON.parse(problemText);
    } catch (error) {
      console.error('❌ Practice problem JSON parse error:', error.message);
      return res.status(500).json({ error: 'Failed to parse AI problem response.' });
    }

    const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
    const problemId = problemJSON.id || `problem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const normalizedProblem = {
      id: problemId,
      title: String(problemJSON.title || 'Untitled Problem'),
      difficulty: String(problemJSON.difficulty || difficulty),
      topic: String(problemJSON.topic || topic),
      statement: String(problemJSON.statement || ''),
      constraints: toArray(problemJSON.constraints),
      examples: toArray(problemJSON.examples).map((example) => ({
        input: String(example?.input || ''),
        output: String(example?.output || ''),
        explanation: String(example?.explanation || ''),
      })),
      starterCode: String(problemJSON.starterCode || ''),
      tags: toArray(problemJSON.tags),
      timeLimitMinutes: Number(problemJSON.timeLimitMinutes) || 30,
    };

    if (sessionId) {
      if (!practiceSessions[sessionId]) {
        practiceSessions[sessionId] = {};
      }
      practiceSessions[sessionId][problemId] = normalizedProblem;
    }

    res.json({ problemId, problem: normalizedProblem });
  } catch (error) {
    console.error('❌ Practice problem endpoint error:', error.message);
    res.status(500).json({ error: 'Failed to generate practice problem.' });
  }
});

// ==========================================
// 2.2 PRACTICE SUBMISSION REVIEW ENDPOINT
// ==========================================
app.post('/api/practice/submit', async (req, res) => {
  try {
    const { sessionId, problemId, problem, language, code, problemSource } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: 'Missing language or code.' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const storedProblem = sessionId && problemId ? practiceSessions[sessionId]?.[problemId] : null;
    const resolvedProblem = problem || storedProblem;

    if (!resolvedProblem) {
      return res.status(400).json({ error: 'Problem context missing for submission.' });
    }

    // Use enhanced review prompt for professional feedback
    const reviewPrompt = buildEnhancedReviewPrompt({
      problem: resolvedProblem,
      language,
      code,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: reviewPrompt }],
      model: GROQ_MODEL,
      max_tokens: 2000,
      temperature: 0.3,
    });

    let reviewText = chatCompletion.choices[0]?.message?.content || '{}';
    // Remove markdown code blocks and clean up
    reviewText = reviewText
      .replace(/```[a-z]*\n?/gm, '')
      .replace(/```/gm, '')
      .replace(/^\s*`+/gm, '')
      .replace(/`+\s*$/gm, '')
      .trim();

    // Try to extract JSON if it's wrapped in text
    const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      reviewText = jsonMatch[0];
    }

    let reviewJSON;
    try {
      reviewJSON = JSON.parse(reviewText);
    } catch (error) {
      console.error('❌ Practice review JSON parse error:', error.message);
      return res.status(500).json({ error: 'Failed to parse AI review response.' });
    }

    res.json({ evaluation: reviewJSON, problemId: resolvedProblem.id || problemId || null });
  } catch (error) {
    console.error('❌ Practice submission error:', error.message);
    res.status(500).json({ error: 'Failed to review submission.' });
  }
});

// ==========================================
// 2.3 PRACTICE CURATED PROBLEMS ENDPOINT
// ==========================================
app.get('/api/practice/problems', async (req, res) => {
  try {
    const difficulty = String(req.query.difficulty || '').trim();
    const topic = String(req.query.topic || '').trim();

    let filtered = TOP_100_PROBLEMS;

    if (difficulty) {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }

    if (topic) {
      filtered = filtered.filter((p) => p.topic === topic);
    }

    const problems = filtered.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      tags: p.tags,
      timeLimitMinutes: p.timeLimitMinutes,
    }));

    const stats = {
      total: TOP_100_PROBLEMS.length,
      easy: TOP_100_PROBLEMS.filter((p) => p.difficulty === 'Easy').length,
      medium: TOP_100_PROBLEMS.filter((p) => p.difficulty === 'Medium').length,
      hard: TOP_100_PROBLEMS.filter((p) => p.difficulty === 'Hard').length,
      filtered: problems.length,
    };

    res.json({ problems, stats });
  } catch (error) {
    console.error('❌ Practice problems endpoint error:', error);
    res.status(500).json({ error: 'Failed to load problem list.' });
  }
});

// ==========================================
// 2.4 GET CURATED PROBLEM BY ID
// ==========================================
app.get('/api/practice/problem/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;

    const problem = TOP_100_PROBLEMS.find((p) => p.id === problemId);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    res.json({ problem });
  } catch (error) {
    console.error('❌ Practice problem detail endpoint error:', error);
    res.status(500).json({ error: 'Failed to load problem.' });
  }
});

// ==========================================
// 2.5 SAVE INTERVIEW RESULTS
// ==========================================
app.post('/api/interview/complete', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const { domain, difficulty, score, duration, sessionId, responses } = req.body;
    const normalizedScore = Number(score);

    if (!domain || !difficulty || !duration || Number.isNaN(normalizedScore)) {
      return res.status(400).json({ error: 'Missing or invalid interview data.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const artifact = sessionId ? interviewArtifacts[sessionId] : null;
    const transcript = Array.isArray(responses) && responses.length > 0
      ? responses
      : Array.isArray(artifact?.responses)
      ? artifact.responses
      : [];

    const metrics = buildInterviewMetrics(transcript);

    const interviewPayload = {
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      domain,
      difficulty,
      duration,
      finalScore: normalizedScore,
      transcript,
      evaluation: artifact?.evaluation || null,
      metrics,
    };

    try {
      await Interview.create(interviewPayload);
    } catch (error) {
      if (error?.code === 11000) {
        return res.json({ success: true, user, deduped: true });
      }
      throw error;
    }

    const previousTotal = user.totalInterviews || 0;
    const previousAverage = user.averageScore || 0;
    const nextTotal = previousTotal + 1;
    const nextAverage = (previousAverage * previousTotal + normalizedScore) / nextTotal;

    user.totalInterviews = nextTotal;
    user.averageScore = Math.round(nextAverage * 10) / 10;

    await user.save();

    const recentInterviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('sessionId domain difficulty duration finalScore createdAt');

    const userResponse = {
      ...user.toObject(),
      interviews: recentInterviews.map((item) => ({
        sessionId: item.sessionId,
        domain: item.domain,
        difficulty: item.difficulty,
        duration: item.duration,
        score: item.finalScore,
        date: item.createdAt,
      })),
    };

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('❌ Interview completion error:', error);
    res.status(500).json({ error: 'Failed to save interview results.' });
  }
});

// ==========================================
// 3. CLEAR SESSION ENDPOINT
// ==========================================
app.post('/api/interview/end', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && interviewSessions[sessionId]) {
    delete interviewSessions[sessionId];
    console.log(`[Session] Ended and cleared session: ${sessionId}`);
  }
  if (sessionId && interviewArtifacts[sessionId]) {
    delete interviewArtifacts[sessionId];
  }
  res.json({ success: true, message: 'Interview session ended' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ==========================================
// 2.6 DASHBOARD ANALYTICS ENDPOINT
// ==========================================
app.get('/api/dashboard/analytics', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 }).limit(100);

    const totalInterviews = interviews.length;
    const totalMinutes = interviews.reduce((sum, item) => {
      const match = String(item.duration || '').match(/\d+/);
      return sum + (match ? Number(match[0]) : 0);
    }, 0);

    const averageScore = totalInterviews
      ? Math.round(
          (interviews.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / totalInterviews) * 10
        ) / 10
      : 0;

    const scoreByDomain = interviews.reduce((acc, item) => {
      const key = item.domain || 'unknown';
      if (!acc[key]) {
        acc[key] = { totalScore: 0, count: 0 };
      }
      acc[key].totalScore += Number(item.finalScore || 0);
      acc[key].count += 1;
      return acc;
    }, {});

    const topicCoverage = Object.entries(scoreByDomain).map(([domain, value]) => ({
      domain,
      averageScore: Math.round((value.totalScore / value.count) * 10) / 10,
      attempts: value.count,
    }));

    const weakAreas = topicCoverage
      .filter((item) => item.averageScore < 70)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3);

    const communicationStats = interviews.reduce(
      (acc, item) => {
        acc.totalTalkingTimeSec += Number(item.metrics?.estimatedTalkTimeSec || 0);
        acc.totalResponseSec += Number(item.metrics?.estimatedAvgResponseSec || 0);
        acc.totalQuestionCount += Number(item.metrics?.questionCount || 0);
        return acc;
      },
      { totalTalkingTimeSec: 0, totalResponseSec: 0, totalQuestionCount: 0 }
    );

    const avgResponseTimeSec = totalInterviews
      ? Math.round((communicationStats.totalResponseSec / totalInterviews) * 10) / 10
      : 0;

    const recentInterviews = interviews.slice(0, 8).map((item) => ({
      sessionId: item.sessionId,
      domain: item.domain,
      difficulty: item.difficulty,
      duration: item.duration,
      score: item.finalScore,
      date: item.createdAt,
    }));

    res.json({
      totalInterviews,
      averageScore,
      totalMinutes,
      communicationStats: {
        totalTalkingTimeSec: communicationStats.totalTalkingTimeSec,
        avgResponseTimeSec,
        totalQuestionCount: communicationStats.totalQuestionCount,
      },
      topicCoverage,
      weakAreas,
      recentInterviews,
    });
  } catch (error) {
    console.error('❌ Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to load dashboard analytics.' });
  }
});

// ==========================================
// 2.7 DYNAMIC QUESTION BANK ENDPOINT
// ==========================================
app.get('/api/dashboard/question-bank', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const domain = String(req.query.domain || 'frontend');
    const difficulty = String(req.query.difficulty || 'Junior (1-3 yrs)');
    const countRaw = Number(req.query.count || 10);
    const count = Number.isFinite(countRaw) ? Math.min(20, Math.max(3, countRaw)) : 10;

    const prompt = buildQuestionBankPrompt({ domain, difficulty, count });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      max_tokens: 1600,
      temperature: 0.7,
    });

    let payload = chatCompletion.choices[0]?.message?.content || '{}';
    payload = payload.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch (error) {
      console.error('❌ Question bank parse error:', error.message);
      return res.status(500).json({ error: 'Failed to parse generated question bank.' });
    }

    const questions = Array.isArray(parsed.questions)
      ? parsed.questions.map((item, idx) => ({
          id: String(item?.id || `q_${idx + 1}`),
          title: String(item?.title || `Question ${idx + 1}`),
          question: String(item?.question || ''),
          tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
          expectedSignals: Array.isArray(item?.expectedSignals) ? item.expectedSignals.map(String) : [],
          followUps: Array.isArray(item?.followUps) ? item.followUps.map(String) : [],
        }))
      : [];

    res.json({
      domain,
      difficulty,
      generatedAt: new Date().toISOString(),
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('❌ Question bank endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate question bank.' });
  }
});