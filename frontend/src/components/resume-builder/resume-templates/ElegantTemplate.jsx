import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Award,
  Globe2,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers";

/**
 * ElegantTemplate - A structured, professional template with a left-aligned date column.
 * Inspired by the provided design image.
 */
const ElegantTemplate = ({ data }) => {
  const {
    personalInfo,
    sectionTitles,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    languages,
    customizations: c,
  } = data;

  const titles = sectionTitles || {};

  const theme = {
    accent: c?.colors?.accent || "#e5e6e3", // Default header bg
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e5e7eb",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "11pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.3,
    margin: c?.layout?.spacing?.margin || {
      left: "15mm",
      right: "15mm",
      top: "15mm",
      bottom: "15mm",
    },
    dateFormat: c?.dateFormat || "DD/MM/YYYY",
    language: c?.language || "English (UK)",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    headingCase: c?.sectionHeadings?.capitalization || "uppercase",
    subtitleStyle: c?.entryLayout?.subtitleStyle || "italic",
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

  const SectionHeader = ({ title }) => (
    <div
      style={{
        backgroundColor: theme.applyTo.headings ? theme.accent : "#f3f4f6",
        padding: "4px 0",
        textAlign: "center",
        marginBottom: "1em",
        marginTop: "1.5em",
        borderRadius: "2px",
        borderLeft: theme.applyTo.headingsLine
          ? `4px solid ${theme.accent}`
          : "none",
        borderRight: theme.applyTo.headingsLine
          ? `4px solid ${theme.accent}`
          : "none",
      }}
    >
      <h2
        style={{
          fontSize: "0.85em",
          fontWeight: "bold",
          textTransform: theme.headingCase,
          letterSpacing: "0.15em",
          color: "#374151",
          fontFamily: fonts.heading,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: fonts.body,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        width: "100%",
        height: "100%",
        padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} ${theme.margin.left}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: theme.accent,
          padding: "2em",
          paddingLeft: "5em",
          margin: `-${theme.margin.top} -${theme.margin.right} 1.5em -${theme.margin.left}`,
          gap: "2em",
        }}
      >
        {personalInfo.photoUrl && (
          <div
            style={{
              width: `${c?.profileImage?.size || 100}px`,
              height: `${c?.profileImage?.size || 100}px`,
              borderRadius:
                c?.profileImage?.style === "circle"
                  ? "50%"
                  : c?.profileImage?.style === "square"
                    ? "0"
                    : `${c?.profileImage?.borderRadius || 8}px`,
              overflow: "hidden",
              border: `4px solid ${theme.background}`,
              flexShrink: 0,
            }}
          >
            <img
              src={personalInfo.photoUrl}
              alt={`${personalInfo.fullName || "Profile"} photo`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.2em",
              fontWeight: "bold",
              margin: "0 0 4px 0",
              color: "#111827",
              fontFamily: fonts.heading,
              textTransform: "uppercase",
            }}
          >
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim()}
          </h1>
          <p
            style={{
              fontSize: "1.1em",
              color: "#4b5563",
              margin: "0 0 1em 0",
              fontFamily: fonts.heading,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {personalInfo.jobTitle}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px 1.5em",
              fontSize: "0.85em",
            }}
          >
            {personalInfo.email && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Mail size={14} style={{ color: "#6b7280" }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Phone size={14} style={{ color: "#6b7280" }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MapPin size={14} style={{ color: "#6b7280" }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {(personalInfo.links || []).map((link, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Globe2 size={14} style={{ color: "#6b7280" }} />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {link.label || link.url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Profile */}
      {personalInfo.objective && (
        <section>
          <SectionHeader title={titles.objective || "Profile"} />
          <p
            style={{
              textAlign: "justify",
              fontSize: "0.9em",
              color: theme.text,
              fontFamily: fonts.body,
            }}
          >
            {personalInfo.objective}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {experience?.some((exp) => exp.visible !== false) && (
        <section>
          <SectionHeader title={titles.experience || "Work Experience"} />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.2em" }}
          >
            {experience.map(
              (exp, i) =>
                exp.visible !== false && (
                  <div
                    key={i}
                    style={{ display: "flex", gap: "2em", marginBottom: "4px" }}
                  >
                    <div style={{ width: "120px", flexShrink: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85em",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {formatDate(exp.startDate)} —{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8em",
                          color: "#6b7280",
                          margin: "4px 0 0 0",
                          fontFamily: fonts.body,
                        }}
                      >
                        {exp.location}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "0.9em",
                          fontWeight: "bold",
                          margin: 0,
                          fontFamily: fonts.heading,
                          color: getColor("entrySubtitle"),
                        }}
                      >
                        {exp.company}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.85em",
                          color: getColor("jobTitle", "#4b5563"),
                          fontWeight:
                            theme.subtitleStyle === "bold" ? "bold" : "normal",
                          fontStyle:
                            theme.subtitleStyle === "italic"
                              ? "italic"
                              : "normal",
                          margin: "2px 0 8px 0",
                          fontFamily: fonts.body,
                        }}
                      >
                        {exp.title}
                      </p>
                      <div
                        style={{
                          fontSize: "0.8em",
                          color: theme.text,
                          fontFamily: fonts.body,
                          lineHeight: 1.4,
                        }}
                      >
                        {formatDescriptionList(
                          exp.description,
                          theme.listStyle,
                        )}
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects?.some((proj) => proj.visible !== false) && (
        <section>
          <SectionHeader title={titles.projects || "Projects"} />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.2em" }}
          >
            {projects.map(
              (proj, i) =>
                proj.visible !== false && (
                  <div
                    key={i}
                    style={{ display: "flex", gap: "2em", marginBottom: "4px" }}
                  >
                    <div style={{ width: "120px", flexShrink: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85em",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {proj.startDate && formatDate(proj.startDate)}{" "}
                        {proj.endDate && `— ${formatDate(proj.endDate)}`}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "0.95em",
                            fontWeight: "bold",
                            margin: 0,
                            fontFamily: fonts.heading,
                          }}
                        >
                          {proj.title}
                        </h3>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.8em",
                              color: "#6b7280",
                              textDecoration: "none",
                            }}
                          >
                            [Link]
                          </a>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85em",
                          color: "#374151",
                          marginTop: "4px",
                          fontFamily: fonts.body,
                        }}
                      >
                        {formatDescriptionList(
                          proj.description,
                          theme.listStyle,
                        )}
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {education?.some((edu) => edu.visible !== false) && (
        <section>
          <SectionHeader title={titles.education || "Education"} />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.2em" }}
          >
            {education.map(
              (edu, i) =>
                edu.visible !== false && (
                  <div key={i} style={{ display: "flex", gap: "2em" }}>
                    <div style={{ width: "120px", flexShrink: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85em",
                          fontWeight: 600,
                          margin: 0,
                          fontFamily: fonts.body,
                        }}
                      >
                        {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8em",
                          color: "#6b7280",
                          margin: "4px 0 0 0",
                          fontFamily: fonts.body,
                        }}
                      >
                        {edu.location}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "0.9em",
                          fontWeight: "bold",
                          margin: 0,
                          fontFamily: fonts.heading,
                        }}
                      >
                        {edu.degree}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.85em",
                          color: "#4b5563",
                          fontWeight:
                            theme.subtitleStyle === "bold" ? "bold" : "normal",
                          fontStyle:
                            theme.subtitleStyle === "italic"
                              ? "italic"
                              : "normal",
                          margin: "2px 0 0 0",
                          fontFamily: fonts.body,
                        }}
                      >
                        {edu.institution}
                      </p>
                      {edu.gpa && (
                        <p
                          style={{
                            fontSize: "0.8em",
                            color: "#6b7280",
                            margin: "4px 0 0 0",
                            fontFamily: fonts.body,
                          }}
                        >
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills?.some((s) => s.visible !== false) && (
        <section>
          <SectionHeader title={titles.skills || "Skills"} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1em",
              fontSize: "0.85em",
            }}
          >
            {skills.map(
              (skill, i) =>
                skill.visible !== false && (
                  <div key={i}>
                    <h4
                      style={{
                        fontWeight: "bold",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        fontSize: "0.75em",
                        color: "#6b7280",
                        fontFamily: fonts.heading,
                      }}
                    >
                      {skill.category}
                    </h4>
                    <p style={{ color: theme.text, fontFamily: fonts.body }}>
                      {skill.subSkills}
                    </p>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages?.some((l) => l.visible !== false) && (
        <section>
          <SectionHeader title={titles.languages || "Languages"} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5em 3em",
            }}
          >
            {languages.map(
              (lang, i) =>
                lang.visible !== false && (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9em",
                        fontWeight: 600,
                        fontFamily: fonts.body,
                      }}
                    >
                      {lang.language}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor:
                              dot <=
                              (lang.level === "Native"
                                ? 5
                                : lang.level === "Professional"
                                  ? 4
                                  : lang.level === "Intermediate"
                                    ? 3
                                    : 2)
                                ? "#374151"
                                : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Awards / Achievements */}
      {achievements?.some((a) => a.visible !== false) && (
        <section>
          <SectionHeader title={titles.achievements || "Awards"} />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.8em" }}
          >
            {achievements.map(
              (ach, i) =>
                ach.visible !== false && (
                  <div key={i}>
                    <h3
                      style={{
                        fontSize: "0.9em",
                        fontWeight: "bold",
                        margin: 0,
                        fontFamily: fonts.heading,
                      }}
                    >
                      {ach.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85em",
                        color: "#4b5563",
                        margin: "2px 0",
                        fontFamily: fonts.body,
                      }}
                    >
                      {ach.description}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8em",
                        color: "#9ca3af",
                        fontFamily: fonts.body,
                      }}
                    >
                      {ach.date}
                    </p>
                  </div>
                ),
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ElegantTemplate;
