export function up(knex) {
  return knex.schema.alterTable("clients", (t) => {
    t.string("rut", 9).nullable().alter();
    t.string("first_name", 150).nullable().alter();
    t.string("alias", 150).nullable().after("last_name"); // Instagram u otra referencia informal
  });
}

export function down(knex) {
  return knex.schema.alterTable("clients", (t) => {
    t.dropColumn("alias");
    t.string("rut", 9).notNullable().alter();
    t.string("first_name", 150).notNullable().alter();
  });
}
