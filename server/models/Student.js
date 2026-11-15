const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters'],
      maxlength: [100, 'Student name must be at most 100 characters'],
    },
    registerNumber: {
      type: String,
      required: [true, 'Register number is required'],
      unique: true,
      trim: true,
      maxlength: [30, 'Register number must be at most 30 characters'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
      maxlength: [100, 'Course must be at most 100 characters'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 12'],
      max: [12, 'Semester must be between 1 and 12'],
      validate: { validator: Number.isInteger, message: 'Semester must be a whole number' },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department must be at most 100 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

studentSchema.index({ name: 1 });

module.exports = mongoose.model('Student', studentSchema);
