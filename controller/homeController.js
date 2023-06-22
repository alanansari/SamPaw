require('dotenv').config();
const {Item, User} = require("../models");
const { ErrorHandler } = require('../middleware/errors');
const {validatemail,validatepass} = require('../utils/validation');
const { Types } = require('mongoose');
const cloudinary = require('cloudinary').v2;
const {userSchema} = require ('../utils/joiValidations')
const bcrypt = require('bcrypt')

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
  });

const createItem = async (req,res,next) => {
   
    try {

        const {name , description } = req.body;
        const user = req.user;
       
        if(!name){
            return next(new ErrorHandler(406,"Name required"));
        }

        
        let files = req.files ? req.files.files : null;
        let images=[];
        let Promises = [];

        isArr = Object.prototype.toString.call(files) == '[object Array]';
        if(!isArr){
            files=[];
            files.push(req.files.files);
        }


        for(const file of files){
            let image=null;
            if(file){
                Promises.push(cloudinary.uploader.upload(file.tempFilePath,{
                    public_id: `${Date.now()}`,
                    resource_type:'image',
                    allowed_formats:['jpg','png'],
                    folder:'images',
                    width: 2000, height: 1000, crop: "limit" 
                },(err,result)=>{
                    // if (err) return res.status(500).send("upload image error");
                    if (err) return next(new ErrorHandler(500,"Upload Image Error(ONLY JPG AND PNG ALLOWED)"));
                    image = result.secure_url
                    // console.log((result));
                    images.push(image);
                }));
            }
        }
        await Promise.all(Promises);


        const item =  await Item.create({
            user:user._id,
            name,
            description,
            images:images
        });

        let userItems = user.items;
        userItems.push(item._id);
        user.items = userItems;
        await user.save();
        
        return res.status(201).json({success:true, msg:"Item Created"})
    } catch (err) {
        return next(err);
    }
}

const getCollectedItems = async (req,res,next) => {
    try {

        const user = req.user;
        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;

        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;

        const items = await Item.aggregate([
            {
              $match: {
                status: 'COLLECTED_AKG',
                user: { $ne: user._id }
              }
            },
            {
              $facet: {
                count: [
                  { $count: "total" }
                ],
                results: [
                  { $skip: page * limit },
                  { $limit: limit },
                  { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                  { $unwind: "$user" },
                  { $project: { "user.password": 0, "user.items": 0 } }
                ]
              }
            },
            {
              $unwind: "$count"
            },
            {
              $project: {
                results: 1,
                count: "$count.total"
              }
            }
          ]);

        return res.status(200).json({success:true, pages:Math.ceil(items[0].count/limit), items:items[0].results});
    } catch (err) {
        return next(err)
    }
}

const getMyItems = async (req,res,next) => {
    try {
        const user = req.user;
        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;

        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;

        const items = await Item.find({_id:{$in:user.items}})
                            .skip(page*limit).limit(limit);

        return res.status(200).json({success:true, items});                    

    } catch (err) {
        return next(err);
    }
}


const searchItems = async (req,res,next) => {
    try {
      const find = req.query.find || "";
      let page = parseInt(req.query.page) || 1;
      let limit  = parseInt(req.query.limit) || 10;

      if(page<=0) page = 1;
      page = page - 1;
      if(limit<0) limit = 0;

      const regexQuery = find
      .split(' ')
      .map(term => `${term}*`)
      .join(' ');

      const results = await Item.find({
                              $text: { $search: regexQuery },
                              status: 'COLLECTED_AKG'
                            },
                            { score: { $meta: 'textScore' }, _id: 1, name: 1, description: 1 })
                            .sort({ score: { $meta: 'textScore' } })
                            .skip(page * limit)
                            .limit(limit);
      return res.status(200).json({success:true,items:results})
    } catch (err) {
        next(err);
    }
}

const updateUser = async (req,res,next) => {
  try {
    const body = await userSchema.validateAsync(req.body);
    body.password = await bcrypt.hash(body.password, 12);
    await User.findByIdAndUpdate(body.id ,body)

    return res.status(200).json({success:true,msg:"Updated User"});
  } catch (err) {
    next(err);
  }
}

module.exports = {
    createItem,
    getCollectedItems,
    getMyItems,
    searchItems,
    updateUser
}