import { Server } from 'socket.io';

class SocketService {
    constructor() {
        this.io = null;
    }

    initialize(server) {
        if (this.io) return;
        this.io = new Server(server, { cors: { origin: '*' } });

        this.io.on('connection', (socket) => {
            socket.on('joinRoom', (room) => socket.join(room));
            socket.on('leaveRoom', (room) => socket.leave(room));
            socket.on('sendMessage', (data) => this.io.to(data.room).emit('message', data));
            socket.on('pollResponse', (data) => this.io.to(data.room).emit('pollResponse', data));
        });
    }

    emitEvent(room, event, data) {
        if (this.io) this.io.to(room).emit(event, data);
    }
}

const socketService = new SocketService();
export default socketService;