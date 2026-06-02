import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "../components/layouts/layout";

const PublicLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PublicLayout;
