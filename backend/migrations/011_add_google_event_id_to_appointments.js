export function up(knex) {
  return knex.schema.table("appointments", (t) => {
    t.string("google_event_id", 255).nullable();
  });
}

export function down(knex) {
  return knex.schema.table("appointments", (t) => {
    t.dropColumn("google_event_id");
  });
}
