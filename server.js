import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_FILE = join(__dirname, 'data', 'users.json');

const app = express();
app.use(cors());
app.use(express.json());

// --- Helper: read/write users JSON ---
function readUsers() {
  try {
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// --- Helper: encrypt password with SHA-256 ---
function encryptPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// === AUTH ENDPOINTS ===

// Register
app.post('/api/register', (req, res) => {
  const { name, rut, departamento, torre, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });
  }

  const users = readUsers();

  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'Ya existe una cuenta con este correo.' });
  }

  const newUser = {
    id: Date.now(),
    name: name || '',
    rut: rut || '',
    departamento: departamento || '',
    torre: torre || '',
    email,
    password: encryptPassword(password),
    role: email.includes('admin') ? 'admin' : 'resident',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  console.log(`Nuevo usuario registrado: ${email}`);
  res.json({ success: true, message: 'Cuenta creada exitosamente.', role: newUser.role });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Correo no registrado.' });
  }

  if (user.password !== encryptPassword(password)) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }

  console.log(`Login exitoso: ${email}`);
  res.json({ success: true, role: user.role, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// === WEBSOCKET ===
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
  console.log(`Servidor VexWard corriendo en el puerto ${PORT}`);
});
