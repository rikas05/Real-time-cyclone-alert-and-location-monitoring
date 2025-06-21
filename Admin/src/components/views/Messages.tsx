import React, { useState } from 'react';
import axios from 'axios';
import { Send, AlertTriangle } from 'lucide-react';

const peopleList = [
  'Amit Kumar',
  'Priya Singh',
  'Rohan Sharma',
  'Sita Devi',
  'Vijay Patel',
  'Neha Mehta',
  'Rahul Reddy',
  'Anita Joshi',
  'Arjun Rao',
  'Rikas',
];

const urgencyLevels = [
  { label: 'Low', color: 'green' },
  { label: 'Medium', color: 'yellow' },
  { label: 'High', color: 'red' },
];

const Messages = () => {
  const [alerts, setAlerts] = useState([
    { recipient: 'Rikas', message: 'Flood alert in your area', urgency: 'High', timestamp: '2 min ago' },
    { recipient: 'Neha Mehta', message: 'Possible landslide nearby', urgency: 'Medium', timestamp: '5 min ago' },
  ]);

  const [newAlert, setNewAlert] = useState({
    recipient: '',
    message: '',
    urgency: 'Medium',
  });

  const [smsSent, setSmsSent] = useState(false);

  const sendSMS = async (recipient: string, message: string) => {
    try {
      const API_KEY = '9c611dc8-ef0f-4197-89ae-91ae882c5ef5';
      const DEVICE_ID = '67b6661d7add5ffeac3a0e45';
      const recipients = ['+918590996041']; // You can modify this to send to different recipients dynamically

      await axios.post(
        `https://api.textbee.dev/api/v1/gateway/devices/${DEVICE_ID}/send-sms`,
        { recipients, message },
        { headers: { 'x-api-key': API_KEY } }
      );

      console.log('SMS has been sent');
      setSmsSent(true);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAlert.recipient || !newAlert.message) {
      alert('Please select a recipient and enter a message.');
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    setAlerts([{ ...newAlert, timestamp }, ...alerts]);

    // Send SMS only if it has not been sent already
    if (!smsSent) {
      sendSMS(newAlert.recipient, newAlert.message);
    }

    setNewAlert({ recipient: '', message: '', urgency: 'Medium' });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Emergency Messages</h1>

      {/* Form to Send a New Alert */}
      <form onSubmit={handleSendAlert} className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Send Warning Alert</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipient</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE]"
              value={newAlert.recipient}
              onChange={(e) => setNewAlert({ ...newAlert, recipient: e.target.value })}
            >
              <option value="">Select a person</option>
              {peopleList.map((person, index) => (
                <option key={index} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE]"
              value={newAlert.urgency}
              onChange={(e) => setNewAlert({ ...newAlert, urgency: e.target.value })}
            >
              {urgencyLevels.map((level, index) => (
                <option key={index} value={level.label}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE] resize-none"
            rows={3}
            value={newAlert.message}
            onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
          ></textarea>
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#7B68EE] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6c5ce7] transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Alert & SMS
        </button>
      </form>

      {/* List of Sent Alerts */}
      <h2 className="text-lg font-semibold mb-4">Sent Alerts</h2>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-gray-500">No alerts sent yet.</p>
        ) : (
          alerts.map((alert, index) => {
            const urgencyColor =
              alert.urgency === 'High' ? 'bg-red-50 border-red-100 text-red-900' :
              alert.urgency === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-900' :
              'bg-green-50 border-green-100 text-green-900';

            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${urgencyColor}`}
              >
                <AlertTriangle className="w-5 h-5 text-current" />
                <div>
                  <p className="text-sm font-medium">{alert.recipient}</p>
                  <p className="text-xs">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Messages;
