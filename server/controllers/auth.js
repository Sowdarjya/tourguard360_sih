import bcrypt from "bcryptjs";
import pool from "../db/db.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
      [name, email.toLowerCase(), hashed]
    );
    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error("register error:", err);
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already registered" });
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email=$1",
      [email.toLowerCase()]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
