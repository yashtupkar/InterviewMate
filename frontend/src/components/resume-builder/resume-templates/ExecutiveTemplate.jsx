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
 * ExecutiveTemplate - Dynamic version
 * Premium business/executive layout with robust customizations support.
 */
const ExecutiveTemplate = ({ data }) => {
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
    accent: c.colors?.accent || "#0c4a6e",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Inter",
    fontHeading: c.fonts?.headings || "Inter",
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
    <h2
      style={{
        fontSize: "1.125em",
        fontWeight: 800,
        color: getColor("headings", "#082f49"),
        borderBottom: `2px solid ${theme.applyTo.headingsLine ? `${theme.accent}20` : "#e0f2fe"}`,
        paddingBottom: "4px",
        marginBottom: "12px",
        textTransform: theme.headingCase,
        letterSpacing: "0.1em",
        fontFamily: fonts.heading,
        textAlign: "left",
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
            <SectionHeader title={profile.title || titles.profiles || "Executive Summary"} />
            <p style={{ fontSize: "0.85em", color: "#18181b", textAlign: "justify", lineHeight: 1.4, fontFamily: fonts.body, whiteSpace: "pre-wrap" }}>
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
            <div key={i} className="relative">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "4px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: "bold", color: theme.accent, textTransform: "uppercase", fontSize: "0.875rem", fontFamily: fonts.heading }}>
                    {exp.title}
                  </h3>
                  <p style={getSubtitleStyle()}>
                    {exp.company} {exp.location && `| ${exp.location}`}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: getColor("dates", "#0c4a6e"),
                    textTransform: "uppercase",
                    fontStyle: "italic",
                    fontFamily: fonts.body,
                  }}
                >
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && (
                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#374151",
                    whiteSpace: "pre-wrap",
                    marginTop: "6px",
                    lineHeight: 1.4,
                    borderLeft: `2px solid ${theme.accent}20`,
                    paddingLeft: "0.75rem",
                    fontFamily: fonts.body,
                  }}
                >
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
        <SectionHeader title={titles.projects || "Key Projects"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeProjects.map((proj, i) => (
            <div key={i} className="relative">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <h3 style={{ fontWeight: "bold", color: theme.accent, textTransform: "uppercase", fontSize: "0.875rem", fontFamily: fonts.heading }}>
                  {proj.title}
                </h3>
                <div className="flex gap-2 items-center">
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "10px", fontWeight: "bold", color: "#0369a1", textDecoration: "none", fontStyle: "italic", fontFamily: fonts.body }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "10px", fontWeight: "bold", color: "#0369a1", textDecoration: "none", fontStyle: "italic", fontFamily: fonts.body }}
                    >
                      [Code]
                    </a>
                  )}
                  {proj.startDate && (
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: getColor("dates", "#0c4a6e"), fontStyle: "italic", fontFamily: fonts.body }}>
                      {formatDate(proj.startDate)} - {proj.current ? "Present" : formatDate(proj.endDate)}
                    </span>
                  )}
                </div>
              </div>
              {proj.description && (
                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#374151",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.4,
                    borderLeft: `2px solid ${theme.accent}20`,
                    paddingLeft: "0.75rem",
                    fontFamily: fonts.body,
                  }}
                >
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
        <h2 style={{ fontSize: "1rem", fontWeight: "extrabold", color: getColor("headings", "#082f49"), borderBottom: "2px solid #e0f2fe", pb: "4px", marginBottom: "12px", textTransform: theme.headingCase, letterSpacing: "0.1em", fontFamily: fonts.heading }}>
          {titles.skills || "Core Assets"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeSkills.map((skill, index) => (
            <div
              key={index}
              style={{
                backgroundColor: `${theme.accent}05`,
                padding: "0.5rem",
                borderRadius: "0.5rem",
                borderLeft: `4px solid ${theme.accent}`,
              }}
            >
              <h3 style={{ fontSize: "9px", fontWeight: 900, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px", fontFamily: fonts.heading }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.85em", fontWeight: "bold", color: "#18181b", lineHeight: 1.25, fontFamily: fonts.body }}>
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
        <h2 style={{ fontSize: "1rem", fontWeight: "extrabold", color: getColor("headings", "#082f49"), borderBottom: "2px solid #e0f2fe", pb: "4px", marginBottom: "12px", textTransform: theme.headingCase, letterSpacing: "0.1em", fontFamily: fonts.heading }}>
          {titles.education || "Education"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeEdu.map((edu, i) => (
            <div key={i} style={{ backgroundColor: "#fafafa", padding: "0.5rem", borderRadius: "0.5rem" }}>
              <h3 style={{ fontWeight: "bold", color: theme.accent, fontSize: "0.85em", textTransform: "uppercase", marginBottom: "4px", fontFamily: fonts.heading }}>
                {edu.degree}
              </h3>
              <p style={{ fontSize: "0.85em", fontWeight: "bold", color: "#4b5563", lineHeight: 1.25, fontFamily: fonts.body }}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "bold", color: getColor("dates", "#0c4a6e"), marginTop: "4px", textTransform: "uppercase", fontStyle: "italic", fontFamily: fonts.body }}>
                <span>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
                {edu.gpa && (
                  <span style={{ color: `${theme.accent}b3` }}>
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
        <h2 style={{ fontSize: "1rem", fontWeight: "extrabold", color: getColor("headings", "#082f49"), borderBottom: "2px solid #e0f2fe", pb: "4px", marginBottom: "12px", textTransform: theme.headingCase, letterSpacing: "0.1em", fontFamily: fonts.heading }}>
          {titles.achievements || "Recognition"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ backgroundColor: "#fafafa", padding: "0.5rem", borderRadius: "0.5rem" }}>
              <h3 style={{ fontWeight: "bold", color: theme.accent, fontSize: "0.85em", textTransform: "uppercase", marginBottom: "2px", fontFamily: fonts.heading }}>
                {ach.title}
              </h3>
              <p style={{ fontSize: "0.8em", color: "#4b5563", fontFamily: fonts.body }}>
                {ach.description}
              </p>
              <span style={{ fontSize: "9px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", fontFamily: fonts.body }}>
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
        <h2 style={{ fontSize: "1rem", fontWeight: "extrabold", color: getColor("headings", "#082f49"), borderBottom: "2px solid #e0f2fe", pb: "4px", marginBottom: "12px", textTransform: theme.headingCase, letterSpacing: "0.1em", fontFamily: fonts.heading }}>
          {titles.certifications || "Certifications"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "0.5rem", borderBottom: `1px solid ${theme.border}` }}>
              <h3 style={{ fontWeight: "bold", color: theme.accent, fontSize: "0.85em", textTransform: "uppercase", lineHeight: 1.25, fontFamily: fonts.heading }}>
                {cert.name}
              </h3>
              <p style={{ fontSize: "10px", fontWeight: "bold", color: "#4b5563", fontFamily: fonts.body }}>
                {cert.issuer}
              </p>
              <p style={{ fontSize: "9px", fontWeight: "bold", color: getColor("dates", "#a1a1aa"), textTransform: "uppercase", fontFamily: fonts.body }}>
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
      {/* Premium Header */}
      <header
        style={{
          marginBottom: "1.5rem",
          borderBottom: `4px solid ${theme.applyTo.headingsLine ? theme.accent : "#0c4a6e"}`,
          paddingBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: "1rem",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              color: getColor("name", "#082f49"),
              marginBottom: "4px",
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
              fontSize: "1.25rem",
              color: getColor("jobTitle", "#0369a1"),
              fontWeight: 600,
              marginBottom: "0.75rem",
              letterSpacing: "0.025em",
              fontStyle: "italic",
              fontFamily: fonts.heading,
              textTransform: "uppercase",
            }}
          >
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85em", fontWeight: "bold", color: "#52525b" }}>
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

      {/* Grid or Linear */}
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

export default ExecutiveTemplate;
