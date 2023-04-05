const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name:{
    type: String
  },
  student_no:{
    type: Number
  },
  course:{
    type: String,
    enum:['BTECH','BCA','MCA']
  },
  year:{
    type: Number,
    enum:[1,2,3,4]
  },
  branch:{
    type: String,
    enum:['CSE','CS','CSIT','IT','AIML','CSE-AIML','CSE-DS','EN','MECH','CIVIL']
  },
  POR:{
    type:String,
    enum:['HOSTEL']
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
  },
  
});

const UserModel = mongoose.model("user",userSchema);

module.exports=UserModel;