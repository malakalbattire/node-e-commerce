
const express = require('express');

const app = express();
const http = require('http');
const ngrok = require('ngrok');
const initSocket = require('./utils/initSocket');

const server = http.createServer(app);
const io = initSocket(server);

(async function() {
    const url = await ngrok.connect(3000);
    console.log(`Ngrok URL: ${url}`);
})();
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});



require('./app')(app, io);

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
