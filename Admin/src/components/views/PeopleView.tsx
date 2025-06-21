import React, { useState } from 'react';
import { Users, Phone, MapPin, Clock, Plus } from 'lucide-react';

const initialPeople = [
  { id: '1', name: 'Amit Kumar', status: 'sos', location: 'New Delhi', lastUpdate: '2 mins ago', phone: '+91 98765 43210' },
  { id: '2', name: 'Priya Singh', status: 'warning', location: 'Mumbai', lastUpdate: '5 mins ago', phone: '+91 87654 32109' },
  { id: '3', name: 'Rohan Sharma', status: 'safe', location: 'Chennai', lastUpdate: '10 mins ago', phone: '+91 76543 21098' },
  { id: '4', name: 'Sita Devi', status: 'sos', location: 'Kolkata', lastUpdate: '3 mins ago', phone: '+91 65432 10987' },
  { id: '5', name: 'Vijay Patel', status: 'safe', location: 'Ahmedabad', lastUpdate: '15 mins ago', phone: '+91 54321 09876' },
  { id: '6', name: 'Neha Mehta', status: 'warning', location: 'Surat', lastUpdate: '8 mins ago', phone: '+91 43210 98765' },
  { id: '7', name: 'Rahul Reddy', status: 'sos', location: 'Hyderabad', lastUpdate: '1 min ago', phone: '+91 32109 87654' },
  { id: '8', name: 'Anita Joshi', status: 'safe', location: 'Pune', lastUpdate: '20 mins ago', phone: '+91 21098 76543' },
  { id: '9', name: 'Arjun Rao', status: 'warning', location: 'Coimbatore', lastUpdate: '12 mins ago', phone: '+91 10987 65432' },
  { id: '10', name: 'Rikas', status: 'sos', location: 'Kttayam', lastUpdate: '4 mins ago', phone: '+91 09876 54321' }
];

const PeopleView = () => {
  const [people, setPeople] = useState(initialPeople);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', status: 'safe', location: '', phone: '' });

  const handleAddPerson = (e) => {
    e.preventDefault();
    const person = { id: (people.length + 1).toString(), ...newPerson, lastUpdate: 'Just now' };
    setPeople([...people, person]);
    setIsModalOpen(false);
    setNewPerson({ name: '', status: 'safe', location: '', phone: '' });
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">People Monitoring</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#7B68EE] text-white px-6 py-3 rounded-lg hover:bg-[#6c5ce7] transition-colors text-lg"
        >
          <Plus className="w-5 h-5" />
          Add Person
        </button>
      </div>

      {/* Updated grid to use full width with larger cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {people.map((person) => (
          <div key={person.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  person.status === 'sos' ? 'bg-red-500' :
                  person.status === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{person.name}</h3>
                  <span className={`text-md font-medium ${
                    person.status === 'sos' ? 'text-red-600' :
                    person.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {person.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-lg">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{person.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>{person.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{person.lastUpdate}</span>
              </div>
            </div>
            <button className="mt-6 w-full bg-[#7B68EE] text-white py-3 rounded-lg hover:bg-[#6c5ce7] transition-colors text-lg">
              Contact
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Person</h2>
            <form onSubmit={handleAddPerson} className="space-y-5">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                <input type="text" required value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE] text-lg" />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Status</label>
                <select value={newPerson.status} onChange={(e) => setNewPerson({ ...newPerson, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE] text-lg">
                  <option value="safe">Safe</option>
                  <option value="warning">Warning</option>
                  <option value="sos">SOS</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Location</label>
                <input type="text" required value={newPerson.location} onChange={(e) => setNewPerson({ ...newPerson, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE] text-lg" />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" required value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#7B68EE] focus:border-[#7B68EE] text-lg" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 bg-[#7B68EE] text-white py-3 rounded-lg hover:bg-[#6c5ce7] transition-colors text-lg">Add Person</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;
