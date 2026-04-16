import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Target, Plus, Trash2, Edit2, Loader2, X, Sparkles, TrendingUp } from 'lucide-react';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', targetAmount: '', currentAmount: '0', deadline: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, transRes] = await Promise.all([
        api.get('/goals'),
        api.get('/transactions')
      ]);
      setGoals(goalsRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setFormData({
        id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: new Date(goal.deadline).toISOString().split('T')[0]
      });
    } else {
      setFormData({ id: null, name: '', targetAmount: '', currentAmount: '0', deadline: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.put(`/goals/${formData.id}`, formData);
        toast.success('Goal updated');
      } else {
        await api.post('/goals', formData);
        toast.success('Goal created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Goal deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  // Generate a dynamic "AI" tip based on max spending category
  const generateTip = (goal) => {
    if (transactions.length === 0) return "Start tracking expenses to get tips!";
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return "Keep saving! You're on track.";
    
    const byCat = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    const topCategory = Object.keys(byCat).reduce((a, b) => byCat[a] > byCat[b] ? a : b);
    const amountLeft = goal.targetAmount - goal.currentAmount;
    
    if (amountLeft <= 0) return "Incredible! You've reached your goal! 🎉";
    
    return `Tip: Need ${formatCurrency(amountLeft, user?.currency)} more. Try cutting down ${topCategory} expenses by 15% this month to reach this faster!`;
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-xl shadow-sm hover:bg-primary-700 transition"
        >
          <Plus size={18} className="mr-2" /> Add New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full glass-card p-12 flex flex-col items-center justify-center text-gray-500 text-center border dark:border-gray-700">
            <Target size={48} className="mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Goals Set</h2>
            <p>Set a target and keep track of your savings!</p>
          </div>
        ) : (
          goals.map(goal => {
            const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isComplete = percentage >= 100;
            
            return (
              <div key={goal._id} className="glass-card p-6 border dark:border-gray-700 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button onClick={() => handleOpenModal(goal)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-600 hover:text-primary-600"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(goal._id)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 pr-16">{goal.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mb-6">
                  <TrendingUp size={14} className="mr-1" /> Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-end mb-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(goal.currentAmount, user?.currency)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    of {formatCurrency(goal.targetAmount, user?.currency)}
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-primary-500'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isComplete ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'}`}>{percentage}% Complete</span>
                </div>

                <div className="mt-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 flex space-x-3 items-start border border-indigo-100 dark:border-indigo-800">
                  <Sparkles size={18} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary-900 dark:text-primary-200 leading-snug font-medium">
                    {generateTip(goal)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border dark:border-gray-700">
            <div className="p-6 flex items-center justify-between border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.id ? 'Edit Goal' : 'Create Goal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent py-3 px-4 focus:ring-primary-500 dark:text-white outline-none" placeholder="E.g., New Laptop" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                  <input type="number" required value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent py-3 px-4 focus:ring-primary-500 dark:text-white outline-none" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Saved</label>
                  <input type="number" required value={formData.currentAmount} onChange={(e) => setFormData({...formData, currentAmount: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent py-3 px-4 focus:ring-primary-500 dark:text-white outline-none" min="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                <input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent py-3 px-4 focus:ring-primary-500 dark:text-white outline-none" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Goals;
