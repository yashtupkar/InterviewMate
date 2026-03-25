import React, { useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const FileUpload = ({ file, setFile }) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
       setFile(droppedFile);
    } else {
       alert("Please upload a PDF file.");
    }
  }, [setFile]);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
       setFile(selectedFile);
    } else {
       alert("Please upload a PDF file.");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl border-2 border-dashed p-4 flex items-center gap-4 transition-all duration-300 ${
        file 
          ? 'border-[#bef264] bg-[#bef264]/5' 
          : 'border-zinc-800 bg-black hover:border-zinc-700'
      }`}
    >
      <input
        type="file"
        title=""
        accept=".pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none"
      />
      
      {file ? (
        <>
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#bef264]/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#bef264]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold text-white truncate">{file.name}</h3>
            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
            </p>
          </div>
          <button 
           onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
           className="relative z-10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all cursor-pointer"
          >
             Remove
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <UploadCloud className="w-5 h-5 text-[#bef264]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-bold text-white">Select PDF Document</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
              Drag & Drop or Click (Max 5MB)
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;
