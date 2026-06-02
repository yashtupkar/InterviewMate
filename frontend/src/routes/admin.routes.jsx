import { lazy } from "react";
import Loadable from "./Loadable";
import AdminLayout from "../layouts/AdminLayout";

const AdminDashboard = Loadable(lazy(() => import("../pages/admin/AdminDashboard")));
const AdminLogin = Loadable(lazy(() => import("../pages/admin/AdminLogin")));
const UserManagement = Loadable(lazy(() => import("../pages/admin/UserManagement")));
const UserDetail = Loadable(lazy(() => import("../pages/admin/UserDetail")));
const SubscriptionManagement = Loadable(
  lazy(() => import("../pages/admin/SubscriptionManagement"))
);
const FeedbackManagement = Loadable(
  lazy(() => import("../pages/admin/FeedbackManagement"))
);
const ContactManagement = Loadable(
  lazy(() => import("../pages/admin/ContactManagement"))
);
const WaitlistManagement = Loadable(
  lazy(() => import("../pages/admin/WaitlistManagement"))
);
const QuestionManagement = Loadable(
  lazy(() => import("../pages/admin/QuestionManagement"))
);
const InterviewAnalysis = Loadable(
  lazy(() => import("../pages/admin/InterviewAnalysis"))
);
const ToolAnalysis = Loadable(lazy(() => import("../pages/admin/ToolAnalysis")));
const SeedQuestions = Loadable(
  lazy(() => import("../pages/adminScreens/SeedQuestions"))
);
const BlogManagement = Loadable(
  lazy(() => import("../pages/adminScreens/BlogManagement"))
);

// Admin routes wrapped under AdminRoute and AdminLayout
export const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/users", element: <UserManagement /> },
      { path: "/admin/users/:userId", element: <UserDetail /> },
      { path: "/admin/subscriptions", element: <SubscriptionManagement /> },
      { path: "/admin/feedback", element: <FeedbackManagement /> },
      { path: "/admin/contacts", element: <ContactManagement /> },
      { path: "/admin/waitlist", element: <WaitlistManagement /> },
      { path: "/admin/questions", element: <QuestionManagement /> },
      { path: "/admin/interviews", element: <InterviewAnalysis /> },
      { path: "/admin/analytics", element: <ToolAnalysis /> },
      { path: "/admin/seed-questions", element: <SeedQuestions /> },
      { path: "/admin/blogs", element: <BlogManagement /> },
    ],
  },
];

// Standalone admin routes (like Login) that don't need AdminLayout
export const standaloneAdminRoutes = [
  { path: "/admin/login", element: <AdminLogin /> },
];
