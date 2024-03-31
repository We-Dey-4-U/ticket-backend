const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const qr = require('qrcode');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Function to generate QR code
// Function to generate QR code for each ticket
const generateQRCodeForTicket = async (ticket) => {
    try {
        const qrCodeBuffer = await qr.toBuffer(ticket.secureTicket);

        const qrCodeDir = path.join(__dirname, '..', 'qr_images');
        
        // Create the directory if it doesn't exist
        if (!fs.existsSync(qrCodeDir)) {
            fs.mkdirSync(qrCodeDir);
        }

        const qrCodePath = path.join(qrCodeDir, 'ticket_qr_' + ticket._id + '.png');

        fs.writeFileSync(qrCodePath, qrCodeBuffer);

        ticket.qrCodeImagePath = qrCodePath;
        await ticket.save();

        return qrCodePath;
    } catch (err) {
        console.error('Error generating QR code for ticket:', err);
        throw err;
    }
};

// Function to generate secure ticket
const generateSecureTicket = () => {
    // Generate a random 6-digit number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
};

// Function to calculate dynamic ticket price
const calculateTicketPrice = (basePrice, demandFactor, timeFactor, availabilityFactor) => {
    // Adjust basePrice based on factors such as demand, time, and availability
    let dynamicPrice = basePrice * demandFactor * timeFactor * availabilityFactor;
    
    // Check if dynamicPrice is a valid number
    if (isNaN(dynamicPrice) || dynamicPrice <= 0) {
        // If dynamicPrice is not a valid number or is less than or equal to zero,
        // set it to a default value or handle the error according to your requirements
        dynamicPrice = 0; // Set a default value of 0 for now
    }

    return dynamicPrice;
};


const purchaseEventTicket = async (req, res) => {
    try {
        // Extract necessary details from the request body
        const { email, eventId, ticketType, quantity } = req.body;

        // Find or create the user by email
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email }); // Create new user with the provided email
        }

        // Find the event by ID
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Determine ticket price based on ticket type
        let ticketPrice;
        switch (ticketType.toLowerCase()) {
            case 'vip':
                ticketPrice = event.vip_price;
                break;
            case 'regular':
                ticketPrice = event.regular_price;
                break;
            case 'normal':
                ticketPrice = event.normal_price;
                break;
            default:
                return res.status(400).json({ error: 'Invalid ticket type' });
        }

        // Check if ticket price is available
        if (!ticketPrice) {
            return res.status(400).json({ error: 'Ticket price not available for the selected type' });
        }

       // Calculate total price for the current ticket type
       const totalPrice = quantity * ticketPrice;

        // Create tickets
        const tickets = [];
        for (let i = 0; i < quantity; i++) {
            // Generate a unique secure ticket for each ticket
            const secureTicket = generateSecureTicket();

            // Calculate dynamic price for this ticket
            const dynamicPrice = calculateTicketPrice(ticketPrice, event.demand_factor, event.time_factor, event.availability_factor);
           
            // Create the ticket with the unique secure ticket
            const ticket = await Ticket.create({
                 event_id: event.event_id, // Use the custom event ID with 4 numbers
                 user_id: user._id, 
                 event_name: event.event_name, 
                 email, 
                 quantity,
                 ticket_type: ticketType, 
                 ticket_price: dynamicPrice, 
                 total_price: totalPrice,
                 secureTicket 
                });
           
           // Generate QR code for each ticket and associate it with the ticket
           const qrCodePath = await generateQRCodeForTicket(ticket);
           ticket.qrCodeImagePath = qrCodePath; // Associate the QR code image path with the ticket
           await ticket.save();

            // Push the ticket to the tickets array
            tickets.push(ticket);
        }

        res.status(201).json({ tickets });
    } catch (error) {
        console.error('Error purchasing event tickets:', error);
        res.status(500).json({ error: 'Failed to purchase event tickets' });
    }
};



const getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if userId is null
        if (!userId) {
            return res.status(400).json({ error: 'User ID is missing' });
        }

        // Validate userId format (optional)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // Fetch tickets for the user
        const userTickets = await Ticket.find({ user_id: userId }).populate('event_id');
        res.json({ userTickets });
    } catch (error) {
        console.error('Error retrieving user tickets:', error);
        res.status(500).json({ error: 'Failed to retrieve user tickets' });
    }
};


// Function to check if the QR code image file exists
const qrCodeExists = () => {
    const qrCodePath = path.join(__dirname, '..', 'ticket_qr.png'); // Assuming the file is in the parent directory
    return fs.existsSync(qrCodePath);
};








module.exports = {
    purchaseEventTicket,
    getUserTickets,
    qrCodeExists, 

}