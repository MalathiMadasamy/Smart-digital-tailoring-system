let ioFunc = null;

export const getIOInstance = async () => {
  if (ioFunc) return ioFunc;
  try {
    const mod = await import(/* @vite-ignore */ 'socket.io-client');
    ioFunc = mod.io || mod.default;
    return ioFunc;
  } catch (e) {
    if (typeof window !== 'undefined' && window.io) {
      ioFunc = window.io;
      return ioFunc;
    }
    return null;
  }
};

let socket = null;

export const initSocketClient = (token, userObj = {}) => {
  if (socket && socket.connected) {
    return socket;
  }

  const serverUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : (typeof window !== 'undefined' && window.location.origin.includes('localhost:5173')
        ? 'http://localhost:5000'
        : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

  if (typeof window !== 'undefined' && window.io) {
    socket = window.io(serverUrl, {
      auth: { token: token || localStorage.getItem('digitailor_jwt_token') || '' },
      query: {
        userId: userObj.id || userObj._id || userObj.username || 'usr-customer',
        role: userObj.role || 'customer',
        name: userObj.name || userObj.username || 'User',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    return socket;
  }

  const dummySocket = {
    connected: false,
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {},
  };

  getIOInstance().then((realIO) => {
    if (realIO && (!socket || !socket.connected)) {
      socket = realIO(serverUrl, {
        auth: { token: token || localStorage.getItem('digitailor_jwt_token') || '' },
        query: {
          userId: userObj.id || userObj._id || userObj.username || 'usr-customer',
          role: userObj.role || 'customer',
          name: userObj.name || userObj.username || 'User',
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
    }
  });

  return socket || dummySocket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket && socket.disconnect) {
    socket.disconnect();
    socket = null;
  }
};
