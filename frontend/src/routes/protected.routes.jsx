import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./Loadable";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardOverview = Loadable(
  lazy(() => import("../pages/DashboardOverview"))
);
const Reports = Loadable(lazy(() => import("../pages/Reports")));
const LinkedInOptimisation = Loadable(
  lazy(() => import("../pages/LinkedInOptimisation"))
);
const PricingPage = Loadable(lazy(() => import("../pages/PricingPage")));
const Billing = Loadable(lazy(() => import("../pages/Billing")));
const Referrals = Loadable(lazy(() => import("../pages/Referrals")));
const HelpPage = Loadable(lazy(() => import("../pages/Help")));
const AtsScorer = Loadable(lazy(() => import("../pages/AtsScorer")));
const ResumeBuilder = Loadable(lazy(() => import("../pages/ResumeBuilder")));
const CheckoutPage = Loadable(lazy(() => import("../pages/CheckoutPage")));
const VoiceTest = Loadable(lazy(() => import("../pages/VoiceTest")));
const ProctoringTestPage = Loadable(
  lazy(() => import("../pages/ProctoringTestPage"))
);

// General protected routes wrapped in the Dashboard Sidebar layout
export const dashboardProtectedRoutes = [
  {
    element: <DashboardLayout />,
    children: [
      { path: "/dashboard", element: <DashboardOverview /> },
      { path: "/dashboard/reports", element: <Reports /> },
      {
        path: "/dashboard/interviews",
        element: <Navigate to="/dashboard/reports" replace />,
      },
      {
        path: "/dashboard/gd-interviews",
        element: <Navigate to="/dashboard/reports" replace />,
      },
      { path: "/dashboard/linkedin", element: <LinkedInOptimisation /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/billing", element: <Billing /> },
      { path: "/referrals", element: <Referrals /> },
      { path: "/help", element: <HelpPage /> },

      // Clean tool paths
      { path: "/tools/ats", element: <AtsScorer /> },
      { path: "/tools/resume", element: <ResumeBuilder /> },
      { path: "/tools/resume/:id", element: <ResumeBuilder /> },

      // Legacy fallback tool paths
      { path: "/ats-scorer", element: <AtsScorer /> },
      { path: "/resume-builder", element: <ResumeBuilder /> },
      { path: "/resume-builder/:id", element: <ResumeBuilder /> },
    ],
  },
];

// Standalone protected routes with no sidebar navigation shell
export const standaloneProtectedRoutes = [
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/voices", element: <VoiceTest /> },
  { path: "/proctoring-test", element: <ProctoringTestPage /> },
];
