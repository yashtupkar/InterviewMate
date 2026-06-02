import { lazy } from "react";
import Loadable from "./Loadable";
import DashboardLayout from "../layouts/DashboardLayout";

const CreateInterview = Loadable(lazy(() => import("../pages/CreateInterview")));
const InterviewResult = Loadable(lazy(() => import("../pages/InterviewResult")));
const CustomInterviewSession = Loadable(
  lazy(() => import("../pages/CustomInterviewSession"))
);
const InterviewSession = Loadable(lazy(() => import("../pages/InterviewSession")));
const GroupDiscussionSetup = Loadable(
  lazy(() => import("../pages/GroupDiscussionSetup"))
);
const GroupDiscussionResult = Loadable(
  lazy(() => import("../pages/GroupDiscussionResult"))
);
const GroupDiscussionSession = Loadable(
  lazy(() => import("../pages/GroupDiscussionSession"))
);

// Routes requiring the Dashboard sidebar/layout shell
export const dashboardInterviewRoutes = [
  {
    element: <DashboardLayout />,
    children: [
      { path: "/interview/setup", element: <CreateInterview /> },
      { path: "/interview/result/:sessionId", element: <InterviewResult /> },
      { path: "/gd/setup", element: <GroupDiscussionSetup /> },
      { path: "/gd/result/:sessionId", element: <GroupDiscussionResult /> },
    ],
  },
];

// Fullscreen standalone session routes (no navigation shell)
export const standaloneInterviewRoutes = [
  // Clean new production URLs
  { path: "/interviews/:sessionId", element: <CustomInterviewSession /> },
  { path: "/group-discussions/:sessionId", element: <GroupDiscussionSession /> },

  // Backward-compatible fallback URLs
  { path: "/session", element: <InterviewSession /> },
  { path: "/session/:sessionId", element: <InterviewSession /> },
  { path: "/session-custom", element: <CustomInterviewSession /> },
  { path: "/session-custom/:sessionId", element: <CustomInterviewSession /> },
  { path: "/gd/session/:sessionId", element: <GroupDiscussionSession /> },
];
