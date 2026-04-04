# 🧩 PlaceMateAI — Feature-by-Feature Execution Plan

To avoid massive, cross-cutting updates that break the app, we will execute the system improvements **vertical slice by vertical slice** (feature by feature). This ensures that every time we touch a feature, we update both its backend and frontend concurrently, leaving it fully functional before moving on.

---

## 🗄️ Layer 1: Core Infrastructure & Security
**Goal**: Patch fundamental application vulnerabilities, setup rate limiters globally, and prepare BullMQ for the AI services. 
*(Do this first as other features depend on these core changes).*

### 📂 Files Involved
- **Backend**: `.env`, `.gitignore`, `index.js`, `package.json`, `config/db.js`, `middleware/auth.js`, `middleware/rateLimiters.js` (NEW), `config/redis.js` (NEW)
- **Frontend**: `src/hooks/useApi.js` (Global Axios handlers), `src/constants/api.js` (if any API error interceptor config exists)

### 📋 Tasks
1. **Security**: Add `.env` to `.gitignore` and rotate API keys (Clerk, VAPI, OpenRouter, Razorpay).
2. **CORS & Limits**: Restrict CORS origin in `index.js`, reduce Express JSON payload limits to 1MB, and configure `helmet` & `compression`.
3. **Timeouts**: Add server Timeouts and Graceful Shutdown listeners to `index.js`.
4. **BullMQ / Redis Baseline**: Install necessary dependencies, set up `config/redis.js`, and mount the `/admin/queues` Bull-Board endpoint.
5. **Frontend Interceptors**: Implement a global Axios Interceptor to catch `HTTP 429` (Rate limits) and `HTTP 402` (Out of credits), triggering appropriate toasts or modals.

### 🧪 Testing Guide
- Simulate a request from a random origin (Postman without your domain) and ensure it gets blocked by CORS.
- Push a file >1MB to any route and ensure `413 Payload Too Large` is returned without crashing the server.
- Temporarily mock a 429 response in the frontend and confirm the "Too many requests" toast displays without crashing the UI.

---

## 🎤 Layer 2: Custom Interviews (AI & Real-time)
**Goal**: Secure interview endpoints, prevent cost abuse, and implement background report generation to prevent timeout loss.

### 📂 Files Involved
- **Backend**: `controllers/customInterviewController.js`, `routes/customInterviewRoutes.js`, `models/interviewSessionModel.js`, `queues/analysisQueue.js` (NEW), `workers/analysisWorker.js` (NEW)
- **Frontend**: `src/hooks/useCustomInterview.js`, `src/pages/CustomInterview.jsx`, `src/components/ReportLoader.jsx` (NEW)

### 📋 Tasks
1. **Auth & Rate Limiting**: Limit `/chat` endpoints to 30 requests/min and enforce session ownership validation.
2. **Pre-emptive Credit Deduction**: Move credit deductions *before* fetching responses via OpenRouter.
3. **Queue Refactor**: Move `generateReport` out of the synchronous server event and enqueue it directly into BullMQ `analysisQueue`.
4. **Frontend Polling**: Update the Interview context/hooks to interpret an `analysis_pending` state and initiate polling a `/status` endpoint every 3-5 seconds.
5. **UI Transition**: Render Skeleton loaders and wait screens during the async evaluation phase.

### 🧪 Testing Guide
- Start a mock interview and rapidly span the "Speak" / Send chat button — verify frontend politely restricts you due to the rate limit.
- End the interview and observe the UI explicitly state "Generating Report". Confirm in backend logs that the Job hits BullMQ, processes asynchronously, and the frontend resolves smoothly once complete.
- Have a secondary account try to make a chat request against your active session ID — ensure backend blocks it via ownership validation.

---

## 👥 Layer 3: Group Discussions
**Goal**: Control DB performance bloat via bounded array pushes and utilize the new Queue logic for GD report generations.

### 📂 Files Involved
- **Backend**: `controllers/gdController.js`, `routes/gdRoutes.js`, `models/gdSessionModel.js`
- **Frontend**: `src/hooks/useGD.js` (or context), GD Chat components

