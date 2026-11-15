const mongoose = require('mongoose');

function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id) || String(req.params.id).length !== 24) {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  return next();
}

module.exports = validateObjectId;
