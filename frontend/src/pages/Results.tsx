import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { resultsAPI, candidateAPI } from '../utils/api';
import { Candidate } from '../types';

export default function Results() {
  const [resultsStatus, setResultsStatus] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const statusRes = await resultsAPI.getStatus();
      setResultsStatus(statusRes.data.declared);

      if (statusRes.data.declared) {
        const resultsRes = await resultsAPI.getResults();
        setCandidates(resultsRes.data.candidates);
        setWinner(resultsRes.data.winner);
      } else {
        const candRes = await candidateAPI.getAllCandidates();
        setCandidates(candRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </main>
    );
  }

  if (!resultsStatus) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass p-12 rounded-2xl border border-purple-500/30"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold mb-4">Results Not Available Yet</h1>
          <p className="text-xl text-slate-300">
            Results will be declared after voting closes
          </p>
        </motion.div>
      </main>
    );
  }

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center gradient-text">
          📊 Election Results
        </h1>

        {/* Winner  Card */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl border-2 border-yellow-500 mb-12 text-center"
          >
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2">WINNER</h2>
            <p className="text-2xl font-bold gradient-text mb-2">{winner.name}</p>
            <p className="text-lg mb-4">{winner.party}</p>
            <div className="text-4xl font-bold text-yellow-500">
              {winner.voteCount} votes
            </div>
          </motion.div>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Candidates List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-2xl border border-purple-500/30"
          >
            <h3 className="text-2xl font-bold mb-6">Vote Distribution</h3>

            {candidates.map((candidate, index) => {
              const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
              return (
                <motion.div
                  key={candidate._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-6"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-bold">{candidate.name}</p>
                      <p className="text-sm text-slate-400">{candidate.party}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{candidate.voteCount}</p>
                      <p className="text-sm text-slate-400">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="bg-gradient-to-r from-orange-500 to-purple-600 h-full"
                    />
                  </div>
                </motion.div>
              );
            })}

            <div className="border-t border-purple-500/30 mt-6 pt-6">
              <p className="text-slate-400">Total Votes Cast</p>
              <p className="text-3xl font-bold">{totalVotes}</p>
            </div>
          </motion.div>

          {/* Ranking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-2xl border border-purple-500/30"
          >
            <h3 className="text-2xl font-bold mb-6">Rankings</h3>

            {candidates
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((candidate, index) => (
                <motion.div
                  key={candidate._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 mb-4 p-4 bg-slate-800 rounded-lg"
                >
                  <div className="text-3xl font-bold text-yellow-500 w-12 text-center">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{candidate.name}</p>
                    <p className="text-sm text-slate-400">{candidate.party}</p>
                  </div>
                  <div className="text-2xl font-bold">{candidate.voteCount}</div>
                </motion.div>
              ))}
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => (window.location.href = '/')}
            className="px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
