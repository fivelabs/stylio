export function up(knex) {
  return knex.schema.createTable("social_accounts", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("user_id").unsigned().notNullable();
    t.string("provider", 50).notNullable();
    t.string("provider_uid", 255).notNullable();
    t.json("extra_data").nullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    t.unique(["provider", "provider_uid"], { indexName: "unique_social_provider_uid" });
    t.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("social_accounts");
}
