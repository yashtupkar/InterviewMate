# Plan for Usage-Based Question Restriction

This plan outlines the steps to implement a usage-based free limit for unauthenticated users, allowing them to view a set number of questions before requiring them to log in.

## 1. Goal
Allow unauthenticated users to view a limited number of unique questions (e.g., 3) for free. After the limit is reached, require them to log in or sign up to view more question details.

## 2. Implementation Strategy
This approach will be handled entirely on the **frontend**, using the browser's local storage to track question views. No backend changes are required.

## 3. Frontend Implementation Plan

### A. Create a View Tracking Context
- **File**: `frontend/src/context/QuestionViewContext.jsx` (New File)
- **Action**:
  - Create a new React Context to manage the free question view count.
  - The context will provide:
    - `viewedQuestions`: An array of question IDs that the user has viewed.
    - `canViewQuestion(questionId)`: A function that returns `true` if the user has free views left or has already viewed this specific question. It returns `false` if the free limit is exceeded.
    - `addQuestionView(questionId)`: A function to add a new, unique question ID to the `viewedQuestions` array in local storage.

### B. Integrate the Context
- **File**: `frontend/src/App.jsx`
- **Action**: Wrap the application's routes (specifically the question bank section) with the `QuestionViewProvider`.

### C. Update the Question Detail Page
- **File**: `frontend/src/pages/QuestionBank/QuestionDetail.jsx`
- **Action**:
  - Use the `useAuth` hook to check if the user is signed in.
  - If the user is **NOT signed in**:
    1.  On component mount, call `canViewQuestion(id)` from the context.
    2.  If it returns `true`, call `addQuestionView(id)` and render the full question content normally.
    3.  If it returns `false`, do **not** show the question content. Instead, display a prominent **"You've reached your free limit"** CTA section.
  - The CTA section should contain a "Login / Sign Up to Continue" button that redirects to the sign-in page.

## 4. Proposed User Flow
1.  An **unauthenticated user** visits the Question Bank.
2.  They click on their **first** question. The content is visible. The question's ID is saved to their browser's local storage.
3.  They view **two more unique** questions. The content is visible for both, and the IDs are added to local storage.
4.  When they attempt to view a **fourth unique** question, the detail page checks local storage, sees the limit of 3 has been reached, and hides the content.
5.  A message appears: "You've viewed 3 free questions. Please log in to unlock all questions."
6.  The user clicks the login button, signs in, and is redirected back to the question they were trying to view, which is now fully unlocked.
7.  As a logged-in user, the free view limit no longer applies.

## 5. Next Steps
1.  Create the `QuestionViewContext.jsx` file and implement the tracking logic.
2.  Wrap the application routes in `App.jsx` with the new provider.
3.  Modify the `QuestionDetail.jsx` page to conditionally render content based on the context's logic.
