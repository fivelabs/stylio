export function up(knex) {
  return knex.schema.alterTable("tenants", (t) => {
    t.string("polar_checkout_id", 255).nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable("tenants", (t) => {
    t.dropColumn("polar_checkout_id");
  });
}
