export function up(knex) {
  return knex.schema.alterTable("appointments", (t) => {
    t.dropColumn("service");
  });
}

export function down(knex) {
  return knex.schema.alterTable("appointments", (t) => {
    t.string("service", 150).notNullable().defaultTo("");
  });
}
