export function up(knex) {
  return knex.schema.createTable("clients", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable();
    t.string("rut", 9).notNullable();
    t.string("first_name", 150).notNullable();
    t.string("last_name", 150).notNullable().defaultTo("");
    t.timestamps(true, true);

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    t.unique(["tenant_id", "rut"]);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("clients");
}
