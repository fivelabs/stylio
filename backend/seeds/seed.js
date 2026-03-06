import { User } from "../src/modules/users/User.js";
import { runWithTenant } from "../src/core/tenantContext.js";

const DEFAULT_PERMISSIONS = [
  ["manage_appointments", "Gestionar citas"],
  ["view_appointments", "Ver citas"],
  ["manage_clients", "Gestionar clientes"],
  ["view_clients", "Ver clientes"],
  ["manage_services", "Gestionar servicios"],
  ["view_services", "Ver servicios"],
  ["manage_staff", "Gestionar personal"],
  ["view_reports", "Ver reportes"],
];

const TENANTS = [
  { name: "Lash By Gyal", subdomain: "lashbygyal" },
  { name: "Protected Environment", subdomain: "admin" },
];

export async function seed(knex) {
  const permissions = [];
  for (const [codename, name] of DEFAULT_PERMISSIONS) {
    const existing = await knex("permissions").where({ codename }).first();
    if (existing) {
      permissions.push(existing);
    } else {
      const [id] = await knex("permissions").insert({ codename, name });
      permissions.push({ id, codename, name });
    }
  }

  const password = await User.hashPassword("test123");

  for (const data of TENANTS) {
    const [tenantId] = await knex("tenants").insert({ ...data, is_active: true });
    const tenant = { id: tenantId, ...data };

    await runWithTenant(tenant, async () => {
      const [adminRoleId] = await knex("roles").insert({
        tenant_id: tenant.id,
        name: "Administrador",
        is_default: false,
      });
      await knex("roles_permissions").insert(
        permissions.map((p) => ({ role_id: adminRoleId, permission_id: p.id }))
      );

      const viewPerms = permissions.filter((p) => p.codename.startsWith("view_"));
      const [stylistRoleId] = await knex("roles").insert({
        tenant_id: tenant.id,
        name: "Estilista",
        is_default: true,
      });
      await knex("roles_permissions").insert(
        viewPerms.map((p) => ({ role_id: stylistRoleId, permission_id: p.id }))
      );

      await knex("users").insert({
        email: `owner@${data.subdomain}.test`,
        first_name: "Owner",
        last_name: data.name,
        tenant_id: tenant.id,
        role_id: adminRoleId,
        password,
        is_owner: true,
        is_active: true,
      });

      for (let i = 1; i <= 3; i++) {
        await knex("users").insert({
          email: `staff${i}@${data.subdomain}.test`,
          first_name: `Staff ${i}`,
          last_name: data.name,
          tenant_id: tenant.id,
          role_id: stylistRoleId,
          password,
          is_owner: false,
          is_active: true,
        });
      }

      console.log(`Database seeded for ${tenant.name} (${tenant.subdomain})`);
    });
  }
}
