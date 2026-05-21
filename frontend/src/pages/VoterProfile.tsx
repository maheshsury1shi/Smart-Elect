import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from 'sonner';

interface VoterData {
  _id: string;
  fullName: string;
  aadhaarHash: string;
  dateOfBirth: string;
  gender: string;
  tokenNumber: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hasVoted: boolean;
  faceData: {
    image: string;
  };
  createdAt: string;
}

export default function VoterProfile() {
  const [voterData, setVoterData] = useState<VoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/voter/login');
      return;
    }

    const fetchVoterProfile = async () => {
      try {
        const response = await authAPI.getVoterProfile();
        setVoterData(response.data);
      } catch (error) {
        toast.error('Failed to load profile');
        navigate('/voter/login');
      } finally {
        setLoading(false);
      }
    };

    fetchVoterProfile();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full" />
        </div>
      </main>
    );
  }

  if (!voterData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-red-400">Failed to load profile</p>
        </div>
      </main>
    );
  }

  const registrationDate = new Date(voterData.createdAt).toLocaleDateString();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">Smart Elect</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl border border-purple-500/30 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Face Photo */}
            <div className="flex-shrink-0">
              <div className="w-48 h-56 rounded-2xl overflow-hidden border-4 border-purple-500">
                {voterData.faceData?.image ? (
                  <img
                    src={voterData.faceData.image}
                    alt="Voter face"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <p className="text-slate-400">No face image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-4">{voterData.fullName}</h2>
              
              {/* Voting Status */}
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                voterData.hasVoted
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                  : 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
              }`}>
                <span className="text-2xl">{voterData.hasVoted ? '✓' : '⏳'}</span>
                <span className="font-semibold">
                  {voterData.hasVoted ? 'You have already voted' : 'You have not voted yet'}
                </span>
              </div>

              {/* Token Number - Prominent */}
              <div className="mb-6">
                <p className="text-slate-400 text-sm mb-2">VOTER TOKEN NUMBER</p>
                <div className="bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 p-4 rounded-xl border-2 border-white/20">
                  <p className="text-4xl font-black tracking-wider text-white">
                    {voterData.tokenNumber}
                  </p>
                </div>
              </div>

              {/* Copy Token Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(voterData.tokenNumber);
                  toast.success('Token copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-semibold"
              >
                📋 Copy Token
              </button>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl border border-purple-500/30 mb-6"
        >
          <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <p className="text-slate-400 text-sm mb-1">Full Name</p>
              <p className="text-slate-100 font-semibold text-lg">{voterData.fullName}</p>
            </div>

            {/* Gender */}
            <div>
              <p className="text-slate-400 text-sm mb-1">Gender</p>
              <p className="text-slate-100 font-semibold text-lg">{voterData.gender}</p>
            </div>

            {/* Date of Birth */}
            <div>
              <p className="text-slate-400 text-sm mb-1">Date of Birth</p>
              <p className="text-slate-100 font-semibold text-lg">
                {new Date(voterData.dateOfBirth).toLocaleDateString()}
              </p>
            </div>

            {/* Registration Date */}
            <div>
              <p className="text-slate-400 text-sm mb-1">Registration Date</p>
              <p className="text-slate-100 font-semibold text-lg">{registrationDate}</p>
            </div>

            {/* Phone */}
            {voterData.phone && (
              <div>
                <p className="text-slate-400 text-sm mb-1">Phone</p>
                <p className="text-slate-100 font-semibold text-lg">{voterData.phone}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Address Information */}
        {(voterData.address?.street ||
          voterData.address?.city ||
          voterData.address?.state ||
          voterData.address?.zipCode) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-2xl border border-purple-500/30 mb-6"
          >
            <h3 className="text-2xl font-bold mb-6">📍 Address Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {voterData.address?.street && (
                <div className="md:col-span-2">
                  <p className="text-slate-400 text-sm mb-1">Street Address</p>
                  <p className="text-slate-100 font-semibold">{voterData.address.street}</p>
                </div>
              )}
              {voterData.address?.city && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">City</p>
                  <p className="text-slate-100 font-semibold">{voterData.address.city}</p>
                </div>
              )}
              {voterData.address?.state && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">State</p>
                  <p className="text-slate-100 font-semibold">{voterData.address.state}</p>
                </div>
              )}
              {voterData.address?.zipCode && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">Zip Code</p>
                  <p className="text-slate-100 font-semibold">{voterData.address.zipCode}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-2xl border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold mb-6">Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <a href="/vote">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:shadow-lg transition">
                🗳️ Cast Your Vote
              </button>
            </a>
            <a href="/">
              <button className="px-6 py-3 border-2 border-blue-500 rounded-lg font-bold hover:bg-blue-500/20 transition">
                🏠 Home
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
