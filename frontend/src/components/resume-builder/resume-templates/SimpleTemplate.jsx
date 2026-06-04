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
 * SimpleTemplate - A clean, highly legible, ATS-optimized minimalist template.
 * Inspired by the clean elegant layouts of Emily Carter, Lena Hoffmann, and Rohan Patel.
 * Fully customizable.
 */
const SimpleTemplate = ({ data }) => {
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
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
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
      style: "circle",
      borderRadius: 50,
      size: 72,
    },
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const getSubtitleStyle = () => {
    return {
      fontWeight: theme.subtitleStyle === "bold" ? "bold" : "normal",
      fontStyle: theme.subtitleStyle === "italic" ? "italic" : "normal",
      color: getColor("entrySubtitle", "#3f3f46"),
      fontFamily: fonts.body,
    };
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  // Elegant section header matching the prompt's images
  const SectionHeader = ({ title }) => {
    // If accent applied to headings line, we do a nice accent bar or underline
    const showHeaderBackground = theme.accent !== "transparent" && theme.applyTo.headingsLine && theme.applyTo.headings;
    
    if (showHeaderBackground) {
      return (
        <div
          style={{
            backgroundColor: `${theme.accent}12`,
            padding: "4px 8px",
            borderLeft: `4px solid ${theme.accent}`,
            marginBottom: "0.75rem",
          }}
        >
          <h2
            style={{
              fontSize: "1em",
              fontWeight: "bold",
              color: theme.accent,
              textTransform: theme.headingCase,
              letterSpacing: "0.08em",
              margin: 0,
              fontFamily: fonts.heading,
            }}
          >
            {title}
          </h2>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: "0.75rem" }}>
        <h2
          style={{
            fontSize: "1em",
            fontWeight: "bold",
            color: getColor("headings", "#18181b"),
            textTransform: theme.headingCase,
            letterSpacing: "0.08em",
            margin: 0,
            fontFamily: fonts.heading,
            paddingBottom: "2px",
            borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
          }}
        >
          {title}
        </h2>
      </div>
    );
  };

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
            <SectionHeader title={profile.title || titles.profiles || "Summary"} />
            <p style={{ fontSize: "0.9em", color: theme.text, textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
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
        <SectionHeader title={titles.experience || "Professional Experience"} />
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "baseline" }}>
                  <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#18181b", fontFamily: fonts.heading }}>
                    {exp.title}
                  </h3>
                  {theme.subtitlePlacement !== "next-line" && (
                    <span style={{ fontSize: "0.85em", color: "#71717a" }}>at</span>
                  )}
                  <p style={getSubtitleStyle()}>
                    {exp.company}
                  </p>
                </div>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#71717a"), whiteSpace: "nowrap" }}>
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  {exp.location && ` | ${exp.location}`}
                </span>
              </div>
              {theme.subtitlePlacement === "next-line" && exp.location && (
                <p style={{ fontSize: "0.8em", color: "#71717a", marginBottom: "4px" }}>
                  {exp.location}
                </p>
              )}
              {exp.description && (
                <p style={{ fontSize: "0.9em", color: "#3f3f46", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body, marginTop: "2px" }}>
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
                <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                  <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#18181b", fontFamily: fonts.heading }}>
                    {proj.title}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none", fontFamily: fonts.body }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none", fontFamily: fonts.body }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#71717a") }}>
                  {proj.startDate && `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.9em", color: "#3f3f46", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
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

    // Supports clean pipe-separated lines (Lena Hoffmann style) or grid lists
    const isPipeSeparated = theme.columnLayout === "one";

    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.skills || "Skills"} />
        {isPipeSeparated ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", fontSize: "0.9em", fontFamily: fonts.body }}>
            {activeSkills.map((skill, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: "bold", color: "#18181b" }}>{skill.category}:</span>
                <span style={{ color: "#3f3f46" }}>{skill.subSkills}</span>
                {index < activeSkills.length - 1 && (
                  <span style={{ color: theme.border, fontWeight: "normal", marginLeft: "6px" }}>|</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
            {activeSkills.map((skill, index) => (
              <div key={index} style={{ fontSize: "0.9em" }}>
                <span style={{ fontWeight: "bold", color: "#18181b", display: "block", marginBottom: "2px" }}>{skill.category}</span>
                <span style={{ color: "#52525b" }}>{skill.subSkills}</span>
              </div>
            ))}
          </div>
        )}
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
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </h3>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#71717a") }}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={getSubtitleStyle()}>
                  {edu.institution} {edu.location && `• ${edu.location}`}
                </p>
                {edu.gpa && (
                  <span style={{ fontSize: "0.85em", color: getColor("dotsBarsBubbles", "#52525b"), fontWeight: "bold" }}>
                    GPA: {edu.gpa}
                  </span>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.9em", fontFamily: fonts.body }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#18181b" }}>• {ach.title}</span>
                <span style={{ color: "#52525b" }}>— {ach.description}</span>
              </div>
              <span style={{ fontStyle: "italic", fontSize: "0.8em", color: "#a1a1aa", marginLeft: "10px" }}>
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
    
    const isPipeSeparated = theme.columnLayout === "one";

    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.certifications || "Certificates"} />
        {isPipeSeparated ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", fontSize: "0.9em", fontFamily: fonts.body }}>
            {activeCerts.map((cert, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#18181b" }}>{cert.name}</span>
                <span style={{ color: "#52525b" }}>({cert.issuer})</span>
                {index < activeCerts.length - 1 && (
                  <span style={{ color: theme.border, marginLeft: "6px" }}>|</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {activeCerts.map((cert, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.9em", fontFamily: fonts.body }}>
                <div>
                  <span style={{ fontWeight: "bold", color: "#18181b" }}>{cert.name}</span>
                  <span style={{ color: "#71717a", marginLeft: "4px" }}>• {cert.issuer}</span>
                </div>
                <span style={{ fontStyle: "italic", fontSize: "0.8em", color: "#a1a1aa" }}>{cert.date}</span>
              </div>
            ))}
          </div>
        )}
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
      {/* Premium Centered/Flexible Header */}
      <header
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: personalInfo.photoUrl ? "row" : "column",
          justifyContent: personalInfo.photoUrl ? "space-between" : "center",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: personalInfo.photoUrl ? "flex-start" : "center",
            textAlign: personalInfo.photoUrl ? "left" : "center",
            flex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "2.4em",
              fontWeight: 800,
              color: getColor("name"),
              margin: "0 0 2px 0",
              fontFamily: fonts.heading,
              lineHeight: 1.1,
            }}
          >
            {personalInfo.fullName || "Your Name"}
          </h1>
          {personalInfo.jobTitle && (
            <p
              style={{
                fontSize: "1.1em",
                color: getColor("jobTitle", "#4b5563"),
                fontWeight: "bold",
                margin: "0 0 10px 0",
                fontFamily: fonts.heading,
              }}
            >
              {personalInfo.jobTitle}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: personalInfo.photoUrl ? "flex-start" : "center",
              gap: "8px 14px",
              fontSize: "0.85em",
              color: "#52525b",
              fontWeight: 500,
              width: "100%",
            }}
          >
            {personalInfo.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={13} style={{ color: getColor("headerIcons", "#71717a") }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Mail size={13} style={{ color: getColor("headerIcons", "#71717a") }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Phone size={13} style={{ color: getColor("headerIcons", "#71717a") }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {(personalInfo.links || []).map((link, i) => link.url && (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "4px", color: "inherit", textDecoration: "none" }}
                className="hover:underline"
              >
                <span style={{ color: getColor("linkIcons", "#71717a") }}>
                  {getLinkIcon(link.label, link.url, 13)}
                </span>
                <span>{link.label}</span>
              </a>
            ))}
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
              border: `1px solid ${theme.border}`,
              flexShrink: 0,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
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

      {/* Columns Alignment Toggling */}
      {theme.columnLayout === "two" ? (
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "2rem", flex: 1 }}>
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

export default SimpleTemplate;
