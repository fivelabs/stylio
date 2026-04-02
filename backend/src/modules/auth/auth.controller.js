import { db } from "../../config/database.js";
import { signToken, signRefreshToken, verifyRefreshToken } from "../../middleware/auth.js";
import { User } from "../users/User.js";
import { Tenant } from "../tenants/Tenant.js";
import { billingService } from "../billing/billing.service.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const valid = await User.verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = signToken(user);
  const refresh_token = signRefreshToken(user);
  res.json({ token, refresh_token, user: sanitize(user) });

  if (req.tenant) {
    billingService.syncSubscriptionStatus(req.tenant).catch(() => { });
  }
}

export async function register(req, res) {
  const { tenant_name, subdomain, email, password, first_name, last_name } = req.body;

  const existing = await Tenant.findOne({ subdomain });
  if (existing) {
    return res.status(409).json({ error: "El subdominio ya está en uso" });
  }

  const result = await db.transaction(async (trx) => {
    const [tenantId] = await trx("tenants").insert({
      name: tenant_name,
      subdomain,
      is_active: true,
    });

    const tenant = { id: tenantId, name: tenant_name, subdomain };
    const permissions = await trx("permissions").select("id");

    const [adminRoleId] = await trx("roles").insert({
      tenant_id: tenantId,
      name: "Administrador",
      is_default: false,
    });

    if (permissions.length > 0) {
      await trx("roles_permissions").insert(
        permissions.map((p) => ({ role_id: adminRoleId, permission_id: p.id }))
      );
    }

    const [staffRoleId] = await trx("roles").insert({
      tenant_id: tenantId,
      name: "Estilista",
      is_default: true,
    });

    const viewPerms = await trx("permissions")
      .whereIn("id", permissions.map((p) => p.id))
      .where("codename", "like", "view_%")
      .select("id");

    if (viewPerms.length > 0) {
      await trx("roles_permissions").insert(
        viewPerms.map((p) => ({ role_id: staffRoleId, permission_id: p.id }))
      );
    }

    const hashedPassword = await User.hashPassword(password);
    const [userId] = await trx("users").insert({
      email,
      first_name,
      last_name,
      tenant_id: tenantId,
      role_id: adminRoleId,
      password: hashedPassword,
      is_owner: true,
      is_active: true,
    });

    return {
      tenant,
      user: { id: userId, email, first_name, last_name, tenant_id: tenantId, role_id: adminRoleId },
    };
  });

  const token = signToken(result.user);
  const refresh_token = signRefreshToken(result.user);
  res.status(201).json({ token, refresh_token, tenant: result.tenant, user: sanitize(result.user) });
}

export async function refresh(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token requerido" });
  }

  try {
    const payload = verifyRefreshToken(refresh_token);
    const user = await User.findById(payload.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Usuario inválido o desactivado" });
    }

    const newToken = signToken(user);
    const newRefresh = signRefreshToken(user);
    res.json({ token: newToken, refresh_token: newRefresh, user: sanitize(user) });
  } catch {
    return res.status(401).json({ error: "Refresh token inválido o expirado" });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json({ user: sanitize(user) });
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}
