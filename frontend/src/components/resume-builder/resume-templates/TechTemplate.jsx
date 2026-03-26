import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
  Cpu,
  Layers,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers";

const TechTemplate = ({ data }) => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    customizations: c,
  } = data;

  const theme = {
    accent: c?.colors?.accent || "#bef264",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "10pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.15,
    margin: c?.layout?.spacing?.margin || {
      left: "15mm",
      right: "15mm",
      top: "15mm",
      bottom: "15mm",
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
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: fonts.body,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        overflow: "hidden",
      }}
    >
      {/* Dark Sidebar */}
      <aside className="w-[240px] bg-zinc-900 text-zinc-100 p-6 flex flex-col shrink-0">
        {personalInfo.photoUrl && (
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-lime-400/30 mb-6 self-center shadow-2xl">
            <img
              src={personalInfo.photoUrl}
              alt={`${personalInfo.fullName || "Profile"} photo`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6 flex-1">
          {/* Contact in Sidebar */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span>{" "}
              Contact
            </h2>
            <div className="space-y-3 text-[11px]">
              {personalInfo.email && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 shrink-0" />{" "}
                  <span className="truncate">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 shrink-0" />{" "}
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{" "}
                  <span>{personalInfo.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills in Sidebar */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span>{" "}
                Stack
              </h2>
              <div className="space-y-4">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index}>
                        <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          {skill.category}
                        </h3>
                        <p className="text-[11px] font-medium text-zinc-200 leading-tight">
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Links at bottom of Sidebar */}
        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="flex flex-wrap gap-3">
            {(personalInfo.links || []).map(
              (link, i) =>
                link.url && (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-lime-400 transition-colors"
                  >
                    {getLinkIcon(link.label, link.url)}
                  </a>
                ),
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-hidden bg-white">
        <header className="mb-8">
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: getColor("name"),
              marginBottom: "0.25rem",
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
              color: getColor("jobTitle", theme.accent),
              fontWeight: "bold",
              textTransform: "uppercase",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.jobTitle || "Software Engineer"}
          </p>
        </header>

        <div className="space-y-6">
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <h2
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#a1a1aa",
                  marginBottom: "0.75rem",
                  fontFamily: fonts.heading,
                }}
              >
                About
              </h2>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#52525b",
                  lineHeight: 1.6,
                  borderLeft: `2px solid ${theme.accent}20`,
                  paddingLeft: "1rem",
                  fontFamily: fonts.body,
                }}
              >
                {personalInfo.objective}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#a1a1aa",
                  marginBottom: "1rem",
                  fontFamily: fonts.heading,
                }}
              >
                Experience
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: `${theme.spaceBetweenEntries}px`,
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
                            alignItems: "baseline",
                            marginBottom: "4px",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: theme.text,
                              textTransform: "uppercase",
                              fontSize: "0.875rem",
                              letterSpacing: "-0.01em",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {exp.title || "(Job Title)"}
                          </h3>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 900,
                              color: theme.accent,
                              backgroundColor: `${theme.accent}10`,
                              px: "8px",
                              py: "2px",
                              borderRadius: "9999px",
                              border: `1px solid ${theme.accent}20`,
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "#a1a1aa",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                            fontFamily: fonts.body,
                          }}
                        >
                          {exp.company} {exp.location && `• ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#52525b",
                              lineHeight: 1.5,
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
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#a1a1aa",
                  marginBottom: "1rem",
                  fontFamily: fonts.heading,
                }}
              >
                Selected Work
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div
                        key={i}
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#fafafa",
                          borderRadius: "0.75rem",
                          border: `1px solid ${theme.border}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: theme.text,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {proj.title}
                          </h3>
                          {proj.link && (
                            <LinkIcon size={12} style={{ color: "#d4d4d8" }} />
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#71717a",
                            lineHeight: 1.5,
                            fontFamily: fonts.body,
                          }}
                        >
                          {proj.description}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2rem",
            }}
          >
            {/* Education */}
            {education?.some((edu) => edu.visible !== false) && (
              <section>
                <h2
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#a1a1aa",
                    marginBottom: "0.75rem",
                    fontFamily: fonts.heading,
                  }}
                >
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
                        <div key={i}>
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: theme.text,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              marginBottom: "4px",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {edu.degree}
                          </h3>
                          <p
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: theme.accent,
                              fontFamily: fonts.body,
                            }}
                          >
                            {edu.institution}
                          </p>
                          <p
                            style={{
                              fontSize: "9px",
                              fontWeight: 900,
                              color: "#d4d4d8",
                              textTransform: "uppercase",
                              marginTop: "4px",
                              fontFamily: fonts.body,
                            }}
                          >
                            {edu.startDate} - {edu.endDate}
                          </p>
                        </div>
                      ),
                  )}
                </div>
              </section>
            )}

            {/* Certs */}
            {certifications?.some((cert) => cert.visible !== false) && (
              <section>
                <h2
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#a1a1aa",
                    marginBottom: "0.75rem",
                    fontFamily: fonts.heading,
                  }}
                >
                  Certification
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {certifications.map(
                    (cert, i) =>
                      cert.visible !== false && (
                        <div
                          key={i}
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              color: theme.text,
                              fontSize: "10px",
                              uppercase: true,
                              lineHeight: 1.25,
                              fontFamily: fonts.heading,
                            }}
                          >
                            {cert.name}
                          </h3>
                          <p
                            style={{
                              fontSize: "9px",
                              fontWeight: "bold",
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "-0.025em",
                              marginTop: "2px",
                              fontFamily: fonts.body,
                            }}
                          >
                            {cert.issuer} • {cert.date}
                          </p>
                        </div>
                      ),
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechTemplate;
