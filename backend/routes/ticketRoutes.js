// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/tickets', ticketController.purchaseEventTicket);
router.get('/tickets/user/:userId', ticketController.getUserTickets);
//router.get('/tickets/:userId', ticketController.getUserTickets);
//router.get('/tickets/user', ticketController.getCurrentUserTickets); // New route for fetching current user's tickets


module.exports = router;