export function up(knex) {
  return knex.schema.createTable("preferences", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable();
    t.string("visible_name", 150).nullable();
    t.json("colors").nullable();
    t.string("logo_url", 2048).nullable();
    t.string("banner_horizontal_url", 2048).nullable();
    t.string("banner_vertical_url", 2048).nullable();
    t.timestamps(true, true);

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    t.unique("tenant_id");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("preferences");
}
