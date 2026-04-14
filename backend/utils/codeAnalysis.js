/**
 * Utility functions for detecting and validating code submissions in the backend
 * Mirroring the logic from the frontend for consistency.
 */

const DEFAULT_CODE_TEMPLATES = {
  javascript: `// Write your solution here
function solution() {
  
}

// You can run your code to see the output below.
`,
  python: `# Write your solution here
def solution():
    pass
`,
  java: `import java.util.*;

class Solution {
    // Write your solution here
    public static void main(String[] args) {
        
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

// Write your solution here
void solution() {
    
}

int main() {
    solution();
    return 0;
}
`,
  c: `#include <stdio.h>

// Write your solution here
int solution(int x) {
    return x;
}

int main() {
    return 0;
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style></style>
</head>
<body>
  <div class="card">
    <h1>Hello, World! 👋</h1>
    <p>Edit this HTML to see live changes in the preview panel.</p>
    <button onclick="alert('It works!')">Click Me</button>
  </div>
</body>
</html>
`,
  css: `/* CSS Challenge – style the page below */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #0f0f12;
  color: #fff;
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: #bef264;
  margin-bottom: 1rem;
}

p {
  color: #888;
  font-size: 1rem;
  line-height: 1.6;
}

.badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  background: #bef264;
  color: #000;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
}
`,
};

/**
 * Check if submitted code is effectively empty (only whitespace or comments)
 */
const isCodeEmpty = (code = "") => {
  if (!code || typeof code !== "string") return true;

  // Remove all whitespace and comments
  let cleanCode = code.trim();

  // Remove line comments
  cleanCode = cleanCode.replace(/\/\/.*$/gm, "");
  cleanCode = cleanCode.replace(/#.*$/gm, "");

  // Remove block comments
  cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, "");
  cleanCode = cleanCode.replace(/"""[\s\S]*?"""/g, "");
  cleanCode = cleanCode.replace(/'''[\s\S]*?'''/g, "");

  // Remove all whitespace again
  cleanCode = cleanCode.trim();

  // If nothing left, it's empty
  return !cleanCode;
};

/**
 * Check if code is effectively default (only the starter template with no real additions)
 */
const isCodeDefault = (code = "", language = "javascript") => {
  const template = DEFAULT_CODE_TEMPLATES[language.toLowerCase()] || "";

  if (!template) {
    return isCodeEmpty(code);
  }

  // Normalize both strings (remove extra whitespace, comments)
  const normalizeForComparison = (str) => {
    return str
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("#"))
      .join("\n")
      .trim();
  };

  const normalizedCode = normalizeForComparison(code);
  const normalizedTemplate = normalizeForComparison(template);

  return normalizedCode === normalizedTemplate || isCodeEmpty(code);
};

/**
 * Analyze code submission and return structured signals
 */
const analyzeCodeSubmission = (messageContent) => {
  // Regex to match: I've submitted my solution in (language):\n\n(code)
  const codeSubmissionRegex =
    /I've submitted my solution in ([\w+#]+):\s*([\s\S]*)/i;
  const match = messageContent.match(codeSubmissionRegex);

  if (!match) {
    return { isCodeSubmission: false };
  }

  const language = match[1].toLowerCase();
  const code = match[2].trim();

  const isEmpty = isCodeEmpty(code);
  const isDefault = isCodeDefault(code, language);

  return {
    isCodeSubmission: true,
    language,
    isEmpty,
    isDefault,
    isValid: !isEmpty && !isDefault,
  };
};

module.exports = {
  analyzeCodeSubmission,
  isCodeEmpty,
  isCodeDefault,
};
