export function up(knex) {
  return knex.schema.createTable("users", (t) => {
    t.bigIncrements("id").primary();
    t.string("email", 254).notNullable().unique();
    t.string("password", 255).notNullable().defaultTo("");
    t.string("first_name", 150).notNullable().defaultTo("");
    t.string("last_name", 150).notNullable().defaultTo("");
    t.bigInteger("tenant_id").unsigned().nullable();
    t.bigInteger("role_id").unsigned().nullable();
    t.boolean("is_owner").notNullable().defaultTo(false);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.boolean("is_staff").notNullable().defaultTo(false);
    t.boolean("is_superuser").notNullable().defaultTo(false);
    t.timestamp("date_joined").notNullable().defaultTo(knex.fn.now());

    t.foreign("tenant_id").references("id").inTable("tenants").onDelete("CASCADE");
    t.foreign("role_id").references("id").inTable("roles").onDelete("SET NULL");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("users");
}
