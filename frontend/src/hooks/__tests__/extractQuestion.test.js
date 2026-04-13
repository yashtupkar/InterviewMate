
/**
 * Test script for extractQuestionFromText logic in useCustomInterview hook.
 * Run with: node extractQuestion.test.js
 */

const cleanTaskText = (text = "") =>
  text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\[\/?CODE_QUESTION\]/gi, "")
    .replace(/\r/g, "")
    .trim();

const extractQuestionFromText = (sourceText = "") => {
  const cleaned = cleanTaskText(sourceText);
  if (!cleaned) return "";

  const metadataKeywords = [
    "language",
    "time\\s*limit",
    "time\\s*allotted",
    "duration",
    "constraints?",
    "examples?",
    "inputs?",
    "outputs?",
    "notes?",
    "hints?",
    "you\\s+have\\s+\\d+",
  ];
  const metadataRegex = new RegExp(
    `(?:\\n|\\s)\\s*(?:${metadataKeywords.join("|")})[:\\s]?`,
    "i",
  );

  const questionPatterns = [
    // Explicit markers: "Question: ...", "Task: ...", "[CODE_QUESTION] ..."
    /(?:question|task|challenge|problem)[:\s]+([\s\S]*?)(?=(?:\n|\s)\s*(?:language|time\s*limit|constraints?|example|input|output|note|hint)\b|$)/i,
    // Introductory phrases: "Here is your first coding question: ..."
    /(?:here is|here's)(?: your)?(?: first)?(?: coding)?(?: question|task|challenge)[:.\s]+([\s\S]*?)(?=(?:\n|\s)\s*(?:language|time\s*limit|constraints?|example|input|output|note|hint)\b|$)/i,
    // Action verbs: "Write a function that...", "Create a script to..."
    /((?:make|write|implement|create|develop|construct)\s+(?:an?|the)?\s*function\s+(?:for|to|that)\s+[\s\S]*?)(?=(?:\n|\s)\s*(?:language|time\s*limit|constraints?|example|input|output|note|hint)\b|$)/i,
    // Catch-all phrase: "I'd like you to [action]..."
    /((?:i'd like you to|please|could you)\s+(?:make|write|implement|create|develop|construct)\s+[\s\S]*?)(?=(?:\n|\s)\s*(?:language|time\s*limit|constraints?|example|input|output|note|hint)\b|$)/i,
  ];

  for (const pattern of questionPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      let extracted = match[1].trim();
      // Clean up leading "is: " or "to: " if present
      extracted = extracted.replace(/^(?:is|to)[:\s]*/i, "").trim();

      if (extracted.length > 12) {
        // If we find metadata keywords within the extracted text (because the lookahead might have been too specific), trim it further.
        const keywordIndex = extracted.search(metadataRegex);
        if (keywordIndex !== -1) {
          extracted = extracted.substring(0, keywordIndex).trim();
        }
        if (extracted.length > 12) return extracted;
      }
    }
  }

  // Fallback: search for the first sentence that looks like an instruction
  const sentences = cleaned.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  const instructionVerbs = ["write", "create", "implement", "make", "design", "develop", "find", "calculate"];
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (instructionVerbs.some(verb => lower.includes(verb)) && !lower.includes("language") && !lower.includes("time limit")) {
      return sentence;
    }
  }

  // Ultimate fallback: first 3 sentences but more robustly
  const sentenceMatches = cleaned.match(/[^.!?\n]+[.!?]?/g) || [];
  let fallbackText = "";
  let count = 0;
  for (const s of sentenceMatches) {
    const trimmed = s.trim();
    if (trimmed.length < 5) continue;
    if (metadataRegex.test(trimmed)) break;
    fallbackText += (fallbackText ? " " : "") + trimmed;
    count++;
    if (count >= 3) break;
  }

  return fallbackText.trim();
};

const testCases = [
  {
    name: "Standard structure",
    input: "Here is your first coding question: Write a function that reverses a string.\nLanguage: Javascript\nTime limit: 5 minutes",
    expected: "Write a function that reverses a string."
  },
  {
    name: "No newline before keywords",
    input: "The task is: Write a function to find the maximum number in an array. Language: Javascript. Time limit: 10 mins",
    expected: "Write a function to find the maximum number in an array."
  },
  {
    name: "Varied intro phrase",
    input: "I'd like you to implement a function that checks if a word is a palindrome. It should be efficient.\nLanguage: Python",
    expected: "implement a function that checks if a word is a palindrome. It should be efficient."
  },
  {
    name: "Complex question with examples",
    input: "Question: Create a function to merge two sorted arrays.\nExample: [1,2] and [3,4] -> [1,2,3,4]\nLanguage: JS",
    expected: "Create a function to merge two sorted arrays."
  },
  {
    name: "No explicit intro, just action",
    input: "Write a function that calculates the factorial of a number. This is for a math library. Language: JS",
    expected: "Write a function that calculates the factorial of a number. This is for a math library."
  },
  {
    name: "Mixed with conversation",
    input: "Sure, let's start. Please write a function to reverse a linked list. Make sure it's in-place. Language: C++",
    expected: "write a function to reverse a linked list. Make sure it's in-place."
  },
  {
    name: "LLM conversational input",
    input: "Okay, here is your coding question. Write a JavaScript function to check if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters which reads the same backward as forward. You have 5 minutes.",
    expected: "Write a JavaScript function to check if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters which reads the same backward as forward."
  }
];

let failed = 0;
testCases.forEach((tc, i) => {
  const result = extractQuestionFromText(tc.input);
  const passed = result === tc.expected;
  if (!passed) {
    failed++;
    console.error("Test " + (i + 1) + " FAILED: " + tc.name);
    console.error("Result: \"" + result + "\"");
    console.error("Expected: \"" + tc.expected + "\"");
    console.error('---');
  } else {
    console.log("Test " + (i + 1) + " PASSED: " + tc.name);
  }
});

if (failed === 0) {
  console.log("\nAll tests passed successfully!");
} else {
  console.error("\n" + failed + " tests failed.");
  process.exit(1);
}
