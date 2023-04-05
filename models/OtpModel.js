const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique:true
  },
  otp:{
    type: String,
    required: true
  }
},{timestamps: true});

otpSchema.index({createdAt: 1},{expireAfterSeconds: 300});

const UserModel = mongoose.model("otp",otpSchema);

module.exports=UserModel;