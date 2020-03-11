
const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  authId:   { type: String, index: { unique: true } },
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  userSchema
}
