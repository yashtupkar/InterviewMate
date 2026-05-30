import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Flag,
  Calendar,
  User,
  Briefcase,
  Cpu,
  GraduationCap,
  Award,
  Trophy,
  FolderGit,
  HelpCircle,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
  getLinkIcon,
} from "../../../utils/resumeHelpers.jsx";

/**
 * GridTemplate - A premium two-column sidebar grid layout.
 * Inspired by the high-end operational resume style of Matteo Ricci.
 * Features a circular avatar, left narrow sidebar, orange accents, and Lucide icons.
 */
const GridTemplate = ({ data }) => {
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

  // Rich operational orange is the default theme accent
  const theme = {
    accent: c.colors?.accent || "#ea580c",
    text: c.colors?.text || "#1f2937",
    background: c.colors?.background || "#ffffff",
    border: c.colors?.border?.color || "#e5e7eb",
    fontBody: c.fonts?.body || "Inter",
    fontHeading: c.fonts?.headings || "Lora",
    fontSize: c.layout?.spacing?.fontSize || "10pt",
    lineHeight: c.layout?.spacing?.lineHeight || 1.3,
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
    spaceBetweenEntries: c.layout?.spacing?.spaceBetweenEntries || 12,
    applyTo: c.colors?.applyTo || {
      name: true,
      jobTitle: true,
      headings: true,
      headingsLine: true,
      headerIcons: true,
      dotsBarsBubbles: false,
      dates: false,
      entrySubtitle: false,
      linkIcons: true,
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
      color: getColor("entrySubtitle", "#374151"),
      fontFamily: fonts.body,
    };
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  // Custom contact item icon resolver including Flag and Calendar support
  const getHeaderIcon = (label, url) => {
    if (!label) return <Globe size={13} style={{ color: theme.accent }} />;
    const l = label.toLowerCase();
    if (l.includes("mail") || l.includes("@")) {
      return <Mail size={13} style={{ color: theme.accent }} />;
    }
    if (l.includes("phone") || l.includes("+") || l.includes("mobile")) {
      return <Phone size={13} style={{ color: theme.accent }} />;
    }
    if (l.includes("map") || l.includes("location") || l.includes("address")) {
      return <MapPin size={13} style={{ color: theme.accent }} />;
    }
    if (l.includes("linkedin")) {
      return <Linkedin size={13} style={{ color: theme.accent }} />;
    }
    if (l.includes("nationality") || l.includes("citizenship") || l.includes("flag") || l.includes("italian")) {
      return <Flag size={13} style={{ color: theme.accent }} />;
    }
    if (l.includes("date of birth") || l.includes("birth") || l.includes("calendar") || l.includes("born")) {
      return <Calendar size={13} style={{ color: theme.accent }} />;
    }
    return getLinkIcon(label, url, 13);
  };

  // Section header matching the design in the image
  const SectionHeader = ({ title, icon: Icon }) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {Icon && (
            <Icon
              size={16}
              strokeWidth={2.5}
              style={{ color: theme.accent }}
              aria-hidden="true"
            />
          )}
          <h2
            style={{
              fontSize: "1em",
              fontWeight: "bold",
              color: getColor("headings", "#111827"),
              textTransform: theme.headingCase,
              letterSpacing: "0.05em",
              margin: 0,
              fontFamily: fonts.heading,
            }}
          >
            {title}
          </h2>
        </div>
        <div
          style={{
            width: "100%",
            height: "2.5px",
            backgroundColor: theme.applyTo.headingsLine ? theme.accent : theme.border,
            marginTop: "6px",
          }}
        />
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

  // Renderers
  const renderSummary = () => {
    const activeProfiles = profiles.filter((p) => p.visible !== false && p.content);
    if (activeProfiles.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {activeProfiles.map((profile, i) => (
          <section key={i} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader
              title={profile.title || titles.profiles || "Summary"}
              icon={User}
            />
            <p
              style={{
                fontSize: "0.9em",
                color: theme.text,
                textAlign: "justify",
                whiteSpace: "pre-wrap",
                fontFamily: fonts.body,
              }}
            >
              {profile.content}
            </p>
          </section>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const activeSkills = skills.filter((s) => s.visible !== false);
    if (activeSkills.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.skills || "Skills"} icon={Cpu} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {activeSkills.map((skill, index) => (
            <div key={index} style={{ fontSize: "0.9em" }}>
              <span style={{ fontWeight: "bold", color: "#111827", display: "block" }}>
                {skill.category}
              </span>
              {skill.subSkills && (
                <span style={{ color: "#4b5563", fontSize: "0.95em" }}>{skill.subSkills}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLanguagesSidebar = () => {
    // Looks for custom sections labeled 'language' to render cleanly in the sidebar
    const langSections = customSections.filter(
      (sec) =>
        sec.title?.toLowerCase().includes("lang") &&
        sec.entries?.some((e) => e.visible !== false)
    );
    if (langSections.length === 0) return null;

    return (
      <>
        {langSections.map((sec) => (
          <section key={sec.id} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader title={sec.title} icon={Globe} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9em" }}>
              {sec.entries
                .filter((e) => e.visible !== false)
                .map((entry, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#111827" }}>{entry.title}:</span>
                    <span style={{ color: "#4b5563" }}>{entry.subtitle}</span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </>
    );
  };

  const renderCertificationsSidebar = () => {
    const activeCerts = certifications.filter((cert) => cert.visible !== false);
    if (activeCerts.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.certifications || "Certificates"} icon={Award} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activeCerts.map((cert, i) => (
            <div key={i} style={{ fontSize: "0.9em" }}>
              <span style={{ fontWeight: "bold", color: "#111827", display: "block", lineHeight: 1.2 }}>
                {cert.name}
              </span>
              <span style={{ color: "#4b5563", fontSize: "0.85em" }}>
                {cert.issuer} {cert.date && `(${cert.date})`}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    const activeExperience = experience.filter((exp) => exp.visible !== false);
    if (activeExperience.length === 0) return null;
    return (
      <section style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
        <SectionHeader title={titles.experience || "Professional Experience"} icon={Briefcase} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeExperience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#111827", fontFamily: fonts.heading }}>
                  {exp.title}
                  <span style={{ fontWeight: "normal", fontSize: "0.95em", color: "#4b5563" }}>
                    , {exp.company}
                  </span>
                </h3>
              </div>
              <p style={{ fontSize: "0.8em", color: "#6b7280", margin: "2px 0 6px 0", fontWeight: 600 }}>
                {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                {exp.location && ` | ${exp.location}`}
              </p>
              {exp.description && (
                <p style={{ fontSize: "0.9em", color: "#374151", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
                  {formatDescriptionList(exp.description, theme.listStyle)}
                </p>
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
        <SectionHeader title={titles.education || "Education"} icon={GraduationCap} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeEdu.map((edu, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#111827", fontFamily: fonts.heading }}>
                  {edu.institution}
                  {edu.location && <span style={{ fontWeight: "normal", fontSize: "0.9em", color: "#4b5563" }}>, {edu.location}</span>}
                </h3>
              </div>
              {edu.degree && (
                <p style={{ ...getSubtitleStyle(), fontSize: "0.9em", fontStyle: "italic", margin: "2px 0" }}>
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </p>
              )}
              <div style={{ fontSize: "0.8em", color: "#6b7280", fontWeight: 600 }}>
                {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
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
        <SectionHeader title={titles.projects || "Projects"} icon={FolderGit} />
        <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spaceBetweenEntries}px` }}>
          {activeProjects.map((proj, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                  <h3 style={{ fontWeight: "bold", fontSize: "0.95em", color: "#111827", fontFamily: fonts.heading }}>
                    {proj.title}
                  </h3>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none" }}>
                      [Link]
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8em", color: theme.accent, textDecoration: "none" }}>
                      [Code]
                    </a>
                  )}
                </div>
                <span style={{ fontSize: "0.85em", fontWeight: "bold", color: getColor("dates", "#6b7280") }}>
                  {proj.startDate && `${formatDate(proj.startDate)} – ${proj.current ? "Present" : formatDate(proj.endDate)}`}
                </span>
              </div>
              {proj.description && (
                <p style={{ fontSize: "0.9em", color: "#374151", textAlign: "justify", whiteSpace: "pre-wrap", fontFamily: fonts.body }}>
                  {formatDescriptionList(proj.description, theme.listStyle)}
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
        <SectionHeader title={titles.achievements || "Achievements"} icon={Trophy} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {activeAchievements.map((ach, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.9em" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#111827" }}>• {ach.title}</span>
                <span style={{ color: "#374151" }}>— {ach.description}</span>
              </div>
              <span style={{ fontStyle: "italic", fontSize: "0.8em", color: "#9ca3af", marginLeft: "10px" }}>
                {ach.date}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCustomSectionsMain = () => {
    // Filters out language custom sections since they render in the sidebar
    const visibleCustomSections = customSections.filter(
      (sec) =>
        !sec.title?.toLowerCase().includes("lang") &&
        sec.entries?.some((e) => e.visible !== false)
    );
    if (visibleCustomSections.length === 0) return null;
    return (
      <>
        {visibleCustomSections.map((sec) => (
          <section key={sec.id} style={{ marginBottom: `${theme.spaceBetweenEntries}px` }}>
            <SectionHeader title={sec.title} icon={HelpCircle} />
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
                    <span style={{ fontSize: "0.8em", fontWeight: "bold", color: getColor("dates", "#6b7280") }}>
                      {entry.startDate && `${formatDate(entry.startDate)} - ${entry.endDate ? formatDate(entry.endDate) : "Present"}`}
                    </span>
                  </div>
                  {entry.subtitle && (
                    <p style={{ ...getSubtitleStyle(), fontSize: "0.85em", marginBottom: "4px" }}>
                      {entry.subtitle} {entry.location && `• ${entry.location}`}
                    </p>
                  )}
                  {entry.content && (
                    <p style={{ fontSize: "0.9em", whiteSpace: "pre-wrap", color: "#4b5563", fontFamily: fonts.body }}>
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
      {/* Matte Ricci Style Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1.8rem",
          width: "100%",
          gap: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        {personalInfo.photoUrl && (
          <div
            style={{
              width: `${theme.profileImage.size}px`,
              height: `${theme.profileImage.size}px`,
              borderRadius: "50%",
              overflow: "hidden",
              border: `1.5px solid ${theme.border}`,
              flexShrink: 0,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
            }}
          >
            <img
              src={personalInfo.photoUrl}
              alt={`${personalInfo.fullName || "Profile"} photo`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontSize: "2.3em",
              fontWeight: "bold",
              color: getColor("name", "#111827"),
              margin: 0,
              fontFamily: fonts.heading,
              lineHeight: 1.1,
            }}
          >
            {personalInfo.fullName || "Matteo Ricci"}
            {personalInfo.jobTitle && (
              <span
                style={{
                  fontSize: "0.55em",
                  fontWeight: "normal",
                  fontStyle: "italic",
                  marginLeft: "15px",
                  color: getColor("jobTitle", "#4b5563"),
                  fontFamily: fonts.body,
                }}
              >
                {personalInfo.jobTitle}
              </span>
            )}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              gap: "8px 24px",
              justifyContent: "start",
              fontSize: "0.82em",
              color: "#4b5563",
              fontWeight: 500,
              marginTop: "8px",
              width: "100%",
            }}
          >
            {personalInfo.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {getHeaderIcon("mail", "")}
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {getHeaderIcon("phone", "")}
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {getHeaderIcon("location", "")}
                <span>{personalInfo.location}</span>
              </div>
            )}
            {(personalInfo.links || []).map((link, i) => link.url && (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "5px", color: "inherit", textDecoration: "none" }}
                className="hover:underline"
              >
                {getHeaderIcon(link.label || "link", link.url)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Two-Column Sidebar Layout */}
      {theme.columnLayout === "two" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", flex: 1 }}>
          {/* Left Sidebar Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {renderSummary()}
            {renderSkills()}
            {renderLanguagesSidebar()}
            {renderCertificationsSidebar()}
          </div>
          {/* Right Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {renderExperience()}
            {renderEducation()}
            {renderProjects()}
            {renderAchievements()}
            {renderCustomSectionsMain()}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {renderSummary()}
          {renderExperience()}
          {renderSkills()}
          {renderEducation()}
          {renderProjects()}
          {renderAchievements()}
          {renderLanguagesSidebar()}
          {renderCertificationsSidebar()}
          {renderCustomSectionsMain()}
        </div>
      )}
    </div>
  );
};

export default GridTemplate;
