const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyTokenMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // No token provided, continue without attaching user information
        return next();
    }

    jwt.verify(token, '1b3dd87c843975e2ad89e963d2950688737a217577769b4def61ad6333311c73', async (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        try {
            const user = await User.findById(decodedToken.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Attach user information only if user is admin
            if (user.isAdmin) {
                req.user = user; // Attach the user object to the request for later use
            }
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(500).json({ error: 'Failed to verify token' });
        }
    });
};

module.exports = verifyTokenMiddleware;