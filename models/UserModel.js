const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHERS"],
  },
  student_no: {
    type: Number,
  },
  course: {
    type: String,
    enum: ["BTECH", "BCA", "MCA"],
  },
  year: {
    type: Number,
    enum: [1, 2, 3, 4],
  },
  branch: {
    type: String,
    enum: [
      "CSE",
      "CS",
      "CSIT",
      "IT",
      "AIML",
      "CSE-AIML",
      "CSE-DS",
      "EN",
      "MECH",
      "CIVIL",
      "ECE",
      "CSE-HINDI",
    ],
  },
  POR: {
    type: String,
    enum: ["BH1", "BH2", "BH3", "GH1", "GH2", "GH3", "DAYSCHOLAR"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  phone_no: {
    type: String,
    default: "0000000000",
  },
  phoneVerification: {
    type: Boolean,
    default: false,
  },
  items: [
    {
      type: ObjectId,
      ref: "item",
    },
  ],
  role: {
    type: String,
    enum: ["USER", "COLLECTOR"],
    default: "USER",
  },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
