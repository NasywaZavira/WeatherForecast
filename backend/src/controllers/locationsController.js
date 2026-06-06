import db from '../config/database.js';

export async function getFavorites(req, res) {
  try {
    const { rows } = await db.query(
      'SELECT id, city_name, lat, lon, created_at FROM favorite_locations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[getFavorites]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function addFavorite(req, res) {
  try {
    const { city_name, lat, lon } = req.body;
    if (!city_name) return res.status(400).json({ error: 'Nama kota wajib diisi.' });

    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) as cnt FROM favorite_locations WHERE user_id = $1',
      [req.user.id]
    );
    if (parseInt(countRows[0].cnt) >= 10)
      return res.status(400).json({ error: 'Maksimal 10 lokasi favorit.' });

    const { rows } = await db.query(
      `INSERT INTO favorite_locations (user_id, city_name, lat, lon)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, city_name) DO NOTHING
       RETURNING *`,
      [req.user.id, city_name.trim(), lat ?? null, lon ?? null]
    );
    if (rows.length === 0)
      return res.status(409).json({ error: 'Kota ini sudah ada di favorit.' });

    return res.status(201).json({ message: 'Lokasi favorit ditambahkan.', favorite: rows[0] });
  } catch (err) {
    console.error('[addFavorite]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function removeFavorite(req, res) {
  try {
    const { rows } = await db.query(
      'DELETE FROM favorite_locations WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Lokasi favorit tidak ditemukan.' });
    return res.json({ message: 'Lokasi favorit dihapus.' });
  } catch (err) {
    console.error('[removeFavorite]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function getSearchHistory(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT id, city_name, searched_at FROM search_history
       WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 20`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[getSearchHistory]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function addSearchHistory(req, res) {
  try {
    const { city_name } = req.body;
    if (!city_name) return res.status(400).json({ error: 'Nama kota wajib diisi.' });

    await db.query(
      'DELETE FROM search_history WHERE user_id = $1 AND city_name = $2',
      [req.user.id, city_name.trim()]
    );
    await db.query(
      'INSERT INTO search_history (user_id, city_name) VALUES ($1, $2)',
      [req.user.id, city_name.trim()]
    );
    await db.query(
      `DELETE FROM search_history WHERE user_id = $1
       AND id NOT IN (
         SELECT id FROM search_history WHERE user_id = $1
         ORDER BY searched_at DESC LIMIT 20
       )`,
      [req.user.id]
    );
    return res.status(201).json({ message: 'Riwayat pencarian disimpan.' });
  } catch (err) {
    console.error('[addSearchHistory]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function clearSearchHistory(req, res) {
  try {
    await db.query('DELETE FROM search_history WHERE user_id = $1', [req.user.id]);
    return res.json({ message: 'Riwayat pencarian dihapus.' });
  } catch (err) {
    console.error('[clearSearchHistory]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}