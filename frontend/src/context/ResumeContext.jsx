import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};

export const TEMPLATE_THEMES = {
  grid: "#ea580c",
  simple: "#1e293b",
  modern: "#000000",
  elegant: "#E5E6E3",
  classic: "#1e293b",
  tech: "#3b82f6",
  corporate: "#0f172a",
  executive: "#4338ca",
  professional: "#000000",
  creative: "#db2777",
  standard: "#000000",
};

const initialResumeState = {
  title: "Untitled Resume",
  template: "modern",
  personalInfo: {
    firstName: "Jonathan",
    lastName: "Doe",
    fullName: "Jonathan Doe",
    email: "jonathan.doe@example.com",
    phone: "+1 (555) 000-1111",
    location: "San Francisco, CA",
    jobTitle: "Senior Software Engineer",
    objective: "Results-oriented Senior Software Engineer with over 8 years of experience in designing and implementing scalable web applications. Proven track record of leading development teams, optimizing system performance, and delivering high-quality user experiences. Expertise in React, Node.js, and cloud-native architectures.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/jonathandoe" },
      { label: "GitHub", url: "https://github.com/jonathandoe" }
    ],
  },
  profiles: [
    {
      title: "Summary",
      content: "Results-oriented Senior Software Engineer with over 8 years of experience in designing and implementing scalable web applications. Proven track record of leading development teams, optimizing system performance, and delivering high-quality user experiences. Expertise in React, Node.js, and cloud-native architectures.",
      visible: true,
    },
  ],
  sectionTitles: {
    objective: "Summary",
    profiles: "Profile",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    achievements: "Achievements",
    certifications: "Certifications",
  },
  experience: [
    {
      company: "Tech Innovators Inc.",
      title: "Lead Software Architect",
      location: "San Francisco, CA",
      startDate: "2021-03-01",
      current: true,
      description: "Implemented a microservices architecture that reduced server costs by 35%.\nLed a team of 12 engineers in the successful rollout of an AI-driven analytics dashboard.\nCollaborated with product teams to define technical roadmaps and ensure architectural integrity.",
      visible: true,
    },
    {
      company: "Global Stack Solutions",
      title: "Senior Full Stack Developer",
      location: "New York, NY",
      startDate: "2018-06-01",
      endDate: "2021-02-28",
      description: "Developed and maintained a high-traffic fintech platform serving 500k+ active users.\nOptimized database queries and API response times, resulting in a 50% performance improvement.\nDesigned reusable UI components and a design system used across 5 core products.",
      visible: true,
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "M.S. in Computer Science",
      field: "Artificial Intelligence",
      startDate: "2013-09-01",
      endDate: "2015-05-15",
      location: "Stanford, CA",
      gpa: "3.9/4.0",
      visible: true,
    },
    {
      institution: "University of California, Berkeley",
      degree: "B.S. in Electrical Engineering & Computer Sciences",
      startDate: "2009-09-01",
      endDate: "2013-05-20",
      location: "Berkeley, CA",
      gpa: "3.8/4.0",
      visible: true,
    }
  ],
  skills: [
    {
      category: "Frontend",
      subSkills: "React, Next.js, Redux, TailwindCSS, TypeScript, HTML5, CSS3",
      visible: true,
    },
    {
      category: "Backend & DB",
      subSkills: "Node.js, Express, Python, Django, PostgreSQL, MongoDB, Redis",
      visible: true,
    },
    {
      category: "DevOps & Cloud",
      subSkills: "AWS (S3, EC2, ECS), Docker, Kubernetes, CI/CD, Git",
      visible: true,
    }
  ],
  projects: [
    {
      title: "SmartScribe AI Platform",
      link: "https://github.com/jdoe/smartscribe",
      githubUrl: "https://github.com/jdoe/smartscribe",
      startDate: "2022-01-01",
      endDate: "2022-06-01",
      description: "Developed an open-source real-time transcription and summary platform powered by OpenAI Whisper and GPT-4.\nImplemented clean audio chunking pipelines and achieved 98% transcription accuracy with 200ms latency.\nSecured over 1,500 Github stars and supported 20,000+ monthly active users during launch.",
      visible: true,
    },
    {
      title: "FlowState Task Engine",
      link: "https://flowstate-engine.io",
      startDate: "2020-08-01",
      endDate: "2020-12-01",
      description: "Built a high-throughput job queue manager using Redis and Node.js that executes complex workflows with custom retries.\nDesigned an interactive DAG builder in React, allowing users to orchestrate tasks visually.\nDecreased job execution delays by 40% compared to existing open-source alternatives.",
      visible: true,
    }
  ],
  achievements: [
    {
      title: "1st Place Winner",
      description: "TechCrunch Disrupt Hackathon (out of 300+ global competing engineering teams)",
      date: "2022",
      visible: true,
    },
    {
      title: "Outstanding Engineering Award",
      description: "Recognized for driving infrastructure virtualization at Tech Innovators",
      date: "2021",
      visible: true,
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      visible: true,
    },
    {
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "The Linux Foundation",
      date: "2022",
      visible: true,
    }
  ],
  customSections: [
    {
      id: "lang-sec",
      title: "Languages",
      entries: [
        {
          title: "English",
          subtitle: "Native proficiency",
          visible: true,
        },
        {
          title: "Spanish",
          subtitle: "Intermediate fluency",
          visible: true,
        }
      ]
    }
  ],
  customizations: {
    language: "English (UK)",
    dateFormat: "DD/MM/YYYY",
    pageFormat: "A4",
    layout: {
      columns: "two",
      spacing: {
        fontSize: "10.5pt",
        lineHeight: 1.15,
        margin: { left: "22mm", right: "22mm", top: "12mm", bottom: "12mm" },
        spaceBetweenEntries: 10,
      },
    },
    colors: {
      mode: "basic", // basic, advanced, border
      subMode: "accent", // accent, multi, image
      accent: "#000000",
      text: "#18181b",
      background: "#ffffff",
      border: { style: "single", color: "#e4e4e7" },
      applyTo: {
        name: true,
        jobTitle: true,
        headings: true,
        headingsLine: true,
        headerIcons: false,
        dotsBarsBubbles: false,
        dates: false,
        entrySubtitle: false,
        linkIcons: false,
      },
    },
    fonts: { body: "Source Serif Pro", headings: "Source Serif Pro" },
    sectionHeadings: {
      capitalization: "uppercase",
    },
    entryLayout: {
      subtitleStyle: "bold", // bold, italic, normal
      subtitlePlacement: "next-line", // next-line, same-line
      listStyle: "bullet", // bullet, hyphen, none
    },
    profileImage: {
      style: "rounded", // circle, square, rounded
      borderRadius: 8,
      size: 80,
    },
  },
};

