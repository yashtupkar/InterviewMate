import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: "Aryan Sharma",
    role: "Google SDE Intern",
    content: "The real-time feedback on my posture and confidence during the mock interview was a game-changer. I felt much more prepared for my actual interviews.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan",
    rating: 5,
    verified: true
  },
  {
    name: "Sneha Patel",
    role: "Product Manager at Atlassian",
    content: "PlaceMateAI helped me practice those tricky behavioral questions that usually trip me up. The AI-suggested improvements were spot on and very helpful.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    rating: 5,
    verified: true
  },
  {
    name: "Rohan Gupta",
    role: "Data Scientist at Amazon",
    content: "The variety of interview roles offered is impressive. I could practice for specific data science roles and get feedback tailored to that field.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    rating: 5,
    verified: true
  },
  {
    name: "Ishita Verma",
    role: "UX Designer at Microsoft",
    content: "Being able to review my interview recordings with detailed feedback helped me identify areas for improvement I never would have noticed otherwise.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita",
    rating: 5,
    verified: true
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-20 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary mb-6 uppercase tracking-[0.2em]">
          Success Stories
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Loved by <span className="text-primary italic">thousands</span> of students
        </h2>
        <p className="text-gray-400 max-w-2xl text-lg font-medium leading-relaxed">
          From landing internships to securing high-paying full-time roles at top tech companies.
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((t, idx) => (
          <div key={idx} className="break-inside-avoid bg-[#121214]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-primary/20 transition-all duration-500 group cursor-default shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-primary fill-current" />
                ))}
              </div>
              <Quote size={24} className="text-white/5 group-hover:text-primary/10 transition-colors duration-500" />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">
              "{t.content}"
            </p>

            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-2xl object-cover bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-500 shadow-xl"
                />
                {t.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-[#121214] rounded-full p-0.5">
                    <CheckCircle2 size={14} className="text-primary fill-current" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm group-hover:text-primary transition-colors">{t.name}</h4>
                <p className="text-gray-500 text-[11px] font-black uppercase tracking-wider">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof Footer */}
      <div className="mt-20 flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale contrast-125">
        <span className="text-white font-black text-xl tracking-tighter italic">GOOGLE</span>
        <span className="text-white font-black text-xl tracking-tighter italic">AMAZON</span>
        <span className="text-white font-black text-xl tracking-tighter italic">MICROSOFT</span>
        <span className="text-white font-black text-xl tracking-tighter italic">ADOBE</span>
        <span className="text-white font-black text-xl tracking-tighter italic">UBER</span>
      </div>
    </section>
  );
};

export default Testimonials;
