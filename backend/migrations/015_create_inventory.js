export function up(knex) {
  return knex.schema
    .createTable("inventory_items", (t) => {
      t.bigIncrements("id").primary();
      t.bigInteger("tenant_id").unsigned().notNullable();
      t.string("name", 150).notNullable();
      t.text("description").nullable();
      t.string("unit", 30).notNullable().defaultTo("unidades"); // ml, g, unidades, pares, etc.
      t.decimal("stock", 10, 2).notNullable().defaultTo(0);
      t.decimal("low_stock_threshold", 10, 2).nullable(); // alerta stock bajo
      t.timestamps(true, true);

      t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
      t.index(["tenant_id", "name"]);
    })
    .createTable("inventory_movements", (t) => {
      t.bigIncrements("id").primary();
      t.bigInteger("tenant_id").unsigned().notNullable();
      t.bigInteger("item_id").unsigned().notNullable();
      t.enum("type", ["in", "out"]).notNullable(); // entrada / salida
      t.decimal("quantity", 10, 2).notNullable();
      t.decimal("stock_after", 10, 2).notNullable(); // snapshot del stock resultante
      t.string("note", 300).nullable();
      t.timestamp("created_at").defaultTo(knex.fn.now());

      t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
      t.foreign("item_id").references("id").inTable("inventory_items").onDelete("CASCADE");
      t.index(["item_id", "created_at"]);
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("inventory_movements")
    .dropTableIfExists("inventory_items");
}
