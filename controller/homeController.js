require('dotenv').config();
const User = require("../models/UserModel");
const Items = require("../models/itemsModel");

const { ErrorHandler } = require('../middleware/errors');
const {validatemail,validatepass} = require('../utils/validation');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
  });

const createPost = async (req,res,next) => {
   
    try {

        const {name , description } = req.body;
       
        if(!name){
            return next(new ErrorHandler(406,"Name required"));
        }

        let file = req.files ? req.files.file : null;
        let image=null;
        if(file){
            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                public_id: `${Date.now()}`,
                resource_type:'image',
                folder:'images'
            });
            image = result.secure_url
            console.log((result));
            
        }
        await Items.create({
            name,
            description,
            images:image
        })
        
        return res.status(201).json({success:true, msg:"Item Created"})
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createPost
}