const Student = require('../models/Student');
const CampusRecord = require('../models/CampusRecord');
const asyncHandler = require('../middleware/asyncHandler');

function toDistribution(rows, keyName) {
  return rows
    .map((r) => ({ [keyName]: r._id, count: r.count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
}

// GET /api/stats — every number is computed from the database on each request.
exports.getStats = asyncHandler(async (req, res) => {
  const group = (field) => [{ $group: { _id: `$${field}`, count: { $sum: 1 } } }];

  const [students, records, byDepartment, byCategory, byAudience, recentStudents] = await Promise.all([
    Student.countDocuments(),
    CampusRecord.countDocuments(),
    Student.aggregate(group('department')),
    CampusRecord.aggregate(group('category')),
    CampusRecord.aggregate(group('audience')),
    Student.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    totals: { students, records },
    departmentDistribution: toDistribution(byDepartment, 'department'),
    categoryDistribution: toDistribution(byCategory, 'category'),
    audienceDistribution: toDistribution(byAudience, 'audience'),
    recentStudents,
  });
});
