import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../modules/users/User.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);

    if (req.tenant && payload.tenantId !== req.tenant.id) {
      return res.status(403).json({ error: "Token does not belong to this tenant" });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function requireOwner(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.is_owner) {
      return res.status(403).json({ error: "Owner access required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenant_id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
