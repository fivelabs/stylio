import { db } from "../../config/database.js";
import { signToken } from "../../middleware/auth.js";
import { User } from "../users/User.js";
import { Tenant } from "../tenants/Tenant.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await User.verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  res.json({ token, user: sanitize(user) });
}

export async function register(req, res) {
  const { tenant_name, subdomain, email, password, first_name, last_name } = req.body;

  const existing = await Tenant.findOne({ subdomain });
  if (existing) {
    return res.status(409).json({ error: "Subdomain already taken" });
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
  res.status(201).json({ token, tenant: result.tenant, user: sanitize(result.user) });
}

export async function me(req, res) {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: sanitize(user) });
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}
