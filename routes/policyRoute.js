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

     const policies = await Policy.find({ userId: user._id })
      .populate('categoryId')   // ref: 'policyCategory'
      .populate('carrierId')    // ref: 'policyCarrier'
      .populate('userId'); 

    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


router.get('/aggregateByUser', async (req, res) => {
  try {
    const result = await Policy.aggregate([
  {
    $group: {
      _id: '$userId',          // group by userId
      totalPolicies: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: 'users',           // collection name users
      localField: '_id',       // userId from Policy grouped result
      foreignField: '_id',     // user _id field
      as: 'userDetails'
    }
  },
  {
    $unwind: '$userDetails'
  },
  {
    $project: {
      _id: 0,
      userId: '$_id',
      firstName: '$userDetails.firstName',
      email: '$userDetails.email',
      totalPolicies: 1
    }
  }
]);


    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;