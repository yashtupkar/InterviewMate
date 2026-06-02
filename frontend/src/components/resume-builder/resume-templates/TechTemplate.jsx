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
 * TechTemplate - Dynamic version
 * Two-column dark-sidebar layout designed for developers/engineers with robust customizations.
 */
const TechTemplate = ({ data }) => {
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
    accent: c.colors?.accent || "#bef264",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
    fontSize: c.layout?.spacing?.fontSize || "10pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.15,
    margin: c.layout?.spacing?.margin || {
      left: "15mm",
      right: "15mm",
      top: "15mm",
      bottom: "15mm",
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
        fontSize: "0.95em",
        fontWeight: 900,
        textTransform: theme.headingCase,
        letterSpacing: "0.15em",
        color: getColor("headings", "#a1a1aa"),
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "4px",
        marginBottom: "1rem",
        fontFamily: fonts.heading,
        textAlign: "left",
      }}
    >
      {title}
    </h2>
  );

  const containerStyle = {
    display: "flex",
    width: "100%",
    minHeight: "297mm",
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: fonts.body,
    fontSize: theme.fontSize,
    lineHeight: theme.lineHeight,
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
            <SectionHeader title={profile.title || titles.profiles || "About"} />
            <p
              style={{
                fontSize: "0.9em",
                color: theme.columnLayout === "two" ? "#52525b" : theme.text,
                lineHeight: 1.6,
                borderLeft: `2px solid ${theme.accent}`,
                paddingLeft: "1rem",
                fontFamily: fonts.body,
                whiteSpace: "pre-wrap",
              }}
            >
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
            <div key={i} className="relative">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <h3
                  style={{
                    fontWeight: "bold",
                    color: theme.text,
                    textTransform: "uppercase",
                    fontSize: "0.95em",
                    letterSpacing: "-0.01em",
                    fontFamily: fonts.heading,
                  }}
                >
                  {exp.title}
                </h3>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    color: theme.accent,
                    backgroundColor: `${theme.accent}10`,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    border: `1px solid ${theme.accent}20`,
                    fontFamily: fonts.body,
                  }}
                >
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", marginBottom: "8px" }}>
                {exp.company} {exp.location && `• ${exp.location}`}
              </p>
              {exp.description && (
                <p style={{ fontSize: "0.9em", color: "#52525b", lineHeight: 1.5, whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
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
        <SectionHeader title={titles.projects || "Selected Work"} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: theme.columnLayout === "two" ? "1fr" : "repeat(2, 1fr)",
            gap: `${theme.spaceBetweenEntries}px`,
          }}
        >
          {activeProjects.map((proj, i) => (
            <div
              key={i}
              style={{
                padding: "0.75rem",
                backgroundColor: "#fafafa",
                borderRadius: "12px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                <h3 style={{ fontWeight: "bold", color: theme.text, fontSize: "0.85em", textTransform: "uppercase", fontFamily: fonts.heading }}>
                  {proj.title}
                </h3>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "9px", fontWeight: "bold", color: theme.accent, textDecoration: "none" }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "9px", fontWeight: "bold", color: theme.accent, textDecoration: "none" }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
              </div>
              {proj.startDate && (
                <p style={{ fontSize: "8px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), marginBottom: "4px" }}>
                  {formatDate(proj.startDate)} - {proj.current ? "Present" : formatDate(proj.endDate)}
                </p>
              )}
              {proj.description && (
                <p style={{ fontSize: "0.85em", color: "#71717a", lineHeight: 1.4, fontFamily: fonts.body }}>
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
        <h2
          style={{
            fontSize: "0.95em",
            fontWeight: 900,
            textTransform: theme.headingCase,
            letterSpacing: "0.15em",
            color: theme.columnLayout === "two" ? "#bef264" : getColor("headings", "#a1a1aa"),
            borderBottom: `2px solid ${theme.columnLayout === "two" ? "rgba(190,242,100,0.2)" : theme.border}`,
            paddingBottom: "4px",
            marginBottom: "1rem",
            fontFamily: fonts.heading,
          }}
        >
          {titles.skills || "Stack"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeSkills.map((skill, index) => (
            <div key={index}>
              <h3 style={{ fontSize: "9px", fontWeight: "bold", color: theme.columnLayout === "two" ? "#71717a" : "#a1a1aa", textTransform: "uppercase", tracking: "0.15em", marginBottom: "2px", fontFamily: fonts.body }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.9em", fontWeight: "bold", color: theme.columnLayout === "two" ? "#f4f4f5" : theme.text, lineHeight: 1.25, fontFamily: fonts.body }}>
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
        <h2
          style={{
            fontSize: "0.95em",
            fontWeight: 900,
            textTransform: theme.headingCase,
            letterSpacing: "0.15em",
            color: theme.columnLayout === "two" ? "#bef264" : getColor("headings", "#a1a1aa"),
            borderBottom: `2px solid ${theme.columnLayout === "two" ? "rgba(190,242,100,0.2)" : theme.border}`,
            paddingBottom: "4px",
            marginBottom: "1rem",
            fontFamily: fonts.heading,
          }}
        >
          {titles.education || "Education"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeEdu.map((edu, i) => (
            <div key={i}>
              <h3 style={{ fontWeight: "bold", color: theme.columnLayout === "two" ? "#ffffff" : theme.text, fontSize: "0.9em", textTransform: "uppercase", marginBottom: "2px", fontFamily: fonts.heading }}>
                {edu.degree}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", color: theme.columnLayout === "two" ? "#a1a1aa" : "#4b5563" }}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", fontWeight: 900, color: getColor("dates", "#71717a"), textTransform: "uppercase", marginTop: "4px", fontFamily: fonts.body }}>
                <span>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
                {edu.gpa && <span>GPA: {edu.gpa}</span>}
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
        <h2
          style={{
            fontSize: "0.95em",
            fontWeight: 900,
            textTransform: theme.headingCase,
            letterSpacing: "0.15em",
            color: theme.columnLayout === "two" ? "#bef264" : getColor("headings", "#a1a1aa"),
            borderBottom: `2px solid ${theme.columnLayout === "two" ? "rgba(190,242,100,0.2)" : theme.border}`,
            paddingBottom: "4px",
            marginBottom: "1rem",
            fontFamily: fonts.heading,
          }}
        >
          {titles.achievements || "Honors"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <h3 style={{ fontWeight: "bold", color: theme.columnLayout === "two" ? "#ffffff" : theme.text, fontSize: "0.85em", textTransform: "uppercase", fontFamily: fonts.heading }}>
                {ach.title}
              </h3>
              <p style={{ fontSize: "0.8em", color: "#71717a", fontFamily: fonts.body }}>
                {ach.description}
              </p>
              <span style={{ fontSize: "8px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", fontFamily: fonts.body }}>
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
        <h2
          style={{
            fontSize: "0.95em",
            fontWeight: 900,
            textTransform: theme.headingCase,
            letterSpacing: "0.15em",
            color: theme.columnLayout === "two" ? "#bef264" : getColor("headings", "#a1a1aa"),
            borderBottom: `2px solid ${theme.columnLayout === "two" ? "rgba(190,242,100,0.2)" : theme.border}`,
            paddingBottom: "4px",
            marginBottom: "1rem",
            fontFamily: fonts.heading,
          }}
        >
          {titles.certifications || "Certifications"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px", borderBottom: `1px solid ${theme.columnLayout === "two" ? "rgba(255,255,255,0.08)" : theme.border}`, paddingBottom: "4px" }}>
              <h3 style={{ fontWeight: "bold", color: theme.columnLayout === "two" ? "#ffffff" : theme.text, fontSize: "0.85em", textTransform: "uppercase", fontFamily: fonts.heading }}>
                {cert.name}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.8em", color: theme.columnLayout === "two" ? "#a1a1aa" : "#71717a" }}>
                {cert.issuer}
              </p>
              <p style={{ fontSize: "8px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", fontFamily: fonts.body }}>
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
      {theme.columnLayout === "two" ? (
        <>
          {/* Two Columns Grid (Tech Default) */}
          {/* Sidebar */}
          <aside
            style={{
              width: "240px",
              backgroundColor: "#18181b",
              color: "#f4f4f5",
              padding: `${theme.margin.top} 1.5rem ${theme.margin.bottom} 1.5rem`,
              display: "flex",
              flexDirection: "column",
              shrink: 0,
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
                  border: `2px solid rgba(255,255,255,0.1)`,
                  marginBottom: "1.5rem",
                  alignSelf: "center",
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

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
              {/* Contact Block */}
              <section>
                <h2 style={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.2em", color: theme.accent, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", backgroundColor: theme.accent, borderRadius: "50%" }}></span>
                  Contact
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8em", color: "#a1a1aa" }}>
                  {personalInfo.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={12} style={{ color: theme.accent }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={12} style={{ color: theme.accent }} />
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={12} style={{ color: theme.accent }} />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Sidebar Content Stack */}
              {renderSkills()}
              {renderEducation()}
              {renderAchievements()}
              {renderCertifications()}
            </div>

            {/* Links at bottom of Sidebar */}
            {(personalInfo.links || []).length > 0 && (
              <div style={{ marginTop: "auto", pt: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(personalInfo.links || []).map((link, i) => link.url && (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "6px",
                      color: "#a1a1aa",
                      display: "flex",
                    }}
                    className="hover:text-lime-400"
                  >
                    {getLinkIcon(link.label, link.url, 12)}
                  </a>
                ))}
              </div>
            )}
          </aside>

          {/* Main Copy Area */}
          <main style={{ flex: 1, padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} 2rem`, boxSizing: "border-box", backgroundColor: theme.background }}>
            <header style={{ marginBottom: "1.5rem" }}>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  color: getColor("name"),
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  fontFamily: fonts.heading,
                  margin: 0,
                }}
              >
                {personalInfo.fullName || "Your Name"}
              </h1>
              {personalInfo.jobTitle && (
                <p
                  style={{
                    fontSize: "1.25rem",
                    color: getColor("jobTitle", theme.accent),
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontFamily: fonts.heading,
                    margin: 0,
                  }}
                >
                  {personalInfo.jobTitle}
                </p>
              )}
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {renderSummary()}
              {renderExperience()}
              {renderProjects()}
              {renderCustomSections()}
            </div>
          </main>
        </>
      ) : (
        /* Linear ATS-Safe 1-Column Layout */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
          <header style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                color: getColor("name"),
                marginBottom: "0.25rem",
                textTransform: "uppercase",
                letterSpacing: "-0.025em",
                fontFamily: fonts.heading,
                margin: 0,
              }}
            >
              {personalInfo.fullName || "Your Name"}
            </h1>
            {personalInfo.jobTitle && (
              <p
                style={{
                  fontSize: "1.25rem",
                  color: getColor("jobTitle", theme.accent),
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontFamily: fonts.heading,
                  margin: 0,
                }}
              >
                {personalInfo.jobTitle}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85em", color: "#52525b", marginTop: "1rem" }}>
              {personalInfo.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Mail size={12} style={{ color: theme.accent }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Phone size={12} style={{ color: theme.accent }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} style={{ color: theme.accent }} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {(personalInfo.links || []).map((link, i) => link.url && (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "4px", color: "inherit", textDecoration: "none" }}
                >
                  {getLinkIcon(link.label, link.url, 12)}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </header>

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

export default TechTemplate;
