const { ErrorHandler } = require("../middleware/errors");
const Admin = require('../models/adminModel');
const Item = require('../models/itemsModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const allstatus = require('../utils/allstatus');
const UserModel = require("../models/UserModel");
require('dotenv').config();



const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ADMIN_JWT_ACCESS_KEY, { expiresIn: "1d" });
};

const refreshToken =  (req, res,next) => {
    try {
        const rf_token = req.body.refreshtoken;
        if (!rf_token)
            return next(new ErrorHandler(400,"Please Login or Register"));

        jwt.verify(rf_token, process.env.ADMIN_JWT_REFRESH_KEY, (err, user) => {
            if (err) return next(new ErrorHandler(401,"Invalid Authentication"));

            const accesstoken = createAccessToken({ id: user._id });

            return res.status(200).json({ accesstoken });
        });
    } catch (err) {
        next(err);
    }
}

const login = async (req,res,next) => {
    try {
        const {uname,password} = req.body;

        if(!uname||!password)
            return next(new ErrorHandler(406,"uname and password input required"));
        
        const admin = await Admin.findOne({ uname });
        if (!admin) 
            return next(new ErrorHandler(404,"User Not Found"));
        
        const result = await bcrypt.compare(password, admin.password);
        if (!result) return next(new ErrorHandler(400,"Invalid Credentials"));
        
        const accessToken = createAccessToken({ id: admin._id });
        
        const refreshToken = jwt.sign({
            id: admin._id,
        }, process.env.ADMIN_JWT_REFRESH_KEY, { expiresIn: '1d' });
        return res.status(200).json({success:true, accessToken , refreshToken});

    } catch (err) {
        return next(err);
    }
}

const itemlist = async (req,res,next) => {
    try {
        const status = req.query.status || 'ALL';
        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;
        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;
        if(!status in allstatus)
            return next(new ErrorHandler(406,'Invalid status value'));
        if(status!='ALL'){
            let items = await Item.find({
                status
            }).skip(page*limit).limit(limit).populate('user',{password:0,items:0});
            return res.status(200).json({success:true,items});
        }else{
            const items = await Item.find().skip(page*limit).limit(limit).populate('user',{password:0,items:0});
            return res.status(200).json({success:true,items});
        }
    } catch (err) {
        return next(err);
    }
}

const changeStatus = async (req,res,next) => {
    try {
        const {itemId} = req.params;
        const {status} = req.body;
        if(!status)
            return next(new ErrorHandler(400,"Input required -> status"));
        if(allstatus.includes(status)===false)
            return next(new ErrorHandler(406,`Invalid status value : can only be ${[...allstatus]}`));
        const updateStatus = await Item.updateOne({_id:itemId},{
            status
        });
        
        return res.status(200).json({success:true,msg:`Updated item status to ${status}`});
    } catch (err) {
        return next(err);
    }
}
const toggleCollector = async (req,res,next) => {
    try{
        const {email} = req.body;
        if(!email)
        return next(new ErrorHandler(400,"Input required -> email"));
        const user = await UserModel.findOne({email:email});
        if(!user)
        return next(new ErrorHandler(400,"User Does Not Exist"));
        if(user.role==='COLLECTOR'){
            user.role='USER';
            await user.save();
            return res.status(200).json({success:true,msg:'Converted to USER role'});
        }
        else{
            user.role='COLLECTOR';
            await user.save();
            return res.status(200).json({success:true,msg:'Converted to COLLECTOR role'});
        }
        
    } catch(err) {
        return next(err);
    }
}

// const collect = async (req,res,next) => {
//     try{
//         const {itemId} = req.body;
//         if(!itemId)
//         return next(new ErrorHandler(400,"Input required -> itemId"));
//         const item = await Item.findById({_id:itemId});
//         if(item.status=='COLLECTED' && item) 
//     } catch(err) {
//         return next(err);
//     }
// }

// const create = async (req,res,next) => {
//     try {
//         const {uname,password} = req.body;
//         if(!uname||!password)
//             return next(new ErrorHandler(406,"All input fields required -> uname,password"))
//         const encryptedPassword = await bcrypt.hash(password, 12);
//         const admin = await Admin.create({
//             uname,
//             password:encryptedPassword
//         });
//         if(admin)
//             return res.status(200).json({success:true,msg:`Admin created : ${admin.uname}`});
//     } catch (err) {
//         return next(err);
//     }
// }
// const astatus = "PENDING1"
// console.log(`Invalid status value : can only be ${[...allstatus]}`);


module.exports = {
    refreshToken,
    login,
    itemlist,
    // create,
    changeStatus,
    toggleCollector
}


// Admin Side: To see the highest donator
// Admin Side: To see all the items and their history of donation and all