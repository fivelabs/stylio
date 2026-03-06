/**
 * Express middleware factory — validates req.body against a Zod schema.
 * On failure returns 400 with the first error message.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ error: message });
    }
    req.body = result.data;
    next();
  };
}
