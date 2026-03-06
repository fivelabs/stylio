import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { TenantModel } from "../../core/Model.js";
import { db } from "../../config/database.js";

const scryptAsync = promisify(scrypt);

export class User extends TenantModel {
  static table = "users";

  static async findByEmail(email) {
    return this.findOne({ email });
  }

  static async findByEmailGlobal(email) {
    return db("users").where({ email }).first();
  }

  static async hashPassword(plain) {
    const salt = randomBytes(16).toString("hex");
    const derived = await scryptAsync(plain, salt, 64);
    return `${salt}:${derived.toString("hex")}`;
  }

  static async verifyPassword(plain, stored) {
    const [salt, hash] = stored.split(":");
    const derived = await scryptAsync(plain, salt, 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), derived);
  }
}
