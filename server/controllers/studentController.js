const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const { HttpError } = require('../middleware/errorHandler');

const FIELDS = ['name', 'registerNumber', 'course', 'semester', 'department'];

// Only whitelisted fields are copied from the request body.
function pickFields(body) {
  const data = {};
  for (const key of FIELDS) {
    if (body && body[key] !== undefined) {
      data[key] = body[key];
    }
  }
  return data;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/students
exports.createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(pickFields(req.body));
  res.status(201).json(student);
});

// GET /api/students
exports.getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

// GET /api/students/search/:name  (case-insensitive, partial match)
exports.searchStudents = asyncHandler(async (req, res) => {
  const term = String(req.params.name || '').trim();
  if (!term) return res.json([]);
  const students = await Student.find({ name: { $regex: escapeRegex(term), $options: 'i' } }).sort({ name: 1 });
  return res.json(students);
});

// GET /api/students/:id
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  res.json(student);
});

// PUT /api/students/:id
exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  const data = pickFields(req.body);
  if (typeof data.registerNumber === 'string' && data.registerNumber.trim()) {
    // Friendly pre-check; the unique index (handled in errorHandler as 409) still guards against races.
    const clash = await Student.exists({ registerNumber: data.registerNumber.trim(), _id: { $ne: student._id } });
    if (clash) {
      const message = 'A student with this register number already exists';
      return res.status(409).json({ message, errors: { registerNumber: message } });
    }
  }
  student.set(data);
  await student.save();
  res.json(student);
});

// DELETE /api/students/:id
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  res.json({ message: 'Student deleted successfully', id: req.params.id });
});
