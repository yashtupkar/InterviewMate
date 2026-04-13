// export const FEATURE_COSTS = {
//   mockInterview: 10,
//   gdSession: 8,
//   atsScanner: 5,
//   toolUse: 5,
// };

// export const pricingPlans = [
//   {
//     name: "Student Flash",
//     monthlyPlanId: "student_flash_monthly",
//     yearlyPlanId: "student_flash_yearly",
//     monthlyPrice: "199",
//     yearlyPrice: "1,999",
//     credits: "200 Credits",
//     description: "Perfect for a quick preparation boost.",
//     features: [
//       `Mock Interviews (${FEATURE_COSTS.mockInterview} Credits)`,
//       `GD Sessions (${FEATURE_COSTS.gdSession} Credits)`,
//       `ATS Scanner (${FEATURE_COSTS.atsScanner} Credits)`,
//       "Resume Builder (4 Resumes)",
//       "Expert AI Feedback",
//       "Practice Coding Problems",
//       "24/7 AI Mentor Access",
//     ],
//     recommended: false,
//   },
//   {
//     name: "Placement Pro",
//     monthlyPlanId: "placement_pro_monthly",
//     yearlyPlanId: "placement_pro_yearly",
//     monthlyPrice: "499",
//     yearlyPrice: "4,999",
//     credits: "600 Credits",
//     description: "Complete package for serious job seekers.",
//     features: [
//       `Mock Interviews (${FEATURE_COSTS.mockInterview} Credits)`,
//       `GD Sessions (${FEATURE_COSTS.gdSession} Credits)`,
//       "Unlimited ATS & Resumes",
//       "Expert AI Feedback",
//       "LinkedIn & Resume Tools",
//       "Priority AI Processing",
//       "Career Analytics Pro",
//       "Advanced Flash 2.0 AI",
//     ],
//     recommended: true,
//   },
//   {
//     name: "Infinite Elite",
//     monthlyPlanId: "infinite_elite_monthly",
//     yearlyPlanId: "infinite_elite_yearly",
//     monthlyPrice: "899",
//     yearlyPrice: "8,999",
//     credits: "1,200 Credits",
//     description: "The ultimate unlimited preparation experience.",
//     features: [
//       `Mock Interviews (${FEATURE_COSTS.mockInterview} Credits)`,
//       `GD Sessions (${FEATURE_COSTS.gdSession} Credits)`,
//       "Unlimited ATS & Resumes",
//       "LinkedIn & Resume Pro",
//       "WhatsApp Career Support",
//       "Early Access to Features",
//       "Expert AI Mock Reviews",
//     ],
//     recommended: false,
//   },
//   {
//     name: "Free",
//     monthlyPlanId: null,
//     yearlyPlanId: null,
//     monthlyPrice: "0",
//     yearlyPrice: "0",
//     credits: "30 Credits",
//     description: "Get started with PlaceMateAI.",
//     features: [
//       `Mock Interviews (${FEATURE_COSTS.mockInterview} Credits)`,
//       `GD Sessions (${FEATURE_COSTS.gdSession} Credits)`,
//       `ATS Scanner (${FEATURE_COSTS.atsScanner} Credits)`,
//       "Resume Builder (1 Resume)",
//       "Basic Feedback",
//       "Practice Coding Problems",
//     ],
//     recommended: false,
//   },
// ];

// export const pricingTopUps = [
//   { planId: "quick_boost", name: "Quick Boost", price: "29", credits: "30" },
//   { planId: "power_pack", name: "Power Pack", price: "49", credits: "70" },
//   { planId: "pro_master", name: "Pro Master", price: "99", credits: "200" },
// ];

// export const billingTopUps = [
//   { planId: "student_test", name: "Student Test", price: "1", credits: "200", adminOnly: true },
//   ...pricingTopUps,
// ];

