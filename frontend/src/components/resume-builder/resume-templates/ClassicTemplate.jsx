import React from "react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers";

const ClassicTemplate = ({ data }) => {
  const {
    personalInfo,
    sectionTitles,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    customizations: c,
  } = data;

  const theme = {
    accent: c?.colors?.accent || "#000000",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "11pt",
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

  const titles = sectionTitles || {};

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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Centered Header */}
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            color: getColor("name", "#000000"),
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "4px",
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-2 text-[10px] font-bold">
          {personalInfo.phone && (
            <>
              <span>{personalInfo.phone}</span>
              <span className="text-zinc-300">|</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span>{personalInfo.email}</span>
              <span className="text-zinc-300">|</span>
            </>
          )}
          {(personalInfo.links || []).map(
            (link, i) =>
              link.url && (
                <React.Fragment key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.label || "Link"}
                  </a>
                  <span className="text-zinc-300">|</span>
                </React.Fragment>
              ),
          )}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      <div className="space-y-3">
        {/* Profile / Objective */}
        {personalInfo.objective && (
          <section>
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
              {titles.objective || "Profile"}
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#18181b",
                textAlign: "justify",
                lineHeight: 1.4,
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
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: getColor("headings", "#000000"),
                borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                paddingBottom: "2px",
                marginBottom: "8px",
                textTransform: "uppercase",
                fontFamily: fonts.heading,
              }}
            >
              {titles.experience || "Work Experience"}
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {experience.map(
                (exp, i) =>
                  exp.visible !== false && (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "2px",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            color: "#18181b",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {exp.title || "(Job Title)"}
                        </h3>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            color: "#18181b",
                            fontFamily: fonts.body,
                          }}
                        >
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "4px",
                        }}
                      >
                        <p
                          style={{
                            fontStyle: "italic",
                            fontSize: "0.75rem",
                            color: "#52525b",
                            fontFamily: fonts.body,
                          }}
                        >
                          {exp.company || "Company Name"}
                        </p>
                        <p
                          style={{
                            fontStyle: "italic",
                            fontSize: "9px",
                            color: "#71717a",
                            fontFamily: fonts.body,
                          }}
                        >
                          {exp.location}
                        </p>
                      </div>
                      {exp.description && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#3f3f46",
                            lineHeight: 1.4,
                            textAlign: "justify",
                            whiteSpace: "pre-wrap",
                            paddingLeft: "0.25rem",
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
                fontWeight: "bold",
                color: getColor("headings", "#000000"),
                borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                paddingBottom: "2px",
                marginBottom: "8px",
                textTransform: "uppercase",
                fontFamily: fonts.heading,
              }}
            >
              {titles.projects || "Projects"}
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
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
                          marginBottom: "2px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "baseline",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              color: "#18181b",
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
                                fontSize: "9px",
                                fontWeight: "bold",
                                color: "#71717a",
                                textDecoration: "none",
                                fontFamily: fonts.body,
                              }}
                            >
                              [Link]
                            </a>
                          )}
                        </div>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            color: "#18181b",
                            fontFamily: fonts.body,
                          }}
                        >
                          {proj.year || "2025"}
                        </span>
                      </div>
                      {proj.description && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#3f3f46",
                            lineHeight: 1.4,
                            textAlign: "justify",
                            whiteSpace: "pre-wrap",
                            paddingLeft: "0.25rem",
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

        {/* Technical Skills */}
        {skills?.some((skill) => skill.visible !== false) && (
          <section>
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: getColor("headings", "#000000"),
                borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                paddingBottom: "2px",
                marginBottom: "8px",
                textTransform: "uppercase",
                fontFamily: fonts.heading,
              }}
            >
              {titles.skills || "Technical Skills"}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                columnGap: "2rem",
                rowGap: "4px",
              }}
            >
              {skills.map(
                (skill, index) =>
                  skill.visible !== false && (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "4px",
                        fontSize: "0.75rem",
                        fontFamily: fonts.body,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          color: "#18181b",
                        }}
                      >
                        {skill.category}:
                      </span>
                      <span style={{ color: "#3f3f46" }}>
                        {skill.subSkills}
                      </span>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {education?.some((edu) => edu.visible !== false) && (
          <section>
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: getColor("headings", "#000000"),
                borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                paddingBottom: "2px",
                marginBottom: "8px",
                textTransform: "uppercase",
                fontFamily: fonts.heading,
              }}
            >
              {titles.education || "Education"}
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {education.map(
                (edu, i) =>
                  edu.visible !== false && (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "2px",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            color: "#18181b",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {edu.institution}
                        </h3>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            color: "#18181b",
                            fontFamily: fonts.body,
                          }}
                        >
                          {formatDate(edu.startDate)} -{" "}
                          {formatDate(edu.endDate)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <p
                          style={{
                            fontStyle: "italic",
                            fontSize: "0.75rem",
                            color: "#52525b",
                            fontFamily: fonts.body,
                          }}
                        >
                          {edu.degree} {edu.gpa && `— CGPA: ${edu.gpa}`}
                        </p>
                        <p
                          style={{
                            fontStyle: "italic",
                            fontSize: "9px",
                            color: "#71717a",
                            fontFamily: fonts.body,
                          }}
                        >
                          {edu.location}
                        </p>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Achievements & Recognition */}
        {achievements?.some((ach) => ach.visible !== false) && (
          <section>
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: getColor("headings", "#000000"),
                borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#d4d4d8"}`,
                paddingBottom: "2px",
                marginBottom: "8px",
                textTransform: "uppercase",
                fontFamily: fonts.heading,
              }}
            >
              {titles.achievements || "Achievements & Recognition"}
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {achievements.map(
                (ach, i) =>
                  ach.visible !== false && (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          fontSize: "0.75rem",
                          fontFamily: fonts.body,
                        }}
                      >
                        <div style={{ display: "flex", gap: "4px" }}>
                          <span
                            style={{ fontWeight: "bold", color: "#18181b" }}
                          >
                            • {ach.title}
                          </span>
                          <span style={{ color: "#71717a" }}>
                            — {ach.description}
                          </span>
                        </div>
                        <span
                          style={{
                            fontStyle: "italic",
                            fontSize: "9px",
                            whiteSpace: "nowrap",
                            color: "#a1a1aa",
                          }}
                        >
                          {ach.date}
                        </span>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
