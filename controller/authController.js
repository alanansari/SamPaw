const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const otpGenerator = require('otp-generator');
const mailer = require("../utils/mailer");
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
            if (err) return next(new ErrorHandler(401,"Invalid Authentication"));

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
            id: user._id,
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

        mailer.sendmail(email,mailedOTP);
        
        const oldotp = await Otp.findOne({email});

        if(oldotp){
            let dateNow = new Date();
            dateNow = dateNow.getTime()/1000;
            let otpDate = new Date(oldotp.updatedAt);
            otpDate = otpDate.getTime()/1000;
            console.log(dateNow,otpDate)
            if(dateNow<otpDate+10)
                return next(new ErrorHandler(400,"Wait for 10 seconds to resend mail."));
            oldotp.otp = mailedOTP;
            await oldotp.save();
        }else{
            await Otp.create({
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
        if(!otpdb||(otpdb&&otpdb.used))
            return next(new ErrorHandler(400,"Otp expired."));
    
        if(otpdb.otp!=otp){
            console.log(otpdb.otp,otp);
            return next(new ErrorHandler(400,"Incorrect Otp"));
        }
        Otp.updateOne({email:email.toLowerCase},{
            used:true
        });
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
        console.log(user);
        const token = jwt.sign({_id:user._id},process.env.JWT_TOKEN,{expiresIn:'30m'});
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
            gender,
            student_no,
            year,
            course,
            branch,
            POR,
            password,
            phone_no
        } = req.body;

        let user = req.user;
        if(user.verify==true)
            return next(new ErrorHandler(400,"Account already made"));
        if (!(name&&student_no&&year&&branch&&POR&&password&&phone_no&&gender)) {
          return next(new ErrorHandler(400,"All input fields are required."));
        }

        if(!validatepass(password)){
          return next(new ErrorHandler(400,"Incorrect Password Format"));
        }

        if(phone_no.length<10||!(phone_no.match(/^[0-9]+$/))){
            return next(new ErrorHandler(400,"Invalid phone number"));
        }
        
        const encryptedPassword = await bcrypt.hash(password, 12);
        
        user.name = name;
        user.student_no = student_no,
        user.year = year;
        user.course = course;
        user.branch = branch;
        user.POR = POR;
        user.password = encryptedPassword;
        user.phone_no = phone_no;
        user.gender = gender;
        user.verify = true;

        user = await user.save();

        const accessToken = createAccessToken({ id: user._id });
        
        const refreshToken = jwt.sign({
            id: user._id,
        }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' });
        return res.status(200).json({success:true,msg:`Welcome to Samriddhi Prawah, ${name}!`,user,refreshToken,accessToken});
        
    } catch (err) {
        next(err);
    }
}

const getUser = async (req,res,next) => {
    try {
        const user = req.user;
        return res.status(200).json({success:true,user});
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
    signup,
    getUser
}