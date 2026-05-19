export const COMPANY_DETAILS = {
  name: "PlaceMateAI",
  email: "placemateai@gmail.com",
  phone: "+91 7898297769", // Example from Contact.jsx
  address: "MP Nagar, Bhopal, MP, 462003",
  description: "Empowering candidates to conquer their dream interviews with state-of-the-art AI simulations and real-time feedback.",
  socials: [
    { label: 'Instagram', icon: 'skill-icons:instagram.svg', url: 'https://www.instagram.com/placemateai/', size: 22 },
    { label: 'LinkedIn', icon: 'logos:linkedin-icon.svg', url: 'https://www.linkedin.com/in/placemateai-private-limited-092a143b8/', size: 22 },
    { label: 'X', icon: 'simple-icons:x.svg?color=white', url: 'https://x.com/PlaceMateAI', size: 20 },
    { label: 'WhatsApp', icon: 'logos:whatsapp-icon.svg', url: 'https://whatsapp.com/channel/0029VbDWsV8B4hdYG13kSP2T', size: 22 },
    { label: 'Email', icon: 'logos:google-gmail.svg', url: 'mailto:placemateai@gmail.com', size: 22 },
  ]
};

export const FAQS = {
  home: [
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
  ],
  pricing: [
    {
        q: "How do Credits work?",
        a: "PlaceMateAI uses a unified credit system (1 Credit = ₹1). Mock Interviews cost 10 credits (flat), GD Sessions cost 8 credits (flat), and AI tools (Resume/LinkedIn) cost 2 credits per use. Credits provided in monthly plans reset each billing cycle, while Top-up credits never expire."
    },
    {
        q: "Can I get a refund?",
        a: "Yes! We offer a full refund within 24 hours of purchase if you have used less than 10% of your plan credits. Use the 'Request Refund' link in your billing settings. Refunds are processed automatically within 5-7 business days."
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel anytime. You will continue to have access to your plan's features until the end of your current billing period."
    },
    {
        q: "What are SOTA Models?",
        a: "SOTA (State-of-the-Art) models refer to the latest and most advanced AI models like GPT-4o or specialized fine-tuned models that provide more realistic and nuanced interview feedback."
    }
  ],
  help: [
    {
      q: "How do I contact support?",
      a: "Send an email to our support email with a short description of the issue and any relevant session details.",
    },
    {
      q: "How long does a response take?",
      a: "Most requests are reviewed within 24 hours on business days.",
    },
    {
      q: "I have a technical issue during a session.",
      a: "If a session is interrupted, include the session ID and a brief note about what happened so we can investigate quickly.",
    },
    {
      q: "Can I cancel or change my plan?",
      a: "Yes. Plan changes and cancellations can be handled from the billing area in your dashboard.",
    }
  ]
};
