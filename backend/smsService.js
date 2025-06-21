const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const DEVICE_ID = process.env.DEVICE_ID;

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [phoneNumber],
        message: message,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    console.log('SMS Sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    throw new Error('Failed to send SMS');
  }
};

module.exports = sendSMS;
