import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Background from '../components/common/Background';
import FAQ from '../components/home/FAQ';
import CTA from '../components/home/CTA';
import toast from 'react-hot-toast';
import SocialLinks from '../components/common/SocialLinks';

const Contact = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="text-primary" size={20} />,
      title: "Email",
      details: "support@placemateai.com",
    },
    {
      icon: <MapPin className="text-primary" size={20} />,
      title: "Location",
      details: "MP Nagar, Bhopal, MP, 462003",
    }
  ];

  return (
    <div className="min-h-screen  text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      <Helmet>
        <title>Contact Us | PlaceMateAI - We're Here to Help</title>
        <meta name="description" content="Have questions about PlaceMateAI? Contact our support team for any inquiries, feedback, or assistance with your AI interview preparation." />
      </Helmet>

      <Background />



      {/* ── CONTACT GRID ── */}
      <section className="pb-12 px-4 pt-24 md:pt-32 pb-10 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-6 flex flex-col justify-center">

            {/* Heading */}
            <div className="mb-10">
              <h2 className="text-[#bef264] font-bold tracking-wider uppercase text-xs mb-3">
                Contact Us
              </h2>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Get in Touch <span className="text-primary italic">With Us</span>
              </h2>

              <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
                Have questions or need help? We're here to guide you through your placement journey.
              </p>
            </div>

            {/* Contact Items */}
            <div className="space-y-4 mb-8">
              {contactInfo.map((info, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#121214] border border-white/5 hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition">
                    {info.icon}
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      {info.title}
                    </p>
                    <p className="text-white text-sm font-semibold">
                      {info.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Community Card (Improved) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/50 to-transparent border border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-2">Join Our Community</h3>
                <p className="text-gray-400 text-xs mb-4">
                  Connect with other learners and grow together.
                </p>

                <div className="pt-2">
                  <SocialLinks />
                </div>
              </div>

              <Sparkles size={60} className="absolute -bottom-4 -right-4 text-primary/5 rotate-12" />
            </div>

          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-6">
            <div className="">

              <form onSubmit={handleSubmit} className="space-y-2">

                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 ml-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 ml-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300 ml-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-none"
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-semibold text-sm py-3.5 hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(190,242,100,0.25)] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-8 border-t border-white/5">
        <FAQ />
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-8 border-t border-white/5">
        <CTA />
      </section>

      {/* ── TRUST BADGE ── */}
      <section className="pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {["Secure SSL Encryption", "24/7 Priority Support", "Data Privacy Guaranteed"].map((trust, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161618] border border-white/5">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{trust}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Contact;
