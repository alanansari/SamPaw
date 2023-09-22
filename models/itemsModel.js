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
    enum: ['PENDING','APPROVED',
    'COLLECTED_BH1','COLLECTED_BH2','COLLECTED_BH3',
    'COLLECTED_GH1','COLLECTED_GH2','COLLECTED_GH3',
    'COLLECTED_AKG','REJECTED','DONATED'],
    default:'PENDING'
  },
  acceptedBy: {
    name: {
      type: String,
      validate: {
        validator: function(value) {
          // Custom validation function to check if 'name' is required when 'acceptedBy' is present
          return !this.acceptedBy || (this.acceptedBy && value);
        },
        message: "Name is required when 'acceptedBy' is provided."
      }
    },
    email: {
      type: String
    }
  }
});

itemSchema.index({ name: 'text' });

const itemModel = mongoose.model("item",itemSchema);

module.exports = itemModel;