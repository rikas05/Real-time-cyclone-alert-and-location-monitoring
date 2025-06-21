const supabase = require('../supabaseClient');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register User
const registerUser = async (req, res) => {
  const { name, age, phone, emergencyContact } = req.body;

  if (!name || !age || !phone || !emergencyContact) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Insert user into Supabase database
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, age, phone, emergency_contact: emergencyContact }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Generate a JWT token (for future authentication)
    const token = jwt.sign({ phone: phone, id: data[0]?.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerUser };
