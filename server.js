const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const APP_PORT = process.env.PORT || 3000;
const APP_URL = process.env.URL || `http://localhost:${APP_PORT}`;

const ACTIONS = {
  ADMIN: 'admin',
  DRAW: 'draw',
  CLIENT_COUNT_UPDATE: 'clientCountUpdate',
}

const DRAW_ACTIONS = {
  WON: 'won',
  LOST: 'lost',
}
 
app.use('/public', express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/public/admin.html'));

server.listen(APP_PORT, () => {
  console.log(`Listening on ${APP_URL}`);
});

// Array of clients
let clients = [];

wss.on('connection', (ws, req) => {
  console.log('Client connected');
  clients.push(ws); // Add client to array of clients
  updateAdminClientCount();

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter((client) => client !== ws); // Remove client from array of clients
    updateAdminClientCount();
  })

  ws.on('message', handleIncomingMessage.bind(null, ws));
})

function handleIncomingMessage(ws, message) {
  const data = JSON.parse(message);
  const action = data.action;

  switch(action) {
    case ACTIONS.ADMIN:
      ws.isAdmin = true;
      break;
    case ACTIONS.DRAW:
      drawWinner(data.code);
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

function drawWinner(confirmationCode) {
  let participants = Array.from(wss.clients).filter((client) => !client.isAdmin);
  const winner = participants[Math.floor(Math.random() * participants.length)];

  participants.forEach((client) => {
    let result = JSON.stringify({
      status: DRAW_ACTIONS.LOST,
    })
    
    if (client === winner) {
      result = JSON.stringify({
        status: DRAW_ACTIONS.WON,
        code: confirmationCode,
      })
    }

    client.send(result)
  })

}

function updateAdminClientCount() {
  const clientCount = Array.from(wss.clients).filter((client) => !client.isAdmin).length;

  Array.from(wss.clients).forEach((client) => {
    if(client.isAdmin && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action: ACTIONS.CLIENT_COUNT_UPDATE,
          count: clientCount,
        })
      );
    }
  })
}


