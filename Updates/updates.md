updated on 2026-04-13
## 1. High-Level Summary (TL;DR)
*   **Impact:** Medium - Introduces a new backend API for parsing PDF resumes and enhances the frontend to support file uploads, improving the user experience for interview setup.
*   **Key Changes:**
    *   ✨ **PDF Upload Endpoint:** Added a new backend route (`/parse-resume`) utilizing `multer` and `pdf-parse` to extract text from uploaded resumes.
    *   ✨ **Frontend Integration:** Updated the `CreateInterview` page to allow users to directly upload PDF files instead of relying purely on text input.
    *   🎨 **UI/UX Tweaks:** Improved text contrast across multiple components by updating Tailwind classes (e.g., changing `text-zinc-500` to `text-zinc-400`).
    *   🗑️ **Cleanup:** Removed the "Support & Policy" footer section from the `Billing` page.

## 2. Visual Overview (Code & Logic Map)

The following diagram illustrates the newly introduced PDF upload and parsing flow:

```mermaid
graph TD
  subgraph Frontend ["Frontend (CreateInterview.jsx)"]
    UI["Upload UI"]
    Handler["handleResumeUpload()"]
  end

  subgraph Backend ["Backend API"]
    Route["POST /parse-resume"]
    Multer["multer middleware"]
    Controller["parseResumePdf()"]
  end

  subgraph Library ["Third-Party Lib"]
    PDFParse["pdf-parse"]
  end

  UI -->|"Selects PDF File"| Handler
  Handler -->|"FormData (resume)"| Route
  Route -->|"File Buffer"| Multer
  Multer -->|"Validates (5MB limit, PDF only)"| Controller
  Controller -->|"Passes buffer"| PDFParse
  PDFParse -->|"Extracts Text"| Controller
  Controller -->|"JSON (resumeText)"| Handler
  
  style UI fill:#bbdefb,color:#0d47a1
  style Handler fill:#bbdefb,color:#0d47a1
  style Route fill:#c8e6c9,color:#1a5e20
  style Multer fill:#c8e6c9,color:#1a5e20
  style Controller fill:#c8e6c9,color:#1a5e20
  style PDFParse fill:#fff3e0,color:#e65100
```

## 3. Detailed Change Analysis

### 📁 Backend: Custom Interview API
*   **What Changed:** Added a new controller and route to handle file uploads securely and extract text content from PDFs.
*   **API Additions:**

| Method | Endpoint | Middleware | Controller | Description |
|---|---|---|---|---|
| `POST` | `/parse-resume` | `userAuth`, `multer` | `parseResumePdf` | Accepts a PDF file (`resume`), checks limits (5MB), and returns the parsed raw text using `pdf-parse`. |

*   **Dependencies:**

| Package | Action | Reason |
|---|---|---|
| `pdf-parse` | Added | Required to extract raw text strings from PDF buffers. |
| `multer` | Added | Required to handle `multipart/form-data` uploads securely in memory. |

### 📁 Frontend: Create Interview Page (`CreateInterview.jsx`)
*   **What Changed:**
    *   Introduced the `handleResumeUpload` method to manage file selection, size validation (< 5MB), and API communication.
    *   Added states `resumeFileName` and `isParsingResume` to handle UI loading states.
    *   Modified the `handleStart` validation logic to ensure users have either uploaded a resume or provided a Job Description before proceeding.
    *   *(Source: `frontend/src/pages/CreateInterview.jsx`)*

### 📁 Frontend: UI Adjustments & Cleanup (`Billing.jsx`, `GroupDiscussionSetup.jsx`)
*   **What Changed:**
    *   **Billing Page:** Removed the "Support & Policy" and "Payment Issues" footer completely to streamline the view.
    *   **Text Contrast:** Changed multiple instances of `text-zinc-500` to `text-zinc-400` in both `CreateInterview` and `GroupDiscussionSetup` components to ensure text is more readable against dark backgrounds.
    *   **Status Indicator:** Changed the active camera/mic pulse indicator color from `bg-emerald-500` to the brand color `bg-[#bef264]`.

