import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Hero from "../components/home/Hero";
import Steps from "../components/home/Steps";
import Features from "../components/home/Features";
import Roles from "../components/home/Roles";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import CTA from "../components/home/CTA";
import PricingSection from "../components/home/PricingSection";
import Background from "../components/common/Background";

const Homepage = ({ backendStatus }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <title>PlaceMateAI | AI Interview Practice</title>
      </Helmet>
      <div className="min-h-screen  overflow-x-hidden selection:bg-indigo-500/30">
        <Background />

        <Hero backendStatus={backendStatus} />
        <Steps />
        <Features />
        <Roles />
        <PricingSection />
        <Testimonials />
        <FAQ />
        <CTA />
      </div>
    </>
  );
};

export default Homepage;