### 📋 Tasks
1. **Rate Limiting**: Assign rate limiting middleware to `/next-turn` and `/opening` endpoints.
2. **Transcript Bounds**: Update the MongDB `$push` logic to `$slice` transcript arrays, capping maximum turns (e.g. 60) to prevent the document from endlessly expanding and lagging DB reads.
3. **Queue Refactor**: Migrate `generateGDReport` into BullMQ alongside Custom Interviews.
4. **Frontend Polling**: Apply the same async waiting logic and transition screens to the GD finish flow.

### 🧪 Testing Guide
- Join a Group Discussion.
- Artificially mock a 402 Out of Credits error on `/next-turn`; verify the frontend pushes the user toward the Subscription upgrade screen seamlessly.
- Conclude the GD and trace the job via the `/admin/queues` board to verify the worker successfully executes and updates the DB.

---

## 💼 Layer 4: Career Tools (LinkedIn & JDoodle)
**Goal**: Secure execution environments and correctly attribute API costs *before* service delivery.

### 📂 Files Involved
- **Backend**: `controllers/linkedinController.js`, `controllers/codingController.js`, `routes/codingRoutes.js`, `routes/linkedinRoutes.js`
- **Frontend**: `src/pages/LinkedInAnalyzer.jsx`, `src/pages/CodingEnvironment.jsx` (if applicable)

### 📋 Tasks
1. **LinkedIn Pre-emptive Deductions**: Update tool endpoints (`analyzeProfile`, `generateHeadlines`) to deduct credits first. Validate user logic to ensure the OpenRouter budget isn't burnt for free.
2. **JDoodle Auth**: Move POST `/api/coding/execute` behind the `clerkAuth` middleware and restrict rate limits. 
3. **Environment Sync**: Inject `JDOODLE_CLIENT_ID` securely into the environment so coding tasks stop failing outright.
4. **Frontend Handling**: Ensure Tool submissions cap user-typed profiles/text locally to prevent huge payload sending. 

### 🧪 Testing Guide
- Ensure your account has exactly **0 credits**. Try parsing a LinkedIn profile. The system should throw a 402 Error immediately without initiating external AI calls.
- Submit JDoodle code completely unauthenticated. Verify backend throws a 401 Unauthorized instead of processing the payload.

---

## 📑 Layer 5: Resumes & ATS Scoring
**Goal**: Implement document ownership tracking and limit analysis abuse.

### 📂 Files Involved
- **Backend**: `controllers/resume.controller.js`, `routes/resumeRoutes.js`
- **Frontend**: `src/pages/AtsScorer.jsx`, Resume display modules.

### 📋 Tasks
1. **Ownership Checks**: Modify `getResumeById` and `deleteResume` queries to explicitly lock queries to `req.user.clerkId` alongside the resume `_id`.
2. **AI Rate Limiting**: Apply standard AI tool limiters (10 requests/min max) for massive ATS scoring events.

### 🧪 Testing Guide
- Have User A upload a Resume. 
- Log in as User B, use Postman to manipulate the URL/Network call attempting to `DELETE /resume/<User_A_ID>`. Ensure it strictly returns `403 Forbidden`.

---

## 🧠 Layer 6: Question Bank & Dashboarding
**Goal**: Prepare the UI and DB layer for 10K concurrent users accessing static data.

### 📂 Files Involved
- **Backend**: `controllers/questionController.js`, `routes/questionRoutes.js`, `models/questionSchema.js`
- **Frontend**: `src/pages/QuestionBankDashboard.jsx`, etc.

### 📋 Tasks
1. **Database Indexing**: Append compound indexing strictly to `skills`, `companies`, `isActive`, and `domains` queries inside the Question Schema.
2. **Rate Limits**: Cap public/unauthenticated `/stats/aggregates` routes to block potential crawlers.
3. **Hard Clamps**: Limit any pagination requests over 50 (`Math.min(limit, 50)`).
4. **Frontend Pagination**: Upgrade the QuestionBank UI to cleanly load queries in slices of 50 via infinite scroll or "Load More", instead of slamming the DB.

### 🧪 Testing Guide
- Test fetching `?limit=99999` from Postman on the backend — confirm the JSON packet strictly limits to 50 results.
- Open QuestionBank on the frontend; ensure it behaves properly with paginated outputs (fetching the first 50 cleanly).
