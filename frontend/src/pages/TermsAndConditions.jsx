import React from "react";
import { Helmet } from "react-helmet-async";
import Layout from "../components/layouts/layout";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | PlaceMateAI</title>
      </Helmet>
      <Layout>
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-zinc-300">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#bef264] to-[#00f5a0] bg-clip-text text-transparent mb-2">
            Terms and Conditions
          </h1>
          <p className="text-zinc-500 text-sm mb-8">Last updated: March 17, 2026</p>
          <div className="space-y-6 text-lg leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using PlaceMateAI, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
              <p>
                PlaceMateAI provides AI-powered interview practice, group discussion simulations, and LinkedIn profile optimization tools. We reserve the right to modify or discontinue services at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account information. You must be at least 18 years old or have parental consent to use this platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
              <p>
                All content, logos, and software on PlaceMateAI are the property of PlaceMateAI or its licensors and are protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Limitation of Liability</h2>
              <p>
                PlaceMateAI is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Changes to Terms</h2>
              <p>
                We may update these terms periodically. Your continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TermsAndConditions;
