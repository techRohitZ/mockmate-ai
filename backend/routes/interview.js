import express from 'express';
import Groq from 'groq-sdk';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import { getUserIdFromRequest } from '../utils/auth.js';
import { buildInterviewMetrics } from '../utils/interviewMetrics.js';
import { interviewSessions, interviewArtifacts } from '../store/sessionStore.js';
import { getCompanyBank, getCompanyBankSummaries } from '../services/companyBankService.js';
import { buildCompanyBankPrompt, getDomainPrompt } from '../prompts/interviewPrompts.js';

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

router.get('/interview/company-banks', (req, res) => {
  try {
    const companies = getCompanyBankSummaries();
    res.json({ companies });
  } catch (error) {
    console.error('❌ Company banks endpoint error:', error);
    res.status(500).json({ error: 'Failed to load company question banks.' });
  }
});

router.get('/interview/company-bank/:company', (req, res) => {
  try {
    const bank = getCompanyBank(req.params.company);

    if (!bank) {
      return res.status(404).json({ error: 'Company bank not found.' });
    }

    res.json({
      company: { id: bank.id, name: bank.name },
      questions: bank.questions,
    });
  } catch (error) {
    console.error('❌ Company bank detail error:', error);
    res.status(500).json({ error: 'Failed to load company question bank.' });
  }
});

router.post('/interview', async (req, res) => {
  try {
    const { userMessage, sessionId, domain, difficulty, company } = req.body;

    console.log(`[Interview] Received: domain=${domain}, difficulty=${difficulty}, sessionId=${sessionId}`);

    if (!userMessage || userMessage.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const groq = getGroqClient();
    if (!groq) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const sid = sessionId || 'default';
    const userId = getUserIdFromRequest(req);
    const companyBank = getCompanyBank(company);
    const effectiveDomain = companyBank?.interviewCategory || domain || 'frontend';
    const effectiveDifficulty = companyBank?.interviewDifficulty || difficulty || 'Junior (1-3 yrs)';

    if (!interviewSessions[sid]) {
      console.log(`[Interview] Starting new session: ${sid}`);
      interviewSessions[sid] = [
        {
          role: 'system',
          content: getDomainPrompt(effectiveDomain, effectiveDifficulty),
        },
      ];

      interviewArtifacts[sid] = {
        userId: userId || null,
        domain: effectiveDomain,
        difficulty: effectiveDifficulty,
        responses: [],
        evaluation: null,
        companyKey: companyBank?.id || null,
        companyBankState: companyBank ? { index: 0, stage: 'primary' } : null,
      };
    }

    const conversationHistory = interviewSessions[sid];
    conversationHistory.push({ role: 'user', content: userMessage });

    try {
      console.log(`[Interview] Calling Groq API with ${GROQ_MODEL}...`);
      const promptMessages = [...conversationHistory];
      let bankQuestion = null;
      let followUp = null;

      if (companyBank?.questions?.length) {
        if (!interviewArtifacts[sid]) {
          interviewArtifacts[sid] = {
            userId: userId || null,
            domain: effectiveDomain,
            difficulty: effectiveDifficulty,
            responses: [],
            evaluation: null,
            companyKey: companyBank.id,
            companyBankState: { index: 0, stage: 'primary' },
          };
        }

        if (interviewArtifacts[sid].companyKey !== companyBank.id) {
          interviewArtifacts[sid].companyKey = companyBank.id;
          interviewArtifacts[sid].companyBankState = { index: 0, stage: 'primary' };
        }

        const bankState = interviewArtifacts[sid].companyBankState || { index: 0, stage: 'primary' };
        bankQuestion = companyBank.questions[bankState.index % companyBank.questions.length];
        followUp = Array.isArray(bankQuestion.followUps) ? bankQuestion.followUps[0] : null;
        const stage = followUp ? bankState.stage : 'primary';
        promptMessages.push({
          role: 'system',
          content: buildCompanyBankPrompt({ bank: companyBank, question: bankQuestion, followUp, stage }),
        });
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: promptMessages,
        model: GROQ_MODEL,
        max_tokens: 200,
        temperature: 0.8,
      });

      const aiResponse =
        chatCompletion.choices[0]?.message?.content ||
        "I didn't catch that clearly. Could you please repeat your answer?";
      console.log(`[Interview] ✓ Got response from Groq`);

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
      interviewArtifacts[sid].domain = effectiveDomain || interviewArtifacts[sid].domain;
      interviewArtifacts[sid].difficulty = effectiveDifficulty || interviewArtifacts[sid].difficulty;

      const latestQuestion = [...conversationHistory]
        .slice(0, -1)
        .reverse()
        .find((message) => message.role === 'assistant')?.content;

      interviewArtifacts[sid].responses.push({
        question: latestQuestion || 'Interview question',
        answer: userMessage,
        aiEvaluation: aiResponse,
      });

      if (companyBank && bankQuestion) {
        const state = interviewArtifacts[sid].companyBankState || { index: 0, stage: 'primary' };
        const hasFollowUp = Boolean(followUp);

        if (hasFollowUp && state.stage === 'primary') {
          state.stage = 'followUp';
        } else {
          state.stage = 'primary';
          state.index = (state.index + 1) % companyBank.questions.length;
        }

        interviewArtifacts[sid].companyBankState = state;
      }

      if (conversationHistory.length > 50) {
        interviewSessions[sid] = [conversationHistory[0], ...conversationHistory.slice(-49)];
      }

      res.json({ reply: aiResponse, sessionId: sid });
    } catch (groqError) {
      console.error('❌ Groq API error:', {
        message: groqError.message,
        status: groqError.status,
        error: groqError.error?.error?.message,
      });

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

router.post('/interview/evaluate', async (req, res) => {
  try {
    const { sessionId, domain, difficulty, responses } = req.body;

    if (!responses || responses.length === 0) {
      return res.status(400).json({ error: 'No interview data provided for evaluation.' });
    }

    console.log(`[Evaluation] Generating report for session: ${sessionId}`);

    const formattedTranscript = responses
      .map((r, i) => `Q${i + 1}: ${r.question}\nCandidate Answer: ${r.answer}`)
      .join('\n\n');

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

    const groq = getGroqClient();
    if (!groq) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error. API key missing.' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: evaluationPrompt }],
      model: GROQ_MODEL,
      temperature: 0.2,
    });

    let evaluationText = chatCompletion.choices[0]?.message?.content || '{}';
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

router.post('/interview/complete', async (req, res) => {
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

router.post('/interview/end', (req, res) => {
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

export default router;
