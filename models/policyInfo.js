const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: String,
  policyStartDate: Date,
  policyEndDate: Date,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'policycategories' },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'policycarriers' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('policies', policySchema);
