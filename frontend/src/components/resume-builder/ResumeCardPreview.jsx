import React from "react";
import ModernTemplate from "./resume-templates/ModernTemplate";
import ProfessionalTemplate from "./resume-templates/ProfessionalTemplate";
import CreativeTemplate from "./resume-templates/CreativeTemplate";
import ExecutiveTemplate from "./resume-templates/ExecutiveTemplate";
import TechTemplate from "./resume-templates/TechTemplate";
import CorporateTemplate from "./resume-templates/CorporateTemplate";
import ClassicTemplate from "./resume-templates/ClassicTemplate";
import ElegantTemplate from "./resume-templates/ElegantTemplate";
import StandardTemplate from "./resume-templates/StandardTemplate";

export const templates = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  corporate: CorporateTemplate,
  classic: ClassicTemplate,
  elegant: ElegantTemplate,
  standard: StandardTemplate,
};

export const DUMMY_RESUME_DATA = {
  title: "Preview",
  template: "modern",
  personalInfo: {
    fullName: "JONATHAN DOE",
    jobTitle: "SENIOR SOFTWARE ENGINEER",
    email: "jonathan.doe@example.com",
    phone: "+1 (555) 000-1111",
    location: "San Francisco, CA",
    photoUrl: "/dummy-avatar.png",
    objective:
      "Results-oriented Senior Software Engineer with over 8 years of experience in designing and implementing scalable web applications. Proven track record of leading development teams, optimizing system performance, and delivering high-quality user experiences. Expertise in React, Node.js, and cloud-native architectures.",
  },
  experience: [
    {
      company: "Tech Innovators Inc.",
      title: "Lead Software Architect",
      location: "San Francisco, CA",
      startDate: "2021-03-01",
      current: true,
      description:
        "Implemented a microservices architecture that reduced server costs by 35%.\nLed a team of 12 engineers in the successful rollout of an AI-driven analytics dashboard.\nCollaborated with product teams to define technical roadmaps and ensure architectural integrity.",
    },
    {
      company: "Global Stack Solutions",
      title: "Senior Full Stack Developer",
      location: "New York, NY",
      startDate: "2018-06-01",
      endDate: "2021-02-28",
      description:
        "Developed and maintained a high-traffic fintech platform serving 500k+ active users.\nOptimized database queries and API response times, resulting in a 50% performance improvement.\nDesigned reusable UI components and a design system used across 5 core products.",
    },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "M.S. in Computer Science (Specialization in AI)",
      startDate: "2013-09-01",
      endDate: "2015-05-15",
      location: "Stanford, CA",
    },
  ],
  skills: [
    {
      category: "Frontend",
      subSkills: "React, Next.js, Redux, TailwindCSS, TypeScript, Webpack",
    },
    {
      category: "Backend",
      subSkills: "Node.js, Express, Python, Go, GraphQL, REST APIs",
    },
  ],
  projects: [
    {
      title: "SmartScribe AI",
      link: "https://github.com/jdoe/smartscribe",
      description:
        "An open-source real-time transcription tool using OpenAI Whisper API.",
    },
  ],
  languages: [{ language: "English", level: 5 }],
  customizations: {
    colors: {
      accent: "#bef264",
      text: "#18181b",
      background: "#ffffff",
      applyTo: {
        name: true,
        jobTitle: true,
        headings: true,
        headingsLine: true,
      },
    },
    fonts: { body: "Inter", headings: "Inter" },
    layout: {
      spacing: {
        fontSize: "10pt",
        margin: { top: "10mm", left: "10mm", right: "10mm", bottom: "10mm" },
      },
    },
    sectionHeadings: { capitalization: "uppercase" },
    entryLayout: { subtitleStyle: "bold", listStyle: "bullet" },
  },
};

const ResumeCardPreview = ({ resume }) => {
  const SelectedTemplate = templates[resume.template] || ModernTemplate;
  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.2);

  const safeResume = {
    ...resume,
    personalInfo: resume.personalInfo || {},
    customizations: resume.customizations || {
      colors: {
        accent: "#bef264",
        text: "#18181b",
        background: "#ffffff",
        applyTo: {},
      },
      fonts: { body: "Inter", headings: "Inter" },
      layout: {
        spacing: {
          fontSize: "10pt",
          margin: { top: "10mm", left: "10mm", right: "10mm", bottom: "10mm" },
        },
      },
    },
  };

  React.useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth > 0) {
          const actualScale = containerWidth / 794;
          setScale(actualScale);
        }
      }
    };

    updateScale();

    // Add a small delay for tab transitions/layout adjustments
    const timer = setTimeout(updateScale, 50);

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-white origin-top-left overflow-hidden pointer-events-none group-hover:opacity-100 transition-opacity"
    >
      <div
        style={{
          width: `794px`,
          height: `1123px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundColor: "#fff",
        }}
      >
        <SelectedTemplate data={safeResume} />
      </div>
    </div>
  );
};

export default ResumeCardPreview;
