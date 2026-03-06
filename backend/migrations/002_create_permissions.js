export function up(knex) {
  return knex.schema.createTable("permissions", (t) => {
    t.bigIncrements("id").primary();
    t.string("codename", 100).notNullable().unique();
    t.string("name", 255).notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("permissions");
}
