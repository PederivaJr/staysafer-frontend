import {io} from 'socket.io-client';

const socket = io.connect('https://staysafer.ch:6001', {
  transports: ['websocket'], 
  timeout: 15000,
  autoConnect: true
});

socket.on('connect', () => {
    console.log('Connected to the Socket.io server');
  });
  
  socket.on('connect_error', (error) => {
    console.log('Connection error:', error.message);
  });
  
  socket.on('error', (error) => {
    console.log('Socket error:', error.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Disconnected from the Socket.io server:', reason);
  });

export default socket;
