import { User } from "./User.js";
import { Role } from "../roles/Role.js";

export async function listUsers(req, res) {
  const users = await User.findAll({}, { orderBy: "first_name asc" });
  res.json(users.map(sanitize));
}

export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(sanitize(user));
}

export async function createUser(req, res) {
  const { email, password, first_name, last_name, role_id } = req.body;

  const existing = await User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const role = await Role.findById(role_id);
  if (!role) {
    return res.status(400).json({ error: "Role not found" });
  }

  const hashedPassword = await User.hashPassword(password);
  const user = await User.create({
    email,
    first_name,
    last_name,
    role_id,
    password: hashedPassword,
    is_owner: false,
    is_active: true,
  });

  res.status(201).json(sanitize(user));
}

export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.is_owner) {
    return res.status(403).json({ error: "Cannot modify the owner account" });
  }

  const updated = await User.update(user.id, req.body);
  res.json(sanitize(updated));
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.is_owner) {
    return res.status(403).json({ error: "Cannot delete the owner account" });
  }

  await User.update(user.id, { is_active: false });
  res.json({ message: "User deactivated" });
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}
