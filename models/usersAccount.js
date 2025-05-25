const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountName: String,
  accountType: String,
  city: String
});

module.exports = mongoose.model('useraccounts', accountSchema);
