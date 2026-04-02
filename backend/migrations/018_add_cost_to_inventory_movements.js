export function up(knex) {
  return knex.schema.alterTable("inventory_movements", (t) => {
    // Costo total del lote comprado (solo aplica en movimientos tipo "in")
    t.decimal("cost", 10, 2).notNullable().defaultTo(0).after("quantity");
  });
}

export function down(knex) {
  return knex.schema.alterTable("inventory_movements", (t) => {
    t.dropColumn("cost");
  });
}
