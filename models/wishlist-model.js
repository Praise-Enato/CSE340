const pool = require("../database")

/**
 * Add a vehicle to an account wishlist.
 * Returns the inserted row or null if already saved.
 */
async function addWishlistItem(account_id, inv_id) {
  const sql = `
    INSERT INTO public.wishlist (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT (account_id, inv_id) DO NOTHING
    RETURNING wishlist_id, account_id, inv_id, created_at
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rows[0] || null
}

/**
 * Remove a vehicle from an account wishlist.
 * Returns the deleted row or null if no match.
 */
async function removeWishlistItem(account_id, inv_id) {
  const sql = `
    DELETE FROM public.wishlist
    WHERE account_id = $1 AND inv_id = $2
    RETURNING wishlist_id, account_id, inv_id
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rows[0] || null
}

/**
 * Fetch all wishlist entries for an account with inventory details.
 */
async function getWishlistByAccount(account_id) {
  const sql = `
    SELECT
      w.wishlist_id,
      w.account_id,
      w.inv_id,
      w.created_at,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_price,
      i.inv_thumbnail,
      i.inv_image,
      i.inv_miles,
      i.inv_color,
      c.classification_name
    FROM public.wishlist AS w
      JOIN public.inventory AS i ON w.inv_id = i.inv_id
      JOIN public.classification AS c ON i.classification_id = c.classification_id
    WHERE w.account_id = $1
    ORDER BY w.created_at DESC, w.wishlist_id DESC
  `
  const result = await pool.query(sql, [account_id])
  return result.rows
}

/**
 * Get a single wishlist entry for an account + vehicle pair.
 */
async function findWishlistEntry(account_id, inv_id) {
  const sql = `
    SELECT wishlist_id, account_id, inv_id, created_at
    FROM public.wishlist
    WHERE account_id = $1 AND inv_id = $2
    LIMIT 1
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rows[0] || null
}

module.exports = {
  addWishlistItem,
  removeWishlistItem,
  getWishlistByAccount,
  findWishlistEntry,
}
