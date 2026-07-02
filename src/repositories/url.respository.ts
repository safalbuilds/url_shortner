import { pool } from "../lib/db.js";

export const insertUrl = async (originalUrl: string, shortCode: string) => {
  const result = await pool.query(
    `
    INSERT INTO urls
    (
        original_url,
        short_code
    )
    VALUES ($1, $2)
    RETURNING *
    `,
    [originalUrl, shortCode],
  );
  return result.rows[0];
};

export const findByShortCode = async (shortCode: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM urls
    WHERE short_code = $1
    `,
    [shortCode],
  );
  return result.rows[0];
};

export const deleteExpiredShortUrl = async () => {
  const result = await pool.query(
    `
    DELETE FROM urls
    WHERE expires_on < NOW()
    `,
  );
  return result;
};

export const updateClickCount = async (shortCode: string) => {
  const result = await pool.query(
    `UPDATE urls
    SET click_count = click_count + 1
    WHERE short_code = $1;
    `,
    [shortCode],
  );
};

export const getAll = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM urls;
    `
  )
  console.log(result.rows)
}
