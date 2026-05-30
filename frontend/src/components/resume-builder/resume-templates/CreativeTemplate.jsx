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
 * CreativeTemplate - Dynamic version
 * Artistic styled resume template with customizable column structures and detailed styles.
 */
const CreativeTemplate = ({ data }) => {
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
    fontBody: c.fonts?.body || "Inter",
    fontHeading: c.fonts?.headings || "Inter",
    fontSize: c.layout?.spacing?.fontSize || "11pt",
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
        color: getColor("headings", "#18181b"),
        fontFamily: fonts.heading,
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? theme.accent : theme.border}`,
        paddingBottom: "0.25rem",
        marginBottom: "1rem",
        textTransform: theme.headingCase,
        fontSize: "1.1em",
        fontWeight: 900,
        letterSpacing: "0.1em",
      }}
    >
      {title}
    </h2>
  );

  const containerStyle = {
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
            <p
              style={{
                fontSize: "1.1em",
                fontWeight: "bold",
                color: "#27272a",
                lineHeight: 1.3,
                fontStyle: "italic",
                borderLeft: `4px solid ${theme.accent}`,
                paddingLeft: "1rem",
                fontFamily: fonts.body,
                whiteSpace: "pre-wrap",
              }}
            >
              "{profile.content}"
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
                <h3 style={{ fontSize: "1.15em", fontWeight: 900, color: "#18181b", textTransform: "uppercase", letterSpacing: "-0.025em", fontFamily: fonts.heading }}>
                  {exp.title}
                </h3>
                <span
                  style={{
                    fontSize: "0.8em",
                    fontWeight: 900,
                    color: getColor("dates", "#a1a1aa"),
                    textTransform: "uppercase",
                    backgroundColor: "#f4f4f5",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    border: "1px solid #e4e4e7",
                  }}
                >
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.85em",
                  fontWeight: 900,
                  color: theme.accent,
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  fontFamily: fonts.body,
                }}
              >
                {exp.company} {exp.location && `• ${exp.location}`}
              </div>
              {exp.description && (
                <p style={{ color: "#52525b", fontSize: "0.9em", lineHeight: 1.3, whiteSpace: "pre-wrap", fontWeight: 500, fontFamily: fonts.body }}>
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
                backgroundColor: "#ffffff",
                padding: "1rem",
                borderRadius: "12px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                <h4 style={{ fontSize: "1em", fontWeight: "bold", textTransform: "uppercase", color: "#18181b", fontFamily: fonts.heading }}>
                  {proj.title}
                </h4>
                <div style={{ display: "flex", gap: "6px" }}>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75em", fontWeight: "bold", color: theme.accent, textDecoration: "none" }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75em", fontWeight: "bold", color: theme.accent, textDecoration: "none" }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
              </div>
              {proj.startDate && (
                <p style={{ fontSize: "0.75em", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), marginBottom: "4px" }}>
                  {formatDate(proj.startDate)} - {proj.current ? "Present" : formatDate(proj.endDate)}
                </p>
              )}
              {proj.description && (
                <p style={{ fontSize: "0.85em", color: "#52525b", lineHeight: 1.3, fontFamily: fonts.body }}>
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
              <h3 style={{ fontSize: "0.75em", fontWeight: "bold", color: "#18181b", textTransform: "uppercase", marginBottom: "4px", fontFamily: fonts.body }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.85em", color: "#71717a", lineHeight: 1.25, fontWeight: 500, fontFamily: fonts.body }}>
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
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ fontSize: "1.05em", fontWeight: 900, color: "#18181b", textTransform: "uppercase", fontFamily: fonts.heading }}>
                  {edu.degree}
                </h3>
                <span style={{ fontSize: "0.8em", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", fontFamily: fonts.body }}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={{ fontSize: "0.85em", fontWeight: 900, color: theme.accent, textTransform: "uppercase", fontFamily: fonts.body }}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              {edu.gpa && (
                <p style={{ fontSize: "0.8em", fontWeight: 900, color: getColor("dotsBarsBubbles", theme.accent), opacity: 0.8, textTransform: "uppercase", marginTop: "2px", fontFamily: fonts.body }}>
                  GPA: {edu.gpa}
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
            <div key={i} style={{ display: "flex", itemsCenter: "center", gap: "10px", padding: "0.5rem 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: "1.2em", fontWeight: 900, color: theme.accent, fontStyle: "italic" }}>
                #{String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 style={{ fontSize: "0.85em", fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px", fontFamily: fonts.heading }}>
                  {ach.title}
                </h3>
                <p style={{ fontSize: "0.8em", color: "#71717a", fontFamily: fonts.body }}>
                  {ach.date} • {ach.description}
                </p>
              </div>
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
            <div key={i} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.85em", fontWeight: 900, textTransform: "uppercase", color: "#18181b", fontFamily: fonts.heading, marginBottom: "2px" }}>
                {cert.name}
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8em", color: "#71717a", fontFamily: fonts.body }}>
                <span>{cert.issuer}</span>
                <span style={{ color: theme.accent, fontWeight: "bold" }}>{cert.date}</span>
              </div>
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
      {/* Dynamic Header */}
      <header
        style={{
          backgroundColor: "#18181b",
          color: "#ffffff",
          padding: `${theme.margin.top} ${theme.margin.right}`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div style={{ zIndex: 10, flex: 1 }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "-0.05em",
              lineHeight: 1,
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: "bold",
              color: theme.accent,
              textTransform: "uppercase",
              letterSpacing: "0.1rem",
              marginBottom: "1rem",
              fontFamily: fonts.heading,
            }}
          >
            {personalInfo.jobTitle || "Creative Professional"}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.8em",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            {personalInfo.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "9999px" }}>
                <Mail size={11} style={{ color: theme.accent }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "9999px" }}>
                <Phone size={11} style={{ color: theme.accent }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "9999px" }}>
                <MapPin size={11} style={{ color: theme.accent }} />
                <span>{personalInfo.location}</span>
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
                      backgroundColor: "rgba(255,255,255,0.08)",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    <span style={{ color: theme.accent }}>
                      {getLinkIcon(link.label, link.url, 11)}
                    </span>
                    <span>{link.label || "Link"}</span>
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
              border: `3px solid ${theme.accent}`,
              flexShrink: 0,
              zIndex: 10,
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
      <div style={{ padding: `${theme.margin.top} ${theme.margin.right} ${theme.margin.bottom} ${theme.margin.left}`, boxSizing: "border-box", flex: 1, display: "flex", flexDirection: "column" }}>
        {theme.columnLayout === "two" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "2rem", flex: 1 }}>
            {/* Sidebar (Left in Creative) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {renderSkills()}
              {renderEducation()}
              {renderCertifications()}
            </div>
            {/* Main Column (Right in Creative) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {renderSummary()}
              {renderExperience()}
              {renderProjects()}
              {renderAchievements()}
              {renderCustomSections()}
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
    </div>
  );
};

export default CreativeTemplate;
