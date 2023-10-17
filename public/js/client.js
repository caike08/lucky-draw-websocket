const socket = new WebSocket(WS_URL);

const messageElement = document.getElementById('message');

const MESSAGE_STATUSES = {
  INITIAL: 'Welcome to the Lucky Draw App',
  DRAW: 'Please wait while we draw a winner...',
  WON: 'You won! Confirmation code: ',
  LOST: 'You lost 😢',
}

function handleSocketMessage(message) {
  const data = JSON.parse(message.data);

  console.log('Received message:', data);

  switch (data.status) {
    case DRAW_ACTIONS.WON:
      setClientState(DRAW_ACTIONS.WON, data.code);
      break;
    case DRAW_ACTIONS.LOST:
      setClientState(DRAW_ACTIONS.LOST);
      break;
    default:
      console.warn(`Unknown status: ${data.status}`);
  }
}

function setClientState(state, code = '') {
  messageElement.textContent = MESSAGE_STATUSES.DRAW;

  setTimeout(() => {
    if (state === DRAW_ACTIONS.WON) {
      messageElement.textContent = `${MESSAGE_STATUSES.WON} ${code} 🎉`;
      vibratePhone(1000);
    } else if (state === DRAW_ACTIONS.LOST) {
      messageElement.textContent = MESSAGE_STATUSES.LOST;
    }

  }, 2000);
}

function vibratePhone(timeMs) {
  if (navigator.vibrate) {
    navigator.vibrate(timeMs);
  }
}

function init() {
  socket.addEventListener('message', handleSocketMessage);

  messageElement.textContent = MESSAGE_STATUSES.INITIAL;
  messageElement.classList.add('visible');
}

// Init
init();
