import express from 'express';
import Groq from 'groq-sdk';
import { TOP_100_PROBLEMS } from '../data/top100Problems.js';
import { practiceSessions } from '../store/sessionStore.js';
import { buildEnhancedReviewPrompt, buildPracticePrompt } from '../prompts/practicePrompts.js';

const router = express.Router();
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
let groqClient = null;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groqClient;
};

router.post('/practice/problem', async (req, res) => {
  try {
    const { topic, difficulty, language, sessionId } = req.body;

    if (!topic || !difficulty || !language) {
      return res.status(400).json({ error: 'Missing topic, difficulty, or language.' });
    }

    const groq = getGroqClient();
    if (!groq) {
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

    problemText = problemText
      .replace(/^```[a-z]*\n?/gm, '')
      .replace(/^```/gm, '')
      .replace(/\n```$/gm, '')
      .replace(/```$/gm, '')
      .trim();

    let startIdx = problemText.indexOf('{');
    let endIdx = problemText.lastIndexOf('}');

    if (startIdx === -1 || endIdx === -1) {
      console.error('❌ No JSON object found in response:', problemText.substring(0, 300));
      return res.status(500).json({ error: 'AI response does not contain valid JSON.' });
    }

    problemText = problemText.substring(startIdx, endIdx + 1);
    problemText = problemText.replace(/([^\\])\n/g, '$1\\n');
    problemText = problemText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    let problemJSON;
    try {
      problemJSON = JSON.parse(problemText);
    } catch (parseError) {
      console.error('❌ JSON parse failed:', parseError.message);
      console.error('❌ Problem text sample:', problemText.substring(0, 500));
      return res.status(500).json({ error: `JSON parse error: ${parseError.message}` });
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

router.post('/practice/submit', async (req, res) => {
  try {
    const { sessionId, problemId, problem, language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: 'Missing language or code.' });
    }

    const groq = getGroqClient();
    if (!groq) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const storedProblem = sessionId && problemId ? practiceSessions[sessionId]?.[problemId] : null;
    const resolvedProblem = problem || storedProblem;

    if (!resolvedProblem) {
      return res.status(400).json({ error: 'Problem context missing for submission.' });
    }

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
    reviewText = reviewText
      .replace(/```[a-z]*\n?/gm, '')
      .replace(/```/gm, '')
      .replace(/^\s*`+/gm, '')
      .replace(/`+\s*$/gm, '')
      .trim();

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

router.get('/practice/problems', async (req, res) => {
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

router.get('/practice/problem/:problemId', async (req, res) => {
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

export default router;
