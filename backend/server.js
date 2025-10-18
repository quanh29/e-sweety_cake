import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import rateLimiter from './middleware/ratelimiter.js';

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(rateLimiter);

app.use(cookieParser());
//logging middleware (in vietnam timezone)

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Protected route examples
app.get('/api/profile', authenticateJWT, (req, res) => {
    // The user object from the token is available in req.user
    res.json({ message: `Welcome ${req.user.username}! This is your profile.`, user: req.user });
});

app.get('/api/admin', authenticateJWT, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome Admin! This is a protected admin route.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

