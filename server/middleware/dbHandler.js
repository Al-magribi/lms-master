import { pool } from "../config/config.js";

/**
 * Middleware to handle database connections and error handling
 * @param {Function} handler - The route handler function
 * @returns {Function} - Express middleware function
 */
export const withDbConnection = (handler) => {
  return async (req, res) => {
    const client = await pool.connect().catch((err) => {
      console.error("Database connection error:", err);
      return null;
    });

    if (!client) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      // Pass the client to the handler function
      return await handler(req, res, client);
    } catch (error) {
      // Get the route name from the handler function name or use a default
      const routeName = handler.name || "unknown-route";
      console.error(`Error in ${routeName}:`, error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  };
};

/**
 * Helper function to execute a database query with error handling
 * @param {Object} client - Database client
 * @param {String} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
export const executeQuery = async (client, query, params = []) => {
  try {
    return await client.query(query, params);
  } catch (error) {
    console.error("Query execution error:", error);
    throw new Error("Database query failed");
  }
};
