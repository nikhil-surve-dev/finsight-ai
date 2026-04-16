import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      </div>
      <div className="glass-card p-8 border dark:border-gray-700 prose prose-primary dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">1. Information We Collect</h2>
        <p className="text-gray-600 dark:text-gray-300">We collect your name, email address, and financial transaction data that you manually input or upload via images for the primary purpose of providing the FinSight AI service.</p>
        
        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">2. AI Processing</h2>
        <p className="text-gray-600 dark:text-gray-300">By using our Smart Upload and AI Insight features, you consent to your data being sent to third-party AI providers (OpenRouter, Google, Meta) strictly for processing and returning structured data. Your data is not stored or trained on by these providers beyond the immediate transaction.</p>

        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">3. Security</h2>
        <p className="text-gray-600 dark:text-gray-300">We implement industry-standard security measures including bcrypt hashing for passwords and JWT for session management. However, no method of transmission over the internet is 100% secure.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
