const User = require('../../models/User');

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  async findByPhone(phone) {
    return User.findOne({ phone }).select('+password');
  }

  async findById(id) {
    return User.findById(id).select('+password');
  }

  async findByFirebaseUid(uid) {
    return User.findOne({ firebaseUid: uid });
  }

  async findByResetToken(token, currentTime) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: currentTime },
    });
  }

  async create(userData) {
    return User.create(userData);
  }

  async save(userDocument) {
    return userDocument.save();
  }
}

module.exports = new AuthRepository();
