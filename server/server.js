require('dotenv').config();
const { connectDB } = require('./config/db');
const { createApp } = require('./app');
const { seedSampleRecords } = require('./services/seedRecords');
const Student = require('./models/Student');
const CampusRecord = require('./models/CampusRecord');

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  await connectDB(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  await Promise.all([Student.init(), CampusRecord.init()]); // build indexes (unique registerNumber)

  const seed = await seedSampleRecords();
  console.log(seed.seeded ? `Seeded ${seed.count} sample campus records` : 'Sample campus records already present - skipping seed');

  createApp().listen(PORT, () => console.log(`NexCampus API running on port ${PORT}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
