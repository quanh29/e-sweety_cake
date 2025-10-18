import { findUserByUsername, validatePassword, storeRefreshToken, findRefreshToken, revokeRefreshToken, createUser } from '../data/users.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { full_name, username, password } = req.body;
        if (!full_name || !username || !password) return res.status(400).json({ message: 'full_name, username and password are required' });

        const existing = await findUserByUsername(username);
        if (existing) return res.status(409).json({ message: 'Username already exists' });

        const newUser = await createUser({ full_name, username, password });
        res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
        console.error('Register error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await findUserByUsername(username);
        if (!user || !validatePassword(password, user.hashed_password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // store hashed refresh token in DB with expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await storeRefreshToken({ user_id: user.user_id || user.user_id, token: refreshToken, expiresAt, deviceInfo: req.headers['user-agent'] });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refresh = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) return res.status(401).json({ message: 'Refresh token not found' });

        const stored = await findRefreshToken(oldRefreshToken);
        if (!stored) return res.status(403).json({ message: 'Invalid or revoked refresh token' });

        const payload = verifyRefreshToken(oldRefreshToken);
        if (!payload) return res.status(403).json({ message: 'Invalid or expired refresh token' });

        const user = await findUserByUsername(payload.username);
        if (!user) return res.status(403).json({ message: 'User not found' });

        // One-time use: revoke the old refresh token
        await revokeRefreshToken(oldRefreshToken);

        // Issue a new refresh token, store it hashed in DB
        const newRefreshToken = generateRefreshToken(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await storeRefreshToken({ user_id: user.user_id || user.user_id, token: newRefreshToken, expiresAt, deviceInfo: req.headers['user-agent'] });

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Set new refresh token cookie (httpOnly)
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Refresh error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
