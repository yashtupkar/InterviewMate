## Plan: Safety-Aware Peer Interview Calling

Build a LiveKit-based peer interview system that launches quickly now and can later be self-hosted without changing product logic. The matching flow should be safety-first: use explicit user preferences, opt-in filters, block/report controls, and moderation rather than hard-coding gender as a hidden rule. For live sessions, use a hybrid model: direct request/accept for trust and control, plus optional instant matchmaking for fast practice when both users opt in.

**Steps**
1. Phase 1 - Product rules and data model foundation (blocks later phases)
   - Define the peer interview lifecycle: discover, request, accept, matched, scheduled, live, completed, reported, blocked.
   - Add Mongo models for peer sessions, match requests, user preferences, block lists, reports, and post-call ratings using the schema style already present in InterviewSession and GDSession.
   - Add preference fields for match control such as `peerMatchOptIn`, `preferredGender`, `allowedMatchModes`, `targetRole`, `targetSkills`, `availability`, and `language`.
   - Keep gender as an explicit user choice, not an inferred signal. Default should be "any" so the system does not silently exclude anyone.
   - Add indexes for inbox, queue, schedule, and moderation lookups.

2. Phase 2 - LiveKit integration layer (depends on Phase 1)
   - Start with LiveKit Cloud for launch speed, but keep the backend room/token logic provider-agnostic so you can migrate to self-hosted LiveKit later.
   - Add backend token generation for room join permissions, room metadata, and participant identity.
   - Add environment variables for LiveKit URL, API key, API secret, token TTL, and future self-hosted URL switches.
   - Keep call/session records in MongoDB, not inside the video provider, so migration later is mostly infrastructure/config.

3. Phase 3 - Matching and safety APIs (parallelizable after Phase 1; token hookup depends on Phase 2)
   - Direct invite APIs: send request, list incoming/outgoing, accept, reject, cancel, expire.
   - Instant matchmaking APIs: join queue, leave queue, find compatible match, auto-start room when both users opt in.
   - Scheduling APIs: propose time, accept, reschedule, cancel, join when start window opens.
   - Safety APIs: block user, report user, report session, hide match history, and admin review queue.
   - Add rate limits for invite spam, queue churn, and report abuse using the existing express-rate-limit pattern.
   - Keep the first release free if needed, with monetization deferred until the core experience is proven.

4. Phase 4 - Frontend UX and flow selection (depends on Phase 2 and Phase 3)
   - Add a peer interview workspace in the dashboard for preferences, request inbox, queue entry, and scheduled sessions.
   - Add routes for request inbox, match queue, call room, history, and moderation/report screens in frontend/src/App.jsx.
   - Build a call room UI that works for both 1:1 interview and later GD rooms, with audio-only fallback as a first-class mode.
   - Present two entry modes clearly: "Send request and wait" for trusted or safety-sensitive sessions, and "Instant match" for users who want fast practice.
   - Add incoming-request notifications, accept/reject actions, and a short timeout so pending requests do not linger forever.

5. Phase 5 - Post-call experience and trust signals (depends on Phase 4)
   - Save post-call notes, transcript summaries, and both-sides ratings.
   - Show history, partner quality indicators, and repeat-match prevention where appropriate.
   - Add trust signals such as verified profile status, completed sessions, and safety badges.

6. Phase 6 - Moderation and abuse handling (depends on Phase 5)
   - Add admin review for reports, temporary blocks, and escalations.
   - Add session-level and user-level abuse rules: repeated reports, early disconnects, spam requests, and blocked-user bypass attempts.
   - Add an audit trail so moderation decisions can be explained later.

7. Phase 7 - Reliability, rollout, and future self-host migration (cross-cutting)
   - Add cleanup jobs for expired invites, stale queue entries, and missed scheduled sessions.
   - Add metrics for acceptance rate, match time, disconnect rate, and report rate.
   - Add feature flags so you can start with LiveKit Cloud now and migrate to self-hosted LiveKit later without changing the app flow.


**Challenges: Local Development**
- WebRTC works best over HTTPS, so local dev may need localhost exceptions or a secure tunnel for some flows.
- Microphone and camera permissions can fail if the browser origin is not trusted.
- TURN may still be needed locally if testing behind a VPN or restrictive network.
- Multi-user testing needs two browser profiles or two devices so token and session state do not collide.
- Video bugs are harder to debug than REST bugs because failures can come from permissions, signaling, codecs, or network pathing.

