const { Pool } = require("pg");

class PersistentMemory {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    this.pool.query("SELECT 1")
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB connection failed", err));

  }

  async get(key) {
    const res = await this.pool.query(
      "SELECT value FROM agent_memory WHERE key = $1",
      [key]
    );
    return res.rows[0]?.value;
  }

  async set(key, value) {
  await this.pool.query(
    `
    INSERT INTO agent_memory (key, value)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `,
    [key, JSON.stringify(value)]
  );
}


  async getAll() {
    const res = await this.pool.query(
      "SELECT key, value FROM agent_memory"
    );
    const memory = {};
    for (const row of res.rows) {
      memory[row.key] = row.value;
    }
    return memory;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = PersistentMemory;
