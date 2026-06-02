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
 * ProfessionalTemplate - Dynamic version
 * Standard professional layout with full customization support.
 */
const ProfessionalTemplate = ({ data }) => {
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
    accent: c.colors?.accent || "#3b82f6",
    text: c.colors?.text || "#18181b",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e4e4e7",
    fontBody: c.fonts?.body || "Source Serif Pro",
    fontHeading: c.fonts?.headings || "Source Serif Pro",
    fontSize: c.layout?.spacing?.fontSize || "10pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.15,
    margin: c.layout?.spacing?.margin || {
      left: "25mm",
      right: "25mm",
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

  // Section Header - Centered between top and bottom borders
  const SectionHeader = ({ title }) => (
    <div
      style={{
        borderTop: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#18181b"}`,
        borderBottom: `1px solid ${theme.applyTo.headingsLine ? theme.accent : "#18181b"}`,
        paddingTop: "0.3rem",
        paddingBottom: "0.3rem",
        marginTop: "1.4rem",
        marginBottom: "0.8rem",
        textAlign: "center",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <h2
        style={{
          color: getColor("headings", "#18181b"),
          fontFamily: fonts.heading,
          textTransform: "uppercase",
          fontSize: "1.05em",
          fontWeight: "bold",
          letterSpacing: "0.15em",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
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

  // Helper to render customized lists elegantly
  const renderDescriptionList = (description) => {
    if (!description) return null;
    const lines = description.split("\n").map((line) => line.trim()).filter(Boolean);
    return (
      <ul
        style={{
          marginTop: "0.4rem",
          marginBottom: "0.4rem",
          paddingLeft: "1.2rem",
          fontSize: "0.95em",
          lineHeight: 1.45,
          listStyleType: "disc",
        }}
      >
        {lines.map((line, idx) => {
          const bulletChars = ["-", "*", "•", "·"];
          let content = line;
          if (bulletChars.some((c) => line.startsWith(c))) {
            content = line.substring(1).trim();
          }
          return (
            <li key={idx} style={{ marginBottom: "3px", color: theme.text, fontFamily: fonts.body }}>
              {content}
            </li>
          );
        })}
      </ul>
    );
  };

  // Helper for language proficiency ratings
  const getProficiencyDots = (subtitle = "") => {
    const s = subtitle.toLowerCase();
    if (s.includes("native") || s.includes("bilingual") || s.includes("fluent") || s.includes("5/5") || s.includes("c2") || s.includes("expert")) return 5;
    if (s.includes("advanced") || s.includes("4/5") || s.includes("c1") || s.includes("highly")) return 4;
    if (s.includes("intermediate") || s.includes("conversational") || s.includes("3/5") || s.includes("b2") || s.includes("b1")) return 3;
    if (s.includes("elementary") || s.includes("basic") || s.includes("2/5") || s.includes("a2") || s.includes("a1")) return 2;
    if (s.includes("beginner") || s.includes("1/5")) return 1;
    return 4; // default fallback
  };

  const renderDots = (count) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <span
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: i <= count ? theme.text : "#d1d5db",
            display: "inline-block",
            margin: "0 2px",
          }}
        />
      );
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{dots}</div>;
  };

  const renderLanguages = (sec) => {
    const activeEntries = sec.entries.filter((e) => e.visible !== false);
    if (activeEntries.length === 0) return null;
    return (
      <section key={sec.id} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={sec.title || "Languages"} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.5rem 4rem",
            fontSize: "0.95em",
          }}
        >
          {activeEntries.map((entry, idx) => {
            const dotsCount = getProficiencyDots(entry.subtitle);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: fonts.body,
                }}
              >
                <span style={{ fontWeight: "bold" }}>{entry.title}</span>
                {renderDots(dotsCount)}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // Section Renderers
  const renderSummary = () => {
    const activeProfiles = profiles.filter((p) => p.visible !== false && p.content);
    if (activeProfiles.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
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
        <SectionHeader title={titles.experience || "Professional Experience"} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              {/* Row 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading, color: theme.text }}>
                  {exp.company}
                </span>
                <span style={{ fontSize: "0.9em", color: getColor("dates", "#000000"), fontFamily: fonts.body }}>
                  {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              {/* Row 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "2px" }}>
                <span style={{ fontStyle: "italic", fontSize: "0.95em", color: getColor("entrySubtitle", "#4b5563"), fontFamily: fonts.body }}>
                  {exp.title}
                </span>
                <span style={{ fontSize: "0.9em", color: "#4b5563", fontFamily: fonts.body }}>
                  {exp.location}
                </span>
              </div>
              {/* Bullet points */}
              {exp.description && renderDescriptionList(exp.description)}
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
            <div key={i} style={{ marginBottom: "4px" }}>
              {/* Row 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading, color: theme.text }}>
                  {edu.institution}
                </span>
                <span style={{ fontSize: "0.9em", color: getColor("dates", "#000000"), fontFamily: fonts.body }}>
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
              {/* Row 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "2px" }}>
                <span style={{ fontStyle: "italic", fontSize: "0.95em", color: getColor("entrySubtitle", "#4b5563"), fontFamily: fonts.body }}>
                  {edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` (GPA: ${edu.gpa})`}
                </span>
                <span style={{ fontSize: "0.9em", color: "#4b5563", fontFamily: fonts.body }}>
                  {edu.location}
                </span>
              </div>
              {edu.description && renderDescriptionList(edu.description)}
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
            <div key={i} style={{ marginBottom: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading, color: theme.text }}>
                  {proj.link ? (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: theme.text, textDecoration: "none" }}
                    >
                      {proj.title} ↗
                    </a>
                  ) : (
                    proj.title
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8em", fontWeight: "bold", color: theme.accent, textDecoration: "none", marginLeft: "8px" }}
                    >
                      [Code]
                    </a>
                  )}
                </span>
                <span style={{ fontSize: "0.9em", color: getColor("dates", "#000000"), fontFamily: fonts.body }}>
                  {proj.startDate && `${formatDate(proj.startDate)} – ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && renderDescriptionList(proj.description)}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    const activeSkills = skills.filter((s) => s.visible !== false);
    if (activeSkills.length === 0) return null;

    // Flatten skill categories and comma-separated sub-skills into clean individual items
    const flattenedSkills = [];
    activeSkills.forEach((s) => {
      if (s.subSkills) {
        const parts = s.subSkills.split(/[,|•\n]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          flattenedSkills.push(...parts);
        } else if (s.category) {
          flattenedSkills.push(s.category);
        }
      } else if (s.category) {
        flattenedSkills.push(s.category);
      }
    });

    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.skills || "Skills"} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem 1rem",
            fontSize: "0.95em",
          }}
        >
          {flattenedSkills.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: fonts.body }}>
              <span style={{ color: getColor("dotsBarsBubbles", "#000000"), fontSize: "1em", lineHeight: 1 }}>•</span>
              <span>{item}</span>
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
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading, color: theme.text }}>
                  {ach.title}
                </span>
                {ach.description && (
                  <span style={{ fontSize: "0.9em", color: "#4b5563", fontFamily: fonts.body, marginLeft: "8px" }}>
                    — {ach.description}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.9em", color: getColor("dates", "#000000"), fontFamily: fonts.body, whiteSpace: "nowrap", marginLeft: "10px" }}>
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
        <SectionHeader title={titles.certifications || "Certificates"} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem 1rem",
            fontSize: "0.95em",
          }}
        >
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ display: "flex", gap: "0.4rem", fontFamily: fonts.body }}>
              <span style={{ color: getColor("dotsBarsBubbles", "#000000"), flexShrink: 0 }}>•</span>
              <div>
                <span style={{ fontWeight: "bold" }}>{cert.name}</span>
                {cert.issuer && (
                  <span style={{ color: "#4b5563", display: "block", fontSize: "0.85em", marginTop: "1px" }}>
                    {cert.issuer}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCustomSections = () => {
    // Filter out sections that are Languages, as they are custom-rendered with proficiency dots
    const visibleCustomSections = customSections.filter(
      (sec) =>
        !sec.title?.toLowerCase().includes("lang") &&
        sec.entries?.some((e) => e.visible !== false)
    );

    // Find any Language sections to render with custom dots
    const languageSections = customSections.filter(
      (sec) =>
        sec.title?.toLowerCase().includes("lang") &&
        sec.entries?.some((e) => e.visible !== false)
    );

    if (visibleCustomSections.length === 0 && languageSections.length === 0) return null;

    return (
      <>
        {languageSections.map((sec) => renderLanguages(sec))}
        {visibleCustomSections.map((sec) => (
          <section key={sec.id} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader title={sec.title} />
            <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
              {sec.entries.filter((e) => e.visible !== false).map((entry, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "bold", fontSize: "0.95em", fontFamily: fonts.heading, color: theme.text }}>
                      {entry.link ? (
                        <a href={entry.link} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {entry.title} ↗
                        </a>
                      ) : (
                        entry.title
                      )}
                    </span>
                    <span style={{ fontSize: "0.9em", color: getColor("dates", "#000000"), fontFamily: fonts.body }}>
                      {entry.startDate && `${formatDate(entry.startDate)} – ${entry.endDate ? formatDate(entry.endDate) : "Present"}`}
                    </span>
                  </div>
                  {entry.subtitle && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "2px" }}>
                      <span style={{ fontStyle: "italic", fontSize: "0.95em", color: getSubtitleStyle().color, fontFamily: fonts.body }}>
                        {entry.subtitle}
                      </span>
                      {entry.location && (
                        <span style={{ fontSize: "0.9em", color: "#4b5563", fontFamily: fonts.body }}>
                          {entry.location}
                        </span>
                      )}
                    </div>
                  )}
                  {entry.content && renderDescriptionList(entry.content)}
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
      {/* Header - Centered for Redesigned Professional, without profile image */}
      <header style={{ textAlign: "center", marginBottom: "1.2rem" }}>
        <h1
          style={{
            fontSize: "2.3em",
            fontWeight: "bold",
            color: getColor("name"),
            marginBottom: "0.2rem",
            textTransform: "none",
            fontFamily: fonts.heading,
          }}
        >
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <p
          style={{
            fontSize: "1.05em",
            color: getColor("jobTitle", "#4b5563"),
            fontStyle: "italic",
            fontWeight: "normal",
            marginBottom: "0.6rem",
            fontFamily: fonts.heading,
            textTransform: "none",
            letterSpacing: "0.02em",
          }}
        >
          {personalInfo.jobTitle || "Job Title"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.2rem",
            fontSize: "0.9em",
            color: "#000000",
            marginBottom: "0.2rem",
            fontFamily: fonts.body,
          }}
        >
          {personalInfo.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <MapPin size={13} style={{ color: getColor("headerIcons", "#000000") }} aria-hidden="true" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Mail size={13} style={{ color: getColor("headerIcons", "#000000") }} aria-hidden="true" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Phone size={13} style={{ color: getColor("headerIcons", "#000000") }} aria-hidden="true" />
              <span>{personalInfo.phone}</span>
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
                  }}
                >
                  <span style={{ color: getColor("linkIcons", "#000000"), display: "flex" }}>
                    {getLinkIcon(link.label, link.url, 13)}
                  </span>
                  <span>{link.label}</span>
                </a>
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

export default ProfessionalTemplate;
