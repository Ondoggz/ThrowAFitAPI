import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No header at all
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header missing" });
    }

    // Must start with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Invalid authorization format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ ERROR: Missing JWT_SECRET in environment");
      return res.status(500).json({ msg: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user -> { id, username }
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired. Please log in again." });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ msg: "Invalid token" });
    }

    return res.status(500).json({ msg: "Token verification failed" });
  }
}
