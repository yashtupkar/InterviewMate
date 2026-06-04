// const toNumber = (value, fallback) => {
//   const parsed = Number(value);
//   return Number.isFinite(parsed) ? parsed : fallback;
// };

// const SERVICE_CREDITS = {
//   mock_interview: toNumber(process.env.CREDITS_MOCK_INTERVIEW, 10),
//   gd_session: toNumber(process.env.CREDITS_GD_SESSION, 8),
//   tools: toNumber(process.env.CREDITS_TOOL, 5),
//   ats_scanner: toNumber(process.env.CREDITS_ATS_SCANNER, 5),
// };

// const TIER_LIMITS = {
//   Free: {
//     credits: toNumber(process.env.CREDITS_FREE_PLAN, 30),
//     resumeLimit: 1,
//     codingMonthlyExecution: 0,
//   },
//   "Student Flash": {
//     credits: toNumber(process.env.CREDITS_STUDENT_FLASH_PLAN, 200),
//     resumeLimit: 4,
//     codingMonthlyExecution: toNumber(process.env.CODING_FLASH_MONTHLY_LIMIT, 300),
//   },
//   "Placement Pro": {
//     credits: toNumber(process.env.CREDITS_PLACEMENT_PRO_PLAN, 600),
//     resumeLimit: Infinity,
//     codingMonthlyExecution: Infinity,
//   },
//   "Infinite Elite": {
//     credits: toNumber(process.env.CREDITS_INFINITE_ELITE_PLAN, 1200),
//     resumeLimit: Infinity,
//     codingMonthlyExecution: Infinity,
//   },
// };

// const PLAN_CONFIG = {
//   student_flash_monthly: {
//     tier: "Student Flash",
//     planName: "Student Flash (Monthly)",
//     amountPaise: toNumber(process.env.AMOUNT_STUDENT_FLASH_MONTHLY_PAISE, 19900),
//     billingCycle: "monthly",
//     expiryDays: 30,
//     credits: TIER_LIMITS["Student Flash"].credits,
//     isTopup: false,
//   },
//   placement_pro_monthly: {
//     tier: "Placement Pro",
//     planName: "Placement Pro (Monthly)",
//     amountPaise: toNumber(process.env.AMOUNT_PLACEMENT_PRO_MONTHLY_PAISE, 49900),
//     billingCycle: "monthly",
//     expiryDays: 30,
//     credits: TIER_LIMITS["Placement Pro"].credits,
//     isTopup: false,
//   },
//   infinite_elite_monthly: {
//     tier: "Infinite Elite",
//     planName: "Infinite Elite (Monthly)",
//     amountPaise: toNumber(process.env.AMOUNT_INFINITE_ELITE_MONTHLY_PAISE, 89900),
//     billingCycle: "monthly",
//     expiryDays: 30,
//     credits: TIER_LIMITS["Infinite Elite"].credits,
//     isTopup: false,
//   },
//   student_flash_yearly: {
//     tier: "Student Flash",
//     planName: "Student Flash (Yearly)",
//     amountPaise: toNumber(process.env.AMOUNT_STUDENT_FLASH_YEARLY_PAISE, 199900),
//     billingCycle: "yearly",
//     expiryDays: 365,
//     credits: toNumber(process.env.CREDITS_STUDENT_FLASH_YEARLY, 2000),
//     isTopup: false,
//   },
//   placement_pro_yearly: {
//     tier: "Placement Pro",
//     planName: "Placement Pro (Yearly)",
//     amountPaise: toNumber(process.env.AMOUNT_PLACEMENT_PRO_YEARLY_PAISE, 499900),
//     billingCycle: "yearly",
//     expiryDays: 365,
//     credits: toNumber(process.env.CREDITS_PLACEMENT_PRO_YEARLY, 6000),
//     isTopup: false,
//   },
//   infinite_elite_yearly: {
//     tier: "Infinite Elite",
//     planName: "Infinite Elite (Yearly)",
//     amountPaise: toNumber(process.env.AMOUNT_INFINITE_ELITE_YEARLY_PAISE, 899900),
//     billingCycle: "yearly",
//     expiryDays: 365,
//     credits: toNumber(process.env.CREDITS_INFINITE_ELITE_YEARLY, 12000),
//     isTopup: false,
//   },
//   quick_boost: {
//     tier: null,
//     planName: "Quick Boost (30 Credits)",
//     amountPaise: toNumber(process.env.AMOUNT_TOPUP_QUICK_BOOST_PAISE, 2900),
//     billingCycle: "one_time",
//     expiryDays: null,
//     creditDelta: toNumber(process.env.CREDITS_TOPUP_QUICK_BOOST, 30),
//     isTopup: true,
//   },
//   power_pack: {
//     tier: null,
//     planName: "Power Pack (70 Credits)",
//     amountPaise: toNumber(process.env.AMOUNT_TOPUP_POWER_PACK_PAISE, 4900),
//     billingCycle: "one_time",
//     expiryDays: null,
//     creditDelta: toNumber(process.env.CREDITS_TOPUP_POWER_PACK, 70),
//     isTopup: true,
//   },
//   pro_master: {
//     tier: null,
//     planName: "Pro Master (200 Credits)",
//     amountPaise: toNumber(process.env.AMOUNT_TOPUP_PRO_MASTER_PAISE, 9900),
//     billingCycle: "one_time",
//     expiryDays: null,
//     creditDelta: toNumber(process.env.CREDITS_TOPUP_PRO_MASTER, 200),
//     isTopup: true,
//   },
//   student_test: {
//     tier: "Student Flash",
//     planName: "Student Flash (Test - INR 1)",
//     amountPaise: toNumber(process.env.AMOUNT_STUDENT_TEST_PAISE, 100),
//     billingCycle: "monthly",
//     expiryDays: 30,
//     credits: TIER_LIMITS["Student Flash"].credits,
//     isTopup: false,
//   },
// };

