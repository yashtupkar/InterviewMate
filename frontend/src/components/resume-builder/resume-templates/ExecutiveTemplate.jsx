import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers.jsx";

const ExecutiveTemplate = ({ data }) => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    profiles,
    customizations: c,
  } = data;

  const theme = {
    accent: c?.colors?.accent || "#0c4a6e",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "10pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.15,
    margin: c?.layout?.spacing?.margin || {
      left: "20mm",
      right: "20mm",
      top: "20mm",
      bottom: "20mm",
    },
    dateFormat: c?.dateFormat || "DD/MM/YYYY",
    language: c?.language || "English (UK)",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    applyTo: c?.colors?.applyTo || {
      name: true,
      jobTitle: true,
      headings: true,
      headingsLine: true,
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
    if (text.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
    if (text.includes("github")) return <Github className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div
      style={{
        padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} ${theme.margin.left}`,
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: fonts.body,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        width: "100%",
        minHeight: "297mm",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Premium Header */}
      <header
        style={{
          marginBottom: "1.5rem",
          borderBottom: `4px solid ${theme.applyTo.headingsLine ? theme.accent : "#0c4a6e"}`,
          paddingBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              color: getColor("name", "#082f49"),
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "-0.025em",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: getColor("jobTitle", "#0369a1"),
              fontWeight: 600,
              marginBottom: "0.75rem",
              letterSpacing: "0.025em",
              fontStyle: "italic",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-zinc-700">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-900" />{" "}
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-900" />{" "}
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-900" />{" "}
                <span>{personalInfo.location}</span>
              </div>
            )}
            {(personalInfo.links || []).map(
              (link, i) =>
                link.url && (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-sky-700 transition-colors"
                  >
                    {getLinkIcon(link.label, link.url)}
                    <span>{link.label || "Link"}</span>
                  </a>
                ),
            )}
          </div>
        </div>

        {personalInfo.photoUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-sky-50 shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt={`${personalInfo.fullName || "Profile"} photo`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content Area */}
      <div className="grid grid-cols-3 gap-8">
        {/* Main Content (Left) */}
        <div className="col-span-2 space-y-5 border-r border-zinc-100 pr-6">

          {profiles?.some((p) => p.visible !== false && p.content) && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {profiles.map(
                (profile, i) =>
                  profile.visible !== false &&
                  profile.content && (
                    <section key={i}>
                      <h2
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: getColor("headings", "#000000"),
                          borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                          paddingBottom: "2px",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          fontFamily: fonts.heading,
                        }}
                      >
                        {profile.title || titles.profiles || "Profile"}
                      </h2>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#18181b",
                          textAlign: "justify",
                          lineHeight: 1.4,
                          fontFamily: fonts.body,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {profile.content}
                      </p>
                    </section>
                  ),
              )}
            </div>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: getColor("headings", "#082f49"),
                  borderBottom: `2px solid ${theme.applyTo.headingsLine ? `${theme.accent}20` : "#e0f2fe"}`,
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: fonts.heading,
                }}
              >
                {experience.title  || "Work Experience"}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="relative">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "4px",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontWeight: "bold",
                                color: theme.accent,
                                textTransform: "uppercase",
                                fontSize: "0.875rem",
                                fontFamily: fonts.heading,
                              }}
                            >
                              {exp.title || "(Job Title)"}
                            </h3>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                color: "#4b5563",
                                fontFamily: fonts.body,
                              }}
                            >
                              {exp.company || "Company Name"}{" "}
                              {exp.location && `| ${exp.location}`}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#0c4a6e",
                              textTransform: "uppercase",
                              fontStyle: "italic",
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#374151",
                              whiteSpace: "pre-wrap",
                              marginTop: "6px",
                              lineHeight: 1.4,
                              borderLeft: `2px solid ${theme.accent}20`,
                              paddingLeft: "0.75rem",
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDescriptionList(
                              exp.description,
                              theme.listStyle,
                            )}
                          </p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects?.some((proj) => proj.visible !== false) && (
            <section>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: getColor("headings", "#082f49"),
                  borderBottom: `2px solid ${theme.applyTo.headingsLine ? `${theme.accent}20` : "#e0f2fe"}`,
                  paddingBottom: "4px",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: fonts.heading,
                }}
              >
                Key Projects
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div key={i} className="relative">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "4px",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: theme.accent,
                              textTransform: "uppercase",
                              fontSize: "0.875rem",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {proj.title || "Project Title"}
                          </h3>
                          <div className="flex gap-2 items-center">
                            {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                color: "#0369a1",
                                textDecoration: "none",
                                fontStyle: "italic",
                                fontFamily: fonts.body,
                              }}
                            >
                              [Code]
                            </a>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                color: "#0369a1",
                                textDecoration: "none",
                                fontStyle: "italic",
                                fontFamily: fonts.body,
                              }}
                            >
                              [Link]
                            </a>
                            )}
                            </div>
                        </div>
                        {proj.description && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#374151",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.4,
                              borderLeft: `2px solid ${theme.accent}20`,
                              paddingLeft: "0.75rem",
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDescriptionList(
                              proj.description,
                              theme.listStyle,
                            )}
                          </p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          {/* Skills */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Core Assets
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div
                        key={index}
                        style={{
                          backgroundColor: `${theme.accent}05`,
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          borderLeft: `4px solid ${theme.accent}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "9px",
                            fontWeight: 900,
                            color: theme.accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "2px",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {skill.category}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "#18181b",
                            lineHeight: 1.25,
                            fontFamily: fonts.body,
                          }}
                        >
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Education
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div
                        key={i}
                        style={{
                          backgroundColor: "#fafafa",
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: "bold",
                            color: theme.accent,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {edu.degree || "Degree"}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "#4b5563",
                            lineHeight: 1.25,
                            fontFamily: fonts.body,
                          }}
                        >
                          {edu.institution || "Institution"}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#0c4a6e",
                            marginTop: "4px",
                            textTransform: "uppercase",
                            fontStyle: "italic",
                            fontFamily: fonts.body,
                          }}
                        >
                          <span>
                            {edu.startDate || "Start"} - {edu.endDate || "End"}
                          </span>
                          {edu.gpa && (
                            <span style={{ color: `${theme.accent}b3` }}>
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications?.some((cert) => cert.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Certifications
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          paddingBottom: "0.5rem",
                          borderBottom: `1px solid ${theme.border}`,
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: "bold",
                            color: theme.accent,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            lineHeight: 1.25,
                            fontFamily: fonts.heading,
                          }}
                        >
                          {cert.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#4b5563",
                            fontFamily: fonts.body,
                          }}
                        >
                          {cert.issuer}
                        </p>
                        <p
                          style={{
                            fontSize: "9px",
                            fontWeight: "bold",
                            color: "#a1a1aa",
                            textTransform: "uppercase",
                            fontFamily: fonts.body,
                          }}
                        >
                          {cert.date}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
