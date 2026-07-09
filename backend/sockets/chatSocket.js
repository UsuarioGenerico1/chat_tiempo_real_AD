import User from '../models/User.js';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';


const activeSockets = new Map();

export function initChatSocket(io) {
  
  // LISTA GLOBAL (Todos los usuarios de la base de datos)
  async function broadcastGlobalUserList() {
    try {
      const allUsers = await User.find({}, 'name username');
      const onlineUsernames = new Set(
        [...activeSockets.values()].map(session => session.username)
      );

      const globalList = allUsers.map(u => ({
        name: u.name,
        username: u.username,
        status: onlineUsernames.has(u.username) ? 'online' : 'offline'
      }));

      io.emit('global-user-list', globalList);
    } catch (error) {
      console.error(' Error en lista global:', error);
    }
  }

  // LISTA DE SALA (Solo los usuarios dentro de un canal) 
  async function broadcastRoomUserList(room) {
    if (!room) return; // Si no hay sala válida, no hacemos nada

    try {
      
      const usernamesInRoom = [...activeSockets.values()]
        .filter(session => session.room === room)
        .map(session => session.username);

      const usersInRoom = await User.find({ username: { $in: usernamesInRoom } }, 'name username');

      const roomList = usersInRoom.map(u => ({
        name: u.name,
        username: u.username,
        status: 'online'
      }));

      io.to(room).emit('room-user-list', roomList);
    } catch (error) {
      console.error(' Error en lista de sala:', error);
    }
  }

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Autenticación denegada: No enviaste un token'));
    }

    try {
      const decodedUser = jwt.verify(token, 'MI_FIRMA_SECRETA_PROYECTO_AD');
      socket.user = decodedUser; 
      next(); 
    } catch (err) {
      return next(new Error('Token inválido o expirado'));
    }
  });

  // --- CONEXIÓN ACEPTADA ---
  io.on('connection', (socket) => {
    console.log(` Socket conectado: ${socket.id} - Usuario real: ${socket.user.username}`);
    socket.on('join-room', async ({ room }) => { 
      try {
        const username = socket.user.username; 
        const currentSession = activeSockets.get(socket.id);
        let oldRoom = null;
        if (currentSession && currentSession.room) {
          oldRoom = currentSession.room;
          socket.leave(oldRoom);
        }
        activeSockets.set(socket.id, { username, room });
        socket.join(room);
        const chatHistory = await Message.find({ room }).sort({ timestamp: 1 }).limit(50);
        socket.emit('chat-history', chatHistory);
        await broadcastGlobalUserList(); 
        if (oldRoom) await broadcastRoomUserList(oldRoom); 
        await broadcastRoomUserList(room); 
      } catch (error) {
        console.error('Error al unirse a la sala:', error);
      }
    });

    
    socket.on('chat message', async (msgData) => {
      try {
        const { text, room } = msgData;
        const username = socket.user.username;

        const newMessage = new Message({ username, text, room });
        await newMessage.save(); 
        
        io.to(room).emit('chat message', newMessage); 
      } catch (error) {
        console.error('Error en el chat:', error);
      }
    });

    socket.on('disconnect', async () => {
      const session = activeSockets.get(socket.id);
      activeSockets.delete(socket.id);
      await broadcastGlobalUserList();
      if (session && session.room) await broadcastRoomUserList(session.room);
    });
  });
}