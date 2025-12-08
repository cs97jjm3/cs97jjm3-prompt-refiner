const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const { getDatabasePath } = require('./config');

let db = null;
let dbInfo = null;

async function initDatabase() {
  if (db) return db;

  // Get database path with fallback handling
  dbInfo = getDatabasePath();
  const dbPath = dbInfo.path;

  // If not in-memory, ensure directory exists
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      style TEXT NOT NULL,
      refined_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prompt_id) REFERENCES prompts(id)
    );

    CREATE INDEX IF NOT EXISTS idx_variants_prompt ON variants(prompt_id);
  `);

  return db;
}

async function getDatabaseInfo() {
  if (!dbInfo) {
    await initDatabase();
  }
  return dbInfo;
}

async function savePrompt(originalText) {
  const database = await initDatabase();
  const result = await database.run(
    'INSERT INTO prompts (original_text) VALUES (?)',
    [originalText]
  );
  return result.lastID;
}

async function saveVariant(promptId, style, refinedText) {
  const database = await initDatabase();
  const result = await database.run(
    'INSERT INTO variants (prompt_id, style, refined_text) VALUES (?, ?, ?)',
    [promptId, style, refinedText]
  );
  return result.lastID;
}

async function getPrompt(promptId) {
  const database = await initDatabase();
  return database.get('SELECT * FROM prompts WHERE id = ?', [promptId]);
}

async function getVariant(variantId) {
  const database = await initDatabase();
  return database.get('SELECT * FROM variants WHERE id = ?', [variantId]);
}

async function getVariantsForPrompt(promptId) {
  const database = await initDatabase();
  return database.all(
    'SELECT * FROM variants WHERE prompt_id = ? ORDER BY style',
    [promptId]
  );
}

async function getHistory(limit = 50) {
  const database = await initDatabase();
  const prompts = await database.all(`
    SELECT 
      p.id,
      p.original_text,
      p.created_at
    FROM prompts p
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [limit]);

  // Get all variants for each prompt
  for (const prompt of prompts) {
    const variants = await database.all(`
      SELECT style, refined_text
      FROM variants
      WHERE prompt_id = ?
      ORDER BY style
    `, [prompt.id]);
    
    prompt.variants = JSON.stringify(variants.map(v => ({
      style: v.style,
      text: v.refined_text
    })));
  }

  return prompts;
}

module.exports = {
  initDatabase,
  getDatabaseInfo,
  savePrompt,
  saveVariant,
  getPrompt,
  getVariant,
  getVariantsForPrompt,
  getHistory
};
