import { lazy } from "react";
import Loadable from "./Loadable";
import PublicLayout from "../layouts/PublicLayout";

const QuestionBankDashboard = Loadable(
  lazy(() => import("../pages/QuestionBank/QuestionBankDashboard"))
);
const QuestionBankList = Loadable(
  lazy(() => import("../pages/QuestionBank/QuestionBankList"))
);
const QuestionDetail = Loadable(
  lazy(() => import("../pages/QuestionBank/QuestionDetail"))
);
const QuestionCodePage = Loadable(
  lazy(() => import("../pages/QuestionBank/QuestionCodePage"))
);

// Public-facing Question Bank routes
export const publicQuestionRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/interview-questions", element: <QuestionBankDashboard /> },
      { path: "/questions", element: <QuestionBankDashboard /> }, // Duplicate fallback
      { path: "/interview-questions/:domain", element: <QuestionBankList /> },
      { path: "/questions/list", element: <QuestionBankList /> }, // Duplicate fallback
      { path: "/interview-question/:skills/:questionId", element: <QuestionDetail /> },
    ],
  },
];

// Protected Coding Space routes
export const protectedQuestionRoutes = [
  { path: "/interview-question/:skills/:questionId/code", element: <QuestionCodePage /> },
  { path: "/interview-question/:skills/:questionId/code-space", element: <QuestionCodePage /> },
  { path: "/code-space", element: <QuestionCodePage /> },
  { path: "/code", element: <QuestionCodePage /> },
];
