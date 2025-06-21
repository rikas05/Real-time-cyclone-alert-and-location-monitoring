import React, { useState } from 'react';
import { Home, AlertTriangle, Users, Building2, MessageSquare, Settings } from 'lucide-react';

interface SidebarProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onViewChange, currentView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'incidents', icon: AlertTriangle, label: 'Incidents' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'shelters', icon: Building2, label: 'Shelters' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' }
  ];

  return (
    <div className="w-16 bg-[#7B68EE] h-screen flex flex-col items-center py-6 gap-8">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-[#7B68EE]" />
      </div>
      
      <nav className="flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white relative group ${
                currentView === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 relative group">
          <Settings className="w-6 h-6" />
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;