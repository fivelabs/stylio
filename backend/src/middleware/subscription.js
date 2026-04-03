// Billing deshabilitado temporalmente — todos los tenants tienen acceso libre
export function requireActiveSubscription(_req, _res, next) {
  next();
}
