const mongoose = require('mongoose');
const { CATEGORY_IDS, AUDIENCE_IDS } = require('../constants');

// Matches the CampusRecord interface in src/types.ts:
// id, title, description, category, audience, updatedAt.
const campusRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [4, 'Title must be at least 4 characters'],
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORY_IDS, message: 'Unknown category "{VALUE}"' },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      enum: { values: AUDIENCE_IDS, message: 'Unknown audience "{VALUE}"' },
      default: 'all',
    },
    // Id the record had in the original Lab 5 & 6 sample data (informational, set by the seeder only).
    seedKey: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.createdAt;
        delete ret.seedKey;
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      },
    },
  },
);

campusRecordSchema.index({ category: 1 });

module.exports = mongoose.model('CampusRecord', campusRecordSchema);
