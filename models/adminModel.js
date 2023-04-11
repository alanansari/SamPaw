const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name:{
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String
  },
  verify:{
    type:Boolean,
    default:false
  }
});

const UserModel = mongoose.model("user",userSchema);

module.exports=UserModel;