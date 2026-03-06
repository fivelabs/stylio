export function up(knex) {
  return knex.schema.createTable("roles", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable();
    t.string("name", 100).notNullable();
    t.boolean("is_default").notNullable().defaultTo(false);
    t.timestamps(true, true);

    t.unique(["tenant_id", "name"], { indexName: "unique_role_per_tenant" });
    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("roles");
}
