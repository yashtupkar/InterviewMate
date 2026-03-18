import React from "react";
import { Helmet } from "react-helmet-async";
import Hero from "../components/home/Hero";
import Steps from "../components/home/Steps";
import Features from "../components/home/Features";
import Roles from "../components/home/Roles";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import CTA from "../components/home/CTA";
import Aurora from "../reactbits/Aurora";

const Homepage = ({ backendStatus }) => {
  return (
    <>
      <Helmet>
        <title>PlaceMateAI | AI Interview Practice</title>
      </Helmet>
      <div className="min-h-screen  overflow-x-hidden selection:bg-indigo-500/30">
      {/* Fixed Aurora Background for the entire page */}
      <div className="fixed inset-0 z-[-10] pointer-events-none bg-background">
        <div className="absolute inset-0 opacity-80">
          <Aurora
            colorStops={["#00f5a0", "#7af298", "#00d9ff"]}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>

      <Hero backendStatus={backendStatus} />
      <Steps />
      <Features />
      <Roles />
      <Testimonials />
      <FAQ />
      <CTA />
      </div>
    </>
  );
};

export default Homepage;
