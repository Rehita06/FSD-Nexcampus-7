const mongoose = require('mongoose');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralised error handling. Responses never include stack traces or driver internals.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = {};
    for (const [field, detail] of Object.entries(err.errors)) errors[field] = detail.message;
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    // e.g. semester: "abc"
    return res.status(400).json({ message: 'Validation failed', errors: { [err.path]: `Invalid value for ${err.path}` } });
  }

  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'registerNumber';
    const message =
      field === 'registerNumber' ? 'A student with this register number already exists' : `Duplicate value for ${field}`;
    return res.status(409).json({ message, errors: { [field]: message } });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  console.error('[error]', err);
  return res.status(500).json({ message: 'Something went wrong on the server' });
}

module.exports = { HttpError, notFound, errorHandler };
