export function up(knex) {
  return knex.schema.alterTable("inventory_items", (t) => {
    t.decimal("cost", 10, 2).notNullable().defaultTo(0).after("low_stock_threshold");
  });
}

export function down(knex) {
  return knex.schema.alterTable("inventory_items", (t) => {
    t.dropColumn("cost");
  });
}
