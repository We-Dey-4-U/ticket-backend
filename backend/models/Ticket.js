const mongoose = require('mongoose');
const Event = require('./Event'); // Import the Event model

const ticketSchema = new mongoose.Schema({
    event_id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    ticket_type: {
        type: String,
        enum: ['vip', 'regular', 'normal'], // Include 'regular' as a valid enum value
        required: true,
    },
    ticket_price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1, // Default quantity is 1
    },
    total_price: {
        type: Number,
        required: true,
    },
    ticket_availability: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['unused', 'used'],
        default: 'unused',
    },
    demand_factor: {
        type: Number,
        required: true,
        default: 1, // Default demand factor
    },
    time_factor: {
        type: Number,
        required: true,
        default: 1, // Default time factor
    },
    availability_factor: {
        type: Number,
        required: true,
        default: 1, // Default availability factor
    },
    secureTicket: {
        type: String,
        required: true,
    },
    qrCodeImagePath: {
        type: String,
    },
}, { timestamps: true });

ticketSchema.virtual('event_name', {
    ref: 'Event',
    localField: 'event_id',
    foreignField: 'event_id', // Reference the event_id field of the Event model
    justOne: true,
    options: { select: 'event_name' }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;