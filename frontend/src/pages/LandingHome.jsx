import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import { 
  Play, 
  Star, 
  UserPlus, 
  Mic, 
  TrendingUp, 
  ChevronRight,
  CheckCircle2, 
  PlayCircle, 
  Users, 
  BarChart, 
  FileText, 
  BookOpen,
  Plus, 
  Minus, 
  Sparkles,
  ArrowRight,
  Rocket,
  Quote
} from "lucide-react";
import { FiCheck, FiZap, FiStar, FiPlus, FiLoader } from "react-icons/fi";

// Components that are still needed as external (modal)
import useRazorpay from '../hooks/useRazorpay';
import PaymentStatusModal from '../components/modals/PaymentStatusModal';
import PaymentStatusContent from '../components/common/PaymentStatusContent';
import Background from '../components/common/Background';
import WaitlistSection from '../components/home/WaitlistSection';

const LandingHome = ({ backendStatus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  
  const [openIndex, setOpenIndex] = useState(null);
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const [currentBadge, setCurrentBadge] = useState(0);
  const badges = [
    { emoji: "🔥", text: "Launching Soon" },
    { emoji: "🤖", text: "AI Mock Interviews" },
    { emoji: "💬", text: "AI Group Discussions" },
    { emoji: "📝", text: "AI Resume Builder" },
    { emoji: "🚀", text: "Honest Preparation" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBadge((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Pricing Logic
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentTier, setCurrentTier] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const fetchTier = useCallback(async () => {
      if (!isSignedIn) return;
      try {
          const token = await getToken();
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentTier(res.data.tier);
      } catch {
          // Non-critical
      }
  }, [getToken, isSignedIn]);

  useEffect(() => { fetchTier(); }, [fetchTier]);

  const { isLoading: paymentLoading } = useRazorpay();

  const onPlanSelect = isSignedIn ? (planId) => {
    setLoadingPlanId(planId);
    navigate(`/checkout?planId=${planId}&redirectBack=${window.location.pathname}`);
  } : null;

  useEffect(() => {
    if (location.hash === "#pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  // --- DATA ---
  const steps = [
    {
      icon: <UserPlus size={28} />,
      num: "01",
      title: "Create Free Account",
      desc: "Sign up instantly and set up your profile with your target roles and experience level.",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400"
    },
    {
      icon: <Mic size={28} />,
      num: "02",
      title: "Practice with AI",
      desc: "Engage in realistic voice-based mock interviews or group discussions tailored to you.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: <TrendingUp size={28} />,
      num: "03",
      title: "Review & Improve",
      desc: "Get detailed analytics, actionable feedback, and AI-driven insights to ace the real one.",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400"
    }
  ];

  const featuresList = [
    {
      subtitle: "INTERVIEW PREPARATION",
      title: "AI Mock Interviews",
      description: "Experience zero-latency conversations with AI personas that mirror real interviewers. Our models analyze your tone, pace, and content to adapt their questioning strategy on the fly.",
      bullets: [
        "Adaptive questioning based on your narrative arc.",
        "Real-time stress level assessment."
      ],
      icon: PlayCircle,
      reverse: false
    },
    {
      subtitle: "COLLABORATIVE DYNAMICS",
      title: "AI GD Simulator",
      description: "Practice collaborative problem-solving with multiple AI personas simulating a real group dynamic. Master the subtle cues of conversation flow, interruption management, and consensus building.",
      bullets: [
        "Realistic multi-participant simulations.",
        "Conflict resolution and leadership tracking."
      ],
      icon: Users,
      reverse: true
    },
    {
      subtitle: "DEEP ANALYTICS",
      title: "AI Expert Feedback",
      description: "Stop guessing where you went wrong. Our engine provides a line-by-line breakdown of your responses, identifying power words, confidence gaps, and missed opportunities.",
      bullets: [
        "Visual heatmap of vocal confidence.",
        "Industry-standard STAR method optimization."
      ],
      icon: BarChart,
      reverse: false
    },
    {
      subtitle: "CAREER FOUNDATION",
      title: "Resume Builder",
      description: "Craft a professional, ATS-friendly resume from scratch. Our AI evaluates job descriptions to provide tailored bullet point suggestions and structural optimizations.",
      bullets: [
        "Guaranteed ATS compliance scores.",
        "Smart keyword optimization for your industry."
      ],
      icon: FileText,
      reverse: true
    },
    {
      subtitle: "KNOWLEDGE REPOSITORY",
      title: "Interview Question Bank",
      description: "Access a massive repository of company-specific and role-specific interview questions. Each question comes with AI-generated model answers and detailed evaluation rubrics.",
      bullets: [
        "FAANG-level technical deep dives.",
        "Role-specific behavioral question sets."
      ],
      icon: BookOpen,
      reverse: false
    }
  ];

  const plans = [
    {
      name: "Student Flash",
      monthlyPlanId: "student_flash_monthly",
      yearlyPlanId: "student_flash_yearly",
      monthlyPrice: "199",
      yearlyPrice: "1,999",
      credits: "200 Credits",
      description: "Perfect for a quick preparation boost.",
      features: [
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "Expert AI Feedback",
        "Practice Coding Problems",
        "24/7 AI Mentor Access",
      ],
      recommended: false,
    },
    {
      name: "Placement Pro",
      monthlyPlanId: "placement_pro_monthly",
      yearlyPlanId: "placement_pro_yearly",
      monthlyPrice: "499",
      yearlyPrice: "4,999",
      credits: "600 Credits",
      description: "Complete package for serious job seekers.",
      features: [
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "Expert AI Feedback",
        "LinkedIn & Resume Tools",
        "Priority AI Processing",
        "Career Analytics Pro",
        "Advanced Flash 2.0 AI",
      ],
      recommended: true,
    },
    {
      name: "Infinite Elite",
      monthlyPlanId: "infinite_elite_monthly",
      yearlyPlanId: "infinite_elite_yearly",
      monthlyPrice: "899",
      yearlyPrice: "8,999",
      credits: "1,200 Credits",
      description: "The ultimate unlimited preparation experience.",
      features: [
        "Mock Interviews (10 Credits)",
        "GD Sessions (8 Credits)",
        "LinkedIn & Resume Pro",
        "WhatsApp Career Support",
        "Early Access to Features",
        "Expert AI Mock Reviews",
      ],
      recommended: false,
    },
    {
      name: "Free",
      monthlyPlanId: null,
      yearlyPlanId: null,
      monthlyPrice: "0",
      yearlyPrice: "0",
      credits: "30 Credits",
      description: "Get started with PlaceMateAI.",
      features: [
        "Mock Interviews (10 Credits)", 
        "GD Sessions (8 Credits)", 
        "Basic Feedback", 
        "Practice Coding Problems"
      ],
      recommended: false,
    },
  ];

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

  const faqsData = [
    { 
      q: "What types of AI capabilities does your platform offer?", 
      a: "Our platform features state-of-the-art AI for real-time voice interview simulation, detailed performance analytics, automated resume parsing/scoring, and intelligent group discussion agents with distinct personas." 
    },
    { 
      q: "How does your platform ensure data privacy and security?", 
      a: "We prioritize your data security with end-to-end encryption for all sessions. Your audio and personal data are never used to train global models without explicit consent, and we comply with industry-standard privacy regulations." 
    },
    { 
      q: "Can your platform integrate with our existing software systems?", 
      a: "Yes, we offer flexible API integrations for enterprise partners, allowing you to sync interview results and candidate scores directly with your ATS or HRM systems." 
    },
    { 
      q: "What kind of support and training do you provide to users?", 
      a: "We offer comprehensive onboarding materials, 24/7 technical support, and detailed guides for every feature. Premium users also get access to dedicated account managers for personalized coaching strategies." 
    },
    { 
      q: "How scalable is your platform as our business grows?", 
      a: "PlaceMateAI is built on a cloud-native architecture that scales horizontally. Whether you're a single user or an enterprise conducting thousands of interviews daily, our system handles the load with sub-500ms latency." 
    },
    { 
      q: "Is there a trial period or demo available before committing to a subscription?", 
      a: "Absolutely! We offer a generous free tier that includes basic interview practice and resume scoring. You can also request a personalized demo to explore our advanced enterprise features." 
    }
  ];

  const getPlanId = (plan) =>
    billingCycle === "yearly" ? plan.yearlyPlanId : plan.monthlyPlanId;

  const isCurrentPlan = (plan) => currentTier && plan.name === currentTier;
  const isFree = (plan) => plan.name === "Free";

  const getButtonLabel = (plan) => {
    if (isFree(plan)) return "Always Free";
    if (isCurrentPlan(plan)) return "✓ Current Plan";
    return `Get ${plan.name}`;
  };

  const handlePlanClick = (plan) => {
    const planId = getPlanId(plan);
    if (!planId || isFree(plan)) return;
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  return (
    <>
      <Helmet>
        <title>PlaceMateAI | Single Page Home</title>
      </Helmet>
      
      <div className="min-h-screen overflow-x-hidden selection:bg-indigo-500/30 text-white font-sans bg-[#080808]">
        
        {/* Background Component */}
        <Background />

        {/* Hero Section Code */}
        <section className="relative w-full pt-32 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">
          <div key={currentBadge} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#121214] border border-white/5 mb-8 shadow-2xl group cursor-default animate-in fade-in slide-in-from-top-2 duration-500">
            <span className="text-lg animate-pulse duration-1000">{badges[currentBadge].emoji}</span>
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
              {badges[currentBadge].text}
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-medium tracking-tighter max-w-5xl leading-[1.05] mb-8 text-white drop-shadow-2xl">
            Become <span className="italic text-[#bef264]">Unstoppable</span> — <br className="hidden md:block"/>
            Crack Your <span className="italic">Dream Job</span> with AI
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mb-12 leading-relaxed px-4 font-normal tracking-wide">
            Our end-to-end AI solution enhances your placement journey with advanced artificial intelligence, <span className="text-white/80">streamlining everything from Resume Building to Mock Interviews</span> and driving career success.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full justify-center px-4 mb-16">
            <SignedOut>
              <Link to="/signup" className="w-full sm:w-auto">
                <button className="px-4 py-3 w-full rounded-xl bg-[#bef264] text-black font-bold text-sm hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
                  Start Practicing Free
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <button className="px-4 py-3 w-full rounded-xl bg-[#bef264] text-black font-bold text-sm hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(190,242,100,0.3)] border-none">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
            
            <a href="#features" className="px-4 py-3 w-full sm:w-auto rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group">
              <Play size={18} className="text-[#bef264] group-hover:scale-110 transition-transform" />
              See How It Works
            </a>
          </div>

          <div className="rounded-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-6xl border-y border-[#bef264] shadow-[0_0_150px_-30px_rgba(190,242,100,0.45)] mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#bef264]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-2xl" />
            <img
              src="/assets/homePageAssets/heroImg.png"
              alt="Platform Preview"
              className="w-full h-full object-cover rounded-2xl relative z-10"
              loading="lazy"
            />
          </div>

          <div className="mt-12 flex items-center gap-2 text-sm text-gray-500 font-medium z-10 relative bg-[#09090b]/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full ${backendStatus?.includes("online") || backendStatus?.includes("running") ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}></span>
            System API Status: {backendStatus || "Checking..."}
          </div>
        </section>

        {/* Steps Section Code */}
        <section className="py-32 px-6 max-w-7xl mx-auto relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#bef264]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="flex flex-col items-center mb-20">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#bef264]/20 bg-[#bef264]/5 text-[10px] font-black text-[#bef264] mb-6 uppercase tracking-[0.2em]">
              Workflow
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-center text-white mb-6 tracking-tight">
              How it <span className="text-[#bef264] italic">works</span>
            </h2>
            <p className="text-gray-400 text-center max-w-2xl text-lg font-medium leading-relaxed">
              Our AI-driven process is designed to take you from preparation to placement
              with minimum friction and maximum results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="group relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 w-8 h-[2px] bg-gradient-to-r from-gray-800 to-transparent z-0" />
                )}

                <div className="relative bg-[#121214]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 hover:border-[#bef264]/30 transition-all duration-500 hover:translate-y-[-8px] shadow-2xl overflow-hidden">
                  <div className="absolute -top-6 -right-6 text-9xl font-black text-white/[0.03] group-hover:text-[#bef264]/05 transition-colors duration-500 pointer-events-none italic">
                    {step.num}
                  </div>

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border border-white/10 flex items-center justify-center mb-8 shadow-inner relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <div className={step.iconColor}>
                      {step.icon}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#bef264] text-xs font-black tracking-widest uppercase">Step {step.num}</span>
                      <div className="h-[1px] w-8 bg-[#bef264]/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#bef264] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bef264]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section Code */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-full max-w-[1000px] h-[500px] bg-[#bef264]/5 blur-[120px] rounded-full -z-10 -translate-x-1/2 -translate-y-1/2" />

          <div className="flex flex-col items-center mb-24 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#bef264]/20 bg-[#bef264]/5 text-[10px] font-black text-[#bef264] mb-6 uppercase tracking-[0.2em]">
              Core Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
              Everything you need to <span className="text-[#bef264]">break through</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
              Powerful AI-driven tools engineered to give you the edge in today's competitive job market.
            </p>
          </div>

          <div className="w-full space-y-32">
            {featuresList.map((feature, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${feature.reverse ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-6 w-full">
                  <div className="text-[10px] font-black text-[#bef264] uppercase tracking-[0.2em]">{feature.subtitle}</div>
                  <h3 className="text-3xl md:text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                  <ul className="space-y-4 pt-4">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-black fill-[#bef264] shrink-0 mt-0.5" /> 
                        <span className="text-[15px] font-medium text-gray-300">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 w-full">
                  <div className="aspect-[4/3] md:aspect-video bg-[#0d0d0f] border border-white/5 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                      {<feature.icon size={28} className="text-gray-500 group-hover:text-white transition-colors duration-500" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section Code */}
        <section id="pricing" className="py-16 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-[#bef264] font-bold tracking-wider uppercase text-xs mb-3">
                Pricing &amp; Plans
              </h2>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                Elevate your performance.
              </h3>
              <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8">
                Discover our flexible pricing plans designed to meet the needs of students, job seekers, and professionals.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-zinc-800 ring-1 ring-white/10"
                  role="switch"
                  aria-checked={billingCycle === "yearly"}
                >
                  <span
                    style={{ transform: billingCycle === "yearly" ? "translateX(20px)" : "translateX(0px)" }}
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-[#bef264] shadow ring-0 transition-transform duration-200 ease-in-out"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${billingCycle === "yearly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Yearly
                  </button>
                  <span 
                    onClick={() => setBillingCycle("yearly")}
                    className="bg-[#bef264]/10 text-[#bef264] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-[#bef264]/20 animate-pulse cursor-pointer"
                  >
                    Save 20%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-[1.5rem] flex flex-col ${plan.name === "Free" && "col-span-3 md:col-span-1 hidden"} transition-all duration-300 hover:translate-y-[-4px] ${
                    plan.recommended
                      ? "bg-[#121214] border-2 border-[#bef264] shadow-[0_0_40px_rgba(190,242,100,0.1)] scale-105 z-20"
                      : "bg-[#121214] border border-white/5 shadow-xl"
                  }`}
                >
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                    <p className="text-zinc-400 text-xs h-10 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        ₹{billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                    <div className="mt-1 text-[#bef264] text-[11px] font-black uppercase tracking-[0.1em] px-2 py-0.5 bg-[#bef264]/10 rounded-md w-fit">
                      {plan.credits}
                    </div>
                  </div>

                  {isSignedIn ? (
                    <button
                      onClick={() => handlePlanClick(plan)}
                      disabled={loadingPlanId === getPlanId(plan) || isCurrentPlan(plan)}
                      className={`w-full py-3 rounded-lg font-bold text-center mb-6 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 ${
                        isCurrentPlan(plan)
                        ? "bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed"
                        : plan.recommended
                        ? "bg-[#bef264] text-black hover:bg-[#d9ff96]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      } disabled:opacity-60`}
                    >
                      {loadingPlanId === getPlanId(plan) ? (
                        <FiLoader className="animate-spin w-4 h-4" />
                      ) : null}
                      {getButtonLabel(plan)}
                    </button>
                  ) : (
                    <Link
                      to="/signup"
                      className={`w-full py-3 rounded-lg font-bold text-center mb-6 transition-all active:scale-[0.98] text-sm ${
                        plan.recommended
                        ? "bg-[#bef264] text-black hover:bg-[#d9ff96]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      Get {plan.name}
                    </Link>
                  )}

                  <ul className="space-y-3 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-400">
                        <FiCheck className="w-4 h-4 text-[#bef264] flex-shrink-0" />
                        <span className="text-xs font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#bef264] opacity-[0.02] blur-[120px] pointer-events-none rounded-full" />
        </section>

        {/* Testimonials Section Code */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#bef264]/20 bg-[#bef264]/5 text-[10px] font-black text-[#bef264] mb-6 uppercase tracking-[0.2em]">
              Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Loved by <span className="text-[#bef264] italic">thousands</span> of students
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg font-medium leading-relaxed">
              From landing internships to securing high-paying full-time roles at top tech companies.
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="break-inside-avoid bg-[#121214]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-[#bef264]/20 transition-all duration-500 group cursor-default shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="text-[#bef264] fill-current" />
                    ))}
                  </div>
                  <Quote size={24} className="text-white/5 group-hover:text-[#bef264]/10 transition-colors duration-500" />
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">
                  \"{t.content}\"
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
                        <CheckCircle2 size={14} className="text-[#bef264] fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-[#bef264] transition-colors">{t.name}</h4>
                    <p className="text-gray-500 text-[11px] font-black uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale contrast-125">
            <span className="text-white font-black text-xl tracking-tighter italic">GOOGLE</span>
            <span className="text-white font-black text-xl tracking-tighter italic">AMAZON</span>
            <span className="text-white font-black text-xl tracking-tighter italic">MICROSOFT</span>
            <span className="text-white font-black text-xl tracking-tighter italic">ADOBE</span>
            <span className="text-white font-black text-xl tracking-tighter italic">UBER</span>
          </div>
        </section>

        <FAQ />

        <WaitlistSection />

        {/* CTA Section Code */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto flex text-center flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#bef264]/20 bg-[#bef264]/5 text-[#bef264] text-[10px] font-bold mb-6 uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              <span>FAQs</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
              Answers to the Most <span className="text-[#bef264]">Common</span> Questions
            </h2>

            <div className="w-full space-y-3 mt-4">
              {faqsData.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`group transition-all duration-300 rounded-2xl overflow-hidden ${
                    openIndex === idx 
                    ? ' bg-[#1f2022] shadow-xl shadow-[#bef264]/5' 
                      : ' bg-[#1f2022] hover:bg-zinc-800'
                  }`}
                >
                  <button 
                    className="w-full px-6 py-3 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => toggleAccordion(idx)}
                  >
                    <span className={`font-semibold text-base md:text-lg transition-colors duration-300 ${
                      openIndex === idx ? 'text-white' : 'text-white group-hover:text-zinc-200'
                    }`}>
                      {faq.q}
                    </span>
                    
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === idx 
                        ? 'bg-[#bef264] text-black' 
                        : 'bg-zinc-800 text-zinc-400 md:group-hover:bg-zinc-700'
                    }`}>
                      {openIndex === idx ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2} />}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="h-px w-full bg-white/5 mb-4" />
                      <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium max-w-[95%]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 w-10 h-1 bg-[#bef264]/20 rounded-full blur-[2px] animate-pulse" />
          </div>
        </section>

        <WaitlistSection />

        {/* CTA Section Code */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-[#18181b] rounded-[3rem] border border-[#bef264]/20 p-12 md:p-24 text-center shadow-[0_0_80px_rgba(190,242,100,0.05)]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#bef264]/5 via-transparent to-[#bef264]/5 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#bef264]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#bef264]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#bef264]/30 bg-[#bef264]/10 text-[10px] font-black text-[#bef264] mb-8 uppercase tracking-[0.2em] animate-pulse">
                <Sparkles size={14} fill="currentColor" /> Limited Time Offer
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">
                Ready to land your <span className="text-[#bef264] italic">dream offer?</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                Join thousands of candidates who are already using PlaceMateAI to
                outperform their competition and secure high-paying roles.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <SignedOut>
                  <Link
                    to="/signup"
                    className="group relative px-10 py-5 bg-[#bef264] text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#d9ff96] whitespace-nowrap transition-all duration-300 shadow-[0_20px_40px_rgba(190,242,100,0.2)] flex items-center gap-3"
                  >
                    Get Started Free
                    <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/dashboard/setup"
                    className="group relative px-10 py-5 bg-[#bef264] text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#d9ff96] whitespace-nowrap transition-all duration-300 shadow-[0_20px_40px_rgba(190,242,100,0.2)] flex items-center gap-3"
                  >
                    Start Practice Now
                    <Rocket size={18} className="group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500" />
                  </Link>
                </SignedIn>
              </div>

              <div className="mt-12 flex items-center justify-center gap-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                <span>No credit card required</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>30 free credits instantly</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default LandingHome;
