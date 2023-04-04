const mongoose = require("mongoose");
// const foodModel=require("foodModel");
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verify:{
    type:Boolean,
    required:false,
  },
  
});

const UserModel = mongoose.model("USER",userSchema);

module.exports=UserModel;