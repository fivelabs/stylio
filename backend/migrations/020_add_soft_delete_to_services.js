export function up(knex) {
  return knex.schema.alterTable("services", (t) => {
    t.timestamp("deleted_at").nullable().defaultTo(null);
  });
}

export function down(knex) {
  return knex.schema.alterTable("services", (t) => {
    t.dropColumn("deleted_at");
  });
}
