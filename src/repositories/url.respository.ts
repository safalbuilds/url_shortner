import { pool } from "../lib/db.js";

export const insertUrl = async (
  originalUrl: string,
  shortCode: string,
  shortUrl: string,
) => {
  const result = await pool.query(
    `
    INSERT INTO urls
    (
      original_url,
      short_code,
      short_url
    )
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [originalUrl, shortCode, shortUrl],
  );

  return result.rows[0];
};

export const findByShortCode = async (shortCode: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM urls
    WHERE short_code = $1;
    `,
    [shortCode],
  );

  return result.rows[0];
};

export const deleteExpiredShortUrls = async () => {
  const result = await pool.query(
    `
    DELETE FROM urls
    WHERE expires_at < NOW()
    RETURNING *;
    `,
  );

  return result.rows;
};

export const updateClickCount = async (shortCode: string) => {
  const result = await pool.query(
    `
    UPDATE urls
    SET click_count = click_count + 1
    WHERE short_code = $1
    RETURNING *;
    `,
    [shortCode],
  );

  return result.rows[0];
};

export const getAll = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM urls
    ORDER BY created_at DESC;
    `,
  );

  return result.rows;
};

export const deleteRow = async (shortCode:string) => {
  const result = await pool.query(
    `
    DELETE FROM urls
    WHERE short_code = $1;
    `,
    [shortCode]
  );

  return result.rows;
};

