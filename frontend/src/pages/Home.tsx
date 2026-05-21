import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: '🎭',
      title: 'Face Recognition Security',
      description: 'Advanced facial recognition for voter verification',
    },
    {
      icon: '🔐',
      title: 'Aadhaar Verification',
      description: 'Secure identity verification using Aadhaar number',
    },
    {
      icon: '📊',
      title: 'Real-time Results',
      description: 'Live election results with detailed analytics',
    },
    {
      icon: '👨‍💼',
      title: 'Admin Dashboard',
      description: 'Complete election management and monitoring',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 backdrop-blur-md">
        <div className="text-3xl font-bold gradient-text">Smart Elect</div>
        <div className="flex gap-4">
          <Link to="/voter/login">
            <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">
              Voter Login
            </button>
          </Link>
          <Link to="/admin/login">
            <button className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
              Admin Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Democracy in Your Hands
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Secure, transparent, and technologically advanced voting system with
            facial recognition
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg font-bold text-lg hover:shadow-lg transition"
              >
                Register to Vote
              </motion.button>
            </Link>
            <Link to="/vote">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-purple-500 rounded-lg font-bold text-lg hover:bg-purple-500/20 transition"
              >
                Cast Your Vote
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ translateY: -5 }}
              className="glass p-8 rounded-2xl border border-purple-500/30"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-20 py-8 text-center text-slate-400">
        <p>© 2026 Smart Voting System.</p>
      </footer>
    </main>
  );
}
