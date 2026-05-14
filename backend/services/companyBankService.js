import { COMPANY_QUESTION_BANKS } from '../data/companyQuestionBanks.js';

export const normalizeCompanyKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const getCompanyBank = (companyValue) => {
  const key = normalizeCompanyKey(companyValue);
  if (!key) {
    return null;
  }
  return COMPANY_QUESTION_BANKS[key] || null;
};

export const getCompanyBankSummaries = () =>
  Object.values(COMPANY_QUESTION_BANKS).map((bank) => ({
    id: bank.id,
    name: bank.name,
    tag: bank.tag,
    questionCount: bank.questions.length,
    difficulty: bank.difficulty,
    duration: bank.duration,
    focus: bank.focus,
    topics: bank.topics,
    interviewCategory: bank.interviewCategory,
    interviewDifficulty: bank.interviewDifficulty,
    sampleQuestions: bank.questions.slice(0, 3).map((item) => item.question),
  }));
