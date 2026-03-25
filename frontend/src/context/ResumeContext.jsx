import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import axios from "axios";

const ResumeContext = createContext();

const initialResumeState = {
  personalInfo: {
    fullName: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    links: [
      { label: "Website", url: "" },
      { label: "LinkedIn", url: "" },
    ],
    objective: "",
    photoUrl: "",
  },
  sectionTitles: {
    objective: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    achievements: "Achievements",
    certifications: "Certifications",
  },
  experience: [],
  education: [],
  skills: [
    {
      category: "Programming Languages",
      subSkills: "HTML, CSS, JavaScript",
      level: "Expert",
      visible: true,
    },
  ],
  projects: [],
  achievements: [],
  certifications: [],
};

export const ResumeProvider = ({ children }) => {
  const { userId, isLoaded } = useAuth();
  const [resumeData, setResumeData] = useState(initialResumeState);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllResumes = async () => {
    if (isLoaded && userId) {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/resume/${userId}`,
        );
        if (response.data.success) {
          setResumes(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAllResumes();
  }, [userId, isLoaded]);

  const createNewResume = () => {
    setResumeData({
      ...initialResumeState,
      clerkId: userId,
    });
  };

  const loadResume = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/resume/single/${id}`,
      );
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setResumeData({
          _id: data._id,
          clerkId: data.clerkId,
          title: data.title || "Untitled Resume",
          personalInfo: data.personalInfo || initialResumeState.personalInfo,
          sectionTitles: data.sectionTitles || initialResumeState.sectionTitles,
          template: data.template || "modern",
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          projects: data.projects || [],
          achievements: data.achievements || [],
          certifications: data.certifications || [],
        });
      }
    } catch (error) {
      console.error("Error loading resume:", error);
      toast.error("Failed to load resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/resume/save`,
        {
          clerkId: userId,
          ...resumeData,
        },
      );
      if (response.data.success) {
        toast.success("Resume saved successfully!");
        setResumeData((prev) => ({ ...prev, _id: response.data.data._id }));
        fetchAllResumes(); // Refresh dashboard list
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/resume/${id}`,
      );
      if (response.data.success) {
        toast.success("Resume deleted!");
        fetchAllResumes();
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume.");
    }
  };

  const updateSectionTitle = (section, title) => {
    setResumeData((prev) => ({
      ...prev,
      sectionTitles: {
        ...prev.sectionTitles,
        [section]: title,
      },
    }));
  };

  const updatePersonalInfo = (data) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateExperience = (data) => {
    setResumeData((prev) => ({ ...prev, experience: data }));
  };

  const updateEducation = (data) => {
    setResumeData((prev) => ({ ...prev, education: data }));
  };

  const updateSkills = (data) => {
    setResumeData((prev) => ({ ...prev, skills: data }));
  };

  const updateProjects = (data) => {
    setResumeData((prev) => ({ ...prev, projects: data }));
  };

  const updateAchievements = (data) => {
    setResumeData((prev) => ({ ...prev, achievements: data }));
  };

  const updateCertifications = (data) => {
    setResumeData((prev) => ({ ...prev, certifications: data }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        resumes,
        isLoading,
        isSaving,
        createNewResume,
        loadResume,
        deleteResume,
        updateSectionTitle,
        updatePersonalInfo,
        updateExperience,
        updateEducation,
        updateSkills,
        updateProjects,
        updateAchievements,
        updateCertifications,
        saveResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  return useContext(ResumeContext);
};