// const getCycleKey = (date = new Date()) => {
//   const year = date.getUTCFullYear();
//   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//   return `${year}-${month}`;
// };

// const isUnlimitedTierService = (tier, service) => {
//   return tier === "Infinite Elite" && service !== "tools";
// };

// const getServiceCost = (service, tier) => {
//   if (service === "ats_scanner") {
//     if (tier === "Placement Pro" || tier === "Infinite Elite") return 0;
//   }
//   return SERVICE_CREDITS[service] || 0;
// };

// module.exports = {
//   PLAN_CONFIG,
//   SERVICE_CREDITS,
//   TIER_LIMITS,
//   getCycleKey,
//   isUnlimitedTierService,
//   getServiceCost,
// };

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseTierList = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;
  const parsed = value
    .split(",")
    .map((tier) => tier.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
};

const SERVICE_CREDITS = {
  mock_interview: toNumber(process.env.CREDITS_MOCK_INTERVIEW, 20),
  gd_session: toNumber(process.env.CREDITS_GD_SESSION, 30),
  tools: toNumber(process.env.CREDITS_TOOL, 6),
  ats_scanner: toNumber(process.env.CREDITS_ATS_SCANNER, 10),
};

const TIER_LIMITS = {
  Free: {
    credits: toNumber(process.env.CREDITS_FREE_PLAN, 60),
    resumeLimit: 1,
    codingMonthlyExecution: 0,
  },

  "Student Flash": {
    credits: toNumber(process.env.CREDITS_STUDENT_FLASH_PLAN, 260),
    resumeLimit: 4,
    codingMonthlyExecution: toNumber(
      process.env.CODING_FLASH_MONTHLY_LIMIT,
      300,
    ),
  },

  "Placement Pro": {
    credits: toNumber(process.env.CREDITS_PLACEMENT_PRO_PLAN, 750),
    resumeLimit: Infinity,
    codingMonthlyExecution: Infinity,
  },

  "Infinite Elite": {
    credits: toNumber(process.env.CREDITS_INFINITE_ELITE_PLAN, 1700),
    resumeLimit: Infinity,
    codingMonthlyExecution: Infinity,
  },
};

const RESUME_AI_REWRITE_CONFIG = {
  enabled: process.env.RESUME_AI_REWRITE_ENABLED !== "false",
  sectionRewriteTiers: parseTierList(
    process.env.RESUME_AI_SECTION_REWRITE_TIERS,
    ["Student Flash", "Placement Pro", "Infinite Elite"],
  ),
  fullRewriteTiers: parseTierList(process.env.RESUME_AI_FULL_REWRITE_TIERS, [
    "Placement Pro",
    "Infinite Elite",
  ]),
  sectionRewriteCost: toNumber(
    process.env.CREDITS_RESUME_AI_SECTION_REWRITE,
    6,
  ),
  fullRewriteCost: toNumber(process.env.CREDITS_RESUME_AI_FULL_REWRITE, 10),
};

