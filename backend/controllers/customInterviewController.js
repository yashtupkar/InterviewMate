const { OpenAI } = require("openai");
const pdfParse = require("pdf-parse");
const InterviewSession = require("../models/interviewSessionModel");
const {
  AnalyzeFullTranscript,
} = require("../services/InterviewResponseAnalyzer");
const CreditService = require("../services/creditService");
const { SERVICE_CREDITS } = require("../config/pricingConfig");

// Initialize OpenAI client for OpenRouter (LLM)
const getOpenAIClient = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is missing. AI Chat will not work.");
    return null;
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
};

// Initialize OpenAI client for TTS (Mouth)
const getTTSClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const openai = getOpenAIClient();

const parseResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF file is required." });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = (pdfData?.text || "").trim();

    if (!resumeText) {
      return res.status(400).json({
        message: "No text could be extracted from the uploaded PDF.",
      });
    }

    return res.status(200).json({
      resumeText,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Custom Interview Resume Parse Error:", error);
    return res.status(400).json({
      message:
        "Failed to parse resume PDF. Please upload a valid text-based PDF.",
    });
  }
};

/**
 * Start a Custom AI Interview Session
 * Generates the dynamic system prompt and saves initial session metadata
 */
const startCustomSession = async (req, res) => {
  try {
    const {
      interviewType,
      role,
      level,
      content,
      agentName,
      userName,
      duration,
    } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ── Credit Deduction Upfront ──
    const deduction = await CreditService.deduct(userId, "mock_interview");
    if (!deduction.success) {
      return res.status(402).json({
        message: `Insufficient credits to start an interview. ${SERVICE_CREDITS.mock_interview} credits required.`,
        needed: SERVICE_CREDITS.mock_interview,
        available: deduction.available,
      });
    }

    // 1. Create a new session in DB
    const session = new InterviewSession({
      userId,
      interviewType,
      metadata: {
        uploadedInfo: content,
        role,
        level,
        duration: duration || 10,
        agentName: agentName || "Sophia",
        userName: userName || "Candidate",
      },
    });

    await session.save();

    const interviewerName = agentName || "Sophia";

    // 2. Dynamic System Prompt Generation (Core Logic)
    let typeSpecificInstructions = "";
    if (interviewType === "behavioral") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: BEHAVIORAL
      - Focus on soft skills, past experiences, and behavioral scenarios.
      - Use the STAR (Situation, Task, Action, Result) method.
      - DO NOT ask core technical or coding questions.
      `;
    } else if (interviewType === "technical") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: TECHNICAL
      - Focus on core technical skills, concepts, and problem-solving.
      - You HAVE the ability to give coding questions.
      - MANDATORY: You MUST ask at least ONE coding question during the interview.
      - STRATEGY: Mix 1-2 coding questions randomly between verbal technical questions. Do not save them all for the end.
      - CRITICAL: When giving a coding question, use natural language. Mention the question clearly, specify the programming language, and state a REASONABLE time limit based on complexity (e.g., 3-10 minutes).
      - DO NOT use JSON formats or code blocks like [CODE_QUESTION].
      - EXAMPLE: "Here is your coding question. Make a function for reversing an array in JavaScript language. You have a time limit of 3 minutes. Let's start solving coding question, let me know when it's done."
      - Supported languages: javascript, html, python, java, cpp.
      - After a coding question, wait for the user to click "Attempt" or for them to let you know they are done.
      `;
    } else if (interviewType === "hr") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: HR (Human Resources)
      - Focus on cultural fit, career goals, work-life balance, and organizational alignment.
      - Ask about their long-term aspirations and why they want to join this specific company or role.
      `;
    } else {
      typeSpecificInstructions = `INTERVIEW TYPE: GENERAL - A balanced mix of technical and soft skills.`;
    }

    const systemPrompt = `
      You are ${interviewerName}, an expert and friendly AI interviewer. You are conducting a ${level} level ${interviewType} interview for the role of ${role}.
      
      Candidate Name: ${userName || "Candidate"}
      Candidate Context/Resume:
      ${content}

      ${typeSpecificInstructions}
      
      Operating Rules:
      1. CRITICAL: Your FIRST message MUST be a warm welcome and an invitation for the candidate to introduce themselves. DO NOT ask technical or behavioral questions in the first message.
      2. Ask ONE concise question at a time.
      3. Listen and follow up naturally before switching topics.
      4. Total interview length: 5-8 questions.
      5. To finish, say: "The interview is now concluded. Goodbye!"
      6. CLEAN OUTPUT: DO NOT use markdown symbols like asterisks (**), backticks (\`), or hashes (#). The text will be read aloud by TTS, and symbols like "asterisk" ruin the experience. Speak in plain, natural sentences.
      
      Tone: Professional, conversational, and encouraging.
    `;

    res.status(200).json({
      sessionId: session._id,
      systemPrompt,
      duration: duration || 10,
      isCustom: true,
    });
  } catch (error) {
    console.error("Start Custom Session Error:", error);
    res.status(500).json({ message: "Failed to start custom session" });
  }
};

// TTS removed to favor browser-native speech synthesis

/**
 * Handle Custom AI Interview Logic
 */
const customInterviewController = {
  // 1. Get Chat Response from OpenRouter
  getChatResponse: async (req, res) => {
    try {
      const { sessionId, messages, systemPrompt } = req.body;

      if (!openai) {
        return res
          .status(500)
          .json({ message: "OpenRouter API Key not configured" });
      }

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-lite-001", // Highly optimized for low-latency
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
      });

      const aiMessage = response.choices[0].message.content;
      res.status(200).json({ text: aiMessage });
    } catch (error) {
      console.error("OpenRouter Error:", error);
      res.status(500).json({ message: "AI response failed" });
    }
  },

  // 2. Save Transcript Only
  saveTranscriptOnly: async (req, res) => {
    try {
      const { sessionId, transcript, actualDuration } = req.body;
      const userId = req.user?._id || req.body.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!sessionId || !Array.isArray(transcript)) {
        return res
          .status(400)
          .json({ message: "Session ID and transcript array are required" });
      }

      const session = await InterviewSession.findOne({
        _id: sessionId,
        userId,
      });
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const formattedTranscript = transcript
        .filter((message) => message && message.text)
        .map((message) => {
          const speaker =
            message.speaker || (message.isAgent ? "Interviewer" : "Candidate");
          return `${speaker}: ${message.text}`;
        })
        .join("\n");

      session.transcript = formattedTranscript;
      session.actualDuration = actualDuration || 0;
      session.status = "analysis_pending";
      await session.save();

      res.status(200).json({ message: "Transcript saved successfully" });
    } catch (error) {
      console.error("Error saving transcript:", error);
      res.status(500).json({ message: "Error saving transcript" });
    }
  },
};

module.exports = {
  ...customInterviewController,
  startCustomSession,
  parseResumePdf,
};
