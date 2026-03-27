import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers.jsx";

const StandardTemplate = ({ data }) => {
  const {
    personalInfo,
    sectionTitles,
    profiles,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    customizations: c,
  } = data;

  const titles = sectionTitles || {};

  const theme = {
    accent: c?.colors?.accent || "#312e81",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "11pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.4,
    margin: c?.layout?.spacing?.margin || {
      left: "20mm",
      right: "20mm",
      top: "20mm",
      bottom: "20mm",
    },
    dateFormat: c?.dateFormat || "MM/YYYY",
    language: c?.language || "English (US)",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    applyTo: c?.colors?.applyTo || {
      name: true,
      jobTitle: true,
      headings: true,
    },
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  const getLinkIcon = (label, url) => {
    const text = (label + url).toLowerCase();
    if (text.includes("linkedin")) return <Linkedin size={14} />;
    if (text.includes("github")) return <Github size={14} />;
    if (text.includes("twitter")) return <Twitter size={14} />;
    if (text.includes("dribbble")) return <Dribbble size={14} />;
    if (text.includes("behance")) return <Behance size={14} />;
    return <LinkIcon size={14} />;
  };

  return (
    <div
      className="p-8 bg-white text-gray-800"
      style={{
        fontFamily: fonts.body,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        minHeight: "297mm",
      }}
    >
      {/* Header */}
      <header className="text-center mb-8">
        <h1
          className="text-4xl font-bold tracking-tight mb-1"
          style={{ color: getColor("name"), fontFamily: fonts.heading }}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        <h2
          className="text-xl font-semibold"
          style={{ color: getColor("jobTitle") }}
        >
          {personalInfo.jobTitle || "Job Title"}
        </h2>
        <div className="flex justify-center items-center gap-x-4 mt-4 text-sm">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={14} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={14} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-x-4 mt-2 text-sm">
          {(personalInfo.links || []).map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              {getLinkIcon(link.label, link.url)}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </header>

      {/* Summary */}
      {profiles?.map(
        (profile, i) =>
          profile.visible !== false &&
          profile.content && (
            <section key={i} className="mb-6">
              <h3
                className="text-lg font-bold border-b-2 pb-1 mb-2"
                style={{
                  borderColor: theme.accent,
                  color: getColor("headings"),
                  fontFamily: fonts.heading,
                }}
              >
                {profile.title || titles.profiles || "Summary"}
              </h3>
              <p className="text-sm">{profile.content}</p>
            </section>
          ),
      )}

      {/* Experience */}
      {experience?.some((exp) => exp.visible !== false) && (
        <section className="mb-6">
          <h3
            className="text-lg font-bold border-b-2 pb-1 mb-2"
            style={{
              borderColor: theme.accent,
              color: getColor("headings"),
              fontFamily: fonts.heading,
            }}
          >
            {titles.experience || "Experience"}
          </h3>
          {experience.map(
            (exp, i) =>
              exp.visible !== false && (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-md font-bold">{exp.title}</h4>
                    <span className="text-sm font-medium">
                      {formatDate(exp.startDate)} -{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">
                    {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </p>
                  <div
                    className="text-sm mt-1"
                    dangerouslySetInnerHTML={{
                      __html: formatDescriptionList(
                        exp.description,
                        theme.listStyle,
                      ),
                    }}
                  />
                </div>
              ),
          )}
        </section>
      )}

      {/* Education */}
      {education?.some((edu) => edu.visible !== false) && (
        <section className="mb-6">
          <h3
            className="text-lg font-bold border-b-2 pb-1 mb-2"
            style={{
              borderColor: theme.accent,
              color: getColor("headings"),
              fontFamily: fonts.heading,
            }}
          >
            {titles.education || "Education"}
          </h3>
          {education.map(
            (edu, i) =>
              edu.visible !== false && (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-md font-bold">{edu.degree}</h4>
                    <span className="text-sm font-medium">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-sm">{edu.institution}</p>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                </div>
              ),
          )}
        </section>
      )}

      {/* Skills */}
      {skills?.some((skill) => skill.visible !== false) && (
        <section className="mb-6">
          <h3
            className="text-lg font-bold border-b-2 pb-1 mb-2"
            style={{
              borderColor: theme.accent,
              color: getColor("headings"),
              fontFamily: fonts.heading,
            }}
          >
            {titles.skills || "Skills"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(
              (skill, i) =>
                skill.visible !== false && (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-full px-3 py-1 text-sm"
                  >
                    {skill.subSkills}
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects?.some((proj) => proj.visible !== false) && (
        <section className="mb-6">
          <h3
            className="text-lg font-bold border-b-2 pb-1 mb-2"
            style={{
              borderColor: theme.accent,
              color: getColor("headings"),
              fontFamily: fonts.heading,
            }}
          >
            {titles.projects || "Projects"}
          </h3>
          {projects.map(
            (proj, i) =>
              proj.visible !== false && (
                <div key={i} className="mb-4">
                  <h4 className="text-md font-bold">{proj.title}</h4>
                  <p className="text-sm">{proj.description}</p>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ),
          )}
        </section>
      )}
    </div>
  );
};

export default StandardTemplate;
