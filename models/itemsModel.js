const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  name:{
    type: String,
    // required: true
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