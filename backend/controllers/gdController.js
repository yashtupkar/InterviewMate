const GDSession = require("../models/gdSessionModel");
const {
  getOpeningStatement,
  getAgentResponse,
  getProactiveAgentResponse,
  getConclusionStatement,
  analyzeGDTranscript,
} = require("../services/GDAnalyzer");
const { rewardReferrer } = require("./referralController");

// ── Agent Roster ──────────────────────────────────────────────────────────────
const AGENT_ROSTER = [
  {
    name: "Rohan",
    personality:
      "Analytical and logical. Always backs points with data and structure. Tends to play devil's advocate.",
    voiceId: "echo",
    color: "#6366f1",
    avatarSeed: "rohan",
  },
  {
    name: "Sophia",
    personality:
      "Empathetic and people-focused. Highlights human impact, social consequences, and emotional aspects of issues.",
    voiceId: "nova",
    color: "#ec4899",
    avatarSeed: "sophia",
  },
  {
    name: "Marcus",
    personality:
      "Bold and direct. Takes strong stances, challenges weak arguments, and pushes for actionable conclusions.",
    voiceId: "onyx",
    color: "#f59e0b",
    avatarSeed: "marcus",
  },
  {
    name: "Emma",
    personality:
      "Creative and unconventional. Brings fresh perspectives, out-of-the-box ideas, and challenges conventional wisdom.",
    voiceId: "shimmer",
    color: "#10b981",
    avatarSeed: "emma",
  },
];

// ── GD Topics Library ─────────────────────────────────────────────────────────
const GD_TOPICS = {
  general: [
    {
      topic: "Remote work is more productive than working from office",
      description: "Debate the merits of WFH vs office culture",
    },
    {
      topic: "Social media does more harm than good to society",
      description: "Analyze the societal impact of social platforms",
    },
    {
      topic: "Should college education be free for everyone?",
      description: "Explore access, funding, and value of higher education",
    },
    {
      topic: "Leadership is born, not made",
      description: "Nature vs nurture in leadership development",
    },
    {
      topic: "The gig economy is exploiting workers",
      description: "Flexibility vs stability in modern employment",
    },
    {
      topic: "Work from home vs Office culture: Which is better for India?",
      description: "Compare the benefits and challenges of WFH and traditional office work.",
    },
  ],
  technical: [
    {
      topic: "Artificial Intelligence will replace more jobs than it creates",
      description: "AI's impact on the future of employment",
    },
    {
      topic: "Open source software is better than proprietary software",
      description: "Licensing models and their societal impact",
    },
    {
      topic: "Data privacy is more important than national security",
      description: "The balance between privacy rights and surveillance",
    },
    {
      topic: "Blockchain technology is overhyped",
      description: "Real-world utility vs speculative excitement",
    },
    {
      topic: "Electric vehicles will completely replace combustion engines by 2040",
      description: "Feasibility and timeline of the EV transition",
    },
  ],
  current_affairs: [
    {
      topic: "India should prioritize economic growth over environmental sustainability",
      description: "Development vs ecological responsibility",
    },
    {
      topic: "Cryptocurrency should be regulated by governments",
      description: "Financial regulation in the digital asset era",
    },
    {
      topic: "The rise of AI in healthcare: boon or bane?",
      description: "AI's role in medicine and patient care",
    },
    {
      topic: "Space exploration should be a global priority",
      description: "Funding and goals of space programs",
    },
    {
      topic: "Social media companies should be liable for user-generated misinformation",
      description: "Platform responsibility and free speech",
    },
  ],
  ethical: [
    {
      topic: "Is whistleblowing always morally justified?",
      description: "Ethics of exposing organizational wrongdoing",
    },
    {
      topic: "Should euthanasia be legalized?",
      description: "Right to die, medical ethics, and personal autonomy",
    },
    {
      topic: "Affirmative action does more harm than good",
      description: "Equity, meritocracy, and systemic inequality",
    },
    {
      topic: "Animals should have the same legal rights as humans",
      description: "Animal consciousness, rights, and legal personhood",
    },
    {
      topic: "Technology companies have too much power over society",
      description: "Big Tech's influence on democracy and daily life",
    },
  ],
};

