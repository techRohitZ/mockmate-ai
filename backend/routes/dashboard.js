import express from 'express';
import Groq from 'groq-sdk';
import Interview from '../models/Interview.js';
import { getUserIdFromRequest } from '../utils/auth.js';
import { buildQuestionBankPrompt } from '../prompts/interviewPrompts.js';

const router = express.Router();
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
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

router.get('/dashboard/analytics', async (req, res) => {
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

router.get('/dashboard/question-bank', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const groq = getGroqClient();
    if (!groq) {
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

export default router;
