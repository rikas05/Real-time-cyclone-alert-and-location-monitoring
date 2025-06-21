const express = require('express');
const supabase = require('./supabase_client');
const jwt = require('jsonwebtoken');
const sendSMS = require('./smsService');
require('dotenv').config();

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { name, age, phone, emergencyContact } = req.body;

  if (!name || !age || !phone || !emergencyContact) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already registered' });
    }

    if (userError && userError.code !== 'PGRST116') { 
      // Ignore 'No rows found' error
      throw new Error(userError.message);
    }

    // Insert new user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, age, phone, emergency_contact: emergencyContact }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // Generate JWT token
    const token = jwt.sign({ phone: phone, id: data[0]?.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: data[0],
      token: token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send SMS
router.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone number and message are required' });
  }

  try {
    const smsResponse = await sendSMS(phone, message);
    res.status(200).json({ message: 'SMS sent successfully', smsResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
