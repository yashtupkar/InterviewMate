import React, { useState } from "react";
import { useResume } from "../../../context/ResumeContext";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  Award,
  Pencil,
  X,
} from "lucide-react";

const CertificationsForm = () => {
  const { resumeData, updateCertifications, updateSectionTitle } = useResume();
  const { certifications, sectionTitles } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(sectionTitles.certifications);

  const handleTitleSave = () => {
    updateSectionTitle("certifications", tempTitle);
    setIsEditingTitle(false);
  };

  const handleAdd = () => {
    const newEntry = {
      name: "",
      issuer: "",
      date: "",
      visible: true,
    };
    setEditingIndex(certifications.length);
    setEditEntry(newEntry);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...certifications[index] });
  };

  const handleDone = () => {
    const newCert = [...certifications];
    if (editingIndex === certifications.length) {
      newCert.push(editEntry);
    } else {
      newCert[editingIndex] = editEntry;
    }
    updateCertifications(newCert);
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemove = (index) => {
    const newCert = certifications.filter((_, i) => i !== index);
    updateCertifications(newCert);
  };

  const toggleVisibility = (index) => {
    const newCert = [...certifications];
    newCert[index].visible = !newCert[index].visible;
    updateCertifications(newCert);
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Edit Certification
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleVisibility(editingIndex)}
              className="p-2 bg-zinc-800/50 rounded-lg hover:text-lime-400 transition-colors"
            >
              {editEntry.visible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                setEditingIndex(null);
                setEditEntry(null);
              }}
              className="p-2 bg-zinc-800/50 rounded-lg hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Certification Name
            </label>
            <input
              type="text"
              value={editEntry.name}
              onChange={(e) =>
                setEditEntry({ ...editEntry, name: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. AWS Certified Solutions Architect"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Issuer
              </label>
              <input
                type="text"
                value={editEntry.issuer}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, issuer: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Date
              </label>
              <input
                type="text"
                value={editEntry.date}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, date: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
                placeholder="e.g. June 2023"
              />
            </div>
          </div>

          <button
            onClick={handleDone}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group mt-4"
          >
            <Check className="w-5 h-5" />
            DONE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Award className="w-5 h-5 text-pink-500" />
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-pink-500 transition-all w-48"
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
                  setTempTitle(sectionTitles.certifications);
                }}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-white tracking-tight">
              {sectionTitles.certifications}
            </h2>
          )}
        </div>

        {!isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-pink-500 transition-colors bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 hover:border-pink-500/30"
          >
            <Pencil className="w-3 h-3" />
            Edit Heading
          </button>
        )}
      </div>

      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-pink-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">
                  {cert.name || "(No Certification Name)"}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {cert.issuer || "Issuer"} • {cert.date || "Date"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-lime-400 transition-colors"
              >
                {cert.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;
