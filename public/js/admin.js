let socket;
const drawButton = document.getElementById('draw');
const messageElement = document.getElementById('message');

function connectWebSocket() {
  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', handleSocketOpen);
  socket.addEventListener('message', handleSocketMessage);
  socket.addEventListener('error', handleSocketError);
  socket.addEventListener('close', handleSocketClose);
};

function handleSocketOpen() {
  console.log('Socket opened');

  socket.send(JSON.stringify({
    action: ACTIONS.ADMIN,
  }))
}

function handleSocketMessage(message) {
  const data = JSON.parse(message.data);
  const action = data.action;

  if (action === ACTIONS.CLIENT_COUNT_UPDATE) {
    updateClientCount(data.count);
  }
}

function handleSocketError(error) {
  console.error('Socket error:', error);
}

function handleSocketClose() {
  console.log('Socket closed. Trying to reconnect in 5 seconds...');
  setTimeout(connectWebSocket, 5000);
}

function updateClientCount(count) {
  document.getElementById('clientCount').textContent = count;
}

function generateCode(length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let code = '';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

function handleDrawClick() {
  const code = generateCode(6);

  if(socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      action: ACTIONS.DRAW,
      code,
    }));

    displayConfirmationCode(code);
  } else {
    console.warn('Socket is not open. Try again in a few seconds.');
  }
}

function displayConfirmationCode(code) {
  messageElement.textContent = `Confirmation code: ${code}`;
  messageElement.classList.add('visible');
}

function init() {
  drawButton.addEventListener('click', handleDrawClick);

  connectWebSocket();
}

// Init
init();
