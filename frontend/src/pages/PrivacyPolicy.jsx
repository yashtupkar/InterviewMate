import React from "react";
import { Helmet } from "react-helmet-async";
import Layout from "../components/layouts/layout";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | PriPareAI</title>
      </Helmet>
      <Layout>
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-zinc-300">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#bef264] to-[#00f5a0] bg-clip-text text-transparent mb-2">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-sm mb-8">Last updated: March 17, 2026</p>
          <div className="space-y-6 text-lg leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us (name, email, profile picture) through Clerk authentication and data generated during your interview sessions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>
                We use your data to provide AI feedback, manage subscriptions, and improve our services. Your interview recordings and transcripts are used solely for generating feedback for you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing</h2>
              <p>
                We do not sell your personal data. We share information only with service providers (like Clerk for auth, Vapi for AI) necessary to operate the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
              <p>
                We use cookies to maintain your session and understand how you interact with our site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at support@pripareai.com.
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPolicy;
