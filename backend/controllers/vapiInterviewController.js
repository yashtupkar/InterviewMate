const VapiKeyManager = require("../services/vapiKeyManager");
const InterviewSession = require("../models/interviewSessionModel");
const {
  InterviewResponseAnalyzer,
  AnalyzeFullTranscript,
} = require("../services/InterviewResponseAnalyzer");
const axios = require("axios");
const { rewardReferrer } = require("./referralController");
const CreditService = require("../services/creditService");

// Start an interview session
const startInterview = async (req, res) => {
  try {
    const { interviewType, role, level, content, agentName } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check balance (min 5 mins = 2.5 credits)
    const hasBalance = await CreditService.hasBalance(
      userId,
      "mock_interview",
      5,
    );
    if (!hasBalance) {
      return res
        .status(403)
        .json({
          message: "Insufficient credits to start an interview. Please top up.",
        });
    }

    // Create a new session
    const session = new InterviewSession({
      userId,
      interviewType,
      metadata: {
        uploadedInfo: content,
        role,
        level,
        agentName: agentName || "Rohan",
      },
    });

    await session.save();

    const interviewerName = agentName || "Rohan";

    // Define specific instructions based on interview type
    let typeSpecificInstructions = "";
    if (interviewType === "behavioral") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: BEHAVIORAL
      - Focus exclusively on soft skills, past experiences, and behavioral scenarios.
      - Ask questions about conflict resolution, teamwork, leadership, and problem-solving in a non-technical context.
      - Use the STAR (Situation, Task, Action, Result) method to probe deeper into their past experiences.
      - DO NOT ask core technical questions, coding problems, or theoretical technical concepts.
      - Examples: "Tell me about a time you had a conflict with a teammate," "How do you handle tight deadlines?"
      `;
    } else if (interviewType === "technical") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: TECHNICAL
      - Focus on core technical skills, concepts, and problem-solving.
      - You have the ability to give coding questions.
      - Ask a mix of verbal technical questions and 1-2 coding problems.
      - CRITICAL: For coding questions, you MUST output the following BLOCK exactly. 
      - DO NOT speak the JSON block aloud. Just say the question verbally, and then output the tag block.
      - FORMAT:
        [CODE_QUESTION]
        \`\`\`json
        {
          "question": "Write a function to...",
          "language": "javascript", 
          "initialCode": "function solution() {\\n  \\n}",
          "timeLimit": 300
        }
        \`\`\`
        [/CODE_QUESTION]
      - Supported languages: javascript, html, python, java, cpp.
      - For Frontend roles, prioritize javascript, html and css. For html, give tasks like "Create a responsive card".
      - For DSA/Backend, prioritize javascript, python or cpp.
      - timeLimit is in seconds (300 = 5 minutes).
      - After a coding question, wait for the user to submit or for the timer to run out.
      
      HANDLING EMPTY/DEFAULT CODE SUBMISSIONS:
      - If the candidate submits code that is empty, contains only the default template, or shows no actual solution implementation, DO NOT ask them to provide code again.
      - Instead, acknowledge the submission gracefully with one of these responses:
        * "I see you've submitted the template code. That's okay - let's move forward. Based on this coding question, it seems [observation about the problem/language used]."
        * "I understand. Let me move on to the next question so we can explore other areas."
      - CRITICAL: Immediately proceed to ask the next technical or behavioral question. Do NOT loop back to request code.
      - This prevents frustrating the candidate and keeps the interview flowing naturally.
      `;
    } else if (interviewType === "hr") {
      typeSpecificInstructions = `
      INTERVIEW TYPE: HR (Human Resources)
      - Focus on cultural fit, career goals, work-life balance, and organizational alignment.
      - Ask about their long-term aspirations and why they want to join this specific company or role.
      - Examples: "Where do you see yourself in 5 years?" "What motivates you to do your best work?"
      `;
    } else {
      typeSpecificInstructions = `
      INTERVIEW TYPE: GENERAL
      - Conduct a balanced interview covering both general professional background and high-level role suitability.
      `;
    }

    // Construct the system prompt for Vapi
    const systemPrompt = `
      You are ${interviewerName}, an expert and friendly interviewer. You are conducting a ${level} level ${interviewType} interview for the role of ${role}.
      
      Candidate Context:
      ${content}

      ${typeSpecificInstructions}
      
      General Operating Rules:
      1. CRITICAL: Introduce yourself as ${interviewerName}. Never say "my name is your name" or ask for your own name.
      2. Ask small, concise, and focused questions. One question at a time.
      3. DO NOT number your questions. Never say "Question 1", "First question", or "Question numbers". Just ask naturally as if in a real conversation.
      4. Listen to the candidate. If an answer is too short, ask a quick follow-up to probe deeper before moving to a new topic.
      5. Aim for a total of 5-7 targeted questions.
      6. End the interview gracefully by thanking the candidate. 
      7. CRITICAL: Once you have thanked the candidate and concluded the interview, you MUST say exactly: "The interview is now concluded. Goodbye!" to automatically disconnect the session.
      
      Tone: Professional, conversational, and encouraging.
    `;

    res.status(200).json({
      sessionId: session._id,
      systemPrompt,
      vapiPublicKey: await VapiKeyManager.getActiveKey(), // Get rotated public key
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Failed to start interview" });
  }
};

const getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report" });
  }
};

