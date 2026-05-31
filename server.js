import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`Un cliente se ha conectado: ${socket.id}`);

  // Listen for GATE_STATE_CHANGE from one client and broadcast to everyone else
  socket.on('GATE_STATE_CHANGE', (data) => {
    console.log(`Actualizando reja: ${data.state} por ${data.user?.name}`);
    // Broadcast to all other connected clients
    socket.broadcast.emit('GATE_STATE_CHANGE', data);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket corriendo en el puerto ${PORT}`);
});
