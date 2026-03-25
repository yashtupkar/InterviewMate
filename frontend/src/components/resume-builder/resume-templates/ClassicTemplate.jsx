import React from "react";

const ClassicTemplate = ({ data }) => {
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
    <div className="p-8 font-serif bg-white text-zinc-950 w-full h-full flex flex-col text-[11px] leading-tight overflow-hidden">
      {/* Centered Header */}
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-1">
          {personalInfo.fullName ||
            `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() ||
            "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-2 text-[10px] font-bold">
          {personalInfo.phone && (
            <>
              <span>{personalInfo.phone}</span>
              <span className="text-zinc-300">|</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span>{personalInfo.email}</span>
              <span className="text-zinc-300">|</span>
            </>
          )}
          {(personalInfo.links || []).map(
            (link, i) =>
              link.url && (
                <React.Fragment key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.label || "Link"}
                  </a>
                  <span className="text-zinc-300">|</span>
                </React.Fragment>
              ),
          )}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      <div className="space-y-3">
        {/* Profile / Objective */}
        {personalInfo.objective && (
          <section>
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.objective || "Profile"}
            </h2>
            <p className="text-justify leading-snug">
              {personalInfo.objective}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience?.some((exp) => exp.visible !== false) && (
          <section>
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.experience || "Work Experience"}
            </h2>
            <div className="space-y-2">
              {experience.map(
                (exp, i) =>
                  exp.visible !== false && (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">
                          {exp.title || "(Job Title)"}
                        </h3>
                        <span className="font-bold">
                          {exp.startDate || "Start"} -{" "}
                          {exp.current ? "Present" : exp.endDate || "End"}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <p className="italic">
                          {exp.company || "Company Name"}
                        </p>
                        <p className="italic text-[10px]">{exp.location}</p>
                      </div>
                      {exp.description && (
                        <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                          {exp.description.split("\n").map(
                            (point, idx) =>
                              point.trim() && (
                                <li key={idx} className="leading-snug">
                                  {point.replace(/^[•\-\*]\s*/, "")}
                                </li>
                              ),
                          )}
                        </ul>
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
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.projects || "Projects"}
            </h2>
            <div className="space-y-2">
              {projects.map(
                (proj, i) =>
                  proj.visible !== false && (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <div className="flex gap-2 items-baseline">
                          <h3 className="font-bold">{proj.title}</h3>
                          {proj.link && (
                            <div className="flex gap-1 text-[9px] font-bold">
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-500 hover:underline"
                              >
                                [Link]
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="font-bold">2025</span>{" "}
                        {/* Placeholder or actual year if available */}
                      </div>
                      {proj.description && (
                        <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                          {proj.description.split("\n").map(
                            (point, idx) =>
                              point.trim() && (
                                <li key={idx} className="leading-snug">
                                  {point.replace(/^[•\-\*]\s*/, "")}
                                </li>
                              ),
                          )}
                        </ul>
                      )}
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {skills?.some((skill) => skill.visible !== false) && (
          <section>
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.skills || "Technical Skills"}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
              {skills.map(
                (skill, index) =>
                  skill.visible !== false && (
                    <div key={index} className="flex gap-1">
                      <span className="font-bold whitespace-nowrap">
                        {skill.category}:
                      </span>
                      <span>{skill.subSkills}</span>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {education?.some((edu) => edu.visible !== false) && (
          <section>
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.education || "Education"}
            </h2>
            <div className="space-y-1.5">
              {education.map(
                (edu, i) =>
                  edu.visible !== false && (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">{edu.institution}</h3>
                        <span className="font-bold">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <p className="italic">
                          {edu.degree} {edu.gpa && `— CGPA: ${edu.gpa}`}
                        </p>
                        <p className="italic text-[10px]">{edu.location}</p>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Achievements & Recognition */}
        {achievements?.some((ach) => ach.visible !== false) && (
          <section>
            <h2 className="text-xs font-bold uppercase border-b border-zinc-300 mb-1">
              {titles.achievements || "Achievements & Recognition"}
            </h2>
            <div className="space-y-1">
              {achievements.map(
                (ach, i) =>
                  ach.visible !== false && (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <div className="flex gap-1">
                          <span className="font-bold">• {ach.title}</span>
                          <span className="text-zinc-500">
                            — {ach.description}
                          </span>
                        </div>
                        <span className="italic text-[10px] whitespace-nowrap">
                          {ach.date}
                        </span>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
