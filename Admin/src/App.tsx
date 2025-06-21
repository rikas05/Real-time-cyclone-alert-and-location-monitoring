import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { AlertTriangle, Users, Building2, Timer } from 'lucide-react';
import SignIn from './components/auth/SignIn';
import IncidentMap from './components/views/IncidentMap';
import PeopleView from './components/views/PeopleView';
import ShelterView from './components/views/ShelterView';
import Messages from './components/views/Messages';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const handleSignIn = (email: string, password: string) => {
    // In a real app, you would validate credentials here
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'incidents':
        return <IncidentMap />;
      case 'people':
        return <PeopleView />;
      case 'shelters':
        return <ShelterView />;
      case 'messages':
        return <Messages />;
      default:
        return (
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Indian Disaster Response Dashboard</h1>
                <p className="text-gray-500">Real-time monitoring and response management across India</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Active Incidents"
                  value={12}
                  icon={AlertTriangle}
                  trend={{ value: 8, isPositive: false }}
                  color="red"
                />
                <StatCard
                  title="People in Danger Zones"
                  value={1247}
                  icon={Users}
                  trend={{ value: 12, isPositive: false }}
                  color="red"
                />
                <StatCard
                  title="Available Shelters"
                  value={24}
                  icon={Building2}
                  color="purple"
                />
                <StatCard
                  title="Average Response Time"
                  value="4.2 min"
                  icon={Timer}
                  trend={{ value: 15, isPositive: true }}
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 h-[600px]">
                  <h2 className="text-lg font-semibold mb-4">Incident Map</h2>
                  <div className="h-[calc(100%-2rem)]">
                    <IncidentMap />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Earthquake Alert</p>
                          <p className="text-xs text-red-700">Gujarat - Magnitude 5.8</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Flood Warning</p>
                          <p className="text-xs text-yellow-700">Kerala - Rising water levels</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="text-lg font-semibold mb-4">Resource Status</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Emergency Teams</span>
                          <span className="font-medium">24/30 Available</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-full w-4/5 bg-[#7B68EE] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Medical Supplies</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-full w-[68%] bg-[#7B68EE] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Shelter Capacity</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-full w-[82%] bg-[#7B68EE] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onViewChange={setCurrentView} currentView={currentView} />
      {renderView()}
    </div>
  );
}

export default App;
