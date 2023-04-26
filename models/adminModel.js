const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  uname:{
    type: String,
    unique: true
  },
  password: {
    type: String
  }
});

const UserModel = mongoose.model("admin",userSchema);

module.exports=UserModel;