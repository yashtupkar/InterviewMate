import React, { forwardRef } from "react";
import ModernTemplate from "./resume-templates/ModernTemplate";
import ProfessionalTemplate from "./resume-templates/ProfessionalTemplate";
import CreativeTemplate from "./resume-templates/CreativeTemplate";
import ExecutiveTemplate from "./resume-templates/ExecutiveTemplate";
import TechTemplate from "./resume-templates/TechTemplate";
import CorporateTemplate from "./resume-templates/CorporateTemplate";
import ClassicTemplate from "./resume-templates/ClassicTemplate";
import { useResume } from "../../context/ResumeContext";

const PreviewSection = forwardRef(({ template }, ref) => {
  const { resumeData } = useResume();

  // Mapping template keys to their components
  const templates = {
    modern: ModernTemplate,
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
    corporate: CorporateTemplate,
    classic: ClassicTemplate,
  };

  const SelectedTemplate = templates[template] || ModernTemplate;

  return (
    <div
      className="bg-white shadow-2xl overflow-hidden print:shadow-none w-[210mm] h-[297mm] print:w-[210mm] print:h-[297mm] print:bg-white print:m-0 flex flex-col"
      ref={ref}
      style={{
        aspectRatio: "210 / 297",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <style>
        {`
                @media print {
                    @page {
                        size: A4;
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
