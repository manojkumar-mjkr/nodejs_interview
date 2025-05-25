const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

// Load models
const User = require(path.resolve(__dirname, '../models/user'));
const Agent = require(path.resolve(__dirname, '../models/agent'));
const UserAccount = require(path.resolve(__dirname, '../models/usersAccount'));
const LOB = require(path.resolve(__dirname, '../models/policyCategory'));
const Carrier = require(path.resolve(__dirname, '../models/policyCarrier'));
const Policy = require(path.resolve(__dirname, '../models/policyInfo'));

const router = express.Router();

// Set up storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check file presence
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`\n➡️  File uploaded: ${filePath}`);
    console.log('📁 File exists:', fs.existsSync(filePath));

    const workerScriptPath = path.join(__dirname, '../workers/uploadWorker.js');
    console.log('🧠 Worker script exists:', fs.existsSync(workerScriptPath));

    // Check if worker script is found
    if (!fs.existsSync(workerScriptPath)) {
      return res.status(500).json({ error: 'Worker script not found' });
    }

    const worker = new Worker(workerScriptPath, {
      workerData: { filePath }
    });

    console.log(`👷 Worker thread started: ${worker.threadId}`);

    // Listen for messages from worker
    worker.on('message', (message) => {
      if (message.status === 'done') {
        fs.unlink(filePath, () => {}); // clean up the uploaded file
        return res.status(200).json({ message: 'File uploaded and processed successfully' });
      } else if (message.status === 'error') {
        fs.unlink(filePath, () => {});
        return res.status(500).json({ error: 'Worker processing error', details: message.error });
      }
    });

    // Catch unexpected errors
    worker.on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error('❌ Worker error:', err);
      return res.status(500).json({ error: 'Worker thread error', details: err.message });
    });

    // Worker exit logging
    worker.on('exit', (code) => {
      console.log(`🛑 Worker exited with code ${code}`);
      if (code !== 0) {
        console.error('⚠️  Worker stopped unexpectedly.');
      }
    });

  } catch (err) {
    console.error('❗ Upload route error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.get('/searchByUsername', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username query param is required' });
  }

  try {
    const user = await User.findOne({ firstName: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const policies = await Policy.find({ user: user._id })
      .populate('policyCategory')
      .populate('company')
      .populate('user');

    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


module.exports = router;
