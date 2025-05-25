const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  dob: Date,
  address: String,
  phone: String,
  state: String,
  zip: String,
  email: String,
  gender: String,
  userType: String,
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'usersAccount' }
});

module.exports = mongoose.model('users', userSchema);
