const { ErrorHandler } = require('../middleware/errors');
const User = require('../models/UserModel');
const Item = require('../models/itemsModel');

const getApprovedItemsList = async (req,res,next) => {
    try {

        const user = req.user;

        if(user.role!='COLLECTOR')
            return next(new ErrorHandler(400,'Access Denied'));

        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;

        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;

        const itemsList = await Item.find({status:'APPROVED'})
                                    .skip(page*limit)
                                    .limit(limit)
                                    .populate('user',{password:0,items:0});

        return res.status(200).json({success:true,itemsList});

    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getApprovedItemsList
}