**Challenges: Production on Vercel**
- Vercel is fine for the frontend, but not ideal for long-lived realtime signaling or media state.
- The frontend can stay on Vercel, but LiveKit room logic should live in the backend or a separate service.
- Vercel functions should only mint tokens and persist metadata, not manage live call state.
- If you later self-host LiveKit, Vercel should only need a URL and credential change, not a UI rewrite.
- Cleanup jobs and webhooks should run outside page lifecycles.

**Challenges: Production on Render**
- Render can host the Node backend, but realtime reliability depends on the plan and whether persistent networking is available.
- A self-hosted LiveKit server should only run on Render if the plan supports the UDP/TURN and port exposure you need.
- Cold starts and sleeping services are bad for active call flows.
- Call session state should never depend on in-process memory.
- Use durable storage and background jobs for cleanup and moderation state.

**Challenges: Legal and Terms**
- Gender-aware matching can become discriminatory or exclusionary if it is mandatory or opaque, so it should remain opt-in and user-controlled.
- Terms should explain how matching preferences work, what data is collected, and how that data affects discovery.
- Privacy Policy should cover profile data, preferences, call metadata, transcripts, reports, and retention periods.
- Community Guidelines should cover harassment, impersonation, misuse, recording, and abusive requests.
- Do not imply safety guarantees; instead describe blocking, reporting, and preference-based matching as user tools.
- If calls are recorded or transcribed, disclose it clearly and obtain consent where required.
- If minors can use the product, age gating and consent rules become much stricter.
- If women-only or men-only matching is supported, frame it as a user preference and safety tool, not a hidden platform rule.


**Relevant files**
- d:/interviewMate/backend/index.js - register peer interview routes and keep provider token endpoints isolated.
- d:/interviewMate/backend/middleware/auth.js - reuse clerkAuth for matching, sessions, and safety actions.
- d:/interviewMate/backend/models/User.js - expand with preferences, opt-in, block references, and safety metadata.
- d:/interviewMate/backend/models/interviewSessionModel.js - reference for session status/report structure.
- d:/interviewMate/backend/models/gdSessionModel.js - reference for transcript/report patterns for future GD rooms.
- d:/interviewMate/backend/services/creditService.js - keep matching and live calls independent from billing unless you decide otherwise later.
- d:/interviewMate/backend/config/pricingConfig.js - future pricing hooks if peer sessions become paid.
- d:/interviewMate/backend/routes/subscriptionRoutes.js - rate-limit pattern reference.
- d:/interviewMate/frontend/src/App.jsx - add peer interview routes and room flows.
- d:/interviewMate/frontend/src/context/InterviewContext.jsx - reference for persisted session/device state.
- d:/interviewMate/frontend/src/pages/DashboardOverview.jsx - add matching entry points and pending requests.
- d:/interviewMate/frontend/src/pages/InterviewSession.jsx - reference for live call page layout and device controls.

**Verification**
1. Test request, accept, reject, cancel, and expiry flows.
2. Test instant matchmaking with opt-in and block-list exclusion.
3. Test audio-only and video room joins for both direct invite and instant match.
4. Test report/block flows and admin review access control.
5. Test migration readiness by switching only LiveKit URL and API credentials while preserving room/session behavior.
6. Manual E2E using two accounts for request-based and instant-match sessions.

**Decisions**
- Recommended matching policy: safety-first, preference-based, opt-in gender filters, default "any".
- Recommended live-call entry: hybrid model, both request/accept and instant matchmaking.
- Recommended provider rollout: LiveKit Cloud now, self-host later if traffic/cost demands it.
- Recommended scope: 1:1 calls first, then reuse the same room architecture for GD rooms and audio-only mode.

**Further Considerations**
1. Gender policy: hard binary enforcement vs explicit preference-based matching. Recommendation: explicit preference-based matching with opt-in women-only / men-only / any, plus block/report controls.
2. Entry mode defaults: request-first vs instant-match-first. Recommendation: request-first for new or safety-sensitive users, instant-match for users who opt in.
3. Scheduling: required at launch vs phase 2. Recommendation: keep scheduling in phase 2 if launch speed matters, but the architecture should not block it later.