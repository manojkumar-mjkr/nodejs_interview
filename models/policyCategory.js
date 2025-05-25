const mongoose = require('mongoose');

const lobSchema = new mongoose.Schema({
  categoryName: String
});

module.exports = mongoose.model('policycategories', lobSchema);
