import { lazy } from "react";
import Loadable from "./Loadable";
import PublicLayout from "../layouts/PublicLayout";

const Homepage = Loadable(lazy(() => import("../pages/Homepage")));
const LandingHome = Loadable(lazy(() => import("../pages/LandingHome")));
const AboutUs = Loadable(lazy(() => import("../pages/AboutUs")));
const Contact = Loadable(lazy(() => import("../pages/Contact")));
const MicTest = Loadable(lazy(() => import("../pages/MicTest")));
const TermsAndConditions = Loadable(lazy(() => import("../pages/TermsAndConditions")));
const PrivacyPolicy = Loadable(lazy(() => import("../pages/PrivacyPolicy")));

export const getPublicRoutes = (backendStatus) => [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Homepage backendStatus={backendStatus} /> },
      { path: "/landing", element: <LandingHome backendStatus={backendStatus} /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/contact", element: <Contact /> },
      { path: "/mic", element: <MicTest /> },
    ],
  },
  { path: "/terms", element: <TermsAndConditions /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
];
