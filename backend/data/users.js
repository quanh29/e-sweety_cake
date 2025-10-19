import bcrypt from 'bcryptjs';
import pool from '../config/mysql.js';
import crypto from 'crypto';

// Helper: create uuid-like id (use library in production)
export const makeId = () => crypto.randomUUID();

export const findUserByUsername = async (username) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

export const createUser = async ({ full_name, username, password }) => {
    const user_id = makeId();
    const salt = bcrypt.genSaltSync(10);
    const hashed_password = bcrypt.hashSync(password, salt);

    await pool.execute(
        `INSERT INTO users (user_id, full_name, username, hashed_password, salt, is_actived, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, full_name, username, hashed_password, salt, true, false]
    );

    return { user_id, full_name, username };
};

export const validatePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};

// Refresh token storage (DB)
export const storeRefreshToken = async ({ user_id, token, expiresAt, deviceInfo }) => {
    // We'll store a hash of the token for safety
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.execute(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info) VALUES (?, ?, ?, ?)`,
        [user_id, tokenHash, expiresAt, deviceInfo || null]
    );
};

export const findRefreshToken = async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = false', [tokenHash]);
    return rows[0];
};

export const revokeRefreshToken = async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.execute('UPDATE refresh_tokens SET revoked = true WHERE token_hash = ?', [tokenHash]);
};
