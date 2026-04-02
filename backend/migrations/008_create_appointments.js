export function up(knex) {
  return knex.schema.createTable("appointments", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable();
    t.string("title", 150).notNullable();
    t.string("service", 150).notNullable();
    t.datetime("start_at").notNullable();
    t.datetime("end_at").notNullable();
    t.string("color", 20).notNullable().defaultTo("brand");
    t.text("notes").nullable();
    t.timestamps(true, true);

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    t.index(["tenant_id", "start_at"]);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("appointments");
}
