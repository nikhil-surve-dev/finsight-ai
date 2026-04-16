import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Upload, Trash2, Edit2, Loader2, X, Sparkles } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Salary', 'Bills', 'Entertainment', 'Health', 'Shopping', 'Other'];

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setFormData({
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        notes: transaction.notes || ''
      });
    } else {
      setFormData({ id: null, type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.put(`/transactions/${formData.id}`, formData);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction added');
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  // AI Upload Logic
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleExtractAI = async () => {
    if (!selectedFile) return;
    setAiExtracting(true);
    setAiExtractedData([]);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const { data } = await api.post('/ai/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiExtractedData(data);
      toast.success(`Extracted ${data.length} transactions!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not extract transactions. Please try manual entry.');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleSaveExtracted = async () => {
    setIsSubmitting(true);
    try {
      for (const t of aiExtractedData) {
        await api.post('/transactions', t);
      }
      toast.success('Extracted transactions saved!');
      setIsAIModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setAiExtractedData([]);
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to save some transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExtractedItem = (index) => {
    const newData = [...aiExtractedData];
    newData.splice(index, 1);
    setAiExtractedData(newData);
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Sparkles size={18} className="mr-2" /> Smart Scan
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-xl shadow-sm hover:bg-primary-700 transition"
          >
            <Plus size={18} className="mr-2" /> Add Manual
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Details</th>
                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Category</th>
                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Amount</th>
                <th className="p-4 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-900 dark:text-white max-w-[200px] truncate">{t.notes || '-'}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                        {t.category}
                      </span>
                    </td>
                    <td className={`p-4 font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenModal(t)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg ml-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border dark:border-gray-700">
            <div className="p-6 flex items-center justify-between border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.id ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${formData.type === 'expense' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Expense</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${formData.type === 'income' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Income</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-3 px-4 border focus:ring-primary-500 outline-none" placeholder="0.00" step="0.01" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-3 px-4 border focus:ring-primary-500 outline-none appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-3 px-4 border focus:ring-primary-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-3 px-4 border focus:ring-primary-500 outline-none" placeholder="Lunch at cafe..." />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Scan Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden border dark:border-gray-700 flex flex-col">
            <div className="p-6 flex items-center justify-between border-b dark:border-gray-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/10 dark:to-purple-900/10">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                <Sparkles size={24} />
                <h2 className="text-xl font-bold">Smart Receipt Scan</h2>
              </div>
              <button onClick={() => { setIsAIModalOpen(false); setSelectedFile(null); setPreviewUrl(null); setAiExtractedData([]); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {!selectedFile ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-full md:w-1/3">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-xl object-contain bg-gray-100 dark:bg-gray-900 max-h-48 border dark:border-gray-700" />
                      <button onClick={() => {setSelectedFile(null); setPreviewUrl(null);}} className="text-sm text-red-500 mt-2 hover:underline">Remove image</button>
                    </div>
                    <div className="w-full md:w-2/3 flex items-center">
                      {aiExtractedData.length === 0 ? (
                        <button 
                          onClick={handleExtractAI}
                          disabled={aiExtracting}
                          className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 transition"
                        >
                          {aiExtracting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing with Gemini Flash...</> : <><Sparkles size={20} className="mr-2"/> Extract Data</>}
                        </button>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl w-full flex items-center">
                          <Sparkles className="mr-2" /> Extracted successfully! Review below.
                        </div>
                      )}
                    </div>
                  </div>

                  {aiExtractedData.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Extracted Transactions</h3>
                      {aiExtractedData.map((t, index) => (
                        <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm items-center relative">
                          <button onClick={() => removeExtractedItem(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:scale-110 transition"><X size={12}/></button>
                          
                          <div className="col-span-2 sm:col-span-1">
                            <input type="text" value={t.date} onChange={(e) => { const n = [...aiExtractedData]; n[index].date = e.target.value; setAiExtractedData(n); }} className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
                          </div>
                          <div>
                            <select value={t.type} onChange={(e) => { const n = [...aiExtractedData]; n[index].type = e.target.value; setAiExtractedData(n); }} className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600">
                              <option value="expense">Expense</option><option value="income">Income</option>
                            </select>
                          </div>
                          <div>
                            <select value={t.category} onChange={(e) => { const n = [...aiExtractedData]; n[index].category = e.target.value; setAiExtractedData(n); }} className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600">
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <input type="number" value={t.amount} onChange={(e) => { const n = [...aiExtractedData]; n[index].amount = Number(e.target.value); setAiExtractedData(n); }} className="w-full p-1 flex-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <input type="text" value={t.notes} onChange={(e) => { const n = [...aiExtractedData]; n[index].notes = e.target.value; setAiExtractedData(n); }} className="w-full p-1 flex-1 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Notes" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {aiExtractedData.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
                <button onClick={() => setAiExtractedData([])} className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Discard</button>
                <button onClick={handleSaveExtracted} disabled={isSubmitting} className="flex justify-center items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2"/> : null} Confirm & Save All
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
