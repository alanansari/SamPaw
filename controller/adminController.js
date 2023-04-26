require('dotenv').config();
const { ErrorHandler } = require("../middleware/errors");
const Admin = require('../models/adminModel');

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
        }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });
        return res.status(200).json({success:true, accessToken , refreshToken});

    } catch (err) {
        return next(err);
    }
}

const itemlist = async (req,res,next) => {
    try {
        const {status} = req.params || 'ALL';
        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;
        if(page<=0) page = 1;
        if(limit<0) limit = 0;
        if(status!='PENDING'&&status!='APPROVED'&&status!='REJECTED'&&status!='ALL')
            return next(new ErrorHandler(406,'Invalid status value'));
    } catch (err) {
        return next(err);
    }
}


module.exports = {
    login,
    itemlist
}