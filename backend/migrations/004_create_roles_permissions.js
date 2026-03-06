export function up(knex) {
  return knex.schema.createTable("roles_permissions", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("role_id").unsigned().notNullable();
    t.bigInteger("permission_id").unsigned().notNullable();

    t.unique(["role_id", "permission_id"], { indexName: "unique_role_permission" });
    t.foreign("role_id").references("id").inTable("roles").onDelete("CASCADE");
    t.foreign("permission_id").references("id").inTable("permissions").onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("roles_permissions");
}
