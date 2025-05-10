import jwt from "jsonwebtoken";
import { pool } from "../config/config.js";

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
      return null;
    }

    const client = await pool.connect();
    try {
      const decode = jwt.verify(token, process.env.JWT);
      const { id, level } = decode;

      let data;
      const query = {
        tahfiz: "SELECT * FROM u_admin WHERE id = $1",
        center: "SELECT * FROM u_admin WHERE id = $1",
        cms: "SELECT * FROM u_admin WHERE id = $1",
        admin: "SELECT * FROM u_admin WHERE id = $1",
        student: "SELECT * FROM u_students WHERE id = $1",
        teacher: "SELECT * FROM u_teachers WHERE id = $1",
        parent: "SELECT * FROM u_parents WHERE id = $1",
      };

      if (!query[level]) {
        return res.status(401).json({ message: "Anda tidak memilki izin" });
      }

      data = await client.query(query[level], [id]);

      if (data.rows.length === 0) {
        return res.status(401).json({ message: "Anda tidak memilki izin" });
      }

      req.user = data.rows[0];
      req.user.level = level;

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.level)) {
        return res.status(403).json({ message: "Anda tidak memilki izin" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: error.message });
    } finally {
      client.release();
    }
  };
};
