import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email, dan password wajib diisi.' });
    if (username.length < 3 || username.length > 50)
      return res.status(400).json({ error: 'Username harus antara 3–50 karakter.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Format email tidak valid.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });

    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [username, email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Username atau email sudah digunakan.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role`,
      [username, email, hashed]
    );
    const newUser = rows[0];
    await db.query('INSERT INTO user_preferences (user_id) VALUES ($1)', [newUser.id]);

    const token = signToken(newUser);
    return res.status(201).json({
      message: 'Registrasi berhasil.',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });

    const { rows } = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [username]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Username atau password salah.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Username atau password salah.' });

    const token = signToken(user);
    return res.json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function me(req, res) {
  try {
    const { rows: userRows } = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!userRows[0]) return res.status(404).json({ error: 'User tidak ditemukan.' });

    const { rows: prefRows } = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );
    return res.json({ user: userRows[0], preferences: prefRows[0] });
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;
    if (!username && !email)
      return res.status(400).json({ error: 'Tidak ada data yang diperbarui.' });

    const conflict = await db.query(
      'SELECT id FROM users WHERE (LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)) AND id != $3',
      [username ?? '', email ?? '', userId]
    );
    if (conflict.rows.length > 0)
      return res.status(409).json({ error: 'Username atau email sudah digunakan.' });

    const { rows: current } = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const newUsername = username || current[0].username;
    const newEmail    = email    || current[0].email;

    await db.query(
      'UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3',
      [newUsername, newEmail, userId]
    );
    return res.json({ message: 'Profil berhasil diperbarui.', user: { id: userId, username: newUsername, email: newEmail } });
  } catch (err) {
    console.error('[updateProfile]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Password lama dan baru wajib diisi.' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });

    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Password lama salah.' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    return res.json({ message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('[changePassword]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}