## 4. Impact & Risk Assessment
*   ⚠️ **Security Risks:** The introduction of file uploads introduces potential risks. However, this is mitigated by the `multer` configuration which strictly enforces a `5MB` size limit and filters for the `application/pdf` MIME type.
*   **Breaking Changes:** None. The previous text-based input logic appears to gracefully coexist with the new upload flow.
*   🧪 **Testing Suggestions:**
    *   **Upload Validation:** Attempt to upload non-PDF files (e.g., `.docx`, `.png`) to verify the frontend and backend properly reject them.
    *   **Size Constraint:** Attempt to upload a PDF larger than 5MB to ensure the `multer` limit correctly triggers an error response.
    *   **Flow Verification:** Start an interview using the "Both" context source (Resume + Job Description) to ensure the parsed PDF text concatenates correctly with the manual JD input.


## 1. High-Level Summary (TL;DR)
*   **Impact:** High - Introduces major new features including skills-based custom interviews, robust code execution with standard input (stdin) support, interview reload protection, and an extensive UI/UX overhaul of the interview dashboard.
*   **Key Changes:**
    *   ✨ **Skills-Based Interviews:** Added support for selecting skills and specifying `interviewMode` (`roleBased` or `skillsBased`), complete with strict backend payload validation.
    *   ✨ **Terminal Stdin Support:** Added a standard input (`stdin`) text area to the Coding Space terminal, allowing candidates to provide input for code execution.
    *   🛡️ **Interview Reload Protection:** Implemented a new React hook and prompt to prevent accidental session reloads (e.g., hitting F5) and potential data loss during live interviews.
    *   🎨 **UI/UX Overhaul:** Completely redesigned session overview cards, control bars, the interviewer section, and transcript views for better readability and responsive design.

## 2. Visual Overview (Code & Logic Map)

```mermaid
graph TD
  subgraph "Backend API"
    R["routes/customInterviewRoutes.js"] -->|"POST /start"| V["validateInterviewPayload"]
    V --> C["customInterviewController.startCustomSession()"]
    C --> M["interviewSessionModel"]
    CE["codingController.executeCode()"]
  end

  subgraph "Frontend Session"
    CIS["CustomInterviewSession.jsx"]
    IS["InterviewSession.jsx"]
    CIS --> RP["ReloadSessionPrompt"]
    IS --> RP
    CIS --> CS["CodingSpace"]
    CS -->|"handleRunCode()"| CE
    CIS --> URP["useInterviewReloadProtection()"]
  end

  subgraph "Interview Dashboard UI"
    CIS --> SOC["SessionOverviewCards"]
    CIS --> CB["ControlBar"]
    CIS --> IV["InterviewerSection"]
    CIS --> TV["TranscriptView"]
    TV --> CTA["CodingTaskAlert"]
  end

  style R fill:#c8e6c9,color:#1a5e20
  style V fill:#c8e6c9,color:#1a5e20
  style C fill:#c8e6c9,color:#1a5e20
  style M fill:#c8e6c9,color:#1a5e20
  style CE fill:#c8e6c9,color:#1a5e20
  
  style CIS fill:#bbdefb,color:#0d47a1
  style IS fill:#bbdefb,color:#0d47a1
  style RP fill:#bbdefb,color:#0d47a1
  style CS fill:#bbdefb,color:#0d47a1
  style URP fill:#bbdefb,color:#0d47a1

  style SOC fill:#fff3e0,color:#e65100
  style CB fill:#fff3e0,color:#e65100
  style IV fill:#fff3e0,color:#e65100
  style TV fill:#fff3e0,color:#e65100
  style CTA fill:#fff3e0,color:#e65100
```

## 3. Detailed Change Analysis

### 🛠️ Interview Creation & Backend Logic
*   **What Changed:** Introduced `interviewMode` (`roleBased` vs `skillsBased`) and tracking for custom/preset skills. Created a robust validation middleware (`validateInterviewPayload.js`) that enforces rules like checking maximum content length (12,000 chars) and ensuring skills are provided if `skillsBased` mode is selected.
*   **Database Schema Changes:** (Source: `interviewSessionModel.js`)

| Field | Type | Default | Description |
|---|---|---|---|
| `userName` | String | `"Candidate"` | Name of the interviewee |
| `interviewMode` | Enum | `"roleBased"` | Mode of interview (`"roleBased"`, `"skillsBased"`) |
| `sourceType` | String | `"resume-job-description"`| Context data source |
| `skills` | `[String]` | `[]` | Array of skill strings for skills-based mode |

