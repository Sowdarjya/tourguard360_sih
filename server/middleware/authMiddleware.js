import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "No authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ error: "Invalid authorization header" });

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
