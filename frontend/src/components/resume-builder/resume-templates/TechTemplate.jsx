import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
  Cpu,
  Layers,
} from "lucide-react";

const TechTemplate = ({ data }) => {
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
    if (text.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
    if (text.includes("github")) return <Github className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div className="flex w-full h-full bg-zinc-50 font-sans text-zinc-800 overflow-hidden">
      {/* Dark Sidebar */}
      <aside className="w-[240px] bg-zinc-900 text-zinc-100 p-6 flex flex-col shrink-0">
        {personalInfo.photoUrl && (
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-lime-400/30 mb-6 self-center shadow-2xl">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6 flex-1">
          {/* Contact in Sidebar */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span> Contact
            </h2>
            <div className="space-y-3 text-[11px]">
              {personalInfo.email && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> <span>{personalInfo.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills in Sidebar */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span> Stack
              </h2>
              <div className="space-y-4">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index}>
                        <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          {skill.category}
                        </h3>
                        <p className="text-[11px] font-medium text-zinc-200 leading-tight">
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Links at bottom of Sidebar */}
        <div className="mt-auto pt-6 border-t border-zinc-800">
            <div className="flex flex-wrap gap-3">
                {(personalInfo.links || []).map((link, i) => (
                    link.url && (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-lime-400 transition-colors">
                            {getLinkIcon(link.label, link.url)}
                        </a>
                    )
                ))}
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-hidden bg-white">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-zinc-900 mb-1 uppercase tracking-tighter">
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p className="text-xl text-lime-600 font-bold tracking-tight uppercase">
            {personalInfo.jobTitle || "Software Engineer"}
          </p>
        </header>

        <div className="space-y-6">
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">About</h2>
              <p className="text-xs text-zinc-600 leading-relaxed border-l-2 border-lime-100 pl-4">
                {personalInfo.objective}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Experience</h2>
              <div className="space-y-5">
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="relative">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-zinc-900 uppercase text-sm tracking-tight">
                            {exp.title || "(Job Title)"}
                          </h3>
                          <span className="text-[10px] font-black text-lime-600 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-100">
                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                          {exp.company} {exp.location && `• ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-zinc-600 leading-snug">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects?.some((proj) => proj.visible !== false) && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Selected Work</h2>
              <div className="grid grid-cols-2 gap-4">
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-lime-200 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-zinc-900 text-xs uppercase group-hover:text-lime-600 transition-colors">
                            {proj.title}
                          </h3>
                          {proj.link && <LinkIcon className="w-3 h-3 text-zinc-300" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-snug">
                          {proj.description}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Education */}
            {education?.some((edu) => edu.visible !== false) && (
                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Education</h2>
                    <div className="space-y-4">
                        {education.map((edu, i) => (
                            edu.visible !== false && (
                                <div key={i}>
                                    <h3 className="font-bold text-zinc-900 text-xs uppercase mb-1">{edu.degree}</h3>
                                    <p className="text-[10px] font-bold text-lime-600">{edu.institution}</p>
                                    <p className="text-[9px] font-black text-zinc-300 uppercase mt-1">{edu.startDate} - {edu.endDate}</p>
                                </div>
                            )
                        ))}
                    </div>
                </section>
            )}

            {/* Certs */}
            {certifications?.some((cert) => cert.visible !== false) && (
                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Certification</h2>
                    <div className="space-y-3">
                        {certifications.map((cert, i) => (
                            cert.visible !== false && (
                                <div key={i} className="flex flex-col">
                                    <h3 className="font-bold text-zinc-900 text-[10px] uppercase leading-tight">{cert.name}</h3>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{cert.issuer} • {cert.date}</p>
                                </div>
                            )
                        ))}
                    </div>
                </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechTemplate;
