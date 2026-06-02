import { lazy } from "react";
import Loadable from "./Loadable";
import PublicLayout from "../layouts/PublicLayout";

const BlogList = Loadable(lazy(() => import("../pages/Blog/BlogList")));
const BlogDetail = Loadable(lazy(() => import("../pages/Blog/BlogDetail")));

export const blogRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/blog", element: <BlogList /> },
      { path: "/blog/:slug", element: <BlogDetail /> },
    ],
  },
];
