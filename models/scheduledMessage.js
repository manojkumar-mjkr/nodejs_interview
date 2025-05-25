const mongoose = require('mongoose');

const scheduledMessage = new mongoose.Schema({
    message: {
    type: String,
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  executed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('scheduledmessages', scheduledMessage);