const generateReportFromTranscript = async (req, res) => {
  try {
    const { sessionId, transcript } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!sessionId || !Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({ message: "Transcript is required" });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const formattedTranscript = transcript
      .filter((message) => message && message.text)
      .map((message) => {
        const speaker =
          message.speaker ||
          (message.role === "assistant" || message.role === "agent"
            ? "Interviewer"
            : "Candidate");
        return `${speaker}: ${message.text}`;
      })
      .join("\n");

    if (!formattedTranscript.trim()) {
      return res.status(400).json({ message: "Transcript is empty" });
    }

    session.status = "analysis_pending";
    session.transcript = formattedTranscript;
    await session.save();

    // Trigger analysis in the background
    (async () => {
      try {
        const reportData = await AnalyzeFullTranscript(formattedTranscript);
        const overallScores = Object.values(reportData.overall);
        const averageScore = Math.round(
          overallScores.reduce((a, b) => a + b, 0) / overallScores.length,
        );

        session.report = {
          overallScore: averageScore,
          summary: reportData.summary || "",
          strengths: reportData.strengths || [],
          improvements: reportData.growthAreas || [],
          detailedAnalysis: reportData,
        };
        session.actualDuration = (req.body.duration || 10) * 60; // Store as seconds
        session.status = "completed";
        await rewardReferrer(userId);

        // Deduct credits based on duration (req.body.duration in seconds or minutes?)
        // Let's assume duration is in minutes if provided, else default to 10
        const durationMin = req.body.duration || 10;
        await CreditService.deduct(userId, "mock_interview", durationMin);
      } catch (reportError) {
        console.error("Error generating report from transcript:", reportError);
        session.status = "analysis_failed";
      }
      await session.save();
    })();

    res
      .status(200)
      .json({ status: "analysis_pending", message: "Analysis started" });
  } catch (error) {
    console.error("Error in generateReportFromTranscript:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};

const getUserInterviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const sessions = await InterviewSession.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    res.status(500).json({ message: "Error fetching user interviews" });
  }
};

const retryAnalysis = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.transcript) {
      return res.status(400).json({ message: "Transcript is missing" });
    }

    session.status = "analysis_pending";
    await session.save();

    try {
      const reportData = await AnalyzeFullTranscript(session.transcript);
      const overallScores = Object.values(reportData.overall);
      const averageScore = Math.round(
        overallScores.reduce((a, b) => a + b, 0) / overallScores.length,
      );

      session.report = {
        overallScore: averageScore,
        summary: reportData.summary || "",
        strengths: reportData.strengths || [],
        improvements: reportData.growthAreas || [],
        detailedAnalysis: reportData,
      };
      session.status = "completed";
    } catch (reportError) {
      console.error("Error generating report:", reportError);
      session.status = "analysis_failed";
    }

    await session.save();
    res.status(200).json({ status: session.status, report: session.report });
  } catch (error) {
    res.status(500).json({ message: "Error retrying analysis" });
  }
};

const saveTranscriptOnly = async (req, res) => {
  try {
    const { sessionId, transcript } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!sessionId || !Array.isArray(transcript)) {
      return res
        .status(400)
        .json({ message: "Session ID and transcript array are required" });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const formattedTranscript = transcript
      .filter((message) => message && message.text)
      .map((message) => {
        const speaker =
          message.speaker ||
          (message.role === "assistant" || message.role === "agent"
            ? "Interviewer"
            : "Candidate");
        return `${speaker}: ${message.text}`;
      })
      .join("\n");

    session.transcript = formattedTranscript;
    session.status = "analysis_pending";
    // Keep status as initialized or in_progress, don't move to analysis_pending yet
    await session.save();

    res.status(200).json({ message: "Transcript saved successfully" });
  } catch (error) {
    console.error("Error saving transcript:", error);
    res.status(500).json({ message: "Error saving transcript" });
  }
};

const reportVapiFailure = async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ message: "Key required" });

    await VapiKeyManager.reportExhaustion(publicKey);
    const nextKey = await VapiKeyManager.getActiveKey();

    res.status(200).json({
      message: "Key reported and rotated",
      nextKey,
    });
  } catch (error) {
    console.error("Error rotating key:", error);
    res.status(500).json({ message: "Rotation failed" });
  }
};

module.exports = {
  startInterview,
  getInterviewReport,
  generateReportFromTranscript,
  retryAnalysis,
  saveTranscriptOnly,
  getUserInterviews,
  reportVapiFailure,
};
