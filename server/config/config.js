import pkg from "pg";

const { Pool } = pkg;

// Error types mapping
const ERROR_TYPES = {
  "57P01": "Pool Exhausted - Terlalu banyak koneksi yang diminta",
  "08006": "Connection Failure - Gagal terhubung ke database",
  "28P01": "Authentication Failed - Username atau password salah",
  "3D000": "Database Does Not Exist - Database tidak ditemukan",
  "08001": "Unable to Connect - Tidak dapat terhubung ke server",
  "08004": "Server Rejected - Server menolak koneksi",
  "08007": "Connection Failure - Koneksi terputus",
  40001: "Deadlock - Terjadi deadlock",
  "40P01": "Deadlock - Terjadi deadlock",
  "55P03": "Lock Timeout - Timeout saat menunggu lock",
  57014: "Query Canceled - Query dibatalkan",
  57000: "Statement Timeout - Query melebihi batas waktu",
};

const config = {
  user: process.env.P_USER,
  password: process.env.P_PASSWORD,
  host: process.env.P_HOST,
  database: process.env.P_DATABASE,
  port: 5432,
  max: 5000,
  min: 1000,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 60000,
  application_name: "LMS-V3",
  statement_timeout: 120000,
  query_timeout: 120000,
  prepare: true,
  keepalive: true,
  keepaliveInitialDelayMillis: 10000,
  maxUses: 7500,
  allowExitOnIdle: true,
  maxWaitingClients: 5000,
  connectionTimeoutMillis: 30000,
  idleInTransactionSessionTimeout: 60000,
};

const pool = new Pool(config);

// Fungsi untuk mendapatkan waktu Indonesia (WIB)
const getIndonesianTime = () => {
  return new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
};

// Fungsi untuk membaca dan mencatat error
const logError = (error, context = "") => {
  const errorType = ERROR_TYPES[error.code] || "Unknown Error";
  const timestamp = getIndonesianTime();

  console.error(`
[${timestamp}] Database Error:
Type: ${errorType}
Code: ${error.code}
Context: ${context}
Message: ${error.message}
Stack: ${error.stack}
  `);

  // Simpan error ke file log jika diperlukan
  // fs.appendFileSync('database-errors.log', errorLog);
};

// Enhanced pool monitoring
const monitorPool = () => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };

  // Log warning if pool is getting full
  if (stats.total > config.max * 0.8) {
    console.warn(
      `[${stats.timestamp}] WARNING: Pool usage high (${stats.total}/${config.max})`
    );
  }

  // Log warning if many clients are waiting
  if (stats.waiting > 50) {
    console.warn(
      `[${stats.timestamp}] WARNING: High number of waiting clients (${stats.waiting})`
    );
  }

  console.log(`
[${stats.timestamp}] Status Pool:
Total Koneksi: ${stats.total}
Koneksi Idle: ${stats.idle}
Request Menunggu: ${stats.waiting}
  `);
};

// Monitor pool every 30 seconds
setInterval(monitorPool, 30000);

// Enhanced error handling for pool
pool.on("error", (err, client) => {
  logError(err, "Pool Error");

  if (err.code === "57P01" || err.code === "08006") {
    console.log("Mencoba menghubungkan ulang ke database...");
    setTimeout(() => {
      connectToDatabase();
    }, 5000);
  }
});

pool.on("connect", (client) => {
  console.log(`[${getIndonesianTime()}] Koneksi baru ke database berhasil`);
});

// Add connection release monitoring with enhanced logging
pool.on("remove", (client) => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };

  console.log(`[${stats.timestamp}] Client dihapus dari pool. Status:`, stats);

  // Log warning if pool is getting exhausted
  if (stats.total < config.min) {
    console.warn(
      `[${stats.timestamp}] WARNING: Pool size below minimum (${stats.total}/${config.min})`
    );
  }
});

const connectToDatabase = async () => {
  let retries = 5;
  const retryDelay = 5000;

  while (retries > 0) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT NOW() AT TIME ZONE 'Asia/Jakarta' as current_time"
      );
      client.release();

      console.log(
        `[${getIndonesianTime()}] Terhubung ke PostgreSQL: ${
          result.rows[0].current_time
        }`
      );
      return;
    } catch (err) {
      logError(err, `Percobaan koneksi ke-${6 - retries}/5`);
      retries--;
      if (retries === 0) {
        console.error(
          "[KRITIS] Gagal terhubung ke database setelah 5 percobaan"
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

// Enhanced getClient function with better error handling and connection management
const getClient = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const client = await pool.connect();

      // Set statement timeout for this client
      await client.query("SET statement_timeout = $1", [
        config.statement_timeout,
      ]);

      return client;
    } catch (err) {
      retryCount++;
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);

      if (err.code === "57P01") {
        logError(err, `Pool Exhausted - Percobaan ${retryCount}/${maxRetries}`);
        console.error(`Menunggu ${waitTime}ms sebelum mencoba lagi...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      logError(err, "Error saat mendapatkan client");
      throw err;
    }
  }
  throw new Error("Gagal mendapatkan client setelah maksimum percobaan");
};

const checkPoolHealth = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    logError(err, "Health Check Failed");
    return false;
  }
};

// Fungsi untuk mendapatkan statistik pool
const getPoolStats = () => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };
};

export {
  pool,
  connectToDatabase,
  getClient,
  checkPoolHealth,
  getPoolStats,
  logError,
};
