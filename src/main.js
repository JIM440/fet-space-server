import 'dotenv/config';
import http from 'http';
import app from './app.js';
import SocketService from './common/utils/socket.service.js';

const server = http.createServer(app);
SocketService.initialize(server);

server.listen(process.env.port, () => console.log(`Server running on port ${process.env.port}`));