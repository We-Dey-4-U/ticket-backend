const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_id: {
        type: Number,
        unique: true,
    },
    // Other fields...
    event_name: {
        type: String,
        required: true,
    },
    event_location: {
        type: String,
        required: true,
    },
    event_date: {
        type: Date,
        required: true,
    },
    event_flyer: {
        type: String,
        required: true,
    },
    vip_price: {
        type: Number,
        required: true,
    },
    regular_price: {
        type: Number,
        required: true,
    },
    normal_price: {
        type: Number,
        required: true,
    },
    admin_email: {
        type: String,
        required: true,
    }
}, { timestamps: true });

// Pre-save middleware to generate a unique 4-digit event ID
eventSchema.pre('save', async function(next) {
    // Check if the event_id field is not already set
    if (!this.event_id) {
        // Generate a unique 4-digit event ID
        this.event_id = await generateUniqueEventId();
    }
    next();
});

// Function to generate a unique 4-digit event ID
async function generateUniqueEventId() {
    const Event = mongoose.model('Event');
    let eventId;
    let isUnique = false;
    while (!isUnique) {
        // Generate a random 4-digit number
        eventId = Math.floor(1000 + Math.random() * 9000);
        // Check if the generated event ID is unique
        const existingEvent = await Event.findOne({ event_id: eventId });
        isUnique = !existingEvent;
    }
    return eventId;
}

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;