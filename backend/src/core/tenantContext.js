import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

export function runWithTenant(tenant, fn) {
  return storage.run(tenant, fn);
}

export function getCurrentTenant() {
  return storage.getStore() || null;
}
