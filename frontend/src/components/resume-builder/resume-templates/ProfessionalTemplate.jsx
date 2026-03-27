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

/**
 * ProfessionalTemplate - Dynamic version
 * Standard professional layout with full customization support.
 */
const ProfessionalTemplate = ({ data }) => {
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

  const titles = sectionTitles || {};

  const theme = {
    accent: c?.colors?.accent || "#3b82f6",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Source Serif Pro",
    fontHeading: c?.fonts?.headings || "Source Serif Pro",
    fontSize: c?.layout?.spacing?.fontSize || "10pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.15,
    margin: c?.layout?.spacing?.margin || {
      left: "25mm",
      right: "25mm",
      top: "20mm",
      bottom: "20mm",
    },
    columnLayout: c?.layout?.columns || "one",
    headingCase: c?.sectionHeadings?.capitalization || "uppercase",
    subtitleStyle: c?.entryLayout?.subtitleStyle || "bold",
    subtitlePlacement: c?.entryLayout?.subtitlePlacement || "next-line",
    dateFormat: c?.dateFormat || "DD/MM/YYYY",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    spaceBetweenEntries: c?.layout?.spacing?.spaceBetweenEntries || 10,
    language: c?.language || "English (UK)",
    applyTo: c?.colors?.applyTo || {
      name: true,
      jobTitle: true,
      headings: true,
      headingsLine: true,
    },
    profileImage: c?.profileImage || {
      style: "rounded",
      borderRadius: 8,
      size: 80,
    },
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const containerStyle = {
    padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} ${theme.margin.left}`,
    fontFamily: fonts.body,
    fontSize: theme.fontSize,
    lineHeight: theme.lineHeight,
    color: theme.text,
    backgroundColor: theme.background,
    width: "100%",
    minHeight: "297mm",
    display: "flex",
    flexDirection: "column",
  };

  const SectionHeader = ({ title }) => (
    <h2
      style={{
        color: getColor("headings"),
        fontFamily: fonts.heading,
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "0.25rem",
        marginBottom: "1rem",
        textTransform: theme.headingCase,
        fontSize: "1em",
        fontWeight: "bold",
        letterSpacing: "0.05em",
      }}
    >
      {title}
    </h2>
  );

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  const getLinkIcon = (label, url) => {
    const text = (label + url).toLowerCase();
    if (text.includes("linkedin")) return <Linkedin size={12} />;
    if (text.includes("github")) return <Github size={12} />;
    return <LinkIcon size={12} />;
  };

  return (
    <div style={containerStyle}>
      {/* Header - Centered for Professional */}
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "2.2em",
            fontWeight: "bold",
            color: getColor("name"),
            marginBottom: "0.25rem",
            textTransform: theme.headingCase,
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <p
          style={{
            fontSize: "1em",
            color: getColor("jobTitle", "#4b5563"),
            fontWeight: "500",
            marginBottom: "0.75rem",
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.jobTitle || "Job Title"}
        </p>

        {personalInfo.objective && (
          <p
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.9em",
              color: theme.text,
              fontFamily: fonts.body,
              marginBottom: "1rem",
            }}
          >
            {personalInfo.objective}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8em",
            color: "#4b5563",
          }}
        >
          {personalInfo.email && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: getColor("headerIcons", "#4b5563"),
              }}
            >
              <Mail size={12} />{" "}
              <span style={{ color: "#4b5563" }}>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: getColor("headerIcons", "#4b5563"),
              }}
            >
              <Phone size={12} />{" "}
              <span style={{ color: "#4b5563" }}>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: getColor("headerIcons", "#4b5563"),
              }}
            >
              <MapPin size={12} />{" "}
              <span style={{ color: "#4b5563" }}>{personalInfo.location}</span>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ color: getColor("linkIcons", "#4b5563") }}>
                    {getLinkIcon(link.label, link.url)}
                  </span>
                  <span style={{ color: "#4b5563" }}>{link.label}</span>
                </a>
              ),
          )}
        </div>

        {personalInfo.photoUrl && (
          <div
            style={{
              width: `${theme.profileImage.size}px`,
              height: `${theme.profileImage.size}px`,
              borderRadius:
                theme.profileImage.style === "circle"
                  ? "50%"
                  : theme.profileImage.style === "square"
                    ? "0"
                    : `${theme.profileImage.borderRadius}px`,
              overflow: "hidden",
              border: `2px solid ${theme.border}`,
              margin: "1rem auto 0 auto",
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
      </header>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Experience */}
        {experience?.some((exp) => exp.visible !== false) && (
          <section>
            <SectionHeader title={titles.experience || "Experience"} />
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
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "2px",
                          flexDirection:
                            theme.subtitlePlacement === "next-line"
                              ? "column"
                              : "row",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1em",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            alignSelf: "start",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {exp.title}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width:
                              theme.subtitlePlacement === "next-line"
                                ? "100%"
                                : "auto",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.85em",
                              fontWeight:
                                theme.subtitleStyle === "bold"
                                  ? "bold"
                                  : "normal",
                              fontStyle:
                                theme.subtitleStyle === "italic"
                                  ? "italic"
                                  : "normal",
                              color: getColor("entrySubtitle", "#4b5563"),
                              fontFamily: fonts.body,
                            }}
                          >
                            {exp.company} {exp.location && `• ${exp.location}`}
                          </p>
                          <span
                            style={{
                              fontSize: "0.75em",
                              color: getColor("dates", "#6b7280"),
                              fontWeight: "500",
                            }}
                          >
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                      {exp.description && (
                        <p
                          style={{
                            fontSize: "0.9em",
                            marginTop: "0.5rem",
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

        {/* Education */}
        {education?.some((edu) => edu.visible !== false) && (
          <section>
            <SectionHeader title={titles.education || "Education"} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${theme.spaceBetweenEntries}px`,
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
                          alignItems: "center",
                          marginBottom: "2px",
                          flexDirection:
                            theme.subtitlePlacement === "next-line"
                              ? "column"
                              : "row",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "0.8em",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {edu.degree}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width:
                              theme.subtitlePlacement === "next-line"
                                ? "100%"
                                : "auto",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.75em",
                              fontWeight:
                                theme.subtitleStyle === "bold"
                                  ? "bold"
                                  : "normal",
                              fontStyle:
                                theme.subtitleStyle === "italic"
                                  ? "italic"
                                  : "normal",
                              color: "#374151",
                              fontFamily: fonts.body,
                            }}
                          >
                            {edu.institution}
                          </p>
                          <span
                            style={{
                              fontSize: "0.75em",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            {formatDate(edu.startDate)} -{" "}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                      </div>
                      {edu.gpa && (
                        <p
                          style={{
                            fontSize: "0.75em",
                            color: getColor("dotsBarsBubbles", "#4b5563"),
                            fontFamily: fonts.body,
                          }}
                        >
                          GPA: {edu.gpa}
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
            <SectionHeader title={titles.projects || "Projects"} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${theme.spaceBetweenEntries}px`,
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
                          alignItems: "center",
                          marginBottom: "2px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {proj.link ? (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "1em",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                color: theme.text,
                                textDecoration: "none",
                                fontFamily: fonts.heading,
                              }}
                            >
                              {proj.title}
                            </a>
                          ) : (
                            <h3
                              style={{
                                fontSize: "1em",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                fontFamily: fonts.heading,
                              }}
                            >
                              {proj.title}
                            </h3>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "0.75em",
                                fontWeight: "bold",
                                color: theme.accent,
                                textDecoration: "none",
                              }}
                            >
                              [LINK]
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "0.75em",
                                fontWeight: "bold",
                                color: theme.accent,
                                textDecoration: "none",
                              }}
                            >
                              [CODE]
                            </a>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "0.75em",
                            color: getColor("dates", "#6b7280"),
                            fontWeight: "500",
                          }}
                        >
                          {proj.startDate &&
                            `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                        </span>
                      </div>
                      {proj.description && (
                        <p
                          style={{
                            fontSize: "0.9em",
                            marginTop: "4px",
                            whiteSpace: "pre-wrap",
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

        {/* Skills */}
        {skills?.some((skill) => skill.visible !== false) && (
          <section>
            <SectionHeader title={titles.skills || "Skills"} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  theme.columnLayout === "two" ? "1fr" : "repeat(3, 1fr)",
                gap: `${theme.spaceBetweenEntries * 0.5}px`,
              }}
            >
              {skills.map(
                (skill, index) =>
                  skill.visible !== false && (
                    <div key={index}>
                      <h3
                        style={{
                          fontSize: "0.6em",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          color: "#a1a1aa",
                          fontFamily: fonts.heading,
                        }}
                      >
                        {skill.category}
                      </h3>
                      <p style={{ fontSize: "0.75em", fontWeight: "medium" }}>
                        {skill.subSkills}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications?.some((cert) => cert.visible !== false) && (
          <section>
            <SectionHeader title={titles.certifications || "Certifications"} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${theme.spaceBetweenEntries * 0.5}px`,
              }}
            >
              {certifications.map(
                (cert, i) =>
                  cert.visible !== false && (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "0.65em",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {cert.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.6em",
                            fontWeight: "bold",
                            color: getColor("entrySubtitle", "#71717a"),
                            textTransform: "uppercase",
                          }}
                        >
                          {cert.issuer}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.6em",
                          fontWeight: "bold",
                          color: "#a1a1aa",
                          textTransform: "uppercase",
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
  );
};

export default ProfessionalTemplate;
