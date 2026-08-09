# Production Hardening Notes

## Phase 0 Baseline

- **Dependencies**: Installing `jest`, `supertest`, `autocannon`.
- **Baseline Test Result**: No tests found (Missing script "test"). Added Jest.
- **Baseline Lint Result**: Missing script "lint".
- **Baseline Build Result**: Backend is node, no build step.

## Vulnerabilities Found
- IDOR in `resume.controller.js` (unprotected update/delete).
- Race conditions in `creditService.js` and `subscriptionController.js` (double spending).
- Webhook vs Payment verification race condition leading to duplicate top-ups.
- Missing atomic checks in `requestRefund`.
- Race condition in `rewardReferrer`.
- Missing AI payload limits in `atsService.js`.
- Disconnected rate limiters in `subscriptionRoutes.js`.
