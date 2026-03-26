import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  LinkIcon,
} from "lucide-react";
import {
  formatResumeDate,
  formatDescriptionList,
  getFontFamily,
} from "../../../utils/resumeHelpers";

const CreativeTemplate = ({ data }) => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
    customizations: c,
  } = data;

  const theme = {
    accent: c?.colors?.accent || "#bef264",
    text: c?.colors?.text || "#18181b",
    background: c?.colors?.background || "#ffffff",
    border: c?.colors?.border?.color || "#e4e4e7",
    fontBody: c?.fonts?.body || "Inter",
    fontHeading: c?.fonts?.headings || "Inter",
    fontSize: c?.layout?.spacing?.fontSize || "11pt",
    lineHeight: c?.layout?.spacing?.lineHeight || 1.15,
    margin: c?.layout?.spacing?.margin || {
      left: "15mm",
      right: "15mm",
      top: "15mm",
      bottom: "15mm",
    },
    dateFormat: c?.dateFormat || "DD/MM/YYYY",
    language: c?.language || "English (UK)",
    listStyle: c?.entryLayout?.listStyle || "bullet",
    applyTo: c?.colors?.applyTo || {
      name: true,
      jobTitle: true,
      headings: true,
      headingsLine: true,
    },
  };

  const fonts = {
    body: getFontFamily(theme.fontBody),
    heading: getFontFamily(theme.fontHeading),
  };

  const getColor = (key, fallback = theme.text) => {
    return (theme.applyTo || {})[key] ? theme.accent : fallback;
  };

  const formatDate = (dateStr) =>
    formatResumeDate(dateStr, theme.dateFormat, theme.language);

  const getLinkIcon = (label, url) => {
    const text = (label + url).toLowerCase();
    if (text.includes("linkedin")) return <Linkedin className="w-3.5 h-3.5" />;
    if (text.includes("github")) return <Github className="w-3.5 h-3.5" />;
    return <LinkIcon className="w-3.5 h-3.5" />;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: fonts.body,
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        overflow: "hidden",
      }}
    >
      {/* Artistic Header */}
      <header className="bg-zinc-900 text-white p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-400 rounded-full -ml-24 -mb-24 opacity-10 blur-2xl"></div>

        <div className="relative z-10 flex flex-row justify-between items-center gap-4">
          <div className="text-left">
            <h1
              style={{
                fontSize: "2.25rem",
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
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: theme.accent,
                tracking: "0.1em",
                uppercase: true,
                opacity: 0.9,
                fontFamily: fonts.heading,
              }}
            >
              {personalInfo.jobTitle || "Creative Professional"}
            </p>

            <div className="mt-4 flex flex-wrap justify-start gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  <Mail className="w-3 h-3 text-lime-400" />{" "}
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  <Phone className="w-3 h-3 text-lime-400" />{" "}
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  <MapPin className="w-3 h-3 text-lime-400" />{" "}
                  <span>{personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {personalInfo.photoUrl && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-lime-400/30 rotate-3 shadow-2xl shrink-0">
              <img
                src={personalInfo.photoUrl}
                alt={`${personalInfo.fullName || "Profile"} photo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 grid grid-cols-4 gap-6 overflow-hidden">
        {/* Left Column - Details */}
        <div className="col-span-1 space-y-6 order-1 overflow-hidden">
          {/* Skills */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 border-b border-zinc-200 pb-1.5">
                Expertise
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index} className="group">
                        <h3
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#18181b",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                            fontFamily: fonts.body,
                          }}
                        >
                          {skill.category}
                        </h3>
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#71717a",
                            lineHeight: 1.25,
                            fontWeight: 500,
                            letterSpacing: "0.025em",
                            fontFamily: fonts.body,
                          }}
                        >
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Links */}
          {(personalInfo.links || []).length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 border-b border-zinc-200 pb-1.5">
                Social
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {personalInfo.links.map(
                  (link, i) =>
                    link.url && (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-zinc-200 hover:border-lime-400 transition-all group overflow-hidden relative shadow-sm"
                      >
                        <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-400 group-hover:text-lime-600 group-hover:bg-lime-50 transition-colors">
                          {getLinkIcon(link.label, link.url)}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 truncate">
                          {link.label || "Link"}
                        </span>
                      </a>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications?.some((cert) => cert.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 border-b border-zinc-200 pb-1.5">
                Verify
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div key={i} className="group">
                        <h3
                          style={{
                            fontSize: "9px",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            color: "#18181b",
                            lineHeight: 1.25,
                            marginBottom: "2px",
                            fontFamily: fonts.heading,
                          }}
                        >
                          {cert.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "8px",
                            fontWeight: "bold",
                            color: "#a1a1aa",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontFamily: fonts.body,
                          }}
                        >
                          <span>{cert.issuer}</span>
                          <span style={{ color: theme.accent }}>
                            {cert.date}
                          </span>
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Experience & Work */}
        <div className="col-span-3 space-y-6 order-2 overflow-hidden">
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#27272a",
                  lineHeight: 1.25,
                  tracking: "tight",
                  fontStyle: "italic",
                  opacity: 0.9,
                  borderLeft: `4px solid ${theme.accent}`,
                  paddingLeft: "1rem",
                  paddingVertical: "4px",
                  fontFamily: fonts.body,
                }}
              >
                "{personalInfo.objective}"
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "#a1a1aa",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontFamily: fonts.heading,
                }}
              >
                Experience{" "}
                <div
                  style={{ height: "1px", backgroundColor: "#e4e4e7", flex: 1 }}
                ></div>
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="relative">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 900,
                              color: "#18181b",
                              textTransform: "uppercase",
                              letterSpacing: "-0.05em",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {exp.title || "Role Name"}
                          </h3>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 900,
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              backgroundColor: "#f4f4f5",
                              paddingInline: "8px",
                              paddingBlock: "2px",
                              borderRadius: "9999px",
                              border: "1px solid #e4e4e7",
                              fontFamily: fonts.body,
                            }}
                          >
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Now" : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 900,
                            color: theme.accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "8px",
                            opacity: 0.8,
                            fontFamily: fonts.body,
                          }}
                        >
                          {exp.company} {exp.location && `• ${exp.location}`}
                        </div>
                        <p
                          style={{
                            color: "#52525b",
                            fontSize: "0.75rem",
                            lineHeight: 1.25,
                            whiteSpace: "pre-wrap",
                            fontWeight: 500,
                            fontFamily: fonts.body,
                          }}
                        >
                          {formatDescriptionList(
                            exp.description,
                            theme.listStyle,
                          )}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects?.some((proj) => proj.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-4">
                Featured Work <div className="h-px bg-zinc-200 flex-1"></div>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-lime-400 transition-all shadow-sm group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-md font-black text-zinc-900 uppercase tracking-tighter leading-none">
                            {proj.title}
                          </h3>
                          {proj.link && (
                            <Globe className="w-3.5 h-3.5 text-lime-500 opacity-50" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium leading-snug mb-2">
                          {proj.description}
                        </p>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-lime-600 uppercase tracking-widest hover:underline"
                          >
                            Launch Project ↗
                          </a>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Achievements */}
          {achievements?.some((ach) => ach.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-4">
                Recognition <div className="h-px bg-zinc-200 flex-1"></div>
              </h2>
              <div className="space-y-2">
                {achievements.map(
                  (ach, i) =>
                    ach.visible !== false && (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 shadow-lg"
                      >
                        <div className="text-xl font-black text-lime-400 opacity-50 italic">
                          #{String(i + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest mb-0.5">
                            {ach.title}
                          </h3>
                          <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {ach.date} • {ach.description}
                          </div>
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-4">
                Education <div className="h-px bg-zinc-200 flex-1"></div>
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: 900,
                              color: "#18181b",
                              textTransform: "uppercase",
                              letterSpacing: "-0.025em",
                              fontFamily: fonts.heading,
                            }}
                          >
                            {edu.degree}
                          </h3>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 900,
                              color: theme.accent,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              opacity: 0.8,
                              fontFamily: fonts.body,
                            }}
                          >
                            {edu.institution}{" "}
                            {edu.location && `• ${edu.location}`}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 900,
                              color: "#a1a1aa",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontFamily: fonts.body,
                            }}
                          >
                            {edu.startDate} - {edu.endDate}
                          </div>
                          {edu.gpa && (
                            <div
                              style={{
                                fontSize: "10px",
                                fontWeight: 900,
                                color: theme.accent,
                                opacity: 0.5,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginTop: "2px",
                                fontFamily: fonts.body,
                              }}
                            >
                              GPA: {edu.gpa}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate;
