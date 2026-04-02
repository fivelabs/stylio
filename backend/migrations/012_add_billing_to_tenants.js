export function up(knex) {
  return knex.schema.alterTable("tenants", (t) => {
    t.string("polar_customer_id", 255).nullable();
    t.string("polar_subscription_id", 255).nullable();
    // trialing | active | past_due | canceled | revoked
    t.string("subscription_status", 50).nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable("tenants", (t) => {
    t.dropColumn("polar_customer_id");
    t.dropColumn("polar_subscription_id");
    t.dropColumn("subscription_status");
  });
}
