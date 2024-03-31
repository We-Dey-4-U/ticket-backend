const { connect, disconnect } = require('./config/db');
const path = require('path');
const express = require('express');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const multer = require('multer'); // Import multer for handling file uploads
const fs = require('fs');
const Ticket = require('./models/Ticket');


// Initialize Express app
const app = express();

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware
app.use(express.json());

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

// Set up multer upload configuration
const upload = multer({ storage: storage });

// Use multer middleware for handling file uploads
app.use(upload.single('event_flyer'));

// Enable CORS
app.use(cors({
  credentials: true
}));


// Connect to MongoDB
connect()
  .then(() => {
    // Routes
    app.use('/api', eventRoutes);
    app.use('/api', ticketRoutes);
    app.use('/api', userRoutes);
    // Serve images from the qr_images directory
    app.use('/qr_images', express.static(path.join(__dirname, 'qr_images')));
    // Route to serve QR code image
    // Route to serve the QR code image
    



    
    


    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });

    // Start server
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });

// Disconnect from MongoDB when the process is terminated
process.on('SIGINT', async () => {
  await disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
});