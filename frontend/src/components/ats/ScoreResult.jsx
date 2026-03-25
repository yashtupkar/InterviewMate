import React, { useState } from 'react';
import { Check, X, AlertTriangle, ChevronDown, ChevronUp, Lock, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

const categoryLabels = {
  Content: "CONTENT",
  Sections: "SECTIONS",
  ATSEssentials: "ATS ESSENTIALS",
  Tailoring: "TAILORING"
};

const ScoreResult = ({ result, file }) => {
  if (!result || !result.categories) return null;

  const [activeCategory, setActiveCategory] = useState('Content');
  const [viewMode, setViewMode] = useState('feedback'); // 'feedback' or 'resume'
  const [fileUrl, setFileUrl] = React.useState(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);
  
  const { score, categories } = result;

  const getScoreColor = (value) => {
    if (value >= 80) return 'text-[#bef264]';
    if (value >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreHex = (value) => {
    if (value >= 80) return '#bef264';
    if (value >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <Check className="w-4 h-4 text-[#bef264]" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <X className="w-4 h-4 text-rose-500" />;
  };

  const getStatusBg = (status) => {
    if (status === 'success') return 'bg-[#bef264]/10 border-[#bef264]/20';
    if (status === 'warning') return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const totalActionableIssues = Object.values(categories).reduce((acc, cat) => {
     return acc + (cat.issues ? cat.issues.filter(i => i.status !== 'success').length : 0);
  }, 0);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 items-start">
      
      {/* Left Sidebar Pane */}
      <div className="w-full md:w-[280px] flex-shrink-0 bg-gradient-to-b from-[#18181b] to-[#121214] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#bef264]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        {/* Overall Score with Circular Gauge */}
        <div className="text-center pb-8 border-b border-white/5 mb-6 flex flex-col items-center relative z-10">
          <div className="relative flex flex-col items-center justify-center w-40 h-24 mt-2 mb-2">
            <div className="absolute inset-0 bg-[#bef264]/10 rounded-full blur-3xl opacity-50"></div>
            <svg className="w-full h-full drop-shadow-2xl z-10" viewBox="0 0 140 70">
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="#27272a"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke={getScoreHex(score)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={188.5}
                strokeDashoffset={188.5 - ((score || 0) / 100) * 188.5}
                className="transition-all duration-1500 ease-out"
              />
            </svg>
            <div className="absolute bottom-[-10px] flex flex-col items-center z-20">
              <div className="flex items-baseline">
                <span className={`text-4xl font-black tracking-tighter ${getScoreColor(score)} drop-shadow-md`}>{score}</span>
                <span className="text-zinc-500 text-xl font-bold ml-1">/100</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mt-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-zinc-300 font-semibold text-xs uppercase tracking-wider">
              {totalActionableIssues} Actionable Issues
            </span>
          </div>
        </div>

        {/* Categories Accordion */}
        <div className="space-y-3 relative z-10">
          {Object.keys(categories).map((key) => {
             const cat = categories[key];
             if(!cat) return null;
             const isActive = activeCategory === key;
             const isLocked = key === 'Tailoring' && false; // Future pro-feature lock simulation

             return (
               <div key={key} className={`flex flex-col rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/5 border border-white/10 shadow-lg' : 'border border-transparent hover:bg-white/5'}`}>
                 <button 
                  onClick={() => !isLocked && setActiveCategory(key)}
                  className={`flex items-center justify-between p-4 w-full transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                 >
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'bg-[#bef264]/10 border-[#bef264]/20 text-[#bef264]' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-zinc-600"></div>}
                     </div>
                     <span className={`text-[13px] font-bold tracking-widest uppercase ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                       {categoryLabels[key]}
                     </span>
                   </div>
                   <div className="flex items-center gap-3">
                     {isLocked ? (
                        <Lock className="w-4 h-4 text-zinc-500" />
                     ) : (
                        <span className={`text-lg font-black ${getScoreColor(cat.score)} ${isActive ? 'scale-110' : ''} transition-transform`}>
                          {cat.score}%
                        </span>
                     )}
                   </div>
                 </button>
                 
               </div>
             );
          })}
        </div>
        
        {/* Call to Action Inside Sidebar */}
        <button className="w-full mt-6 py-3 bg-gradient-to-r from-[#bef264] to-[#d9f99d] hover:from-[#d9f99d] hover:to-[#bef264] text-black font-black uppercase tracking-wider text-sm rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)] active:scale-[0.98] flex items-center justify-center gap-2">
           <span>Unlock Full Report</span>
           <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Details Pane */}
      <div className="flex-1 w-full bg-[#121214] border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl relative min-h-[500px] flex flex-col backdrop-blur-3xl">
         {/* Top Tab Toggle */}
         <div className="flex gap-2 mb-6 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
            <button 
              onClick={() => setViewMode('feedback')}
              className={`py-2.5 px-6 rounded-xl transition-all duration-300 text-sm font-bold tracking-wide flex items-center gap-2 ${viewMode === 'feedback' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Detailed Feedback
            </button>
            <button 
              onClick={() => setViewMode('resume')}
              className={`py-2.5 px-6 rounded-xl transition-all duration-300 text-sm font-bold tracking-wide flex items-center gap-2 ${viewMode === 'resume' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <FileText className="w-4 h-4" />
              Original Resume
            </button>
         </div>

         {viewMode === 'feedback' ? (
           <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
             {/* Detailed Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
               <div>
                 <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bef264]/20 to-[#bef264]/5 flex items-center justify-center border border-[#bef264]/30 shadow-[0_0_15px_rgba(190,242,100,0.15)]">
                     <Check className="w-6 h-6 text-[#bef264]" />
                   </div>
                   {categoryLabels[activeCategory]}
                 </h2>
                 <p className="text-zinc-400 mt-2 font-medium">Detailed breakdown of your resume's {categoryLabels[activeCategory].toLowerCase()} performance.</p>
               </div>
               
               <div className="flex flex-col items-end">
                 <div className="text-4xl font-black font-mono tracking-tighter" style={{ color: getScoreHex(categories[activeCategory]?.score) }}>
                    {categories[activeCategory]?.score}%
                 </div>
                 <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Category Score</div>
               </div>
             </div>

             {/* Detailed Issues List */}
             <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
               {categories[activeCategory]?.issues?.map((issue, idx) => (
                 <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:bg-white/5 hover:border-white/10 group relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-1 h-full ${issue.status === 'success' ? 'bg-[#bef264]' : issue.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                   <div className="flex items-start justify-between mb-3 pl-3">
                     <div className="flex flex-col gap-1">
                        <span className={`text-[10px] uppercase font-black tracking-widest ${issue.status === 'success' ? 'text-[#bef264]' : issue.status === 'warning' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {issue.status === 'success' ? 'Passed Validation' : 'Needs Improvement'}
                        </span>
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                          {issue.title}
                        </h3>
                     </div>
                     <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusBg(issue.status)} border`}>
                       {getStatusIcon(issue.status)}
                     </div>
                   </div>
                   <div className="pl-3 mt-4 text-zinc-400 text-[15px] leading-relaxed font-medium">
                     <p>{issue.description}</p>
                   </div>
                 </div>
               ))}
               
               {(!categories[activeCategory]?.issues || categories[activeCategory].issues.length === 0) && (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Issues Found</h3>
                    <p className="text-zinc-500 max-w-sm">We couldn't find any actionable feedback for this category. Great job!</p>
                 </div>
               )}
             </div>
           </div>
         ) : (
           <div className="w-full flex-1 rounded-3xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center min-h-[500px] animate-in fade-in zoom-in-95 duration-500 shadow-inner">
              {fileUrl ? (
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-[60%] h-full min-h-[500px] border-0 bg-white" title="Original Resume" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <FileText className="w-12 h-12 opacity-20" />
                  <span className="text-sm font-medium tracking-wide">No resume file attached.</span>
                </div>
              )}
           </div>
         )}
      </div>

    </div>
  );
};

export default ScoreResult;
