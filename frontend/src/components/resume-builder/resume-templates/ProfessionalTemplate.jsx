import React from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

const ProfessionalTemplate = ({ data }) => {
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

  return (
    <div className="p-8 font-serif bg-white text-zinc-900 leading-tight w-full h-full flex flex-col">
      {/* Elegant Header */}
      <header className="border-b-2 border-zinc-900 pb-4 mb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-[0.2em] mb-2">
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <p className="text-md font-medium text-zinc-600 uppercase tracking-widest mb-4">
          {personalInfo.jobTitle || "Professional Title"}
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" /> <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" /> <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />{" "}
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          {(personalInfo.links || []).map(
            (link, i) =>
              link.url && (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 transition-colors"
                >
                  {link.label || "Link"}
                </a>
              ),
          )}
        </div>
      </header>

      <div className="space-y-4 overflow-hidden">
        {/* Professional Summary */}
        {personalInfo.objective && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-2">
              {titles.objective || "Professional Profile"}
            </h2>
            <p className="text-xs text-zinc-700 text-justify leading-snug italic">
              {personalInfo.objective}
            </p>
          </section>
        )}

        {/* Core Competencies */}
        {skills?.some((skill) => skill.visible !== false) && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-2">
              {titles.skills || "Core Competencies"}
            </h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              {skills.map(
                (skill, index) =>
                  skill.visible !== false && (
                    <div key={index}>
                      <h3 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                        {skill.category}
                      </h3>
                      <p className="text-xs font-medium text-zinc-800">
                        {skill.subSkills}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {experience?.some((exp) => exp.visible !== false) && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-3">
              {titles.experience || "Professional Experience"}
            </h2>
            <div className="space-y-3">
              {experience.map(
                (exp, i) =>
                  exp.visible !== false && (
                    <div key={i} className="group">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-md font-bold uppercase tracking-tight text-zinc-900">
                          {exp.title || "Role"}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          {exp.startDate} —{" "}
                          {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="text-xs font-bold italic text-zinc-600 mb-1">
                        {exp.company} {exp.location && `| ${exp.location}`}
                      </div>
                      <p className="text-xs text-zinc-700 text-justify leading-snug whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {projects?.some((proj) => proj.visible !== false) && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-3">
              {titles.projects || "Technical Projects"}
            </h2>
            <div className="space-y-3">
              {projects.map(
                (proj, i) =>
                  proj.visible !== false && (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-900">
                          {proj.title}
                        </h3>
                        {proj.link && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            {proj.link}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-700 text-justify leading-snug">
                        {proj.description}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Academic Background */}
          {education?.some((edu) => edu.visible !== false) && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-3">
                {titles.education || "Education"}
              </h2>
              <div className="space-y-3">
                {education.map(
                  (edu, i) =>
                    edu.visible !== false && (
                      <div key={i}>
                        <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-900">
                          {edu.degree}
                        </h3>
                        <p className="text-[10px] font-bold italic text-zinc-600 mb-0.5">
                          {edu.institution}{" "}
                          {edu.location && `| ${edu.location}`}
                        </p>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                          <span>
                            {edu.startDate} — {edu.endDate}
                          </span>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {/* Professional Certifications */}
            {certifications?.some((cert) => cert.visible !== false) && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-2">
                  {titles.certifications || "Certifications"}
                </h2>
                <div className="space-y-2">
                  {certifications.map(
                    (cert, i) =>
                      cert.visible !== false && (
                        <div
                          key={i}
                          className="flex justify-between items-baseline"
                        >
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-tight text-zinc-900">
                              {cert.name}
                            </h3>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                              {cert.issuer}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            {cert.date}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </section>
            )}

            {/* Awards & Achievements */}
            {achievements?.some((ach) => ach.visible !== false) && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-0.5 mb-2">
                  {titles.achievements || "Achievements"}
                </h2>
                <ul className="space-y-2">
                  {achievements.map(
                    (ach, i) =>
                      ach.visible !== false && (
                        <li
                          key={i}
                          className="text-xs text-zinc-700 leading-snug italic border-l-2 border-zinc-100 pl-3 py-0.5"
                        >
                          <span className="font-bold uppercase tracking-tight text-zinc-900 block non-italic mb-0.5">
                            {ach.title}
                          </span>
                          {ach.description}
                        </li>
                      ),
                  )}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
