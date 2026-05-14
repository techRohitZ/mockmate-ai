export const buildPracticePrompt = ({ topic, difficulty, language }) => {
  return `You are a senior software engineer. Generate ONE ${difficulty} coding problem about ${topic}.

Return ONLY valid JSON. No markdown, backticks, or text outside the JSON.
JSON must be valid - all strings escaped properly.

Format example:
{"title":"Problem","difficulty":"${difficulty}","topic":"${topic}","statement":"Description.","constraints":["constraint 1"],"examples":[{"input":"in","output":"out","explanation":"why"}],"starterCode":"function test(x){return x;}","tags":["tag1"],"timeLimitMinutes":30}

Rules:
1. Return ONLY the JSON object - nothing before or after
2. NO markdown code fences or backticks anywhere
3. In starterCode use \\n for actual newlines, \\t for tabs
4. Escape all quotes in strings as \\\" 
5. statement: 5-8 sentence clear problem description
6. examples: provide 2-3 examples minimum
7. Use realistic constraints like "1 <= n <= 10^5"
`;
};

export const buildPracticeReviewPrompt = ({ problem, language, code }) => {
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

export const buildEnhancedReviewPrompt = ({ problem, language, code }) => {
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
