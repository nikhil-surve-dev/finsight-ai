import { analyzeImage, generateInsights } from '../utils/openrouter.js';
import Transaction from '../models/Transaction.js';

// @desc    Upload image and extract transactions
// @route   POST /api/ai/extract
// @access  Private
export const extractTransactionsFromImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    
    // Call OpenRouter Vision API
    const extractedTransactions = await analyzeImage(base64Image);
    
    res.json(extractedTransactions);
  } catch (error) {
    console.error('[SmartScan] Controller Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not extract transactions. Please try manual entry.' });
  }
};

// @desc    Get AI insights based on user transactions
// @route   GET /api/ai/insights
// @access  Private
export const getFinancialInsights = async (req, res) => {
  try {
    // Fetch last 3 months of transactions for the user
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: threeMonthsAgo }
    }).select('amount type category date notes');

    if (transactions.length === 0) {
      return res.status(400).json({ message: 'Not enough data to generate insights. Add more transactions.' });
    }

    const currency = req.query.currency || req.user?.currency || 'USD';
    const insights = await generateInsights(transactions, currency);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate insights. Please try again.' });
  }
};
