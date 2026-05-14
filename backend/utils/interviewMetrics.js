const countWords = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const buildInterviewMetrics = (responses) => {
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
