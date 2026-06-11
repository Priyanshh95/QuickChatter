const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash — never store plaintext passwords
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '👤',
    },
  },
  { timestamps: true }
);

// Never leak the password hash when a user document is serialized to JSON
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
