import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Premium glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-primary-600 to-primary-400 blur-[80px] lg:blur-[120px] opacity-40 dark:opacity-20 dark:mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-purple-600 to-pink-500 blur-[80px] lg:blur-[120px] opacity-40 dark:opacity-20 dark:mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 relative z-10 shadow-2xl shadow-purple-500/40 border border-white/10 hover:scale-[1.02] hover:shadow-purple-500/30 transition duration-300">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-purple-400 drop-shadow-lg" />
          <h2 className="mt-6 text-3xl font-extrabold text-white drop-shadow-lg">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl bg-white/10 dark:bg-white/5 dark:border-white/10 dark:text-white py-3 border transition-all duration-300 outline-none backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900/80"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl bg-white/10 dark:bg-white/5 dark:border-white/10 dark:text-white py-3 border transition-all duration-300 outline-none backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900/80"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition shadow-lg shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
