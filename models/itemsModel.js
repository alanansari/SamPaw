const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const itemSchema = mongoose.Schema({
  user:{
    type:ObjectId,
    ref:'user'
  },
  name:{
    type: String
  },
  images:[{
    type: String
  }],
  description:{
    type:String
  },
  status:{
    type:String,
    enum:['PENDING','APPROVED','REJECTED'],
    default:'PENDING'
  }
});

const itemModel = mongoose.model("item",itemSchema);

module.exports = itemModel;