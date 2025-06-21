import React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Incident, EmergencyContact, Shelter } from '../types';
import { AlertTriangle, Users, Building2 } from 'lucide-react';

interface DisasterMapProps {
  incidents: Incident[];
  contacts: EmergencyContact[];
  shelters: Shelter[];
}

const DisasterMap: React.FC<DisasterMapProps> = ({ incidents, contacts, shelters }) => {
  return (
    <Map
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 11
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >
      {incidents.map((incident) => (
        <React.Fragment key={incident.id}>
          <Marker
            longitude={incident.location.lng}
            latitude={incident.location.lat}
          >
            <div className="bg-[#FF4500] p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </Marker>
          <Source
            type="geojson"
            data={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [incident.location.lng, incident.location.lat]
              },
              properties: {}
            }}
          >
            <Layer
              id={`circle-${incident.id}`}
              type="circle"
              paint={{
                'circle-radius': incident.affectedRadius / 100,
                'circle-color': '#FF4500',
                'circle-opacity': 0.2
              }}
            />
          </Source>
        </React.Fragment>
      ))}

      {contacts.map((contact) => (
        <Marker
          key={contact.id}
          longitude={contact.location.lng}
          latitude={contact.location.lat}
        >
          <div className={`p-2 rounded-lg ${
            contact.status === 'sos' ? 'bg-red-500' :
            contact.status === 'danger' ? 'bg-orange-500' :
            contact.status === 'warning' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}>
            <Users className="w-5 h-5 text-white" />
          </div>
        </Marker>
      ))}

      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          longitude={shelter.location.lng}
          latitude={shelter.location.lat}
        >
          <div className={`p-2 rounded-lg ${
            shelter.status === 'full' ? 'bg-red-500' :
            shelter.status === 'closed' ? 'bg-gray-500' :
            'bg-[#7B68EE]'
          }`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </Marker>
      ))}
    </Map>
  );
};

export default DisasterMap;