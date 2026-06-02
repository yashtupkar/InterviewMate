import React, { useEffect } from 'react';
import { Target, Eye, PlayCircle, CheckCircle2, LayoutDashboard, Mic, Users, FileText, Sparkles, Shield, BarChart2, TrendingUp, Star, ArrowRight, Quote } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Background from '../components/common/Background';

// Assets
import heroImg from '../assets/about/hero.png';
import founderImg from '../assets/about/team/founder.png';
import gdSimulatorImg from '../assets/about/gd_simulator.png';
import resumeBuilderImg from '../assets/about/resume_builder.png';
import aiHeadImg from '../assets/about/team/ai_head.png';
import leadDevImg from '../assets/about/team/lead_dev.png';
import CTA from '../components/home/CTA';

const AboutUs = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const team = [
    { name: "Aryan Sharma", role: "Founder & CEO", image: founderImg, bio: "Visionary behind the platform, dedicated to honest candidate empowerment." },
    { name: "Tanya Verma", role: "Head of AI Engineering", image: aiHeadImg, bio: "Leading the development of ultra-low latency interview simulations." },
    { name: "Rohan Gupta", role: "Full Stack Architect", image: leadDevImg, bio: "Architecting the seamless, high-performance ecosystem of PlaceMateAI." }
  ];

  const barHeights = [40, 60, 30, 80, 50, 90, 45, 75, 55, 65];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 overflow-x-hidden font-sans pb-24 relative z-0">
      <Helmet>
        <title>About Us | PlaceMateAI - Access to the Future of Preparation</title>
        <meta name="description" content="Experience AI-driven features: intelligent automation, seamless integrations, and real-time insights." />
      </Helmet>

      <Background />

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-black text-primary uppercase tracking-[0.25em] shadow-[0_0_16px_rgba(190,242,100,0.15)]">
              REAL PREPARATION • NO SHORTCUTS
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl  tracking-tight leading-[1.1]">
              We Don't Help You Cheat —<br />
              We Help You <span className="text-primary italic">Become Unstoppable.</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base max-w-lg font-medium leading-relaxed">
              In a space crowded with shortcuts and cheating tools, we focus on what truly matters — practice, performance, and real confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t bg-white/10 p-4 rounded-2xl border-white/5">
              <div >
                <Target size={24} className="text-primary mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">Real Preparation</h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">Tools built to help you practice with purpose.</p>
              </div>
              <div>
                <Shield size={24} className="text-primary mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">Honest Advantage</h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">No gimmicks. Just the edge you earn.</p>
              </div>
              <div>
                <BarChart2 size={24} className="text-primary mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">Built for Performance</h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">Optimize your prep. Maximize your results.</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 overflow-hidden relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
              <div className="aspect-[4/3] w-full bg-[#121214] relative group">
                <img src={heroImg} alt="Interview Coach" className="w-full h-full object-cover   transition-transform duration-1000 group-hover:scale-105" />

                {/* Simulated UI Overlay */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 items-end opacity-50 pointer-events-none">
                  <div className="text-[8px] font-bold tracking-[0.2em] text-primary uppercase">Antireview Coach</div>
                  <div className="flex gap-1 items-end h-8">
                    {[30, 50, 40, 70, 60, 80, 50, 90, 70, 100].map((h, i) => (
                      <div key={i} className="w-1.5 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pt-32 pb-8 px-8">
                  <Quote className="text-primary mb-3" size={28} />
                  <blockquote className="text-lg sm:text-xl font-bold text-white leading-relaxed tracking-tight">
                    Because cracking the interview is just the beginning. We prepare you for what comes after — performing with confidence."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT US STATS ── */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-3">
                <Sparkles size={12} /> ABOUT US
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl  tracking-tight leading-snug">
                We are building a platform <br className="hidden md:block" />
                <span className="text-primary italic">designed to transform</span> <br className="hidden md:block" />
                how candidates prepare.
              </h2>
            </div>
            <div className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
              <p className="mb-6">Not by helping them bypass the process — but by helping them <span className="text-white font-bold">master it.</span></p>
              <p>While many platforms promote quick hacks and unfair advantages, we take a different approach. We believe real success comes from consistent practice, honest feedback, and skill development.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users size={20} className="text-primary" />, value: "50K+", label: "Active Learners" },
              { icon: <CheckCircle2 size={20} className="text-primary" />, value: "1M+", label: "Mock Interviews" },
              { icon: <TrendingUp size={20} className="text-primary" />, value: "94%", label: "Users Improve" },
              { icon: <Star size={20} className="text-primary" />, value: "4.9/5", label: "User Rating" }
            ].map((stat, i) => (
              <div key={i} className="bg-[#18181b] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left transition-colors hover:border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-3">
              <Sparkles size={12} /> WHAT WE OFFER
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl  tracking-tight">
              Access to the <span className="text-primary italic">future of work.</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-md text-sm sm:text-base font-medium md:text-right leading-relaxed">
            Experience AI-driven features: intelligent automation, seamless integrations, and real-time insights.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">

          {/* Top Row */}
          <div className="col-span-12 md:col-span-5 rounded-[2rem] bg-gradient-to-br from-[#80c822] to-[#14c367] p-6 lg:p-8 flex flex-col justify-between group relative overflow-hidden min-h-[280px]">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 text-[10px] font-bold text-white tracking-[0.1em] self-start mb-10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>
              Live Simulation
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-white leading-snug">
                Real-Time AI <br /> Mock Interviews
              </h3>
              <p className="text-white/90 text-[13px] sm:text-sm  leading-relaxed max-w-sm mb-6">
                Experience the next level of preparation with our ultra-low latency AI interviewer that responds to your voice in real-time.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors cursor-pointer">
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 rounded-[2rem] bg-[#121214] border border-white/5 p-6 lg:p-8 flex flex-col justify-between group relative overflow-hidden min-h-[280px]">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary tracking-[0.1em] self-start mb-10">
              Interactive Frameworks
            </div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 text-white">
                AI GD Simulator
              </h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm mb-6">
                Simulate group discussions in real-time with dynamic roles and intelligent feedback.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/5 transition-colors cursor-pointer z-10">
              <ArrowRight size={18} />
            </div>
            <img src={gdSimulatorImg} alt="" className="absolute -right-10 -bottom-10 w-64 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700 pointer-events-none" />
          </div>

          <div className="col-span-12 md:col-span-3 rounded-[2rem] bg-[#121214] border border-white/5 p-6 lg:p-8 flex flex-col justify-between group min-h-[280px]">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-gray-300 tracking-[0.1em] self-start mb-6">
              Smart Scoring
            </div>
            <div className="flex items-end gap-1.5 h-16 mb-8 w-full">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/10 rounded-t-sm transition-all duration-500 group-hover:bg-primary/50"
                  style={{ height: i === 7 ? '100%' : `${h}%` }}
                />
              ))}
            </div>
            <div>
              <div className="text-2xl font-black text-white mb-0.5">94%</div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">User Improvement</div>
              <h3 className="text-lg font-bold text-white mb-2">Performance Tracking</h3>
              <p className="text-gray-500 text-xs font-medium leading-relaxed">
                Monitor your growth and improve with every session via real-time data insights.
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="col-span-12 md:col-span-4 bg-[#121214] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">ATS Checker & Builder</h4>
                <p className="text-gray-500 text-[11px] leading-tight pr-4">Craft a resume that gets you past the bots.</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/5 transition-colors">
              <ArrowRight size={14} className="text-white/50" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-[#121214] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Target size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">Company Insights</h4>
                <p className="text-gray-500 text-[11px] leading-tight pr-4">Get AI-powered insights on roles, skills, and top companies.</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/5 transition-colors">
              <ArrowRight size={14} className="text-white/50" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-[#121214] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutDashboard size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">Global Community</h4>
                <p className="text-gray-500 text-[11px] leading-tight pr-4">Join a network of ambitious learners and professionals.</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/5 transition-colors">
              <ArrowRight size={14} className="text-white/50" />
            </div>
          </div>

        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 sm:p-10 rounded-[2rem] bg-[#121214] border border-white/5 flex flex-col sm:flex-row items-start gap-6 group hover:border-primary/20 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Target size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-white">Our Mission</h2>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">To empower every candidate with honest, skill-based preparation tools that lead to real career success — not just interview clearance.</p>
            </div>
          </div>
          <div className="p-8 sm:p-10 rounded-[2rem] bg-[#121214] border border-white/5 flex flex-col sm:flex-row items-start gap-6 group hover:border-primary/20 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Eye size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-white">Our Vision</h2>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">To redefine interview preparation by creating a world where candidates succeed through ability, confidence, and preparation — not shortcuts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ──
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <Sparkles size={12} /> OUR FOUNDING TEAM
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Meet <span className="text-primary italic">the team</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div key={index} className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#121214] aspect-[4/3] sm:aspect-square md:aspect-[4/3]">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-top grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
                  <p className="text-gray-400 text-[11px] font-medium">{member.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="font-bold text-xs">in</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}
      <CTA />

    </div>
  );
};

export default AboutUs;