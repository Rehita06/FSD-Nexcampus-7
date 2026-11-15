const CampusRecord = require('../models/CampusRecord');
const asyncHandler = require('../middleware/asyncHandler');
const { HttpError } = require('../middleware/errorHandler');
const { CATEGORY_IDS, AUDIENCE_IDS } = require('../constants');
const { resetToSamples } = require('../services/seedRecords');

const FIELDS = ['title', 'description', 'category', 'audience'];

function pickFields(body) {
  const data = {};
  for (const key of FIELDS) if (body && body[key] !== undefined) data[key] = body[key];
  return data;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/records?category=&audience=&q=
exports.getRecords = asyncHandler(async (req, res) => {
  const filter = {};
  const { category, audience, q } = req.query;
  if (category !== undefined) {
    if (!CATEGORY_IDS.includes(category)) throw new HttpError(400, `Unknown category "${category}"`);
    filter.category = category;
  }
  if (audience !== undefined) {
    if (!AUDIENCE_IDS.includes(audience)) throw new HttpError(400, `Unknown audience "${audience}"`);
    filter.audience = audience;
  }
  if (typeof q === 'string' && q.trim()) {
    const rx = { $regex: escapeRegex(q.trim()), $options: 'i' };
    filter.$or = [{ title: rx }, { description: rx }];
  }
  // Newest first, like the original localStorage version (new records were prepended).
  const records = await CampusRecord.find(filter).sort({ updatedAt: -1, _id: -1 });
  res.json(records);
});

// GET /api/records/:id
exports.getRecordById = asyncHandler(async (req, res) => {
  const record = await CampusRecord.findById(req.params.id);
  if (!record) throw new HttpError(404, 'Record not found');
  res.json(record);
});

// POST /api/records
exports.createRecord = asyncHandler(async (req, res) => {
  const record = await CampusRecord.create(pickFields(req.body));
  res.status(201).json(record);
});

// PUT /api/records/:id
exports.updateRecord = asyncHandler(async (req, res) => {
  const record = await CampusRecord.findById(req.params.id);
  if (!record) throw new HttpError(404, 'Record not found');
  record.set(pickFields(req.body));
  record.updatedAt = new Date();
  await record.save();
  res.json(record);
});

// DELETE /api/records/:id
exports.deleteRecord = asyncHandler(async (req, res) => {
  const record = await CampusRecord.findByIdAndDelete(req.params.id);
  if (!record) throw new HttpError(404, 'Record not found');
  res.json({ message: 'Record deleted successfully', id: req.params.id });
});

// POST /api/records/reset-samples  (Admin → "Reset samples")
exports.resetSamples = asyncHandler(async (req, res) => {
  const count = await resetToSamples();
  const records = await CampusRecord.find().sort({ updatedAt: -1, _id: -1 });
  res.json({ message: `Restored ${count} sample records`, records });
});
