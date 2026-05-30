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
 * CorporateTemplate - Dynamic version
 * Highly structured business/corporate layout with full customization support.
 */
const CorporateTemplate = ({ data }) => {
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
    accent: c.colors?.accent || "#312e81",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
    fontSize: c.layout?.spacing?.fontSize || "10pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.15,
    margin: c.layout?.spacing?.margin || {
      left: "20mm",
      right: "20mm",
      top: "20mm",
      bottom: "20mm",
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
      color: getColor("entrySubtitle", theme.accent),
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
        fontSize: "0.85em",
        fontWeight: 900,
        color: getColor("headings", "#1e1b4b"),
        textTransform: theme.headingCase,
        letterSpacing: "0.15em",
        marginBottom: "1rem",
        borderLeft: `4px solid ${theme.accent}`,
        paddingLeft: "0.5rem",
        paddingTop: "2px",
        paddingBottom: "2px",
        fontFamily: fonts.heading,
      }}
    >
      {title}
    </h2>
  );

  const containerStyle = {
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
            <SectionHeader title={profile.title || titles.profiles || "Professional Profile"} />
            <p style={{ fontSize: "0.9em", color: "#3f3f46", textAlign: "justify", fontStyle: "italic", fontFamily: fonts.body, whiteSpace: "pre-wrap" }}>
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
        <SectionHeader title={titles.experience || "Career Background"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeExperience.map((exp, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <h3 style={{ fontWeight: "bold", color: "#1e1b4b", textTransform: "uppercase", fontSize: "1em", letterSpacing: "-0.025em", fontFamily: fonts.heading }}>
                  {exp.title}
                </h3>
                <span
                  style={{
                    fontSize: "0.8em",
                    fontWeight: "bold",
                    color: getColor("dates", "#a1a1aa"),
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    backgroundColor: "#fafafa",
                    padding: "2px 8px",
                    border: "1px solid #f4f4f5",
                    fontStyle: "italic",
                    fontFamily: fonts.body,
                  }}
                >
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", marginBottom: "6px" }}>
                {exp.company} {exp.location && `| ${exp.location}`}
              </p>
              {exp.description && (
                <p style={{ fontSize: "0.85em", color: "#3f3f46", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
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
        <SectionHeader title={titles.projects || "Strategic Projects"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeProjects.map((proj, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <h3 style={{ fontWeight: "bold", color: "#1e1b4b", textTransform: "uppercase", fontSize: "0.95em", letterSpacing: "-0.025em", fontFamily: fonts.heading }}>
                  {proj.title}
                </h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "9px", fontWeight: "bold", color: theme.accent, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: fonts.body, textDecoration: "none" }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "9px", fontWeight: "bold", color: theme.accent, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: fonts.body, textDecoration: "none" }}
                    >
                      [Code]
                    </a>
                  )}
                  {proj.startDate && (
                    <span style={{ fontSize: "9px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: fonts.body }}>
                      {formatDate(proj.startDate)} - {proj.current ? "Present" : formatDate(proj.endDate)}
                    </span>
                  )}
                </div>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.85em", color: "#3f3f46", fontFamily: fonts.body }}>
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
        <h2 style={{ fontSize: "0.75rem", fontWeight: 900, color: getColor("headings", "#1e1b4b"), textTransform: theme.headingCase, letterSpacing: "0.15em", marginBottom: "0.75rem", borderBottom: `1px solid ${theme.border}`, paddingBottom: "4px", fontFamily: fonts.heading }}>
          {titles.skills || "Core Expertise"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeSkills.map((skill, index) => (
            <div key={index}>
              <h3 style={{ fontSize: "10px", fontWeight: "bold", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px", fontFamily: fonts.body }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.85em", fontWeight: "bold", color: theme.accent, lineHeight: 1.25, fontFamily: fonts.body }}>
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
        <h2 style={{ fontSize: "0.75rem", fontWeight: 900, color: getColor("headings", "#1e1b4b"), textTransform: theme.headingCase, letterSpacing: "0.15em", marginBottom: "0.75rem", borderBottom: `1px solid ${theme.border}`, paddingBottom: "4px", fontFamily: fonts.heading }}>
          {titles.education || "Academic"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeEdu.map((edu, i) => (
            <div key={i}>
              <h3 style={{ fontWeight: "bold", color: "#1e1b4b", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "2px", letterSpacing: "-0.025em", fontFamily: fonts.heading }}>
                {edu.degree}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.8em", marginBottom: "4px", fontStyle: "italic" }}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              <div style={{ fontSize: "9px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: fonts.body }}>
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)} {edu.gpa && `| GPA: ${edu.gpa}`}
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
        <h2 style={{ fontSize: "0.75rem", fontWeight: 900, color: getColor("headings", "#1e1b4b"), textTransform: theme.headingCase, letterSpacing: "0.15em", marginBottom: "0.75rem", borderBottom: `1px solid ${theme.border}`, paddingBottom: "4px", fontFamily: fonts.heading }}>
          {titles.achievements || "Honors"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeAchievements.map((ach, i) => (
            <div key={i}>
              <h3 style={{ fontSize: "10px", fontWeight: "bold", color: "#1e1b4b", textTransform: "uppercase", fontFamily: fonts.heading, marginBottom: "2px" }}>
                {ach.title}
              </h3>
              <p style={{ fontSize: "0.85em", color: "#71717a", fontFamily: fonts.body }}>
                {ach.description}
              </p>
              <span style={{ fontSize: "8px", fontWeight: "bold", color: theme.accent, textTransform: "uppercase", fontFamily: fonts.body }}>
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
        <h2 style={{ fontSize: "0.75rem", fontWeight: 900, color: getColor("headings", "#1e1b4b"), textTransform: theme.headingCase, letterSpacing: "0.15em", marginBottom: "0.75rem", borderBottom: `1px solid ${theme.border}`, paddingBottom: "4px", fontFamily: fonts.heading }}>
          {titles.certifications || "Verification"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <h3 style={{ fontWeight: "bold", color: "#1e1b4b", fontSize: "10px", textTransform: "uppercase", lineHeight: 1.25, fontFamily: fonts.heading }}>
                {cert.name}
              </h3>
              <p style={{ ...getSubtitleStyle(), fontSize: "9px", fontStyle: "italic", textTransform: "uppercase" }}>
                {cert.issuer}
              </p>
              <span style={{ fontSize: "9px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: fonts.body }}>
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
      {/* Centered Professional Header */}
      <header
        style={{
          marginBottom: "2.5rem",
          textAlign: "center",
          width: "100%",
          borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : "#312e81"}`,
          paddingBottom: "1.5rem",
          position: "relative",
          boxSizing: "border-box",
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
            color: getColor("name", "#1e1b4b"),
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
            color: getColor("jobTitle", theme.accent),
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

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", fontSize: "0.8em", fontWeight: "bold", color: "#52525b", textTransform: "uppercase" }}>
          {personalInfo.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: getColor("headerIcons", "#52525b") }}>
              <Mail size={12} aria-hidden="true" />
              <span style={{ color: "#52525b" }}>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: getColor("headerIcons", "#52525b") }}>
              <Phone size={12} aria-hidden="true" />
              <span style={{ color: "#52525b" }}>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: getColor("headerIcons", "#52525b") }}>
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
                  <span style={{ color: getColor("linkIcons", "#52525b") }}>
                    {getLinkIcon(link.label, link.url, 12)}
                  </span>
                  <span style={{ color: "#52525b" }}>{link.label || "Link"}</span>
                </a>
              ),
          )}
        </div>
      </header>

      {/* Grid or Linear Stack */}
      {theme.columnLayout === "two" ? (
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "2rem", flex: 1 }}>
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

export default CorporateTemplate;
