const { ZodError } = require('zod');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      console.log(req[source]);
      const parsed = schema.parse(req[source] || {});
      req[source] = parsed; // overwrite with parsed data
      next();
    } catch (e) {
      console.log(e)
      if (e instanceof ZodError) {
        const err = new Error('Validation error');
        err.status = 400;
        err.details = e.errors;
        return next(err);
      }
      return next(e);
    }
  };
}

module.exports = { validate };