const emptyResumeState = {
  title: "Untitled Resume",
  template: "modern",
  personalInfo: {
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    objective: "",
    photoUrl: "",
    links: [],
  },
  profiles: [{ title: "Summary", content: "", visible: true }],
  sectionTitles: {
    objective: "Summary",
    profiles: "Profile",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    achievements: "Achievements",
    certifications: "Certifications",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  achievements: [],
  certifications: [],
  customSections: [],
  customizations: {
    language: "English (UK)",
    dateFormat: "DD/MM/YYYY",
    pageFormat: "A4",
    layout: {
      columns: "two",
      spacing: {
        fontSize: "10.5pt",
        lineHeight: 1.15,
        margin: { left: "22mm", right: "22mm", top: "12mm", bottom: "12mm" },
        spaceBetweenEntries: 10,
      },
    },
    colors: {
      mode: "basic",
      subMode: "accent",
      accent: "#000000",
      text: "#18181b",
      background: "#ffffff",
      border: { style: "single", color: "#e4e4e7" },
      applyTo: {
        name: true,
        jobTitle: true,
        headings: true,
        headingsLine: true,
        headerIcons: false,
        dotsBarsBubbles: false,
        dates: false,
        entrySubtitle: false,
        linkIcons: false,
      },
    },
    fonts: { body: "Source Serif Pro", headings: "Source Serif Pro" },
    sectionHeadings: {
      capitalization: "uppercase",
    },
    entryLayout: {
      subtitleStyle: "bold",
      subtitlePlacement: "next-line",
      listStyle: "bullet",
    },
    profileImage: {
      style: "rounded",
      borderRadius: 8,
      size: 80,
    },
  },
};

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const ResumeProvider = ({ children }) => {
  const { user } = useUser();
  const [resumeData, setResumeData] = useState(initialResumeState);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [resumeId, setResumeId] = useState(null);
  const skipStatusRef = useRef(true);

  // Track unsaved changes
  useEffect(() => {
    if (skipStatusRef.current) {
      skipStatusRef.current = false;
      return;
    }
    if (saveStatus !== "saving") {
      setSaveStatus("unsaved");
    }
  }, [resumeData]);

  const fetchAllResumes = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/resume/${user.id}`);
      if (response.data.success) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching all resumes:", error);
      toast.error("Could not load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAllResumes();
    }
  }, [user?.id]);

  const loadResume = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/resume/single/${id}`);
      if (response.data.success) {
        const data = response.data.data;

        // Migration: If legacy resume has objective but no profiles, convert it
        if (
          data.personalInfo?.objective &&
          (!data.profiles || data.profiles.length === 0)
        ) {
          data.profiles = [
            {
              title: data.sectionTitles?.objective || "Summary",
              content: data.personalInfo.objective,
              visible: true,
            },
          ];
        } else if (!data.profiles || data.profiles.length === 0) {
          data.profiles = [{ title: "Summary", content: "", visible: true }];
        }

        // Merge with initial state to ensure new customization fields exist
        const mergedData = {
          ...initialResumeState,
          ...data,
          template: data.template || initialResumeState.template,
          customizations: {
            ...initialResumeState.customizations,
            ...(data.customizations || {}),
            layout: {
              ...initialResumeState.customizations.layout,
              ...(data.customizations?.layout || {}),
              spacing: {
                ...initialResumeState.customizations.layout.spacing,
                ...(data.customizations?.layout?.spacing || {}),
              },
            },
            colors: {
              ...initialResumeState.customizations.colors,
              ...(data.customizations?.colors || {}),
            },
          },
        };
        skipStatusRef.current = true;
        setResumeData(mergedData);
        setResumeId(id);
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      toast.error("Failed to load resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = (template = "modern") => {
    const themeColor = TEMPLATE_THEMES[template] || TEMPLATE_THEMES.modern;
    setResumeData({
      ...emptyResumeState,
      template,
      customizations: {
        ...emptyResumeState.customizations,
        colors: {
          ...emptyResumeState.customizations.colors,
          accent: themeColor,
        },
      },
    });
    setResumeId(null);
  };

  const saveResume = async () => {
    if (!user?.id) return;
    try {
      setSaveStatus("saving");
      const payload = {
        ...resumeData,
        clerkId: user.id,
        _id: resumeId,
      };

      const response = await axios.post(`${API_BASE}/api/resume/save`, payload);

      if (response.data.success) {
        setSaveStatus("saved");
        setResumeId(response.data.data._id);
        fetchAllResumes(); // Refresh dashboard
        setTimeout(() => setSaveStatus("idle"), 3000);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus("error");
    }
  };

  const deleteResume = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/resume/${id}`);
      if (response.data.success) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume.");
    }
  };

  const duplicateResume = async (id, title) => {
    if (!user?.id) return null;
    try {
      const response = await axios.post(
        `${API_BASE}/api/resume/duplicate/${id}`,
        {
          clerkId: user.id,
          title,
        },
      );

      if (response.data.success) {
        const duplicated = response.data.data;
        setResumes((prev) => [duplicated, ...prev]);
        return duplicated;
      }

      return null;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to duplicate resume. Please try again.";
      toast.error(message);
      return null;
    }
  };

  const rewriteResumeContent = async ({
    resumeId: targetResumeId,
    mode = "section",
    target = "summary",
    content,
    resumeData,
    jobDescription,
  }) => {
    if (!user?.id) return null;
    if (!targetResumeId) {
      toast.error("Please sync your resume before using AI rewrite.");
      return null;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/resume/rewrite/${targetResumeId}`,
        {
          clerkId: user.id,
          mode,
          target,
          content,
          resumeData,
          jobDescription,
        },
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePersonalInfo = (info) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  const updateProfiles = (profiles) => {
    setResumeData((prev) => ({
      ...prev,
      profiles,
    }));
  };

  const addProfile = () => {
    setResumeData((prev) => ({
      ...prev,
      profiles: [
        ...(prev.profiles || []),
        { title: "Summary", content: "", visible: true },
      ],
    }));
  };

  const updateSectionTitle = (section, title) => {
    setResumeData((prev) => ({
      ...prev,
      sectionTitles: { ...prev.sectionTitles, [section]: title },
    }));
  };

  const addEntry = (section) => {
    const newEntry = {
      visible: true,
      ...(section === "experience" && {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }),
      ...(section === "education" && {
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
        location: "",
      }),
      ...(section === "skills" && { category: "", subSkills: "" }),
      ...(section === "projects" && {
        title: "",
        link: "",
        githubUrl: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }),
      ...(section === "certifications" && { name: "", issuer: "", date: "" }),
    };

    setResumeData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newEntry],
    }));
  };

  const updateEntry = (section, index, data) => {
    setResumeData((prev) => {
      const newSectionData = [...prev[section]];
      newSectionData[index] = { ...newSectionData[index], ...data };
      return { ...prev, [section]: newSectionData };
    });
  };

  const removeEntry = (section, index) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (data) =>
    setResumeData((prev) => ({ ...prev, experience: data }));
  const updateEducation = (data) =>
    setResumeData((prev) => ({ ...prev, education: data }));
  const updateSkills = (data) =>
    setResumeData((prev) => ({ ...prev, skills: data }));
  const updateProjects = (data) =>
    setResumeData((prev) => ({ ...prev, projects: data }));
  const updateAchievements = (data) =>
    setResumeData((prev) => ({ ...prev, achievements: data }));
  const updateCertifications = (data) =>
    setResumeData((prev) => ({ ...prev, certifications: data }));

  const addCustomSection = (title) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        {
          id: `custom_${Date.now()}`,
          title: title || "Custom Section",
          entries: [
            {
              title: "New Item",
              subtitle: "",
              location: "",
              startDate: "",
              endDate: "",
              content: "",
              link: "",
              visible: true,
            },
          ],
        },
      ],
    }));
  };

  const updateCustomSection = (id, data) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) =>
        s.id === id ? { ...s, ...data } : s,
      ),
    }));
  };

  const removeCustomSection = (id) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((s) => s.id !== id),
    }));
  };

  const updateCustomizations = (path, value) => {
    setResumeData((prev) => {
      const keys = path.split(".");
      const updateNested = (obj, keys, value) => {
        const [first, ...rest] = keys;
        if (rest.length === 0) {
          return { ...obj, [first]: value };
        }
        return {
          ...obj,
          [first]: updateNested(obj[first] || {}, rest, value),
        };
      };

      return {
        ...prev,
        customizations: updateNested(prev.customizations || {}, keys, value),
      };
    });
  };

  const resetCustomizations = () => {
    setResumeData((prev) => ({
      ...prev,
      customizations: JSON.parse(
        JSON.stringify(initialResumeState.customizations),
      ),
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        resumes,
        loading,
        isLoading: loading,
        isSaving: saveStatus === "saving",
        saveStatus,
        resumeId,
        loadResume,
        createNewResume,
        saveResume,
        deleteResume,
        duplicateResume,
        rewriteResumeContent,
        updatePersonalInfo,
        updateProfiles,
        addProfile,
        updateSectionTitle,
        addEntry,
        updateEntry,
        removeEntry,
        updateExperience,
        updateEducation,
        updateSkills,
        updateProjects,
        updateAchievements,
        updateCertifications,
        addCustomSection,
        updateCustomSection,
        removeCustomSection,
        updateCustomizations,
        resetCustomizations,
        setResumeData,
        fetchAllResumes,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
