import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import FileUpload from '../components/ats/FileUpload';
import ScoreResult from '../components/ats/ScoreResult';
import AtsLoader from '../components/ats/AtsLoader';
import { Briefcase } from 'lucide-react';
import { FiArrowRight, FiShield, FiShare2 } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { BsFillCloudUploadFill } from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const AtsScorer = () => {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload your resume');
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error('Please provide a valid job description');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post(`${backendURL}/api/ats/score`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast.success('Analysis complete!');
      } else {
        toast.error('Failed to analyze resume');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>ATS Resume Scorer | PlaceMateAI</title>
      </Helmet>
      <div className="min-h-screen text-zinc-100 transition-colors selection:bg-[#bef264]/30 pb-20 p-4 md:p-4  ">
        
        {/* Container */}
        <div className={`flex flex-col lg:flex-row items-start justify-center gap-12 mx-auto relative transition-all duration-700 ${result ? 'max-w-7xl' : 'max-w-6xl'}`}>
          
          {/* Content conditional rendering */}
          {loading ? (
             <div className="w-full max-w-2xl mx-auto animate-in zoom-in-95 fade-in duration-500 mt-12">
               <AtsLoader />
             </div>
          ) : !result ? (
            <>
              {/* Left Side: Info */}
              <div className="w-full lg:w-1/2 flex flex-col lg:sticky lg:top-16 h-fit space-y-6 animate-in slide-in-from-left-8 fade-in duration-700">
                <div className="space-y-4">
                  <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                    ATS Resume Scanner
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      Is your <span className="text-[#bef264] italic">resume</span> good enough?
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-md mt-4">
                    Upload your resume and paste the job description. Our advanced AI will analyze your match, identify missing keywords, and provide actionable feedback tailored to the specific role.
                  </p>
                  </div>
                  
                  <div className='w-fit'>
                    <img src="/assets/resume-ats-check.png" alt="" className='w-full h-auto object-contain rounded-xl' />
                  </div>

                {/* <div className="bg-[#1a1a1a] p-7 shadow-xl rounded-[2rem] border border-white/5 border-gray-100 ring-1 ring-black/5 mt-8">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center uppercase tracking-widest">
                    <FiShield className="mr-3 text-[#bef264] text-xl" /> Comprehensive Report
                  </h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
                    Get deep insights into your Grammar & Spelling, File parseability, ATS Formatting rules, and Tailored matching for both hard and soft skills.
                  </p>
                </div> */}
              </div>

              {/* Right Side: Setup Form */}
              <div className="w-full lg:w-[450px] flex flex-col gap-8 animate-in slide-in-from-right-8 fade-in duration-700 pt-10">
                  <>
                    <div className="pb-2">
                      <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tight">
                        Scan details
                      </h2>
                      <p className="text-zinc-500 text-sm font-medium">
                        Provide your resume and target role details
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* File Upload */}
                      <div className="space-y-4">
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                          Upload Resume (PDF)
                        </label>
                        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[#bef264]/50 focus-within:border-[#bef264] transition-all shadow-sm">
                           <FileUpload file={file} setFile={setFile} />
                        </div>
                      </div>

                      <hr className="border-white/5" />

                      {/* Job Description */}
                      <div className="space-y-4">
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                          Job Description
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          rows="8"
                          placeholder="Paste the target job description here..."
                          className="w-full p-5 bg-black border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-[#bef264] transition-all outline-none resize-none text-[13px] font-medium placeholder-zinc-700 shadow-sm"
                        ></textarea>
                      </div>

                      <hr className="border-white/5" />

                      {/* Credit Cost Info */}
                      <div className="flex items-center justify-between px-2">
                        <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Scanning Cost</span>
                        <div className="flex items-center gap-1.5 bg-[#bef264]/10 px-3 py-1 rounded-full border border-[#bef264]/20">
                          <IoSparkles className="text-[#bef264] text-xs" />
                          <span className="text-[#bef264] text-[10px] font-black uppercase tracking-wider">5 Credits</span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          onClick={handleAnalyze}
                          disabled={!file || !jobDescription}
                          className="w-full px-10 bg-[#bef264] hover:bg-[#bef264]/90 text-black cursor-pointer font-black py-4 rounded-2xl transition-all inline-flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#bef264]/20 active:scale-95 group"
                        >
                          Start Scan
                          <FiArrowRight
                            size={20}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  </>
              </div>
            </>
          ) : (
             <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
               {/* ScoreResult full width container */}
               <div className="w-full  mt-2">
                 
                 {/* Top Header */}
                 <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                   <div className="flex flex-col mb-4 md:mb-0">
                     <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                       Resume <span className="text-[#bef264]">Analysis</span>
                     </h1>
                   </div>
                   <div className="flex items-center gap-4">
                
                     <button
                       onClick={() => {
                         setResult(null);
                         setFile(null);
                         setJobDescription('');
                       }}
                       className="flex items-center gap-2 px-6 py-2.5 bg-[#bef264] hover:bg-[#bef264]/90 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#bef264]/20 active:scale-95 group"
                     >
                       New Upload
                       <BsFillCloudUploadFill className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   </div>
                 </div>

                 <ScoreResult result={result} file={file} />
               </div>
             </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AtsScorer;