*   **API Middleware Updates:** (Source: `customInterviewRoutes.js`)

| Endpoint | Method | Middleware Added | Description |
|---|---|---|---|
| `/start` | POST | `validateInterviewPayload` | Added payload validation before creating the custom session in the DB |

### 💻 Code Execution & Terminal
*   **What Changed:** Upgraded `CodingSpace.jsx` with an `enableTerminalInput` prop. When active, candidates can input standard text (`stdin`) which is packaged and sent to `codingController.js` via the API.
*   **Language Restrictions:** During an active interview, language selection is now disabled, restricting the user to the configured supported languages.

### 🛡️ Interview Reload Protection
*   **What Changed:** Added `useInterviewReloadProtection.js` to intercept window reload events (F5, Ctrl+R, or tab close) during an active interview session.
*   **User Prompt:** Introduced `ReloadSessionPrompt.jsx` to explicitly warn users that reloading will reset their live interview session. 

### 🎨 UI Revamp (Dashboard & Controls)
*   **Session Overview Cards:** (Source: `SessionOverviewCards.jsx`) Completely redesigned from a dark, transparent UI to a solid, high-contrast primary-colored UI layout.
*   **Control Bar:** (Source: `ControlBar.jsx`) Enhanced spacing, padding, responsive behavior (mobile scaling), and added precise hover tooltips.
*   **Interviewer Section:** (Source: `InterviewerSection.jsx`) Added visual overlays indicating connection states ("Connecting Session") and "Interview Tips" while waiting for the transcript to initialize. Included avatar fallbacks for when the user's video is turned off.
*   **Transcript View & Alerts:** (Source: `TranscriptView.jsx`, `CodingTaskAlert.jsx`) Moved the coding popup directly into the transcript view. Added an "Action Disabled" state to prevent users from skipping or attempting challenges while the AI agent is actively speaking.

## 4. Impact & Risk Assessment
*   ⚠️ **Breaking Changes:** 
    *   The new `validateInterviewPayload` middleware introduces strict constraints. Creating an interview with a payload exceeding 12,000 characters or missing required text for a specific `sourceType` will now return a `400 Bad Request`.
*   🐛 **Testing Suggestions:**
    *   **Skills-Based Generation:** Create an interview in "Skills-based" mode, select multiple preset skills, add custom skills, and ensure the prompt correctly populates the database.
    *   **Stdin Execution:** Open a coding task, write a program that requires standard input (e.g., `input()` in Python), provide text in the terminal text area, and click Run.
    *   **Reload Prevention:** Enter a live interview session and attempt to reload the page using F5 or Ctrl+R. Verify that the custom warning prompt appears and prevents the reload until confirmed.
    *   **UI Responsiveness:** Test the `ControlBar` and `SessionOverviewCards` on mobile viewports to verify padding and text truncations.

  Updates on date: 14/04/2026
  ## 1. High-Level Summary (TL;DR)
*   **Impact:** High - Introduces a new feature for saving interview configurations and significantly improves the AI's handling of code submissions and interview flow.
*   **Key Changes:**
    *   **Interview Presets:** Added full CRUD functionality for users to save, manage, and apply interview configuration presets.
    *   **Smart Code Submissions:** Implemented utilities to detect empty or default template code submissions.
    *   **AI Prompt Updates:** Instructed the AI agent to gracefully acknowledge empty/default submissions and move to the next question instead of getting stuck in a loop.
    *   **Session UX Improvements:** Added dedicated confirmation and summary modals for ending interview sessions, plus a typing animation for the AI's transcript.

## 2. Visual Overview (Code & Logic Map)

### Interview Presets Flow
```mermaid
graph TD
    subgraph Frontend
        CreateInterview["CreateInterview.jsx"]
    end
    subgraph Backend API
        Routes["customInterviewRoutes.js"]
        Controller["customInterviewController.js"]
    end
    subgraph Database
        Model["InterviewPreset.js"]
    end
    CreateInterview -- "savePreset()" --> Routes
    CreateInterview -- "handleSelectPreset()" --> CreateInterview
    Routes -- "POST/PUT /presets" --> Controller
    Controller -- "createPreset() / updatePreset()" --> Model

    style CreateInterview fill:#c8e6c9,color:#1a5e20
    style Routes fill:#bbdefb,color:#0d47a1
    style Controller fill:#bbdefb,color:#0d47a1
    style Model fill:#fff3e0,color:#e65100
```

