export interface Incident {
  id: string;
  type: 'earthquake' | 'tsunami' | 'fire' | 'flood' | 'volcano' | 'storm';
  severity: 'low' | 'medium' | 'high';
  location: {
    lat: number;
    lng: number;
  };
  affectedRadius: number;
  timestamp: string;
  title: string;
  description: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'safe' | 'warning' | 'danger' | 'sos';
  lastUpdate: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentOccupancy: number;
  status: 'open' | 'full' | 'closed';
  resources: {
    food: number;
    water: number;
    medical: number;
    beds: number;
  };
}