// ── Helper: pick random agents ────────────────────────────────────────────────
function pickAgents(count = 4) {
  const shuffled = [...AGENT_ROSTER].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Helper: pick next random agent (avoid repeating last speaker) ─────────────
function pickNextAgent(agents, lastSpeakerName) {
  const available = agents.filter((a) => a.name !== lastSpeakerName);
  const pool = available.length > 0 ? available : agents;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/group-discussion/start
 * Creates a GD session with random topic (or specified) and 4 AI agents.
 */
const startGDSession = async (req, res) => {
  try {
    const { category = "general", topicIndex, timeLimit = 600, prepTime = false } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const topicPool = GD_TOPICS[category] || GD_TOPICS.general;
    const selectedTopic =
      topicIndex !== null && topicIndex !== undefined
        ? topicPool[topicIndex] || topicPool[Math.floor(Math.random() * topicPool.length)]
        : topicPool[Math.floor(Math.random() * topicPool.length)];

    const agents = pickAgents(4);

    const session = new GDSession({
      userId,
      topic: selectedTopic.topic,
      category,
      agents,
      status: "active",
      transcript: [],
      timeLimit,
      prepTime,
    });

    await session.save();

    res.status(200).json({
      sessionId: session._id,
      topic: selectedTopic.topic,
      description: selectedTopic.description,
      category,
      agents,
      prepTime,
    });
  } catch (error) {
    console.error("startGDSession error:", error);
    res.status(500).json({ message: "Failed to start GD session" });
  }
};

/**
 * GET /api/group-discussion/topics
 * Returns all available GD topics grouped by category.
 */
const getTopics = async (req, res) => {
  try {
    res.status(200).json(GD_TOPICS);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch topics" });
  }
};

/**
 * POST /api/group-discussion/opening
 * First agent opens the GD with a substantive, stance-taking statement.
 * Called once right when session starts — before any user speaks.
 */
const openGDSession = async (req, res) => {
  try {
    const { sessionId, skipSave = false } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Always pick the first agent as opener
    const opener = session.agents[0];

    const openingText = await getOpeningStatement(opener, session.topic);
    if (!openingText) return res.status(500).json({ message: "Failed to generate opening" });

    if (!skipSave) {
      session.transcript.push({
        speaker: opener.name,
        role: "agent",
        text: openingText,
        agentPersonality: opener.personality,
        timestamp: new Date(),
      });
      await session.save();
    }

    res.status(200).json({
      agent: { name: opener.name, color: opener.color, avatarSeed: opener.avatarSeed, voiceId: opener.voiceId },
      text: openingText,
    });
  } catch (error) {
    console.error("openGDSession error:", error);
    res.status(500).json({ message: "Failed to open GD session" });
  }
};


/**
 * POST /api/group-discussion/next-turn
 * Given the current transcript, picks a random agent and generates their response.
 * Body: { sessionId, userMessage (optional), proactive (boolean) }
 */
const getNextAgentTurn = async (req, res) => {
  try {
    const { sessionId, userMessage, proactive = false, lastSpeaker, skipSave = false } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Add user message to transcript first if provided
    if (userMessage && userMessage.trim() && !skipSave) {
      session.transcript.push({
        speaker: "User",
        role: "user",
        text: userMessage.trim(),
        timestamp: new Date(),
      });
    }

    // Pick next random agent
    const agent = pickNextAgent(session.agents, lastSpeaker);

    // Generate agent response
    let agentText;
    if (proactive) {
      agentText = await getProactiveAgentResponse(
        agent,
        session.topic,
        session.transcript
      );
    } else {
      agentText = await getAgentResponse(
        agent,
        session.topic,
        session.transcript,
        userMessage
      );
    }

    if (!agentText) {
      return res.status(500).json({ message: "Agent failed to respond" });
    }

    // Save agent turn to transcript if not skipping
    if (!skipSave) {
      session.transcript.push({
        speaker: agent.name,
        role: "agent",
        text: agentText,
        agentPersonality: agent.personality,
        timestamp: new Date(),
      });
      await session.save();
    }

    res.status(200).json({
      agent: {
        name: agent.name,
        color: agent.color,
        avatarSeed: agent.avatarSeed,
        voiceId: agent.voiceId,
      },
      text: agentText,
    });
  } catch (error) {
    console.error("getNextAgentTurn error:", error);
    res.status(500).json({ message: "Failed to get agent turn" });
  }
};

/**
 * POST /api/group-discussion/add-user-message
 * Saves just the user's message without triggering an agent turn.
 */
const addUserMessage = async (req, res) => {
  try {
    const { sessionId, text } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (text && text.trim()) {
      session.transcript.push({
        speaker: "User",
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      });
      await session.save();
    }

    res.status(200).json({ message: "Message saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save message" });
  }
};

/**
 * POST /api/group-discussion/generate-report
 * Analyzes the full session and generates a contribution report.
 */
const generateGDReport = async (req, res) => {
  try {
    const { sessionId, duration } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.transcript.length === 0) {
      return res.status(400).json({ message: "No transcript to analyze" });
    }

    if (duration) session.duration = duration;
    session.status = "analysis_pending";
    await session.save();

    // Respond immediately, analyze async
    res.status(200).json({ status: "analysis_pending", message: "Analysis started" });

    // Background analysis
    (async () => {
      try {
        const userName = "User";
        // Reload session to get the latest transcript including any just-added messages
        const freshSession = await GDSession.findById(sessionId);
        if (!freshSession) return;

        const reportData = await analyzeGDTranscript(
          freshSession.topic,
          freshSession.transcript,
          userName
        );

        freshSession.report = reportData;
        freshSession.status = "completed";
        await freshSession.save();
        await rewardReferrer(userId);
      } catch (err) {
        console.error("GD analysis error:", err);
        const failSession = await GDSession.findById(sessionId);
        if (failSession) {
          failSession.status = "analysis_failed";
          await failSession.save();
        }
      }
    })();
  } catch (error) {
    console.error("generateGDReport error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

/**
 * GET /api/group-discussion/report/:sessionId
 * Fetch session + report by ID.
 */
const getGDReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GDSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching GD report" });
  }
};

/**
 * GET /api/group-discussion/my-sessions
 * Returns all GD sessions for the authenticated user.
 */
const getUserGDs = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessions = await GDSession.find({ userId })
      .sort({ createdAt: -1 })
      .select("-transcript"); // exclude heavy transcript from list
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching GD sessions" });
  }
};

