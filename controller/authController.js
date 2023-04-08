const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const otpGenerator = require('otp-generator');
const mailer = require("../middleware/mailer");
require('dotenv').config();
const User = require("../models/UserModel");
const Otp = require("../models/OtpModel");
const { ErrorHandler } = require('../middleware/errors');
const {validatemail,validatepass} = require('../utils/validation');

const home = async (req,res,next) => {
    const data = {msg:"Samriddhi Prawah!",pid:`${process.pid}`};
    try {
        res.json(data);
    } catch (err) {
        next(err)
    }
}


const createAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_ACCESS_KEY, { expiresIn: "1d" });
};

const refreshToken =  (req, res,next) => {
    try {
        const rf_token = req.body.refreshtoken;
        if (!rf_token)
            return next(new ErrorHandler(400,"Please Login or Register"));

        jwt.verify(rf_token, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) return next(new ErrorHandler(400,"Please Login or Register"));

            const accesstoken = createAccessToken({ id: user.id });

            return res.status(200).json({ accesstoken });
        });
    } catch (err) {
        next(err);
    }
}

const login = async (req, res, next) => {
    try{
        // Destructuring username & password from body
        let { email, password } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne({ email });
        if (!user) 
            return next(new ErrorHandler(404,"User Not Found"));
        if (!user.verify) 
            return next(new ErrorHandler(404,"User Not Found"));
        const result = await bcrypt.compare(password, user.password);
        if (!result) return next(new ErrorHandler(400,"Invalid Credentials"));
        
        const accessToken = createAccessToken({ id: user._id });
        
        const refreshToken = jwt.sign({
            email: email,
        }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });
        return res.status(200).json({success:true, accessToken , refreshToken});
    }catch(err){
        next(err);
    }
}

const email = async (req,res,next) => {
    try {
        const {email} = req.body;

        if(!email)
            return next(new ErrorHandler(400,"Email Required."));
        if(!validatemail(email))
            return next(new ErrorHandler(406,"Incorrect Email format."));

        const oldUser = await User.findOne({
            email:email.toLowerCase()
        });

        if(oldUser&&oldUser.verify==true)
            return next(new ErrorHandler(400,"User by this email already exists."));

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        const result = mailer.sendmail(email,mailedOTP);
        
        const oldotp = await Otp.findOne({email});

        if(oldotp){
            let dateNow = new Date();
            dateNow = dateNow.getTime()/1000;
            let otpDate = new Date(oldotp.updatedAt);
            otpDate = otpDate.getTime()/1000;
            console.log(dateNow,otpDate)
            if(dateNow<otpDate+10)
            return next(new ErrorHandler(400,"Wait for 10 seconds to resend mail."));
        }

        if(oldotp){
            oldotp.otp = mailedOTP;
            await oldotp.save();
        }else{
            Otp.create({
                email:email.toLowerCase(),
                otp : mailedOTP
            });
        }
        return res.status(200).json({success:true,msg:`OTP sent on ${email}`});
    } catch (err) {
        next(err);
    }
}

const everify = async (req,res,next) => {
    try {
        const {email,otp} = req.body;
        if(!email){
            return next(new ErrorHandler(400,"Email Required."));
        }
        if (!otp) {
            return next(new ErrorHandler(400,"Otp Required."));
        }
        const otpdb = await Otp.findOne({
            email:email.toLowerCase()
        });
        if(!otpdb)
            return next(new ErrorHandler(400,"Otp expired."));
        if(otpdb.otp!=otp){
            console.log(otpdb.otp,otp);
            return next(new ErrorHandler(400,"Incorrect Otp"));
        }
        const prev = await User.findOne({
            email:email.toLowerCase()
        })
        let user;
        if(!prev){
            user  = await User.create({
                email:email.toLowerCase()
            });
        }else{
            user = prev;
        }
        
        const token = jwt.sign({_id:user._id},process.env.JWT_TOKEN,{expiresIn:'10m'});
        if(user)
            return res.status(200).json({success:true,msg:'OTP Verified.',token});
        
    } catch (err) {
        next(err);
    }
}


const signup = async (req,res,next)=>{
    try{
        const {
            name,
            student_no,
            year,
            course,
            branch,
            POR,
            password
        } = req.body;

        const user = req.user;
        if(user.verify==true)
            return next(new ErrorHandler(400,"Account already made"));
        if (!(name&&student_no&&year&&branch&&POR&&password)) {
          return next(new ErrorHandler(400,"All input fields are required."));
        }

        if(!validatepass(password)){
          return next(new ErrorHandler(400,"Incorrect Password Format"));
        }
        
        const encryptedPassword = await bcrypt.hash(password, 12);
        
        await User.updateOne({email:user.email},{
            name,
            student_no,
            year,
            course,
            branch,
            POR,
            password:encryptedPassword,
            verify:true
        });

        let madeuser = await User.findById(user._id);
        const accessToken = createAccessToken({ id: user._id });
        
        const refreshToken = jwt.sign({
            email: email,
        }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });
        return res.status(200).json({success:true,msg:`Welcome to Samriddhi Prawah, ${user.name}!`,user:madeuser,refreshToken,accessToken});
        
    } catch (err) {
        next(err);
    }
}


module.exports = {
    home,
    refreshToken,
    login,
    email,
    everify,
    signup
}