const PLAN_CONFIG = {
  student_flash_monthly: {
    tier: "Student Flash",
    planName: "Student Flash (Monthly)",
    amountPaise: toNumber(
      process.env.AMOUNT_STUDENT_FLASH_MONTHLY_PAISE,
      19900,
    ),
    billingCycle: "monthly",
    expiryDays: 30,
    credits: TIER_LIMITS["Student Flash"].credits,
    isTopup: false,
  },

  placement_pro_monthly: {
    tier: "Placement Pro",
    planName: "Placement Pro (Monthly)",
    amountPaise: toNumber(
      process.env.AMOUNT_PLACEMENT_PRO_MONTHLY_PAISE,
      49900,
    ),
    billingCycle: "monthly",
    expiryDays: 30,
    credits: TIER_LIMITS["Placement Pro"].credits,
    isTopup: false,
  },

  infinite_elite_monthly: {
    tier: "Infinite Elite",
    planName: "Infinite Elite (Monthly)",
    amountPaise: toNumber(
      process.env.AMOUNT_INFINITE_ELITE_MONTHLY_PAISE,
      89900,
    ),
    billingCycle: "monthly",
    expiryDays: 30,
    credits: TIER_LIMITS["Infinite Elite"].credits,
    isTopup: false,
  },

  student_flash_yearly: {
    tier: "Student Flash",
    planName: "Student Flash (Yearly)",
    amountPaise: toNumber(
      process.env.AMOUNT_STUDENT_FLASH_YEARLY_PAISE,
      199900,
    ),
    billingCycle: "yearly",
    expiryDays: 365,
    credits: toNumber(process.env.CREDITS_STUDENT_FLASH_YEARLY, 3120), // 260 * 12
    isTopup: false,
  },

  placement_pro_yearly: {
    tier: "Placement Pro",
    planName: "Placement Pro (Yearly)",
    amountPaise: toNumber(
      process.env.AMOUNT_PLACEMENT_PRO_YEARLY_PAISE,
      499900,
    ),
    billingCycle: "yearly",
    expiryDays: 365,
    credits: toNumber(process.env.CREDITS_PLACEMENT_PRO_YEARLY, 9000), // 750 * 12
    isTopup: false,
  },

  infinite_elite_yearly: {
    tier: "Infinite Elite",
    planName: "Infinite Elite (Yearly)",
    amountPaise: toNumber(
      process.env.AMOUNT_INFINITE_ELITE_YEARLY_PAISE,
      899900,
    ),
    billingCycle: "yearly",
    expiryDays: 365,
    credits: toNumber(process.env.CREDITS_INFINITE_ELITE_YEARLY, 20400), // 1700 * 12
    isTopup: false,
  },

  quick_boost: {
    tier: null,
    planName: "Quick Boost (40 Credits)",
    amountPaise: toNumber(process.env.AMOUNT_TOPUP_QUICK_BOOST_PAISE, 3900),
    billingCycle: "one_time",
    expiryDays: null,
    creditDelta: toNumber(process.env.CREDITS_TOPUP_QUICK_BOOST, 40),
    isTopup: true,
  },

  power_pack: {
    tier: null,
    planName: "Power Pack (90 Credits)",
    amountPaise: toNumber(process.env.AMOUNT_TOPUP_POWER_PACK_PAISE, 7900),
    billingCycle: "one_time",
    expiryDays: null,
    creditDelta: toNumber(process.env.CREDITS_TOPUP_POWER_PACK, 90),
    isTopup: true,
  },

  pro_master: {
    tier: null,
    planName: "Pro Master (230 Credits)",
    amountPaise: toNumber(process.env.AMOUNT_TOPUP_PRO_MASTER_PAISE, 14900),
    billingCycle: "one_time",
    expiryDays: null,
    creditDelta: toNumber(process.env.CREDITS_TOPUP_PRO_MASTER, 230),
    isTopup: true,
  },

  student_test: {
    tier: "Student Flash",
    planName: "Student Flash (Test - INR 1)",
    amountPaise: toNumber(process.env.AMOUNT_STUDENT_TEST_PAISE, 100),
    billingCycle: "monthly",
    expiryDays: 30,
    credits: TIER_LIMITS["Student Flash"].credits,
    isTopup: false,
  },
};

const getCycleKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const isUnlimitedTierService = (tier, service) => {
  return (
    tier === "Infinite Elite" &&
    (service === "mock_interview" || service === "gd_session")
  );
};

const getServiceCost = (service, tier) => {
  return SERVICE_CREDITS[service] || 0;
};

module.exports = {
  PLAN_CONFIG,
  SERVICE_CREDITS,
  TIER_LIMITS,
  RESUME_AI_REWRITE_CONFIG,
  getCycleKey,
  isUnlimitedTierService,
  getServiceCost,
};
