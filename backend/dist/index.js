import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import http from 'http';
import { setupSocket } from './socket/index.js';
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
// Initialize Socket.io
export const io = setupSocket(server);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map