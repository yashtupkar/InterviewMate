import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
} from "lucide-react";

const ExecutiveTemplate = ({ data }) => {
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
    <div className="p-8 font-sans bg-white leading-tight text-zinc-800 w-full h-full flex flex-col">
      {/* Premium Header */}
      <header className="mb-6 border-b-4 border-sky-900 pb-4 flex justify-between items-end gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-sky-950 mb-1 uppercase tracking-tight">
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p className="text-xl text-sky-700 font-semibold mb-3 tracking-wide italic">
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-zinc-700">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-900" />{" "}
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-900" />{" "}
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-900" />{" "}
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
                    className="flex items-center gap-2 hover:text-sky-700 transition-colors"
                  >
                    {getLinkIcon(link.label, link.url)}
                    <span>{link.label || "Link"}</span>
                  </a>
                ),
            )}
          </div>
        </div>

        {personalInfo.photoUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-sky-50 shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content Area */}
      <div className="grid grid-cols-3 gap-8 overflow-hidden">
        {/* Main Content (Left) */}
        <div className="col-span-2 space-y-5 overflow-hidden border-r border-zinc-100 pr-6">
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-2 uppercase tracking-widest">
                Executive Profile
              </h2>
              <p className="text-xs text-zinc-700 text-justify leading-normal">
                {personalInfo.objective}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Professional Background
              </h2>
              <div className="space-y-4">
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div key={i} className="relative">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-bold text-sky-900 uppercase text-sm">
                              {exp.title || "(Job Title)"}
                            </h3>
                            <p className="text-xs font-bold text-zinc-600">
                              {exp.company || "Company Name"}{" "}
                              {exp.location && `| ${exp.location}`}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-sky-800 uppercase italic">
                            {exp.startDate || "Start"} -{" "}
                            {exp.current ? "Present" : exp.endDate || "End"}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-zinc-700 whitespace-pre-wrap mt-1.5 leading-snug border-l-2 border-sky-50 pl-3">
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
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Key Projects
              </h2>
              <div className="space-y-4">
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div key={i} className="relative">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sky-900 uppercase text-sm">
                            {proj.title || "Project Title"}
                          </h3>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-sky-700 hover:underline italic"
                            >
                              Case Study ↗
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-snug border-l-2 border-sky-50 pl-3">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6 overflow-hidden">
          {/* Skills */}
          {skills?.some((skill) => skill.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Core Assets
              </h2>
              <div className="space-y-3">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index} className="bg-sky-50/30 p-2 rounded-lg border-l-4 border-sky-900">
                        <h3 className="text-[9px] font-black text-sky-900 uppercase tracking-wider mb-1">
                          {skill.category}
                        </h3>
                        <p className="text-xs font-bold text-zinc-800 leading-tight">
                          {skill.subSkills}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Education
              </h2>
              <div className="space-y-4">
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div key={i} className="bg-zinc-50/50 p-2 rounded-lg">
                        <h3 className="font-bold text-sky-900 text-xs uppercase mb-1">
                          {edu.degree || "Degree"}
                        </h3>
                        <p className="text-xs font-bold text-zinc-600 leading-tight">
                          {edu.institution || "Institution"}
                        </p>
                        <div className="flex justify-between text-[10px] font-bold text-sky-800 mt-1 uppercase italic">
                          <span>
                            {edu.startDate || "Start"} - {edu.endDate || "End"}
                          </span>
                          {edu.gpa && (
                            <span className="text-sky-900/70">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications?.some((cert) => cert.visible !== false) && (
            <section>
              <h2 className="text-lg font-extrabold text-sky-950 border-b-2 border-sky-100 pb-1 mb-3 uppercase tracking-widest">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div key={i} className="flex flex-col gap-0.5 border-b border-sky-50 pb-2 last:border-0">
                        <h3 className="font-bold text-sky-900 text-xs uppercase leading-tight">
                          {cert.name}
                        </h3>
                        <p className="text-[10px] font-bold text-sky-700/80">
                          {cert.issuer}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">
                          {cert.date}
                        </p>
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

export default ExecutiveTemplate;
