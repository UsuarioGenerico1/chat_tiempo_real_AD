import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { authRouter } from './controllers/authController.js';
import { initChatSocket } from './sockets/chatSocket.js';

const app = express();

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
const MONGO_URI ='mongodb://admin:proyecto2026@ac-jsg1c15-shard-00-00.hs7kv3t.mongodb.net:27017,ac-jsg1c15-shard-00-01.hs7kv3t.mongodb.net:27017,ac-jsg1c15-shard-00-02.hs7kv3t.mongodb.net:27017/proyectoAD?ssl=true&replicaSet=atlas-at76pk-shard-0&authSource=admin&appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));
app.use('/api', authRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

initChatSocket(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(` Servidor modular corriendo en http://localhost:${PORT}`);
});