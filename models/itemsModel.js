const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  images:[{
    type: String
  }],
  decription:{
    type:String
  }
});

const itemModel = mongoose.model("item",itemSchema);

module.exports = itemModel;