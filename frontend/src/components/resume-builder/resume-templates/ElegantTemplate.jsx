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
 * ElegantTemplate - Dynamic version
 * Structured professional template with distinct top header and complete configurations.
 */
const ElegantTemplate = ({ data }) => {
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
    accent: c.colors?.accent || "#e5e6e3", // Default header bg
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e5e7eb",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
    fontSize: c.layout?.spacing?.fontSize || "11pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.3,
    margin: c.layout?.spacing?.margin || {
      left: "15mm",
      right: "15mm",
      top: "15mm",
      bottom: "15mm",
    },
    columnLayout: c.layout?.columns || "one",
    headingCase: c.sectionHeadings?.capitalization || "uppercase",
    subtitleStyle: c.entryLayout?.subtitleStyle || "italic",
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
      style: "circle",
      borderRadius: 50,
      size: 96,
    },
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const getSubtitleStyle = () => {
    return {
      fontWeight: theme.subtitleStyle === "bold" ? "bold" : "normal",
      fontStyle: theme.subtitleStyle === "italic" ? "italic" : "normal",
      color: getColor("entrySubtitle", "#4b5563"),
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
    <div
      style={{
        backgroundColor: theme.applyTo.headings ? theme.accent : "#f3f4f6",
        padding: "6px 12px",
        textAlign: "center",
        marginBottom: "1rem",
        borderRadius: "4px",
        borderLeft: theme.applyTo.headingsLine ? `4px solid ${theme.accent}` : "none",
        borderRight: theme.applyTo.headingsLine ? `4px solid ${theme.accent}` : "none",
      }}
    >
      <h2
        style={{
          fontSize: "0.9em",
          fontWeight: "bold",
          textTransform: theme.headingCase,
          letterSpacing: "0.15em",
          color: theme.applyTo.headings ? "#111827" : "#374151",
          fontFamily: fonts.heading,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );

  const containerStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: fonts.body,
    fontSize: theme.fontSize,
    lineHeight: theme.lineHeight,
    width: "100%",
    minHeight: "297mm",
    padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} ${theme.margin.left}`,
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
            <p style={{ fontSize: "0.9em", color: theme.text, textAlign: "justify", lineHeight: 1.4, fontFamily: fonts.body, whiteSpace: "pre-wrap" }}>
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
            <div key={i} style={{ display: "flex", gap: "1.5rem", marginBottom: "4px", flexDirection: theme.columnLayout === "two" ? "column" : "row" }}>
              {theme.columnLayout !== "two" && (
                <div style={{ width: "130px", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.85em", fontWeight: "bold", margin: 0 }}>
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                  <p style={{ fontSize: "0.8em", color: "#6b7280", margin: "4px 0 0 0", fontFamily: fonts.body }}>
                    {exp.location}
                  </p>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.95em", fontWeight: "bold", margin: 0, fontFamily: fonts.heading, color: getColor("entrySubtitle", "#111827") }}>
                  {exp.company}
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", margin: "2px 0 6px 0" }}>
                    {exp.title}
                  </p>
                  {theme.columnLayout === "two" && (
                    <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#6b7280") }}>
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <div style={{ fontSize: "0.85em", color: theme.text, fontFamily: fonts.body, lineHeight: 1.4 }}>
                    {formatDescriptionList(exp.description, theme.listStyle)}
                  </div>
                )}
              </div>
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
            <div key={i} style={{ display: "flex", gap: "1.5rem", marginBottom: "4px", flexDirection: theme.columnLayout === "two" ? "column" : "row" }}>
              {theme.columnLayout !== "two" && (
                <div style={{ width: "130px", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.85em", fontWeight: "bold", margin: 0 }}>
                    {proj.startDate && formatDate(proj.startDate)} {proj.endDate && `— ${formatDate(proj.endDate)}`}
                  </p>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "0.95em", fontWeight: "bold", margin: 0, fontFamily: fonts.heading }}>
                    {proj.title}
                  </h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85em", color: "#6b7280", textDecoration: "none" }}>
                        [Link]
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85em", color: "#6b7280", textDecoration: "none" }}>
                        [Code]
                      </a>
                    )}
                    {theme.columnLayout === "two" && proj.startDate && (
                      <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#6b7280") }}>
                        {formatDate(proj.startDate)} - {proj.current ? "Present" : formatDate(proj.endDate)}
                      </span>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <div style={{ fontSize: "0.85em", color: "#374151", marginTop: "4px", fontFamily: fonts.body }}>
                    {formatDescriptionList(proj.description, theme.listStyle)}
                  </div>
                )}
              </div>
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
        <div style={{ display: "grid", gridTemplateColumns: theme.columnLayout === "two" ? "1fr" : "repeat(3, 1fr)", gap: "1rem", fontSize: "0.85em" }}>
          {activeSkills.map((skill, i) => (
            <div key={i}>
              <h4 style={{ fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase", fontSize: "0.75em", color: "#6b7280", fontFamily: fonts.heading }}>
                {skill.category}
              </h4>
              <p style={{ color: theme.text, fontFamily: fonts.body }}>
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
            <div key={i} style={{ display: "flex", gap: "1.5rem", flexDirection: theme.columnLayout === "two" ? "column" : "row" }}>
              {theme.columnLayout !== "two" && (
                <div style={{ width: "130px", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.85em", fontWeight: 600, margin: 0, fontFamily: fonts.body }}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                  <p style={{ fontSize: "0.8em", color: "#6b7280", margin: "4px 0 0 0", fontFamily: fonts.body }}>
                    {edu.location}
                  </p>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.95em", fontWeight: "bold", margin: 0, fontFamily: fonts.heading }}>
                  {edu.degree}
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", margin: "2px 0 0 0" }}>
                    {edu.institution}
                  </p>
                  {theme.columnLayout === "two" && (
                    <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#6b7280") }}>
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  )}
                </div>
                {edu.gpa && (
                  <p style={{ fontSize: "0.8em", color: "#6b7280", margin: "4px 0 0 0", fontFamily: fonts.body }}>
                    GPA: {edu.gpa}
                  </p>
                )}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.9em", fontWeight: "bold", margin: 0, fontFamily: fonts.heading }}>
                {ach.title}
              </h3>
              <p style={{ fontSize: "0.85em", color: "#4b5563", margin: "2px 0", fontFamily: fonts.body }}>
                {ach.description}
              </p>
              <p style={{ fontSize: "0.8em", color: getColor("dates", "#9ca3af"), fontFamily: fonts.body, margin: 0 }}>
                {ach.date}
              </p>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.9em", fontWeight: "bold", margin: 0, fontFamily: fonts.heading }}>
                {cert.name}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", margin: "2px 0" }}>
                {cert.issuer}
              </p>
              <p style={{ fontSize: "0.8em", color: getColor("dates", "#9ca3af"), fontFamily: fonts.body, margin: 0 }}>
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
      {/* Header Banner - Full Width */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: theme.accent,
          padding: "2rem",
          margin: `-${theme.margin.top} -${theme.margin.right} 1.5rem -${theme.margin.left}`,
          gap: "2rem",
          boxSizing: "border-box",
        }}
      >
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
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p
            style={{
              fontSize: "1.1em",
              color: "#4b5563",
              margin: "0 0 1rem 0",
              fontFamily: fonts.heading,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px 1.5rem",
              fontSize: "0.85em",
              color: "#1f2937",
              fontWeight: "bold",
            }}
          >
            {personalInfo.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: getColor("headerIcons", "#4b5563"), display: "flex" }}>
                  <Mail size={14} aria-hidden="true" />
                </span>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: getColor("headerIcons", "#4b5563"), display: "flex" }}>
                  <Phone size={14} aria-hidden="true" />
                </span>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: getColor("headerIcons", "#4b5563"), display: "flex" }}>
                  <MapPin size={14} aria-hidden="true" />
                </span>
                <span>{personalInfo.location}</span>
              </div>
            )}
            {(personalInfo.links || []).map((link, i) => link.url && (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: getColor("linkIcons", "#4b5563"), display: "flex" }}>
                  {getLinkIcon(link.label, link.url, 14)}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {link.label || "Link"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Grid or Linear Stack */}
      {theme.columnLayout === "two" ? (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", flex: 1 }}>
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

export default ElegantTemplate;
