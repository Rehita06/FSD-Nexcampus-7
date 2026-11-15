const CampusRecord = require('../models/CampusRecord');
const Meta = require('../models/Meta');
const samples = require('../data/sampleRecords.json');

const SEEDED_KEY = 'campusRecordsSeeded';

// Records are listed newest-first (updatedAt, then insertion order). Samples share one timestamp,
// so they are inserted in reverse to keep the original Lab 5 & 6 order on screen.
function toDocs() {
  return samples.map((s) => ({ ...s })).reverse();
}

// Inserts the original Lab 5 & 6 sample records exactly once per database.
// A marker document records that seeding happened, so records an admin later deletes
// are not resurrected on the next server restart, and restarts never duplicate samples.
async function seedSampleRecords() {
  await Meta.init(); // make sure the unique index on `key` exists before racing on it
  try {
    await Meta.create({ key: SEEDED_KEY, value: true });
  } catch (err) {
    if (err && err.code === 11000) return { seeded: false, reason: 'already seeded' };
    throw err;
  }
  try {
    const inserted = await CampusRecord.insertMany(toDocs());
    return { seeded: true, count: inserted.length };
  } catch (err) {
    await Meta.deleteOne({ key: SEEDED_KEY }); // let the next start retry
    throw err;
  }
}

// Replaces every record with the original samples (used by Admin → "Reset samples").
async function resetToSamples() {
  await CampusRecord.deleteMany({});
  const inserted = await CampusRecord.insertMany(toDocs());
  await Meta.updateOne({ key: SEEDED_KEY }, { $set: { value: true } }, { upsert: true });
  return inserted.length;
}

module.exports = { seedSampleRecords, resetToSamples };