// export const hasCreditsFor = (subscription, cost) => {
//   if (!subscription) return true;
//   if (subscription.tier === "Infinite Elite") return true;
//   return (subscription.credits || 0) >= cost;
// };

export const FEATURE_COSTS = {
  mockInterview: 20,
  gdSession: 30,
  atsScanner: 10,
  toolUse: 6,
};

export const pricingPlans = [
  {
    name: "Student Flash",
    monthlyPlanId: "student_flash_monthly",
    yearlyPlanId: "student_flash_yearly",
    monthlyPrice: "199",
    yearlyPrice: "1,999",
    credits: "260 Credits",
    description: "Perfect for a quick preparation boost.",
    features: [
      "≈ 13 AI Mock Interviews ",
      "≈ 8 GD Simulator Sessions",
      "ATS Resume Scanner",
      "Resume Builder (Up to 4 resumes)",
      "Interview Feedback Reports Included",
      "LinkedIn Profile Optimizer",
      "Coding Interview Practice",
      "Interview Question Bank (Free)",
      "No Ads",
    ],
    recommended: false,
  },

  {
    name: "Placement Pro",
    monthlyPlanId: "placement_pro_monthly",
    yearlyPlanId: "placement_pro_yearly",
    monthlyPrice: "499",
    yearlyPrice: "4,999",
    credits: "750 Credits",
    description: "Complete package for serious job seekers.",
    features: [
      "≈ 37 AI Mock Interviews ",
      "≈ 25 GD Simulator Sessions ",
      "Unlimited ATS Resume Scans",
      "Unlimited Resume Builder",
      "Advanced Interview Feedback",
      "LinkedIn Optimizer",
      "Coding Interview Practice",
      "Interview Question Bank (Free)",
      "Priority AI Processing",
      "Company-wise Interview Prep",
      "No Ads",
    ],
    recommended: true,
  },

  {
    name: "Infinite Elite",
    monthlyPlanId: "infinite_elite_monthly",
    yearlyPlanId: "infinite_elite_yearly",
    monthlyPrice: "899",
    yearlyPrice: "8,999",
    credits: "1700 Credits",
    description: "The ultimate unlimited preparation experience.",
    features: [
      "≈ 85 AI Mock Interviews ",
      "≈ 55 GD Simulator Sessions ",
      "Unlimited ATS Resume Scans",
      "Unlimited Resume Builder",
      "Premium Interview Feedback",
      "LinkedIn & Resume Pro Tools",
      "Coding Practice",
      "Interview Question Bank (Free)",
      "Priority AI Processing",
      "WhatsApp Career Support",
      "Early Access to Features",
      "No Ads",
    ],
    recommended: false,
  },

  {
    name: "Free",
    monthlyPlanId: null,
    yearlyPlanId: null,
    monthlyPrice: "0",
    yearlyPrice: "0",
    credits: "60 Credits",
    description: "Get started with PlaceMateAI.",
    features: [
      "≈ 2 Mock Interviews",
      "≈ 1 GD Session",
      "ATS Resume Scanner",
      "Resume Builder (1 resume)",
      "Interview Question Bank (Free)",
      "Coding Practice Access",
      "Basic Interview Feedback",
      "Ads Enabled",
    ],
    recommended: false,
  },
];

export const pricingTopUps = [
  { planId: "quick_boost", name: "Quick Boost", price: "39", credits: "40" },
  { planId: "power_pack", name: "Power Pack", price: "79", credits: "90" },
  { planId: "pro_master", name: "Pro Master", price: "149", credits: "230" },
];

export const billingTopUps = [
  {
    planId: "student_test",
    name: "Student Test",
    price: "1",
    credits: "200",
    adminOnly: true,
  },
  ...pricingTopUps,
];

export const hasCreditsFor = (subscription, cost) => {
  if (!subscription) return true;
  if (subscription.tier === "Infinite Elite") return true;
  return (subscription.credits || 0) >= cost;
};