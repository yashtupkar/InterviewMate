const axios = require("axios");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { TIER_LIMITS, getCycleKey } = require("../config/pricingConfig");

const languageMap = {
  javascript: { script: "nodejs", versionIndex: "4" },
  python: { script: "python3", versionIndex: "4" },
  java: { script: "java", versionIndex: "4" },
  cpp: { script: "cpp17", versionIndex: "1" },
  c: { script: "c", versionIndex: "5" },
};

const CODING_EXECUTION_LIMITS = {
  Free: { blocked: true, monthlyLimit: 0 },
  "Student Flash": {
    blocked: false,
    monthlyLimit: TIER_LIMITS["Student Flash"].codingMonthlyExecution,
  },
  "Placement Pro": { blocked: false, monthlyLimit: Infinity },
  "Infinite Elite": { blocked: false, monthlyLimit: Infinity },
};

const ensureSubscription = async (userId) => {
  const user = await User.findById(userId).select("subscription");
  if (!user) return null;

  if (user.subscription) {
    return Subscription.findById(user.subscription);
  }

  const subscription = await Subscription.create({ user: user._id });
  user.subscription = subscription._id;
  await user.save();
  return subscription;
};

const buildEntitlementPayload = (subscription, limit, cycleKey) => {
  const count = subscription?.codingExecution?.count || 0;
  const effectiveCount =
    subscription?.codingExecution?.cycleKey === cycleKey ? count : 0;
  return {
    tier: subscription?.tier || "Free",
    used: effectiveCount,
    limit: Number.isFinite(limit.monthlyLimit) ? limit.monthlyLimit : null,
    remaining: Number.isFinite(limit.monthlyLimit)
      ? Math.max(limit.monthlyLimit - effectiveCount, 0)
      : null,
    cycleKey,
    unlimited: !Number.isFinite(limit.monthlyLimit),
  };
};

exports.executeCode = async (req, res) => {
  try {
    const subscription = await ensureSubscription(req.user?._id);
    if (!subscription) {
      return res.status(404).json({
        error: "Subscription not found",
        reason: "SUBSCRIPTION_NOT_FOUND",
      });
    }

    const tier = subscription.tier || "Free";
    const limit = CODING_EXECUTION_LIMITS[tier] || CODING_EXECUTION_LIMITS.Free;
    const cycleKey = getCycleKey();

    if (
      !subscription.codingExecution ||
      subscription.codingExecution.cycleKey !== cycleKey
    ) {
      subscription.codingExecution = {
        cycleKey,
        count: 0,
        updatedAt: new Date(),
      };
      await subscription.save();
    }

    const entitlement = buildEntitlementPayload(subscription, limit, cycleKey);

    if (limit.blocked) {
      return res.status(403).json({
        error: "Upgrade required to access coding execution",
        reason: "UPGRADE_REQUIRED",
        entitlement,
      });
    }

    if (
      Number.isFinite(limit.monthlyLimit) &&
      entitlement.used >= limit.monthlyLimit
    ) {
      return res.status(429).json({
        error: "Monthly coding execution limit reached for your plan",
        reason: "EXECUTION_LIMIT_REACHED",
        entitlement,
      });
    }

    const { script, language, stdin } = req.body;

    if (!script || !language) {
      return res
        .status(400)
        .json({ error: "Script and language are required" });
    }

    const config = languageMap[language.toLowerCase()];
    if (!config) {
      return res
        .status(400)
        .json({ error: `Unsupported language: ${language}` });
    }

    const payload = {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: script,
      language: config.script,
      versionIndex: config.versionIndex,
      stdin: typeof stdin === "string" ? stdin : "",
    };

    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      payload,
    );

    if (Number.isFinite(limit.monthlyLimit)) {
      subscription.codingExecution = {
        cycleKey,
        count: (subscription.codingExecution?.count || 0) + 1,
        updatedAt: new Date(),
      };
      await subscription.save();
    }

    const updatedEntitlement = buildEntitlementPayload(
      subscription,
      limit,
      cycleKey,
    );

    return res.status(200).json({
      output: response.data.output,
      statusCode: response.data.statusCode,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime,
      entitlement: updatedEntitlement,
    });
  } catch (error) {
    console.error(
      "JDoodle execution error:",
      error.response ? error.response.data : error.message,
    );
    return res.status(500).json({
      error: "Code execution failed",
      details: error.response ? error.response.data : error.message,
    });
  }
};
