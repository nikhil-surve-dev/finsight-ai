import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register(name, email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Premium glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-primary-600 to-primary-400 blur-[80px] lg:blur-[120px] opacity-40 dark:opacity-20 dark:mix-blend-screen animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-purple-600 to-pink-500 blur-[80px] lg:blur-[120px] opacity-40 dark:opacity-20 dark:mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 relative z-10">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl bg-white/50 dark:bg-white/5 dark:border-white/10 dark:text-white py-3 border transition-all duration-300 outline-none backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900/80"
                  placeholder="John Doe"
                />
              </div>
            </div>
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
                  className="focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl bg-white/50 dark:bg-white/5 dark:border-white/10 dark:text-white py-3 border transition-all duration-300 outline-none backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900/80"
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
                  className="focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl bg-white/50 dark:bg-white/5 dark:border-white/10 dark:text-white py-3 border transition-all duration-300 outline-none backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900/80"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-70 shadow-lg shadow-primary-500/30"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Get Started'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
