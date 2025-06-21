import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// India center coordinates.
const indianMapCenter = [20.5937, 78.9629];

// Sample markers. Rikas is the one to monitor.
const peopleMarkers = [
  { name: 'Amit Kumar', position: [28.6139, 77.2090] },
  { name: 'Priya Singh', position: [19.0760, 72.8777] },
  { name: 'Rohan Sharma', position: [13.0827, 80.2707] },
  { name: 'Sita Devi', position: [22.5726, 88.3639] },
  { name: 'Vijay Patel', position: [23.0225, 72.5714] },
  { name: 'Neha Mehta', position: [21.1702, 72.8311] },
  { name: 'Rahul Reddy', position: [17.3850, 78.4867] },
  { name: 'Anita Joshi', position: [18.5204, 73.8567] },
  { name: 'Arjun Rao', position: [11.0168, 76.9558] },
  { name: 'Rikas', position: [9.6706, 76.5579] },
];

// Cyclone marker.
const cycloneMarker = {
  position: [15.0, 68.0],
  name: 'Cyclone Amphan',
  description: 'Cyclone approaching from the Arabian Sea',
  speed: '120 km/h',
};

// Custom icons for markers.
const personIcon = L.divIcon({
  className: 'custom-marker person-marker',
  html: '<div class="marker-inner"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});
const cycloneIcon = L.divIcon({
  className: 'custom-marker cyclone-marker',
  html: '<div class="marker-inner">🌀</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function IncidentMap() {
  // State for Rikas’s SOS and help status.
  const [rikasSOS, setRikasSOS] = useState(false);
  const [rikasHelpAssigned, setRikasHelpAssigned] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Set up WebSocket connection.
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.168.251:8080'); // Use your actual IP.
    ws.onopen = () => {
      console.log('WebSocket connected (web app)');
      setSocket(ws);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Web app received:', data);
      if (data.type === 'sos' && data.user === 'Rikas') {
        setRikasSOS(true);
      }
      if (data.type === 'assignHelp' && data.user === 'Rikas') {
        setRikasHelpAssigned(true);
      }
    };
    ws.onerror = (error) => console.log('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket closed (web app)');
    return () => ws.close();
  }, []);

  // If Rikas is in SOS (and help not assigned), use a blinking icon.
  const rikasBlinkIcon = L.divIcon({
    className: `custom-marker person-marker ${rikasSOS && !rikasHelpAssigned ? 'blink' : ''}`,
    html: '<div class="marker-inner"></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  // When user clicks "Assign Help", send a message via WebSocket.
  const handleAssignHelp = () => {
    setRikasHelpAssigned(true);
    if (socket) {
      socket.send(JSON.stringify({ type: 'assignHelp', user: 'Rikas' }));
    }
  };

  return (
    <>
      {/* Inline CSS for marker styles and blinking */}
      <style>
        {`
          .custom-marker .marker-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: bold;
            text-align: center;
          }
          .person-marker .marker-inner {
            background: linear-gradient(135deg, #42a5f5, #478ed1);
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
            border: 2px solid #fff;
          }
          .cyclone-marker .marker-inner {
            background: linear-gradient(135deg, #f44336, #ff7961);
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
            border: 2px solid #fff;
            font-size: 1rem;
          }
          @keyframes blink-animation {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          .blink .marker-inner {
            animation: blink-animation 1s infinite;
          }
        `}
      </style>

      <MapContainer center={indianMapCenter} zoom={5} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

{peopleMarkers.map((person, index) => {
  const icon =
    person.name === 'Rikas'
      ? L.divIcon({
          className: `custom-marker person-marker ${rikasSOS && !rikasHelpAssigned ? 'blink' : ''}`,
          html: '<div class="marker-inner"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        })
      : personIcon;
  return (
    <Marker key={index} position={person.position} icon={icon}>
      <Popup>
        <strong>{person.name}</strong>
        {person.name === 'Rikas' && rikasSOS && !rikasHelpAssigned && (
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={handleAssignHelp}
              style={{
                background: '#7B68EE',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Assign Help
            </button>
          </div>
        )}
        {person.name === 'Rikas' && rikasHelpAssigned && (
          <div style={{ marginTop: '8px', color: 'green' }}>
            Help Assigned!
          </div>
        )}
      </Popup>
      <Tooltip permanent>{person.name}</Tooltip>
    </Marker>
  );
})}


        {/* Cyclone marker */}
        <Marker position={cycloneMarker.position} icon={cycloneIcon}>
          <Popup>
            <strong>{cycloneMarker.name}</strong> <br />
            {cycloneMarker.description} <br />
            <strong>Speed:</strong> {cycloneMarker.speed}
          </Popup>
          <Tooltip permanent>{cycloneMarker.name}</Tooltip>
        </Marker>
      </MapContainer>
    </>
  );
}
