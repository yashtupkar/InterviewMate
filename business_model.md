# InterviewMate: Unified Credit Business Model (Revised for AWS TTS + JDoodle)

## 1. Executive Summary
InterviewMate remains a credit-first AI prep SaaS where **1 Credit = ₹1**, but this revised model now explicitly includes new variable expenses from:

- AWS TTS (Polly) for voice responses
- JDoodle for coding execution

This plan increases user-facing value (more free credits and richer session depth) while keeping contribution margins strong through tighter feature pricing, usage guardrails, and top-up strategy.

## 2. Strategic Goals of This Redesign
- Add AWS TTS and JDoodle costs into unit economics (no hidden COGS).
- Increase credit cost of high-value features: Interview, GD, ATS, and Tools.
- Increase free-tier credits without creating loss-heavy abuse.
- Preserve conversion momentum with a clear paywall after meaningful trial usage.
- Maintain healthy blended gross margin target of **80%+** at realistic usage.

## 3. Revised Credit Policy (Core Change)

### New Feature Credit Rates
| Feature | Old Credits | New Credits | Why Change |
| :--- | :--- | :--- | :--- |
| Mock Interview | 10 | **14** | Higher voice + LLM + orchestration cost |
| GD Session | 8 | **12** | Multi-turn and multi-agent computation |
| ATS Scan | 5 | **8** | Parsing + scoring + report generation |
| Resume Tool | 5 | **6** | Prompt-heavy drafting and optimization |
| LinkedIn Tool | 5 | **6** | Rewrite + headline variants + optimization |
| Coding Execution (JDoodle-backed) | n/a or implicit | **4 per execution** | Direct third-party runtime cost |

### Free Tier (Increased)
- **Old:** 30 credits
- **New:** **45 credits**

### New Free-Tier Burn Path
Recommended first-user path:
- 1 Mock Interview = 14
- 1 GD Session = 12
- 1 ATS Scan = 8
- 1 Resume Tool = 6

Total used = 40 credits, remaining = 5 credits (not enough for another core voice session), which keeps conversion pressure intact while giving stronger product exposure.

## 4. Revised Plans & Top-Ups

### A. Subscription Plans (Monthly and Yearly)
| Plan Name | Monthly Price | Yearly Price | Credits Included | Effective Credit/₹ |
| :--- | :--- | :--- | :--- | :--- |
| Student Flash | ₹199 | ₹1,999 | **220** | 1.11 |
| Placement Pro | ₹499 | ₹4,999 | **700** | 1.40 |
| Infinite Elite | ₹899 | ₹8,999 | **1,500** | 1.67 |

### B. Top-Up Wallet Packs
| Pack | Price | Credits | Effective Credit/₹ |
| :--- | :--- | :--- | :--- |
| Quick Boost | ₹39 | **40** | 1.03 |
| Power Pack | ₹79 | **90** | 1.14 |
| Pro Master | ₹149 | **230** | 1.54 |

Pricing logic:
- Top-ups are intentionally less efficient than subscription bundles to push upgrades.
- Higher tiers offer better credit-per-rupee to reward commitment and improve retention.

## 5. Cost Structure with AWS TTS and JDoodle

### Additional Expense Buckets (Now Explicit)
- **AWS Polly TTS:** Charged by generated characters, now allocated per session.
- **JDoodle Runtime:** Charged per execution/API usage block.
- **Base AI + Infra:** LLM tokens, storage, orchestration, monitoring, and retries.

### Revised Unit Economics by Feature
| Feature | User Price (Credits) | Estimated COGS (₹) | Gross Margin |
| :--- | :--- | :--- | :--- |
| Mock Interview | **14** | **0.80** (includes AWS TTS) | **94.3%** |
| GD Session | **12** | **2.25** (includes AWS TTS) | **81.3%** |
| ATS Scan | **8** | **0.55** | **93.1%** |
| Resume Tool | **6** | **0.50** | **91.7%** |
| LinkedIn Tool | **6** | **0.60** | **90.0%** |
| Coding Execution | **4** | **1.20** (includes JDoodle) | **70.0%** |

### Modeled Blended Margin (Conservative)
Assuming a realistic mix of usage (voice heavy but not extreme), blended COGS is modeled at **~₹0.12 per credit** in baseline and can move toward **₹0.18** in stress months. This keeps blended gross margin in a healthy band while covering AWS TTS and JDoodle costs.

## 6. Profitability Guardrails (Must-Have)

### Usage Control Rules
- Set soft monthly caps for very expensive workflows on lower tiers.
- Apply dynamic cooldown or queueing during peak voice traffic.
- Add daily fair-use throttles for free-tier coding executions.

### Vendor Cost Controls
- AWS Polly optimization:
	- Cache repetitive prompts and system messages.
	- Prefer shorter response templates where quality is unchanged.
- JDoodle optimization:
	- Limit repeated identical runs.
	- Block accidental rapid re-execute loops.

