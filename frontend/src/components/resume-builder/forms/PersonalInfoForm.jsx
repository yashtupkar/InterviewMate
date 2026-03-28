import React, { useRef } from "react";
import { useResume } from "../../../context/ResumeContext";
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  GripVertical,
  Pencil,
  Check,
  User,
} from "lucide-react";

const PersonalInfoForm = ({ onDone }) => {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Compress Image using Canvas
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 400; // Profile pics are small, 400px is plenty

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to dataURL with jpeg compression
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          updatePersonalInfo({ photoUrl: compressedDataUrl });
        };
        img.src = reader.result;
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Row: Name/Title and Photo */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={personalInfo.fullName || ""}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Yash Tupkar"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Professional title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={personalInfo.jobTitle || ""}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Software Developer"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 self-start">
            Profile Photo
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="w-32 h-32 rounded-3xl bg-zinc-950 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-lime-500/50 hover:bg-lime-400/5 transition-all overflow-hidden relative group"
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
              <div className="flex flex-col items-center text-zinc-600 group-hover:text-lime-400 transition-colors">
                <ImageIcon className="w-8 h-8 mb-2 stroke-[1.5]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Add Photo
                </span>
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
              className="text-[10px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-800/50">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={personalInfo.email || ""}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all shadow-sm"
            placeholder="e.g. yashtupkar6@gmail.com"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={personalInfo.phone || ""}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all shadow-sm"
            placeholder="e.g. +91 78982 97769"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={personalInfo.location || ""}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all shadow-sm"
            placeholder="e.g. Bhopal, Madhya Pradesh, India"
          />
        </div>
      </div>

      {/* Dynamic Links */}
      <div className="space-y-5 pt-4 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Websites & Social Links
          </label>
          <button
            onClick={addLink}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-lime-400 hover:text-lime-300 transition-colors bg-lime-400/5 px-3 py-1.5 rounded-lg border border-lime-400/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {(personalInfo.links || []).map((link, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group relative animate-in slide-in-from-left-2"
            >
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  value={link.label || ""}
                  onChange={(e) =>
                    handleLinkChange(index, "label", e.target.value)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all"
                  placeholder="e.g. Portfolio"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={link.url || ""}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all pr-10"
                      placeholder="https://..."
                    />
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/50">
        <button
          type="button"
          onClick={onDone}
          className="w-full py-4 bg-gradient-to-r from-lime-600 to-lime-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(190,242,100,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <Check className="w-5 h-5" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
