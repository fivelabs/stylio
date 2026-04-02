const TENANT_SUBDOMAIN = "lashbygyal";

const FIRST_NAMES = [
  "Valentina", "Camila", "Sofía", "Isabella", "Javiera",
  "Fernanda", "Catalina", "Daniela", "Constanza", "Josefina",
  "Antonia", "Francisca", "Martina", "Carolina", "Andrea",
  "Alejandra", "Natalia", "Verónica", "Paulina", "Claudia",
  "Bárbara", "Lorena", "Patricia", "Macarena", "Carla",
  "Karla", "Gabriela", "Mónica", "Rocío", "Pamela",
  "Stephanie", "Nicole", "Valeria", "Pilar", "María José",
  "Ana Paula", "Luz María", "María Paz", "Paloma", "Renata",
];

const LAST_NAMES = [
  "González", "Muñoz", "Rodríguez", "López", "Martínez",
  "García", "Reyes", "Flores", "Morales", "Fernández",
  "Díaz", "Ramírez", "Pérez", "Torres", "Soto",
  "Contreras", "Silva", "Rojas", "Vargas", "Castillo",
  "Fuentes", "Ortiz", "Núñez", "Miranda", "Ramos",
  "Cruz", "Carrasco", "Herrera", "Espinoza", "Vega",
  "Castro", "Medina", "Pinto", "Aguilera", "Vergara",
  "Cárdenas", "Salinas", "Gutiérrez", "Araya", "Navarrete",
];

function calcDv(n) {
  let sum = 0;
  let mult = 2;
  let num = n;
  while (num > 0) {
    sum += (num % 10) * mult;
    num = Math.floor(num / 10);
    mult = mult === 7 ? 2 : mult + 1;
  }
  const rem = 11 - (sum % 11);
  if (rem === 11) return "0";
  if (rem === 10) return "K";
  return String(rem);
}

function buildRut(n) {
  return `${n}${calcDv(n)}`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function seed(knex) {
  const tenant = await knex("tenants").where({ subdomain: TENANT_SUBDOMAIN }).first();
  if (!tenant) {
    console.warn(`Tenant "${TENANT_SUBDOMAIN}" not found — run base seed first.`);
    return;
  }

  await knex("clients").where({ tenant_id: tenant.id }).delete();

  const startRut = 8_000_000;
  const usedRuts = new Set();
  const usedNames = new Set();
  const rows = [];

  const dateFrom = new Date("2023-01-01");
  const dateTo = new Date("2026-03-01");

  while (rows.length < 80) {
    const rutNum = startRut + Math.floor(Math.random() * 7_000_000);
    if (usedRuts.has(rutNum)) continue;
    usedRuts.add(rutNum);

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const key = `${firstName}|${lastName}`;
    if (usedNames.has(key)) continue;
    usedNames.add(key);

    const createdAt = randomDate(dateFrom, dateTo);

    rows.push({
      tenant_id: tenant.id,
      rut: buildRut(rutNum),
      first_name: firstName,
      last_name: lastName,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  rows.sort((a, b) => a.first_name.localeCompare(b.first_name, "es"));

  await knex("clients").insert(rows);

  console.log(`Seeded ${rows.length} clients for "${TENANT_SUBDOMAIN}"`);
}
