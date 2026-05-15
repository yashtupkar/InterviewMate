import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { 
  FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, 
  FiUpload, FiChevronLeft, FiChevronRight, FiCheck, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const QuestionManagement = () => {
  const { getToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    skills: [],
    companies: [],
    domains: ['technical'],
    type: 'theoretical',
    category: '',
    answerMarkdown: ''
  });

  // Bulk upload state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [search, selectedDifficulty, currentPage]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      });

      const res = await axios.get(`${backendURL}/api/admin/questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setQuestions(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || Math.ceil((res.data.pagination?.total || 0) / 10) || 1);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const url = isEditing 
        ? `${backendURL}/api/admin/questions/${currentQuestion._id}`
        : `${backendURL}/api/admin/questions`;
      
      const method = isEditing ? 'patch' : 'post';
      
      const res = await axios[method](url, currentQuestion, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(isEditing ? 'Question updated' : 'Question created');
        setIsModalOpen(false);
        fetchQuestions();
      }
    } catch (err) {
      console.error('Operation failed:', err);
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const token = await getToken();
      const res = await axios.delete(`${backendURL}/api/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success('Question deleted');
        fetchQuestions();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete question');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const token = await getToken();
      const res = await axios.post(`${backendURL}/api/questions/admin/bulk-upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (res.data.success) {
        toast.success(`Successfully uploaded ${res.data.count} questions`);
        setIsBulkModalOpen(false);
        setBulkFile(null);
        fetchQuestions();
      }
    } catch (err) {
      console.error('Bulk upload failed:', err);
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    }
  };

  const openModal = (question = null) => {
    if (question) {
      setCurrentQuestion({
        ...question,
        skills: question.skills || [],
        companies: question.companies || [],
        domains: question.domains || ['technical'],
      });
      setIsEditing(true);
    } else {
      setCurrentQuestion({
        title: '',
        description: '',
        difficulty: 'medium',
        skills: [],
        companies: [],
        domains: ['technical'],
        type: 'theoretical',
        category: '',
        answerMarkdown: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Question Management</h1>
          <p className="text-zinc-400 mt-1">Manage the interview question bank</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-white/5"
          >
            <FiUpload size={16} />
            Bulk Upload
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#bef264] text-black rounded-lg hover:bg-[#bef264]/90 transition-colors font-bold"
          >
            <FiPlus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:border-[#bef264]/50 outline-none transition-colors"
            />
          </div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white outline-none focus:border-[#bef264]/50"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={() => { setSearch(''); setSelectedDifficulty(''); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <FiFilter size={16} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/80">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">TITLE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">DIFFICULTY</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">TYPE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">SKILLS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/5"></td>
                  </tr>
                ))
              ) : questions.length > 0 ? (
                questions.map((q) => (
                  <tr key={q._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white max-w-xs truncate">{q.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 capitalize">{q.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {q.skills?.slice(0, 2).map(skill => (
                          <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                            {skill}
                          </span>
                        ))}
                        {q.skills?.length > 2 && <span className="text-[10px] text-zinc-500">+{q.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openModal(q)} className="text-zinc-400 hover:text-[#bef264] transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(q._id)} className="text-zinc-400 hover:text-red-400 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No questions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Title</label>
                <input
                  required
                  value={currentQuestion.title}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, title: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Difficulty</label>
                  <select
                    value={currentQuestion.difficulty}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, difficulty: e.target.value})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Type</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
                  >
                    <option value="theoretical">Theoretical</option>
                    <option value="coding">Coding</option>
                    <option value="behavioral">Behavioral</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Question Description</label>
                <textarea
                  required
                  rows={4}
                  value={currentQuestion.description}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, description: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Answer / Solution (Markdown)</label>
                <textarea
                  rows={4}
                  value={currentQuestion.answerMarkdown}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, answerMarkdown: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Skills (comma separated)</label>
                  <input
                    value={currentQuestion.skills.join(', ')}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none"
                    placeholder="React, JavaScript, CSS"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Companies (comma separated)</label>
                  <input
                    value={currentQuestion.companies.join(', ')}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none"
                    placeholder="Google, Amazon, Meta"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Category (for behavioral)</label>
                  <input
                    value={currentQuestion.category}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none"
                    placeholder="Teamwork, Experience"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Domains (comma separated)</label>
                  <input
                    value={currentQuestion.domains.join(', ')}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, domains: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#bef264]/50 outline-none"
                    placeholder="frontend, backend"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#bef264] text-black rounded-lg hover:bg-[#bef264]/90 transition-colors font-bold"
                >
                  {isEditing ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Bulk Upload Questions</h2>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-zinc-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleBulkUpload} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center space-y-4">
                <FiUpload size={32} className="mx-auto text-zinc-500" />
                <div>
                  <p className="text-white font-medium">Select JSON file</p>
                  <p className="text-xs text-zinc-500 mt-1">File must be a valid JSON array of questions</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="hidden"
                  id="bulk-file"
                />
                <label
                  htmlFor="bulk-file"
                  className="inline-block px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer transition-colors text-sm border border-white/10"
                >
                  {bulkFile ? bulkFile.name : 'Choose File'}
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bulkFile}
                  className="flex-1 px-4 py-2 bg-[#bef264] text-black rounded-lg hover:bg-[#bef264]/90 disabled:opacity-50 transition-colors font-bold"
                >
                  Upload Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
