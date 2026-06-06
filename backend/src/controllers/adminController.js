import db from '../config/database.js';

export async function getAllUsers(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = `%${req.query.search || ''}%`;

    const { rows: users } = await db.query(
      `SELECT id, username, email, role, created_at, updated_at FROM users
       WHERE username ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [search, limit, offset]
    );
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE username ILIKE $1 OR email ILIKE $1',
      [search]
    );
    const total = parseInt(countRows[0].total);
    return res.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[getAllUsers]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function getUserById(req, res) {
  try {
    const { rows: userRows } = await db.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!userRows[0]) return res.status(404).json({ error: 'User tidak ditemukan.' });

    const { rows: prefRows } = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1', [req.params.id]
    );
    const { rows: favRows } = await db.query(
      'SELECT COUNT(*) as cnt FROM favorite_locations WHERE user_id = $1', [req.params.id]
    );
    return res.json({ ...userRows[0], preferences: prefRows[0], favorites_count: parseInt(favRows[0].cnt) });
  } catch (err) {
    console.error('[getUserById]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ error: 'Role tidak valid.' });
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'Tidak dapat mengubah role diri sendiri.' });

    const { rows } = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [role, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    return res.json({ message: `Role berhasil diubah ke "${role}".` });
  } catch (err) {
    console.error('[updateUserRole]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function deleteUser(req, res) {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri.' });

    const { rows } = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    return res.json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    console.error('[deleteUser]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function getStats(req, res) {
  try {
    const queries = await Promise.all([
      db.query("SELECT COUNT(*) as n FROM users WHERE role = 'user'"),
      db.query("SELECT COUNT(*) as n FROM users WHERE role = 'admin'"),
      db.query("SELECT COUNT(*) as n FROM favorite_locations"),
      db.query("SELECT COUNT(*) as n FROM search_history"),
      db.query("SELECT COUNT(*) as n FROM users WHERE created_at::date = CURRENT_DATE"),
    ]);
    return res.json({
      total_users:     parseInt(queries[0].rows[0].n),
      total_admins:    parseInt(queries[1].rows[0].n),
      total_favorites: parseInt(queries[2].rows[0].n),
      total_searches:  parseInt(queries[3].rows[0].n),
      new_users_today: parseInt(queries[4].rows[0].n),
    });
  } catch (err) {
    console.error('[getStats]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}