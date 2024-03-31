const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyTokenMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/');
        // Check if the uploads directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
        }
        cb(null, uploadDir); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname); // Use a unique filename
    }
});

// Set up multer upload configuration
const upload = multer({ storage: storage });

// Apply verifyTokenMiddleware to routes that require authentication
router.post('/events', verifyTokenMiddleware, upload.single('event_flyer'), eventController.createEvent);
router.get('/events', eventController.getAllEvents);
router.get('/events/:eventId', eventController.getEventById);


module.exports = router;