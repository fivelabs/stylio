export function up(knex) {
  return knex.schema.createTable("services", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("tenant_id").unsigned().notNullable();
    t.string("name", 150).notNullable();
    t.text("description").nullable();
    t.decimal("price", 10, 2).notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    t.index(["tenant_id", "name"]);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("services");
}
