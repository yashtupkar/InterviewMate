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
 * StandardTemplate - Dynamic version
 * Classic, clean resume layout supporting full design system and ATS compliance.
 */
const StandardTemplate = ({ data }) => {
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
    fontBody: c.fonts?.body || "Inter",
    fontHeading: c.fonts?.headings || "Inter",
    fontSize: c.layout?.spacing?.fontSize || "11pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.4,
    margin: c.layout?.spacing?.margin || {
      left: "20mm",
      right: "20mm",
      top: "20mm",
      bottom: "20mm",
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
    <h3
      style={{
        fontSize: "1.1em",
        fontWeight: "bold",
        borderBottom: `2px solid ${theme.accent}`,
        paddingBottom: "2px",
        marginBottom: "8px",
        borderColor: theme.accent,
        color: getColor("headings"),
        fontFamily: fonts.heading,
        textTransform: theme.headingCase,
        textAlign: "left",
      }}
    >
      {title}
    </h3>
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
            <SectionHeader title={profile.title || titles.profiles || "Summary"} />
            <p style={{ fontSize: "0.95em", fontFamily: fonts.body }}>
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
                <h4 style={{ fontSize: "1em", fontWeight: "bold", fontFamily: fonts.heading }}>
                  {exp.title}
                </h4>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#18181b") }}>
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p style={{ ...getSubtitleStyle(), fontSize: "0.9em", marginBottom: "4px" }}>
                {exp.company} {exp.location && `, ${exp.location}`}
              </p>
              {exp.description && (
                <div
                  style={{ fontSize: "0.9em", marginTop: "4px" }}
                  dangerouslySetInnerHTML={{
                    __html: formatDescriptionList(exp.description, theme.listStyle).replace(/\n/g, "<br/>"),
                  }}
                />
              )}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                  flexDirection: theme.subtitlePlacement === "next-line" ? "column" : "row",
                }}
              >
                <h4 style={{ fontSize: "1em", fontWeight: "bold", fontFamily: fonts.heading }}>
                  {edu.degree}
                </h4>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#18181b") }}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={getSubtitleStyle()}>
                {edu.institution} {edu.location && `• ${edu.location}`}
              </p>
              {edu.gpa && (
                <p style={{ fontSize: "0.85em", color: getColor("dotsBarsBubbles", "#52525b") }}>
                  GPA: {edu.gpa}
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
                <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                  <h4 style={{ fontSize: "1em", fontWeight: "bold", fontFamily: fonts.heading }}>
                    {proj.title}
                  </h4>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none" }}
                    >
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none" }}
                    >
                      [Code]
                    </a>
                  )}
                </div>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#18181b") }}>
                  {proj.startDate && `${formatDate(proj.startDate)} - ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.9em", color: "#374151", fontFamily: fonts.body }}>
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
        <div style={{ display: "grid", gridTemplateColumns: theme.columnLayout === "two" ? "1fr" : "repeat(3, 1fr)", gap: `${theme.spaceBetweenEntries * 0.75}px` }}>
          {activeSkills.map((skill, index) => (
            <div key={index}>
              <h3 style={{ fontSize: "0.75em", fontWeight: "bold", textTransform: "uppercase", color: "#a1a1aa", fontFamily: fonts.heading }}>
                {skill.category}
              </h3>
              <p style={{ fontSize: "0.85em", fontWeight: "bold", fontFamily: fonts.body }}>
                {skill.subSkills}
              </p>
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
                <h3 style={{ fontWeight: "bold", fontSize: "0.9em", fontFamily: fonts.heading }}>
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
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${theme.border}`, paddingBottom: "4px" }}>
              <div>
                <h3 style={{ fontSize: "0.85em", fontWeight: "bold", textTransform: "uppercase", fontFamily: fonts.heading }}>
                  {cert.name}
                </h3>
                <p style={{ ...getSubtitleStyle(), fontSize: "0.8em" }}>
                  {cert.issuer}
                </p>
              </div>
              <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#a1a1aa") }}>
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
      <header className="text-center" style={{ marginBottom: "1.5rem" }}>
        <h1
          className="text-4xl font-bold tracking-tight mb-1"
          style={{ color: getColor("name"), fontFamily: fonts.heading, margin: "0 0 4px 0" }}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <h2
            className="text-xl font-semibold"
            style={{ color: getColor("jobTitle", "#52525b"), margin: "0 0 12px 0", fontFamily: fonts.heading }}
          >
            {personalInfo.jobTitle}
          </h2>
        )}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.9em", color: "#52525b", marginBottom: "6px" }}>
          {personalInfo.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ color: getColor("headerIcons", "#52525b"), display: "flex" }}>
                <Mail size={13} aria-hidden="true" />
              </span>
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ color: getColor("headerIcons", "#52525b"), display: "flex" }}>
                <Phone size={13} aria-hidden="true" />
              </span>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ color: getColor("headerIcons", "#52525b"), display: "flex" }}>
                <MapPin size={13} aria-hidden="true" />
              </span>
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.9em" }}>
          {(personalInfo.links || []).map((link, i) => link.url && (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: getColor("linkIcons", "inherit"),
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              {getLinkIcon(link.label, link.url, 13)}
              <span>{link.label}</span>
            </a>
          ))}
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

export default StandardTemplate;
