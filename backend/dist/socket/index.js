import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
export const setupSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
            socket.userId = decoded.userId;
            next();
        }
        catch (err) {
            next(new Error("Authentication error"));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
            socket.broadcast.emit('user:online', socket.userId);
        }
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            if (socket.userId) {
                socket.broadcast.emit('user:offline', socket.userId);
            }
        });
        // Chat Events
        socket.on('message:new', (data) => {
            // Broadcast to channel room
            io.to(`channel:${data.channelId}`).emit('message:new', data);
        });
        socket.on('join:channel', (channelId) => {
            socket.join(`channel:${channelId}`);
        });
        // Task Events
        socket.on('task:update', (data) => {
            // Notify project members (assuming they are in project room)
            io.to(`project:${data.projectId}`).emit('task:update', data);
        });
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
        });
        // Report Events
        socket.on('report:submitted', (data) => {
            // Notify manager
            if (data.managerId) {
                io.to(`user:${data.managerId}`).emit('report:submitted', data);
            }
        });
    });
    return io;
};
//# sourceMappingURL=index.js.map