import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VoterLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !dateOfBirth) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.voterLogin({
        email: email.toLowerCase(),
        password,
        dateOfBirth,
      });

      login(response.data.token, {
        _id: response.data.userId,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Login successful!');
      navigate('/voter/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl w-full max-w-md border border-purple-500/30"
      >
        <h1 className="text-3xl font-bold mb-8 text-center gradient-text">
          Voter Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block mb-2 font-semibold text-slate-100">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-semibold text-slate-100">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block mb-2 font-semibold text-slate-100">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 transition"
            />
            <p className="text-xs text-slate-400 mt-1">
              Same date you used during registration
            </p>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-200">
          <p className="font-semibold mb-2">🔐 Login with your registered credentials:</p>
          <ul className="space-y-1 text-xs">
            <li>• Email used during registration</li>
            <li>• Your password</li>
            <li>• Your date of birth</li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-purple-400 hover:text-purple-300 transition text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </main>
  );
}
