export function up(knex) {
  return knex.schema.createTable("google_integrations", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable().unique();
    t.bigInteger("user_id").unsigned().notNullable();
    t.text("access_token").notNullable();
    t.text("refresh_token").notNullable();
    t.datetime("token_expiry").notNullable();
    t.string("google_email", 255).notNullable();
    t.string("calendar_id", 255).notNullable().defaultTo("primary");
    t.string("watch_channel_id", 255).nullable();
    t.string("watch_resource_id", 255).nullable();
    t.datetime("watch_expiry").nullable();
    t.text("sync_token").nullable();
    t.timestamps(true, true);

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("google_integrations");
}
