const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Admin = require("../models/adminModel");
const { ErrorHandler } = require("./errors");

const auth = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    // console.log(token);
    if (!token) return res.status(401).json({ msg: "Please Login or Signup" });
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.JWT_ACCESS_KEY, async (err, payload) => {
      if(err){
        return next(new ErrorHandler(401,"Invalid Authentication")); 
      }
      const {id}=payload;
      const user = await User.findById(id);
      if(!user) next(new ErrorHandler(401,"Invalid Authentication"));
      req.user=user;
      next();
    })
  } catch (err) {
    return next(err);
  }
};

const auth2 = (req,res,next) => {
  try{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    
    if(!token&&!token.startsWith('Bearer'))
      return next(new ErrorHandler(401,"Please Login or Signup"));
    else{
      token = token.replace(/^Bearer\s+/, "");
      jwt.verify(token,process.env.JWT_TOKEN, async (err,payload)=>{
        if(err){
          return next(new ErrorHandler(401,"Invalid Authentication")); 
        }
        const {_id}=payload;
        const user = await User.findById(_id);
        if(!user) next(new ErrorHandler(401,"Invalid Authentication"));
        req.user=user;
        next();
      });
    }
  } catch(err){
      return next(err);
  }
}

const adminauth = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    // console.log(token);
    if (!token) return res.status(401).json({ msg: "Please Login or Signup" });
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.ADMIN_JWT_ACCESS_KEY, async (err, payload) => {
      if(err){
        return next(new ErrorHandler(401,"Invalid Authentication")); 
      }
      const {id}=payload;
      const user = await Admin.findById(id);
      if(!user) next(new ErrorHandler(401,"Invalid Authentication"));
      req.user=user;
      next();
    })
  } catch (err) {
    return next(err);
  }
};

module.exports = {auth,auth2,adminauth};