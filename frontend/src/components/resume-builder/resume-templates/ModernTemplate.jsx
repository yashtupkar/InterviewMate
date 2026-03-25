import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
} from "lucide-react";

const ModernTemplate = ({ data }) => {
  const {
    personalInfo,
    sectionTitles,
    experience,
    education,
    skills,
    projects,
    achievements,
    certifications,
  } = data;

  const titles = sectionTitles || {};

  const getLinkIcon = (label, url) => {
    const text = (label + url).toLowerCase();
    if (text.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
    if (text.includes("github")) return <Github className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div className="p-8 font-sans bg-white leading-tight text-zinc-800 w-full h-full flex flex-col">
      {/* Header */}
      <header className="mb-4 border-b-2 border-zinc-200 pb-4 flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-zinc-900 mb-1 uppercase tracking-tighter">
            {personalInfo.fullName ||
              `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
              "Your Name"}
          </h1>
          <p className="text-lg text-lime-600 font-bold mb-2 tracking-tight">
            {personalInfo.jobTitle || "Job Title"}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-zinc-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 hover:text-lime-600 transition-colors">
                <Mail className="w-3.5 h-3.5" />{" "}
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5 hover:text-lime-600 transition-colors">
                <Phone className="w-3.5 h-3.5" />{" "}
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5 hover:text-lime-600 transition-colors">
                <MapPin className="w-3.5 h-3.5" />{" "}
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
                    className="flex items-center gap-1.5 hover:text-lime-600 transition-colors"
                  >
                    {getLinkIcon(link.label, link.url)}
                    <span>{link.label || "Link"}</span>
                  </a>
                ),
            )}
          </div>
        </div>

        {personalInfo.photoUrl && (
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-zinc-100 shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content Area */}
      <div className="grid grid-cols-3 gap-6 overflow-hidden">
        {/* Main Content (Left) */}
        <div className="col-span-2 space-y-4 overflow-hidden">
          {/* Summary */}
          {personalInfo.objective && (
            <section>
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2 uppercase tracking-wider text-lime-600">
                {titles.objective || "Summary"}
              </h2>
              <p className="text-xs text-zinc-700 whitespace-pre-wrap">
                {personalInfo.objective}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience?.some((exp) => exp.visible !== false) && (
            <section>
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-3 uppercase tracking-wider text-lime-600">
                {titles.experience || "Experience"}
              </h2>
              <div className="space-y-3">
                {experience.map(
                  (exp, i) =>
                    exp.visible !== false && (
                      <div
                        key={i}
                        className="relative pl-3 border-l-2 border-zinc-100"
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <div>
                            <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-sm">
                              {exp.title || "(Job Title)"}
                            </h3>
                            <p className="text-xs font-bold text-lime-600">
                              {exp.company || "Company Name"}{" "}
                              {exp.location && `• ${exp.location}`}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase whitespace-nowrap bg-zinc-50 px-1.5 py-0.5 rounded">
                            {exp.startDate || "Start"} -{" "}
                            {exp.current ? "Present" : exp.endDate || "End"}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-zinc-700 whitespace-pre-wrap mt-1 leading-tight">
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
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-3 uppercase tracking-wider text-lime-600">
                {titles.projects || "Projects"}
              </h2>
              <div className="space-y-3">
                {projects.map(
                  (proj, i) =>
                    proj.visible !== false && (
                      <div
                        key={i}
                        className="relative pl-3 border-l-2 border-zinc-100"
                      >
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-sm">
                            {proj.title || "Project Title"}
                          </h3>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-lime-600 hover:underline"
                            >
                              View Project
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-tight">
                            {proj.description}
                          </p>
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
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-3 uppercase tracking-wider text-lime-600">
                {titles.achievements || "Achievements"}
              </h2>
              <div className="space-y-2">
                {achievements.map(
                  (ach, i) =>
                    ach.visible !== false && (
                      <div key={i} className="flex gap-3">
                        <div className="text-zinc-400 font-bold text-[10px] uppercase pt-0.5 shrink-0 w-20">
                          {ach.date}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 uppercase tracking-tight text-xs">
                            {ach.title}
                          </h3>
                          <p className="text-xs text-zinc-700 mt-0.5 leading-tight">
                            {ach.description}
                          </p>
                        </div>
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
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2 uppercase tracking-wider text-lime-600">
                {titles.skills || "Skills"}
              </h2>
              <div className="space-y-3">
                {skills.map(
                  (skill, index) =>
                    skill.visible !== false && (
                      <div key={index}>
                        <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">
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
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2 uppercase tracking-wider text-lime-600">
                {titles.education || "Education"}
              </h2>
              <div className="space-y-3">
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div key={i}>
                        <h3 className="font-bold text-zinc-900 text-xs uppercase mb-0.5">
                          {edu.degree || "Degree"}
                        </h3>
                        <p className="text-xs font-bold text-lime-600 leading-tight">
                          {edu.institution || "Institution"}
                        </p>
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-tighter">
                          <span>
                            {edu.startDate || "Start"} - {edu.endDate || "End"}
                          </span>
                          {edu.gpa && (
                            <span className="text-lime-600/70">
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
              <h2 className="text-md font-bold text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2 uppercase tracking-wider text-lime-600">
                {titles.certifications || "Certifications"}
              </h2>
              <div className="space-y-2">
                {certifications.map(
                  (cert, i) =>
                    cert.visible !== false && (
                      <div key={i}>
                        <h3 className="font-bold text-zinc-900 text-xs uppercase leading-tight mb-0.5">
                          {cert.name}
                        </h3>
                        <p className="text-[10px] font-bold text-lime-600/80">
                          {cert.issuer}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">
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

export default ModernTemplate;
