import React from "react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
  getLinkIcon,
} from "../../../utils/resumeHelpers.jsx";

/**
 * ClassicTemplate - Dynamic version
 * Elegant classic minimal resume layout with complete customization features.
 */
const ClassicTemplate = ({ data }) => {
  const {
    personalInfo = {},
    sectionTitles = {},
    profiles = [],
    experience = [],
    education = [],
    skills = [],
    projects = [],
    achievements = [],
    certifications = [],
    customSections = [],
    customizations: c = {},
  } = data;

  const titles = sectionTitles || {};

  const theme = {
    accent: c.colors?.accent || "#1e293b",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#d4d4d8",
    fontBody: c.fonts?.body || "Lora",
    fontHeading: c.fonts?.headings || "Lora",
    fontSize: c.layout?.spacing?.fontSize || "10.5pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.25,
    margin: c.layout?.spacing?.margin || {
      left: "20mm",
      right: "20mm",
      top: "15mm",
      bottom: "15mm",
    },
    columnLayout: c.layout?.columns || "one",
    headingCase: c.sectionHeadings?.capitalization || "uppercase",
    subtitleStyle: c.entryLayout?.subtitleStyle || "bold",
    subtitlePlacement: c.entryLayout?.subtitlePlacement || "next-line",
    listStyle: c.entryLayout?.listStyle || "bullet",
    language: c.language || "English (UK)",
    dateFormat: c.dateFormat || "DD/MM/YYYY",
    spaceBetweenEntries: c.layout?.spacing?.spaceBetweenEntries || 10,
    applyTo: c.colors?.applyTo || {
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
    profileImage: c.profileImage || {
      style: "rounded",
      borderRadius: 8,
      size: 80,
    },
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const getSubtitleStyle = () => {
    return {
      fontWeight: theme.subtitleStyle === "bold" ? "bold" : "normal",
      fontStyle: theme.subtitleStyle === "italic" ? "italic" : "normal",
      color: getColor("entrySubtitle", "#52525b"),
      fontFamily: fonts.body,
    };
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  const SectionHeader = ({ title }) => (
    <h2
      style={{
        color: getColor("headings", "#18181b"),
        fontFamily: fonts.heading,
        borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "2px",
        marginBottom: "8px",
        textTransform: theme.headingCase,
        fontSize: "1.05em",
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
    boxSizing: "border-box",
  };

  // Section Renderers
  const renderSummary = () => {
    const activeProfiles = profiles.filter((p) => p.visible !== false && p.content);
    if (activeProfiles.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {activeProfiles.map((profile, i) => (
          <section key={i} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader title={profile.title || titles.profiles || "Profile"} />
            <p style={{ fontSize: "0.95em", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
              {profile.content}
            </p>
          </section>
        ))}
      </div>
    );
  };

  const renderExperience = () => {
    const activeExperience = experience.filter((exp) => exp.visible !== false);
    if (activeExperience.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.experience || "Work Experience"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeExperience.map((exp, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#18181b", fontFamily: fonts.heading }}>
                  {exp.title}
                </h3>
                <span style={{ fontWeight: "bold", fontSize: "0.9em", color: getColor("dates", "#18181b"), fontFamily: fonts.body }}>
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                  width: theme.subtitlePlacement === "next-line" ? "100%" : "auto",
                }}
              >
                <p style={getSubtitleStyle()}>
                  {exp.company}
                </p>
                <p style={{ fontStyle: "italic", fontSize: "0.8em", color: "#71717a", fontFamily: fonts.body }}>
                  {exp.location}
                </p>
              </div>
              {exp.description && (
                <p style={{ fontSize: "0.9em", color: "#3f3f46", textAlign: "justify", whiteSpace: "pre-wrap", paddingLeft: "0.25rem", fontFamily: fonts.body }}>
                  {formatDescriptionList(exp.description, theme.listStyle)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    const activeProjects = projects.filter((proj) => proj.visible !== false);
    if (activeProjects.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.projects || "Projects"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeProjects.map((proj, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                  <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#18181b", fontFamily: fonts.heading }}>
                    {proj.title}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", fontWeight: "bold", color: "#71717a", textDecoration: "none", fontFamily: fonts.body }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", fontWeight: "bold", color: "#71717a", textDecoration: "none", fontFamily: fonts.body }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
                <span style={{ fontWeight: "bold", fontSize: "0.9em", color: getColor("dates", "#18181b"), fontFamily: fonts.body }}>
                  {proj.startDate && `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.9em", color: "#3f3f46", textAlign: "justify", whiteSpace: "pre-wrap", paddingLeft: "0.25rem", fontFamily: fonts.body }}>
                  {formatDescriptionList(proj.description, theme.listStyle)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    const activeSkills = skills.filter((s) => s.visible !== false);
    if (activeSkills.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.skills || "Technical Skills"} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: theme.columnLayout === "two" ? "1fr" : "repeat(2, minmax(0, 1fr))",
            columnGap: "2rem",
            rowGap: "4px",
          }}
        >
          {activeSkills.map((skill, index) => (
            <div key={index} style={{ display: "flex", gap: "6px", fontSize: "0.9em", fontFamily: fonts.body }}>
              <span style={{ fontWeight: "bold", whiteSpace: "nowrap", color: "#18181b" }}>
                {skill.category}:
              </span>
              <span style={{ color: "#3f3f46" }}>{skill.subSkills}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    const activeEdu = education.filter((edu) => edu.visible !== false);
    if (activeEdu.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.education || "Education"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeEdu.map((edu, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#18181b", fontFamily: fonts.heading }}>
                  {edu.institution}
                </h3>
                <span style={{ fontWeight: "bold", fontSize: "0.9em", color: getColor("dates", "#18181b"), fontFamily: fonts.body }}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={getSubtitleStyle()}>
                  {edu.degree} {edu.gpa && `— CGPA: ${edu.gpa}`}
                </p>
                <p style={{ fontStyle: "italic", fontSize: "0.8em", color: "#71717a", fontFamily: fonts.body }}>
                  {edu.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderAchievements = () => {
    const activeAchievements = achievements.filter((ach) => ach.visible !== false);
    if (activeAchievements.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.achievements || "Achievements"} />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.9em", fontFamily: fonts.body }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#18181b" }}>
                  • {ach.title}
                </span>
                <span style={{ color: "#71717a" }}>
                  — {ach.description}
                </span>
              </div>
              <span style={{ fontStyle: "italic", fontSize: "0.8em", whiteSpace: "nowrap", color: "#a1a1aa" }}>
                {ach.date}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    const activeCerts = certifications.filter((cert) => cert.visible !== false);
    if (activeCerts.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.certifications || "Certifications"} />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.9em", fontFamily: fonts.body }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#18181b" }}>
                  • {cert.name}
                </span>
                <span style={getSubtitleStyle()}>
                  — {cert.issuer}
                </span>
              </div>
              <span style={{ fontStyle: "italic", fontSize: "0.8em", whiteSpace: "nowrap", color: "#a1a1aa" }}>
                {cert.date}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCustomSections = () => {
    const visibleCustomSections = customSections.filter((sec) => sec.entries?.some((e) => e.visible !== false));
    if (visibleCustomSections.length === 0) return null;
    return (
      <>
        {visibleCustomSections.map((sec) => (
          <section key={sec.id} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader title={sec.title} />
            <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
              {sec.entries.filter((e) => e.visible !== false).map((entry, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                    <h3 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.95em", fontFamily: fonts.heading }}>
                      {entry.link ? (
                        <a href={entry.link} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {entry.title} ↗
                        </a>
                      ) : (
                        entry.title
                      )}
                    </h3>
                    <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#71717a") }}>
                      {entry.startDate && `${formatDate(entry.startDate)} - ${entry.endDate ? formatDate(entry.endDate) : "Present"}`}
                    </span>
                  </div>
                  {entry.subtitle && (
                    <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", marginBottom: "4px" }}>
                      {entry.subtitle} {entry.location && `• ${entry.location}`}
                    </p>
                  )}
                  {entry.content && (
                    <p style={{ fontSize: "0.9em", whiteSpace: "pre-wrap", color: "#52525b", fontFamily: fonts.body }}>
                      {formatDescriptionList(entry.content, theme.listStyle)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </>
    );
  };

  return (
    <div style={containerStyle}>
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
        {personalInfo.jobTitle && (
          <p
            style={{
              fontSize: "1em",
              color: getColor("jobTitle", "#52525b"),
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", fontSize: "0.85em", fontWeight: "bold" }}>
          {personalInfo.phone && (
            <>
              <span>{personalInfo.phone}</span>
              <span style={{ color: "#d4d4d8" }}>|</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span>{personalInfo.email}</span>
              <span style={{ color: "#d4d4d8" }}>|</span>
            </>
          )}
          {personalInfo.location && (
            <>
              <span>{personalInfo.location}</span>
              <span style={{ color: "#d4d4d8" }}>|</span>
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
                    style={{
                      color: getColor("linkIcons", "inherit"),
                      textDecoration: "none",
                    }}
                    className="hover:underline"
                  >
                    {link.label || "Link"}
                  </a>
                  <span style={{ color: "#d4d4d8" }}>|</span>
                </React.Fragment>
              ),
          )}
        </div>
      </header>

      {/* Content Area */}
      {theme.columnLayout === "two" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
            {renderCustomSections()}
          </div>
          {/* Sidebar Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {renderSkills()}
            {renderEducation()}
            {renderAchievements()}
            {renderCertifications()}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {renderSummary()}
          {renderExperience()}
          {renderProjects()}
          {renderSkills()}
          {renderEducation()}
          {renderAchievements()}
          {renderCertifications()}
          {renderCustomSections()}
        </div>
      )}
    </div>
  );
};

export default ClassicTemplate;
