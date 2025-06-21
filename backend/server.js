const WebSocket = require('ws');
const os = require('os');

// Determine your local IP address dynamically.
const interfaces = os.networkInterfaces();
let localIP = 'localhost';
for (let iface in interfaces) {
  for (let i = 0; i < interfaces[iface].length; i++) {
    let address = interfaces[iface][i];
    if (address.family === 'IPv4' && !address.internal) {
      localIP = address.address;
      break;
    }
  }
}

// Create WebSocket server on port 8080.
const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.push(ws);

  ws.on('message', (message) => {
    console.log('Received:', message);
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.log('Invalid JSON:', message);
      return;
    }

    // When an SOS is received for Rikas, broadcast it.
    if (data.type === 'sos' && data.user === 'Rikas') {
      console.log('SOS received for Rikas');
      broadcast({ type: 'sos', user: 'Rikas' });
    }

    // When help is assigned, broadcast that info.
    if (data.type === 'assignHelp' && data.user === 'Rikas') {
      console.log('Help assigned to Rikas');
      broadcast({ type: 'assignHelp', user: 'Rikas' });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter((client) => client !== ws);
  });
});

console.log(`WebSocket server running on ws://${localIP}:8080`);

function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
