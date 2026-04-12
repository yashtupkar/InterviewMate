import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import ModernTemplate from "./resume-templates/ModernTemplate";
import ProfessionalTemplate from "./resume-templates/ProfessionalTemplate";
import CreativeTemplate from "./resume-templates/CreativeTemplate";
import ExecutiveTemplate from "./resume-templates/ExecutiveTemplate";
import TechTemplate from "./resume-templates/TechTemplate";
import CorporateTemplate from "./resume-templates/CorporateTemplate";
import ClassicTemplate from "./resume-templates/ClassicTemplate";
import ElegantTemplate from "./resume-templates/ElegantTemplate";
import StandardTemplate from "./resume-templates/StandardTemplate";
import { useResume } from "../../context/ResumeContext";

const PreviewSection = forwardRef(
  (
    {
      template,
      onPageCountChange,
      exportMode = false,
    },
    ref,
  ) => {
    const { resumeData } = useResume();
    const [contentHeight, setContentHeight] = useState(0);
    const [pageHeightPx, setPageHeightPx] = useState(1122);
    const printRef = useRef();
    const pageMeasureRef = useRef();

    // Forward the printRef to the parent through implemented useImperativeHandle
    useImperativeHandle(ref, () => printRef.current);

    const c = resumeData.customizations || {};
    const isLetter = c.pageFormat === "Letter";
    const size = isLetter
      ? { width: "215.9mm", height: "279.4mm", name: "Letter", hVal: 279.4 }
      : { width: "210mm", height: "297mm", name: "A4", hVal: 297 };

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
      standard: StandardTemplate,
    };

    const SelectedTemplate = templates[template] || ModernTemplate;

    // Measure content height whenever data or template changes
    useEffect(() => {
      if (printRef.current) {
        // Use a small delay to ensure DOM is fully updated
        const timer = setTimeout(() => {
          setContentHeight(printRef.current.scrollHeight);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [resumeData, template]);

    // Accurately measure what 297mm (A4) or 279.4mm (Letter) is in pixels in this browser
    useEffect(() => {
      if (pageMeasureRef.current) {
        setPageHeightPx(pageMeasureRef.current.offsetHeight);
      }
    }, [size.height]);

    // Add a tiny tolerance to avoid creating a phantom extra page from sub-pixel rounding.
    const PAGE_OVERFLOW_TOLERANCE_PX = 4;
    const overflowHeight = Math.max(
      0,
      contentHeight - pageHeightPx - PAGE_OVERFLOW_TOLERANCE_PX,
    );
    const numPages = 1 + Math.ceil(overflowHeight / pageHeightPx);

    useEffect(() => {
      if (typeof onPageCountChange === "function") {
        onPageCountChange(numPages);
      }
    }, [numPages, onPageCountChange]);

    return (
      <div className="flex flex-col items-center">
        <style>
          {`
          @media print {
            @page {
              size: ${size.name};
              margin: 0;
            }
            .hide-on-print { display: none !important; }
            .show-on-print { display: block !important; }
            body { 
              margin: 0; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @media screen {
            .show-on-print { 
              position: absolute !important;
              left: -9999px !important;
              top: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          }
        `}
        </style>

        {/* 
          1. PRINT VERSION (Continuous) 
          This is the actual master copy that react-to-print will use.
          It's always rendered but hidden on screen (using show-on-print class).
      */}
        <div
          ref={printRef}
          className={`${exportMode ? "" : "show-on-print "}bg-white text-zinc-950`}
          style={{
            width: size.width,
            minHeight: size.height,
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          }}
        >
          <SelectedTemplate data={resumeData} />
        </div>

        {/* 
          2. PREVIEW VERSION (Paged)
          This version splits the view into A4 segments with gaps.
      */}
        {!exportMode && (
          <div className="hide-on-print flex flex-col gap-10 items-center p-12">
            {/* Hidden element just to measure the exact pixel height of one page */}
            <div
              ref={pageMeasureRef}
              style={{
                height: size.height,
                width: size.width,
                position: "absolute",
                visibility: "hidden",
                pointerEvents: "none",
              }}
            />

            {Array.from({ length: numPages }).map((_, i) => {
              const pageOffset = i * pageHeightPx;

              return (
                <div key={i} className="p-2 sm:p-3">
                  <div
                    className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 relative"
                    style={{
                      width: size.width,
                      height: size.height,
                      aspectRatio: isLetter ? "8.5 / 11" : "210 / 297",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        marginTop: `-${pageOffset}px`,
                        width: "100%",
                        flex: 1,
                        overflow: "hidden",
                      }}
                    >
                      <SelectedTemplate data={resumeData} />
                    </div>

                    <div className="absolute bottom-2 right-4 text-[10px] text-zinc-400 font-bold tracking-widest uppercase opacity-20 pointer-events-none">
                      Page {i + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

export default PreviewSection;
