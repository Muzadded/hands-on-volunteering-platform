export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        data: parsed.error.flatten(),
      });
    }

    req.validated = parsed.data;
    if (parsed.data.body) req.body = { ...req.body, ...parsed.data.body };
    if (parsed.data.params) req.params = { ...req.params, ...parsed.data.params };
    if (parsed.data.query) req.query = { ...req.query, ...parsed.data.query };
    next();
  };
}
