// Integration tests: they talk to a real MongoDB-protocol server and use a throwaway database.
//   MONGODB_URI_TEST=mongodb://127.0.0.1:27017 npm test
// The database name is replaced with a unique nexcampus_test_<timestamp> and dropped afterwards.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { createApp } = require('../app');
const Student = require('../models/Student');
const CampusRecord = require('../models/CampusRecord');
const { seedSampleRecords } = require('../services/seedRecords');
const samples = require('../data/sampleRecords.json');

let server;
let base;
const testUrl = new URL(process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017');
const dbName = `nexcampus_test_${Date.now()}`;

async function api(method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, body: json };
}

const student = (over = {}) => ({
  name: 'Asha Menon',
  registerNumber: '2648001',
  course: 'MSc AIML',
  semester: 3,
  department: 'Computer Science',
  ...over,
});

before(async () => {
  testUrl.pathname = `/${dbName}`;
  const uri = testUrl.toString();
  await connectDB(uri);
  await Promise.all([Student.init(), CampusRecord.init()]);
  await new Promise((resolve) => {
    server = createApp().listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await new Promise((r) => server.close(r));
});

test('health endpoint reports a live database connection', async () => {
  const r = await api('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { status: 'ok', database: 'connected' });
});

// ---------- Students ----------
let created;

test('POST /api/students creates a student (201)', async () => {
  const r = await api('POST', '/api/students', student());
  assert.equal(r.status, 201);
  assert.equal(r.body.name, 'Asha Menon');
  assert.equal(r.body.semester, 3);
  assert.ok(r.body.id && r.body.createdAt);
  assert.equal(r.body._id, undefined);
  created = r.body;
});

test('student is actually in the database', async () => {
  assert.equal(await Student.countDocuments({ registerNumber: '2648001' }), 1);
});

test('POST trims name and register number', async () => {
  const r = await api('POST', '/api/students', student({ name: '  Ravi Kumar  ', registerNumber: '  2648002 ' }));
  assert.equal(r.status, 201);
  assert.equal(r.body.name, 'Ravi Kumar');
  assert.equal(r.body.registerNumber, '2648002');
});

test('POST rejects duplicate register number with 409', async () => {
  const r = await api('POST', '/api/students', student({ name: 'Someone Else' }));
  assert.equal(r.status, 409);
  assert.match(r.body.message, /already exists/i);
  assert.ok(r.body.errors.registerNumber);
  assert.equal(await Student.countDocuments({ registerNumber: '2648001' }), 1);
});

test('POST rejects missing required fields with field errors (400)', async () => {
  const r = await api('POST', '/api/students', { name: '   ' });
  assert.equal(r.status, 400);
  for (const f of ['name', 'registerNumber', 'course', 'semester', 'department']) assert.ok(r.body.errors[f], `missing error for ${f}`);
});

test('POST rejects invalid semester values', async () => {
  for (const semester of [0, 13, 2.5, 'abc']) {
    const r = await api('POST', '/api/students', student({ registerNumber: `X${String(semester)}`, semester }));
    assert.equal(r.status, 400, `semester ${semester}`);
    assert.ok(r.body.errors.semester);
  }
});

test('POST ignores unknown fields (no mass assignment)', async () => {
  const r = await api('POST', '/api/students', student({ name: 'Meera Nair', registerNumber: '2648003', isAdmin: true, _id: '507f1f77bcf86cd799439011' }));
  assert.equal(r.status, 201);
  assert.equal(r.body.isAdmin, undefined);
  assert.notEqual(r.body.id, '507f1f77bcf86cd799439011');
});

test('malformed JSON returns 400 not 500', async () => {
  const res = await fetch(`${base}/api/students`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
});

test('GET /api/students lists all students, newest first', async () => {
  const r = await api('GET', '/api/students');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body));
  assert.equal(r.body.length, 3);
  assert.equal(r.body[0].registerNumber, '2648003');
});

test('GET /api/students/search/:name is case-insensitive and partial', async () => {
  let r = await api('GET', '/api/students/search/ASHA');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.map((s) => s.name), ['Asha Menon']);
  r = await api('GET', '/api/students/search/ku');
  assert.deepEqual(r.body.map((s) => s.name), ['Ravi Kumar']);
  r = await api('GET', '/api/students/search/nobody');
  assert.deepEqual(r.body, []);
});

test('search treats regex characters literally', async () => {
  const r = await api('GET', `/api/students/search/${encodeURIComponent('.*')}`);
  assert.deepEqual(r.body, []);
});

test('GET /api/students/:id returns one student; unknown id is 404; bad id is 400', async () => {
  let r = await api('GET', `/api/students/${created.id}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.registerNumber, '2648001');
  r = await api('GET', '/api/students/507f1f77bcf86cd799439011');
  assert.equal(r.status, 404);
  r = await api('GET', '/api/students/not-an-id');
  assert.equal(r.status, 400);
});

test('PUT /api/students/:id updates and persists', async () => {
  const r = await api('PUT', `/api/students/${created.id}`, student({ semester: 4, department: 'Data Science' }));
  assert.equal(r.status, 200);
  assert.equal(r.body.semester, 4);
  const fromDb = await Student.findById(created.id);
  assert.equal(fromDb.department, 'Data Science');
});

test('PUT cannot steal another student\'s register number (409)', async () => {
  const r = await api('PUT', `/api/students/${created.id}`, student({ registerNumber: '2648002' }));
  assert.equal(r.status, 409);
  assert.equal((await Student.findById(created.id)).registerNumber, '2648001');
});

test('PUT with an empty required field is rejected (400)', async () => {
  const r = await api('PUT', `/api/students/${created.id}`, { name: '' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.name);
});

test('PUT unknown id is 404', async () => {
  const r = await api('PUT', '/api/students/507f1f77bcf86cd799439011', student());
  assert.equal(r.status, 404);
});

test('DELETE /api/students/:id removes the student; second delete is 404', async () => {
  let r = await api('DELETE', `/api/students/${created.id}`);
  assert.equal(r.status, 200);
  assert.equal(await Student.countDocuments({ _id: created.id }), 0);
  r = await api('DELETE', `/api/students/${created.id}`);
  assert.equal(r.status, 404);
});

// ---------- Campus records ----------
let record;

test('seeding inserts the 13 original samples exactly once', async () => {
  const first = await seedSampleRecords();
  assert.equal(first.seeded, true);
  assert.equal(await CampusRecord.countDocuments(), samples.length);
  const second = await seedSampleRecords(); // simulates a server restart
  assert.equal(second.seeded, false);
  assert.equal(await CampusRecord.countDocuments(), samples.length);
});

test('GET /api/records returns records in the frontend shape', async () => {
  const r = await api('GET', '/api/records');
  assert.equal(r.status, 200);
  assert.equal(r.body.length, samples.length);
  const rec = r.body[0];
  assert.deepEqual(Object.keys(rec).sort(), ['audience', 'category', 'description', 'id', 'title', 'updatedAt']);
  assert.equal(typeof rec.updatedAt, 'string');
});

test('GET /api/records filters by category, audience and text', async () => {
  let r = await api('GET', '/api/records?category=hostel');
  assert.ok(r.body.length >= 1 && r.body.every((x) => x.category === 'hostel'));
  r = await api('GET', '/api/records?audience=new-students');
  assert.ok(r.body.every((x) => x.audience === 'new-students'));
  r = await api('GET', '/api/records?q=CURFEW');
  assert.ok(r.body.length >= 1);
  r = await api('GET', '/api/records?category=bogus');
  assert.equal(r.status, 400);
});

test('POST /api/records creates a record', async () => {
  const r = await api('POST', '/api/records', {
    title: 'Parking permits',
    description: 'Vehicles on campus need a permit from the Administration Office.',
    category: 'general',
    audience: 'day-scholars',
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.category, 'general');
  record = r.body;
  assert.equal(await CampusRecord.countDocuments(), samples.length + 1);
});

test('POST /api/records validates input', async () => {
  let r = await api('POST', '/api/records', { title: 'ab', description: 'short', category: 'nope', audience: 'all' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.title && r.body.errors.description && r.body.errors.category);
  r = await api('POST', '/api/records', {});
  assert.equal(r.status, 400);
});

test('GET /api/records/:id, PUT and DELETE work and persist', async () => {
  let r = await api('GET', `/api/records/${record.id}`);
  assert.equal(r.body.title, 'Parking permits');

  r = await api('PUT', `/api/records/${record.id}`, {
    title: 'Parking permits (updated)',
    description: record.description,
    category: 'general',
    audience: 'all',
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.title, 'Parking permits (updated)');
  assert.ok(new Date(r.body.updatedAt) >= new Date(record.updatedAt));
  assert.equal((await CampusRecord.findById(record.id)).audience, 'all');

  r = await api('DELETE', `/api/records/${record.id}`);
  assert.equal(r.status, 200);
  assert.equal(await CampusRecord.countDocuments({ _id: record.id }), 0);
  assert.equal((await api('GET', `/api/records/${record.id}`)).status, 404);
  assert.equal((await api('GET', '/api/records/zzz')).status, 400);
});

test('POST /api/records/reset-samples restores the originals', async () => {
  await api('POST', '/api/records', { title: 'Temporary one', description: 'This will be wiped by reset.', category: 'library', audience: 'all' });
  await CampusRecord.deleteOne({ title: 'Minimum attendance requirement' });
  const r = await api('POST', '/api/records/reset-samples');
  assert.equal(r.status, 200);
  assert.equal(r.body.records.length, samples.length);
  assert.equal(await CampusRecord.countDocuments(), samples.length);
});

// ---------- Stats ----------
test('GET /api/stats is computed from real data', async () => {
  await Student.deleteMany({});
  await api('POST', '/api/students', student({ registerNumber: 'S1', name: 'A One', department: 'Physics' }));
  await api('POST', '/api/students', student({ registerNumber: 'S2', name: 'B Two', department: 'Physics' }));
  await api('POST', '/api/students', student({ registerNumber: 'S3', name: 'C Three', department: 'Chemistry' }));

  const r = await api('GET', '/api/stats');
  assert.equal(r.status, 200);
  assert.equal(r.body.totals.students, 3);
  assert.equal(r.body.totals.records, samples.length);
  assert.deepEqual(r.body.departmentDistribution, [
    { department: 'Physics', count: 2 },
    { department: 'Chemistry', count: 1 },
  ]);
  const catTotal = r.body.categoryDistribution.reduce((n, c) => n + c.count, 0);
  assert.equal(catTotal, samples.length);
  assert.equal(r.body.recentStudents.length, 3);
  assert.equal(r.body.recentStudents[0].registerNumber, 'S3');
});

test('unknown API route returns JSON 404', async () => {
  const r = await api('GET', '/api/nope');
  assert.equal(r.status, 404);
  assert.ok(r.body.message);
});