### Smart Code Submission Logic
```mermaid
sequenceDiagram
    participant User as Candidate
    participant Hooks as "useCustomInterview.js / InterviewSession.jsx"
    participant Utils as "codeSubmissionUtils.js"
    participant AI as "AI Controller (Backend)"

    User->>Hooks: "handleCodingSubmit(code)"
    Hooks->>Utils: "analyzeCodeSubmission(code, language)"
    Utils-->>Hooks: "Returns: { isEmpty, isDefault }"
    alt Is Empty or Default
        Hooks->>AI: "Inform AI: submission is empty template"
        AI-->>User: "Gracefully acknowledge and move to next question"
    else Is Valid Code
        Hooks->>AI: "Inform AI: Here is my code"
        AI-->>User: "Evaluate submitted code"
    end
```

## 3. Detailed Change Analysis

### 📁 Interview Presets Feature
*   **What Changed:** Users can now save their configured interview settings (Role, Experience, Duration, Skills, etc.) up to a maximum of 30 presets per user. Applying a preset quickly populates the interview setup form.
*   **API Endpoints Added:**
    | Method | Endpoint | Description |
    | :--- | :--- | :--- |
    | `GET` | `/presets` | Lists all saved presets for the authenticated user. |
    | `POST` | `/presets` | Creates a new preset. |
    | `PUT` | `/presets/:presetId` | Updates an existing preset. |
    | `DELETE` | `/presets/:presetId` | Deletes a specific preset. |

### 📁 Smart Code Submission Handling
*   **What Changed:** Created `codeSubmissionUtils.js` which houses logic to strip comments and whitespace to verify if a code submission is effectively empty or just the default language template.
*   **Frontend Integration:** `handleCodingSubmit` in `useCustomInterview.js` and `InterviewSession.jsx` now uses `analyzeCodeSubmission()` to dynamically alter the message sent to the AI agent and the UI toast notification.
*   **Backend Integration:** Updated the system prompts in `customInterviewController.js` and `vapiInterviewController.js`. The AI is now explicitly instructed: *"If the candidate submits code that is empty... DO NOT ask them to provide code again... Immediately proceed to ask the next technical question."*

### 📁 Session UX & Transcript Updates
*   **What Changed:**
    *   Replaced the inline "Interview Finished" overlay in `InterviewerSection.jsx` with two new dedicated components: `CustomInterviewConfirmEndModal.jsx` and `CustomInterviewEndedModal.jsx`.
    *   Added a character-by-char typing animation (`typedAgentText`) in `TranscriptView.jsx` to make the AI agent's responses feel more natural.

### 📁 Database Schema
*   **New Model:**
    | Field | Type | Default | Description |
    | :--- | :--- | :--- | :--- |
    | `userId` | `ObjectId` | *Required* | Reference to the User. |
    | `name` | `String` | *Required* | Name of the preset. |
    | `interviewMode` | `String` | `"roleBased"` | Either `"roleBased"` or `"skillsBased"`. |
    | `skills` | `[String]` | `[]` | Array of extracted/selected skills. |
    | `duration` | `Number` | `10` | Interview duration (5-120 mins). |

## 4. Impact & Risk Assessment
*   **⚠️ Breaking Changes:** Requires MongoDB schema updates. Ensure the new `InterviewPreset` collection can be created successfully.
*   **🐛 Potential Risks:** The typing animation in `TranscriptView.jsx` uses `setInterval` tied to React state. If the user receives rapidly successive AI messages, the timer cleanup logic must perfectly execute to prevent text overlapping or memory leaks.
*   **🧪 Testing Suggestions:**
    *   **Presets:** Test creating a preset with a duplicate name (should handle HTTP 409 correctly). Test the slider scrolling UI for presets on smaller screens.
    *   **Code Submissions:** Test submitting a blank screen, a screen with only comments (`// this is a comment`), the exact default template, and a legitimate code answer. Verify the AI agent's vocal response correctly matches the prompt instructions for each scenario.
    *   **Session Flow:** Click the "End Interview" button and ensure the new confirmation modal correctly halts the ending process if "Cancel" is clicked.