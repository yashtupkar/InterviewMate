import React, { useState } from "react";
import {
  IoColorPalette,
  IoText,
  IoLayers,
  IoGlobe,
  IoExpand,
  IoChevronDown,
  IoChevronForward,
  IoCheckmark,
  IoGrid,
  IoEllipsisHorizontal,
  IoImage,
  IoRemove,
  IoAdd,
  IoRefresh,
} from "react-icons/io5";
import { MdViewColumn } from "react-icons/md";
import { useResume } from "../../context/ResumeContext";
import { getFontFamily } from "../../utils/resumeHelpers.jsx";

const SectionWrapper = ({
  id,
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  description,
}) => (
  <div
    className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${
      isOpen
        ? "bg-zinc-900 border-zinc-700/50 shadow-xl"
        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
    }`}
  >
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center gap-4 p-4 text-left transition-all"
    >
      <div
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          isOpen
            ? "bg-lime-400 text-zinc-950 scale-110 shadow-[0_0_15px_rgba(190,242,100,0.3)]"
            : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3
          className={`font-bold text-sm transition-colors ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}
        >
          {title}
        </h3>
        {!isOpen && description && (
          <p className="text-[11px] text-zinc-600 font-medium mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div
        className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-lime-400" : "text-zinc-600"}`}
      >
        <IoChevronDown className="w-4 h-4" />
      </div>
    </button>

    <div
      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="overflow-hidden">
        <div className="p-5 pt-0 border-t border-zinc-800/50 mt-2 bg-zinc-900/50">
          <div className="pt-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

const PremiumSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}) => {
  const range = max - min;
  const ticks = Math.floor(range / step);

  const handleIncrement = () => onChange(Math.min(max, value + step));
  const handleDecrement = () => onChange(Math.max(min, value - step));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-zinc-200">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-xs font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-sm active:scale-95"
        >
          <IoRemove className="w-3.5 h-3.5" />
        </button>

        <div className="relative flex-1 h-9 bg-zinc-950/50 rounded-xl flex items-center px-1 border border-zinc-800/50 shadow-inner group">
          <div className="absolute inset-x-4 inset-y-0 flex justify-between items-center px-0.5 opacity-10 group-hover:opacity-20 transition-opacity">
            {Array.from({ length: Math.min(ticks, 10) + 1 }).map((_, i) => (
              <div key={i} className="w-0.5 h-2 bg-zinc-500 rounded-full" />
            ))}
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />

          <div
            className="absolute w-7 h-7 bg-lime-400 rounded-lg shadow-[0_0_15px_rgba(190,242,100,0.4)] flex items-center justify-center pointer-events-none z-10 transition-transform duration-200 active:scale-90"
            style={{
              left: `calc(${((value - min) / range) * 100}% + (1px))`,
              transform: `translateX(-50%)`,
              marginLeft: "-1px",
            }}
          >
            <div className="w-1 h-2.5 bg-zinc-950/30 rounded-full" />
          </div>
        </div>

        <button
          onClick={handleIncrement}
          className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-sm active:scale-95"
        >
          <IoAdd className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const FONT_GROUPS = {
  serif: [
    "Lora",
    "Source Serif Pro",
    "Zilla Slab",
    "PT Serif",
    "Literata",
    "EB Garamond",
    "Latin Modern",
    "Aleo",
    "Crimson Pro",
    "Cormorant Garamond",
    "Vollkorn",
    "Amiri",
    "Crimson Text",
    "Alegreya",
    "Playfair Display",
  ],
  sans: ["Inter", "Roboto", "Outfit", "Space Grotesk"],
  mono: ["Mono", "Roboto Mono", "Inconsolata"],
};

const FontSelector = ({ label, value, onChange }) => {
  const [activeGroup, setActiveGroup] = useState(() => {
    if (FONT_GROUPS.sans.includes(value)) return "sans";
    if (FONT_GROUPS.mono.includes(value)) return "mono";
    return "serif";
  });

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
        {label}
      </label>

      {/* Category Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "serif", name: "Serif", font: "serif" },
          { id: "sans", name: "Sans", font: "sans-serif" },
          { id: "mono", name: "Mono", font: "monospace" },
        ].map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${
              activeGroup === group.id
                ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.1)]"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
            }`}
          >
            <span
              className="text-3xl font-medium"
              style={{ fontFamily: group.font }}
            >
              Aa
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {group.name}
            </span>
          </button>
        ))}
      </div>

      {/* Font Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
        {FONT_GROUPS[activeGroup].map((font) => (
          <button
            key={font}
            onClick={() => onChange(font)}
            style={{ fontFamily: getFontFamily(font) }}
            className={`py-2.5 px-3 rounded-xl border text-sm transition-all text-center truncate ${
              value === font
                ? "bg-lime-400/10 border-lime-400 text-lime-400 font-bold"
                : "bg-zinc-800/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
            title={font}
          >
            {font}
          </button>
        ))}
      </div>
    </div>
  );
};

const CustomizeSection = () => {
  const { resumeData, updateCustomizations, resetCustomizations } = useResume();
  const [openSection, setOpenSection] = useState("layout");

  const c = resumeData.customizations || {};

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 mb-4">
            <IoColorPalette className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">
              Design System
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            Customization
          </h2>
          <p className="text-sm text-zinc-500 font-medium">
            Global style and layout controls.
          </p>
        </div>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset all design customizations to default?",
              )
            ) {
              resetCustomizations();
            }
          }}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl border border-zinc-700 transition-all group"
          title="Reset to Default"
        >
          <IoRefresh className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Language & Region */}
        <SectionWrapper
          id="language"
          title="Language & Region"
          icon={IoGlobe}
          isOpen={openSection === "language"}
          onToggle={toggleSection}
          description="Localization and date settings"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Language
              </label>
              <select
                value={c.language || "English (UK)"}
                onChange={(e) =>
                  updateCustomizations("language", e.target.value)
                }
                className="w-full bg-zinc-800/50 border-zinc-700 rounded-xl py-2.5 px-4 text-sm text-white focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400 outline-none transition-all"
              >
                <option>English (UK)</option>
                <option>English (US)</option>
                <option>German</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Date Format
              </label>
              <select
                value={c.dateFormat || "DD/MM/YYYY"}
                onChange={(e) =>
                  updateCustomizations("dateFormat", e.target.value)
                }
                className="w-full bg-zinc-800/50 border-zinc-700 rounded-xl py-2.5 px-4 text-sm text-white focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400 outline-none transition-all"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
                <option>Month YYYY</option>
              </select>
            </div>
          </div>
        </SectionWrapper>

        {/* Layout & Spacing */}
        <SectionWrapper
          id="layout"
          title="Layout & Spacing"
          icon={IoLayers}
          isOpen={openSection === "layout"}
          onToggle={toggleSection}
          description="Page margins and entry spacing"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Column Structure
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["one", "two"].map((col) => (
                  <button
                    key={col}
                    onClick={() => updateCustomizations("layout.columns", col)}
                    className={`flex flex-col items-center gap-3 py-4 px-3 rounded-2xl border-2 transition-all ${
                      c.layout?.columns === col
                        ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(190,242,100,0.1)]"
                        : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <div className="flex gap-1">
                      <div className="w-3 h-8 bg-current opacity-20 rounded-sm"></div>
                      {col === "two" && (
                        <div className="w-3 h-8 bg-current opacity-20 rounded-sm"></div>
                      )}
                    </div>
                    <span className="text-xs font-bold capitalize">
                      {col} Column
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <PremiumSlider
              label="Font Size"
              value={parseFloat(c.layout?.spacing?.fontSize) || 10.5}
              min={8}
              max={14}
              step={0.5}
              unit="pt"
              onChange={(val) =>
                updateCustomizations("layout.spacing.fontSize", `${val}pt`)
              }
            />

            <PremiumSlider
              label="Line Height"
              value={c.layout?.spacing?.lineHeight || 1.15}
              min={1}
              max={2.5}
              step={0.05}
              onChange={(val) =>
                updateCustomizations("layout.spacing.lineHeight", val)
              }
            />

            <PremiumSlider
              label="Page Margins"
              value={parseInt(c.layout?.spacing?.margin?.left) || 22}
              min={0}
              max={50}
              step={2}
              unit="mm"
              onChange={(val) => {
                updateCustomizations("layout.spacing.margin.left", `${val}mm`);
                updateCustomizations("layout.spacing.margin.right", `${val}mm`);
                updateCustomizations(
                  "layout.spacing.margin.top",
                  `${val / 2}mm`,
                );
                updateCustomizations(
                  "layout.spacing.margin.bottom",
                  `${val / 2}mm`,
                );
              }}
            />

            <PremiumSlider
              label="Entry Spacing"
              value={c.layout?.spacing?.spaceBetweenEntries || 10}
              min={0}
              max={40}
              step={2}
              onChange={(val) =>
                updateCustomizations("layout.spacing.spaceBetweenEntries", val)
              }
            />
          </div>
        </SectionWrapper>

        {/* Colors */}
        <SectionWrapper
          id="colors"
          title="Colors"
          icon={IoColorPalette}
          isOpen={openSection === "colors"}
          onToggle={toggleSection}
          description="Accent color and theme mode"
        >
          <div className="space-y-8">
            {/* Swatches */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Accent Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {/* None Option */}
                <button
                  onClick={() =>
                    updateCustomizations("colors.accent", "transparent")
                  }
                  className={`w-full aspect-square rounded-xl border-2 relative overflow-hidden bg-zinc-800 transition-all ${c.colors?.accent === "transparent" ? "border-white" : "border-zinc-700"}`}
                >
                  <div className="absolute top-1/2 left-1/2 -rotate-45 -translate-x-1/2 -translate-y-1/2 w-[120%] h-0.5 bg-red-500/80" />
                </button>

                {/* Preset Swatches */}
                {[
                  "#bef264",
                  "#475569",
                  "#4d7c0f",
                  "#065f46",
                  "#0369a1",
                  "#1e40af",
                  "#4338ca",
                  "#6d28d9",
                  "#a21caf",
                  "#be185d",
                  "#be123c",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCustomizations("colors.accent", color)}
                    className={`w-full aspect-square rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${c.colors?.accent === color ? "border-white ring-4 ring-lime-400/20" : "border-transparent shadow-lg"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}

                {/* Custom Color Wheel */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 cursor-pointer group shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 rotate-45" />
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={c.colors?.accent}
                    onChange={(e) =>
                      updateCustomizations("colors.accent", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Apply To Grid */}
            <div className="space-y-4 pt-6 border-t border-zinc-800/50">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Apply Accent To
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name" },
                  { key: "jobTitle", label: "Job Title" },
                  { key: "headings", label: "Section Titles" },
                  { key: "headingsLine", label: "Underlines" },
                  { key: "dates", label: "Date Ranges" },
                  { key: "linkIcons", label: "Social Icons" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      updateCustomizations(
                        `colors.applyTo.${item.key}`,
                        !c.colors?.applyTo?.[item.key],
                      )
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      c.colors?.applyTo?.[item.key]
                        ? "bg-zinc-800 border-zinc-600 text-white"
                        : "bg-zinc-900/40 border-zinc-800/50 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                        c.colors?.applyTo?.[item.key]
                          ? "bg-lime-400 border-lime-400"
                          : "border-zinc-700"
                      }`}
                    >
                      {c.colors?.applyTo?.[item.key] && (
                        <IoCheckmark className="w-3 h-3 text-zinc-950" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Typography */}
        <SectionWrapper
          id="typography"
          title="Typography"
          icon={IoText}
          isOpen={openSection === "typography"}
          onToggle={toggleSection}
          description="Font families and text styles"
        >
          <div className="space-y-8">
            <FontSelector
              label="Primary Typeface"
              value={c.fonts?.headings || "Inter"}
              onChange={(val) => {
                updateCustomizations("fonts.headings", val);
                updateCustomizations("fonts.body", val);
              }}
            />
          </div>
        </SectionWrapper>

        {/* Headings & Entries */}
        <SectionWrapper
          id="headings-entries"
          title="Headings & Entries"
          icon={IoExpand}
          isOpen={openSection === "headings-entries"}
          onToggle={toggleSection}
          description="Text formatting and list styles"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Heading Case
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["capitalize", "uppercase"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      updateCustomizations(
                        "sectionHeadings.capitalization",
                        mode,
                      )
                    }
                    className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                      c.sectionHeadings?.capitalization === mode
                        ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                        : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Subtitle Weight
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["bold", "italic", "normal"].map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      updateCustomizations("entryLayout.subtitleStyle", style)
                    }
                    className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                      c.entryLayout?.subtitleStyle === style
                        ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(190,242,100,0.3)]"
                        : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Bullet Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["bullet", "hyphen", "none"].map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      updateCustomizations("entryLayout.listStyle", style)
                    }
                    className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                      c.entryLayout?.listStyle === style
                        ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                        : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {style === "bullet"
                      ? "• Bullet"
                      : style === "hyphen"
                        ? "- Hyphen"
                        : "None"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Profile Image */}
        <SectionWrapper
          id="profile-image"
          title="Profile Image"
          icon={IoImage}
          isOpen={openSection === "profile-image"}
          onToggle={toggleSection}
          description="Avatar shape and size"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Frame Shape
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "square",
                    icon: (
                      <div className="w-4 h-4 border-2 border-current rounded-none" />
                    ),
                  },
                  {
                    id: "rounded",
                    icon: (
                      <div className="w-4 h-4 border-2 border-current rounded-sm" />
                    ),
                  },
                  {
                    id: "circle",
                    icon: (
                      <div className="w-4 h-4 border-2 border-current rounded-full" />
                    ),
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() =>
                      updateCustomizations("profileImage.style", style.id)
                    }
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                      c.profileImage?.style === style.id
                        ? "bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(190,242,100,0.1)]"
                        : "bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {style.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {style.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {c.profileImage?.style === "rounded" && (
              <PremiumSlider
                label="Corner Roundness"
                value={c.profileImage?.borderRadius || 8}
                min={0}
                max={50}
                step={2}
                unit="px"
                onChange={(val) =>
                  updateCustomizations("profileImage.borderRadius", val)
                }
              />
            )}

            <PremiumSlider
              label="Display Size"
              value={c.profileImage?.size || 80}
              min={40}
              max={150}
              step={5}
              unit="px"
              onChange={(val) => updateCustomizations("profileImage.size", val)}
            />
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default CustomizeSection;
