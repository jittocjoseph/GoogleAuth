const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  profileImage: String,
});

module.exports = mongoose.model('User', userSchema);
