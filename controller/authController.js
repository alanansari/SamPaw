const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const home = async (req,res,next) => {
    const data = {message:"Hello"};
    try {
        res.json(data);
    } catch (err) {
        next(err)
    }
}

const login = async (req, res) => {
    // Destructuring username & password from body
    let { email, password } = req.body;
    email = email.toLowerCase();
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("No user found!");
    if (!user.verify) throw new Error("User Not Verified");
    const result = await bcrypt.compare(password, user.password);
    if (!result) throw new Error("Invalid credentials!");
    else{
        //creating a access token

        const accessToken = createAccessToken({ id: user._id });
        // Creating refresh token not that expiry of refresh 
        //token is greater than the access token
        
        const refreshToken = jwt.sign({
            email: email,
        }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });

        
        return res.json({success:true, accessToken , refreshToken});
    }
}

 const refreshToken=  (req, res) => {
    try {
      const rf_token = req.body.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "Please Login or Register" });

      jwt.verify(rf_token, process.env.JWT_REFRESH_KEY, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please Login or Register" });

        const accesstoken = createAccessToken({ id: user.id });

        res.json({ accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
 }


const createAccessToken = (user) => {
    return jwt.sign(user, process.env.AJWT_ACCESS_KEY, { expiresIn: "1d" });
  };

module.exports = {
    home,
    login,
    refreshToken
}