import db from '../config/database.js';

const ALLOWED_FIELDS = [
  'temp_unit', 'wind_unit', 'pressure_unit', 'time_format',
  'theme', 'language', 'default_city',
  'animations_on', 'notif_rain', 'notif_severe', 'notif_daily', 'notif_uv'
];

export async function getPreferences(req, res) {
  try {
    const { rows } = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Preferensi tidak ditemukan.' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[getPreferences]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}

export async function updatePreferences(req, res) {
  try {
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: 'Tidak ada field valid untuk diperbarui.' });

    const keys   = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(req.user.id);

    await db.query(
      `UPDATE user_preferences SET ${setClause}, updated_at = NOW() WHERE user_id = $${values.length}`,
      values
    );
    return res.json({ message: 'Preferensi berhasil disimpan.', updated: keys });
  } catch (err) {
    console.error('[updatePreferences]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}