// Usage: npm run seed            -> seed once (no-op if already seeded)
//        npm run seed -- --reset -> replace all campus records with the original samples
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedSampleRecords, resetToSamples } = require('../services/seedRecords');

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    if (process.argv.includes('--reset')) {
      console.log(`Reset: ${await resetToSamples()} sample records restored`);
    } else {
      const r = await seedSampleRecords();
      console.log(r.seeded ? `Seeded ${r.count} sample records` : 'Already seeded - nothing to do');
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
