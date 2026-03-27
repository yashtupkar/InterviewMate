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

const CorporateTemplate = ({ data }) => {
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
    fontBody: c?.fonts?.body || "Source Serif Pro",
    fontHeading: c?.fonts?.headings || "Source Serif Pro",
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
        alignItems: "center",
      }}
    >
      {/* Centered Professional Header */}
      <header
        style={{
          marginBottom: "2.5rem",
          textAlign: "center",
          width: "100%",
          maxWidth: "1024px",
          borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : "#312e81"}`,
          paddingBottom: "1.5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "3rem",
            height: "4px",
            backgroundColor: theme.accent,
          }}
        ></div>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: getColor("headings", "#1e1b4b"),
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "8px",
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: theme.accent,
            fontWeight: 600,
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontStyle: "italic",
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.jobTitle || "Business Executive"}
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-900" />{" "}
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-900" />{" "}
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-900" />{" "}
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
                  className="flex items-center gap-2 hover:text-indigo-900 transition-colors"
                >
                  {getLinkIcon(link.label, link.url)}
                  <span>{link.label || "Link"}</span>
                </a>
              ),
          )}
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-4 gap-10 w-full flex-1">
        {/* Main Content (3/4) */}
        <div className="col-span-3 space-y-8">
          {/* Profiles/Summaries */}
          {profiles?.some((p) => p.visible !== false && p.content) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {profiles.map(
                (profile, i) =>
                  profile.visible !== false &&
                  profile.content && (
                    <section key={i}>
                      <h2
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          color: getColor("headings", "#1e1b4b"),
                          textTransform: "uppercase",
                          letterSpacing: "0.2rem",
                          marginBottom: "1rem",
                          borderLeft: `4px solid ${theme.accent}`,
                          paddingLeft: "1rem",
                          paddingVertical: "4px",
                          fontFamily: fonts.heading,
                        }}
                      >
                        {profile.title ||
                          titles.profiles ||
                          "Professional Profile"}
                      </h2>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#3f3f46",
                          lineHeight: 1.6,
                          textAlign: "justify",
                          fontStyle: "italic",
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

          {/* Professional Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  color: getColor("headings", "#1e1b4b"),
                  textTransform: "uppercase",
                  letterSpacing: "0.2rem",
                  marginBottom: "1.5rem",
                  borderLeft: `4px solid ${theme.accent}`,
                  paddingLeft: "1rem",
                  paddingVertical: "4px",
                  fontFamily: fonts.heading,
                }}
              >
                Career Background
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="group">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "6px",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: "#1e1b4b",
                              textTransform: "uppercase",
                              fontSize: "1rem",
                              letterSpacing: "-0.025em",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {exp.title || "(Job Title)"}
                          </h3>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.1rem",
                              backgroundColor: "#fafafa",
                              paddingInline: "12px",
                              paddingBlock: "4px",
                              border: "1px solid #f4f4f5",
                              fontStyle: "italic",
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDate(exp.startDate)} —{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: theme.accent,
                            marginBottom: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "-0.05em",
                            fontFamily: fonts.body,
                          }}
                        >
                          {exp.company} {exp.location && `| ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#3f3f46",
                              lineHeight: 1.4,
                              textAlign: "justify",
                              whiteSpace: "pre-wrap",
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
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  color: getColor("headings", "#1e1b4b"),
                  textTransform: "uppercase",
                  letterSpacing: "0.2rem",
                  marginBottom: "1.5rem",
                  borderLeft: `4px solid ${theme.accent}`,
                  paddingLeft: "1rem",
                  paddingVertical: "4px",
                  fontFamily: fonts.heading,
                }}
              >
                Strategic Projects
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div key={i}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: "#1e1b4b",
                              textTransform: "uppercase",
                              fontSize: "0.875rem",
                              letterSpacing: "-0.025em",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {proj.title}
                          </h3>
                          {proj.link && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: "bold",
                                color: "#a1a1aa",
                                textTransform: "uppercase",
                                letterSpacing: "0.1rem",
                                fontFamily: fonts.body,
                              }}
                            >
                              {proj.link}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#3f3f46",
                            lineHeight: 1.4,
                            fontFamily: fonts.body,
                          }}
                        >
                          {formatDescriptionList(
                            proj.description,
                            theme.listStyle,
                          )}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (1/4) */}
        <div className="col-span-1 space-y-8">
          {/* Skills Area */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">
                Core Expertise
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index} className="group">
                        <h3
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            marginBottom: "6px",
                            fontFamily: fonts.body,
                          }}
                        >
                          {skill.category}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: theme.accent,
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

          {/* Academic Background */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">
                Academic
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div key={i}>
                        <h3
                          style={{
                            fontWeight: "bold",
                            color: "#1e1b4b",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                            letterSpacing: "-0.025em",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {edu.degree}
                        </h3>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: theme.accent,
                            marginBottom: "8px",
                            fontStyle: "italic",
                            fontFamily: fonts.body,
                          }}
                        >
                          {edu.institution}
                        </p>
                        <div
                          style={{
                            fontSize: "9px",
                            fontWeight: "bold",
                            color: "#a1a1aa",
                            textTransform: "uppercase",
                            letterSpacing: "0.1rem",
                            fontFamily: fonts.body,
                          }}
                        >
                          {edu.startDate} — {edu.endDate}{" "}
                          {edu.gpa && `| GPA: ${edu.gpa}`}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Certifications & Others */}
          {certifications?.some((cert) => cert.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">
                Verification
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
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
                          gap: "4px",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: "bold",
                            color: "#1e1b4b",
                            fontSize: "10px",
                            textTransform: "uppercase",
                            lineHeight: 1.25,
                            fontFamily: fonts.heading,
                          }}
                        >
                          {cert.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "9px",
                            fontWeight: 500,
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "-0.025em",
                            fontStyle: "italic",
                            fontFamily: fonts.body,
                          }}
                        >
                          {cert.issuer}
                        </p>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "bold",
                            color: theme.accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.1rem",
                            fontFamily: fonts.body,
                          }}
                        >
                          {cert.date}
                        </span>
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

export default CorporateTemplate;
