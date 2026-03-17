import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    { title: "Landed my FAANG Job", body: "The mock interviews felt incredibly real. I was less nervous during the actual rounds and the system design feedback was spot on.", name: "Sarah T.", role: "SDE II" },
    { title: "Brilliant GD Practice", body: "The varied AI agent personas helped me tackle dominant and passive participants with ease. It's the best way to practice GDs.", name: "Rahul K.", role: "MBA Intern" },
    { title: "LinkedIn Boosted", body: "After generating and applying the AI's LinkedIn suggestions, my inbound recruiter messages shot up by 2x in a month.", name: "Alex R.", role: "Product Manager" },
    { title: "Unreal accuracy", body: "System design questions and follow-ups from the AI feel like they are coming from real senior engineers at top firms.", name: "Maria L.", role: "Backend Eng" },
    { title: "Best prep platform", body: "No delays, voice mode is snappy, and the post-interview scoring gives highly actionable feedback you can actually use.", name: "James W.", role: "Data Scientist" }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
      <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-primary mb-6 uppercase tracking-wider font-bold">
        Trusted Results
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 text-white max-w-2xl">
        See What Our Candidates <br /> Are Saying
      </h2>
      <p className="text-gray-400 text-center max-w-xl mb-16 text-lg">
        Thousands of job seekers have accelerated their career and landed their dream offers confidently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full auto-rows-[1fr]">
        {reviews.map((rev, idx) => (
          <div key={idx} className={`bg-[#121214] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-colors shadow-2xl ${idx === 3 || idx === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}>
            <div className="mb-8">
              <h4 className="text-white font-bold text-xl mb-3">{rev.title}</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">"{rev.body}"</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/30">
                  {rev.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold">{rev.name}</span>
                  <span className="text-gray-500 text-xs font-medium">{rev.role}</span>
                </div>
              </div>
              <div className="flex text-primary gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
