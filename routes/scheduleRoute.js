const express = require('express');
const router = express.Router();

const ScheduledMessage = require('../models/scheduledMessage'); // Adjust path as needed

// POST /scheduleMessage
router.post('/scheduleMessage', async (req, res) => {
  try {
    const { message, day, time } = req.body;
    console.log('Received request to schedule message:', { message, day, time });

    // Validate required fields
    if (!message || !day || !time) {
      return res.status(400).json({ error: 'message, day, and time are required' });
    }

    // Combine day and time into ISO format
    const scheduledAt = new Date(`${day} ${time}:00`);

    // const testscheduledAt = new Date("2025-05-30 15:30:00");
    // console.log('Test Scheduled At:', testscheduledAt); 

    // Validate date
    if (isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ error: 'Invalid day or time format' });
    }

    // Create new scheduled message
    const newMessage = new ScheduledMessage({
      message,
      scheduledAt,
      executed: false
    });

    await newMessage.save();

    console.log('Scheduled message saved:', newMessage);

    res.status(201).json({
      success: true,
      scheduledMessage: newMessage
    });
  } catch (err) {
    console.error('Error inserting scheduled message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;