import React, { forwardRef } from "react";
import ModernTemplate from "./resume-templates/ModernTemplate";
import ProfessionalTemplate from "./resume-templates/ProfessionalTemplate";
import CreativeTemplate from "./resume-templates/CreativeTemplate";
import ExecutiveTemplate from "./resume-templates/ExecutiveTemplate";
import TechTemplate from "./resume-templates/TechTemplate";
import CorporateTemplate from "./resume-templates/CorporateTemplate";
import ClassicTemplate from "./resume-templates/ClassicTemplate";
import ElegantTemplate from "./resume-templates/ElegantTemplate";
import { useResume } from "../../context/ResumeContext";

const PreviewSection = forwardRef(({ template }, ref) => {
  const { resumeData } = useResume();
  const c = resumeData.customizations || {};
  const isLetter = c.pageFormat === "Letter";
  const size = isLetter
    ? { width: "215.9mm", height: "279.4mm", name: "Letter" }
    : { width: "210mm", height: "297mm", name: "A4" };

  // Mapping template keys to their components
  const templates = {
    modern: ModernTemplate,
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
    corporate: CorporateTemplate,
    classic: ClassicTemplate,
    elegant: ElegantTemplate,
  };

  const SelectedTemplate = templates[template] || ModernTemplate;

  return (
    <div
      className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden print:shadow-none print:bg-white print:m-0 flex flex-col border border-white/5"
      ref={ref}
      style={{
        width: size.width,
        height: size.height,
        aspectRatio: isLetter ? "8.5 / 11" : "210 / 297",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <style>
        {`
                @media print {
                    @page {
                        size: ${size.name};
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                `}
      </style>
      {/* The wrapper strictly matches A4 page (210mm x 297mm) */}
      <div className="w-full h-full text-zinc-950 overflow-hidden">
        <SelectedTemplate data={resumeData} />
      </div>
    </div>
  );
});

export default PreviewSection;
