import { TenantModel } from "../../core/Model.js";
import { db } from "../../config/database.js";

export class Role extends TenantModel {
  static table = "roles";

  static async getPermissions(roleId) {
    return db("permissions")
      .join("roles_permissions", "permissions.id", "roles_permissions.permission_id")
      .where("roles_permissions.role_id", roleId)
      .select("permissions.*");
  }

  static async setPermissions(roleId, permissionIds) {
    await db.transaction(async (trx) => {
      await trx("roles_permissions").where({ role_id: roleId }).del();
      if (permissionIds.length > 0) {
        await trx("roles_permissions").insert(
          permissionIds.map((pId) => ({ role_id: roleId, permission_id: pId }))
        );
      }
    });
  }

  static async hasPerm(roleId, codename) {
    const row = await db("permissions")
      .join("roles_permissions", "permissions.id", "roles_permissions.permission_id")
      .where({ "roles_permissions.role_id": roleId, "permissions.codename": codename })
      .first();
    return !!row;
  }
}
