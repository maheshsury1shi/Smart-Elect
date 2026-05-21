import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.data.role !== 'admin') {
        toast.error('Admin access required');
        setLoading(false);
        return;
      }

      login(response.data.token, {
        _id: response.data.userId,
        email,
        role: response.data.role,
        createdAt: new Date().toISOString(),
      });

      toast.success('Admin login successful');
      navigate('/admin/dashboard');
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
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👨‍💼</div>
          <h1 className="text-4xl font-bold gradient-text">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@voting.com"
              className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-slate-800 rounded-lg text-sm text-slate-400">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>📧 admin@voting.com</p>
          <p>🔑 Admin@123456</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => (window.location.href = '/')}
            className="text-slate-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </main>
  );
}
