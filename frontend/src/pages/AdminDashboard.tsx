import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  profileAPI,
  candidateAPI,
  voteAPI,
  resultsAPI,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Profile, Candidate, Vote } from '../types';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [resultsStatus, setResultsStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    symbol: '🎭',
    manifesto: '',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = ['🎭', '🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦄', '⭐', '🌟', '✨', '🔥', '💎', '👑', '🎯', '🚀', '🎨', '🎪'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesRes, candidatesRes, votesRes, statusRes] = await Promise.all([
        profileAPI.getAllProfiles(),
        candidateAPI.getAllCandidates(),
        voteAPI.getAllVotes(),
        resultsAPI.getStatus(),
      ]);

      setProfiles(profilesRes.data);
      setCandidates(candidatesRes.data);
      setVotes(votesRes.data);
      setResultsStatus(statusRes.data.declared);
    } catch (error: any) {
      console.error('Fetch error:', error.response?.data || error.message);
      toast.error('Failed to fetch data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party || !newCandidate.manifesto) {
      toast.error('Please fill all fields (name, party, and manifesto)');
      return;
    }

    if (newCandidate.manifesto.length > 250) {
      toast.error('Manifesto must be 250 characters or less');
      return;
    }

    try {
      console.log('Sending candidate data:', newCandidate);
      await candidateAPI.addCandidate(newCandidate);
      toast.success('Candidate added successfully');
      setNewCandidate({ name: '', party: '', symbol: '🎭', manifesto: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await candidateAPI.deleteCandidate(id);
      toast.success('Candidate deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete candidate');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await profileAPI.deleteProfile(id);
      toast.success('Profile deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete profile');
    }
  };

  const handleDeclareResults = async () => {
    try {
      await resultsAPI.declareResults();
      toast.success('Results declared successfully');
      setResultsStatus(true);
    } catch (error: any) {
      toast.error('Failed to declare results');
    }
  };

  const handleResetElection = async () => {
    if (!window.confirm('This will reset the entire election. Continue?')) return;

    try {
      await resultsAPI.resetElection();
      toast.success('Election reset successfully');
      setResultsStatus(false);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to reset election');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const totalVoters = profiles.length;
  const totalVotes = votes.length;
  const totalCandidates = candidates.length;
  const turnoutPercentage = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-5xl font-bold gradient-text">📊 Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard label="Total Voters" value={totalVoters} icon="👥" />
        <StatCard label="Votes Cast" value={totalVotes} icon="🗳️" />
        <StatCard label="Total Candidates" value={totalCandidates} icon="👨‍🔬" />
        <StatCard label="Turnout %" value={turnoutPercentage} icon="📈" />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 flex-wrap"
      >
        {['stats', 'voters', 'candidates', 'votes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg transition font-semibold ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl border border-purple-500/30"
      >
        {/* Voters Tab */}
        {activeTab === 'voters' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Registered Voters</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left py-3">Name</th>
                    <th className="text-left py-3">Token</th>
                    <th className="text-left py-3">DOB</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile._id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <td className="py-3">{profile.fullName}</td>
                      <td className="py-3 font-mono">{profile.tokenNumber}</td>
                      <td className="py-3">{new Date(profile.dateOfBirth).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          profile.hasVoted
                            ? 'bg-green-500/30 text-green-400'
                            : 'bg-orange-500/30 text-orange-400'
                        }`}>
                          {profile.hasVoted ? '✓ Voted' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteProfile(profile._id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Candidates Management</h2>

            {/* Add Candidate Form */}
            <div className="bg-slate-800 p-6 rounded-lg mb-8">
              <h3 className="font-bold mb-4">Add New Candidate</h3>
              <div className="space-y-4">
                {/* Row 1: Name and Party */}
                <div className="flex gap-4 flex-wrap">
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={(e) =>
                      setNewCandidate({ ...newCandidate, name: e.target.value })
                    }
                    placeholder="Candidate name"
                    className="flex-1 min-w-[200px] px-4 py-2 bg-slate-700 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newCandidate.party}
                    onChange={(e) =>
                      setNewCandidate({ ...newCandidate, party: e.target.value })
                    }
                    placeholder="Party name"
                    className="flex-1 min-w-[200px] px-4 py-2 bg-slate-700 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Row 2: Emoji Selector and Manifesto */}
                <div className="flex gap-4 flex-wrap items-start">
                  {/* Emoji Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-2xl"
                    >
                      {newCandidate.symbol}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full mt-2 bg-slate-900 border border-purple-500/30 rounded-lg p-3 z-50 grid grid-cols-5 gap-2 w-72">
                        {emojiList.map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            onClick={() => {
                              setNewCandidate({ ...newCandidate, symbol: emoji });
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl p-2 hover:bg-purple-500/20 rounded transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manifesto Input */}
                  <textarea
                    value={newCandidate.manifesto}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setNewCandidate({ ...newCandidate, manifesto: e.target.value });
                      }
                    }}
                    placeholder="Manifesto/Vision (max 250 characters)"
                    className="flex-1 min-w-[300px] px-4 py-2 bg-slate-700 rounded-lg focus:outline-none resize-none h-20"
                  />
                </div>

                {/* Character Count */}
                <div className="text-xs text-slate-400">
                  {newCandidate.manifesto.length}/250 characters
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="w-full px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  Add Candidate
                </button>
              </div>
            </div>

            {/* Candidates List */}
            <div className="grid md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <motion.div
                  key={candidate._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 p-4 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{candidate.symbol || '🎭'}</span>
                        <div>
                          <p className="font-bold">{candidate.name}</p>
                          <p className="text-sm text-slate-400">{candidate.party}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {candidate.manifesto || 'No manifesto'}
                      </p>
                      <p className="text-lg font-bold mt-3">
                        Votes: <span className="text-purple-400">{candidate.voteCount}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCandidate(candidate._id)}
                      className="text-red-400 hover:text-red-300 ml-2 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Vote History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left py-3">Voter</th>
                    <th className="text-left py-3">Candidate</th>
                    <th className="text-left py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.length > 0 ? (
                    votes.map((vote) => {
                      const voter = vote.voterId;
                      const candidate = vote.candidateId;

                      const voterName = voter && typeof voter === 'object'
                        ? voter.fullName || voter.tokenNumber || 'Unknown Voter'
                        : 'Unknown Voter';

                      const candidateName = candidate && typeof candidate === 'object'
                        ? candidate.name || candidate.party || 'Unknown Candidate'
                        : 'Unknown Candidate';

                      return (
                        <tr key={vote._id} className="border-b border-slate-700">
                          <td className="py-3">{voterName}</td>
                          <td className="py-3">{candidateName}</td>
                          <td className="py-3">
                            {vote.createdAt ? new Date(vote.createdAt).toLocaleString() : 'Unknown time'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No votes recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Election Controls</h2>

            <div className="space-y-4">
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="font-bold mb-2">Current Status: {resultsStatus ? '✓ Results Declared' : '⏳ Voting Active'}</p>
                <div className="flex gap-4">
                  {!resultsStatus && (
                    <button
                      onClick={handleDeclareResults}
                      className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                    >
                      Declare Results
                    </button>
                  )}
                  {resultsStatus && (
                    <button
                      onClick={handleResetElection}
                      className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition"
                    >
                      Start New Election
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4">Quick Stats</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Total Registered Voters</p>
                    <p className="text-3xl font-bold">{totalVoters}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Votes Recorded</p>
                    <p className="text-3xl font-bold">{totalVotes}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Candidates</p>
                    <p className="text-3xl font-bold">{totalCandidates}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Voter Turnout</p>
                    <p className="text-3xl font-bold">{turnoutPercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass p-6 rounded-2xl border border-purple-500/30"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
