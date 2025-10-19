import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

export const generateAccessToken = (user) => {
    // DB user has user_id, username, is_admin
    const payload = {
        id: user.user_id || user.id,
        username: user.username,
        roles: Array.isArray(user.roles) ? user.roles : (user.is_admin ? ['admin'] : ['user'])
    };
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
};

export const generateRefreshToken = (user) => {
    const payload = {
        id: user.user_id || user.id,
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
