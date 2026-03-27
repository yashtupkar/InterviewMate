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
  getLinkIcon,
} from "../../../utils/resumeHelpers.jsx";

/**
 * ModernTemplate - Dynamic version
 * Supports full customization of colors, fonts, layout, and spacing.
 */
const ModernTemplate = ({ data }) => {
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
    customSections,
    customizations: c,
  } = data;

  const titles = sectionTitles || {};

  // Default values if customizations are missing
  const theme = {
    accent: c?.colors?.accent || "#bef264",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "10.5pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.15,
    margin: c?.layout?.spacing?.margin || {
      left: "22mm",
      right: "22mm",
      top: "12mm",
      bottom: "12mm",
    },
    columnLayout: c?.layout?.columns || "two",
    headingCase: c?.sectionHeadings?.capitalization || "uppercase",
    subtitleStyle: c?.entryLayout?.subtitleStyle || "bold",
    subtitlePlacement: c?.entryLayout?.subtitlePlacement || "next-line",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    language: c?.language || "English (UK)",
    dateFormat: c?.dateFormat || "DD/MM/YYYY",
    spaceBetweenEntries: c?.layout?.spacing?.spaceBetweenEntries || 10,
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

  // Simple date format helper
  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  const SectionHeader = ({ title }) => (
    <h2
      style={{
        color: getColor("headings"),
        fontFamily: fonts.heading,
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "0.25rem",
        marginBottom: "1rem",
        textTransform: theme.headingCase,
        fontSize: "1.1em",
        fontWeight: "bold",
        letterSpacing: "0.05em",
      }}
    >
      {title}
    </h2>
  );

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

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header
        style={{
          marginBottom: "1.5rem",
          borderBottom: `2px solid ${theme.border}`,
          paddingBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.5em",
              fontWeight: 900,
              color: getColor("name"),
              margin: 0,
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
              fontSize: "1.125em",
              color: getColor("jobTitle"),
              fontWeight: "bold",
              marginBottom: "0.75rem",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              fontSize: "0.75em",
              fontWeight: 500,
              color: "#52525b",
            }}
          >
            {personalInfo.email && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: getColor("headerIcons", "#52525b"),
                }}
              >
                <Mail size={12} />{" "}
                <span style={{ color: "#52525b" }}>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: getColor("headerIcons", "#52525b"),
                }}
              >
                <Phone size={12} />{" "}
                <span style={{ color: "#52525b" }}>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: getColor("headerIcons", "#52525b"),
                }}
              >
                <MapPin size={12} />{" "}
                <span style={{ color: "#52525b" }}>
                  {personalInfo.location}
                </span>
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
                      gap: "0.375rem",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        color: getColor("linkIcons", "#52525b"),
                        display: "flex",
                      }}
                    >
                      {getLinkIcon(link.label, link.url)}
                    </span>
                    <span style={{ color: "#52525b" }}>
                      {link.label || "Link"}
                    </span>
                  </a>
                ),
            )}
          </div>
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

      {/* Content Area */}
    <div
        style={{
          display: "grid",
          gridTemplateColumns: theme.columnLayout === "one" ? "1fr" : "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Main Content (Left or Full) */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Profiles/Summaries */}
          {profiles?.some((p) => p.visible !== false && p.content) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {profiles.map(
                (profile, i) =>
                  profile.visible !== false &&
                  profile.content && (
                    <section key={i}>
                      <SectionHeader
                        title={profile.title || titles.profiles || "Summary"}
                      />
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: "0.875em",
                          fontFamily: fonts.body,
                        }}
                      >
                        {profile.content}
                      </p>
                    </section>
                  ),
              )}
            </div>
          )}

          {/* Custom Sections (Render in main column) */}
          {customSections?.map(
            (section) =>
              section.entries?.some((e) => e.visible !== false) && (
                <section key={section.id}>
                  <SectionHeader title={section.title} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: `${theme.spaceBetweenEntries}px`,
                    }}
                  >
                    {section.entries.map(
                      (entry, i) =>
                        entry.visible !== false && (
                          <div
                            key={i}
                            style={{
                              paddingLeft: "0.75rem",
                              borderLeft: `2px solid ${theme.border}`,
                            }}
                          >
                            <h3
                              style={{
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                fontSize: "0.875em",
                                fontFamily: fonts.heading,
                                marginBottom: "2px",
                              }}
                            >
                              {entry.link ? (
                                <a
                                  href={entry.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "inherit",
                                    textDecoration: "none",
                                  }}
                                >
                                  {entry.title}
                                </a>
                              ) : (
                                entry.title
                              )}
                            </h3>
                            {entry.subtitle && (
                              <p
                                style={{
                                  fontSize: "0.9em",
                                  fontStyle: "italic",
                                  color: "#71717a",
                                  marginBottom: "4px",
                                }}
                              >
                                {entry.subtitle}
                              </p>
                            )}
                            {entry.content && (
                              <p
                                style={{
                                  fontSize: "0.85em",
                                  whiteSpace: "pre-wrap",
                                  color: "#52525b",
                                  fontFamily: fonts.body,
                                }}
                              >
                                {formatDescriptionList(
                                  entry.content,
                                  theme.listStyle,
                                )}
                              </p>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </section>
              ),
          )}

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
                      <div
                        key={i}
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: `2px solid ${theme.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "2px",
                            flexDirection:
                              theme.subtitlePlacement === "next-line"
                                ? "column"
                                : "row",
                          }}
                        >
                          <h3
                            style={{
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              fontSize: "0.875em",
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
                                fontSize: "0.8em",
                                fontWeight:
                                  theme.subtitleStyle === "bold"
                                    ? "bold"
                                    : "normal",
                                fontStyle:
                                  theme.subtitleStyle === "italic"
                                    ? "italic"
                                    : "normal",
                                color: getColor("entrySubtitle", "#52525b"),
                                fontFamily: fonts.body,
                              }}
                            >
                              {exp.company}{" "}
                              {exp.location && `• ${exp.location}`}
                            </p>
                            <span
                              style={{
                                fontSize: "0.7em",
                                fontWeight: "bold",
                                color: getColor("dates"),
                                textTransform: "uppercase",
                                backgroundColor: "#fafafa",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontFamily: fonts.body,
                              }}
                            >
                              {formatDate(exp.startDate)} -{" "}
                              {exp.current
                                ? "Present"
                                : formatDate(exp.endDate)}
                            </span>
                          </div>
                        </div>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: "0.85em",
                              marginTop: "4px",
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
                      <div
                        key={i}
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: `2px solid ${theme.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
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
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                  fontSize: "0.875em",
                                  fontFamily: fonts.heading,
                                  color: theme.text,
                                  textDecoration: "none",
                                }}
                              >
                                {proj.title}
                              </a>
                            ) : (
                              <h3
                                style={{
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                  fontSize: "0.875em",
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
                                  fontSize: "0.7em",
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
                                  fontSize: "0.7em",
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
                              fontSize: "0.7em",
                              fontWeight: "bold",
                              color: getColor("dates"),
                              textTransform: "uppercase",
                              backgroundColor: "#fafafa",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontFamily: fonts.body,
                            }}
                          >
                            {proj.startDate &&
                              `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                          </span>
                        </div>
                        {proj.description && (
                          <p
                            style={{
                              fontSize: "0.85em",
                              marginTop: "2px",
                              whiteSpace: "pre-wrap",
                              color: "#52525b",
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

          {theme.columnLayout === "one" && (
            <SidebarContent
              titles={titles}
              skills={skills}
              education={education}
              certifications={certifications}
              theme={theme}
              fonts={fonts}
              formatDate={formatDate}
            />
          )}
        </div>

        {/* Sidebar (Right) - Only if two columns */}
        {theme.columnLayout !== "one" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <SidebarContent
              titles={titles}
              skills={skills}
              education={education}
              certifications={certifications}
              theme={theme}
              fonts={fonts}
              formatDate={formatDate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SidebarContent = ({
  titles,
  skills,
  education,
  certifications,
  theme,
  fonts,
  formatDate,
}) => {
  const SectionHeader = ({ title }) => (
    <h2
      style={{
        color: theme.applyTo.headings ? theme.accent : theme.text,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Skills */}
      {skills?.some((skill) => skill.visible !== false) && (
        <section>
          <SectionHeader title={titles.skills || "Skills"} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${theme.spaceBetweenEntries * 0.75}px`,
            }}
          >
            {skills.map(
              (skill, index) =>
                skill.visible !== false && (
                  <div key={index}>
                    <h3
                      style={{
                        fontSize: "0.6em",
                        fontWeight: 900,
                        color: "#a1a1aa",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        marginBottom: "2px",
                        fontFamily: fonts.heading,
                      }}
                    >
                      {skill.category}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8em",
                        fontWeight: "bold",
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
                    <p
                      style={{
                        fontSize: "0.8em",
                        color: "#52525b",
                        fontFamily: fonts.body,
                      }}
                    >
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8em",
                        fontWeight:
                          theme.subtitleStyle === "bold" ? "bold" : "normal",
                        fontStyle:
                          theme.subtitleStyle === "italic"
                            ? "italic"
                            : "normal",
                        color: theme.applyTo.entrySubtitle
                          ? theme.accent
                          : "#52525b",
                        fontFamily: fonts.body,
                      }}
                    >
                      {edu.institution}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.7em",
                        fontWeight: "bold",
                        color: theme.applyTo.dates ? theme.accent : "#52525b",
                        textTransform: "uppercase",
                        marginTop: "2px",
                        fontFamily: fonts.body,
                      }}
                    >
                      <span>
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                      {edu.gpa && (
                        <span
                          style={{
                            color: theme.applyTo.dotsBarsBubbles
                              ? theme.accent
                              : "#52525b",
                          }}
                        >
                          GPA: {edu.gpa}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p
                        style={{
                          fontSize: "0.75em",
                          marginTop: "0.25rem",
                          color: "#71717a",
                          whiteSpace: "pre-wrap",
                          fontFamily: fonts.body,
                        }}
                      >
                        {formatDescriptionList(
                          edu.description,
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
                      border: `1px solid ${theme.border}`,
                      padding: "0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.8em",
                        textTransform: "uppercase",
                        fontFamily: fonts.heading,
                      }}
                    >
                      {cert.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.7em",
                        fontWeight: "bold",
                        color: theme.applyTo.entrySubtitle
                          ? theme.accent
                          : "#52525b",
                        fontFamily: fonts.body,
                      }}
                    >
                      {cert.issuer}
                    </p>
                    <p
                      style={{
                        fontSize: "0.6em",
                        fontWeight: "bold",
                        color: "#a1a1aa",
                        textTransform: "uppercase",
                        marginTop: "2px",
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
  );
};

export default ModernTemplate;
