import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDatabase, FiUploadCloud, FiCode, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const SeedQuestions = () => {
  const { getToken } = useAuth();
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    if (!jsonData.trim()) {
      toast.error("Please paste JSON data first");
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);

    try {
      // Validate JSON locally
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        throw new Error("Invalid JSON format. Please check for syntax errors.");
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("JSON must be an array of question objects.");
      }

      const token = await getToken();
      const res = await axios.post(`${backendURL}/api/questions/admin/bulk-upload`, parsedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success) {
        toast.success("Database synced successfully!");
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Sync failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to sync database";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[#bef264]">
            <FiDatabase size={24} />
            <h1 className="text-3xl font-black tracking-tight">Admin Seeding Console</h1>
          </div>
          <p className="text-zinc-500 max-w-xl">
             Bulk update or insert interview questions by pasting a JSON array. Existing questions with the same title will be updated (upserted).
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-xl hover:scale-105 active:scale-95 ${
            loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-[#bef264] text-black hover:bg-[#a3d94d]'
          }`}
        >
          {loading ? (
            <>
               <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
               Syncing...
            </>
          ) : (
            <>
               <FiUploadCloud /> Sync to Database
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-800/50 px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <FiCode /> JSON Input
              </div>
              <div>[{jsonData.length} chars]</div>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder='[ { "title": "...", "description": "...", "skills": [...], ... } ]'
              className="w-full h-[500px] bg-transparent p-6 font-mono text-sm text-[#bef264]/80 outline-none scrollbar-thin scrollbar-thumb-white/10"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Info & Status Area */}
        <div className="space-y-6">
          
          {/* Format Help */}
          <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#bef264] mb-4">JSON Requirements</h3>
            <ul className="space-y-3 text-xs text-zinc-400 font-medium">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
                Must be an Array of objects.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
                Required fields: `title`, `description`, `type` (coding/theoretical), `difficulty`, `skills`, `companies`, `domains`.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#bef264]"></div>
                Upsert key: `title` (Exact match updates existing record).
              </li>
            </ul>
          </div>

          {/* Sync Status */}
          {(stats || error) && (
            <div className={`p-6 rounded-2xl border ${
              error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {error ? (
                  <FiAlertCircle className="text-red-400" size={20} />
                ) : (
                  <FiCheckCircle className="text-green-400" size={20} />
                )}
                <h3 className={`text-sm font-bold uppercase tracking-widest ${
                  error ? 'text-red-400' : 'text-green-400'
                }`}>
                  {error ? 'Sync Error' : 'Sync Success'}
                </h3>
              </div>
              
              {stats ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/40 p-3 rounded-xl">
                    <div className="text-lg font-black text-white">{stats.upsertedCount}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">New</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl">
                    <div className="text-lg font-black text-white">{stats.modifiedCount}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Updates</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl">
                    <div className="text-lg font-black text-white">{stats.matchedCount}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Total</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-400/80 leading-relaxed font-medium">{error}</p>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl text-[10px] text-zinc-500 font-medium leading-relaxed">
             <span className="text-[#bef264] font-bold">Pro Tip:</span> Use the `isActive: true` field in your JSON objects to ensure questions appear immediately on the dashboard. Use a local JSON validator like JSONLint to catch syntax errors before syncing.
          </div>

        </div>
      </div>

    </div>
  );
};

export default SeedQuestions;
