const { ErrorHandler } = require("../middleware/errors");
const {User,Admin,Item} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const allstatus = require('../utils/allstatus');
require('dotenv').config();



const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ADMIN_JWT_ACCESS_KEY, { expiresIn: process.env.ADMIN_JWT_ACCESS_EXP });
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
        }, process.env.ADMIN_JWT_REFRESH_KEY, { expiresIn: process.env.ADMIN_JWT_REFRESH_EXP });
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
        if(!allstatus.includes(status))
            return next(new ErrorHandler(406,'Invalid status value'));
        let items =  (status!=='ALL') ? await Item.aggregate([
                {
                  $match: {
                    status: status
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
              ])
              : await Item.aggregate([
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

            const totalCount = items.length > 0 ? items[0].count : 0;
            const paginatedResults = items.length > 0 ? items[0].results : [];
            return res.status(200).json({success:true,pages:Math.ceil(totalCount/limit)||0,items:paginatedResults});
        
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
        if(allstatus.includes(status)===false && status!='ALL')
            return next(new ErrorHandler(406,`Invalid status value : can only be ${[...allstatus]}`));
        const updateStatus = await Item.findByIdAndUpdate(itemId,{
            status
        });
        if(!updateStatus)
            return next(new ErrorHandler(404,'Item not found'));
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
        const user = await User.findOne({email:email});
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

const seeAllUsers = async (req,res,next) => {
    try {
        const role = req.query.role || 'ALL';

        if(role!='USER'&&role!='COLLECTOR'&&role!='ALL')
            return next(new ErrorHandler(400,"Invalid role must be -> USER or COLLECTOR or ALL"));

        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;
        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;

        let users = (role==='ALL')?
        await User.aggregate([
            {
              $facet: {
                count: [
                  { $count: "total" }
                ],
                results: [
                  { $skip: page * limit },
                  { $limit: limit },
                  { $project: { password: 0, items: 0 } }
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
          ]):
        await User.aggregate([
            {
              $match: {
                role: role
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
                  { $project: { password: 0, items: 0 } }
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
        
          const totalCount = users.length > 0 ? users[0].count : 0;
        const paginatedResults = users.length > 0 ? users[0].results : [];

        return res.status(200).json({success:true,pages:Math.ceil(totalCount/limit),users:paginatedResults});

    } catch (err) {
        return next(err);
    }
} 

const allCollectedItems = async (req,res,next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;
        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;
        const items = await await Item.aggregate([
            // Match the desired conditions using $match and $regex
            {
              $match: {
                status: { $regex: /^COLLECTED_.*$/ }
              }
            },
            // Count the total documents
            {
              $facet: {
                count: [
                  { $count: "total" }
                ],
                results: [
                  // Apply pagination
                  { $skip: page * limit },
                  { $limit: limit },
                  // Populate the 'user' field while excluding 'password' and 'items'
                  { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                  { $unwind: "$user" },
                  { $project: { "user.password": 0, "user.items": 0 } }
                ]
              }
            },
            // Unwind the count facet and project the result
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
        const totalCount = items.length > 0 ? items[0].count : 0;
        const paginatedResults = items.length > 0 ? items[0].results : [];
        res.status(200).json({success:true,pages:Math.ceil(totalCount/limit),items:paginatedResults});
    } catch (err) {
        next(err);
    }
}

const highestDonor = async (req,res,next) => {
    try {
        const topDonors = await User.aggregate([
            {
              $lookup: {
                from: "items",
                localField: "items",
                foreignField: "_id",
                as: "populatedItems"
              }
            },
            {
              $addFields: {
                donated_count: {
                  $size: {
                    $filter: {
                      input: "$populatedItems",
                      as: "item",
                      cond: { $eq: ["$$item.status", "DONATED"] }
                    }
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                name: 1,
                email: 1,
                donated_count: 1
              }
            },
            {
              $sort: {
                donated_count: -1
              }
            },
            {
              $limit: 5
            }
          ]);          
        res.status(200).json({success:true,topDonors});
    } catch (err) {
        next(err);
    }
}

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


module.exports = {
    refreshToken,
    login,
    itemlist,
    // create,
    changeStatus,
    toggleCollector,
    seeAllUsers,
    allCollectedItems,
    highestDonor,
}


// Admin Side: To see the highest donator
// Admin Side: To see all the items and their history of donation and all