require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const cron = require('node-cron');

const uploadRoutes = require('./routes/uploadRoute');
const policyRoutes = require('./routes/policyRoute');

const ScheduledMessage = require('./models/scheduledMessage'); // Adjust path as needed
const scheduleRoutes = require('./routes/scheduleRoute');


const app = express();

app.use(express.json());
app.use('/api/upload', uploadRoutes);
app.use('/api/policies', policyRoutes);

app.use('/api/schedule', scheduleRoutes);

//http://localhost:3000/api/policies/searchByUsername?username=John

mongoose.connect('mongodb://localhost:27017/insurance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

app.get('/', (req, res) => {
  res.send('Health check: Server is running');
});

// Cron job runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const messagesToRun = await ScheduledMessage.find({
      scheduledAt: { $gte: oneMinuteAgo, $lte: now },
      executed: false
    });

    for (const msg of messagesToRun) {
      // 🔔 Put actual message execution logic here (e.g., send email, push notification)
      console.log(`✅ Executing message: "${msg.message}" at ${new Date().toISOString()}`);

      // Mark message as executed
      msg.executed = true;
      await msg.save();
    }
  } catch (err) {
    console.error('❌ Error during scheduled message execution:', err);
  }
});

const pidusage = require('pidusage');
const os = require('os');

// Check CPU every 10 seconds
setInterval(async () => {
  try {
    console.log('Checking CPU usage...');
    const stats = await pidusage(process.pid);
    const cpuUsage = stats.cpu; // CPU % usage
    //const cpuUsage = 60;
    console.log(`Current CPU usage: ${cpuUsage}%`);
  
    if (cpuUsage > 70) {
      console.warn('CPU usage exceeded 70%. Restarting server...');
      // Do cleanup if needed...
      process.exit(1); // Exit process — external tool (like PM2) should auto-restart it
    }
  } catch (err) {
    console.error('❌ Error fetching CPU usage:', err);
  }
}, 10000); // every 10 seconds

console.log(`PORT = ${process.env.PORT}`);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
