export function getCurrent(req, res) {
  const { tenant } = req;
  if (!tenant) {
    return res.status(400).json({ error: "No tenant in context" });
  }

  res.json({
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
  });
}
