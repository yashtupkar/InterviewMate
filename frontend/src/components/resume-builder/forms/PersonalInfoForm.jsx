import React, { useRef } from "react";
import { useResume } from "../../../context/ResumeContext";
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  ImageIcon,
  X,
  GripVertical,
  Pencil,
  Check,
} from "lucide-react";

const PersonalInfoForm = ({ onDone }) => {
  const {
    resumeData,
    updatePersonalInfo,
    updateSectionTitle,
    saveResume,
    isSaving,
  } = useResume();
  const { personalInfo, sectionTitles } = resumeData;
  const fileInputRef = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(sectionTitles.objective);

  const handleTitleSave = () => {
    updateSectionTitle("objective", tempTitle);
    setIsEditingTitle(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  const handleSave = async () => {
    await saveResume();
    if (onDone) onDone();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo({ photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...(personalInfo.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updatePersonalInfo({ links: newLinks });
  };

  const addLink = () => {
    const newLinks = [
      ...(personalInfo.links || []),
      { label: "New Link", url: "" },
    ];
    updatePersonalInfo({ links: newLinks });
  };

  const removeLink = (index) => {
    const newLinks = (personalInfo.links || []).filter((_, i) => i !== index);
    updatePersonalInfo({ links: newLinks });
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Name/Title and Photo */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={
                personalInfo.fullName ||
                `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
              }
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Yash Tupkar"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Professional title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={personalInfo.jobTitle}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Software Developer"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 self-start">
            Photo
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="w-32 h-32 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/50 transition-all overflow-hidden relative group"
          >
            {personalInfo.photoUrl ? (
              <>
                <img
                  src={personalInfo.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-zinc-600 group-hover:text-pink-500/70">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-medium">Add Photo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          {personalInfo.photoUrl && (
            <button
              onClick={() => updatePersonalInfo({ photoUrl: "" })}
              className="text-[10px] text-zinc-500 hover:text-red-400 font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Contact Info (Full width as per image) */}
      <div className="space-y-4 pt-2 border-t border-zinc-800/50">
        <div className="relative group">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              name="email"
              value={personalInfo.email}
              onChange={handleChange}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
              placeholder="e.g. yashtupkar6@gmail.com"
            />
            <GripVertical className="w-5 h-5 text-zinc-700 cursor-grab" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Phone
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="phone"
              value={personalInfo.phone}
              onChange={handleChange}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
              placeholder="e.g. +91 78982 97769"
            />
            <GripVertical className="w-5 h-5 text-zinc-700 cursor-grab" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Location
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="location"
              value={personalInfo.location}
              onChange={handleChange}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
              placeholder="e.g. Bhopal, Madhya Pradesh, India"
            />
            <GripVertical className="w-5 h-5 text-zinc-700 cursor-grab" />
          </div>
        </div>
      </div>

      {/* Dynamic Links */}
      <div className="space-y-4 pt-2 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Websites & Social Links
          </label>
          <button
            onClick={addLink}
            className="flex items-center gap-1 text-[11px] font-bold text-pink-500 hover:text-pink-400 transition-colors bg-pink-500/5 px-2 py-1 rounded-lg"
          >
            <Plus className="w-3 h-3" />
            ADD LINK
          </button>
        </div>

        <div className="space-y-3">
          {(personalInfo.links || []).map((link, index) => (
            <div key={index} className="flex gap-2 items-end group">
              <div className="flex-1 space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                  Label
                </label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) =>
                    handleLinkChange(index, "label", e.target.value)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                  placeholder="e.g. Portfolio"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all pr-12"
                      placeholder="https://..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button className="p-1 px-2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> Link
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-5 h-5 text-zinc-700 cursor-grab" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-pink-500 transition-all w-48"
                autoFocus
              />
              <button
                onClick={handleTitleSave}
                className="p-1 text-lime-400 hover:scale-110 transition-transform"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setTempTitle(sectionTitles.objective);
                }}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0">
                {sectionTitles.objective}
              </label>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-pink-500 transition-colors bg-zinc-900/50 px-2 py-1 rounded-lg border border-zinc-800/50 hover:border-pink-500/30"
              >
                <Pencil className="w-2.5 h-2.5" />
                Edit Heading
              </button>
            </div>
          )}
        </div>
        <textarea
          name="objective"
          value={personalInfo.objective}
          onChange={handleChange}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none shadow-sm mb-6"
          placeholder="A brief summary of your professional background and goals..."
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-3 h-3 text-white" />
            )}
          </div>
          {isSaving ? "SAVING..." : "DONE"}
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
