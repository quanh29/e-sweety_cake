import { findUserByUsername, validatePassword, storeRefreshToken, findRefreshToken, revokeRefreshToken, createUser } from '../data/users.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/authService.js';
import User from '../models/User.js';

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

        // Check if user is active
        if (!user.is_actived) {
            console.log('[login] User account is deactivated:', user.username);
            return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
        }

        console.log('[login] User authenticated:', user.username);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        console.log('[login] Generated new refresh token for user:', user.username);

        // store hashed refresh token in DB with expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await storeRefreshToken({ user_id: user.user_id || user.user_id, token: refreshToken, expiresAt, deviceInfo: req.headers['user-agent'] });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);
        console.log('[login] Set new refresh token cookie with options:', cookieOptions);

        res.json({ 
            accessToken,
            user: {
                userId: user.user_id,
                fullName: user.full_name,
                username: user.username,
                isAdmin: user.is_admin === 1
            }
        });
    } catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refresh = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        console.log('[refresh] Incoming request from', req.ip || req.hostname, 'user-agent:', req.headers['user-agent']);
        if (!oldRefreshToken) {
            console.log('[refresh] No refresh token cookie present');
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        // Do not log full token in production; log masked version for debugging
        const mask = t => (typeof t === 'string' && t.length > 10) ? `${t.slice(0,6)}...${t.slice(-4)}` : t;
        console.log('[refresh] Received refresh token cookie (masked):', mask(oldRefreshToken));

        const stored = await findRefreshToken(oldRefreshToken);
        console.log('[refresh] DB lookup for refresh token returned:', stored ? { token_id: stored.token_id, user_id: stored.user_id, expiresAt: stored.expiresAt } : null);
        if (!stored) {
            console.log('[refresh] No stored token found or token revoked');
            return res.status(403).json({ message: 'Invalid or revoked refresh token' });
        }

        const payload = verifyRefreshToken(oldRefreshToken);
        console.log('[refresh] Token verified payload:', payload);
        if (!payload) {
            console.log('[refresh] Token verification failed or expired');
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await findUserByUsername(payload.username);
        console.log('[refresh] Resolved user from payload username:', payload.username, '->', user ? { user_id: user.user_id, username: user.username } : null);
        if (!user) {
            console.log('[refresh] User not found for payload username');
            return res.status(403).json({ message: 'User not found' });
        }

        // Check if user is still active
        if (!user.is_actived) {
            console.log('[refresh] User account is deactivated:', user.username);
            // Revoke the refresh token since user is banned
            await revokeRefreshToken(oldRefreshToken);
            res.cookie('refreshToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                expires: new Date(0),
                path: '/'
            });
            return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
        }

    // One-time use: revoke the old refresh token
    console.log('[refresh] Revoking old refresh token id:', stored.token_id);
    await revokeRefreshToken(oldRefreshToken);
    console.log('[refresh] Revoke call completed for token id:', stored.token_id);

        // Issue a new refresh token, store it hashed in DB
        const newRefreshToken = generateRefreshToken(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const storeResult = await storeRefreshToken({ user_id: user.user_id || user.user_id, token: newRefreshToken, expiresAt, deviceInfo: req.headers['user-agent'] });
    console.log('[refresh] Stored new refresh token result:', storeResult);

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Set new refresh token cookie (httpOnly)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            //'none' phù hợp với môi trường production
            //'lax' phù hợp với môi trường development
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        };
        
        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        console.log('[refresh] Set refreshToken cookie (masked):', mask(newRefreshToken));
        console.log('[refresh] Cookie options:', cookieOptions);

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Refresh error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by authenticateJWT middleware with { id, username }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Fetch full user info from database
        const user = await User.findById(userId).lean();

        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            userId: user._id.toString(),
            fullName: user.fullName,
            username: user.username,
            isAdmin: user.isAdmin
        });
    } catch (err) {
        console.error('Get current user error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        console.log('[logout] Logout request received');
        if (refreshToken) {
            console.log('[logout] Revoking refresh token');
            await revokeRefreshToken(refreshToken);
        } else {
            console.log('[logout] No refresh token found in cookies');
        }

        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            expires: new Date(0),
            path: '/'
        });

        console.log('[logout] Cleared refresh token cookie');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        // Still try to clear cookie even if DB operation fails
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            expires: new Date(0),
            path: '/'
        });
        return res.status(200).json({ message: 'Logged out, but failed to revoke token on server.' });
    }
};
