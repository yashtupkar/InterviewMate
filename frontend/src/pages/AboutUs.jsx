import React, { useEffect } from 'react';
import { Target, Eye, PlayCircle, CheckCircle2, LayoutDashboard, Mic, Users, FileText, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Background from '../components/common/Background';

// Assets
import heroImg from '../assets/about/hero.png';
import founderImg from '../assets/about/team/founder.png';
import gdSimulatorImg from '../assets/about/gd_simulator.png';
import resumeBuilderImg from '../assets/about/resume_builder.png';
import aiHeadImg from '../assets/about/team/ai_head.png';
import leadDevImg from '../assets/about/team/lead_dev.png';

const AboutUs = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const team = [
    { name: "Aryan Sharma", role: "Founder & CEO", image: founderImg, bio: "Visionary behind the platform, dedicated to honest candidate empowerment." },
    { name: "Tanya Verma", role: "Head of AI Engineering", image: aiHeadImg, bio: "Leading the development of ultra-low latency interview simulations." },
    { name: "Rohan Gupta", role: "Fullstack Architecture Lead", image: leadDevImg, bio: "Architecting the seamless, high-performance ecosystem of InterviewMate." }
  ];

  const barHeights = [40, 60, 30, 80, 50, 90, 45, 75, 55, 65];

  return (
    <div className="min-h-screen  text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      <Helmet>
        <title>About Us | InterviewMate - Access to the Future of Preparation</title>
        <meta name="description" content="Experience AI-driven features: intelligent automation, seamless integrations, and real-time insights." />
      </Helmet>

      <Background />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-black text-primary mb-6 uppercase tracking-[0.25em] shadow-[0_0_16px_rgba(190,242,100,0.15)]">
          Real Preparation • No Shortcuts
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tighter leading-[1.08] max-w-4xl">
          We Don't Help You Cheat —{' '}
          <br className="hidden sm:block" />
          We Help You <span className="text-primary italic">Become Unstoppable</span>
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-2xl font-medium leading-relaxed mb-10">
          In a space crowded with shortcuts and cheating tools, we focus on what truly matters —{' '}
          <span className="text-white">practice, performance, and real confidence.</span>
        </p>

        {/* Cinematic frame */}
        <div className="w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] relative group aspect-[16/7]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#09090b] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-[#121214] flex items-center justify-center">
            <img src={heroImg} alt="Hero Background" className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
              <blockquote className="text-lg sm:text-2xl md:text-3xl font-bold italic text-white/90 tracking-tight leading-relaxed max-w-3xl text-center">
                "Because cracking the interview is just the beginning.{' '}
                <br className="hidden sm:block" />
                We prepare you for what comes after — performing with confidence."
              </blockquote>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10" />
        </div>
      </section>

      {/* ── ABOUT TEXT ── */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-1/2 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase">
              🚀 About Us
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              We are building a platform{' '}
              <span className="text-primary italic">designed to transform</span>{' '}
              how candidates prepare.
            </h2>
          </div>
          <div className="md:w-1/2 space-y-4 text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
            <p>Not by helping them bypass the process — but by helping them <span className="text-white">master it.</span></p>
            <p>While many platforms promote quick hacks and unfair advantages, we take a different approach. We believe real success comes from consistent practice, honest feedback, and skill development.</p>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">⚡ What We Offer</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
            Access to the <span className="text-primary italic">future of work.</span>
          </h2>
          <p className="text-gray-500 max-w-xl mt-3 text-sm sm:text-base font-medium">
            Experience AI-driven features: intelligent automation, seamless integrations, and real-time insights.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 sm:gap-6">

          {/* Card 1: AI Mock Interview */}
          <div className="col-span-12 lg:col-span-7 rounded-[2rem] bg-gradient-to-br from-[#bef264] to-[#14c367] border border-white/5 p-8 sm:p-10 overflow-hidden relative group h-[280px] sm:h-[300px]">
            <div className="absolute top-7 left-8 inline-flex items-center px-3 py-1 rounded-full bg-black/25 border border-white/10 text-[10px] font-bold text-white tracking-[0.1em] z-20">
              Live Simulation
            </div>
            <div className="relative z-10 flex flex-col justify-end h-full">
              <div className="mb-4 w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <Mic size={24} className="text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight text-white">
                Real-Time AI <br className="hidden sm:block" /> Mock Interviews
              </h3>
              <p className="text-white/90 max-w-md font-medium text-sm sm:text-base">
                Experience the next level of preparation with our ultra-low latency AI interviewer that responds to your voice in real-time.
              </p>
            </div>
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
              <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50" />
            </div>
          </div>

          {/* Card 2: GD Simulator */}
          <div className="col-span-12 lg:col-span-5 rounded-[2rem] bg-[#161618] border border-white/5 overflow-hidden relative group h-[280px] sm:h-[300px]">
            <img src={gdSimulatorImg} alt="GD Simulator" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10" />
            <div className="absolute top-7 left-8 inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/10 text-[10px] font-bold text-primary tracking-[0.1em] z-20">
              Interactive Teamwork
            </div>
            <div className="absolute bottom-7 left-8 z-20">
              <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight">AI GD Simulator</h3>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Simulate group dynamics in real-time</p>
            </div>
            <div className="absolute top-7 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
               <Users size={24} className="text-primary" />
            </div>
          </div>

          {/* Card 3: ATS Checker & Resume Builder */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-[2rem] bg-[#161618] border border-white/5 overflow-hidden relative group h-[280px]">
            <img src={resumeBuilderImg} alt="Resume Builder" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10" />
            <div className="absolute top-7 right-8 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <FileText size={14} className="text-primary" />
                <div className="text-[10px] font-black text-white">ATS: 92%</div>
              </div>
            </div>
            <div className="absolute bottom-7 left-8 z-20">
              <h3 className="text-xl font-bold text-white mb-1">ATS Checker & Builder</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Craft & Score Your Resume</p>
            </div>
          </div>

          {/* Card 4: Performance */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-[2rem] bg-[#161618] border border-white/5 p-7 flex flex-col justify-between group h-[280px] relative overflow-hidden">
            <div className="flex items-end gap-1.5 h-20">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t-md transition-all duration-500 group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(190,242,100,0.4)]"
                  style={{ height: i === 5 ? '100%' : `${h}%` }}
                />
              ))}
            </div>
            <div>
              <div className="text-2xl font-black text-white mb-0.5">94%</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">User Retention</div>
              <h3 className="text-xl font-bold text-white mb-2">Performance Tracking</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Monitor your growth and improve with every session via real-time data insights.
              </p>
            </div>
          </div>

          {/* Card 5: Community + Company Specifics stacked */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 h-auto lg:h-[280px]">
            {/* Community */}
            <div className="rounded-[2rem] bg-[#1a1a1c] border border-white/10 p-6 flex flex-col justify-center gap-4 group hover:border-primary/30 transition-colors">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#161618] bg-white/10 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#161618] bg-[#bef264] text-black text-[9px] font-black flex items-center justify-center">+10k</div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Community Success</p>
            </div>

            {/* Company Specifics */}
            <div className="rounded-[2rem] bg-[#0c8042] border border-white/5 p-7 relative group overflow-hidden flex flex-col justify-center">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2">Company Specifics</h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Gain insights through built-in question banks from top companies for data-driven preparation.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-3 opacity-20 group-hover:rotate-6 transition-transform duration-500">
                <LayoutDashboard size={80} className="text-black" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: <Target size={28} className="text-primary" />, title: "Our Mission", text: "To empower every candidate with honest, skill-based preparation tools that lead to real career success — not just interview clearance." },
            { icon: <Eye size={28} className="text-primary" />, title: "Our Vision", text: "To redefine interview preparation by creating a world where candidates succeed through ability, confidence, and preparation — not shortcuts." }
          ].map((item, i) => (
            <div key={i} className="p-8 sm:p-10 rounded-[2rem] bg-[#121214] border border-white/5 flex flex-col items-center text-center group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h2 className="text-2xl font-black mb-4">{item.title}</h2>
              <p className="text-gray-400 text-base leading-relaxed font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-black text-primary mb-5 uppercase tracking-[0.2em]">
            Our Founding Team
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Meet <span className="text-primary italic">the team</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div key={index} className="group relative">
              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 bg-[#161618] transition-all duration-500 group-hover:border-primary/20 shadow-xl relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="text-xl font-black text-white tracking-tight">{member.name}</h3>
                  <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1">{member.role}</p>
                  <p className="text-gray-400 text-sm mt-3 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center relative border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-10 tracking-tighter leading-tight">
          We don't believe in{' '}
          <br className="hidden sm:block" />
          <span className="text-primary italic">shortcuts.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          {["We don't support cheating.", "We believe in you — your growth.", "We believe in your future."].map((promise, i) => (
            <div key={i} className="flex items-center gap-3 p-5 rounded-[1.5rem] bg-[#161618] border border-white/5">
              <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base text-left">{promise}</span>
            </div>
          ))}
        </div>

        <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter leading-snug max-w-2xl mx-auto mb-8">
          No hacks. No shortcuts.{' '}
          <br className="hidden sm:block" />
          Just real preparation that gets you hired —{' '}
          <span className="text-primary underline underline-offset-8 decoration-primary/30">and keeps you there.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full sm:w-auto bg-primary hover:brightness-110 text-black px-10 py-4 rounded-[1rem] font-black text-base transition-all active:scale-95 shadow-[0_16px_32px_-8px_rgba(190,242,100,0.35)]"
          >
            Start Real Preparation
          </button>
          <button className="w-full sm:w-auto px-10 py-4 rounded-[1rem] border border-white/10 hover:bg-white/5 text-white font-bold text-base transition-all active:scale-95">
            View Case Studies
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;