### Commercial Controls
- Keep yearly plans at 10x monthly (cash flow advantage).
- Trigger top-up nudges at 20%, 10%, and 0% credit balance.
- Run periodic cohort analysis: COGS/user vs revenue/user by tier.

## 7. Final Recommended Positioning
- **User message:** "More free credits, deeper sessions, and better realism."
- **Business message:** "Pricing now reflects real AWS TTS + JDoodle costs, with strong profitability discipline."

This redesign gives users higher value up front (45 free credits + richer session options) while protecting the company with higher per-feature credits where cost is real.

## 8. 60-Day Execution Plan
1. Week 1-2: Ship new credit constants and free-tier update (45 credits).
2. Week 2-3: Add transparent usage meter for TTS-heavy and coding-heavy actions.
3. Week 3-4: Launch revised plan and top-up catalog on frontend + checkout.
4. Week 5-6: Monitor margins and conversion, then tune only one variable at a time (either credits or top-up pricing, not both).
5. Week 7-8: Publish ROI dashboard: ARPU, top-up rate, blended COGS/credit, gross margin by tier.

## 9. Full Monthly Plan Cost Breakdown (Including Razorpay)

### Assumptions Used in This P&L
- 1 Credit = ₹1 (selling value)
- User consumes all included monthly credits (conservative for cost)
- Razorpay charge = **2% + 18% GST on fee = effective 2.36% of collected amount**
- Blended variable COGS per credit = **₹0.12**, split as:
  - LLM inference + prompts: ₹0.050/credit
  - AWS Polly TTS: ₹0.028/credit
  - JDoodle runtime: ₹0.018/credit
  - Compute/logging/storage/retries: ₹0.024/credit
- Shared Ops Reserve (support, refunds, fixed infra, tools) = **7% of plan revenue**

Formula:
- Variable Usage Cost = Included Credits x ₹0.12
- Razorpay Cost = Plan Price x 2.36%
- Ops Reserve = Plan Price x 7%
- Net Remaining per Subscriber = Plan Price - (Variable Usage Cost + Razorpay Cost + Ops Reserve)

### A. Student Flash (₹199/month, 220 credits)
| Cost Head | Amount (₹) |
| :--- | ---: |
| Revenue Collected | 199.00 |
| LLM Inference Cost (220 x 0.050) | 11.00 |
| AWS Polly TTS (220 x 0.028) | 6.16 |
| JDoodle Runtime (220 x 0.018) | 3.96 |
| Compute/Storage/Monitoring (220 x 0.024) | 5.28 |
| Total Variable Usage Cost | **26.40** |
| Razorpay Fee (2.36%) | 4.70 |
| Ops Reserve (7%) | 13.93 |
| Total Cost | **45.03** |
| Net Remaining to Business | **153.97** |
| Net Contribution Margin | **77.4%** |

### B. Placement Pro (₹499/month, 700 credits)
| Cost Head | Amount (₹) |
| :--- | ---: |
| Revenue Collected | 499.00 |
| LLM Inference Cost (700 x 0.050) | 35.00 |
| AWS Polly TTS (700 x 0.028) | 19.60 |
| JDoodle Runtime (700 x 0.018) | 12.60 |
| Compute/Storage/Monitoring (700 x 0.024) | 16.80 |
| Total Variable Usage Cost | **84.00** |
| Razorpay Fee (2.36%) | 11.78 |
| Ops Reserve (7%) | 34.93 |
| Total Cost | **130.71** |
| Net Remaining to Business | **368.29** |
| Net Contribution Margin | **73.8%** |

### C. Infinite Elite (₹899/month, 1,500 credits)
| Cost Head | Amount (₹) |
| :--- | ---: |
| Revenue Collected | 899.00 |
| LLM Inference Cost (1,500 x 0.050) | 75.00 |
| AWS Polly TTS (1,500 x 0.028) | 42.00 |
| JDoodle Runtime (1,500 x 0.018) | 27.00 |
| Compute/Storage/Monitoring (1,500 x 0.024) | 36.00 |
| Total Variable Usage Cost | **180.00** |
| Razorpay Fee (2.36%) | 21.22 |
| Ops Reserve (7%) | 62.93 |
| Total Cost | **264.15** |
| Net Remaining to Business | **634.85** |
| Net Contribution Margin | **70.6%** |

### Summary Table (Monthly Plans)
| Plan | Revenue (₹) | Total Cost (₹) | Net Remaining (₹) | Margin |
| :--- | ---: | ---: | ---: | :--- |
| Student Flash | 199.00 | 45.03 | **153.97** | 77.4% |
| Placement Pro | 499.00 | 130.71 | **368.29** | 73.8% |
| Infinite Elite | 899.00 | 264.15 | **634.85** | 70.6% |

Important note:
- This is conservative because it assumes full credit burn every month.
- If actual credit consumption is lower than 100%, your real net remaining per subscriber will be higher.