/**
 * POST /api/group-discussion/conclude
 * Picks an agent to provide a final wrap-up statement.
 */
const concludeGDSession = async (req, res) => {
  try {
    const { sessionId, lastSpeaker, skipSave = false } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Pick a concluding agent (not necessarily the last speaker)
    const agent = pickNextAgent(session.agents, lastSpeaker);

    const conclusionText = await getConclusionStatement(
      agent,
      session.topic,
      session.transcript
    );

    if (!conclusionText) {
      return res.status(500).json({ message: "Failed to generate conclusion" });
    }

    if (!skipSave) {
      session.transcript.push({
        speaker: agent.name,
        role: "agent",
        text: conclusionText,
        agentPersonality: agent.personality,
        timestamp: new Date(),
      });
      
      // Mark as completed since this is the wrap-up
      session.status = "active"; // Keep active while we play the sound, but frontend knows it's the end
      await session.save();
    }

    res.status(200).json({
      agent: {
        name: agent.name,
        color: agent.color,
        avatarSeed: agent.avatarSeed,
        voiceId: agent.voiceId,
      },
      text: conclusionText,
    });
  } catch (error) {
    console.error("concludeGDSession error:", error);
    res.status(500).json({ message: "Failed to conclude session" });
  }
};

const addAgentMessage = async (req, res) => {
  try {
    const { sessionId, name, text, personality } = req.body;
    const userId = req.user?._id;

    const session = await GDSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (text && text.trim()) {
      session.transcript.push({
        speaker: name,
        role: "agent",
        text: text.trim(),
        agentPersonality: personality || "",
        timestamp: new Date(),
      });
      await session.save();
    }

    res.status(200).json({ message: "Agent message saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save agent message" });
  }
};

module.exports = {
  startGDSession,
  openGDSession,
  getTopics,
  getNextAgentTurn,
  addUserMessage,
  addAgentMessage,
  generateGDReport,
  getGDReport,
  getUserGDs,
  concludeGDSession,
};
