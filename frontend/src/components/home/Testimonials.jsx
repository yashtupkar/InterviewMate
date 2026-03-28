import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Jillie Bernard",
    role: "Founder & CEO",
    content: "InterviewMate has revolutionized my preparation process. Its intuitive interface and robust features save me so much time, allowing me to focus on my skills rather than stressing about the format. It's like having an extra pair of hands!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jillie1",
    rating: 5,
  },
  {
    name: "David Miller",
    role: "Lead Software Engineer",
    content: "The best interview prep tool I've used. InterviewMate is a game-changer for engineering candidates. It's intuitive and powerful features have drastically improved my technical responses.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
  },
  {
    name: "Jillie Bernard",
    role: "Founder & CEO",
    content: "Absolutely love InterviewMate! The clean design and ease of use are unmatched. The intuitive interface simplifies complex tasks, making it perfect for both beginners and seasoned professionals. A game-changer in digital prep!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jillie2",
    rating: 5,
  },
  {
    name: "David Miller",
    role: "Lead Software Engineer",
    content: "The best UI kit I've used for Framer. InterviewMate is a game-changer for designers. Its intuitive interface and powerful features have drastically improved my workflow, allowing me to focus more on creativity and less on tedious tasks. It's a game-changer that saves me so much time!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David2",
    rating: 5,
  },
  {
    name: "Jillie Bernard",
    role: "Founder & CEO",
    content: "InterviewMate has revolutionized my design process. It's intuitive and saves me so much time!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jillie3",
    rating: 5,
  },
  {
    name: "Jillie Bernard",
    role: "Director of Sales",
    content: "Absolutely love InterviewMate! The clean design and ease of use are unmatched.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jillie4",
    rating: 5,
  },
  {
    name: "Aryan Sharma",
    role: "Google SDE Intern",
    content: "The real-time feedback on my posture and confidence during the mock interview was a game-changer. I felt much more prepared for my actual interviews.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "Product Manager at Atlassian",
    content: "InterviewMate helped me practice those tricky behavioral questions that usually trip me up. The AI-suggested improvements were spot on and very helpful.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    rating: 5,
  },
  {
    name: "Rohan Gupta",
    role: "Data Scientist at Amazon",
    content: "The variety of interview roles offered is impressive. I could practice for specific data science roles and get feedback tailored to that field.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 px-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-[#bef264] font-bold tracking-wider uppercase text-xs mb-3">
            Testimonials
          </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
What people are saying about us          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8">
            Hear from our incredible customers who are building at lightning speed.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="break-inside-avoid bg-[#1a1a1b] border border-white/5 rounded-3xl p-4 hover:border-white/10 transition-all duration-300 group shadow-lg flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-[#facc15] fill-[#facc15]" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed mb-8 font-medium">
                {t.content}
              </p>

              {/* User Profile */}
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover bg-white/5"
                />
                <div>
                  <h4 className="text-white font-bold text-base leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-gray-500 text-sm font-medium">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

