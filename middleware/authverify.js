const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { ErrorHandler } = require("./errors");

const auth = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    // console.log(token);
    if (!token) return res.status(401).json({ msg: "Please login before proceeding any further !" });
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) return res.status(402).json({ msg: "Invalid Authentication" });

      req.user = user;
      next();
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const auth2 = (req,res,next) => {
  try{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    
    if(!token)
      return next(new ErrorHandler(401,"Please Login or Signup"));
    else{
      token = token.replace(/^Bearer\s+/, "");
      const verify = jwt.verify(token,process.env.JWT_TOKEN,async (err,payload)=>{
        if(err){
          return next(new ErrorHandler(400,"Invalid Authentication")); 
        }
        const {_id}=payload;
        const user = await User.findById(_id);
        if(!user) next(new ErrorHandler(404,"Failed to find user from token"));
        req.user=user;
        next();
      });
    }
  } catch(err){
      return next(err);
  }
}

module.exports = {auth,auth2};