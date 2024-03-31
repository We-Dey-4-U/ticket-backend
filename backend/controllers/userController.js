// controllers/userController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Updated import statement
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;
        
        // Check if user with the same email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        user = new User({ username, email, password: hashedPassword });
        await user.save();

       // Send JSON response with success message
       res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};



const loginUser = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

         // Determine if the user is an admin
         const isAdmin = user.isAdmin || false;

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, '3c4901cedc280a2a934d88fb72d37dd0ebfb1743b3367799283fd8dcb4798d74', { expiresIn: '1y' });

        // Redirect to index.html with token
        res.status(201).json({ message: 'User login successfully' , token});
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
};



const updateUserToAdmin = async (req, res) => {
    try {
        const { email } = req.params;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user to be admin
        user.isAdmin = true;
        await user.save();

        res.json({ message: 'User updated to admin successfully' });
    } catch (error) {
        console.error('Error updating user to admin:', error);
        res.status(500).json({ error: 'Failed to update user to admin' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserToAdmin,
};