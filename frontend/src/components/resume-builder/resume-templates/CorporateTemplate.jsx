import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
} from "lucide-react";

const CorporateTemplate = ({ data }) => {
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
    <div className="p-8 font-serif bg-white text-zinc-900 leading-tight w-full h-full flex flex-col items-center">
      {/* Centered Professional Header */}
      <header className="mb-10 text-center w-full max-w-4xl border-b-2 border-indigo-900 pb-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-900"></div>
        <h1 className="text-4xl font-bold uppercase tracking-[0.1em] mb-2 text-indigo-950">
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <p className="text-lg text-indigo-700 font-semibold mb-6 uppercase tracking-widest italic">
          {personalInfo.jobTitle || "Business Executive"}
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-900" /> <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-900" /> <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-900" /> <span>{personalInfo.location}</span>
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
                  className="flex items-center gap-2 hover:text-indigo-900 transition-colors"
                >
                  {getLinkIcon(link.label, link.url)}
                  <span>{link.label || "Link"}</span>
                </a>
              ),
          )}
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-4 gap-10 w-full flex-1 overflow-hidden">
        
        {/* Main Content (3/4) */}
        <div className="col-span-3 space-y-8 overflow-hidden">
          
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-4 border-l-4 border-indigo-900 pl-4 py-1">Professional Profile</h2>
              <p className="text-xs text-zinc-700 leading-relaxed text-justify italic">
                {personalInfo.objective}
              </p>
            </section>
          )}

          {/* Professional Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-6 border-l-4 border-indigo-900 pl-4 py-1">Career Background</h2>
              <div className="space-y-6">
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="group">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <h3 className="font-bold text-indigo-950 uppercase text-md tracking-tight">
                            {exp.title || "(Job Title)"}
                          </h3>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 border border-zinc-100 italic">
                            {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 mb-3 uppercase tracking-tighter">
                          {exp.company} {exp.location && `| ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-zinc-700 leading-snug text-justify whitespace-pre-wrap">
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
              <h2 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-6 border-l-4 border-indigo-900 pl-4 py-1">Strategic Projects</h2>
              <div className="space-y-6">
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="font-bold text-indigo-950 uppercase text-sm tracking-tight">
                            {proj.title}
                          </h3>
                          {proj.link && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{proj.link}</span>}
                        </div>
                        <p className="text-xs text-zinc-700 leading-snug">
                          {proj.description}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (1/4) */}
        <div className="col-span-1 space-y-8 overflow-hidden">
          
          {/* Skills Area */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">Core Expertise</h2>
              <div className="space-y-4">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index} className="group">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 group-hover:text-indigo-600 transition-colors">
                          {skill.category}
                        </h3>
                        <p className="text-xs font-bold text-indigo-900 leading-tight">
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Academic Background */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">Academic</h2>
              <div className="space-y-6">
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div key={i}>
                        <h3 className="font-bold text-indigo-950 text-xs uppercase mb-1 tracking-tight">
                          {edu.degree}
                        </h3>
                        <p className="text-[11px] font-bold text-indigo-600 mb-2 italic">
                          {edu.institution}
                        </p>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          {edu.startDate} — {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Certifications & Others */}
          {certifications?.some((cert) => cert.visible !== false) && (
            <section>
              <h2 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em] mb-6 pb-2 border-b border-indigo-100">Verification</h2>
              <div className="space-y-4">
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div key={i} className="flex flex-col gap-1">
                        <h3 className="font-bold text-indigo-950 text-[10px] uppercase leading-tight">
                          {cert.name}
                        </h3>
                        <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-tighter italic">
                          {cert.issuer}
                        </p>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">
                          {cert.date}
                        </span>
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

export default CorporateTemplate;
