require('dotenv').config();
const User = require("../models/UserModel");
const Items = require("../models/itemsModel");

const { ErrorHandler } = require('../middleware/errors');
const {validatemail,validatepass} = require('../utils/validation');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
  });

const createPost = async (req,res,next) => {
   
    try {

        const {name , description } = req.body;
       
        if(!name){
            return next(new ErrorHandler(406,"Name required"));
        }

        let files = req.files ? req.files.files : null;
        let images=[];
        for(const file of files){
        let image=null;
        if(file){
            await cloudinary.uploader.upload(file.tempFilePath,{
                public_id: `${Date.now()}`,
                resource_type:'image',
                folder:'images',
                width: 2000, height: 1000, crop: "limit" 
            },(err,result)=>{
                // if (err) return res.status(500).send("upload image error");
                if (err) return next(new ErrorHandler(500,"Upload Image Error"));
                image = result.secure_url
                console.log((result));
                images.push(image);
            });
            
        }
    }
        await Items.create({
            name,
            description,
            images:images
        })
        
        return res.status(201).json({success:true, msg:"Item Created"})
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createPost
}