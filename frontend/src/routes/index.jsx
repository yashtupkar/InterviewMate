import React from "react";
import { useRoutes, Navigate } from "react-router-dom";

// Guards
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";

// Modular Configurations
import { getPublicRoutes } from "./public.routes";
import { blogRoutes } from "./blog.routes";
import { publicQuestionRoutes, protectedQuestionRoutes } from "./question.routes";
import { dashboardInterviewRoutes, standaloneInterviewRoutes } from "./interview.routes";
import { dashboardProtectedRoutes, standaloneProtectedRoutes } from "./protected.routes";
import { adminRoutes, standaloneAdminRoutes } from "./admin.routes";

import Loadable from "./Loadable";
import { lazy } from "react";

const SignInPage = Loadable(lazy(() => import("../pages/SignInPage")));
const SignUpPage = Loadable(lazy(() => import("../pages/SignUpPage")));

export const AppRoutes = ({ backendStatus }) => {
  const routes = [
    // 1. Public Routes
    ...getPublicRoutes(backendStatus),
    ...blogRoutes,
    ...publicQuestionRoutes,

    // 2. Auth Routes (Guests only)
    {
      element: <PublicOnlyRoute />,
      children: [
        { path: "/signin/*", element: <SignInPage /> },
        { path: "/signup/*", element: <SignUpPage /> },
      ],
    },

    // 3. User Protected Routes
    {
      element: <ProtectedRoute />,
      children: [
        ...dashboardProtectedRoutes,
        ...standaloneProtectedRoutes,
        ...protectedQuestionRoutes,
        ...dashboardInterviewRoutes,
        ...standaloneInterviewRoutes,
      ],
    },

    // 4. Admin Standalone Routes
    ...standaloneAdminRoutes,

    // 5. Admin Guarded Routes
    {
      element: <AdminRoute />,
      children: [
        ...adminRoutes,
      ],
    },

    // 6. Global Fallback
    { path: "*", element: <Navigate to="/" replace /> },
  ];

  return useRoutes(routes);
};
