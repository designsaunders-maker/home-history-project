"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }
        // Create new user
        const user = new User_1.default({
            email,
            password,
            firstName,
            lastName
        });
        await user.save();
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        // Return user data (excluding password) and token
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                verificationLevel: user.verificationLevel
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Error creating account'
        });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user and validate password
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        // Return user data and token
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                verificationLevel: user.verificationLevel
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error logging in'
        });
    }
});
exports.default = router;
