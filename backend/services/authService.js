import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

export const generateAccessToken = (user) => {
    // MongoDB user has _id, username, isAdmin (or is_admin from backward compatibility layer)
    const isAdmin = user.isAdmin === true || user.is_admin === true || user.is_admin === 1;
    const payload = {
        id: user._id || user.user_id || user.id,
        username: user.username,
        roles: isAdmin ? ['admin'] : ['user']
    };
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user) => {
    const payload = {
        id: user._id || user.id,
        username: user.username
    };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
        console.error('Invalid refresh token:', err.message);
        return null;
    }
};
