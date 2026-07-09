import { Router } from 'express';
import bcrypt from 'bcryptjs'; 
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const authRouter = Router();

//REGISTRO
authRouter.post('/register', async (req, res) => {
  try {
    const { name, username, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ 
      name, 
      username, 
      password: hashedPassword 
    });
    await newUser.save(); 
    const userSafeData = { _id: newUser._id, name: newUser.name, username: newUser.username };
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: userSafeData });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El nombre de usuario ya fue tomado hace un instante. Elige otro.' });
    }
    // Cualquier otro error normal
    res.status(500).json({ message: 'Error al registrar: ' + error.message });
  }
});

// LOGIN 
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales incorrectas' });
    const userSafeData = { _id: user._id, name: user.name, username: user.username };
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      'MI_FIRMA_SECRETA_PROYECTO_AD', // IMPORTANTE: En producción esto debe ir en variables de entorno (.env)
      { expiresIn: '24h' } // El token caduca en un día por seguridad
    );
    res.status(200).json({ 
      message: 'Login exitoso', 
      user: userSafeData, 
      token: token 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
});

export { authRouter };