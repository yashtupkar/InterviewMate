import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
  Globe,
} from "lucide-react";

const CreativeTemplate = ({ data }) => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
  } = data;

  const getLinkIcon = (label, url) => {
    const text = (label + url).toLowerCase();
    if (text.includes("linkedin")) return <Linkedin className="w-3.5 h-3.5" />;
    if (text.includes("github")) return <Github className="w-3.5 h-3.5" />;
    return <LinkIcon className="w-3.5 h-3.5" />;
  };

  return (
    <div className="p-0 font-sans bg-zinc-50 flex flex-col w-full h-full overflow-hidden">
      {/* Artistic Header */}
      <header className="bg-zinc-900 text-white p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-400 rounded-full -ml-24 -mb-24 opacity-10 blur-2xl"></div>

        <div className="relative z-10 flex flex-row justify-between items-center gap-4">
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-1 leading-none">
              {personalInfo.fullName ||
                `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
                "Your Name"}
            </h1>
            <p className="text-lg font-bold text-lime-400 tracking-widest uppercase opacity-90">
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
                alt="Profile"
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
              <div className="space-y-4">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index} className="group">
                        <h3 className="text-[11px] font-bold text-zinc-900 uppercase mb-1 group-hover:text-lime-600 transition-colors">
                          {skill.category}
                        </h3>
                        <p className="text-[10px] text-zinc-500 leading-snug font-medium lowercase tracking-wide">
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
              <div className="space-y-3">
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div key={i} className="group">
                        <h3 className="text-[9px] font-black uppercase text-zinc-900 leading-tight mb-0.5 group-hover:text-lime-600 transition-colors">
                          {cert.name}
                        </h3>
                        <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                          <span>{cert.issuer}</span>
                          <span className="text-lime-600/50">{cert.date}</span>
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
              <p className="text-lg font-bold text-zinc-800 leading-snug tracking-tight italic opacity-90 border-l-4 border-lime-400 pl-4 py-1">
                "{personalInfo.objective}"
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-4">
                Experience <div className="h-px bg-zinc-200 flex-1"></div>
              </h2>
              <div className="space-y-4">
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="relative">
                        <div className="flex flex-row items-baseline justify-between gap-1 mb-2">
                          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter group-hover:text-lime-600 transition-colors">
                            {exp.title || "Role Name"}
                          </h3>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                            {exp.startDate} -{" "}
                            {exp.current ? "Now" : exp.endDate}
                          </span>
                        </div>
                        <div className="text-xs font-black text-lime-600 uppercase tracking-widest mb-2 opacity-80">
                          {exp.company} {exp.location && `• ${exp.location}`}
                        </div>
                        <p className="text-zinc-600 text-xs leading-snug whitespace-pre-wrap font-medium">
                          {exp.description}
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
              <div className="space-y-4">
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div
                        key={i}
                        className="flex flex-row justify-between gap-2"
                      >
                        <div>
                          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">
                            {edu.degree}
                          </h3>
                          <p className="text-xs font-black text-lime-600 uppercase tracking-widest opacity-80">
                            {edu.institution}{" "}
                            {edu.location && `• ${edu.location}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {edu.startDate} - {edu.endDate}
                          </div>
                          {edu.gpa && (
                            <div className="text-[10px] font-black text-lime-500/50 uppercase tracking-widest mt-0.5">
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
