export function up(knex) {
  return knex.schema.createTable("appointment_services", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("appointment_id").unsigned().notNullable();
    t.bigInteger("service_id").unsigned().notNullable();
    t.decimal("price", 10, 2).notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.foreign("appointment_id")
      .references("id")
      .inTable("appointments")
      .onDelete("CASCADE");

    t.foreign("service_id")
      .references("id")
      .inTable("services")
      .onDelete("RESTRICT");

    t.index(["appointment_id"]);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("appointment_services");
}
