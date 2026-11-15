const mongoose = require('mongoose');

// Tiny key/value collection used for one-off markers (e.g. "sample records already seeded").
const metaSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true }, value: mongoose.Schema.Types.Mixed },
  { timestamps: true },
);

module.exports = mongoose.model('Meta', metaSchema);
