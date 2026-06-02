import React from "react";
import {
  Mail,
  Phone,
  MapPin,
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

  // Default values if customizations are missing
  const theme = {
    accent: c.colors?.accent || "#000000",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
    fontSize: c.layout?.spacing?.fontSize || "10.5pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.15,
    margin: c.layout?.spacing?.margin || {
      left: "22mm",
      right: "22mm",
      top: "12mm",
      bottom: "12mm",
    },
    columnLayout: c.layout?.columns || "two",
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
        color: getColor("headings"),
        fontFamily: fonts.heading,
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "0.25rem",
        marginBottom: "1rem",
        textTransform: theme.headingCase,
        fontSize: "1.15em",
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
            <SectionHeader title={profile.title || titles.profiles || "Summary"} />
            <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95em", fontFamily: fonts.body }}>
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
        <SectionHeader title={titles.experience || "Experience"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeExperience.map((exp, i) => (
            <div key={i} style={{ paddingLeft: "0.75rem", borderLeft: `2px solid ${theme.border}` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "2px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <h3 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "1em", fontFamily: fonts.heading }}>
                  {exp.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: theme.subtitlePlacement === "next-line" ? "100%" : "auto",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <p style={getSubtitleStyle()}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </p>
                  <span
                    style={{
                      fontSize: "0.8em",
                      fontWeight: "bold",
                      color: getColor("dates", "#71717a"),
                      textTransform: "uppercase",
                      backgroundColor: "#fafafa",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #f4f4f5",
                    }}
                  >
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
              </div>
              {exp.description && (
                <p style={{ fontSize: "0.9em", marginTop: "4px", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
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
            <div key={i} style={{ paddingLeft: "0.75rem", borderLeft: `2px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {proj.link ? (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "1em", fontFamily: fonts.heading, color: theme.text, textDecoration: "none" }}
                    >
                      {proj.title} ↗
                    </a>
                  ) : (
                    <h3 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "1em", fontFamily: fonts.heading }}>
                      {proj.title}
                    </h3>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", fontWeight: "bold", color: theme.accent, textDecoration: "none" }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.85em",
                    fontWeight: "bold",
                    color: getColor("dates", "#71717a"),
                    textTransform: "uppercase",
                    backgroundColor: "#fafafa",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid #f4f4f5",
                  }}
                >
                  {proj.startDate && `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.9em", marginTop: "2px", whiteSpace: "pre-wrap", color: "#52525b", fontFamily: fonts.body }}>
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
        <SectionHeader title={titles.skills || "Skills"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeSkills.map((skill, index) => (
            <div key={index}>
              <h3 style={{ fontSize: "0.75em", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "2px", fontFamily: fonts.heading }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.9em", fontWeight: "bold", fontFamily: fonts.body }}>
                {skill.subSkills}
              </p>
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
              <p style={{ fontSize: "0.95em", color: "#18181b", fontWeight: "bold", fontFamily: fonts.body }}>
                {edu.degree} {edu.field && `in ${edu.field}`}
              </p>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.9em" }}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8em",
                  fontWeight: "bold",
                  color: getColor("dates", "#71717a"),
                  textTransform: "uppercase",
                  marginTop: "2px",
                  fontFamily: fonts.body,
                }}
              >
                <span>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
                {edu.gpa && (
                  <span style={{ color: getColor("dotsBarsBubbles", "#71717a") }}>
                    GPA: {edu.gpa}
                  </span>
                )}
              </div>
              {edu.description && (
                <p style={{ fontSize: "0.85em", marginTop: "4px", color: "#52525b", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
                  {formatDescriptionList(edu.description, theme.listStyle)}
                </p>
              )}
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
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading }}>
                  {ach.title}
                </h3>
                <p style={{ fontSize: "0.85em", color: "#52525b", fontFamily: fonts.body }}>
                  {ach.description}
                </p>
              </div>
              <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), whiteSpace: "nowrap", marginLeft: "10px" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ border: `1px solid ${theme.border}`, padding: "0.5rem", borderRadius: "8px", backgroundColor: "#fafafa" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "0.9em", textTransform: "uppercase", fontFamily: fonts.heading }}>
                {cert.name}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.85em" }}>
                {cert.issuer}
              </p>
              <p style={{ fontSize: "0.75em", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", marginTop: "2px", fontFamily: fonts.body }}>
                {cert.date}
              </p>
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
                <div key={i} style={{ paddingLeft: "0.75rem", borderLeft: `2px solid ${theme.border}` }}>
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
              fontSize: "0.85em",
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
                <Mail size={12} aria-hidden="true" />
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
                <Phone size={12} aria-hidden="true" />
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
                <MapPin size={12} aria-hidden="true" />
                <span style={{ color: "#52525b" }}>{personalInfo.location}</span>
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
                      {getLinkIcon(link.label, link.url, 12)}
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
      {theme.columnLayout === "one" ? (
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
      ) : (
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
      )}
    </div>
  );
};

export default ModernTemplate;
