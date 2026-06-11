const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // true for 1:1 direct-message rooms, false for public/group channels
    isDirect: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Public channel names are unique; direct rooms are matched by their members.
roomSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDirect: false } }
);

module.exports = mongoose.model('Room', roomSchema);
