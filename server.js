const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Setup multer untuk menyimpan file yang diupload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Menyimpan file dengan timestamp
  }
});
const upload = multer({ storage });

// Middleware untuk mengirim file statis
app.use(express.static('public'));

// Routing untuk upload file
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Emit pesan ke semua user
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
