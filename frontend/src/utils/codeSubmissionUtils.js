/**
 * Utility functions for detecting and validating code submissions
 */

// Default/empty code templates for each language
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
 * @param {string} code - The code to check
 * @param {string} language - The programming language
 * @returns {boolean} - True if code appears to be empty/default
 */
export const isCodeEmpty = (code = "", language = "javascript") => {
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
  if (!cleanCode) return true;

  return false;
};

/**
 * Check if code is effectively default (only the starter template with no real additions)
 * @param {string} code - The code to check
 * @param {string} language - The programming language
 * @param {string} starterCode - The starter code template (optional)
 * @returns {boolean} - True if code hasn't been meaningfully modified
 */
export const isCodeDefault = (
  code = "",
  language = "javascript",
  starterCode = null,
) => {
  // Use provided starter code or fall back to default
  const template = starterCode || DEFAULT_CODE_TEMPLATES[language] || "";

  if (!template) {
    // If no template available, just check if it's empty
    return isCodeEmpty(code, language);
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

  // If the code (after removing comments and whitespace) is similar to template, consider it default
  return normalizedCode === normalizedTemplate || isCodeEmpty(code, language);
};

/**
 * Analyze code submission and return status
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language
 * @param {string} starterCode - The starter code template (optional)
 * @returns {object} - Object with analysis results
 */
export const analyzeCodeSubmission = (
  code = "",
  language = "javascript",
  starterCode = null,
) => {
  const isEmpty = isCodeEmpty(code, language);
  const isDefault = isCodeDefault(code, language, starterCode);

  return {
    isEmpty,
    isDefault,
    isValidSubmission: !isEmpty && !isDefault,
    message: isEmpty
      ? "Code appears to be empty. Please add your solution."
      : isDefault
        ? "Code appears to be the default template. Please implement your solution."
        : "Code submission looks good!",
  };
};
