import React, { useState } from 'react';
import { Building2, Users, Package, ChevronFirst as FirstAid, Plus } from 'lucide-react';

const initialShelters = [
  {
    id: '1',
    name: 'Central Community Center',
    status: 'open',
    capacity: 500,
    currentOccupancy: 250,
    location: 'Downtown SF',
    resources: {
      food: 80,
      water: 75,
      medical: 90,
      beds: 60
    }
  },
  {
    id: '2',
    name: 'Mission District Shelter',
    status: 'full',
    capacity: 300,
    currentOccupancy: 300,
    location: 'Mission District',
    resources: {
      food: 40,
      water: 35,
      medical: 60,
      beds: 0
    }
  },
  {
    id: '3',
    name: 'Central Emergency Center',
    status: 'open',
    capacity: 400,
    currentOccupancy: 150,
    location: 'Richmond District',
    resources: {
      food: 90,
      water: 85,
      medical: 95,
      beds: 80
    }
  }
];

const ShelterView: React.FC = () => {
  const [shelters, setShelters] = useState(initialShelters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: '',
    status: 'open',
    capacity: 0,
    currentOccupancy: 0,
    location: '',
    resources: {
      food: 100,
      water: 100,
      medical: 100,
      beds: 100
    }
  });

  const handleAddShelter = (e: React.FormEvent) => {
    e.preventDefault();
    const shelter = {
      id: (shelters.length + 1).toString(),
      ...newShelter
    };
    setShelters([...shelters, shelter]);
    setIsModalOpen(false);
    setNewShelter({
      name: '',
      status: 'open',
      capacity: 0,
      currentOccupancy: 0,
      location: '',
      resources: {
        food: 100,
        water: 100,
        medical: 100,
        beds: 100
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shelter Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#7B68EE] text-white px-4 py-2 rounded-lg hover:bg-[#6c5ce7] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Shelter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {shelters.map((shelter) => (
          <div
            key={shelter.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  shelter.status === 'full' ? 'bg-red-500' :
                  shelter.status === 'closed' ? 'bg-gray-500' :
                  'bg-[#7B68EE]'
                }`}>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{shelter.name}</h3>
                  <span className={`text-sm ${
                    shelter.status === 'full' ? 'text-red-500' :
                    shelter.status === 'closed' ? 'text-gray-500' :
                    'text-[#7B68EE]'
                  }`}>
                    {shelter.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Occupancy</span>
                  <span className="font-medium">
                    {shelter.currentOccupancy}/{shelter.capacity}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      (shelter.currentOccupancy / shelter.capacity) > 0.9
                        ? 'bg-red-500'
                        : (shelter.currentOccupancy / shelter.capacity) > 0.7
                        ? 'bg-yellow-500'
                        : 'bg-[#7B68EE]'
                    }`}
                    style={{
                      width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-[#7B68EE]" />
                    <span className="text-sm font-medium">Food & Water</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#7B68EE] rounded-full"
                      style={{ width: `${shelter.resources.food}%` }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FirstAid className="w-4 h-4 text-[#7B68EE]" />
                    <span className="text-sm font-medium">Medical</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#7B68EE] rounded-full"
                      style={{ width: `${shelter.resources.medical}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-[#7B68EE] text-white py-2 rounded-lg hover:bg-[#6c5ce7] transition-colors">
                Manage
              </button>
              <button className="flex-1 border border-[#7B68EE] text-[#7B68EE] py-2 rounded-lg hover:bg-[#7B68EE]/5 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Shelter</h2>
            <form onSubmit={handleAddShelter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shelter Name
                </label>
                <input
                  type="text"
                  required
                  value={newShelter.name}
                  onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#7B68EE] focus:border-[#7B68EE]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newShelter.status}
                  onChange={(e) => setNewShelter({ ...newShelter, status: e.target.value as 'open' | 'full' | 'closed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#7B68EE] focus:border-[#7B68EE]"
                >
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={newShelter.location}
                  onChange={(e) => setNewShelter({ ...newShelter, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#7B68EE] focus:border-[#7B68EE]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newShelter.capacity}
                  onChange={(e) => setNewShelter({ ...newShelter, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#7B68EE] focus:border-[#7B68EE]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Occupancy
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={newShelter.capacity}
                  value={newShelter.currentOccupancy}
                  onChange={(e) => setNewShelter({ ...newShelter, currentOccupancy: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#7B68EE] focus:border-[#7B68EE]"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#7B68EE] text-white py-2 rounded-lg hover:bg-[#6c5ce7] transition-colors"
                >
                  Add Shelter
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterView;