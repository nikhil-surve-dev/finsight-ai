import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Rent', 'Salary', 'Bills', 'Entertainment', 'Health', 'Shopping', 'Other'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
