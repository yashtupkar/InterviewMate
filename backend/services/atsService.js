const { OpenAI } = require('openai');

// Initialize OpenRouter client
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY, // fallback if OPENROUTER_API_KEY is not set
});

/**
 * Compares the resume content against the job description using OpenRouter LLMs.
 * Returns deeply nested structured JSON feedback for a comprehensive ATS report.
 */
const scoreResumeWithAI = async (resumeText, jobDescription) => {
    try {
        const prompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) software. 
Evaluate the provided resume against the given job description meticulously.

Analyze the resume and provide your response STRICTLY in the following JSON format. Do NOT wrap the response in markdown code blocks (\`\`\`json). Just return the raw JSON object. Ensure all numbers are integers between 0-100. For 'status' inside issues, strictly use either 'success', 'warning', or 'error'.

{
  "score": <number 0-100 overall score>,
  "categories": {
    "Content": {
      "score": <number 0-100>,
      "issues": [
         { "title": "Grammar & Spelling", "description": "<feedback string>", "status": "success|warning|error" },
         { "title": "Action Verbs", "description": "<feedback string>", "status": "success|warning|error" },
         { "title": "Parse Rate", "description": "<feedback string estimating readability by ATS>", "status": "success|warning|error" }
      ]
    },
    "Sections": {
      "score": <number 0-100>,
      "issues": [
         { "title": "Work Experience", "description": "<feedback>", "status": "success|warning|error" },
         { "title": "Education", "description": "<feedback>", "status": "success|warning|error" },
         { "title": "Projects / Skills", "description": "<feedback>", "status": "success|warning|error" }
      ]
    },
    "ATSEssentials": {
      "score": <number 0-100>,
      "issues": [
         { "title": "Contact Information", "description": "<feedback, check email, phone, location, linkedin>", "status": "success|warning|error" },
         { "title": "File Format & Size", "description": "The file was uploaded successfully as a PDF.", "status": "success" },
         { "title": "Design & Readability", "description": "<feedback on structure/layout limits>", "status": "success|warning|error" }
      ]
    },
    "Tailoring": {
      "score": <number 0-100>,
      "issues": [
         { "title": "Hard Skills Match", "description": "<List critical missing vs matched technical/hard skills>", "status": "success|warning|error" },
         { "title": "Soft Skills Match", "description": "<List soft skills context>", "status": "success|warning|error" },
         { "title": "Job Title Alignment", "description": "<Does their title match or relate to the JD>", "status": "success|warning|error" }
      ]
    }
  }
}

Job Description:
"""
${jobDescription}
"""

Resume Content:
"""
${resumeText}
"""`;

        const response = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash", // Excellent for fast structured JSON outputs
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }, 
            max_tokens: 3000 // Prevent truncation on large JSON structures
        });

        let content = response.choices[0].message.content;
        
        // Sometimes LLMs ignore the prompt and wrap JSON in markdown anyway
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(content);
    } catch (error) {
        console.error("Error in ATS Scoring AI Service:", error);
        throw new Error("Failed to analyze resume with AI");
    }
};

module.exports = {
    scoreResumeWithAI
};
