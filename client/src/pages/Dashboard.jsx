import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Wallet, Sparkles, Loader2, ArrowRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInsights = async () => {
      try {
        setInsightsLoading(true); // reset loading state
        const { data } = await api.get(`/ai/insights?currency=${user?.currency || 'USD'}`);
        setInsights(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setInsightsLoading(false);
      }
    };

    if (user?.currency) {
      fetchDashboardData();
      fetchInsights();
    }
  }, [user?.currency]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6', '#6366f1', '#f43f5e', '#8b5cf6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: 'right', labels: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' } },
      tooltip: {
        callbacks: {
          label: (context) => ` ${formatCurrency(context.raw, user?.currency)}`
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6 bg-white dark:bg-[#0f172a] min-h-screen p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-primary-100 font-medium">Total Balance</h2>
            <Wallet className="text-primary-200 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{formatCurrency(balance, user?.currency)}</p>
        </div>

        {/* Income Card */}
        <div className="glass-card p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-500 dark:text-gray-400 font-medium">Monthly Income</h2>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowDownRight className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome, user?.currency)}</p>
        </div>

        {/* Expense Card */}
        <div className="glass-card p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-500 dark:text-gray-400 font-medium">Monthly Expenses</h2>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowUpRight className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpense, user?.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass-card p-6 lg:col-span-1 border dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Spending by Category</h2>
          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="flex-1 relative min-h-[250px]">
              <Pie data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Pie data={{ labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'] }] }} options={{ plugins: { legend: { display: false } }, cutout: '70%', maintainAspectRatio: false }} />
              <p className="mt-4">No expenses recorded yet.</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6 lg:col-span-2 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center font-medium">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <Receipt size={32} className="mb-2 opacity-50" />
              <p>No transactions found. Start adding some!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                      {t.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.category}</p>
                      <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()} {t.notes ? `• ${t.notes}` : ''}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insight Strip */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-primary-600 dark:text-primary-400">
            {insightsLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">AI Financial Insight</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {insightsLoading
                ? 'Analyzing your latest spending patterns...'
                : (insights?.smartTip || 'Keep tracking your expenses to get personalized insights from Llama 3.')}
            </p>
          </div>
        </div>
        <Link to="/insights" className="relative z-10 px-4 py-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg text-sm shadow-sm hover:shadow transition-shadow border border-gray-100 dark:border-gray-700 whitespace-nowrap">
          View Full Analysis
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;
