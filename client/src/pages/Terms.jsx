import React from 'react';
import { Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
      </div>
      <div className="glass-card p-8 border dark:border-gray-700 prose prose-primary dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
        <p className="text-gray-600 dark:text-gray-300">By accessing and using FinSight AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">2. Disclaimer</h2>
        <p className="text-gray-600 dark:text-gray-300">The AI insights provided are for informational and educational purposes only. They do not constitute professional financial advice. Always consult a certified financial planner for major financial decisions.</p>

        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">3. User Conduct</h2>
        <p className="text-gray-600 dark:text-gray-300">You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.</p>
      </div>
    </div>
  );
};

export default Terms;
