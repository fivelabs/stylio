const STATUSES = ["requested", "verified", "completed", "cancelled"];

export function up(knex) {
  return knex.schema.alterTable("appointments", (t) => {
    t.enum("status", STATUSES).notNullable().defaultTo("requested").after("color");
  });
}

export function down(knex) {
  return knex.schema.alterTable("appointments", (t) => {
    t.dropColumn("status");
  });
}
