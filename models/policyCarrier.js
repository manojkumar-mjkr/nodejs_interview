const mongoose = require('mongoose');

const lobSchema = new mongoose.Schema({
  companyName: String
});

module.exports = mongoose.model('policycarriers', lobSchema);
