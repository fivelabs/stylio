export function up(knex) {
  return knex.schema.createTable("tenants", (t) => {
    t.bigIncrements("id").primary();
    t.string("name", 150).notNullable();
    t.string("subdomain", 63).notNullable().unique();
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamps(true, true);

    t.index("subdomain", "idx_tenants_subdomain");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("tenants");
}
