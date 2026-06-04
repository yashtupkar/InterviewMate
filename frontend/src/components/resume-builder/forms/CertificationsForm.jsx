import React, { useState, useEffect } from "react";
import { useResume } from "../../../context/ResumeContext";
import MonthYearPicker from "../../common/MonthYearPicker";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  Award,
} from "lucide-react";

const CertificationsForm = () => {
  const { resumeData, updateCertifications } = useResume();
  const { certifications } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);

  useEffect(() => {
    if (certifications.length === 0 && editingIndex === null) {
      handleAdd();
    }
  }, [certifications.length]);

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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. AWS Certified Solutions Architect"
            />
          </div>

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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Amazon Web Services"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Date
            </label>
            <MonthYearPicker
              value={editEntry.date}
              onChange={(val) => setEditEntry({ ...editEntry, date: val })}
              maxYear={new Date().getFullYear()}
            />
          </div>

          <button
            onClick={handleDone}
            className="w-full py-2.5 bg-gradient-to-r from-lime-600 to-lime-400 text-zinc-950 font-bold rounded-xl shadow-lg hover:shadow-lime-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group mt-4"
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
      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                  {cert.name || "(No Certification Name)"}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {cert.issuer || "Issuer"} • {cert.date || "Date"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 transition-opacity">
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
        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;
